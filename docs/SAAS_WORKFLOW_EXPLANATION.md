# شرح آلية العمل بعد التغييرات

هذا الملف سيحتوي على شرح آلية عمل النظام بعد تحويله إلى نموذج Self-Hosted SaaS.

## جدول المحتويات

1. آلية التثبيت والتشغيل (Installation & Startup)
2. آلية التحقق من الترخيص
3. آلية التحقق من الميزات
4. تدفق البيانات بين Client و Server

---

## آلية التثبيت والتشغيل (Installation & Startup)

### 1. إعداد قاعدة البيانات

**الخطوة 1: إنشاء قاعدة بيانات فارغة**
```sql
-- العميل ينشئ قاعدة بيانات فارغة على استضافته
CREATE DATABASE sgh_crm;
```

**الخطوة 2: إعداد ملف .env**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sgh_crm
DB_USER=root
DB_PASSWORD=password

# License Configuration
LICENSE_SERVER_URL=https://license-server.example.com
```

**الخطوة 3: تشغيل السيرفر لأول مرة**
```bash
npm run dev
```

### 2. Auto-Migrations on Startup

**عند بدء السيرفر لأول مرة:**
```typescript
// server/_core/index.ts
async function runAutoMigrations() {
  try {
    console.log('Checking database schema...');
    const db = await getDb();
    
    // تشغيل الهجرة تلقائياً
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    if (error.message.includes('No migrations to run')) {
      console.log('Database is up to date');
    } else {
      throw error;
    }
  }
}

async function startServer() {
  // تشغيل الهجرة قبل بدء السيرفر
  await runAutoMigrations();
  
  const app = express();
  // ... باقي كود بدء السيرفر
}
```

**النتيجة:**
- يتم إنشاء جميع الجداول تلقائياً
- يتم إنشاء جميع العلاقات تلقائياً
- يتم إنشاء جميع Indexes تلقائياً
- لا حاجة لأي تدخل يدوي من العميل

### 3. قراءة بيانات الاتصال من .env

**ملف server/db.ts:**
```typescript
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../drizzle/schema';

let db: any = null;

export async function getDb() {
  if (db) return db;
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sgh_crm',
  });
  
  db = drizzle(connection, { schema });
  return db;
}
```

---

## آلية التحقق من الترخيص

### 1. عند بدء التطبيق (Client-side)

**الخطوة 1: تحميل config.json**
```typescript
// client/src/const.ts
export const loadConfig = async () => {
  const response = await fetch('/config.json');
  const config = await response.json();
  return config;
};
```

**الخطوة 2: تحميل license.json**
```typescript
export const loadLicense = async () => {
  const response = await fetch('/license.json');
  const license = await response.json();
  return license;
};
```

**الخطوة 3: التحقق من الترخيص**
```typescript
export const validateLicense = async (license: any) => {
  const config = await loadConfig();
  
  // التحقق من التوقيع الرقمي
  const isValidSignature = verifySignature(license.key, license.signature, config.publicKey);
  if (!isValidSignature) return false;
  
  // التحقق من تاريخ الانتهاء
  if (license.expiryDate < Date.now()) return false;
  
  // التحقق من Hardware ID
  const hardwareId = await generateHardwareId();
  if (license.hardwareId !== hardwareId) return false;
  
  return true;
};
```

**الخطوة 4: التحقق من السيرفر المركزي (اختياري)**
```typescript
export const validateWithCentralServer = async (license: any) => {
  const config = await loadConfig();
  try {
    const response = await fetch(`${config.licenseServerUrl}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: license.key, signature: license.signature })
    });
    const result = await response.json();
    return result.valid;
  } catch (error) {
    // Grace Period: السماح بالعمل لمدة 7 أيام بدون اتصال
    const daysSinceValidation = (Date.now() - license.lastValidation) / (1000 * 60 * 60 * 24);
    return daysSinceValidation <= 7;
  }
};
```

**الخطوة 5: تهيئة التطبيق**
```typescript
// client/src/main.tsx
const initializeApp = async () => {
  const config = await loadConfig();
  const license = await loadLicense();
  
  // التحقق المحلي
  if (!await validateLicense(license)) {
    window.location.href = '/license-error';
    return false;
  }
  
  // التحقق من السيرفر المركزي (مع Grace Period)
  if (!await validateWithCentralServer(license)) {
    window.location.href = '/license-error';
    return false;
  }
  
  // تحميل الميزات المفعلة
  window.__APP_CONFIG__ = { config, license, features: license.features };
  
  return true;
};
```

### 2. في Server-side

**Middleware للتحقق من الترخيص**
```typescript
// server/middleware/license.ts
export async function validateLicenseMiddleware(req: any, res: any, next: any) {
  try {
    const license = await loadLicense();
    const now = Date.now();
    
    // Grace Period: 7 أيام بدون اتصال
    if (license.lastValidation) {
      const daysSinceValidation = (now - license.lastValidation) / (1000 * 60 * 60 * 24);
      if (daysSinceValidation > 7) {
        const valid = await validateLicenseWithServer(license);
        if (!valid) {
          return res.status(403).json({ error: 'License expired or invalid' });
        }
        // تحديث lastValidation
        license.lastValidation = now;
        await saveLicense(license);
      }
    }
    
    next();
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({ error: 'License validation failed' });
  }
}
```

### 3. التحقق الدوري

**التحقق كل ساعة**
```typescript
// client/src/hooks/useLicense.ts
useEffect(() => {
  const checkLicense = async () => {
    const license = await loadLicense();
    const valid = await validateLicense(license);
    if (!valid) {
      window.location.href = '/license-error';
    }
  };
  
  checkLicense();
  const interval = setInterval(checkLicense, 3600000); // كل ساعة
  return () => clearInterval(interval);
}, []);
```

---

## آلية التحقق من الميزات

### 1. Client-side Feature Flags

**Hook للتحقق من الميزات**
```typescript
// client/src/hooks/useFeature.ts
export const useFeature = () => {
  const features = window.__APP_CONFIG__?.features || [];
  
  const hasFeature = (feature: string) => {
    // الخدمات الثابتة دائماً متاحة
    const fixedFeatures = ['home', 'doctors', 'offers', 'camps'];
    if (fixedFeatures.includes(feature)) return true;
    
    // التحقق من الميزة في الترخيص
    return features.includes(feature);
  };
  
  const getEnabledFeatures = () => features;
  
  return { hasFeature, getEnabledFeatures };
};
```

**الاستخدام في الصفحات**
```typescript
// client/src/pages/WhatsAppPage.tsx
const WhatsAppPage = () => {
  const { hasFeature } = useFeature();
  
  if (!hasFeature('whatsapp')) {
    return <UnauthorizedFeature feature="WhatsApp" />;
  }
  
  // باقي كود الصفحة
};
```

### 2. Server-side Feature Middleware

**Feature Procedure**
```typescript
// server/routers.ts
const featureProcedure = (feature: string) => 
  protectedProcedure.use(async ({ ctx, next }) => {
    const license = await loadLicense();
    const features = license?.features || [];
    if (!features.includes(feature)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Feature ${feature} is not enabled`,
      });
    }
    return next();
  });
```

### 3. التحقق في الخدمات

```typescript
// server/services/whatsappService.ts
export const whatsappService = {
  async sendMessage(message: any) {
    const license = await loadLicense();
    const features = license?.features || [];
    if (!features.includes('whatsapp')) {
      throw new Error('WhatsApp feature is not enabled');
    }
    
    // باقي كود الخدمة - بدون tenantId
  },
};
```

## تدفق البيانات بين Client و Server

### 1. تدفق طلب البيانات

**الخطوة 1: المستخدم يفتح الصفحة**
```
المستخدم → Client (React) → التحقق من الميزة → تحميل الصفحة
```

**الخطوة 2: طلب البيانات من Server**
```
Client → tRPC Request → Server Middleware → Feature Check → Database Query
```

**الكود:**
```typescript
// Client-side
const { data } = trpc.whatsapp.getConversations.useQuery();

// Server-side - بدون tenantId
export const whatsappRouter = router({
  getConversations: featureProcedure('whatsapp')
    .query(async ({ ctx }) => {
      // مباشرة بدون tenantId
      return getConversations();
    }),
});
```

### 2. تدفق طلب إنشاء البيانات

**الخطوة 1: المستخدم يرسل نموذج**
```                 
المستخدم → Client Form → التحقق من الميزة → tRPC Mutation
```

**الخطوة 2: Server يعالج الطلب**
```
tRPC Mutation → Server Middleware → Feature Check → Database Insert
```

**الكود:**
```typescript
// Client-side
const createLead = trpc.leads.create.useMutation();

// Server-side - بدون tenantId
export const leadsRouter = router({
  create: featureProcedure('bookings')
    .input(z.object({ name: z.string(), phone: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // مباشرة بدون tenantId
      return createLead(input);
    }),
});
```

### 3. تدفق طلب التحديث

**الخطوة 1: المستخدم يعدل البيانات**
```
المستخدم → Client Edit Form → التحقق من الميزة → tRPC Mutation
```

**الخطوة 2: Server يعالج التحديث**
```
tRPC Mutation → Server Middleware → Feature Check → Database Update
```

**الكود:**
```typescript
// Server-side - بدون tenantId
export const leadsRouter = router({
  update: featureProcedure('bookings')
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // مباشرة بدون tenantId
      return updateLead(input.id, input);
    }),
});
```

### 4. تدفق طلب الحذف

**الخطوة 1: المستخدم يحذف البيانات**
```
المستخدم → Client Delete Button → التحقق من الميزة → tRPC Mutation
```

**الخطوة 2: Server يعالج الحذف**
```
tRPC Mutation → Server Middleware → Feature Check → Database Delete
```

**الكود:**
```typescript
// Server-side - بدون tenantId
export const leadsRouter = router({
  delete: featureProcedure('bookings')
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // مباشرة بدون tenantId
      return deleteLead(input.id);
    }),
});
```
