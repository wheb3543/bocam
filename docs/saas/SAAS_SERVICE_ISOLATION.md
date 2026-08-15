# شرح فصل وربط الخدمات

هذا الملف يحتوي على شرح كيفية فصل الخدمات المتغيرة لضمان عدم تأثيرها على الخدمات الأخرى في معمارية **Isolated Instance per Tenant**.

## جدول المحتويات

1. استراتيجية الفصل
2. مستويات العزل في معمارية Isolated Instance
3. فصل الخدمات في Client-side
4. فصل الخدمات في Server-side
5. فصل البيانات الثابتة
6. اختبار العزل

---

## استراتيجية الفصل

### 1. مبدأ الفصل

**الهدف:** ضمان أن تعطيل خدمة متغيرة لا يؤثر على عمل الخدمات الأخرى.

**المبادئ:**
- **Instance-Level Isolation:** كل عميل له نسخة معزولة تماماً
- **Feature Flags:** استخدام Feature Flags للتحكم في عرض/إخفاء الخدمات
- **Lazy Loading:** تحميل الصفحات والمكونات فقط عند الحاجة
- **Graceful Degradation:** التعامل مع الأخطاء بشكل أنيق
- **Dependency Injection:** حقن التوابيات لتسهيل الاختبار والفصل
- **Middleware Layer:** استخدام Middleware للتحقق من الميزات قبل تنفيذ العمليات
- **Environment-Based Configuration:** جميع البيانات الثابتة في .env

---

## مستويات العزل في معمارية Isolated Instance

### المستوى 1: Instance-Level Isolation (العزل على مستوى النسخة)

**أعلى مستوى من العزل:**
- كل عميل له نسخة كود معزولة تماماً
- قاعدة بيانات مستقلة لكل عميل
- استضافة منفصلة لكل عميل
- ملفات .env خاصة بكل عميل
- ملف license.json خاص بكل عميل

**المزايا:**
- عزل كامل للبيانات والأداء
- أمان عالي
- عدم التأثير بين العملاء

### المستوى 2: Feature-Level Isolation (العزل على مستوى الميزات)

**داخل النسخة الواحدة:**
- Feature Flags للتحكم في الميزات
- Lazy Loading للصفحات المتغيرة
- Middleware للتحقق من الميزات
- Graceful Degradation

### المستوى 3: Data-Level Isolation (العزل على مستوى البيانات)

**داخل قاعدة البيانات الواحدة:**
- لا يوجد tenantId (Single-Tenant Architecture)
- جميع البيانات في قاعدة بيانات محلية واحدة
- عزل البيانات يتم فقط على مستوى النسخة

### المستوى 4: Service-Level Isolation (العزل على مستوى الخدمات)

**داخل الكود:**
- فصل منطق كل خدمة
- عدم الاعتماد على خدمات أخرى
- استخدام Events للتواصل بين الخدمات

### 2. مستويات الفصل

**المستوى 1: UI Layer (Client-side)**
- إخفاء الروابط والأزرار للخدمات غير المفعلة
- عرض رسائل واضحة عند محاولة الوصول لخدمة غير مفعلة
- استخدام Lazy Loading للصفحات المتغيرة

**المستوى 2: API Layer (Server-side)**
- التحقق من الميزات في Middleware
- رفض الطلبات للخدمات غير المفعلة
- إرجاع رسائل خطأ واضحة

**المستوى 3: Data Layer (Database)**
- لا يوجد عزل tenantId (Single-Tenant Architecture)
- جميع البيانات في قاعدة بيانات محلية واحدة
- عزل البيانات يتم فقط على مستوى الميزات

**المستوى 4: Service Layer (Business Logic)**
- فصل منطق كل خدمة
- عدم الاعتماد على خدمات أخرى
- استخدام Events للتواصل بين الخدمات

---

## فصل الخدمات في Client-side

### 1. فصل الصفحات (Page Isolation)

**استخدام Lazy Loading:**
```typescript
// client/src/App.tsx
import { lazy, Suspense } from 'react';

// الصفحات الثابتة - تحميل فوري
const Home = lazy(() => import("./pages/Home"));
const Doctors = lazy(() => import("./pages/Doctors"));

// الصفحات المتغيرة - تحميل عند الحاجة مع التحقق من الميزة
const WhatsAppPage = lazy(() => import("./pages/WhatsAppPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));

// مكون التحقق من الميزة
const FeatureProtectedRoute = ({ component: Component, feature, ...props }) => {
  const { hasFeature } = useFeature();
  
  if (!hasFeature(feature)) {
    return <UnauthorizedFeature feature={feature} />;
  }
  
  return <Component {...props} />;
};

// الاستخدام في التوجيه
<Route path="/whatsapp" component={() => (
  <FeatureProtectedRoute component={WhatsAppPage} feature="whatsapp" />
)} />
```

### 2. فصل المكونات (Component Isolation)

**استخدام Feature Flags:**
```typescript
// client/src/components/layout/DashboardSidebar.tsx
import { useFeature } from '@/hooks/useFeature';

export const DashboardSidebar = () => {
  const { hasFeature } = useFeature();
  
  return (
    <nav>
      {/* الروابط الثابتة */}
      <Link to="/">الرئيسية</Link>
      <Link to="/doctors">الأطباء</Link>
      <Link to="/offers">العروض</Link>
      
      {/* الروابط المتغيرة */}
      {hasFeature('whatsapp') && (
        <Link to="/whatsapp">WhatsApp</Link>
      )}
      
      {hasFeature('reports') && (
        <Link to="/reports">التقارير</Link>
      )}
      
      {hasFeature('patient_portal') && (
        <Link to="/patient-portal">بوابة المرضى</Link>
      )}
    </nav>
  );
};
```

### 3. فصل الخطافات (Hook Isolation)

**إنشاء Hooks منفصلة لكل خدمة:**
```typescript
// client/src/hooks/useWhatsApp.ts
import { useFeature } from './useFeature';

export const useWhatsApp = () => {
  const { hasFeature } = useFeature();
  
  if (!hasFeature('whatsapp')) {
    throw new Error('WhatsApp feature is not enabled');
  }
  
  // منطق WhatsApp
  const { data } = trpc.whatsapp.getConversations.useQuery();
  return data;
};

// client/src/hooks/useReports.ts
export const useReports = () => {
  const { hasFeature } = useFeature();
  
  if (!hasFeature('reports')) {
    throw new Error('Reports feature is not enabled');
  }
  
  // منطق التقارير
  const { data } = trpc.reports.getStats.useQuery();
  return data;
};
```

### 4. معالجة الأخطاء (Error Handling)

**مكون UnauthorizedFeature:**
```typescript
// client/src/components/UnauthorizedFeature.tsx
export const UnauthorizedFeature = ({ feature }: { feature: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          الميزة غير مفعلة
        </h2>
        <p className="text-gray-600 mb-4">
          ميزة {feature} غير مفعلة في الترخيص الحالي.
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          تواصل مع الدعم
        </button>
      </div>
    </div>
  </div>
);
```

---

## فصل الخدمات في Server-side

### 1. فصل Routers (Router Isolation)

**استخدام Feature Middleware:**
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

// تطبيق على Routers المتغيرة - بدون tenantId
export const whatsappRouter = router({
  getConversations: featureProcedure('whatsapp')
    .query(async ({ ctx }) => {
      return getConversations();
    }),
  
  sendMessage: featureProcedure('whatsapp')
    .mutation(async ({ ctx, input }) => {
      return sendMessage(input);
    }),
});

export const reportsRouter = router({
  getStats: featureProcedure('reports')
    .query(async ({ ctx }) => {
      return getReportStats();
    }),
});
```

### 2. فصل الخدمات (Service Isolation)

**التحقق من الميزات في الخدمات:**
```typescript
// server/services/whatsappService.ts
export const whatsappService = {
  async sendMessage(message: any) {
    const license = await loadLicense();
    const features = license?.features || [];
    if (!features.includes('whatsapp')) {
      throw new Error('WhatsApp feature is not enabled');
    }
    
    // منطق إرسال الرسالة - بدون tenantId
    const config = await getWhatsAppConfig();
    await sendToWhatsAppAPI(message, config);
  },
  
  async getConversations() {
    const license = await loadLicense();
    const features = license?.features || [];
    if (!features.includes('whatsapp')) {
      throw new Error('WhatsApp feature is not enabled');
    }
    
    // منطق جلب المحادثات - بدون tenantId
    return getConversationsFromDB();
  },
};
```

### 3. فصل Cron Jobs (Cron Job Isolation)

**تشغيل Cron Jobs فقط للميزات المفعلة:**
```typescript
// server/cron/appointmentReminders.ts
export async function initAppointmentRemindersScheduler() {
  const license = await loadLicense();
  const features = license?.features || [];
  
  // تشغيل فقط إذا كانت ميزة WhatsApp مفعلة
  if (features.includes('whatsapp')) {
    scheduleAppointmentReminders();
  }
}

async function scheduleAppointmentReminders() {
  try {
    const appointments = await getAppointmentsForReminders();
    appointments.forEach(appointment => {
      sendWhatsAppReminder(appointment);
    });
  } catch (error) {
    console.error('Error scheduling reminders:', error);
  }
}
```

### 4. فصل Webhooks (Webhook Isolation)

**التحقق من الميزات قبل معالجة Webhooks:**
```typescript
// server/webhookRoutes.ts
app.post('/api/webhooks/whatsapp', async (req, res) => {
  try {
    // التحقق من أن ميزة WhatsApp مفعلة
    const license = await loadLicense();
    const features = license?.features || [];
    if (!features.includes('whatsapp')) {
      return res.status(403).json({ error: 'WhatsApp feature not enabled' });
    }
    
    // معالجة Webhook - بدون tenantId
    await handleWhatsAppWebhook(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## فصل الخدمات في قاعدة البيانات

### 1. عزل البيانات (Data Isolation)

**ملاحظة هامة:** لا يوجد عزل tenantId في معمارية Single-Tenant. جميع البيانات في قاعدة بيانات محلية واحدة.

**الهيكل بدون tenantId:**
```typescript
// drizzle/schema.ts
export const leads = mysqlTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  // ... باقي الحقول - بدون tenantId
});

export const whatsappConversations = mysqlTable('whatsappConversations', {
  id: serial('id').primaryKey(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  // ... باقي الحقول - بدون tenantId
});
```

### 2. عزل الاستعلامات (Query Isolation)

**الاستعلامات بدون tenantId:**
```typescript
// server/db.ts
export async function getLeads() {
  const db = await getDb();
  return db.select().from(leads);
}

export async function getWhatsAppConversations() {
  const db = await getDb();
  return db.select().from(whatsappConversations);
}
```

### 3. عزل المعاملات (Transaction Isolation)

**استخدام Transactions لضمان الاتساق - بدون tenantId:**
```typescript
// server/db.ts
export async function createLeadWithWhatsApp(data: any) {
  const db = await getDb();
  
  try {
    return await db.transaction(async (tx) => {
      // إنشاء Lead - بدون tenantId
      const lead = await tx.insert(leads).values(data).returning();
      
      // إذا كانت ميزة WhatsApp مفعلة، إنشاء محادثة
      const license = await loadLicense();
      const features = license?.features || [];
      if (features.includes('whatsapp')) {
        await tx.insert(whatsappConversations).values({
          phoneNumber: data.phone,
          leadId: lead[0].id,
        });
      }
      
      return lead[0];
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}
```

### 4. عزل التخزين (Storage Isolation)

**مسارات الملفات بدون tenantId:**
```typescript
// server/storage.ts
export async function uploadFile(file: File) {
  const fileName = `${Date.now()}-${file.name}`;
  const path = `uploads/${fileName}`;
  
  // حفظ الملف
  await fs.writeFile(path, file);
  
  return path;
}

export async function getFileUrl(path: string) {
  // لا يوجد تحقق من tenantId
  return `/uploads/${path}`;
}
```

---

## اختبار العزل

### 1. اختبار Client-side

**اختبار Feature Flags - بدون TenantContext:**
```typescript
// client/src/components/__tests__/DashboardSidebar.test.tsx
import { render, screen } from '@testing-library/react';
import { DashboardSidebar } from '../DashboardSidebar';

describe('DashboardSidebar', () => {
  it('should show WhatsApp link when feature is enabled', () => {
    // محاكاة ميزات الترخيص
    window.__APP_CONFIG__ = { features: ['whatsapp'] };
    
    render(<DashboardSidebar />);
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });
  
  it('should not show WhatsApp link when feature is disabled', () => {
    // محاكاة ميزات الترخيص
    window.__APP_CONFIG__ = { features: [] };
    
    render(<DashboardSidebar />);
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument();
  });
});
```

### 2. اختبار Server-side

**اختبار Feature Middleware - بدون tenantId:**
```typescript
// server/routers/__tests__/whatsapp.test.ts
import { trpc } from '../testClient';

describe('WhatsApp Router', () => {
  it('should allow access when feature is enabled', async () => {
    // محاكاة ميزات الترخيص
    mockLicense.features = ['whatsapp'];
    
    const result = await trpc.whatsapp.getConversations.query();
    expect(result).toBeDefined();
  });
  
  it('should deny access when feature is disabled', async () => {
    // محاكاة ميزات الترخيص
    mockLicense.features = [];
    
    await expect(
      trpc.whatsapp.getConversations.query()
    ).rejects.toThrow('Feature whatsapp is not enabled');
  });
});
```

### 3. اختبار عزل البيانات

**ملاحظة:** لا يوجد اختبار عزل tenantId في معمارية Single-Tenant.

**اختبار الوصول للبيانات:**
```typescript
// server/db/__tests__/leads.test.ts
import { getLeads, createLead } from '../leads';

describe('Leads', () => {
  it('should return all leads', async () => {
    // إنشاء Leads
    await createLead({ name: 'Lead 1', phone: '123' });
    await createLead({ name: 'Lead 2', phone: '456' });
    
    // جلب جميع Leads
    const allLeads = await getLeads();
    expect(allLeads).toHaveLength(2);
  });
});
```

### 4. اختبار Graceful Degradation

**اختبار التعامل مع أخطاء الخدمات - بدون TenantContext:**
```typescript
// client/src/components/__tests__/WhatsAppPage.test.tsx
import { render, screen } from '@testing-library/react';
import { WhatsAppPage } from '../WhatsAppPage';

describe('WhatsAppPage', () => {
  it('should show error message when feature is disabled', () => {
    // محاكاة ميزات الترخيص
    window.__APP_CONFIG__ = { features: [] };
    
    render(<WhatsAppPage />);
    expect(screen.getByText(/الميزة غير مفعلة/)).toBeInTheDocument();
  });
});
```

### 5. اختبار الأداء

**اختبار تأثير تعطيل خدمة على الأداء - بدون tenantId:**
```typescript
// server/__tests__/performance.test.ts
describe('Service Isolation Performance', () => {
  it('should not affect performance when WhatsApp is disabled', async () => {
    const start = Date.now();
    
    // طلب صفحة بدون WhatsApp
    await trpc.home.getData.query();
    const timeWithoutWhatsApp = Date.now() - start;
    
    // تعطيل WhatsApp
    mockLicense.features = [];
    
    const start2 = Date.now();
    await trpc.home.getData.query();
    const timeWithWhatsAppDisabled = Date.now() - start2;
    
    // يجب أن يكون الأداء مشابه
    expect(timeWithWhatsAppDisabled).toBeLessThan(timeWithoutWhatsApp * 1.1);
  });
});
```
