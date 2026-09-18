# مصفوفة تغطية التوثيق النهائية المعتمدة (Final Documentation Coverage Matrix)

| الخاصية | القيمة |
| :--- | :--- |
| **الحالة (Status)** | `canonical` |
| **الجمهور المستهدف (Audience)** | `all` (القيادة، المطورون، المشغلون، فرق الجودة والأمان) |
| **المجال (Domain)** | `governance` |
| **المالك (Owner)** | `core-team` / `governance` |
| **تاريخ آخر مراجعة (Last Reviewed)** | 2026-09-13 |
| **مستوى الدليل** | Final Verified Coverage Baseline |

---

## 1. مصفوفة التغطية الشاملة لمجالات المنصة

تمثل هذه المصفوفة المرجع النهائي المعتمد لمطابقة كافة وحدات وشفرات واختبارات منصة **BOCAM CRM** مع وثائقها المرجعية المعتمدة (`canonical`)، مع تحديد الفرق المالكة ومجالات المسؤولية:

| # | الطبقة / المجال (Domain) | مسار الكود البرمجي (Code Path) | الاختبارات الحالية المطابقة (Tests) | الوثيقة المرجعية المعتمدة (Canonical Doc) | الحالة | الفريق المالك (Owner) |
| :-: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | **تعريف النظام والحدود المعمارية** | `client/src/App.tsx`, `server/_core/index.ts`, `serverBootstrap.ts` | `e2e/basic.spec.ts`, `e2e/auth.spec.ts` | [SYSTEM_DEFINITION.md](./SYSTEM_DEFINITION.md) | `canonical` | Architecture Team |
| **2** | **التثبيت والبيئات والتشغيل** | `package.json`, `scripts/check-env.mjs`, `vite.config.ts`, `drizzle.config.ts` | Startup/build checks, `pnpm check`, env validation | [INSTALLATION_GUIDE.md](./installation/INSTALLATION_GUIDE.md) | `canonical` | DevOps & Platform Team |
| **3** | **المصادقة والصلاحيات (RBAC)** | `server/_core/context.ts`, `oauth.ts`, `server/routers/auth.ts`, `permissionProcedures.ts` | `server/routers/__tests__/auth.test.ts`, `rbac.*.test.ts`, `e2e/auth.spec.ts` | [AUTHENTICATION_RBAC.md](./AUTHENTICATION_RBAC.md) | `canonical` | Security Team |
| **4** | **الترخيص والامتثال الطبي** | `server/_core/license/`, `license.ts`, `featureMiddleware.ts`, `heartbeat.ts` | `server/_core/__tests__/license.test.ts`, `validation.test.ts`, `featureMiddleware.test.ts` | [LICENSE_RUNTIME_REFERENCE.md](./licensing/LICENSE_RUNTIME_REFERENCE.md) | `canonical` | Security & Compliance Team |
| **5** | **مخطط قاعدة البيانات والترحيلات** | `drizzle/schema.ts`, `drizzle/relations.ts`, `drizzle/*.sql`, `server/database/` | Schema checks, migration scripts, `server/database/db/__tests__/` | [DATABASE_SCHEMA_RUNTIME_REFERENCE.md](./architecture/DATABASE_SCHEMA_RUNTIME_REFERENCE.md) | `canonical` | Database Architecture Team |
| **6** | **واجهات API وtRPC وWebhooks** | `server/_core/trpc.ts`, `server/routers/routers.ts`, `server/api/`, `server/integrations/webhooks/` | `webhookRoutes.test.ts`, `metaSocialWebhookRoute.test.ts`, WhatsApp webhook tests | [API_RUNTIME_REFERENCE.md](./api/API_RUNTIME_REFERENCE.md) | `canonical` | API & Integration Team |
| **7** | **المواعيد والحجوزات** | `server/routers/appointments.ts`, `server/database/db/appointments.ts`, `booking/` | `appointments.test.ts`, `AppointmentsTab.test.ts` | [APPOINTMENTS_RUNTIME_REFERENCE.md](./domains/APPOINTMENTS_RUNTIME_REFERENCE.md) | `canonical` | Clinical Workflows Team |
| **8** | **المرضى وبوابة المريض** | `server/routers/patientPortal.ts`, `patientResults.ts`, `server/database/db/patients.ts` | Patient portal page tests, `patients.test.ts` | [PATIENT_PORTAL_RUNTIME_REFERENCE.md](./domains/PATIENT_PORTAL_RUNTIME_REFERENCE.md) | `canonical` | Patient Experience Team |
| **9** | **الحملات والعملاء المحتملون** | `server/routers/campaigns.ts`, `leads.ts`, `server/database/db/campaigns.ts`, `leads.ts` | `campaigns.test.ts`, `leads.test.ts`, Campaigns/Leads UI tests | [CAMPAIGNS_LEADS_RUNTIME_REFERENCE.md](./domains/CAMPAIGNS_LEADS_RUNTIME_REFERENCE.md) | `canonical` | Marketing & Growth Team |
| **10** | **العروض والمخيمات والأطباء** | `server/routers/offers.ts`, `camps.ts`, `doctors.ts`, related components | Camps & registration tests, doctors router tests | [OFFERS_CAMPS_DOCTORS_RUNTIME_REFERENCE.md](./domains/OFFERS_CAMPS_DOCTORS_RUNTIME_REFERENCE.md) | `canonical` | Medical Affairs Team |
| **11** | **المهام والفرق والإشعارات** | `server/routers/tasks.ts`, `users.ts`, `followUpTasks.ts`, `notifications.ts` | Tasks/users tests, notification workflow tests | [PHASE_11_TASKS_TEAMS_NOTIFICATIONS_CLOSURE.md](./phases/PHASE_11_TASKS_TEAMS_NOTIFICATIONS_CLOSURE.md) | `canonical` | Internal Operations Team |
| **12** | **منصة وتكامل WhatsApp** | `server/routers/whatsapp/`, `server/services/whatsapp*`, WhatsApp pages | `whatsapp.test.ts`, integration/webhook tests, `e2e/whatsapp.spec.ts` | [WHATSAPP_INTEGRATION.md](./api/WHATSAPP_INTEGRATION.md) | `canonical` | Communications Team |
| **13** | **تكامل Meta وSocial Inbox** | `server/integrations/meta/`, `server/api/meta*`, `server/routers/socialInbox.ts` | Meta and social inbox tests | [META_INTEGRATION_GUIDE.md](./api/META_INTEGRATION_GUIDE.md) | `canonical` | Social Integrations Team |
| **14** | **إدارة المحتوى والوسائط (CMS)** | `server/routers/content/`, `server/services/content/`, admin content/media pages | Content workflow tests, media tests | [CONTENT_MANAGEMENT_README.md](./CONTENT_MANAGEMENT_README.md) | `canonical` | Content & Media Team |
| **15** | **التقارير والتحليلات والتتبع** | `server/routers/reports.ts`, `charts.ts`, `tracking.ts`, dashboard components | Analytics tests where present, reports tests | [PHASE_15_ANALYTICS_REPORTING_TRACKING_CLOSURE.md](./phases/PHASE_15_ANALYTICS_REPORTING_TRACKING_CLOSURE.md) | `canonical` | BI & Analytics Team |
| **16** | **الواجهة وPWA وإمكانية الوصول** | `client/src/core/`, `client/src/apps/`, `PWAManager`, `contexts/` | `accessibility.test.tsx`, `darkMode.test.ts`, `adminLayoutVerification.test.ts` | [FRONTEND_PLATFORM_RUNTIME_REFERENCE.md](./domains/FRONTEND_PLATFORM_RUNTIME_REFERENCE.md) و[FRONTEND_MODULAR_ARCHITECTURE.md](./architecture/FRONTEND_MODULAR_ARCHITECTURE.md) | `canonical` | Frontend Platform Team |
| **17** | **الاختبارات وهندسة الجودة** | `vitest.config.ts`, `playwright.config.ts`, `vitest.setup.ts`, `e2e/`, CI | 196 test files (97 server, 93 client, 6 E2E) | [TESTING_QUALITY_RUNTIME_REFERENCE.md](./domains/TESTING_QUALITY_RUNTIME_REFERENCE.md) | `canonical` | QA & Quality Engineering |
| **18** | **العمليات والنشر والمراقبة** | `deploy/`, Docker, `Dockerfile`, `server/_core/health.ts`, `server/tasks/cron/` | Health probes, container healthchecks, cron tasks, backup validation | [OPERATIONS_DEPLOYMENT_MONITORING_RUNTIME_REFERENCE.md](./domains/OPERATIONS_DEPLOYMENT_MONITORING_RUNTIME_REFERENCE.md) | `canonical` | DevOps & Operations Team |
| **19** | **حوكمة التوثيق والاستدامة** | `docs/`, `.devin/`, `.github/`, registry scripts, CI check workflows | Registry validator, link checker, `pnpm docs:check` | [FINAL_DOCUMENTATION_GOVERNANCE_SUSTAINABILITY_REPORT.md](./FINAL_DOCUMENTATION_GOVERNANCE_SUSTAINABILITY_REPORT.md) | `canonical` | Architecture Governance Team |

---

## 2. قواعد استدامة المصفوفة

1. **الالتزام بالحالة المعتمدة:** كافة مجالات المنصة أصبحت الآن في حالة `canonical`. لا يُسمح بإضافة أي مجال جديد بحالة `working` دون ربطه الفعلي بالكود والاختبارات واعتماده في خطة مرحلية.
2. **منع التراجع (Anti-Drift):** أي تعديل في بنية الكود أو مساراته يجب أن ينعكس مباشرة على هذه المصفوفة في نفس طلب الدمج (Pull Request).
3. **تحديث السجل المركزي:** السجل المركزي `docs/DOCUMENTATION_REGISTRY.json` هو الأداة الآلية للمطابقة ويُفحص دورياً في الـ CI لضمان استمرار صلاحية كافة الروابط والمسارات.