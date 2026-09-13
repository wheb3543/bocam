# Coverage Baseline

## بيانات الحوكمة والمطابقة

| الحقل | القيمة المعتمدة |
|---|---|
| **الحالة** | `generated` |
| **الجمهور** | مطور، مهندس DevOps، مهندس جودة |
| **المجال** | `testing-quality` (خط أساس قياس التغطية في CI) |
| **المصدر** | `coverage/coverage-final.json`, `scripts/coverage-baseline.mjs` |
| **آخر مراجعة** | 2026-09-13 |
| **المالك** | QA & Core Infrastructure Engineering Team |
| **البديل** | المرجع الأساسي المحدث في [docs/domains/TESTING_QUALITY_RUNTIME_REFERENCE.md](../domains/TESTING_QUALITY_RUNTIME_REFERENCE.md) |

> تم توليد هذا الملف بواسطة `pnpm coverage:baseline` من `coverage/coverage-final.json`.

**آخر قياس مسجل:** 2026-09-07T23:28:33.357Z

## التغطية العامة

| النطاق | Statements | Branches | Functions | Lines | الملفات |
|---|---:|---:|---:|---:|---:|
| المشروع | 32.54% | 1.86% | 32.43% | 32.54% | 190 |
| client | 53.53% | 3.58% | 45.65% | 53.53% | 72 |
| server | 24.54% | 1.29% | 27.61% | 24.54% | 110 |

## المسارات الحرجة

| المسار | Statements | Branches | Functions | Lines | الملفات |
|---|---:|---:|---:|---:|---:|
| License | 62.44% | 1.82% | 82.61% | 62.44% | 3 |
| Role permissions | 51.58% | 0.00% | 50.00% | 51.58% | 1 |
| Authentication and authorization | 26.32% | 11.76% | 9.52% | 26.32% | 1 |
| CMS routers | 6.37% | 0.00% | 4.90% | 6.37% | 6 |
| Admin dashboard | 82.61% | 0.00% | 63.64% | 82.61% | 1 |
| Patient portal | 49.29% | 0.00% | 30.43% | 49.29% | 4 |

تشمل المسارات الحرجة الترخيص، المصادقة والصلاحيات، RBAC، CMS، لوحة الإدارة، وبوابة المريض. يستخدم CI ملف JSON للمقارنة، ويوقف الدمج إذا انخفضت أي نسبة دون تحديث baseline بمراجعة مقصودة.
