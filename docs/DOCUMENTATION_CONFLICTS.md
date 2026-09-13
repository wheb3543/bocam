# سجل تعارضات ونواقص التوثيق

**الحالة:** `working`  
**المجال:** Documentation Governance  
**آخر مراجعة:** 2026-09-11

هذا السجل يمنع حذف الوثائق أو دمجها قبل وجود قرار واضح. كل بند يجب أن ينتهي بقرار أو يبقى مفتوحًا مع مالك.

| الرمز | المجموعة أو المشكلة | الأدلة المتأثرة | نوع التعارض | القرار الحالي | المالك |
|---|---|---|---|---|---|
| C0-01 | فهرس قديم مقابل الملفات الفعلية | `docs/README.md` وملفات `docs/` | روابط ومسارات مفقودة | تحديث الفهرس، دون حذف المحتوى | unassigned |
| C0-02 | أدلة الاختبار المتعددة | `docs/TESTING_GUIDE.md`، `docs/guides/TESTING_GUIDE.md` | تكرار مرجعي | مراجعة وتحديد canonical في مرحلة الاختبارات | unassigned |
| C0-03 | تثبيت وتشغيل موزع | `docs/installation/`، `QUICK_START.md`، `deploy/`، `release/` | اختلاف الجمهور والنطاق | فصل local setup عن operations | unassigned |
| C0-04 | وثائق WhatsApp الحالية والتاريخية | `docs/api/`، `docs/guides/`، `docs/archive/whatsapp_research/` | خلط current/history | إبقاء الأرشيف مع روابط بديلة بعد مرحلة WhatsApp | unassigned |
| C0-05 | تقارير وخطط متعددة للمجال نفسه | `docs/analysis/` والملفات المباشرة | اختلاف الحالة الزمنية | وسمها report/plan وعدم اعتبارها مرجعًا تلقائيًا | unassigned |
| C0-06 | سياسة JSDoc واسعة | `docs/introduction/DOCUMENTATION_POLICY.md` | معيار غير مميز حسب سطح الاستخدام | مراجعتها في مرحلة الحوكمة ثم تطبيقها تدريجيًا | unassigned |
| C0-07 | توثيق المنتج مقابل قواعد الوكلاء | `AGENTS.md`، `.devin/`، `.github/` | اختلاف الجمهور | إبقاؤها خارج دليل المنتج مع روابط إرشادية | unassigned |
| C0-08 | ملفات الجذر غير القياسية | تقارير Meta وSocial وContent في الجذر | تشتت مسارات | لا نقل في هذه المرحلة؛ توثيق قرار النقل في المجال المختص | unassigned |
| C3-01 | مسارا جلسة محلية وOAuth | `server/routers/auth.ts`، `server/_core/context.ts`، `server/_core/sdk.ts` | اختلاف السر والبنية وخصائص Cookie | موثق في `docs/AUTHENTICATION_RBAC.md`؛ قرار التوحيد مؤجل | unassigned |
| C3-02 | صلاحية دقيقة مقابل حارس عام | `server/routers/auth.ts` وراوترات المجالات | بعض الإجراءات تستخدم `publicProcedure` أو `adminProcedure` رغم وجود كتالوج دقيق | توثيق الفجوة ومراجعتها في المجال المختص | unassigned |
| C3-03 | Feature Gate مقابل RBAC | `ProtectedRoute` و`permissionProcedure` | اختلاف طبقتي الحماية | إبقاؤهما منفصلين في التوثيق والاختبارات | unassigned |
| C4-01 | Kill Switch مقابل activation mode | `server/_core/license.ts`، `docs/licensing/LICENSE_GUIDE.md` | الدليل القديم ادعى إيقاف الخادم دائمًا بينما `initializeLicense(true)` يسمح ببدء activation mode و`validateLicense` يعيد حالة غير صالحة | صُحح الدليل، وقرار الإيقاف الإلزامي مؤجل لمسار أمني مستقل | unassigned |
| C4-02 | مصدر heartbeat المركزي | `server/_core/heartbeat.ts`، وثائق الترخيص القديمة | الكود يستخدم `IDEA_HUB_URL` بينما ظهرت متغيرات أخرى في الوثائق | المرجع الحالي يوثق `IDEA_HUB_URL` فقط؛ التوحيد مؤجل | unassigned |
| C4-03 | كشف بيانات إجراءات الترخيص العامة | `server/routers/license.ts` | إجراءات عامة تعرض حالة الترخيص وHardware ID وتسمح بطلبات تفعيل قبل تسجيل الدخول | موثق كقرار مراجعة أمني، دون تغيير السلوك في هذه المرحلة | unassigned |
| C4-04 | ادعاءات قانونية وامتثال غير مثبتة | `docs/licensing/` و`SECURITY.md` | ادعاءات MIT/Proprietary وHIPAA/GDPR لا تثبتها طبقة التنفيذ وحدها | فصل المرجع التقني عن القانوني وطلب مراجعة مستقلة | unassigned |
| C5-01 | عدد الجداول في الوثائق مقابل schema الحالي | `docs/architecture/DATABASE_SCHEMA.md` و`drizzle/schema.ts` | الوثيقة القديمة تذكر 40+ بينما المصدر يحتوي 106 تعريفات جدول | تحديث خط الأساس وإبقاء الوثيقة التاريخية تحت مراجعة | unassigned |
| C5-02 | عدد ملفات الترحيل وتصنيفها | `drizzle/MIGRATIONS_GUIDE.md` و`drizzle/*.sql` | الدليل يذكر 64 ملفًا بينما الجرد الحالي 110 ملفات، والتصنيف placeholder يحتاج فحص محتوى | توثيق العدد المرصود وعدم وصف الملفات دون قراءة SQL وjournal | unassigned |
| C5-03 | ERD والعلاقات الصريحة | `docs/architecture/DATABASE_ERD.md`، `drizzle/schema.ts`، `drizzle/relations.ts` | ERD يصف علاقات وسلوك حذف قد لا يطابق كل القيود الحالية | مطابقة العلاقات في مهمة مستقلة قبل اعتماد ERD كمرجع canonical | unassigned |
| C5-04 | مقارنة schema الحية وparser | `scripts/compare_schema.cjs`، `drizzle/schema.ts`، قاعدة التشغيل | parser القديم لم يلتقط تعريفات متعددة الأسطر وخلط اسم قاعدة الاتصال، ثم تم إصلاحه والتحقق من التطابق | أُغلقت الفجوة: لا جداول أو أعمدة تطبيق مفقودة أو زائدة؛ `__drizzle_migrations` إداري | unassigned |
| C6-01 | patientProcedure في الدليل مقابل الكود | `docs/api/REST_TRPC_API.md`، `server/routers/patientPortal.ts`، `server/_core/trpc.ts` | الدليل يعرض patientProcedure كطبقة عامة بينما الكود يستخدم middleware محليًا | تصحيح الدليل والإحالة إلى المرجع الحالي | unassigned |
| C6-02 | Swagger كمرجع شامل | `server/_core/swagger.ts`، `server/routers/routers.ts` | Swagger لا يولد إجراءات tRPC تلقائيًا وبعض REST paths تستخدم cookie أو توقيعًا أو cron بدل Bearer | توثيق الحدود وعدم اعتباره catalog كاملًا | unassigned |
| C6-03 | Webhook acknowledgment والمعالجة اللاحقة | `server/api/webhookRoutes.ts`، `server/api/metaSocialWebhookRoute.ts` | بعض POST paths تعيد 200 قبل اكتمال التخزين والمعالجة لتجنب retries | توثيق السلوك ومراجعة idempotency في مرحلة التكاملات | unassigned |
| C7-01 | دليل المريض مقابل مسار الحجز الحالي | `docs/guides/PATIENT_PORTAL_GUIDE.md`، `server/routers/appointments.ts`، `server/routers/patientPortal.ts` | الدليل يذكر كلمة مرور وحجزًا وإلغاءً ذاتيًا دون ربط كامل بمسارات التنفيذ الحالية | استخدام مرجع المواعيد الحالي وتدقيق دليل المريض في مرحلة المرضى | unassigned |
| C7-02 | تاريخ الإنشاء مقابل تاريخ الموعد | `server/database/db/appointments.ts`، واجهة الفلاتر | التصفية dateFrom/dateTo وdateFilter تستخدم `createdAt` بينما العرض يحتوي `appointmentDate` | توثيق الفرق وعدم وصف الفلتر كتصفية لموعد الخدمة | unassigned |
| C7-03 | انتقالات الحالة غير المقيدة | `server/routers/appointments.ts` و`updateRoutes` | الراوتر يقبل قيم status نصية في بعض الإجراءات ولا يفرض آلة انتقال كاملة | توثيق القيم المدعومة ورفع قواعد الانتقال لقرار مجال مستقل | unassigned |
| C8-01 | fallback OTP في السجل | `server/routers/patientPortal.ts`، `docs/guides/PATIENT_PORTAL_GUIDE.md` | عند غياب WhatsApp أو فشل الإرسال قد يسجل الكود OTP في سجل الخادم | توثيق السلوك كقيد تشغيل وعدم وصفه كإرسال إنتاجي آمن | unassigned |
| C8-02 | ادعاءات تشفير وMFA وتدقيق المريض | `docs/guides/PATIENT_PORTAL_GUIDE.md`، `server/routers/patientPortal.ts` | الدليل يدعي حماية/تشفيرًا وتسجيلًا عامًا لا يثبتها مسار portal وحده | وسمها needs-verification ومراجعتها في الأمان/العمليات | unassigned |
| C8-03 | مسار نتائج المريض مقابل نتائج الإدارة | `server/routers/patientPortal.ts`، `server/routers/patientResults.ts` | patient portal يقرأ بالجلسة، والإدارة تستخدم phone/id وصلاحيات منفصلة | إبقاء المسارين منفصلين وربط كل واحد باختبار وحماية | unassigned |
| C9-01 | enum lead مقابل حالات updateStatus | `drizzle/schema.ts`، `server/routers/leads.ts` | schema يقبل حالات أوسع من enum الراوتر الإداري | توثيق الفرق ورفع قرار توحيد حالات المجال | unassigned |
| C9-02 | KPI وROI مقابل الحساب الفعلي | `server/database/db/campaigns.ts`، وثائق الحملات والتحليلات | الكود يحسب counts ومعدل تحويل leads/appointments، ولا يثبت ROI/attribution كاملًا | عدم اعتماد KPI تجاري دون مصدر تحليلي مستقل | unassigned |
| C9-03 | إنشاء حملة تلقائيًا | `server/routers/leads.ts`، `server/routers/appointments/routes/submitRoute.ts` | lead أو appointment غير المعروف قد ينشئ campaign تلقائيًا | توثيق السلوك ورفع قرار ملكية البيانات | unassigned |

## قواعد القرار

1. لا حذف قبل تحديد البديل والروابط الواردة.
2. لا دمج قبل مقارنة المحتوى والسلوك الحالي.
3. أي تعارض تجاري أو قانوني يرفع لصاحب المشروع.
4. أي وثيقة بلا مالك تبقى `unassigned` ولا تُعتبر `canonical`.