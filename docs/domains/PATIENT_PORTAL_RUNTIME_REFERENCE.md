# مرجع المرضى وبوابة المريض الحالي

**الحالة:** `working`
**الجمهور:** المرضى والمسؤولون والمطورون وفريق الأمان
**المجال:** Patients & Patient Portal
**آخر مراجعة:** 2026-09-12
**المصادر:** `server/routers/patientPortal.ts`، `server/routers/patientResults.ts`، `server/database/db/patients.ts`، صفحات `client/src/pages/patient-portal/`، اختبارات patient portal وpatients DB

> هذا المرجع يصف السلوك المثبت في الكود. لا يثبت تشفيرًا شاملاً أو امتثالًا قانونيًا أو تسجيلًا كاملًا لكل دخول ما لم يوجد مصدر تنفيذ واختبار.

## 1. تسجيل الدخول والجلسة

### OTP

1. `patientPortal.sendOtp` إجراء عام يقبل رقم هاتف من 9 إلى 15 محرفًا.
2. يطبع النظام الرقم، يبطل OTPات السابقة، وينشئ رمزًا من 6 أرقام صالحًا 5 دقائق.
3. يحاول إرسال الرمز عبر WhatsApp عند ضبط `WHATSAPP_PHONE_NUMBER_ID`، وإلا يسجله في الخادم. عند فشل WhatsApp قد يسجل fallback في السجل؛ لا ينبغي استخدام ذلك كمسار إنتاجي آمن.
4. `patientPortal.verifyOtp` يتحقق من الرمز. إذا لم يوجد المريض يعيد `needsRegistration: true`، وإذا وجد ينشئ جلسة.

### جلسة المريض

- اسم cookie هو `patient_session`.
- JWT يضم `patientId` و`phone` و`type: patient` ويوقع بـ`JWT_SECRET`.
- cookie هي `httpOnly` و`sameSite: lax` و`secure` في الإنتاج، ومدة صلاحيتها 30 يومًا.
- `patientProcedure` محلي داخل `patientPortal.ts` يقرأ cookie ويتحقق من JWT ثم يعيد تحميل المريض من قاعدة البيانات ويتحقق من `isActive`.
- `me` و`logout` عامان من حيث procedure، لكن `me` يعيد بياناتًا فقط عند وجود جلسة صالحة، وlogout يمسح cookie.

### كلمة المرور

`patientPortal.loginWithPassword` مسار عام اختياري. إذا لم يكن للحساب password يعيد خطأ يوجه إلى OTP، وإذا وجدت كلمة مرور يتحقق منها بـbcrypt ثم ينشئ نفس `patient_session`.

## 2. التسجيل والملف

`patientPortal.register` يتحقق من OTP ثم يمنع التسجيل المكرر بالهاتف، ينشئ المريض مع password اختيارية، ويبدأ جلسة تلقائيًا. `updateProfile` محمي بـ`patientProcedure` ويعدل الاسم والعنوان والعمر والبريد فقط.

`sanitizePatient` يحذف password قبل إعادة بيانات المريض إلى العميل. لا تُدرج كلمة المرور أو OTP في الاستجابات الموثقة.

## 3. بيانات المريض المعروضة

المسارات المحمية بالمريض هي:

- `myAppointments`: مواعيد مرتبطة بالهاتف المطبّع.
- `myOfferBookings`: تسجيلات العروض المرتبطة بالهاتف.
- `myCampRegistrations`: تسجيلات المخيمات المرتبطة بالهاتف.
- `myResults`: نتائج مرتبطة بمعرف المريض.

هذا العزل يعتمد على JWT صالح وإعادة تحميل الحساب ثم استخدام الهاتف أو id من الحساب المحقق؛ لا تقبل هذه المسارات معرف مريض من العميل.

## 4. نتائج المرضى إداريًا

`patientResults` راوتر إداري منفصل:

| الإجراء | الصلاحية |
|---|---|
| `listByPatientId` و`listByPhone` | `patients.results.view` |
| `create` | `patients.results.create`، وتحتاج `patients.results.status.update` إذا بدأ status غير `pending` |
| `updateStatus` | `patients.results.status.update` |

أنواع النتيجة هي `lab` و`radiology` و`report`، والحالات `pending` و`ready` و`delivered`. البحث بالهاتف يعيد المريض المنظف والنتائج؛ لذلك يجب حماية الإجراء الإداري وعدم اعتباره مسارًا عامًا للمريض.

## 5. حدود الخصوصية والأمان

- OTP والـJWT والـpassword مسارات حساسة، وتوجد اختبارات auth/portal وrate limiting لمسارات OTP على طبقة Express.
- fallback تسجيل OTP في logs عند غياب إعداد WhatsApp أو فشله يحتاج ضبط تشغيل مناسب؛ لا توثق أنه إرسال آمن مضمون.
- الوصول إلى النتائج يعتمد على middleware والصلاحيات، لكن هذا المرجع لا يثبت تشفير الملفات أو روابط تنزيل موقعة.
- لا تستخدم بيانات مرضى حقيقية في الأمثلة أو الاختبارات أو diagnostics.
- لا يثبت وجود MFA أو سجل تدقيق كامل لكل قراءة للنتائج؛ ما هو موثق هو audit لبعض إجراءات الإدارة وفق مصادرها.

## 6. حدود الاختبارات

اختبارات patient portal والصفحات وقاعدة بيانات المرضى تغطي أجزاء من OTP والملف والقوائم والعرض. لا تثبت المجموعة وحدها عزلًا إنتاجيًا شاملًا أو تكامل WhatsApp حقيقيًا أو سياسات الاحتفاظ والتشفير القانونية.

المرجع التاريخي [دليل بوابة المريض](../guides/PATIENT_PORTAL_GUIDE.md) يجب مراجعته مقابل هذا المستند قبل اعتباره تعليمات تشغيلية نهائية.
