# دليل الترخيص - BOCAM CRM Platform

## نظرة عامة

BOCAM CRM Platform يستخدم نظام ترخيص محلي مشفر يعمل بدون إنترنت مع ربط الترخيص بـ Hardware-ID للجهاز.

## نظام الترخيص

### المكونات

1. **Hardware-ID Binding:**
   - يتم استخراج عنوان MAC لأول واجهة شبكة IPv4 غير داخلية
   - يربط الترخيص بالجهاز فعلياً
   - يمنع نسخ الترخيص بين الأجهزة

2. **التشفير الرقمي:**
   - RSA-2048 للترخيص
   - توقيع رقمي باستخدام RSA-PSS مع SHA-256
   - التحقق بدون اتصال إنترنت

3. **Kill Switch:**
   - يوقف السيرفر فوراً إذا كان الترخيص غير صالح
   - يعمل عند بدء التشغيل
   - يطبع رسائل خطأ واضحة

4. **Feature Flags:**
   - التحكم في الميزات المتاحة
   - دعم حماية على مستوى API و UI
   - إدارة ديناميكية للوصول

## الحصول على Hardware ID

### الطريقة 1: استخدام سكريبت CLI

```bash
pnpm license:get-hardware-id
```

النتيجة: `086D41DCC716`

### الطريقة 2: برمجياً

```javascript
import os from 'os';

const networkInterfaces = os.networkInterfaces();
for (const interfaceName of Object.keys(networkInterfaces)) {
  const interfaces = networkInterfaces[interfaceName];
  for (const iface of interfaces) {
    if (iface.family === 'IPv4' && !iface.internal) {
      const hardwareId = iface.mac.replace(/:/g, '').toUpperCase();
      console.log(hardwareId);
    }
  }
}
```

## توليد المفاتيح

### توليد زوج المفاتيح

```bash
pnpm license:generate-keys
```

سيتم إنشاء:
- `license-keys/public-key.pem` - المفتاح العام
- `license-keys/private-key.pem` - المفتاح الخاص

⚠️ **أمان:** احفظ المفتاح الخاص بأمان ولا تشاركه مع أحد!

### توليد ترخيص

#### الصيغة:

```bash
pnpm license:generate <hardwareId> <expiryTimestamp> <features>
```

#### المعاملات:

- **hardwareId:** Hardware ID للجهاز (مثال: `086D41DCC716`)
- **expiryTimestamp:** تاريخ الانتهاء بصيغة Unix Timestamp
- **features:** الميزات المفعلة (مفصولة بفواصل)
  - `*` = جميع الميزات
  - `whatsapp,reports,patient_portal` = ميزات محددة

#### حساب Unix Timestamp:

```bash
# سنة واحدة من الآن
node -e "console.log(Math.floor((new Date().getTime() + 365 * 24 * 60 * 60 * 1000) / 1000))"

# تاريخ محدد
node -e "console.log(Math.floor(new Date('2027-05-27').getTime() / 1000))"

# 6 أشهر من الآن
node -e "console.log(Math.floor((new Date().getTime() + 180 * 24 * 60 * 60 * 1000) / 1000))"
```

#### أمثلة:

```bash
# ترخيص لمدة سنة بجميع الميزات
pnpm license:generate 086D41DCC716 1811376000 "*"

# ترخيص لمدة 6 أشهر بـ WhatsApp و Reports فقط
pnpm license:generate 086D41DCC716 1795190400 "whatsapp,reports"
```

## تثبيت الترخيص

### النسخ اليدوي

1. انسخ محتوى الترخيص المُستلم
2. أنشئ ملف `license.json` في المجلد الرئيسي
3. الصق المحتوى
4. احفظ الملف

### عبر سكريبت CLI

يتم إنشاء الملف تلقائياً في `license-files/` عند توليد الترخيص. يمكنك نسخه يدوياً إلى المجلد الرئيسي.

## التحقق من الترخيص

### التحقق الصحيح

```bash
pnpm dev
```

النتيجة المتوقعة:
```
🚀 Initializing License System...
✅ License validation successful
Server running on http://localhost:3000/
```

### اختبار Kill Switch

1. غيّر حرفًا واحدً في `license.json`
2. أعد تشغيل السيرفر
3. النتيجة:
```
❌ LICENSE VALIDATION FAILED: Invalid digital signature
KILL SWITCH ACTIVATED
```

4. استعد الترخيص الصحيح
5. أعد تشغيل السيرفر

### اختبار Hardware-ID Mismatch

1. أنشئ ترخيص لجهاز آخر
2. انسخه إلى هذا الجهاز
3. النتيجة:
```
❌ LICENSE VALIDATION FAILED: Hardware ID mismatch
KILL SWITCH ACTIVATED
```

## الميزات المتاحة

### الميزات المدعومة

- `*` - جميع الميزات (كاملة)
- `whatsapp` - نظام واتساب (14 صفحة)
- `reports` - التقارير والإحصائيات (4 صفحة)
- `patient_portal` - بوابة المرضى (10 صفحة)
- `camps` - إدارة المخيمات (3 صفحة)
- `offers` - إدارة العروض (3 صفحة)
- `team_management` - إدارة الفرق (4 صفحة)
- `campaigns` - الحملات التسويقية (3 صفحة)
- `bookings` - إدارة الحجوزات (7 صفحة)

### الميزات الثابتة (لا تحتاج ترخيص)

- الصفحة الرئيسية
- صفحات الأطباء
- صفحات العروض
- إدارة المستخدمين
- الإعدادات
- التوثيقات

## استكشاف أخطاء الترخيص

### خطأ: "License file not found"

**الحل:**
```bash
# تأكد من وجود license.json
ls -la license.json

# توليد ترخيص تجريبي
HARDWARE_ID=$(pnpm license:get-hardware-id)
TIMESTAMP=$(node -e "console.log(Math.floor((new Date().getTime() + 365 * 24 * 60 * 60 * 1000) / 1000))")
pnpm license:generate "$HARDWARE_ID" "$TIMESTAMP" "*"
```

### خطأ: "Public key not found"

**الحل:**
```bash
# توليد المفاتيح
pnpm license:generate-keys
```

### خطأ: "Invalid digital signature"

**الحل:**
- الملف تم التلاعب به يدويً
- استخدم الترخيص الأصلي

### خطأ: "Hardware ID mismatch"

**الحل:**
- الترخيص ليس لهذا الجهاز
- احصل على Hardware ID جديد واطلب ترخيص جديدة

### خطأ: "License expired"

**الحل:**
- ترخيص منتهي
- طلب ترخيص مجددة من إيديا

### خطأ: "No features enabled"

**الحل:**
- الترخيص لا يحتوي على ميزات
- اطلب ترخيص بميزات

## حماية Anti-Clock-Tampering

النظام يحمي من التلاعب بوقت النظام:

### كيفية العمل

1. حفظ وقت آخر تشغيل ناجح في `.last-successful-run`
2. عند كل تشغيل:
   - التحقق من أن الوقت الحالي ليس أقدم
   - التحقق من أن Hardware ID لم يتغير
   - Kill Switch إذا تم رصد تلاعب

### اختبار الحماية

⚠️ **لا تجرب هذا في الإنتاج!**

```bash
# (للتطوير فقط) تغيير وقت النظام للخلف

# Linux/Mac
sudo date -s "2025-01-01 12:00:00"

# ثم أعد تشغيل السيرفر
pnpm dev
```

النتيجة:
```
🚨 SECURITY ALERT: CLOCK TAMPERING DETECTED!
KILL SWITCH ACTIVATED
```

## API الترخيص

### الحصول على معلومات الترخيص

```bash
curl http://localhost:3000/api/trpc/license.getInfo
```

### الحصول على Hardware ID

```bash
curl http://localhost:3000/api/trpc/license.getHardwareId
```

### التحقق من ميزة

```bash
curl http://localhost:localhost:3000/api/trpc/license.checkFeature?input={"feature":"whatsapp"}
```

## التجديد والتجديد

### تجديد الترخيص

1. توليد ترخيص جديد بالتاريخ المحدود
2. استبدل license.json بالترخيص الجديد
3. أعد تشغيل السيرفر

### تجديد الميزات

1. توليد ترخيص جديد بالميزات الإضافية
2. استبدل license.json
3. أعد تشغيل السيرفر

### الترقية إلى ترخيص إنتاج

1. احصل على ترخيص إنتاج من إيديا
2. استبدل license.json
3. احتفظ بالترخيص القدي كنسخة احتياطية

## الأمان

### حماية المفاتيح

- ✅ احتفظ بـ `license-keys/private-key.pem` في مكان آمن
- ✅ لا تشارك المفتاح الخاص مع أي شخص
- استخدم نسخ احتياطية من المفاتيح
- ✅ لا تضف `license-keys/` إلى Git أو وسائل مشاركة

### حماية الترخيص

- ✅ لا تشارك `license.json` مع أي شخص
- ✅ لا ترفع ملفات الترخيص إلى GitHub
- ✅ لا تضف `.last-successful-run` أو `.heartbeat-log` إلى Git
- ✅ احتفظ بنسخ احتياطية من الترخيص

### Best Practices

- ✅ استخدم كلمات مرور قوية للتكوين
- ✅ قم بتغيير JWT_SECRET في الإنتاج
- ✅ قم بتشفير اتصالات HTTPS
- ✅ احتفظ بنسخ احتياطية من قاعدة البيانات
- ✅ راجع السجلات بانتظام

## دعم الفني

إذا واجهت مشاكل في الترخيص:

1. راجع هذا الدليل
2. تحقق من `docs/TROUBLESHOOTING.md`
3. اتصل بفريق إيديا مع:
   - Hardware ID الحالي
   - رسالة الخطأ الكاملة
   - لقطات من السجلات

---

**تم التحديث:** 2026-05-27  
**الإصدار:** 1.0
