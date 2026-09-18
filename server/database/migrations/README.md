# طبقة الترحيلات التأسيسية لقاعدة البيانات (Bootstrap Raw SQL Migrations)

## 📌 نبذة ومعمارية
يحتوي هذا المجلد على ملفات SQL التأسيسية الأولية لقاعدة البيانات والتي تُدار وتُفحص آلياً عبر أدوات الصيانة المستقلة في المنظومة:
- **مشغل الترحيلات التأسيسية:** `scripts/database/run-migrations.mjs`
- **فاحص توافق المخططات التأسيسية:** `scripts/database/check-migration-schema.mjs`

---

## ⚠️ سياسة حوكمة الترحيلات المعمارية (Architectural Governance)

1. **الترحيلات الرسمية المستمرة (Drizzle ORM Migrations):**
   - كافة الترحيلات وتغييرات جداول قاعدة البيانات المستمرة للمنظومة تُدار حصرياً عبر **Drizzle ORM** داخل المجلد الرئيسي:
     [`drizzle/migrations/`](file:///Users/applestore/Documents/GitHub/bocam/drizzle/migrations/)
   - المخططات المعيارية المفككة حسب النطاقات تقع في:
     [`drizzle/schema/`](file:///Users/applestore/Documents/GitHub/bocam/drizzle/schema/)

2. **سياسة الملفات المجمدة (Frozen Migrations):**
   - ملف `add_performance_indexes.sql` مجمد عمداً وفق وثيقة خط الأساس (`PHASE_ZERO_DATABASE_BASELINE.md`)، ويتم تجاوزه صراحةً بواسطة أداة التشغيل الآلي تفادياً لأي تضارب مع فهارس Drizzle الحالية.
