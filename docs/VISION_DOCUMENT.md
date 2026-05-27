# مستند الرؤية الاستراتيجية - BOCAM SaaS Platform

**الإصدار:** 1.0  
**التاريخ:** 2026-05-27  
**المطور:** فريق آيديا  
**العميل:** المستشفى السعودي الألماني - صنعاء

---

## جدول المحتويات

1. نظرة عامة
2. الرؤية الاستراتيجية
3. المعمارية المقترحة
4. نظام الترخيص والحماية
5. نموذج العمل
6. الجمهور المستهدف
7. الميزات التنافسية
8. أهداف النظام
9. التحديات والحلول
10. خارطة الطريق

---

## 1. نظرة عامة

### 1.1 ما هو BOCAM؟

**BOCAM (Business Operations & Customer Management)** هو منصة CRM طبية متكاملة مصممة للمستشفيات ومراكز الرعاية الصحية. توفر المنصة إدارة شاملة للحملات التسويقية، حجوزات الأطباء، بوابة المريض، تكامل WhatsApp Business API، نظام إدارة المهام، وأكثر من ذلك.

### 1.2 الوضع الحالي

- النظام يعمل كنسخة واحدة للمستشفى السعودي الألماني
- يحتوي على جميع الميزات مفعلة
- لا يوجد نظام ترخيص
- البيانات الثابتة للعميل مدمجة في الكود
- يعمل على قاعدة بيانات واحدة

### 1.3 الرؤية المستقبلية

تحويل النظام إلى منصة SaaS قابلة للبيع للعملاء المتعددين، حيث:
- كل عميل يحصل على نسخة معزولة تماماً
- نظام ترخيص محلي مشفر يعمل بدون إنترنت
- البيانات الثابتة ديناميكية عبر .env
- Feature Flags للتحكم في الميزات
- سهولة النشر والصيانة

---

## 2. الرؤية الاستراتيجية

### 2.1 الرؤية

**"توفير منصة CRM طبية متكاملة وقابلة للتخصيص لكل مستشفى ومركز صحي، مع نظام ترخيص مرن وعمل بدون إنترنت"**

### 2.2 المهمة

تطوير وتسويق منصة BOCAM كمنتج SaaS يمكن نشره على أي بنية تحتية (سحابة محلية، سيرفر خاص، TiDB Cloud) مع:
- عزل كامل للبيانات
- أمان عالي
- عمل بدون إنترنت
- سهولة التثبيت والصيانة

### 2.3 القيم

- **العزل الكامل:** كل عميل له بيئة معزولة تماماً
- **الأمان:** تشفير صارم وحماية البيانات
- **المرونة:** عمل بدون إنترنت مع Silent Heartbeat اختياري
- **السهولة:** تثبيت بسيط وصيانة سهلة
- **الجودة:** منتج احترافي عالي الأداء

---

## 3. المعمارية المقترحة

### 3.1 Isolated Instance per Tenant Architecture

**المبدأ الأساسي:**
```
┌─────────────────────────────────────────────────────────────┐
│                    شركة آيديا (النشر)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  العميل 1   │  │  العميل 2   │  │  العميل 3   │  ...   │
│  │  (نسخة 1)   │  │  (نسخة 2)   │  │  (نسخة 3)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  تكوين كل نسخة:                            │
│  - كود BOCAM معزول                                          │
│  - قاعدة بيانات مستقلة                                      │
│  - ملف .env خاص                                             │
│  - ملف license.json خاص                                     │
│  - استضافة منفصلة (TiDB Cloud / سيرفر محلي)                │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 المكونات الرئيسية

#### 3.2.1 النسخة المعزولة (Isolated Instance)

**محتويات كل نسخة:**
- كود BOCAM الكامل
- قاعدة بيانات MySQL/TiDB مستقلة
- ملف .env خاص بالإعدادات
- ملف license.json خاص بالترخيص
- ملفات الصور والشعارات الخاصة

#### 3.2.2 ملف .env

**المحتويات:**
```env
# Database
DATABASE_URL=mysql://user:password@host:3306/db_name

# Company Info
COMPANY_NAME=المستشفى السعودي الألماني
COMPANY_LOGO=/logos/sgh.png
COMPANY_ARABIC_NAME=المستشفى السعودي الألماني
COMPANY_ENGLISH_NAME=Saudi German Hospital

# Contact Info
COMPANY_PHONE=+967 1 234 567
COMPANY_EMAIL=info@sgh.ye
COMPANY_ADDRESS=صنعاء، اليمن

# Social Media
FACEBOOK_URL=https://facebook.com/sgh
INSTAGRAM_URL=https://instagram.com/sgh
TWITTER_URL=https://twitter.com/sgh

# Meta Pixel
META_PIXEL_ID=2008380493273171
META_ACCESS_TOKEN=EAA...

# WhatsApp API
WHATSAPP_ACCESS_TOKEN=EAA...
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321
WEBHOOK_VERIFY_TOKEN=secret_token

# Email Service
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=SG.xxx

# SMS Service
SMS_SERVICE=twilio
SMS_API_KEY=xxx
SMS_PHONE_NUMBER=+1234567890

# OAuth
JWT_SECRET=secret_key_min_32_chars
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=app_id
OWNER_OPEN_ID=open_id
OWNER_NAME=admin_name

# License (automatically generated, not manually set)
# License validation is automatic based on hardware ID
```

#### 3.2.3 ملف license.json

**المحتويات:**
```json
{
  "key": "base64_encoded_license_key",
  "hardwareId": "MAC_ADDRESS",
  "expiryDate": 1735689600000,
  "features": [
    "whatsapp",
    "reports",
    "patient_portal",
    "team_management",
    "campaigns",
    "bookings"
  ],
  "isValid": true,
  "lastValidation": 1735000000000
}
```

### 3.3 تدفق البيانات

```
┌─────────────────────────────────────────────────────────────┐
│                      المستخدم النهائي                        │
│                  (المريض / الموظف / الإدارة)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 واجهة المستخدم (Client)                      │
│  - React 19 + TypeScript                                      │
│  - Feature Flags                                             │
│  - Lazy Loading                                              │
│  - التحقق من الترخيص المحلي                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  الخادم (Server)                             │
│  - Node.js + Express                                          │
│  - tRPC API                                                  │
│  - التحقق من الترخيص المحلي                                  │
│  - Middleware للميزات                                        │
│  - Silent Heartbeat (اختياري)                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              قاعدة البيانات (Database)                        │
│  - MySQL / TiDB                                             │
│  - معزولة للعميل الواحد                                     │
│  - Auto-Migrations on Startup                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  الخدمات الخارجية                            │
│  - WhatsApp Cloud API                                        │
│  - Meta Pixel & Conversion API                              │
│  - Email Service                                             │
│  - SMS Service                                               │
│  - Silent Heartbeat Server (اختياري)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. نظام الترخيص والحماية

### 4.1 المبدأ الأساسي

**ترخيص محلي مشفر يعمل بدون إنترنت**

- يعتمد على Hardware-ID (MAC Address)
- تشفير صارم باستخدام asymmetric encryption
- Kill Switch محلي
- Silent Heartbeat اختياري للسيرفر المركزي

### 4.2 آلية العمل

#### 4.2.1 توليد مفتاح الترخيص

**الخطوات:**
1. العميل يطلب ترخيص من شركة آيديا
2. العميل يرسل Hardware-ID الخاص بسيرفره
3. شركة آيديا تولد License Key:
   - دمج Hardware-ID + تاريخ الانتهاء + الميزات
   - تشفير باستخدام Private Key
   - إرسال License Key للعميل
4. العميل يضع License Key في ملف license.json

**الكود:**
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

#### 4.2.2 التحقق المحلي من الترخيص

**الخطوات:**
1. عند بدء السيرفر، قراءة ملف license.json
2. فك تشفير License Key باستخدام Public Key
3. التحقق من Hardware-ID
4. التحقق من تاريخ الانتهاء
5. إذا فشل التحقق، منع تشغيل النظام

**الكود:**
```typescript
// server/_core/license.ts
import crypto from 'crypto';

export async function validateLicense(): Promise<LicenseInfo | null> {
  try {
    // قراءة ملف license.json
    const licenseData = JSON.parse(fs.readFileSync('license.json', 'utf-8'));
    
    // فك تشفير المفتاح
    const decoded = JSON.parse(Buffer.from(licenseData.key, 'base64').toString());
    const payload = JSON.parse(decoded.payload);
    
    // التحقق من التوقيع
    const isValid = crypto.verify(
      'SHA256',
      Buffer.from(payload),
      publicKey,
      Buffer.from(decoded.signature, 'base64')
    );
    
    if (!isValid) throw new Error('Invalid license signature');
    
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
```

#### 4.2.3 Silent Heartbeat (اختياري)

**الهدف:**
- إرسال heartbeat للسيرفر المركزي عند توفر الإنترنت
- لا يؤثر على عمل النظام
- يستخدم للإحصائيات واكتشاف التراخيص المنتهية

**التنفيذ:**
```typescript
// server/services/heartbeat.ts
export async function sendHeartbeat(licenseInfo: LicenseInfo) {
  try {
    await fetch('https://license.ideaye.com/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hardwareId: licenseInfo.hardwareId,
        expiryDate: licenseInfo.expiryDate,
        features: licenseInfo.features,
        timestamp: Date.now()
      })
    });
  } catch (error) {
    // Silent failure - doesn't affect system operation
    console.log('Heartbeat failed (offline):', error.message);
  }
}

// Run every 24 hours
setInterval(async () => {
  const licenseInfo = await validateLicense();
  if (licenseInfo) {
    await sendHeartbeat(licenseInfo);
  }
}, 24 * 60 * 60 * 1000);
```

### 4.3 Kill Switch المحلي

**المبدأ:**
- إذا فشل التحقق المحلي، النظام يتوقف عن العمل فوراً
- لا يعتمد على الإنترنت
- رسالة خطأ واضحة للمستخدم

**الرسائل:**
- "License signature invalid" - التوقيع غير صحيح
- "Hardware ID mismatch" - الجهاز غير مطابق
- "License expired" - الترخيص منتهي
- "License file not found" - ملف الترخيص غير موجود

---

## 5. نموذج العمل

### 5.1 نموذج البيع

**الترخيص السنوي:**
- كل ترخيص سنوي لكل مستشفى/مركز
- يتضمن جميع الميزات أو ميزات محددة حسب الباقة
- يمكن التجديد سنوياً

**الباقات المقترحة:**
- **الباقة الأساسية:** الصفحات العامة + إدارة المواعيد + إدارة العملاء
- **الباقة المتقدمة:** الباقة الأساسية + WhatsApp + التقارير
- **الباقة الكاملة:** جميع الميزات

### 5.2 نموذج النشر

**الخيارات:**
1. **TiDB Cloud:** نشر سحابي مدار بالكامل
2. **سيرفر محلي:** نشر على سيرفر العميل
3. **سحابة خاصة:** نشر على سحابة خاصة (AWS, Azure, GCP)

### 5.3 نموذج الدعم

**الدعم الفني:**
- دعم عبر البريد الإلكتروني
- دعم عبر WhatsApp
- دعم عبر Zoom (حسب الباقة)
- SLA: 24 ساعة استجابة

---

## 6. الجمهور المستهدف

### 6.1 المستشفيات الخاصة

**الحجم:**
- المستشفيات المتوسطة (50-200 سرير)
- المستشفيات الكبيرة (200+ سرير)

**الاحتياجات:**
- إدارة الحملات التسويقية
- إدارة المواعيد والحجوزات
- تكامل WhatsApp
- بوابة المريض
- التقارير والتحليلات

### 6.2 مراكز الرعاية الصحية

**الحجم:**
- العيادات المتخصصة
- مراكز التشخيص
- مراكز الجراحة اليومية

**الاحتياجات:**
- إدارة المواعيد
- تكامل WhatsApp
- التقارير الأساسية

### 6.3 المستشفيات الحكومية

**الحجم:**
- المستشفيات الإقليمية
- المستشفيات المركزية

**الاحتياجات:**
- إدارة المواعيد
- بوابة المريض
- التقارير المتقدمة
- إدارة الفرق

---

## 7. الميزات التنافسية

### 7.1 العمل بدون الإنترنت

**الميزة:**
- نظام ترخيص يعمل بدون إنترنت
- مناسب للمناطق ذات الاتصال الضعيف
- Kill Switch محلي لا يعتمد على السيرفر المركزي

### 7.2 العزل الكامل

**الميزة:**
- كل عميل له نسخة معزولة تماماً
- قاعدة بيانات مستقلة
- أمان عالي
- عدم التأثير بين العملاء

### 7.3 المرونة في النشر

**الميزة:**
- يمكن النشر على أي بنية تحتية
- TiDB Cloud، سيرفر محلي، سحابة خاصة
- سهولة التثبيت والصيانة

### 7.4 Feature Flags

**الميزة:**
- تحكم دقيق في الميزات
- يمكن تفعيل/تعطيل الميزات حسب الباقة
- Lazy Loading لتحسين الأداء

### 7.5 White-Label Core

**الميزة:**
- الكود نظيف ومجرد
- سهولة التخصيص لكل عميل
- البيانات الثابتة ديناميكية عبر .env

---

## 8. أهداف النظام

### 8.1 الأهداف قصيرة المدى (3-6 أشهر)

1. **Code Decoupling:**
   - استخراج جميع البيانات الثابتة
   - نقلها إلى .env وملفات الثوابت
   - التأكد من عمل المشروع بدون انهيار

2. **نظام الترخيص:**
   - تطبيق نظام الترخيص المحلي المشفر
   - تطبيق Kill Switch المحلي
   - تطبيق Silent Heartbeat

3. **Feature Flags:**
   - تطبيق نظام Feature Flags
   - تطبيق Lazy Loading
   - تطبيق Middleware للميزات

### 8.2 الأهداف متوسطة المدى (6-12 شهر)

1. **تحسين الأداء:**
   - تحسين استجابة النظام
   - تحسين سرعة التحميل
   - تحسين استهلاك الموارد

2. **اختبار النظام:**
   - اختبار شامل لجميع الميزات
   - اختبار نظام الترخيص
   - اختبار العزل بين العملاء

3. **التوثيق:**
   - توثيق التثبيت
   - توثيق الترخيص
   - توثيق الصيانة

### 8.3 الأهداف طويلة المدى (12+ شهر)

1. **التوسع:**
   - بيع النظام لعملاء جدد
   - فتح أسواق جديدة
   - تطوير ميزات إضافية

2. **التحسين المستمر:**
   - تحديثات دورية
   - إصلاح الأخطاء
   - تحسين الأداء

---

## 9. التحديات والحلول

### 9.1 التحدي: انقطاع الإنترنت

**المشكلة:**
- بعض المستشفيات في مناطق ذات اتصال ضعيف
- التحقق من الترخيص عبر الإنترنت قد يفشل

**الحل:**
- نظام ترخيص محلي يعمل بدون إنترنت
- Silent Heartbeat اختياري فقط
- Kill Switch محلي

### 9.2 التحدي: أمان البيانات

**المشكلة:**
- بيانات المرضى حساسة
- يجب حمايتها من الاختراق

**الحل:**
- عزل كامل للبيانات
- تشفير صارم للترخيص
- SSL/TLS للاتصالات
- تشفير قاعدة البيانات

### 9.3 التحدي: الصيانة

**المشكلة:**
- صيانة نسخ متعددة قد تكون صعبة
- التحديثات قد تكون معقدة

**الحل:**
- Auto-Migrations on Startup
- سهولة التثبيت
- توثيق شامل
- أدوات صيانة آلية

### 9.4 التحدي: التكلفة

**المشكلة:**
- تكلفة النشر على سحابة خاصة
- تكلفة الصيانة

**الحل:**
- خيارات نشر متعددة
- التكلفة على العميل
- باعات مرنة حسب الاحتياجات

---

## 10. خارطة الطريق

### المرحلة 1: Code Decoupling (الأولوية القصوى)

**المدة:** 2-3 أسابيع

**الخطوات:**
1. تمشيط الكود لاستخراج البيانات الثابتة
2. إنشاء ملف .env.example موسع
3. إنشاء src/const.ts موسع
4. تحديث جميع الملفات
5. اختبار التغييرات

**المخرجات:**
- كود مجرد (White-Label Core)
- جميع البيانات الثابتة في .env
- المشروع يعمل بدون انهيار

### المرحلة 2: نظام الترخيص

**المدة:** 3-4 أسابيع

**الخطوات:**
1. تطبيق توليد License Key
2. تطبيق التحقق المحلي
3. تطبيق Kill Switch
4. تطبيق Silent Heartbeat
5. اختبار النظام

**المخرجات:**
- نظام ترخيص محلي مشفر
- Kill Switch محلي
- Silent Heartbeat

### المرحلة 3: Feature Flags

**المدة:** 2-3 أسابيع

**الخطوات:**
1. تطبيق نظام Feature Flags
2. تطبيق Lazy Loading
3. تطبيق Middleware للميزات
4. تحديث الصفحات المتغيرة
5. اختبار النظام

**المخرجات:**
- Feature Flags يعمل
- Lazy Loading للصفحات
- Middleware للميزات

### المرحلة 4: الاختبار والتوثيق

**المدة:** 2-3 أسابيع

**الخطوات:**
1. اختبار شامل
2. توثيق التثبيت
3. توثيق الترخيص
4. توثيق الصيانة

**المخرجات:**
- نظام مختبر بالكامل
- توثيق شامل
- جاهز للنشر

### المرحلة 5: النشر الأولي

**المدة:** 1-2 أسابيع

**الخطوات:**
1. النشر للعميل الأول
2. التدريب
3. الدعم الفني
4. جمع الملاحظات

**المخرجات:**
- عميل أول راضٍ
- ملاحظات للتحسين
- أساس للتوسع

---

## الخاتمة

هذا المستند يوضح الرؤية الاستراتيجية لتحويل BOCAM إلى منصة SaaS قابلة للبيع للعملاء المتعددين. المعمارية المقترحة تضمن عزل كامل للبيانات، أمان عالي، عمل بدون إنترنت، وسهولة في النشر والصيانة.

المرحلة الأولى الحتمية هي Code Decoupling لاستخراج جميع البيانات الثابتة وجعلها ديناميكية عبر .env، لضمان أن المشروع لا ينهار أثناء العمل التالي.
