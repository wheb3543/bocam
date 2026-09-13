# حزمة النشر والتشغيل

| الخاصية | القيمة |
| :--- | :--- |
| **الحالة (Status)** | `working` |
| **الجمهور المستهدف (Audience)** | `operations` / `devops` |
| **المجال (Domain)** | `operations` |
| **المالك (Owner)** | `devops` |
| **تاريخ آخر مراجعة (Last Reviewed)** | 2026-09-13 |

> [!NOTE]
> هذا المستند يعتبر دليلاً تشغيلياً لحزمة النشر؛ المرجع التقني والتشغيلي المعتمد والشامل هو [المرجع التشغيلي المعتمد: العمليات والنشر والمراقبة](../docs/domains/OPERATIONS_DEPLOYMENT_MONITORING_RUNTIME_REFERENCE.md).

هذا الدليل يصف ملفات النشر الموجودة في المستودع. لا يعتبر بديلًا عن [دليل التثبيت العام](../docs/installation/INSTALLATION_GUIDE.md)، ولا يحتوي على أسرار أو قيم إنتاج.

## محتويات الحزمة

- `docker-compose.yml`: مسار Compose يضم التطبيق وMySQL، مع Redis وNginx كخيارات معلقة تحتاج تفعيلًا مقصودًا.
- `Dockerfile`: بناء وتشغيل حاوية التطبيق.
- `backup/`: سكربتات النسخ الاحتياطي والتنظيف والرفع.
- `monitoring/`: Prometheus وGrafana وAlertmanager وإعدادات exporters.
- `nginx/`: إعدادات reverse proxy وSSL عند اعتمادها.
- `docs/DOCKER.md`: تفاصيل Docker.
- `docs/MAINTENANCE_GUIDE.md`: إجراءات الصيانة التشغيلية.

## المتطلبات

- Docker Engine وDocker Compose.
- ملف `deploy/.docker.env` محلي غير متعقب، مبني من `deploy/.docker.env.example`.
- قيم MySQL الأساسية: `MYSQL_ROOT_PASSWORD` و`MYSQL_DATABASE` و`MYSQL_USER` و`MYSQL_PASSWORD`.
- `DATABASE_URL` داخل الحاوية يجب أن يستخدم اسم الخدمة `mysql`، مثل:

```env
DATABASE_URL=mysql://bocam_user:your-user-password@mysql:3306/bocam_crm
```

- قيم المصادقة والتكاملات المطلوبة للميزات المستخدمة.

راجع [مصفوفة متغيرات البيئة](../docs/ENVIRONMENT_VARIABLES.md) قبل تعبئة الملف.

## التشغيل

```bash
cp deploy/.docker.env.example deploy/.docker.env
# عدّل القيم الوهمية ولا تحفظ الملف في Git
docker compose --env-file deploy/.docker.env -f deploy/docker-compose.yml up -d --build
```

تحقق من الحالة والسجلات:

```bash
docker compose --env-file deploy/.docker.env -f deploy/docker-compose.yml ps
docker compose --env-file deploy/.docker.env -f deploy/docker-compose.yml logs -f bocam-crm
```

إيقاف الحاويات دون حذف البيانات:

```bash
docker compose --env-file deploy/.docker.env -f deploy/docker-compose.yml down
```

لا تستخدم `down -v` إلا عند قصد حذف volumes وقاعدة البيانات.

## ملاحظات الصحة

- حاوية التطبيق تستمع على المنفذ `3000`.
- Compose النشر يعتمد على MySQL ويستخدم health check خاصًا بالتطبيق.
- Redis اختياري ومعلق في Compose الحالي؛ لا تفترض أنه يعمل إلا بعد تفعيل خدمته وإعداد `REDIS_URL`.
- ملفات الترخيص والمفتاح العام mounted للقراءة وفق Compose الحالي.

## النسخ الاحتياطي والمراقبة

- راجع [دليل النسخ الاحتياطي](./backup/README.md) قبل جدولة أي مهمة.
- راجع [دليل المراقبة](./monitoring/README.md) وإعدادات `monitoring/` قبل الاعتماد الإنتاجي.
- راجع [دليل Docker](./docs/DOCKER.md) و[دليل الصيانة](./docs/MAINTENANCE_GUIDE.md).

## حدود هذا الدليل

لا يثبت هذا الدليل أن قيم الترخيص أو التكاملات أو إعدادات Nginx جاهزة لكل بيئة. يجب اختبار `build` وhealth check والنسخ الاحتياطي والاسترجاع في بيئة آمنة قبل الإنتاج.
