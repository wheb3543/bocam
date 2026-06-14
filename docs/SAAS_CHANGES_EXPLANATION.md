# شرح التغييرات المطلوبة لنموذج Isolated Instance per Tenant

هذا الملف يحتوي على شرح التغييرات المطلوبة في المشروع لتحويله إلى نموذج **Isolated Instance per Tenant with Local Cryptographic Licensing**.

## جدول المحتويات

1. معمارية النظام
2. التغييرات في قاعدة البيانات
3. التغييرات في Client Frontend
4. التغييرات في Server Backend
5. قائمة الملفات المحددة للتعديل

---

## معمارية النظام

### المعمارية المستهدفة: Isolated Instance per Tenant

**المبدأ الأساسي:**
- كل مستشفى أو عميل يحصل على نسخة كود معزولة تماماً
- قاعدة بيانات محلية (Standalone/Localized) على استضافة العميل
- لا توجد قاعدة بيانات مركزية (No Centralized DB)
- كل نسخة تعمل على قاعدة بيانات منفصلة تماماً
- الجداول نظيفة ومجردة (White-Label Core) بدون tenantId
- الهوية تتحدد عبر ملفات .env والإعدادات المحلية

**ملاحظة هامة:** 
- المشروع الحالي لا يحتوي على tenantId في الجداول - هذا صحيح ومقصود
- لا نحتاج لإزالة أي جداول أو حقول tenantId لأننا لم نكن نستخدم multi-tenant architecture
- التغييرات المطلوبة هي إضافة نظام الترخيص المحلي وفصل البيانات الثابتة

---

## التغييرات في قاعدة البيانات

### 1. التأكد من عدم وجود tenantId

**الوضع الحالي:**
- المشروع لا يحتوي على tenantId في الجداول ✅
- لا توجد جداول multi-tenant ✅
- الجداول نظيفة ومجردة (White-Label Core) ✅

**لا تغيير مطلوب في هذا الجزء** - المشروع مصمم بشكل صحيح للمعمارية الجديدة.

### 2. Auto-Migrations on Startup

### 3. Auto-Migrations on Startup

**إضافة سكريبت التثبيت التلقائي في server/_core/index.ts:**

```typescript
// server/_core/index.ts
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { getDb } from '../db';

async function runAutoMigrations() {
  try {
    console.log('Checking database schema...');
    const db = await getDb();
    
    // تشغيل الهجرة تلقائياً
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    // إذا كانت قاعدة البيانات فارغة، هذا طبيعي في أول تشغيل
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

### 4. قراءة بيانات الاتصال من .env

**ملف .env.example:**
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

**ملف drizzle.config.ts:**
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sgh_crm',
  },
});
```

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

### 5. تبسيط دوال قاعدة البيانات

**قبل (مع tenantId):**
```typescript
export async function getLeads(tenantId: string) {
  const db = await getDb();
  return db.select()
    .from(leads)
    .where(eq(leads.tenantId, tenantId));
}

export async function createLead(data: any, tenantId: string) {
  const db = await getDb();
  await db.insert(leads).values({
    ...data,
    tenantId,
  });
}
```

**بعد (بدون tenantId):**
```typescript
export async function getLeads() {
  const db = await getDb();
  return db.select().from(leads);
}

export async function createLead(data: any) {
  const db = await getDb();
  await db.insert(leads).values(data);
}
```

## التغييرات في Client Frontend

### الجزء 1: نقاط الدخول (App.tsx, main.tsx, const.ts)

#### الملف: `client/src/const.ts`
**الحالة الحالية:**
- `APP_TITLE` و `APP_LOGO` تأتي من environment variables (`import.meta.env.VITE_APP_TITLE`, `import.meta.env.VITE_APP_LOGO`)
- `getLoginUrl()` تستخدم environment variables للـ OAuth

**التغييرات المطلوبة:**
1. جعل `APP_TITLE` و `APP_LOGO` ديناميكية من `config.json` بدلاً من environment variables
2. إضافة دالة لقراءة `config.json` عند بدء التطبيق
3. إضافة دالة للتحقق من وجود `license.json` وقراءته
4. إضافة دالة للاتصال بسيرفر الترخيص المركزي للتحقق من صحة الترخيص

**الكود المقترح:**
```typescript
// قراءة config.json
export const loadConfig = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Failed to load config:', error);
    return null;
  }
};

// قراءة license.json
export const loadLicense = async () => {
  try {
    const response = await fetch('/license.json');
    const license = await response.json();
    return license;
  } catch (error) {
    console.error('Failed to load license:', error);
    return null;
  }
};

// التحقق من الترخيص
export const validateLicense = async (license: any) => {
  try {
    const config = await loadConfig();
    const response = await fetch(`${config.licenseServerUrl}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: license.key, signature: license.signature })
    });
    const result = await response.json();
    return result.valid;
  } catch (error) {
    console.error('License validation failed:', error);
    return false;
  }
};
```

#### الملف: `client/src/main.tsx`
**الحالة الحالية:**
- نقطة الدخول للـ React app
- يهيئ tRPC client و React Query
- يعالج أخطاء التحقق من الصلاحية (unauthorized errors)

**التغييرات المطلوبة:**
1. إضافة التحقق من الترخيص قبل تحميل التطبيق
2. إضافة التحقق من الميزات المفعلة
3. إضافة middleware للتحقق من الميزات في كل طلب tRPC
4. إضافة معالجة أخطاء الترخيص (license expired, invalid, etc.)

**الكود المقترح:**
```typescript
// في بداية الملف
const initializeApp = async () => {
  const config = await loadConfig();
  const license = await loadLicense();
  
  if (!license || !await validateLicense(license)) {
    // عرض شاشة خطأ الترخيص
    window.location.href = '/license-error';
    return false;
  }
  
  // تحميل الميزات المفعلة
  const features = license.features || [];
  window.__APP_CONFIG__ = { config, license, features };
  
  return true;
};

// قبل render
initializeApp().then(isValid => {
  if (isValid) {
    createRoot(document.getElementById("root")!).render(
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </trpc.Provider>
    );
  }
});
```

#### الملف: `client/src/App.tsx`
**الحالة الحالية:**
- يحتوي على جميع الصفحات (72 صفحة)
- يستخدم lazy loading للأداء
- يحدد التوجيه باستخدام wouter

**التغييرات المطلوبة:**
1. إضافة feature flags لكل صفحة/خدمة
2. إضافة التحقق من الميزات قبل تحميل الصفحة
3. إضافة middleware للتحقق من الميزات في التوجيه
4. تصنيف الصفحات حسب الخدمات

**الكود المقترح:**
```typescript
// تعريف الميزات
const FEATURE_FLAGS = {
  // الصفحات العامة (ثابتة)
  home: 'fixed',
  doctors: 'fixed',
  offers: 'fixed',
  camps: 'fixed',
  
  // صفحات WhatsApp (متغيرة)
  whatsapp: 'whatsapp',
  whatsappTemplates: 'whatsapp',
  whatsappAnalytics: 'whatsapp',
  
  // صفحات التقارير (متغيرة)
  reports: 'reports',
  analytics: 'reports',
  bi: 'reports',
  
  // صفحات إدارة المرضى (متغيرة)
  patientPortal: 'patient_portal',
  
  // صفحات إدارة الفرق (متغيرة)
  teams: 'team_management',
  
  // صفحات الحملات (متغيرة)
  campaigns: 'campaigns',
};

// دالة للتحقق من الميزة
const checkFeature = (feature: string) => {
  const features = window.__APP_CONFIG__?.features || [];
  return features.includes(feature);
};

// استخدام في التوجيه
<Route path="/admin/whatsapp">
  {checkFeature('whatsapp') ? (
    <DashboardShell>
      <WhatsAppPage />
    </DashboardShell>
  ) : (
    <UnauthorizedFeature feature="WhatsApp" />
  )}
</Route>
```

### الجزء 2: الصفحات (Pages)

#### تصنيف الصفحات حسب الخدمات

**1. الصفحات العامة (ثابتة - دائماً مفعلة):**
- `HomePage.tsx` - الصفحة الرئيسية
- `Doctors.tsx` - قائمة الأطباء
- `DoctorDetailPage.tsx` - تفاصيل الطبيب
- `VisitingDoctors.tsx` - الأطباء الزائرون
- `OffersListPage.tsx` - قائمة العروض
- `OfferDetailPage.tsx` - تفاصيل العرض
- `CampsListPage.tsx` - قائمة المعسكرات
- `CampDetailPage.tsx` - تفاصيل المعسكر
- `ThankYou.tsx` - صفحة الشكر
- `PrivacyPolicyPage.tsx` - سياسة الخصوصية
- `NotFound.tsx` - صفحة 404
- `Unauthorized.tsx` - صفحة غير مصرح
- `AccessRequest.tsx` - طلب الوصول
- `OfflinePage.tsx` - صفحة عدم الاتصال

**2. صفحات WhatsApp (متغيرة - تعتمد على ميزة WhatsApp):**
- `WhatsAppPage.tsx` - الصفحة الرئيسية لـ WhatsApp
- `WhatsAppDashboard.tsx` - لوحة تحكم WhatsApp
- `WhatsAppTemplatesPage.tsx` - قوالب WhatsApp
- `WhatsAppConnectionPage.tsx` - اتصال WhatsApp
- `WhatsAppAnalytics.tsx` - تحليلات WhatsApp
- `WhatsAppBroadcast.tsx` - بث WhatsApp
- `WhatsAppAutoReply.tsx` - رد تلقائي WhatsApp
- `WhatsAppCompliance.tsx` - الامتثال لـ WhatsApp
- `WhatsAppAppointments.tsx` - مواعيد WhatsApp
- `WhatsAppIntegration.tsx` - تكامل WhatsApp
- `WhatsAppAccountHealthPage.tsx` - صحة حساب WhatsApp
- `WhatsAppPhoneQualityPage.tsx` - جودة الهاتف WhatsApp
- `WhatsAppUserSubscriptionsPage.tsx` - اشتراكات المستخدمين WhatsApp
- `WhatsAppWebhookInspectorPage.tsx` - فاحص Webhook WhatsApp

**3. صفحات التقارير والتحليلات (متغيرة - تعتمد على ميزة Reports):**
- `ReportsPage.tsx` - صفحة التقارير
- `AnalyticsPage.tsx` - صفحة التحليلات
- `BIPage.tsx` - صفحة BI
- `CampStatsPage.tsx` - إحصائيات المعسكرات
- `PWAStatsPage.tsx` - إحصائيات PWA
- `TrackingSettingsPage.tsx` - إعدادات التتبع

**4. صفحات إدارة المرضى (متغيرة - تعتمد على ميزة Patient Portal):**
- `PatientPortalLogin.tsx` - تسجيل دخول بوابة المرضى
- `PatientDashboard.tsx` - لوحة تحكم المريض
- `PatientHomePage.tsx` - الصفحة الرئيسية للمريض
- `PatientAppointmentsPage.tsx` - مواعيد المريض
- `PatientAppointmentDetailsPage.tsx` - تفاصيل موعد المريض
- `PatientOffersPage.tsx` - عروض المريض
- `PatientCampsPage.tsx` - معسكرات المريض
- `PatientResultsPage.tsx` - نتائج المريض
- `PatientResultDetailsPage.tsx` - تفاصيل نتيجة المريض
- `PatientProfilePage.tsx` - ملف المريض

**5. صفحات إدارة الفرق (متغيرة - تعتمد على ميزة Team Management):**
- `DigitalMarketingTeamPage.tsx` - فريق التسويق الرقمي
- `MediaTeamPage.tsx` - فريق الإعلام
- `FieldMarketingTeamPage.tsx` - فريق التسويق الميداني
- `CustomerServiceTeamPage.tsx` - فريق خدمة العملاء

**6. صفحات الحملات (متغيرة - تعتمد على ميزة Campaigns):**
- `CampaignsPage.tsx` - صفحة الحملات (في admin/)
- `DigitalMarketingTasksPage.tsx` - مهام التسويق الرقمي (في admin/)
- `ProjectsManagementPage.tsx` - إدارة المشاريع

**7. صفحات إدارة الحجوزات (متغيرة - تعتمد على ميزة Bookings):**
- `BookingsManagementPage.tsx` - إدارة الحجوزات
- `LeadsManagementPage.tsx` - إدارة العملاء المحتملين
- `AppointmentsManagementPage.tsx` - إدارة المواعيد
- `OfferLeadsPage.tsx` - عملاء محتملين للعروض
- `CampRegistrationsPage.tsx` - تسجيلات المعسكرات
- `CustomersPage.tsx` - إدارة العملاء
- `TasksPage.tsx` - إدارة المهام

**8. صفحات الإدارة (ثابتة/متغيرة - تعتمد على ميزة Admin):**
- `AdminDashboard.tsx` - لوحة تحكم المشرف
- `ProfilePage.tsx` - ملف المستخدم
- `SettingsPage.tsx` - الإعدادات
- `ManagementPage.tsx` - صفحة الإدارة
- `ContentManagementPage.tsx` - إدارة المحتوى
- `UsersManagementPage.tsx` - إدارة المستخدمين
- `PublishingPage.tsx` - صفحة النشر
- `ReviewApprovalPage.tsx` - الموافقة على المراجعات
- `MessagesPage.tsx` - صفحة الرسائل
- `MessageSettingsPage.tsx` - إعدادات الرسائل

**9. صفحات الأطباء (ثابتة - تعتمد على ميزة Doctors):**
- `DoctorAppointments.tsx` - مواعيد الأطباء

#### التغييرات المطلوبة في الصفحات

**1. إضافة Feature Flags:**
كل صفحة متغيرة يجب أن تتحقق من ميزتها قبل التحميل:

```typescript
// في بداية كل صفحة متغيرة
import { useFeature } from '@/hooks/useFeature';

const WhatsAppPage = () => {
  const { hasFeature } = useFeature();
  
  if (!hasFeature('whatsapp')) {
    return <UnauthorizedFeature feature="WhatsApp" />;
  }
  
  // باقي كود الصفحة
};
```

**2. إنشاء مكون UnauthorizedFeature:**
```typescript
// components/UnauthorizedFeature.tsx
export const UnauthorizedFeature = ({ feature }: { feature: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Feature Not Available</h2>
      <p className="text-gray-600">
        The {feature} feature is not included in your current plan.
      </p>
      <p className="text-gray-600 mt-2">
        Please contact support to upgrade your license.
      </p>
    </div>
  </div>
);
```

**3. إضافة Lazy Loading المشروط:**
```typescript
// في App.tsx
const WhatsAppPage = lazy(() => 
  import("./pages/WhatsAppPage").then(module => ({
    default: module.WhatsAppPage
  }))
);

// مع التحقق من الميزة قبل التحميل
```

**4. إزالة Tenant Context:**
بما أن كل نسخة تعمل على قاعدة بيانات منفصلة، لا نحتاج إلى Tenant Context. يمكن إزالة:
- `contexts/TenantContext.tsx` - غير مطلوب
- `hooks/useTenant.ts` - غير مطلوب

### الجزء 3: المكونات والخطافات (Components & Hooks)

#### المكونات الحالية (160 مكون)
- المكونات العامة: DashboardShell, Navbar, Footer, ErrorBoundary, etc.
- مكونات WhatsApp: WhatsAppStatusBadge, ChatWindow, ConversationInfo, etc.
- مكونات الحجوزات: AppointmentCard, AppointmentTableDesktop, etc.
- مكونات التقارير: DashboardCharts, DetailedStatsCards, etc.
- مكونات المرضى: QuickPatientSearch, ManualRegistrationForm, etc.
- مكونات إدارة البيانات: DataTableWrapper, ColumnVisibility, etc.

#### الخطافات الحالية (30 خطاف)
- useTableFeatures, useFilterUtils, useExportUtils
- usePagination, useDebounce, useFormValidation
- usePWAInstall, useSSE, useWhatsAppSSE
- useNotificationSound, useImageUpload, usePhoneFormat
- وغيرها من الخطافات المساعدة

#### التغييرات المطلوبة

**1. إنشاء Hook للتحقق من الميزات (useFeature):**
```typescript
// hooks/useFeature.ts
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

**2. إنشاء Hook للتحقق من الترخيص (useLicense):**
```typescript
// hooks/useLicense.ts
import { useState, useEffect } from 'react';

export const useLicense = () => {
  const [license, setLicense] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkLicense = async () => {
      setIsLoading(true);
      try {
        const licenseData = await loadLicense();
        const valid = await validateLicense(licenseData);
        setLicense(licenseData);
        setIsValid(valid);
      } catch (error) {
        console.error('License check failed:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLicense();
    
    // التحقق من الترخيص كل ساعة
    const interval = setInterval(checkLicense, 3600000);
    return () => clearInterval(interval);
  }, []);
  
  return { license, isValid, isLoading };
};
```

**4. تعديل المكونات التي تعتمد على ميزات متغيرة:**

**مكونات WhatsApp:**
```typescript
// components/WhatsAppStatusBadge.tsx
import { useFeature } from '@/hooks/useFeature';

export const WhatsAppStatusBadge = () => {
  const { hasFeature } = useFeature();
  
  if (!hasFeature('whatsapp')) {
    return null;
  }
  
  // باقي كود المكون
};
```

**مكونات التقارير:**
```typescript
// components/DashboardCharts.tsx
import { useFeature } from '@/hooks/useFeature';

export const DashboardCharts = () => {
  const { hasFeature } = useFeature();
  
  if (!hasFeature('reports')) {
    return <UpgradePrompt feature="Reports" />;
  }
  
  // باقي كود المكون
};
```

**مكونات إدارة المرضى:**
```typescript
// components/QuickPatientSearch.tsx
import { useFeature } from '@/hooks/useFeature';

export const QuickPatientSearch = () => {
  const { hasFeature } = useFeature();
  
  if (!hasFeature('patient_portal')) {
    return null;
  }
  
  // باقي كود المكون
};
```

**5. إنشاء مكون UpgradePrompt:**
```typescript
// components/UpgradePrompt.tsx
export const UpgradePrompt = ({ feature }: { feature: string }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex items-center">
      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <div>
        <p className="text-sm font-medium text-yellow-800">
          {feature} Feature Required
        </p>
        <p className="text-sm text-yellow-700 mt-1">
          Upgrade your license to access this feature.
        </p>
      </div>
    </div>
  </div>
);
```

**6. إزالة Tenant Context من main.tsx:**
```typescript
// في main.tsx - لا حاجة لـ TenantProvider
createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
```

## التغييرات في Server Backend

### الجزء 1: Core & Routers

#### الملف: `server/_core/index.ts`
**الحالة الحالية:**
- نقطة دخول السيرفر Express
- يهيئ tRPC middleware
- يسجل OAuth routes, file upload, WhatsApp webhooks, SSE
- يبدأ cron jobs للمواعيد

**التغييرات المطلوبة:**
1. إضافة Auto-Migrations عند بدء السيرفر
2. إضافة middleware للتحقق من الترخيص في كل طلب
3. إضافة endpoint للتحقق من الترخيص
4. إضافة endpoint لقراءة config.json
5. إضافة middleware للتحقق من الميزات

**الكود المقترح:**
```typescript
// في server/_core/index.ts
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { getDb } from '../db';
import { validateLicenseMiddleware } from './middleware/license';

// Auto-Migrations on Startup
async function runAutoMigrations() {
  try {
    console.log('Checking database schema...');
    const db = await getDb();
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
  
  // إضافة middleware للتحقق من الترخيص
  app.use(validateLicenseMiddleware);
  
  // إضافة endpoint للتحقق من الترخيص
  app.get('/api/license/validate', async (req, res) => {
    const license = await loadLicense();
    const valid = await validateLicense(license);
    res.json({ valid, features: license?.features || [] });
  });
  
  // إضافة endpoint لقراءة config.json
  app.get('/api/config', async (req, res) => {
    const config = await loadConfig();
    res.json(config);
  });
  
  // ... باقي كود بدء السيرفر
}
```

#### الملف: `server/routers.ts`
**الحالة الحالية:**
- يحتوي على جميع sub-routers (28 router)
- يستخدم protectedProcedure للمصادقة
- يستخدم publicProcedure للوصول العام

**التغييرات المطلوبة:**
1. إضافة feature middleware لكل router متغير
2. إزالة tenant context من procedures
3. تصنيف routers حسب الخدمات
4. إضافة التحقق من الميزات في procedures

**الكود المقترح:**
```typescript
// إنشاء middleware للتحقق من الميزات
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

// استخدام في routers
export const whatsappRouter = router({
  // procedures تتطلب ميزة WhatsApp
  getConversations: featureProcedure('whatsapp')
    .query(async ({ ctx }) => {
      // كود الـ procedure - بدون tenantId
      return getConversations();
    }),
});

// لا حاجة لـ tenant context في createContext
// في server/_core/context.ts
export const createContext = async (opts: CreateExpressContextOptions) => {
  return {
    ...opts,
    user: opts.req.user,
  };
};
```

#### تصنيف Routers حسب الخدمات

**1. Routers العامة (ثابتة):**
- `auth` - المصادقة
- `system` - معلومات النظام
- `preferences` - تفضيلات المستخدم
- `sharedTemplates` - القوالب المشتركة

**2. Routers WhatsApp (متغيرة - تعتمد على ميزة WhatsApp):**
- `whatsapp` - جميع عمليات WhatsApp
- `whatsappTemplateTest` - اختبار القوالب
- `messageSettings` - إعدادات الرسائل
- `webhooks` - إدارة webhooks

**3. Routers التقارير (متغيرة - تعتمد على ميزة Reports):**
- `reports` - التقارير
- `charts` - الرسوم البيانية
- `tracking` - التتبع
- `auditLogs` - سجلات التدقيق
- `savedFilters` - الفلاتر المحفوظة

**4. Routers إدارة المرضى (متغيرة - تعتمد على ميزة Patient Portal):**
- `patientPortal` - بوابة المرضى
- `patientResults` - نتائج المرضى
- `pwa` - PWA

**5. Routers الحملات (متغيرة - تعتمد على ميزة Campaigns):**
- `campaigns` - الحملات
- `tasks` - المهام
- `followUpTasks` - مهام المتابعة

**6. Routers الحجوزات (متغيرة - تعتمد على ميزة Bookings):**
- `leads` - العملاء المحتملين
- `appointments` - المواعيد
- `offerLeads` - عملاء محتملين للعروض
- `campRegistrations` - تسجيلات المعسكرات
- `customers` - إدارة العملاء

**7. Routers الإدارة (ثابتة/متغيرة - تعتمد على ميزة Admin):**
- `users` - إدارة المستخدمين
- `accessRequests` - طلبات الوصول
- `comments` - التعليقات
- `queue` - قائمة الانتظار
- `cron` - Cron jobs
- `export` - التصدير

**8. Routers الأطباء (ثابتة - تعتمد على ميزة Doctors):**
- `doctors` - إدارة الأطباء

**9. Routers العروض والمعسكرات (ثابتة):**
- `offers` - العروض
- `camps` - المعسكرات
- `metaSync` - مزامنة Meta

### الجزء 2: Services

#### الخدمات الحالية

**الخدمات في server/services/ (12 خدمة):**
- `whatsappService.ts` - خدمة WhatsApp الأساسية
- `whatsappTemplates.ts` - إدارة قوالب WhatsApp
- `whatsappBroadcast.ts` - بث WhatsApp
- `whatsappAutoReply.ts` - الرد التلقائي
- `whatsappAppointments.ts` - مواعيد WhatsApp
- `whatsappIntegration.ts` - تكامل WhatsApp
- `whatsappMessageDispatcher.ts` - إرسال الرسائل
- `whatsappScheduler.ts` - جدولة WhatsApp
- `whatsappAuditLog.ts` - سجلات تدقيق WhatsApp
- `whatsappSecurity.ts` - أمان WhatsApp
- `templateSyncService.ts` - مزامنة القوالب
- `metaTemplateSync.ts` - مزامنة قوالب Meta

**الخدمات المباشرة في server/ (12 ملف):**
- `MetaApiService.ts` - خدمة Meta API
- `facebookCAPI.ts` - Facebook CAPI
- `metaGraphAPI.ts` - Meta Graph API
- `email.ts` - خدمة البريد الإلكتروني
- `messaging.ts` - خدمة الرسائل
- `telegram.ts` - خدمة Telegram
- `pdfService.ts` - خدمة PDF
- `storage.ts` - خدمة التخزين
- `webhookRoutes.ts` - مسارات Webhook
- `whatsappCloudAPI.ts` - WhatsApp Cloud API
- `whatsappSse.ts` - WhatsApp SSE
- `whatsapp.ts` - WhatsApp الأساسي

#### التغييرات المطلوبة

**1. تصنيف الخدمات حسب الميزات:**

**خدمات WhatsApp (متغيرة - تعتمد على ميزة WhatsApp):**
- جميع خدمات WhatsApp في server/services/
- `whatsappCloudAPI.ts`
- `whatsappSse.ts`
- `whatsapp.ts`

**خدمات Meta/Social Media (متغيرة - تعتمد على ميزة Social Media):**
- `MetaApiService.ts`
- `facebookCAPI.ts`
- `metaGraphAPI.ts`
- `templateSyncService.ts`
- `metaTemplateSync.ts`

**خدمات التقارير (متغيرة - تعتمد على ميزة Reports):**
- `pdfService.ts`

**خدمات الإشعارات (ثابتة/متغيرة):**
- `email.ts` - البريد الإلكتروني (ثابتة)
- `messaging.ts` - الرسائل (ثابتة)
- `telegram.ts` - Telegram (متغيرة - تعتمد على ميزة Telegram)

**خدمات التخزين (ثابتة):**
- `storage.ts`

**خدمات Webhook (ثابتة):**
- `webhookRoutes.ts`

**2. إضافة التحقق من الميزات في الخدمات:**

```typescript
// في كل خدمة متغيرة
import { loadLicense } from './lib/license';

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

**3. تبسيط دوال قاعدة البيانات (بدون tenantId):**

```typescript
// في db.ts - جميع الدوال بدون tenantId
export async function getLeads() {
  const db = await getDb();
  return db.select().from(leads);
}

export async function createLead(data: any) {
  const db = await getDb();
  await db.insert(leads).values(data);
}

export async function updateLead(id: number, data: any) {
  const db = await getDb();
  await db.update(leads)
    .set(data)
    .where(eq(leads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb();
  await db.delete(leads)
    .where(eq(leads.id, id));
}
```

**4. إزالة middleware للتحقق من الميزات من قاعدة البيانات:**

بما أن الميزات تُقرأ من license.json، لا نحتاج للتحقق من قاعدة البيانات. يمكن إزالة:
- `server/middleware/features.ts` - غير مطلوب

**5. إضافة Grace Period للتحقق من الترخيص:**

```typescript
// server/middleware/license.ts
export async function validateLicenseMiddleware(req: any, res: any, next: any) {
  try {
    const license = await loadLicense();
    const now = Date.now();
    
    // التحقق من Grace Period (7 أيام بدون اتصال)
    if (license.lastValidation) {
      const daysSinceValidation = (now - license.lastValidation) / (1000 * 60 * 60 * 24);
      if (daysSinceValidation > 7) {
        // محاولة التحقق من السيرفر المركزي
        const valid = await validateLicenseWithServer(license);
        if (!valid) {
          return res.status(403).json({ error: 'License expired or invalid' });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({ error: 'License validation failed' });
  }
}
```

## قائمة الملفات المحددة للتعديل

### الملفات الجديدة التي يجب إنشاؤها

**Client:**
1. `client/src/hooks/useFeature.ts` - Hook للتحقق من الميزات
2. `client/src/hooks/useLicense.ts` - Hook للتحقق من الترخيص
3. `client/src/components/UnauthorizedFeature.tsx` - مكون للميزات غير المصرح بها
4. `client/src/components/UpgradePrompt.tsx` - مكون لطلب الترقية
5. `client/src/pages/LicenseError.tsx` - صفحة خطأ الترخيص

**Server:**
1. `server/middleware/license.ts` - Middleware للتحقق من الترخيص
2. `server/lib/license.ts` - دوال الترخيص
3. `server/lib/config.ts` - دوال قراءة config.json

**Configuration Files:**
1. `config.json` - ملف التكوين
2. `license.json` - ملف الترخيص
3. `.env.example` - مثال لملف البيئة المحلي

### الملفات الموجودة التي يجب تعديلها

**Client:**
1. `client/src/const.ts` - إضافة دوال قراءة config.json و license.json
2. `client/src/main.tsx` - إضافة التحقق من الترخيص
3. `client/src/App.tsx` - إضافة feature flags في التوجيه

**Server:**
1. `server/_core/index.ts` - إضافة Auto-Migrations و middleware و endpoints
2. `server/routers.ts` - إضافة feature middleware وتصنيف routers
3. `server/db.ts` - إزالة tenantId من جميع عمليات قاعدة البيانات

**Database:**
1. `drizzle/schema.ts` - إزالة جداول tenants, tenantFeatures, tenantConfig وإزالة tenantId من جميع الجداول
2. `drizzle.config.ts` - تحديث لقراءة بيانات الاتصال من .env

### الملفات التي يجب تعديلها لإضافة التحقق من الميزات

**Client Pages (الصفحات المتغيرة):**
- جميع صفحات WhatsApp (14 صفحة)
- جميع صفحات التقارير (6 صفحة)
- جميع صفحات إدارة المرضى (10 صفحة)
- جميع صفحات إدارة الفرق (4 صفحة)
- جميع صفحات الحملات (3 صفحة)
- جميع صفحات إدارة الحجوزات (7 صفحة)

**Client Components (المكونات المتغيرة):**
- جميع مكونات WhatsApp
- جميع مكونات التقارير
- جميع مكونات إدارة المرضى

**Server Routers (الـ Routers المتغيرة):**
- `server/routers/whatsapp.ts`
- `server/routers/reports.ts`
- `server/routers/charts.ts`
- `server/routers/tracking.ts`
- `server/routers/patientPortal.ts`
- `server/routers/patientResults.ts`
- `server/routers/campaigns.ts`
- `server/routers/tasks.ts`
- `server/routers/leads.ts`
- `server/routers/appointments.ts`
- `server/routers/offerLeads.ts`
- `server/routers/campRegistrations.ts`
- `server/routers/customers.ts`

**Server Services (الخدمات المتغيرة):**
- جميع خدمات WhatsApp في `server/services/`
- `server/MetaApiService.ts`
- `server/facebookCAPI.ts`
- `server/metaGraphAPI.ts`
- `server/telegram.ts`
- `server/pdfService.ts`

### الملفات التي يجب تعديلها لإزالة Tenant ID

**Database Schema:**
- `drizzle/schema.ts` - إزالة tenantId من جميع الجداول

**Server Database Functions:**
- جميع دوال في `server/db.ts` - إزالة tenantId من جميع الدوال
- جميع دوال في `server/db/` - إزالة tenantId من جميع الدوال
