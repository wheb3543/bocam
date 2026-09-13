# التشغيل السريع للمطورين

**الحالة:** `working`  
**آخر مراجعة:** 2026-09-13  
**المصدر التفصيلي:** [دليل التثبيت](./docs/installation/INSTALLATION_GUIDE.md)

## المسار المحلي المختصر

يتطلب المسار المحلي Node.js `>=22.13.0` وpnpm `>=10.4.0` وقاعدة MySQL/TiDB. Redis اختياري.

```bash
git clone https://github.com/wheb3543/bocam.git
cd bocam
pnpm install
cp .env.example .env
pnpm exec node scripts/check-env.mjs
pnpm db:push
pnpm dev
```

افتح `http://localhost:3000`.

## المسارات الرئيسية

- الواجهة العامة: `http://localhost:3000/`
- لوحة الإدارة: `http://localhost:3000/admin`
- دخول الإدارة: `http://localhost:3000/admin-login`
- بوابة المريض: `http://localhost:3000/patient-portal/login`
- Drizzle Studio: شغل `pnpm db:studio` ثم استخدم الرابط الذي تعرضه الأداة.

قد تظهر بوابة `/activation` قبل المسارات الأخرى عندما لا يكون الترخيص المحلي صالحًا. راجع [تعريف النظام](./docs/SYSTEM_DEFINITION.md) و[خريطة المسارات](./docs/SYSTEM_ROUTE_MAP.md).

## مسار Docker

لتشغيل التطبيق مع MySQL عبر Compose النشر:

```bash
cp deploy/.docker.env.example deploy/.docker.env
# عدّل القيم الوهمية في deploy/.docker.env
docker compose --env-file deploy/.docker.env -f deploy/docker-compose.yml up -d --build
```

داخل Compose يجب أن يستخدم `DATABASE_URL` اسم المضيف `mysql`، وليس `localhost`. راجع [دليل التثبيت](./docs/installation/INSTALLATION_GUIDE.md) قبل تشغيل الإنتاج.

## فحوص سريعة

```bash
pnpm docs:check
pnpm check
pnpm build
```

لا تضع أسرارًا حقيقية في ملفات Markdown أو ملفات البيئة النموذجية. راجع [مصفوفة متغيرات البيئة](./docs/ENVIRONMENT_VARIABLES.md).
