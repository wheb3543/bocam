# مصفوفة متغيرات البيئة

**الحالة:** `working`  
**المجال:** Getting Started / Operations  
**آخر مراجعة:** 2026-09-11  
**المصادر:** `scripts/check-env.mjs`، `vite.config.ts`، `drizzle.config.ts`، قوالب `.env*`، واستخدامات `process.env` و`import.meta.env`

هذه المصفوفة تشرح الأسماء والأدوار دون عرض أي قيمة حقيقية. نجاح `pnpm predev` أو `pnpm prestart` لا يعني أن كل التكاملات الاختيارية جاهزة.

## مستويات الإلزام

| المستوى | المعنى |
|---|---|
| `startup-required` | يفشل فحص الإقلاع أو أداة أساسية عند غيابه |
| `database-required` | مطلوب لأوامر Drizzle والاتصال بقاعدة البيانات |
| `feature-optional` | مطلوب فقط عند تفعيل الميزة أو التكامل |
| `build-time` | يستخدمه Vite أثناء بناء العميل |
| `deployment-only` | يستخدمه Docker أو النشر أو المراقبة |
| `internal/auto` | يولده النظام أو يقرأه من tenant/license ولا يضبط يدويًا عادة |

## المتغيرات الأساسية

| المتغير | المستوى | الاستخدام |
|---|---|---|
| `DATABASE_URL` | startup-required / database-required | اتصال MySQL/TiDB للتطبيق وDrizzle |
| `OAUTH_SERVER_URL` | startup-required | خادم OAuth الخلفي |
| `VITE_APP_ID` | startup-required | معرف التطبيق المستخدم في العميل/OAuth |
| `NODE_ENV` | startup-required | `development`, `test`, أو `production` |
| `PORT` | startup-required | منفذ Express، الافتراضي 3000 |
| `JWT_SECRET` | feature-optional | توقيع/حماية الجلسات بحسب المسار المستخدم |
| `VITE_OAUTH_SERVER_URL` | build-time | رابط OAuth الذي يراه العميل |
| `VITE_OAUTH_PORTAL_URL` | build-time | رابط بوابة OAuth التي يراها العميل |
| `VITE_OWNER_OPEN_ID` | build-time | معرف المالك المعروض/المستخدم في العميل عند الحاجة |
| `VITE_OWNER_NAME` | build-time | اسم المالك في العميل عند الحاجة |

## قاعدة البيانات وRedis

| المتغير | المستوى | الاستخدام |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | database-required / deployment-only | قيم منفصلة لقوالب MySQL أو أدوات التشغيل |
| `MYSQL_ROOT_PASSWORD` | deployment-only | إنشاء حاوية MySQL في Compose النشر |
| `MYSQL_DATABASE` | deployment-only | اسم قاعدة MySQL في Compose النشر |
| `MYSQL_USER`, `MYSQL_PASSWORD` | deployment-only | مستخدم قاعدة MySQL في Compose النشر |
| `REDIS_URL` | feature-optional | اتصال Redis للكاش أو الطوابير |
| `REDIS_PASSWORD` | feature-optional / deployment-only | حماية Redis في Compose أو الخدمة الخارجية |

## Meta وWhatsApp

| المتغير | المستوى | الاستخدام |
|---|---|---|
| `META_ACCESS_TOKEN` | feature-optional / secret | اتصال Meta Graph أو CAPI |
| `META_APP_ID`, `META_APP_SECRET` | feature-optional / secret | OAuth أو إدارة تطبيق Meta |
| `META_PIXEL_ID`, `META_TEST_EVENT_CODE` | feature-optional | تتبع Meta من الخادم |
| `VITE_META_PIXEL_ID`, `VITE_META_TEST_EVENT_CODE` | build-time / feature-optional | تتبع Meta من العميل |
| `WHATSAPP_ACCESS_TOKEN` | feature-optional / secret | WhatsApp Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | feature-optional | رقم WhatsApp المرتبط |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | feature-optional | حساب WhatsApp Business |
| `WEBHOOK_VERIFY_TOKEN` | feature-optional / secret | تحقق webhook العام عند استخدامه |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | feature-optional / secret | تحقق WhatsApp وفق المسار الذي يقرأه |
| `WHATSAPP_APP_SECRET` | feature-optional / secret | توقيع/تحقق تطبيق WhatsApp |
| `WHATSAPP_ENCRYPTION_KEY` | feature-optional / secret | حماية بيانات WhatsApp المشفرة |

## التخزين والبريد والرسائل والمراقبة

| المتغير | المستوى | الاستخدام |
|---|---|---|
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` | feature-optional / secret | تخزين S3 |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET_NAME` | feature-optional / secret | تخزين Cloudflare R2 |
| `FILE_UPLOAD_BASE_URL`, `FILE_UPLOAD_PATH` | feature-optional | رفع الملفات والنتائج |
| `EMAIL_SERVICE`, `EMAIL_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME` | feature-optional / secret | البريد الإلكتروني |
| `SMS_SERVICE`, `SMS_API_KEY`, `SMS_API_SECRET`, `SMS_PHONE_NUMBER` | feature-optional / secret | خدمة الرسائل النصية |
| `SENTRY_DSN`, `SENTRY_RELEASE` | deployment-only / feature-optional | المراقبة وتتبع الأخطاء |
| `LOG_LEVEL`, `LOG_FORMAT` | deployment-only | إعداد السجلات |
| `ALLOWED_ORIGINS` | deployment-only | مصادر CORS المسموحة |

## الترخيص وSaaS والهوية

| المتغير | المستوى | الاستخدام |
|---|---|---|
| `LICENSE_DOMAIN`, `LICENSE_HARDWARE_ID`, `LICENSE_PATH` | internal/auto أو deployment-only | التحقق المحلي من الترخيص عند الحاجة |
| `CENTRAL_ACTIVATION_URL`, `CENTRAL_UPDATE_URL` | feature-optional / deployment-only | heartbeat وفحص التحديثات |
| `IDEA_HUB_URL`, `IDEA_HUB_SYSTEM_ID` | deployment-only | خدمات النظام المركزي |
| `TENANT`, `TENANT_ID`, `TENANT_PATH`, `TENANT_ROOT` | deployment-only | اختيار tenant وملفاته |
| `APP_VERSION`, `PROTOCOL_VERSION` | deployment-only | إصدار التطبيق والبروتوكول |
| `SERVER_NAME`, `SERVER_URL`, `SERVICE_NAME`, `PUBLIC_APP_URL`, `BOCAM_PUBLIC_URL` | deployment-only | تعريف الخدمة والروابط العامة |

## وضع المحاكاة

| المتغير | الاستخدام |
|---|---|
| `MOCK_MODE` | تفعيل المحاكاة العامة إذا كان الكود يدعمها |
| `MOCK_WHATSAPP` | محاكاة WhatsApp عند دعم المسار |
| `MOCK_SMS` | محاكاة SMS عند دعم المسار |
| `MOCK_EMAIL` | محاكاة البريد عند دعم المسار |
| `MOCK_META_PIXEL` | محاكاة Meta Pixel عند دعم المسار |
| `MOCK_LOGGING`, `MOCK_LOG_LEVEL` | مستوى سجلات المحاكاة |

> لا تفترض أن وجود المتغير في قالب أو وثيقة يثبت أن كل مسار يستخدمه. عند توثيق تكامل محدد، يجب ربط المتغير بملف المصدر الذي يقرأه.

## قواعد الأمان

- لا تضع قيمًا حقيقية في Git أو Markdown أو لقطات الشاشة.
- استخدم `.env.example` أو `.env.example.quick` كنقطة بداية، ثم أنشئ `.env` محليًا.
- في Docker، استخدم ملف env مخصصًا مثل `deploy/.docker.env` ولا تضعه في المستودع.
- استخدم اسم خدمة `mysql` داخل شبكة Compose، وليس `localhost` من داخل حاوية التطبيق.
- غيّر الأسرار النموذجية قبل أي تشغيل إنتاجي.