# سياسة الأمان | Security Policy

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 🛡️ نظرة عامة

نأخذ الأمان على محمل الجد في منصة SGH CRM Portal. نلتزم بحماية بيانات المستخدمين والمرضى واتباع أفضل ممارسات الأمان في صناعة الرعاية الصحية.

## الإصدارات المدعومة

نحن نقدم تحديثات الأمان للإصدارات التالية:

| النسخة | مدعومة |
|--------|--------|
| 1.0.x  | ✅ نعم |
| 0.2.x  | ❌ لا |
| 0.1.x  | ❌ لا |

## الإبلاغ عن ثغرة أمنية

إذا اكتشفت ثغرة أمنية، يرجى **عدم** الإبلاغ عنها علناً. بدلاً من ذلك، يرجى إرسال بريد إلكتروني إلى:

**البريد الإلكتروني:** abood22828@gmail.com

### ما يجب تضمينه

عند الإبلاغ عن ثغرة أمنية، يرجى تضمين:

1. **الوصف**
   - وصف مفصل للثغرة
   - نوع الثغرة (SQL Injection, XSS, CSRF, etc.)

2. **خطوات إعادة الإنتاج**
   - خطوات واضحة لإعادة إنتاج المشكلة
   - أي أدوات أو سكريبتات مستخدمة

3. **التأثير المحتمل**
   - ما هو التأثير المحتمل لهذه الثغرة؟
   - ما هي البيانات المعرضة للخطر؟

4. **الإصدار المتأثر**
   - ما هو إصدار النظام المتأثر؟
   - بيئة التشغيل (Development/Production)

5. **الحل المقترح (اختياري)**
   - إذا كان لديك اقتراح للحل

### ما يمكن توقعه

- **الاستجابة الأولية:** سنرد خلال 48 ساعة
- **التحديثات:** سنبقيك على اطلاع بالتقدم
- **الإصلاح:** سنعمل على إصلاح الثغرة في أقرب وقت ممكن
- **الإفصاح:** سنقوم بالإفصاح المنسق معك بعد الإصلاح

---

## إجراءات الأمان المطبقة

### 🔐 المصادقة والتفويض

- **OAuth 2.0** - نظام مصادقة آمن عبر Manus OAuth
- **JWT Tokens** - رموز أمنية مع تشفير مناسب
- **تشفير كلمات المرور** - استخدام bcrypt مع salt rounds مناسب
- **نظام الصلاحيات** - أدوار متعددة (Admin, Manager, Team Leader, Staff, Viewer)
- **حماية CSRF** - حماية من هجمات CSRF
- **مصادقة ثنائية** - دعم OTP لتسجيل الدخول

### 🛡️ حماية البيانات

- **HTTPS** - جميع الاتصالات مشفرة عبر HTTPS
- **تشفير البيانات الحساسة** - تشفير البيانات الحساسة في قاعدة البيانات
- **حماية من SQL Injection** - استخدام Drizzle ORM مع معاملات معلمية
- **تنظيف المدخلات** - التحقق من جميع المدخلات وتنظيفها
- **حماية XSS** - تنظيف المخرجات ومنع حقن السكريبتات

### 📱 أمان WhatsApp

- **التحقق من Webhook** - التحقق من توقيعات webhooks من Meta
- **قائمة الحظر** - نظام لحظر الأرقام غير المرغوب فيها
- **أحداث الأمان** - تتبع أحداث الأمان المشبوهة
- **جودة الحساب** - مراقبة جودة حساب WhatsApp
- **Opt-out** - احترام طلبات إلغاء الاشتراك

### 🏥 امتثال الرعاية الصحية

- **HIPAA** - نلتزم بمبادئ HIPAA لحماية بيانات المرضى
- **GDPR** - متوافق مع لائحة حماية البيانات العامة الأوروبية
- **OWASP Top 10** - معالجة جميع مخاطر OWASP العشرة الأولى

### 🔒 أمان البنية التحتية

- **Redis** - تخزين مؤقت آمن مع مصادقة
- **MySQL** - قاعدة بيانات آمنة مع صلاحيات محدودة
- **Environment Variables** - جميع الأسرار في متغيرات البيئة
- **CORS** - سياسة CORS صارمة
- **Rate Limiting** - تحديد معدل الطلبات لمنع الهجمات

---

## أفضل الممارسات الأمنية

### للمطورين

1. **لا تقم بتضمين بيانات حساسة في الكود**
   - لا تضع مفاتيح API أو كلمات المرور في الكود
   - استخدم متغيرات البيئة دائماً
   - أضف `.env` إلى `.gitignore`

2. **حافظ على تحديث الحزم**
   - قم بتحديث الحزم بانتظام
   - راقب الثغرات الأمنية في dependencies
   - استخدم `pnpm audit` لفحص الثغرات

3. **راجع الكود**
   - راجع جميع Pull Requests بعناية
   - استخدم أدوات فحص الأمان
   - اطلب مراجعة الأمان للتغييرات الحساسة

4. **اكتب كود آمن**
   - استخدم معاملات معلمية في استعلامات قاعدة البيانات
   - نظف جميع المدخلات والمخرجات
   - تحقق من الصلاحيات في كل endpoint

### للمستخدمين

1. **استخدم كلمات مرور قوية**
   - استخدم كلمات مرور فريدة وقوية
   - فعّل المصادقة الثنائية إذا كانت متاحة
   - غيّر كلمات المرور بانتظام

2. **حافظ على تحديث النظام**
   - قم بتحديث النظام إلى أحدث إصدار
   - راقب الإشعارات الأمنية
   - طبّق تصحيحات الأمان فوراً

3. **كن حذراً**
   - لا تشارك بيانات الدخول
   - راجع الأذونات بانتظام
   - أبلغ عن أي نشاط مشبوه

---

## الثغرات المعروفة

لا توجد ثغرات أمنية معروفة حالياً في الإصدار 1.0.0.

## سجل الأمان

### 2025-05-23 (الإصدار 1.0.0)
- ✅ تنفيذ OAuth للمصادقة الآمنة
- ✅ إضافة نظام الصلاحيات المتكامل
- ✅ تشفير البيانات الحساسة
- ✅ حماية CSRF
- ✅ اتصالات HTTPS
- ✅ نظام حظر الأرقام
- ✅ تتبع أحداث الأمان
- ✅ مراقبة جودة حساب WhatsApp

### 2025-01-06 (الإصدار 0.2.0)
- ✅ تنفيذ OAuth للمصادقة الآمنة
- ✅ إضافة نظام الصلاحيات
- ✅ تشفير البيانات الحساسة
- ✅ حماية CSRF
- ✅ اتصالات HTTPS

---

## الامتثال

هذا المشروع يلتزم بـ:

- ✅ **OWASP Top 10** - معالجة جميع مخاطر الأمان العشرة الأولى
- ✅ **GDPR** - لائحة حماية البيانات العامة الأوروبية
- ✅ **HIPAA** - مبادئ حماية بيانات الرعاية الصحية
- ✅ **أفضل ممارسات أمان الرعاية الصحية**

---

## الاتصال

للحصول على استفسارات أمنية عامة:

- **البريد الإلكتروني:** abood22828@gmail.com
- **GitHub Issues:** [إنشاء issue](https://github.com/wheb3543/bocam/issues) (للمشاكل غير الحساسة فقط)

---

<a name="english"></a>

## 🛡️ Overview

We take security seriously at SGH CRM Portal. We are committed to protecting user and patient data and following best security practices in the healthcare industry.

## Supported Versions

We currently provide security updates for the following versions:

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes    |
| 0.2.x   | ❌ No     |
| 0.1.x   | ❌ No     |

## Reporting a Vulnerability

If you discover a security vulnerability, please do **not** report it publicly. Instead, please email:

**Email:** abood22828@gmail.com

### What to Include

When reporting a vulnerability, please include:

1. **Description**
   - Detailed description of the vulnerability
   - Vulnerability type (SQL Injection, XSS, CSRF, etc.)

2. **Steps to Reproduce**
   - Clear steps to reproduce the issue
   - Any tools or scripts used

3. **Potential Impact**
   - What is the potential impact of this vulnerability?
   - What data is at risk?

4. **Affected Version**
   - Which version of the system is affected?
   - Environment (Development/Production)

5. **Suggested Fix (Optional)**
   - If you have a suggested fix

### What to Expect

- **Initial Response:** We will respond within 48 hours
- **Updates:** We will keep you updated on progress
- **Fix:** We will work to fix the vulnerability as soon as possible
- **Disclosure:** We will coordinate disclosure with you after the fix

---

## Security Measures Implemented

### 🔐 Authentication & Authorization

- **OAuth 2.0** - Secure authentication via Manus OAuth
- **JWT Tokens** - Security tokens with proper encryption
- **Password Hashing** - Using bcrypt with appropriate salt rounds
- **Permission System** - Multiple roles (Admin, Manager, Team Leader, Staff, Viewer)
- **CSRF Protection** - Protection against CSRF attacks
- **Two-Factor Authentication** - OTP support for login

### 🛡️ Data Protection

- **HTTPS** - All connections encrypted via HTTPS
- **Sensitive Data Encryption** - Encryption of sensitive data in database
- **SQL Injection Protection** - Using Drizzle ORM with parameterized queries
- **Input Sanitization** - Validation and sanitization of all inputs
- **XSS Protection** - Output cleaning and script injection prevention

### 📱 WhatsApp Security

- **Webhook Verification** - Verification of webhook signatures from Meta
- **Block List** - System for blocking unwanted numbers
- **Security Events** - Tracking of suspicious security events
- **Account Quality** - Monitoring of WhatsApp account quality
- **Opt-out** - Respect opt-out requests

### 🏥 Healthcare Compliance

- **HIPAA** - We comply with HIPAA principles for patient data protection
- **GDPR** - Compliant with European General Data Protection Regulation
- **OWASP Top 10** - Addressing all OWASP Top 10 security risks

### 🔒 Infrastructure Security

- **Redis** - Secure caching with authentication
- **MySQL** - Secure database with limited privileges
- **Environment Variables** - All secrets in environment variables
- **CORS** - Strict CORS policy
- **Rate Limiting** - Request rate limiting to prevent attacks

---

## Security Best Practices

### For Developers

1. **Don't commit sensitive data**
   - Don't put API keys or passwords in code
   - Always use environment variables
   - Add `.env` to `.gitignore`

2. **Keep packages updated**
   - Update packages regularly
   - Monitor for security vulnerabilities in dependencies
   - Use `pnpm audit` to check for vulnerabilities

3. **Review code**
   - Review all Pull Requests carefully
   - Use security scanning tools
   - Request security review for sensitive changes

4. **Write secure code**
   - Use parameterized queries for database operations
   - Sanitize all inputs and outputs
   - Verify permissions on every endpoint

### For Users

1. **Use strong passwords**
   - Use unique and strong passwords
   - Enable two-factor authentication if available
   - Change passwords regularly

2. **Keep system updated**
   - Update to the latest version
   - Monitor security notifications
   - Apply security patches immediately

3. **Be cautious**
   - Don't share login credentials
   - Review permissions regularly
   - Report any suspicious activity

---

## Known Vulnerabilities

There are currently no known security vulnerabilities in version 1.0.0.

## Security Changelog

### 2025-05-23 (Version 1.0.0)
- ✅ Implemented OAuth for secure authentication
- ✅ Added comprehensive permission system
- ✅ Encrypted sensitive data
- ✅ CSRF protection
- ✅ HTTPS connections
- ✅ Number blocking system
- ✅ Security event tracking
- ✅ WhatsApp account quality monitoring

### 2025-01-06 (Version 0.2.0)
- ✅ Implemented OAuth for secure authentication
- ✅ Added permission system
- ✅ Encrypted sensitive data
- ✅ CSRF protection
- ✅ HTTPS connections

---

## Compliance

This project complies with:

- ✅ **OWASP Top 10** - Addressing all top 10 security risks
- ✅ **GDPR** - General Data Protection Regulation
- ✅ **HIPAA** - Healthcare data protection principles
- ✅ **Healthcare Security Best Practices**

---

## Contact

For general security inquiries:

- **Email:** abood22828@gmail.com
- **GitHub Issues:** [Create issue](https://github.com/wheb3543/bocam/issues) (for non-sensitive issues only)

---

<div align="center">

**الأمان أولوية | Security is a Priority**

</div>