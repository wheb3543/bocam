# مرجع واجهات التطبيق البرمجية (REST & tRPC API Reference)

يوضح هذا الدليل الفني مواصفات وهيكلة واجهات التطبيق البرمجية (API Reference) المعتمدة في منصة **SGH CRM Portal** لتكامل الواجهة الأمامية (React 19) مع خادم التطبيق (Node.js/Express) باستخدام بروتوكول **tRPC v11** عالي الأمان ومسارات **REST API** الاعتيادية الخاصة بالويب هوكس (Webhooks).

---

## 📋 جدول المحتويات
1. [نظرة عامة وآلية الاتصال](#1-نظرة-عامة-وآلية-الاتصال)
2. [مستويات الحماية والتحقق (Procedures & Middleware)](#2-مستويات-الحماية-والتحقق-procedures--middleware)
3. [واجهات مصادقة المسؤولين (Admin Authentication - authRouter)](#3-واجهات-مصادقة-المسؤولين-admin-authentication---authrouter)
4. [بوابة المرضى الذاتية (Patient Portal API - patientPortalRouter)](#4-بوابة-المرضى-الذاتية-patient-portal-api---patientportalrouter)
5. [تكامل واتساب المتقدم (WhatsApp API - whatsappRouter)](#5-تكامل-واتساب-المتقدم-whatsapp-api---whatsapprouter)
6. [التقارير والإحصائيات والتحليلات (Reports & Charts - reportsRouter)](#6-التقارير-والإحصائيات-والتحليلات-reports--charts---reportsrouter)
7. [أدوات التصدير والتقارير المالية (Export API)](#7-أدوات-التصدير-والتقارير-المالية-export-api)
8. [مسارات REST API والويب هوك (REST Webhooks Router)](#8-مسارات-rest-api-والويب-hook-rest-webhooks-router)

---

## 1️⃣ نظرة عامة وآلية الاتصال

تعتمد المنصة بشكل أساسي على **tRPC** لضمان تطابق الأنواع البرمجية (Type-safety) بين الـ Backend والـ Frontend دون الحاجة لكتابة كود JSON Schema يدوي أو توليد ملفات Swagger. يتم تمرير طلبات الـ tRPC عبر بروتوكول HTTP GET للاستعلامات (Queries) و HTTP POST للتعديلات (Mutations).

* **رابط الاتصال الرئيسي (tRPC Endpoint):** `/api/trpc`
* **مكتبة التحقق من المدخلات:** **Zod** لضمان دقة وتطابق مدخلات البيانات على مستوى الحقول والأنواع.

---

## 2️⃣ مستويات الحماية والتحقق (Procedures & Middleware)

تم تصنيف الإجراءات (Procedures) داخل الـ Routers إلى 4 مستويات أمان رئيسية:

1. **`publicProcedure`:** واجهات عامة يمكن استدعاؤها بدون مصادقة (مثل حجز موعد عام، تسجيل دخول المرضى).
2. **`protectedProcedure`:** تتطلب جلسة تحقق صالحة للمسؤولين عبر فك تشفير رمز الـ JWT من ملف تعريف الارتباط (Cookie) تحت اسم `admin_session`.
3. **`adminProcedure`:** تتطلب أن يكون المستخدم بصلاحية `admin` حصرياً (مثل تهيئة الترخيص وتعديل القوالب وحذف البيانات الحساسة).
4. **`patientProcedure`:** مستوى مخصص لبوابة المرضى يتطلب التحقق من توكن `patient_session` المرتبط برقم هاتف المريض في قاعدة البيانات.

---

## 3️⃣ واجهات مصادقة المسؤولين (Admin Authentication - authRouter)

مسؤولة عن التحقق من حسابات الموظفين والمدراء وإدارة الجلسات.

### 🔹 `auth.login` (Mutation)
* **نوع الإجراء:** `publicProcedure`
* **مخطط المدخلات (Input Schema - Zod):**
  ```typescript
  z.object({
    identifier: z.string().min(3), // اسم المستخدم أو البريد الإلكتروني
    password: z.string().min(1),   // كلمة المرور
  })
  ```
* **المخرجات المتوقعة (Output):**
  ```typescript
  {
    success: boolean,
    user: {
      id: number,
      username: string,
      role: 'admin' | 'manager' | 'team_leader' | 'staff' | 'viewer',
      name: string | null
    }
  }
  ```
* **الوصف:** يتحقق من بيانات الاعتماد، وإذا كان الحساب نشطاً (`isActive: "yes"`)، يقوم السيرفر بإنشاء رمز JWT وتثبيته في ملف الكوكيز الآمن `admin_session` مع تفعيل خياري `httpOnly` و `sameSite: "lax"`.

---

## 4️⃣ بوابة المرضى الذاتية (Patient Portal API - patientPortalRouter)

تسمح للمرضى بمتابعة مواعيدهم، وعرض نتائج تحاليلهم المخبرية وتقارير الأشعة وتثبيت الـ OTP.

### 🔹 `patientPortal.sendOtp` (Mutation)
* **نوع الإجراء:** `publicProcedure`
* **مخطط المدخلات:**
  ```typescript
  z.object({
    phone: z.string().min(9).max(15) // رقم الهاتف الدولي
  })
  ```
* **المخرجات المتوقعة:**
  ```typescript
  { success: boolean }
  ```
* **الوصف:** يقوم بتوليد رمز تحقق عشوائي ذي 6 أرقام (صالح لمدة 5 دقائق)، ويقوم بإرساله آلياً عبر رسالة واتساب مشفرة إلى هاتف المريض باستخدام Meta API.

### 🔹 `patientPortal.loginWithOtp` (Mutation)
* **نوع الإجراء:** `publicProcedure`
* **مخطط المدخلات:**
  ```typescript
  z.object({
    phone: z.string().min(9).max(15),
    code: z.string().length(6) // رمز الـ OTP المستلم
  })
  ```
* **المخرجات المتوقعة:**
  ```typescript
  {
    success: boolean,
    patient: {
      id: number,
      fullName: string,
      phone: string,
      email: string | null
    }
  }
  ```
* **الوصف:** يتحقق من مطابقة الرمز المدخل للرمز المخزن وغير المستخدم، وعند النجاح يزرع توكن المريض `patient_session` في كوكيز المتصفح لمدة 30 يوماً.

---

## 5️⃣ تكامل واتساب المتقدم (WhatsApp API - whatsappRouter)

يتيح التحكم الكامل ببث الرسائل الجماعية، وإدارة المحادثات الحية، وتتبع تكاليف وحالات تسليم الرسائل.

### 🔹 `whatsapp.connection.status` (Query)
* **نوع الإجراء:** `protectedProcedure`
* **المخرجات المتوقعة:**
  ```typescript
  {
    isConnected: boolean,
    phoneNumberId: string,
    businessAccountId: string,
    qualityRating: string,
    status: 'APPROVED' | 'PENDING' | 'REJECTED'
  }
  ```
* **الوصف:** استعلام فوري لجلب حالة تهيئة الحساب السحابي لـ WhatsApp Business من Meta والتحقق من صلاحية توكن الوصول.

### 🔹 `whatsapp.sendMessage` (Mutation)
* **نوع الإجراء:** `protectedProcedure` (يخضع لـ Limit مدمج: 10 رسائل في الدقيقة لكل مستخدم لمنع الإغراق).
* **مخطط المدخلات:**
  ```typescript
  z.object({
    conversationId: z.number(),
    content: z.string().min(1),
    messageType: z.enum(['text', 'image', 'document']).default('text'),
    mediaUrl: z.string().optional()
  })
  ```
* **المخرجات المتوقعة:**
  ```typescript
  {
    success: boolean,
    messageId: number,
    whatsappMessageId: string // المعرف الفريد الصادر من سيرفرات Meta
  }
  ```

---

## 6️⃣ التقارير والإحصائيات والتحليلات (Reports & Charts - reportsRouter)

يوفر استعلامات تجميعية للبيانات المالية ومؤشرات الأداء لدعم اتخاذ القرار للإدارة العليا للمستشفى.

### 🔹 `reports.getBookingsReport` (Query)
* **نوع الإجراء:** `protectedProcedure` مع استخدام وسيط الحماية المالي `requireReportsFeature()`
* **مخطط المدخلات:**
  ```typescript
  z.object({
    startDate: z.string().optional(), // صيغة YYYY-MM-DD
    endDate: z.string().optional()
  })
  ```
* **المخرجات المتوقعة:**
  ```typescript
  {
    appointments: {
      total: number,
      byStatus: Array<{ status: string, total: number }>
    },
    campRegistrations: {
      total: number,
      byStatus: Array<{ status: string, total: number }>
    },
    offerLeads: {
      total: number,
      byStatus: Array<{ status: string, total: number }>
    },
    grandTotal: number
  }
  ```
* **الوصف:** يحلل ويحسب إجمالي الحجوزات ومقارنتها عبر الفلاتر الزمنية مع تصنيف الحالات (pending, confirmed, attended, completed).

---

## 7️⃣ أدوات التصدير والتقارير المالية (Export API)

يسمح لموظفي الـ CRM بتحميل وتصدير الجداول الضخمة إلى صيغ التقارير القياسية العالمية.

### 🔹 `export.generatePDF` (Mutation)
* **نوع الإجراء:** `protectedProcedure`
* **مخطط المدخلات:**
  ```typescript
  z.object({
    metadata: z.object({
      tableName: z.string(),
      totalRecords: z.number(),
      exportDate: z.string(),
      exportedBy: z.string()
    }),
    columns: z.array(z.object({ key: z.string(), label: z.string() })),
    data: z.array(z.record(z.string(), z.unknown()))
  })
  ```
* **المخرجات المتوقعة:**
  ```typescript
  {
    success: boolean,
    pdf: string // ملف الـ PDF مرمز كـ Base64 String جاهز للتحميل
  }
  ```
* **الوصف:** يقوم بتمرير البيانات والجدول وتوليد ملف PDF منسق بخصائص المستشفى السعودي الألماني وتحويله ديناميكياً لإرساله دون الحاجة لروابط تخزين مؤقتة.

---

## 8️⃣ مسارات REST API والويب هوك (REST Webhooks Router)

نظراً لأن منصة **Meta** ومزودي الخدمات يتطلبون روابط استقبال اعتيادية لا تعمل عبر بروتوكولات الـ RPC، تم تخصيص مسارات Express تقليدية مستقلة لاستقبال الويب هوكس وتحليلها.

### 📥 `GET /api/webhooks/whatsapp` (إجراء التحقق - Verification)
* **مستوى الأمان:** عام (مفتوح لسيرفرات Meta فقط)
* **معاملات الاستعلام المتوقعة (Query Parameters):**
  - `hub.mode`: يجب أن يطابق `"subscribe"`
  - `hub.challenge`: رمز التحدي العشوائي من فيسبوك.
  - `hub.verify_token`: التوكن المحلي السري للتحقق والمطابقة.
* **الاستجابة الناجحة:** يعيد السيرفر قيمة `hub.challenge` مباشرة كـ Plain Text كإثبات لامتلاك خادم استقبال ويب هوك سليم، وموافقة فيسبوك لربط التنبيهات.

### 📥 `POST /api/webhooks/whatsapp` (استقبال البيانات والرسائل الفعلي)
* **مستوى الأمان:** يتطلب التحقق من توقيع الرسالة الثنائي (**X-Hub-Signature-256**) في هيدر الطلب لمطابقة الشفرة الموقعة بـ HMAC-SHA256 والتأكد من أن البيانات واردة فعلاً من فيسبوك ولم يتم تزويرها.
* **جسم الطلب (Request Body):** كائن JSON ضخم يحتوي على أحداث الرسائل، وسائط المحادثات، قراءة المستندات، تفاصيل الفواتير، وحالات الرسائل المرسلة (sent, delivered, read, failed).
* **الاستجابة:** يُرجع الكود فورا الاستجابة الرمزية `HTTP 200 OK` لتأكيد استلام الحدث، ثم يمرر المعالجة لطابور المهام البرمجي **BullMQ** المعتمد على **Redis** لتفادي تعطيل الخادم أو تجاوز الحد الأقصى للمعالجة (Rate Limits).
