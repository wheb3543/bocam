# دليل التثبيت والتشغيل

**الحالة:** `working`  
**المجال:** Getting Started  
**آخر مراجعة:** 2026-09-11  
**مصادر التحقق:** `package.json`، `scripts/check-env.mjs`، `drizzle.config.ts`، `Dockerfile`، `deploy/docker-compose.yml`

هذا الدليل يشرح مسار تشغيل BOCAM CRM محليًا باستخدام Node وpnpm، ثم يوضح مسار Docker للنشر. لا يحتوي على أسرار حقيقية.

## 1. المتطلبات

- Node.js `>=22.13.0`.
- pnpm `>=10.4.0`، وهو مدير الحزم المعتمد في المشروع.
- MySQL 8+ أو TiDB متوافق مع MySQL.
- Redis اختياري للكاش والطوابير حسب الميزات المستخدمة.
- Docker وDocker Compose اختياريان لمسار الحاويات.

تحقق من الأدوات:

```bash
node --version
pnpm --version
mysql --version
redis-cli --version
```

## 2. التثبيت المحلي باستخدام Node

### 2.1 استنساخ وتثبيت الحزم

```bash
git clone https://github.com/wheb3543/bocam.git
cd bocam
pnpm install
```

لا تحذف `pnpm-lock.yaml` كحل افتراضي؛ عالج سبب فشل التثبيت أولًا وحافظ على lockfile.

### 2.2 إنشاء البيئة

```bash
cp .env.example .env
```

املأ على الأقل المتغيرات التي يفحصها `scripts/check-env.mjs`:

```env
DATABASE_URL=mysql://user:password@localhost:3306/sgh_crm
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=your-app-id
NODE_ENV=development
PORT=3000
```

أضف متغيرات التكاملات فقط عند استخدام Meta أو WhatsApp أو البريد أو التخزين أو Redis. راجع [مصفوفة متغيرات البيئة](../ENVIRONMENT_VARIABLES.md) لمعرفة المستوى والمصدر دون نسخ أسرار حقيقية.

### 2.3 فحص البيئة

```bash
pnpm exec node scripts/check-env.mjs
```

يؤكد هذا الفحص وجود `DATABASE_URL` و`OAUTH_SERVER_URL` و`VITE_APP_ID` فقط. لا يثبت أن قاعدة البيانات أو Redis أو التكاملات الخارجية متاحة.

### 2.4 قاعدة البيانات

أنشئ قاعدة البيانات ثم شغل أحد المسارات التالية:

```bash
# توليد ترحيلات Drizzle وتطبيقها
pnpm db:push

# أو تشغيل الترحيلات الموجودة بعد توليدها
pnpm db:generate
pnpm db:migrate

# فتح Drizzle Studio عند الحاجة
pnpm db:studio
```

`db:push` مناسب للتطوير بعد مراجعة التغيير. استخدم ترحيلات مراجعة ومختبرة للإنتاج، ولا تنفذ أوامر قاعدة بيانات إنتاجية دون نسخة احتياطية وخطة رجوع.

### 2.5 تشغيل التطبيق

```bash
# تطوير مع watch وVite
pnpm dev

# فحص الأنواع
pnpm check

# بناء الإنتاج وتشغيله
pnpm build
pnpm start
```

يستخدم التطوير Vite، بينما يشغل الإنتاج `dist/index.js` ويقدم ملفات العميل المبنية من `dist/public`.

## 3. التشغيل باستخدام Docker Compose للنشر

المسار المعتمد الذي يوفر MySQL هو `deploy/docker-compose.yml`.

### 3.1 إعداد ملف Docker environment

```bash
cp deploy/.docker.env.example deploy/.docker.env
```

عدّل القيم الوهمية، خصوصًا `MYSQL_ROOT_PASSWORD` و`MYSQL_PASSWORD` و`DATABASE_URL`. داخل شبكة Compose يجب أن يشير `DATABASE_URL` إلى اسم الخدمة `mysql`:

```env
DATABASE_URL=mysql://bocam_user:your-user-password@mysql:3306/bocam_crm
```

### 3.2 التشغيل

```bash
docker compose --env-file deploy/.docker.env -f deploy/docker-compose.yml up -d --build
```

الخدمات والمنافذ الأساسية:

- التطبيق: `http://localhost:3000`.
- MySQL: `localhost:3306` من الجهاز المضيف.
- Redis ليس مشغلًا في Compose النشر الحالي؛ فعّله فقط بعد مراجعة إعداداته.

### 3.3 الإيقاف والسجلات

```bash
docker compose --env-file deploy/.docker.env -f deploy/docker-compose.yml ps
docker compose --env-file deploy/.docker.env -f deploy/docker-compose.yml logs -f bocam-crm
docker compose --env-file deploy/.docker.env -f deploy/docker-compose.yml down
```

لا تستخدم `down -v` إلا إذا كنت تقصد حذف volume قاعدة البيانات.

## 4. البناء والإصدار

```bash
pnpm build
pnpm release:client
```

يبني Vite مدخلي العميل `client/index.html` و`client/index-admin.html`، ثم يبني الخادم عبر esbuild. لا تنسخ `dist` المولد إلى المصدر يدويًا.

## 5. استكشاف الأخطاء

### متغير بيئة مفقود

شغل `pnpm exec node scripts/check-env.mjs`، ثم راجع اسم المتغير في [المصفوفة](../ENVIRONMENT_VARIABLES.md). لا تعرض قيمة السر في تقرير الخطأ.

### رفض اتصال قاعدة البيانات

تحقق من `DATABASE_URL`، وأن MySQL يعمل، وأن اسم المضيف هو `mysql` داخل Compose أو `localhost` عند تشغيل Node مباشرة على الجهاز.

### المنفذ 3000 مستخدم

غيّر `PORT` في `.env` أو أوقف العملية التي تستخدم المنفذ:

```bash
lsof -i :3000
```

### فشل Docker health check

تحقق من سجلات `bocam-crm`، وحالة MySQL، وقيمة `DATABASE_URL`. health check التطبيق يستخدم مسار الترخيص الموجود في `deploy/docker-compose.yml`.

### فشل Drizzle

تحقق من صيغة MySQL في `DATABASE_URL` ومن صلاحيات المستخدم، ثم استخدم `pnpm db:generate` و`pnpm db:migrate` في بيئة تطوير آمنة.

## 6. روابط مرتبطة

- [Quick Start](../../QUICK_START.md)
- [مصفوفة متغيرات البيئة](../ENVIRONMENT_VARIABLES.md)
- [دليل Docker](../../deploy/docs/DOCKER.md)
- [دليل النشر](../../deploy/README.md)
- [مرجع الأوامر](../COMMANDS_REFERENCE.md)
