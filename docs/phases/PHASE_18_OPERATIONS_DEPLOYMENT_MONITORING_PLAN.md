# خطة تنفيذ المرحلة 18: العمليات والنشر والمراقبة (Operations, Deployment & Monitoring Plan)

| الخاصية | القيمة |
| :--- | :--- |
| **المرحلة** | المرحلة 18 (Phase 18) |
| **المجال** | العمليات والنشر والمراقبة (Operations, Deployment & Monitoring) |
| **الحالة** | معتمدة وقيد التنفيذ (Approved & In-Progress) |
| **المالك** | فريق العمليات والمنصة (DevOps & Platform Engineering Team) |
| **تاريخ الإنشاء** | 2026-09-13 |
| **المستند المرجعي الأساسي المستهدف** | `docs/domains/OPERATIONS_DEPLOYMENT_MONITORING_RUNTIME_REFERENCE.md` |

---

## 1. أهداف المرحلة 18

تهدف هذه المرحلة إلى توثيق شامل ودقيق لكافة جوانب العمليات والتشغيل، وبناء الحاويات، وإدارة البيئات، وتأمين خادم الويب، وإجراءات النسخ الاحتياطي واستعادة البيانات، والمراقبة الحية ومسارات التنبيهات، والمهام المجدولة (Cron)، وحزم النشر الخاصة بالعميل.

تلتزم هذه المرحلة التزاماً تاماً بقواعد العمل الملزمة المحددة في القسم 3 من [خطة تنفيذ حوكمة وتحديث التوثيق](../DOCUMENTATION_EXECUTION_PLAN.md):
1. **الشيفرة هي الحقيقة المطلقة:** الاستناد الفعلي إلى ملفات `Dockerfile`، `docker-compose.yml`، `deploy/`، `server/_core/health.ts`، `server/tasks/cron/`، و `release/`.
2. **عدم حذف المستندات التاريخية:** تحديث بيانات التعريف (Metadata Table) لكافة المستندات في `deploy/` وربطها بالمرجع الأساسي المعتمد.
3. **التوثيق الحصري دون المساس بالشيفرة البرمجية.**
4. **التحقق الآلي الصارم:** نجاح فحص السجل (`pnpm docs:check`) وفحص الأنواع TypeScript (`pnpm check`).

---

## 2. المصادر البرمجية المعتمدة (Ground Truth Sources)

1. **بناء الحاويات والأوركسترا:**
   - `Dockerfile` و `deploy/Dockerfile`: البناء متعدد المراحل (Multi-stage build) على Node 22 Alpine، والمستخدم غير الجذري `nodejs:1001`، وفحص الصحة المدمج `HEALTHCHECK`.
   - `docker-compose.yml` و `deploy/docker-compose.yml`: الخدمات (`app`, `mysql`, `redis`)، الشبكات، ونقاط تخزين البيانات الدائمة (Persistent Volumes).
2. **خادم الويب والبروكسي العكسي والشهادات الرقمية:**
   - `deploy/nginx/nginx.conf`: إعدادات Reverse Proxy، والتوجيه الإجباري لـ HTTPS، وشهادات Let's Encrypt عبر ACME، ومناطق تحديد المعدل (`api_limit: 10r/s` و `auth_limit: 5r/s`)، وبروتوكولات TLS 1.2/1.3، ورؤوس الأمان (Security Headers)، والتخزين المؤقت.
   - `deploy/nginx/setup-ssl.sh`، `deploy/nginx/setup-auto-renewal.sh`، `deploy/nginx/verify-ssl.sh`، و `deploy/nginx/certbot-renewal.timer`.
3. **فحوصات الجاهزية والقياسات الحية (Health & Metrics Probes):**
   - `server/_core/health.ts`: المسارات التشغيلية الأساسية:
     - `/health`: فحص شامل لحالة النظام، الذاكرة، المعالج، الاتصال بقاعدة البيانات.
     - `/health/ready`: فحص الجاهزية التشغيلية (Readiness Probe) للاتصال بالبيانات.
     - `/health/live`: فحص حيوية التطبيق (Liveness Probe) لسلامة حلقة الأحداث.
     - `/metrics`: نقطة تصدير قياسات Prometheus.
4. **نظام النسخ الاحتياطي والتعافي من الكوارث:**
   - `deploy/backup/backup.sh`: تصدير قاعدة البيانات (`mysqldump`)، وأرشفة ملفات المرفقات والتراخيص، وضغط `gzip`.
   - `deploy/backup/upload-to-cloud.sh`: الرفع السحابي المتوافق مع S3 / Cloudflare R2.
   - `deploy/backup/cleanup-old-backups.sh`: سياسة استبقاء وتدوير النسخ الاحتياطية.
   - `deploy/backup/bocam-backup.cron`: جدولة النسخ الدوري.
5. **مجموعة المراقبة والتنبيهات (Monitoring Stack):**
   - `deploy/monitoring/prometheus.yml`: جمع القياسات من التطبيق ومصدري المقاييس (Node Exporter, MySQL Exporter, Nginx Exporter, cAdvisor).
   - `deploy/monitoring/grafana-datasources.yml` و `deploy/monitoring/grafana-dashboards.yml`: لوحات المراقبة المرئية.
   - `deploy/monitoring/alertmanager.yml`: توجيه التنبيهات وقواعد الإنذار.
   - `deploy/monitoring/sentry-config.js`: تتبع الأخطاء البرمجية والاستثناءات اللحظية.
6. **المهام المجدولة (Scheduled Cron Jobs):**
   - `server/tasks/cron/scheduler.ts`: إدارة وجدولة مهام الخلفية (فحص نتائج التحاليل كل 60 ثانية، مهام إلغاء التفعيل الليلية عند منتصف الليل).
7. **حزم التوزيع والإصدار:**
   - `release/` و `release/DEPLOYMENT.txt`: إرشادات التوزيع الموجهة للعملاء، وإعدادات البيئة الموصى بها.

---

## 3. خطة المهام التفصيلية للمرحلة 18

| # | المهمة | الملف المستهدف | الإجراء المطلوب |
| :-: | :--- | :--- | :--- |
| 1 | صياغة الخطة التشغيلية | `docs/PHASE_18_OPERATIONS_DEPLOYMENT_MONITORING_PLAN.md` | إنشاء خطة المرحلة وتفاصيلها |
| 2 | إنشاء المرجع التشغيلي المعتمد | `docs/domains/OPERATIONS_DEPLOYMENT_MONITORING_RUNTIME_REFERENCE.md` | توثيق كامل وشامل ومفصل لكل جوانب العمليات |
| 3 | تحديث بيانات التعريف لمستندات `deploy/` | `deploy/README.md`<br>`deploy/docs/DOCKER.md`<br>`deploy/docs/MAINTENANCE_GUIDE.md`<br>`deploy/MAINTENANCE.md`<br>`deploy/nginx/README.md`<br>`deploy/monitoring/README.md`<br>`deploy/backup/README.md` | إضافة جدول الميتاداتا المعياري والربط بالمرجع المعتمد |
| 4 | تحديث مصفوفة التغطية | `docs/DOCUMENTATION_COVERAGE_MATRIX.md` | تعيين نطاق Operations كـ `canonical` وتحديث المراجع |
| 5 | تحديث فهرس التوثيق العام | `docs/README.md` | تحديث الجدول وإضافة الروابط الجديدة |
| 6 | صياغة تقرير إغلاق المرحلة 18 | `docs/PHASE_18_OPERATIONS_DEPLOYMENT_MONITORING_CLOSURE.md` | توثيق المخرجات ونتائج الفحص والتحقق |
| 7 | تحديث خطة التنفيذ العامة | `docs/DOCUMENTATION_EXECUTION_PLAN.md` | تأكيد إنجاز المرحلة 18 وطلب الموافقة للمرحلة 19 |
| 8 | المزامنة والتحقق الآلي | سجل التوثيق + أدوات الفحص | `pnpm docs:check` و `pnpm check` |

---

## 4. معايير القبول ومصفوفة التحقق (Acceptance Criteria)

- [ ] تغطية دقيقة لكافة المتغيرات والإعدادات دون تسريب أسرار أو كلمات مرور افتراضية صلبة.
- [ ] توثيق شامل لآليات التعافي من الكوارث (Disaster Recovery & Restore Runbook).
- [ ] مطابقة جميع مسارات فحوص الصحة (`/health`, `/health/ready`, `/health/live`, `/metrics`) مع كود `server/_core/health.ts`.
- [ ] توثيق آلية عمل المهام المجدولة في `server/tasks/cron/scheduler.ts`.
- [ ] خلو التوثيق من الروابط المعطوبة أو البيانات المتناقضة.
- [ ] نجاح فحص `node scripts/validate-documentation-registry.mjs --write` ومطابقة السجل بنسبة 100%.
- [ ] نجاح الفحص المعياري `pnpm docs:check` و `pnpm check`.
