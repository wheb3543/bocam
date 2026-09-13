# تقرير جرد وهيكلة وثائق المشروع

**تاريخ الجرد:** 2026-09-11  
**المشروع:** BOCAM CRM  
**النطاق:** كامل المستودع، مع استثناء الملفات المولدة والكاش ومخرجات الاختبارات والبناء

## 1. الملخص التنفيذي

عند تنفيذ الجرد وقبل إنشاء هذا التقرير، كان في المستودع **166 ملف Markdown** قابلًا للمراجعة، منها **128 ملفًا داخل `docs/`** و**23 ملفًا في جذر المشروع**، إضافة إلى وثائق موزعة في `deploy/` و`drizzle/` و`release/` و`.devin/` و`.github/`. بعد إضافة هذا التقرير أصبح العدد الحالي **167 ملف Markdown**، منها **129 داخل `docs/`**.

الوثائق موجودة بكثافة داخل `docs/`، لكن الهيكل الحالي غير متجانس:

- فهرس `docs/README.md` يصف أسماء ومجلدات قديمة لا تطابق كامل الوضع الحالي.
- توجد خطط وتقارير وتدقيقات في جذر المشروع بدلًا من مركز التوثيق.
- توثيق التشغيل والنشر موزع بين `docs/` و`deploy/` و`release/`.
- توجد وثائق تاريخية وأبحاث WhatsApp داخل `docs/archive/`.
- توجد وثائق متشابهة موضوعيًا، خصوصًا الاختبارات والأداء والجودة.
- التقارير المؤقتة والخطط لا تحمل دائمًا حالة واضحة مثل: مرجعي، جاري، مستبدل، أو مؤرشف.

**القرار المقترح:** اعتماد فهرس موحد أولًا، ووسم الوثائق بحالتها، ثم تنفيذ النقل والدمج تدريجيًا بعد تحديث الروابط. لا يُنصح بنقل شامل فوري.

## 2. المنهجية والاستثناءات

تم جرد ملفات Markdown والملفات النصية المرتبطة بالتوثيق في كامل المستودع. استُبعدت:

- `node_modules/`
- `coverage/`
- `test-results/`
- `dist/` و`build/`
- مخرجات البناء داخل `release/dist/`
- `.git/`

تم اعتبار الملف توثيقيًا إذا كان README أو دليلًا أو سياسة أو تقريرًا أو خطة أو تحليلًا أو مرجعًا فنيًا أو توثيق تشغيل/نشر/تكامل.

## 3. الإحصاءات

| النطاق | العدد | الملاحظة |
|---|---:|---|
| كل ملفات Markdown عند الجرد | 166 | قبل إنشاء هذا التقرير |
| كل ملفات Markdown حاليًا | 167 | بعد إضافة هذا التقرير |
| Markdown داخل `docs/` عند الجرد | 128 | المركز الرئيسي الحالي قبل التقرير |
| Markdown داخل `docs/` حاليًا | 129 | بعد إضافة التقرير |
| Markdown في الجذر | 23 | يحتاج إلى تصنيف أو إحالة للفهرس |
| Markdown خارج `docs/` والجذر | 15 | تشغيل، نشر، قواعد، إصدار، ترحيلات |
| الأقسام المباشرة داخل `docs/` | 16 | ملفات مباشرة ومجلدات فرعية |
| ملفات نصية إضافية ذات صلة | 3 | `FIX_SUMMARY.txt` و`DEPLOYMENT.txt` وملف البيئة |

ملفات HTML مثل `client/index.html` و`stats.html` و`release/dist/` ليست وثائق تشغيلية، ولذلك لا تدخل في قائمة الوثائق الأساسية.

## 4. الهيكل الحالي

```text
repository/
├── README.md, CHANGELOG.md, SECURITY.md, ...
├── docs/
│   ├── analysis/ architecture/ api/ archive/
│   ├── development/ guides/ implementation/ installation/
│   ├── introduction/ licensing/ maintenance/ performance/
│   ├── research/ saas/
│   └── README.md
├── deploy/       # توثيق النشر والتشغيل
├── drizzle/      # توثيق الترحيلات
├── .devin/       # قواعد وسير عمل المساعد
├── .github/      # قوالب وموجهات GitHub
└── release/      # وثائق الإصدار والنشر
```

## 5. الجرد التفصيلي داخل `docs/`

### 5.1 ملفات `docs/` المباشرة

```text
ACCESSIBILITY_IMPROVEMENT_REPORT.md
ADMIN_DASHBOARD_INFORMATION_ARCHITECTURE_REPORT.md
CODE_COMPLEXITY_ANALYSIS.md
CODE_DUPLICATION_ANALYSIS.md
COMMANDS_REFERENCE.md
CONTENT_MANAGEMENT_ANALYSIS.md
CONTENT_MANAGEMENT_PROPOSAL.md
CONTENT_MANAGEMENT_README.md
COVERAGE_BASELINE.md
DATABASE_SCHEMA_REVIEW_2026-09.md
DEPENDENCIES_ANALYSIS_REPORT.md
DEPENDENCIES_IMPROVEMENT_PLAN.md
HOMEPAGE_SEED_GUIDE.md
PAGES_SECTIONS_DESIGN.md
PERFORMANCE_ANALYSIS_REPORT.md
PERFORMANCE_IMPROVEMENT_PLAN.md
PHASE_ZERO_DATABASE_BASELINE.md
PROJECT_QUALITY_CURRENT.md
PROJECT_QUALITY_REPORT.md
PROJECT_STATISTICAL_ANALYSIS_2026-09.md
README.md
SCREEN_READER_TESTING_GUIDE.md
TENANT_ONBOARDING_GUIDE.md
TESTING_GUIDE.md
TEST_COVERAGE_FINAL_REPORT.md
TEST_COVERAGE_IMPROVEMENT_PLAN.md
UNUSED_EXPORTS_AUDIT.md
external-platforms-p2-live-activation-guide.md
external-video-transfers-live-activation-guide.md
general-integration-settings.md
inbox-reference-layout-notes.md
inbox-ui-audit-notes.md
live-integration-readiness-audit.md
meta-integration-roadmap.md
meta-p0-live-connection-guide.md
meta-p1-live-activation-guide.md
notification-integration-audit.md
notifications-unified-plan.md
rbac-expansion-analysis-2026-08-27.md
rbac-expansion-analysis-2026-08-28.md
ui-audit-working-notes.md
ui-roadmap-completion-audit.md
ui-update-roadmap.md
```

### 5.2 الأقسام الفرعية

| القسم | العدد | الملفات |
|---|---:|---|
| `docs/analysis/` | 13 | `ANALYSIS_NOTES`, `AUDIT_AND_IMPROVEMENT_PLAN`, `AUDIT_RESULTS`, `COMPONENTS_ANALYSIS_REPORT`, `COMPREHENSIVE_CODE_AUDIT_2026`, `IMPROVEMENT_ANALYSIS`, `PRESENTATION_SUMMARY`, `SYSTEM_REPORT`, `UNUSED_COMPONENTS_VARIABLES_REPORT`, `UNUSED_VARIABLES_DOCUMENTATION`, `WHATSAPP_SERVICES_ANALYSIS_REPORT`, `pages-inventory`, `table-audit-report` |
| `docs/api/` | 6 | `CHANGELOG_WEBHOOK_FIX`, `META_INTEGRATION_GUIDE`, `REST_TRPC_API`, `WEBHOOK_DIAGNOSTICS`, `WEBHOOK_FIX_SUMMARY`, `WHATSAPP_INTEGRATION` |
| `docs/architecture/` | 8 | `ARCHITECTURE`, `CACHING`, `DATABASE_ERD`, `DATABASE_SCHEMA`, `DESIGN_IMPROVEMENTS`, `HOOKS_DOCUMENTATION`, `INTERFACE_UNIFICATION`, `PWA_OFFLINE_ARCHITECTURE` |
| `docs/development/` | 3 | `CODE_STYLE_GUIDELINES`, `CONTRIBUTING`, `TYPESCRIPT_FIX_ROADMAP` |
| `docs/guides/` | 7 | `EXPORT_FEATURE_GUIDE`, `PATIENT_PORTAL_GUIDE`, `QUICK_TEST`, `TESTING_GUIDE`, `TROUBLESHOOTING`, `USAGE_GUIDE`, `WHATSAPP_USER_GUIDE` |
| `docs/implementation/` | 5 | `IMPLEMENTATION_PLAN`, `PHASE_ONE_IMPLEMENTATION`, `PHASE_ZERO_IMPLEMENTATION`, `PHASE_ZERO_SUMMARY`, `PLAN` |
| `docs/installation/` | 2 | `INSTALLATION_GUIDE`, `MOCK_ENVIRONMENT_GUIDE` |
| `docs/introduction/` | 3 | `CODE_OF_CONDUCT`, `DOCUMENTATION_POLICY`, `SECURITY` |
| `docs/licensing/` | 2 | `LICENSE_GUIDE`, `MEDICAL_DATA_SECURITY_COMPLIANCE` |
| `docs/maintenance/` | 1 + 8 | `ESLINT_RULES_TRACKER`، وجميع تقارير `eslint_reports/` الثمانية |
| `docs/performance/` | 3 | `PERFORMANCE_GUIDE`, `PERFORMANCE_OPTIMIZATION`, `PERFORMANCE_REPORT` |
| `docs/research/` | 3 | `external-platforms-p2-sources`, `meta-capabilities-sources`, `meta-p1-publishing-leads-sources` |
| `docs/saas/` | 4 | `SAAS_CHANGES_EXPLANATION`, `SAAS_FIXED_VARIABLE_SERVICES`, `SAAS_SERVICE_ISOLATION`, `SAAS_WORKFLOW_EXPLANATION` |
| `docs/archive/` | 6 + 11 | ستة ملفات أرشيف عامة، و11 ملفًا داخل `whatsapp_research/` |

### 5.3 تفاصيل الأرشيف

```text
docs/archive/
├── IMPROVEMENTS_TODO.md
├── README.old.md
├── SPECIFICATIONS.md
├── TEMPLATE_TABLES_DOCUMENTATION.md
├── VISION_DOCUMENT.md
├── todo.md
├── FIX_SUMMARY.txt
└── whatsapp_research/
    ├── WHATSAPP_NOTIFICATIONS_DOCUMENTATION.md
    ├── WHATSAPP_PAGES_ANALYSIS.md
    ├── WHATSAPP_TEMPLATES_REQUIRED.md
    ├── WHATSAPP_TODO.md
    ├── whatsapp-api-research-findings.md
    ├── whatsapp-business-api-setup-guide.md
    ├── whatsapp-fixes-technical-report.md
    ├── whatsapp-improvements-plan.md
    ├── whatsapp-marketing-messages-requirements.md
    ├── whatsapp-pages-to-review.md
    └── whatsapp-template-categories-analysis.md
```

## 6. الوثائق خارج `docs/`

### 6.1 ملفات الجذر

```text
AGENTS.md
CHANGELOG.md
COMPONENTS.md
CONTENT_MANAGEMENT_AUDIT_REPORT.md
CONTENT_MANAGEMENT_WORKFLOW_ANALYSIS.md
QUICK_START.md
README.md
RESTRUCTURING_PHASE_1_AUDIT.md
RESTRUCTURING_PLAN.md
SECURITY.md
meta-comment-actions-implementation.md
meta-comment-actions-requirements.md
meta-comment-context-update.md
meta-implementation-audit.md
meta-payload-capability-report.md
meta-payload-test-results.md
meta-social-inbox-webhooks.md
social-inbox-validation.md
social-publishing-api-capability-matrix.md
social-publishing-architecture.md
social-publishing-implementation.md
todo.md
unified-social-inbox-research.md
```

### 6.2 النشر والتشغيل

```text
deploy/MAINTENANCE.md
deploy/README.md
deploy/backup/README.md
deploy/docs/DOCKER.md
deploy/docs/MAINTENANCE_GUIDE.md
deploy/monitoring/README.md
deploy/nginx/README.md
release/DEPLOYMENT.txt
```

### 6.3 الترحيلات وقواعد التطوير

```text
drizzle/MIGRATIONS_GUIDE.md
.devin/rules/code-quality-and-eslint.md
.devin/rules/documentation-standards.md
.devin/rules/iso-software-quality.md
.devin/rules/security-and-performance.md
.devin/workflows/review.md
.github/PULL_REQUEST_TEMPLATE.md
.github/prompts/plan-tenantArchitecture.prompt.md
```

### 6.4 ملفات ذات صلة وليست وثائق أساسية

```text
hostinger-env-import.txt
client/index.html
client/index-admin.html
client/public/test-admin.html
stats.html
```

## 7. الهيكل المستهدف المقترح

```text
docs/
├── 00-overview/          # تعريف النظام وخريطة الوثائق
├── 10-getting-started/   # التثبيت والتهيئة والتشغيل المحلي
├── 20-user-guides/       # أدلة المستخدم والميزات
├── 30-architecture/      # المعمارية وقاعدة البيانات وPWA والكاش
├── 40-api/               # REST/tRPC وWebhooks والتكاملات
├── 50-development/       # المساهمة والأسلوب والاختبارات
├── 60-operations/        # النشر وDocker والنسخ الاحتياطي والمراقبة
├── 70-security/          # الأمان والترخيص والامتثال وRBAC
├── 80-project-management/# الخطط وخارطة الطريق ومراحل التنفيذ
├── 90-research/          # الأبحاث والتحليلات غير التشغيلية
├── reports/              # التقارير الدورية المؤرخة
├── archive/              # الوثائق التاريخية فقط
└── README.md             # الفهرس المعتمد الوحيد
```

## 8. المشكلات المكتشفة

### أ. فهرس غير متزامن

`docs/README.md` لا يعكس كل المجلدات والملفات الموجودة حاليًا، ويشير إلى بعض مسارات قديمة. لذلك لا يمكن اعتباره مصدرًا موثوقًا للجرد قبل تحديثه.

### ب. تكرار موضوعي

توجد أدلة اختبار في أكثر من موضع، وتقارير أداء وجودة متجاورة، إضافة إلى عدة وثائق عن WhatsApp وMeta متداخلة في الغرض أو المرحلة.

### ج. خلط المرجعي بالمؤقت

العناوين التي تحتوي `REPORT` أو `AUDIT` أو `PLAN` أو `TODO` أو `ROADMAP` غالبًا ما تمثل وثائق دورية أو عملًا جاريًا، لكنها مختلطة مع أدلة الاستخدام والمراجع النهائية.

### د. انفصال توثيق التشغيل

تعليمات التثبيت والنشر موزعة بين `docs/installation/` و`deploy/` و`release/`، ما قد يؤدي إلى استخدام تعليمات قديمة أو متعارضة.

### هـ. خلط قواعد الأدوات مع توثيق المنتج

`AGENTS.md` و`.devin/` و`.github/prompts/` مهمة للفريق والأدوات، لكنها ليست توثيقًا وظيفيًا للمستخدم أو للنظام.

## 9. خطة التنظيم الموصى بها

1. تحديث `docs/README.md` ليكون فهرسًا مبنيًا على الملفات الفعلية.
2. إضافة بيانات وصفية لكل وثيقة: المالك، الجمهور، النوع، الحالة، تاريخ المراجعة، والبديل إن وجد.
3. وسم الملفات قبل نقلها: `canonical` أو `working` أو `historical` أو `generated` أو `superseded`.
4. تحديد وثيقة مرجعية واحدة لكل موضوع: التثبيت، API، الأمان، الاختبارات، النشر، وWhatsApp.
5. دمج أو ربط الوثائق المتكررة بدل ترك نسخ متنافسة.
6. نقل وثائق الجذر غير القياسية تدريجيًا، مع إبقاء `README.md` و`CHANGELOG.md` و`SECURITY.md` و`LICENSE` في الجذر.
7. توحيد التشغيل والنشر تحت قسم عمليات واحد يربط `docs/installation/` و`deploy/` و`release/`.
8. إبقاء `docs/archive/` للمواد التاريخية مع سبب الأرشفة وتاريخها.
9. إضافة فحص روابط محلية إلى CI بعد تحديث الفهرس.

## 10. الأولويات

| الأولوية | الإجراء | النتيجة |
|---|---|---|
| P0 | إصلاح فهرس `docs/README.md` | نقطة دخول موثوقة |
| P0 | تحديد الوثائق المرجعية للتثبيت وAPI والأمان | تقليل التعارض |
| P1 | وسم التقارير والخطط بالتاريخ والحالة | فصل المرجع عن العمل الجاري |
| P1 | توحيد توثيق النشر والتشغيل | تحسين الإصدار والصيانة |
| P1 | مراجعة أدلة الاختبار والأداء المتكررة | تقليل الازدواجية |
| P2 | نقل وثائق الجذر غير القياسية | اكتشاف أسهل |
| P2 | إضافة تحقق روابط وفهرسة آلية | منع عودة الفوضى |

## 11. تعريف الاكتمال

تكتمل إعادة الهيكلة عندما يحتوي `docs/README.md` على كل الوثائق المرجعية أو يشرح استثناءها، ولا توجد روابط مكسورة، ولكل موضوع تشغيلي وثيقة واحدة معلنة، وكل تقرير مؤرخ وموسوم بالحالة، ويستطيع المطور الجديد الوصول إلى التثبيت والمعمارية وAPI والاختبارات والنشر من الفهرس بسهولة.

هذا التقرير هو جرد وهيكلة، وليس حكمًا على صحة محتوى كل وثيقة. فحص مطابقة التعليمات للكود وحداثة المعلومات يحتاج مراجعة موضوعية لاحقة لكل مجموعة.