# شرح آلية العمل بعد التغييرات

هذا الملف يحتوي على شرح آلية عمل النظام بعد تحويله إلى نموذج **Isolated Instance per Tenant with Local Cryptographic Licensing**.

## جدول المحتويات

1. معمارية النظام
2. آلية التثبيت والتشغيل (Installation & Startup)
3. آلية الترخيص والحماية (Licensing & Security)
4. آلية التحقق من الميزات (Feature Validation)
5. Silent Heartbeat (اختياري)
6. تدفق البيانات بين Client و Server

---

## معمارية النظام

**المعمارية المستخدمة:**
- Isolated Instance per Tenant / Database per Tenant
- كل عميل = نسخة كود معزولة + قاعدة بيانات مستقلة
- الترخيص محلي بالكامل (Local Cryptographic Licensing)
- يعمل بدون إنترنت (Offline-First)

**المزايا:**
- عزل كامل للبيانات والأداء
- عمل بدون إنترنت
- أمان عالي عبر التشفير
- سهولة النشر والصيانة

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

## آلية الترخيص والحماية (Licensing & Security)

### مبدأ الترخيص المحلي المشفر

**الهدف:** نظام ترخيص يعمل بدون إنترنت، يعتمد على Hardware-ID وتشفير صارم.

**المبدأ:**
- عند تثبيت النسخة، يقرأ النظام معرّفات الجهاز الثابتة (Hardware-ID / MAC Address)
- يتم دمج هذا المعرّف مع تاريخ انتهاء الاشتراك
- يتم تشفيرهما لتوليد مفتاح ترخيص (License Key) موضع في ملف license.json
- السيرفر المركزي يقوم فقط بـ Silent Heartbeat عند توفر الإنترنت
- Kill Switch يعمل محلياً بناءً على فك تشفير المفتاح وقراءة عتاد الجهاز

---

### 1. توليد مفتاح الترخيص (License Key Generation)

**أداة CLI لتوليد المفاتيح:**
```typescript
// tools/generate-license-key.ts
import crypto from 'crypto';

interface LicenseData {
  hardwareId: string;
  expiryDate: number;
  features: string[];
}

export function generateLicenseKey(data: LicenseData, privateKey: string): string {
  const payload = JSON.stringify({
    hid: data.hardwareId,
    exp: data.expiryDate,
    feat: data.features
  });
  
  const signature = crypto.sign(
    'SHA256',
    Buffer.from(payload),
    privateKey
  );
  
  return Buffer.from(JSON.stringify({
    payload,
    signature: signature.toString('base64')
  })).toString('base64');
}
```

### 2. التحقق المحلي من الترخيص (Local License Validation)

**عند بدء السيرفر:**
```typescript
// server/_core/license.ts
import crypto from 'crypto';

interface LicenseInfo {
  hardwareId: string;
  expiryDate: number;
  features: string[];
}

export async function validateLicense(): Promise<LicenseInfo | null> {
  try {
    // قراءة ملف license.json
    const licensePath = path.join(process.cwd(), 'license.json');
    const licenseData = JSON.parse(fs.readFileSync(licensePath, 'utf-8'));
    
    // فك تشفير المفتاح
    const decoded = JSON.parse(Buffer.from(licenseData.key, 'base64').toString());
    const payload = JSON.parse(decoded.payload);
    const signature = Buffer.from(decoded.signature, 'base64');
    
    // التحقق من التوقيع
    const isValid = crypto.verify(
      'SHA256',
      Buffer.from(payload),
      publicKey,
      signature
    );
    
    if (!isValid) {
      throw new Error('Invalid license signature');
    }
    
    // التحقق من Hardware-ID
    const currentHardwareId = await getHardwareId();
    if (payload.hid !== currentHardwareId) {
      throw new Error('Hardware ID mismatch');
    }
    
    // التحقق من تاريخ الانتهاء
    if (payload.exp < Date.now()) {
      throw new Error('License expired');
    }
    
    return {
      hardwareId: payload.hid,
      expiryDate: payload.exp,
      features: payload.feat
    };
  } catch (error) {
    console.error('License validation failed:', error);
    return null;
  }
}

export async function getHardwareId(): Promise<string> {
  // قراءة MAC Address أو معرّفات الجهاز الأخرى
  const networkInterfaces = require('os').networkInterfaces();
  const macAddress = Object.values(networkInterfaces)[0][0].mac;
  return macAddress.replace(/:/g, '').toUpperCase();
}
```

### 3. التحقق عند بدء التطبيق (Client-side)

**الخطوة 1: تحميل license.json**
```typescript
// client/src/const.ts
export const loadLicense = async () => {
  try {
    const response = await fetch('/api/license/info');
    const license = await response.json();
    return license;
  } catch (error) {
    console.error('Failed to load license:', error);
    return null;
  }
};
```

**الخطوة 2: التحقق من الترخيص**
```typescript
export const validateLicense = async (license: any) => {
  if (!license) return false;
  
  // التحقق من تاريخ الانتهاء
  if (license.expiryDate < Date.now()) return false;
  
  // التحقق من حالة الترخيص
  if (!license.isValid) return false;
  
  return true;
};
```

**الخطوة 3: تهيئة التطبيق**
```typescript
// client/src/main.tsx
const initializeApp = async () => {
  const license = await loadLicense();
  
  // التحقق المحلي فقط (لا يعتمد على الإنترنت)
  if (!await validateLicense(license)) {
    window.location.href = '/license-error';
    return false;
  }
  
  // تحميل الميزات المفعلة
  window.__APP_CONFIG__ = { 
    license, 
    features: license.features 
  };
  
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
