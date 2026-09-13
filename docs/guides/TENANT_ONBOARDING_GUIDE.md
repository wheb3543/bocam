# دليل إعداد tenant جديد

## الهدف

هذا الدليل يشرح كيفية إنشاء عميل جديد داخل المشروع بحيث يعمل كـ tenant مستقل، مع بيانات branding، uploads، DB، وlicense الخاصة به دون التأثير على التطبيق الأساسي أو العملاء الآخرين.

## 1) إنشاء مجلد tenant

أنشئ مجلدًا جديدًا داخل مجلد `tenants/`، مثال:

```bash
mkdir -p tenants/client-abc
```

هيكل المجلد المتوقع:

```text
tenants/
  client-abc/
    .env
    tenant.json
    license.json
    branding/
      config.ts
    database/
    uploads/
```

## 2) تعبئة `tenant.json`

مثال:

```json
{
  "tenantId": "client-abc",
  "clientName": "اسم العميل",
  "clientNameEn": "Client ABC",
  "status": "draft",
  "domain": "clientabc.local",
  "dbName": "bocam_client_abc",
  "licenseType": "trial",
  "createdAt": "2026-09-02T00:00:00.000Z",
  "updatedAt": "2026-09-02T00:00:00.000Z"
}
```

العناصر الأساسية:
- `tenantId`: معرف tenant فريد
- `clientName`: الاسم العربي
- `clientNameEn`: الاسم الإنجليزي
- `status`: حالة العميل (`draft`, `active`, `suspended`, `expired`)
- `domain`: النطاق المقترح للعميل
- `dbName`: اسم قاعدة البيانات الخاص بالعميل
- `licenseType`: نوع الترخيص (`trial`, `basic`, `pro`, ...)

## 3) إعداد `.env` الخاص بالـ tenant

مثال:

```env
TENANT_ID=client-abc
TENANT_NAME=اسم العميل
TENANT_NAME_EN=Client ABC
APP_ENV=development
APP_PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bocam_client_abc
DB_USER=root
DB_PASSWORD=
FILE_UPLOAD_BASE_PATH=./tenants/client-abc/uploads
FILE_UPLOAD_URL=/uploads
LICENSE_PATH=./tenants/client-abc/license.json
BRANDING_PATH=./tenants/client-abc/branding
LOG_LEVEL=info
```

ملاحظات:
- لا تستخدم القيم العامة في الجذر كـ مصدر أساسي في بيئة الإنتاج.
- استخدم `TENANT_ID` و `TENANT_PATH` أو اسم tenant النهائي للتأكد من تحميل المجلد الصحيح.

## 4) إعداد branding

أنشئ ملف:

```ts
export type BrandingConfig = {
  tenantId: string;
  client: {
    nameAr: string;
    nameEn: string;
    sloganAr: string;
    sloganEn: string;
    email: string;
    phone: string;
    addressAr: string;
    addressEn: string;
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  seo: {
    siteTitle: string;
    metaDescription: string;
    logoPath: string;
    faviconPath: string;
  };
};

export const branding: BrandingConfig = {
  tenantId: 'client-abc',
  client: {
    nameAr: 'اسم العميل',
    nameEn: 'Client ABC',
    sloganAr: 'رعاية صحية مميزة',
    sloganEn: 'Exceptional Healthcare',
    email: 'info@clientabc.com',
    phone: '+966500000000',
    addressAr: 'المدينة - الدولة',
    addressEn: 'City - Country',
  },
  theme: {
    primary: '#0F4C81',
    secondary: '#F4C542',
    accent: '#EAF3FF',
    background: '#F8FAFC',
    text: '#1F2937',
  },
  seo: {
    siteTitle: 'اسم العميل',
    metaDescription: 'منصة خدمة العملاء والاختبارات الطبية',
    logoPath: '/tenants/client-abc/branding/logo.svg',
    faviconPath: '/tenants/client-abc/branding/favicon.svg',
  },
};

export default branding;
```

## 5) إعداد الترخيص

ملف `license.json` يجب أن يحتوي على بيانات الترخيص الخاصة بالعميل:

```json
{
  "tenantId": "client-abc",
  "clientName": "اسم العميل",
  "status": "active",
  "expiryDate": "2027-12-31T00:00:00.000Z",
  "features": ["appointments", "offers", "camps", "whatsapp"],
  "key": "<license-key>",
  "hardwareId": "<machine-id>",
  "issuedAt": "2026-09-02T00:00:00.000Z",
  "signature": "<signature>"
}
```

تعتمد لاحقًا عملية التفعيل على `TENANT_ROOT` و `LICENSE_PATH` عند بدء التشغيل.

## 6) إعداد مجلد uploads

أنشئ مجلد `uploads/` داخل tenant، ثم استخدمه فقط لملفات العميل، مثل:
- صور الأطباء
- صور العروض
- ملفات CMS
- مستندات مرفوعة من الإدارة

يتم تعيين المسار الفعلي في runtime عبر:

```env
FILE_UPLOAD_PATH=./tenants/client-abc/uploads
```

## 7) تثبيت tenant أثناء التشغيل

هناك طريقتان شائعتان:

### الطريقة الأولى: عبر متغير البيئة

```bash
TENANT_ID=client-abc pnpm dev
```

### الطريقة الثانية: عبر المسار الصريح

```bash
TENANT_PATH=/absolute/path/to/tenants/client-abc pnpm dev
```

## 8) التحقق بعد الإعداد

بعد إنشاء tenant، تحقق من النقاط التالية:

1. التطبيق يبدأ بدون أخطاء
2. `process.env.TENANT_ID` يطابق العميل الجديد
3. `process.env.COMPANY_NAME` و `COMPANY_ARABIC_NAME` تعكس tenant الحالي
4. صور الشعار وملفات branding تُقرأ من مجلد tenant
5. `FILE_UPLOAD_PATH` يشير إلى `tenants/client-abc/uploads`
6. `LICENSE_PATH` يشير إلى `tenants/client-abc/license.json`
7. `pnpm check` ينجح

## 9) ملاحظة مهمة

لا تعتمد على القيم العامة في الجذر كـ مصدر أساسي للإنتاج. يجب أن تكون قيم tenant هي المصدر الرئيسي، بينما تبقى القيم العالمية كـ fallback فقط أثناء التطوير والاختبار.

## 10) مثال سريع لتهيئة tenant جديد

```bash
mkdir -p tenants/client-abc/branding tenants/client-abc/uploads tenants/client-abc/database
cp tenants/tenant-sgh/tenant.json tenants/client-abc/tenant.json
cp tenants/tenant-sgh/license.json tenants/client-abc/license.json
cp tenants/tenant-sgh/.env tenants/client-abc/.env
```

ثم عدّل القيم داخل ملفات `tenant.json` و `.env` و `branding/config.ts` لتطابق العميل النهائي.
