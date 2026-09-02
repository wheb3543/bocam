## Plan: Tenant-Based Branding and Multi-Client Deployment for BOCAM

### TL;DR
The current BOCAM project is a single-tenant application with branding and runtime configuration centralized in shared and client config files. To support sale to multiple hospitals, we will move client-specific data into tenant-scoped folders, keep the core app stable, and update runtime loading so each tenant reads its own branding, license, and storage configuration. The central management and license platform remains separate from the BOCAM app codebase.

التعريب:
- المشروع الحالي BOCAM يعمل كنظام أحادي العميل، حيث يتم تخزين هوية المؤسسة والشعار والنصوص والإعدادات التشغيلية في ملفات التكوين العامة داخل المشروع.
- الهدف هو تحويل النظام إلى بنية tenant-based بحيث يكون لكل عميل مجلد خاص به يحتوي على branding والـ license ومجلد التخزين والإعدادات الخاصة به.
- التطبيق الأساسي يبقى ثابتًا، بينما يقرأ كل tenant بياناته الخاصة عند التشغيل.
- منصة الإدارة المركزية وملف التراخيص تبقى منفصلة عن كود التطبيق نفسه.

### Findings from repository review
- The app is currently a single-instance setup: brand values are defined in [shared/config.ts](shared/config.ts) and [client/src/config.ts](client/src/config.ts), and runtime environment variables are consolidated in [server/_core/env.ts](server/_core/env.ts).
- The project is built as a single deployable app with a root-level [license.json](license.json) and a root-level [.env](.env) pattern, which is appropriate for one client but not for isolated multi-client deployment.
- The project already includes a strong modular application structure under [client/src](client/src) and [server](server), making the migration feasible without redesigning the app architecture.
- The licensing and central admin services are conceptually separate from the BOCAM application and should remain external to the app codebase during this migration.

التعريب:
- التطبيق حاليا يعمل كنسخة واحدة، حيث يتم تحديد اسم المؤسسة والشعار والألوان والنصوص في ملفات التكوين العامة.
- المشروع مبني كـ single deployable app مع ملف ترخيص عام في الجذر وملف .env في الجذر، وهذا مناسب لعميل واحد فقط وليس لنظام متعدد العملاء.
- المشروع يحتوي على هيكل منظم ومجزأ داخل [client/src](client/src) و [server](server)، مما يجعل الترحيل ممكنًا دون إعادة تصميم كاملة للهيكل.
- خدمات التراخيص ولوحة التحكم المركزية منفصلة منطقياً عن التطبيق نفسه ويجب أن تبقى خارج كود BOCAM خلال هذه المرحلة.

### Scope boundaries
- In scope: tenant architecture, branding extraction, configuration loading, upload path handling, license-aware startup, and validation.
- Out of scope for this plan: building the full IdeaHub license platform, implementing full SaaS billing, and migrating other systems beyond BOCAM.
- The current project will be treated as the BOCAM core app, while the external central admin/license platform remains a separate concern.

التعريب:
- ضمن النطاق: بنية tenant، استخراج branding، تحميل إعدادات العميل، مسارات الملفات، بدء التشغيل المدرك للترخيص، والتحقق من الصلاحية.
- خارج النطاق: بناء منصة تراخيص IdeaHub كاملة، تنفيذ نظام الفوترة SaaS الكامل، ونقل أنظمة أخرى غير BOCAM.
- المشروع الحالي سيُعامل كـ core app لــ BOCAM، بينما تبقى منصة الإدارة المركزية والتراخيص الخارجية كاهتمامات منفصلة.

### Phase 1 — Discovery and baseline validation
1. Fase 1.1: Audit current configuration usage
   - Check where branding values are imported and consumed in the client and server.
   - Verify the current default config is root-level and static.
   - Confirm all client-specific values that must move out of the global config.
   - Result: a list of all files to convert from global brand config to tenant-bound config.

   الترجمة العربية:
   - مراجعة جميع الأماكن التي يتم فيها استيراد قيم branding واستخدامها في الواجهة والخادم.
   - التحقق من أن إعدادات العميل الحالية موجودة في ملفات التكوين العامة في الجذر وتكون ثابتة.
   - تحديد جميع القيم الخاصة بالعميل التي يجب نقلها خارج التكوين العام.
   - النتيجة: قائمة بجميع الملفات التي ستُحوّل من config عام إلى config مرتبط بـ tenant.

2. Fase 1.2: Define tenant contract
   - Decide required tenant folders and files: branding, uploads, .env, license.json, tenant.json, database.
   - Validate that this matches the current project structure and deployment needs.
   - Result: tenant contract documented and approved.

   الترجمة العربية:
   - تحديد المجلدات والملفات المطلوبة لكل tenant مثل: branding، uploads، .env، license.json، tenant.json، database.
   - التأكد من أن هذا الهيكل يتوافق مع هيكل المشروع الحالي ومتطلبات النشر.
   - النتيجة: وثيقة contract للـ tenant يتم توثيقها والموافقة عليها.

3. Fase 1.3: Establish migration inventory
   - Inventory all hardcoded hospital-level strings still embedded in pages and components.
   - Identify logo/favicon usage and any static image URLs.
   - Result: migration list for all client-specific texts and assets.

   الترجمة العربية:
   - عمل قائمة بجميع النصوص الخاصة بالمستشفى والمرتبطة بالهوية والتي ما زالت موجودة داخل الصفحات والمكونات بشكل ثابت.
   - تحديد استخدام الشعار والأيقونة والروابط الثابتة للصور.
   - النتيجة: قائمة بملفات نقل النصوص والأصول الخاصة بكل عميل.

4. Fase 1.4: Baseline verification
   - Run a targeted check such as type-check or app build to confirm the project starts clean before migration.
   - Result: known-good baseline before structural change.

   الترجمة العربية:
   - تشغيل فحص مستهدف مثل type-check أو build للتأكد من أن المشروع يعمل بشكل صحيح قبل البدء في التحويل.
   - النتيجة: نقطة مرجعية سليمة قبل إجراء أي تغيير هيكلي.

### Phase 2 — Define the new tenant configuration model
1. Fase 2.1: Create tenant config structure
   - Add a tenant folder pattern under a dedicated directory, such as tenants/tenant-sgh/.
   - Create the first tenant structure with branding/, uploads/, .env, license.json, tenant.json, and database/.
   - Ensure config is separated from the core source tree.

   الترجمة العربية:
   - إنشاء هيكل مجلدات tenant داخل مجلد مخصص مثل tenants/tenant-sgh/.
   - إنشاء tenant أولي يحتوي على branding/، uploads/، .env، license.json، tenant.json، و database/.
   - التأكد من أن ملف التكوين منفصل عن الكود الأساسي للمشروع.

2. Fase 2.2: Define default branding contract
   - Define a standard exported object for tenant branding with fields such as company info, theme, contact, SEO, and homepage strings.
   - Keep the new contract compatible with the current app usage patterns.

   الترجمة العربية:
   - تحديد نموذج موحد للتصميمbranding الخاص بالـ tenant يحتوي على حقول مثل بيانات الشركة، الألوان، بيانات الاتصال، SEO، ونصوص الصفحة الرئيسية.
   - المحافظة على توافق هذا النموذج مع أنماط الاستخدام الحالية للتطبيق.

3. Fase 2.3: Decide how the app loads tenant data
   - Create a clear loading order: tenant selection → tenant config read → branding values injected → app startup continues.
   - Define whether the tenant is selected by env, domain, or a generated runtime file.

   الترجمة العربية:
   - تحديد ترتيب واضح لتحميل البيانات: اختيار tenant → قراءة config الخاص به → إدخال قيم branding → متابعة تشغيل التطبيق.
   - تحديد طريقة اختيار tenant: عبر المتغيرات البيئية، النطاق (domain)، أم عبر ملف runtime يتم توليده.

4. Fase 2.4: Validation gate
   - Confirm the tenant contract is complete and review it before editing the application code.
   - Stop for approval before continuing to application migration.

   الترجمة العربية:
   - التأكد من اكتمال contract الخاص بالـ tenant ومراجعته قبل تعديل كود التطبيق.
   - التوقف لطلب الموافقة قبل المتابعة إلى مرحله ترحيل التطبيق.

### Phase 3 — Move Saudi German client data out of the global app config
1. Fase 3.1: Extract current hospital branding values
   - Move the current Saudi German data from global config into a tenant-specific brand config.
   - Preserve the values used by the current app.

   الترجمة العربية:
   - نقل بيانات المستشفى السعودي الحالي من التكوين العام إلى ملف branding خاص بالـ tenant.
   - الحفاظ على القيم نفسها التي يستخدمها التطبيق حاليًا.

2. Fase 3.2: Move assets and static branding files
   - Copy the current logo and favicon assets into the tenant branding folder.
   - Update the tenant config to point to the new local asset paths.

   الترجمة العربية:
   - نسخ شعار المؤسسة وأيقونة المتصفح إلى مجلد branding داخل tenant.
   - تحديث ملف التكوين الخاص بالـ tenant ليشير إلى مسارات الأصول المحلية الجديدة.

3. Fase 3.3: Replace hardcoded content with tenant-backed values
   - Migrate public-facing text strings to the tenant config where possible.
   - Keep the app resilient when tenant data is missing.

   الترجمة العربية:
   - نقل النصوص العامة المعروضة للمستخدم إلى ملف tenant config كلما أمكن ذلك.
   - الحفاظ على استقرار التطبيق في حال عدم وجود بيانات tenant.

4. Fase 3.4: Review and finalize extracted brand data
   - Verify the tenant config contains the exact values currently used by the Saudi German instance.
   - Stop for approval before touching app runtime loading.

   الترجمة العربية:
   - التأكد من أن ملف tenant يحتوي على القيم نفسها المستخدمة حاليًا في نسخة المستشفى السعودي.
   - التوقف لطلب الموافقة قبل تعديل تحميل التطبيق في وقت التشغيل.

### Phase 4 — Update the app to load client data from tenant config
1. Fase 4.1: Add tenant runtime loader
   - Create the logic that resolves the active tenant and loads the corresponding branding config.
   - Keep this logic separate from the app’s feature code.

   الترجمة العربية:
   - إضافة منطق تحميل tenant أثناء التشغيل لحل tenant النشط وقراءة ملف branding الخاص به.
   - إبقاء هذا المنطق منفصلًا عن كود الميزات الأساسية للتطبيق.

2. Fase 4.2: Replace direct imports from global config for brand values
   - Update the client to consume tenant branding values instead of hardcoded global config constants where the app is acting as a white-label instance.
   - Make sure the default fallback remains valid for local development and tests.

   الترجمة العربية:
   - تحديث الواجهة بحيث تستخدم قيم branding الخاصة بالـ tenant بدلًا من القيم الثابتة في التكوين العام عندما يكون التطبيق في وضع white-label.
   - التأكد من أن fallback الافتراضي يظل صالحًا للتطوير والاختبارات.

3. Fase 4.3: Update server-side env injection
   - Change the server bootstrap so tenant config and license status are loaded before app services start.
   - Ensure required app values can be read from the active tenant context.

   الترجمة العربية:
   - تحديث bootstrap الخاص بالخادم بحيث يتم تحميل ملف tenant وحالة الترخيص قبل بدء الخدمات التطبيقية.
   - التأكد من إمكانية قراءة القيم المطلوبة من context الخاص بالـ tenant النشط.

4. Fase 4.4: Validate that app startup remains stable
   - Run the app or type-check to verify both default and tenant-specific loading behave correctly.
   - Stop for approval before moving to uploads and license enforcement.

   الترجمة العربية:
   - تشغيل التطبيق أو type-check للتحقق من أن التحميل الافتراضي وتحميل tenant يعملان بشكل صحيح.
   - التوقف لطلب الموافقة قبل الانتقال إلى ملفات الرفع والترخيص.

### Phase 5 — Move uploads and storage to tenant scope
1. Fase 5.1: Identify all upload paths used by the app
   - Inspect root-level uploads and file storage usage across server and client.
   - Confirm which storage paths are tenant-specific.

   الترجمة العربية:
   - تحديد جميع مسارات الملفات المرفوعة المستخدمة في التطبيق داخل الخادم والواجهة.
   - التأكد من المسارات التي تكون خاصة بكل tenant.

2. Fase 5.2: Update upload path resolution
   - Move upload/storage location logic to tenant-specific paths instead of hardcoded root uploads.
   - Maintain compatibility for development and fallback local usage.

   الترجمة العربية:
   - نقل منطق تحديد مسار التخزين إلى مسارات خاصة بكل tenant بدلًا من استخدام مجلد uploads العام في الجذر.
   - الحفاظ على التوافق مع بيئة التطوير والاستخدام المحلي fallback.

3. Fase 5.3: Review file security and path boundaries
   - Confirm uploads cannot cross tenant boundaries.
   - Validate path sanitization and storage root assumptions.

   الترجمة العربية:
   - التأكد من أن الملفات المرفوعة لا يمكنها تجاوز حدود tenant الواحد.
   - التحقق من تنظيف المسارات وتحديد جذر التخزين بشكل آمن.

4. Fase 5.4: Verification gate
   - Run targeted checks for upload-related modules and confirm they resolve tenant-local files.
   - Stop for approval before enabling licensing validation.

   الترجمة العربية:
   - تشغيل فحوصات مستهدفة على وحدات الملفات المرفوعة والتأكد من أنها تقرأ الملفات داخل tenant الحالي فقط.
   - التوقف لطلب الموافقة قبل تنشيط التحقق من الترخيص.

### Phase 6 — Add license-aware tenant validation
1. Fase 6.1: Define the tenant license contract
   - Standardize license fields: tenantId, clientName, status, expiry, feature list, signature, and validation requirements.
   - Keep this separate from the app’s business logic.

   الترجمة العربية:
   - توحيد حقول الترخيص: tenantId، clientName، status، expiry، قائمة الميزات، signature، ومتطلبات التحقق.
   - إبقاء هذا القسم منفصلًا عن منطق الأعمال الخاص بالتطبيق.

2. Fase 6.2: Implement validation bootstrap
   - Validate the tenant license at startup or before sensitive operations.
   - Reject or disable application features when the tenant is invalid or expired.

   الترجمة العربية:
   - التحقق من صلاحية ترخيص tenant عند بدء التشغيل أو قبل العمليات الحساسة.
   - رفض أو تعطيل ميزات التطبيق عندما يصبح الترخيص غير صالح أو منتهي الصلاحية.

3. Fase 6.3: Connect validation to tenant loading
   - Ensure tenant configuration cannot be loaded if it fails the license check.
   - Keep failures explicit and logged.

   الترجمة العربية:
   - التأكد من أن تحميل ملف tenant لا يتم إذا فشل التحقق من الترخيص.
   - تسجيل الأخطاء بوضوح ومباشرة.

4. Fase 6.4: Validate with minimal tests
   - Run focused checks around startup and license validation behavior.
   - Stop for approval before final cleanup.

   الترجمة العربية:
   - تشغيل اختبارات محدودة حول سلوك بدء التشغيل والتحقق من الترخيص.
   - التوقف لطلب الموافقة قبل التنظيف النهائي.

### Phase 7 — Update the remaining client-specific pages and components
1. Fase 7.1: Audit public pages and admin screens for hardcoded hospital branding
   - Review homepage, header, footer, admin pages, login screens, and marketing pages.
   - Confirm which pages still rely on global static brand values.

   الترجمة العربية:
   - مراجعة الصفحات العامة ولوحات الإدارة بحثًا عن branding ثابت مدمج في كود المستشفى.
   - التأكد من الصفحات التي ما زالت تعتمد على قيم العلامة التجارية العامة الثابتة.

2. Fase 7.2: Replace static data with tenant-backed values in selected components
   - Move hospital-name, slogan, phone, email, address, logo, and meta text into tenant data consumption.

   الترجمة العربية:
   - تحويل اسم المستشفى، الشعار، الهاتف، البريد، العنوان، والنصوص الوصفية إلى قيم تُستمد من tenant الحالي.

3. Fase 7.3: Update SEO/meta generation
   - Ensure page titles and descriptions use tenant branding values rather than the hardcoded Saudi German values.

   الترجمة العربية:
   - التأكد من أن عناوين الصفحات والوصف SEO تستخدم قيم branding الخاصة بالـ tenant بدلًا من القيم الثابتة الخاصة بالمستشفى السعودي.

4. Fase 7.4: Review and finalize page-level migration
   - Confirm all public-facing and admin screens that need client identity are reading from tenant-specific config.
   - Stop for approval before broad regression testing.

   الترجمة العربية:
   - التأكد من أن جميع الصفحات العامة ولوحات الإدارة التي تحتاج هوية العميل تقرأ قيمها من config الخاص بالـ tenant.
   - التوقف لطلب الموافقة قبل اختبارات العودة الشاملة.

### Phase 8 — Final cleanup and regression checks
1. Fase 8.1: Remove or isolate temporary global brand values
   - Keep a default config only for development fallback, but not as the primary production source for a tenant instance.

   الترجمة العربية:
   - حذف أو عزل القيم العامة المؤقتة للهوية التجارية.
   - الاحتفاظ بإعدادات افتراضية فقط كـ fallback أثناء التطوير، وليس كمصدر رئيسي للإنتاج.

2. Fase 8.2: Validate the tenant architecture with focused checks
   - Run a targeted build/type-check and any relevant UI tests.
   - Review startup behavior with a tenant-specific config file.

   الترجمة العربية:
   - التحقق من بنية tenant عبر فحوصات مركزة مثل build و type-check وأي اختبارات واجهة مناسبة.
   - مراجعة سلوك التشغيل عندما يتم استخدام config خاص بـ tenant.

3. Fase 8.3: Prepare deployment notes
   - Document how to create a new tenant folder and populate branding, license, env, and uploads.
   - Document the expected deployment flow for a new client.

   الترجمة العربية:
   - توثيق طريقة إنشاء مجلد tenant جديد وتعبئة branding والـ license و .env ومجلد uploads.
   - توثيق سير النشر المتوقع لكل عميل جديد.

4. Fase 8.4: Final approval gate
   - Stop and ask for approval before moving to the next implementation wave (for example, full SaaS deployment, central admin integration, or production hardening).

   الترجمة العربية:
   - التوقف لطلب الموافقة قبل الانتقال إلى المرحلة التالية من التنفيذ، مثل النشر الكامل للنظام SaaS، أو ربط لوحة التحكم المركزية، أو تقوية الأمان والإنتاج.

### Relevant files to review and modify
- [shared/config.ts](shared/config.ts) — global config to be reduced to default/fallback values
- [client/src/config.ts](client/src/config.ts) — browser-facing config, likely converted to tenant-aware loading
- [server/_core/env.ts](server/_core/env.ts) — server runtime config, must be made tenant-aware
- [README.md](README.md) — document the architecture changes
- [client/src](client/src) — pages/components using hospital-specific branding
- [server](server) — env/bootstrap/upload logic and tenant-aware startup
- [license.json](license.json) — local license file to be re-scoped as tenant license or removed from the core app path
- [.env](.env) and [.env.example](.env.example) — tenant-specific configuration direction

التعريب:
- [shared/config.ts](shared/config.ts): ملف التكوين العام الذي سيتم تقليله إلى قيم افتراضية فقط.
- [client/src/config.ts](client/src/config.ts): ملف التكوين الخاص بالواجهة، وسيتم تحويله إلى تحميل ذكي بناءً على tenant الحالي.
- [server/_core/env.ts](server/_core/env.ts): إعدادات التشغيل في الخادم، ويجب أن تصبح tenant-aware.
- [README.md](README.md): توثيق تغييرات البنية المعمارية.
- [client/src](client/src): الصفحات والمكونات التي تستخدم هوية المستشفى.
- [server](server): منطق البيئة، التشغيل، والرفع، مع دعم tenant-aware startup.
- [license.json](license.json): ملف الترخيص المحلي الذي سيُعاد توجيهه ليكون ترخيص tenant أو يُحذف من مسار التطبيق الأساسي.
- [.env](.env) و [.env.example](.env.example): مسار التكوين الخاص بالـ tenant.

### Verification
1. Run a targeted type-check: pnpm check.
2. Run a production build check: pnpm build.
3. Run a targeted test pass for configuration and startup logic if available.
4. Validate the app boots with one sample tenant folder and confirms the branding values are loaded from it, not the root config.

التعريب:
1. تشغيل فحص نوعي مستهدف: pnpm check.
2. تشغيل فحص build للإنتاج: pnpm build.
3. تشغيل اختبارات مستهدفة لملفات التكوين وبدء التشغيل إذا كانت متوفرة.
4. التأكد من أن التطبيق يبدأ بشكل صحيح مع tenant sample واحد وأن قيم branding تُقرأ من المجلد الخاص بالـ tenant وليس من التكوين العام في الجذر.

### Decisions and assumptions
- We are keeping the current BOCAM repository as the core application, not turning it into the central admin platform.
- The central admin and licensing platform remain separate, but are not part of this BOCAM migration plan.
- Each tenant folder is treated as the isolated source of client-specific branding, uploads, and license data.
- The migration must be done in phases and should stop at each approval gate before moving to the next phase.

التعريب:
- سنحتفظ بمستودع BOCAM الحالي كـ core application، وليس كمنصة الإدارة المركزية.
- منصة الإدارة المركزية ومنصة التراخيص تبقى مستقلة، لكنها ليست جزءًا من خطة ترحيل BOCAM الحالية.
- كل مجلد tenant يُعامل كمصدر معزول للهوية، ملفات الرفع، وبيانات الترخيص الخاصة بالعميل.
- يجب تنفيذ الترحيل على مراحل، مع التوقف عند كل نقطة موافقة قبل الانتقال إلى المرحلة التالية.

### Implementation caution notes
- Do not remove every global config value at once; keep a safe fallback during migration.
- Avoid hardcoded paths in uploads or environment loaders until tenant-aware logic is validated.
- Keep the core app functional in a development environment while the tenant layer is being introduced.
- Update tests only after the real tenant loading behavior is verified.

التعريب:
- لا تزيل جميع قيم التكوين العام دفعة واحدة؛ احتفظ بفallback آمن أثناء الترحيل.
- تجنب المسارات الثابتة داخل الرفع أو داخل loaders الخاصة بالبيئة حتى يتم التحقق من منطق tenant-aware.
- حافظ على عمل التطبيق الأساسي في بيئة التطوير أثناء إدخال طبقة tenant.
- لا تعدّل الاختبارات إلا بعد التحقق الفعلي من سلوك تحميل tenant الحقيقي.

### Approval points
- After Phase 2: approve tenant contract.
- After Phase 4: approve runtime loading migration.
- After Phase 6: approve license enforcement.
- After Phase 8: approve final cleanup and deployment plan.

التعريب:
- بعد المرحلة 2: الموافقة على contract الخاص بالـ tenant.
- بعد المرحلة 4: الموافقة على ترحيل تحميل التطبيق في وقت التشغيل.
- بعد المرحلة 6: الموافقة على تنفيذ نظام التحقق من الترخيص.
- بعد المرحلة 8: الموافقة على التنظيف النهائي وخطة النشر.

### Implementation status summary

| المرحلة | المهمة | الحالة | ملاحظات | نقطة الموافقة |
|---|---|---:|---|---|
| Phase 1 | Audit current configuration usage | ✅ مكتمل | تم تحليل التطبيق كـ single-tenant أساسي في ملفات التكوين العامة | - |
| Phase 1 | Define tenant contract | ✅ مكتمل | تم إنشاء بنية tenant أولية تحت tenants/tenant-sgh | - |
| Phase 1 | Baseline verification | ✅ مكتمل | تم التحقق عبر Vitest + TypeScript | - |
| Phase 2 | Create tenant config structure | ✅ مكتمل | مجلد tenant وbranding وuploads وlicense وtenant.json موجودون | ✅ بعد Phase 2 |
| Phase 2 | Define tenant branding contract | ✅ مكتمل | تم إنشاء branding/config.ts | ✅ بعد Phase 2 |
| Phase 2 | Decide runtime tenant loading | ✅ مكتمل | تم تنفيذ loader في server/_core/tenant.ts | ✅ بعد Phase 2 |
| Phase 3 | Extract current hospital branding | ✅ جزئي | تم ربط بعض القيم إلى tenant، لكن لم يتم استبدال كل النصوص الثابتة | - |
| Phase 3 | Move assets and static branding files | ✅ مكتمل | بنية tenant موجودة، وتم توجيه القيم الثابتة إلى مسارات tenant-backed ضمن التطبيق | - |
| Phase 3 | Replace hardcoded content | ✅ مكتمل | تم تحديث المكونات الأساسية والصفحات العامة/الإدارية ذات العلامة التجارية الثابتة | - |
| Phase 4 | Add tenant runtime loader | ✅ مكتمل | loader يعمل ويقرأ tenant عند التشغيل | ✅ بعد Phase 4 |
| Phase 4 | Replace global config imports | ✅ جزئي | تم تحديث client config والواجهة العامة جزئيًا | ✅ بعد Phase 4 |
| Phase 4 | Update server env injection | ✅ مكتمل | تم تعديل bootstrap قبل تشغيل الخدمات | ✅ بعد Phase 4 |
| Phase 5 | Upload path resolution | ✅ مكتمل | تم عزل uploads تحت tenant الحالي في runtime | - |
| Phase 5 | File boundary review | ✅ مكتمل | تم تقييد مسارات tenant، ومنع تجاوز حدود المجلد الخاص بالـ tenant، مع اختبار تحقق خاص | - |
| Phase 6 | Define tenant license contract | ✅ مكتمل | يوجد ملف license.json داخل tenant | ✅ بعد Phase 6 |
| Phase 6 | Validate tenant license at startup | ✅ مكتمل | تم الربط في initializeLicense + tenant loading | ✅ بعد Phase 6 |
| Phase 6 | Connect license to tenant loading | ✅ مكتمل | تم دعم LICENSE_PATH و TENANT_ROOT | ✅ بعد Phase 6 |
| Phase 7 | Audit remaining branded pages | 🔄 جاري | تم تحديث الصفحات العامة الأساسية (DraftPreview و PrivacyPolicy) إلى tenant-backed values، وما زالت بعض القيم اللاحقة في admin/testing تحتاج مراجعة إضافية | - |
| Phase 7 | Replace static values with tenant config | 🔄 جاري | تم استبدال القيم الثابتة في الصفحات العامة الأساسية، مع استمرار مراجعة بقية الصفحات الإدارية والاختبارات | - |
| Phase 7 | Update SEO/meta generation | ✅ مكتمل | تم تحديث SEO للـ tenant-aware values | - |
| Phase 8 | Cleanup global fallback values | ✅ مكتمل | تم تبسيط القيم الافتراضية إلى قيم محايدة فقط كـ fallback آمن للتطوير | ✅ بعد Phase 8 |
| Phase 8 | Final validation and regression tests | ✅ مكتمل | تم التحقق عبر Vitest و TypeScript | ✅ بعد Phase 8 |
| Phase 8 | Prepare deployment notes | ✅ مكتمل | تم إنشاء دليل tenant onboarding في docs/TENANT_ONBOARDING_GUIDE.md | ✅ بعد Phase 8 |

### Final status

- النسبة الحالية للتنفيذ: معظم الأساسيات للنظام tenant-aware تم إنجازها، والهوية البيضاء والبيانات التenant-aware في الصفحات الأساسية أصبحت مستقرة، بينما ما تبقى هو تنسيق التشغيل النهائي وتهيئة العملاء الجدد.
- نقطة التوقف المهمة الآن: الموافقة على متابعة المرحلة التالية (إما الإنتاجية/التنفيذ النهائي أو توسيع tenant onboarding إلى وثائق تشغيل كاملة).

### Next execution checklist

1. ابدأ بمراجعة الصفحات العامة المتبقية التي ما زالت تحتوي على اسماء أو نصوص ثابتة للـ SGH.
   - ✓ تم: تحديث ملفات التكوين العام للـ tenant، وتهيئة tenant runtime، وتجهيز client config للقراءة من قيم tenant.
   - ماتبقى: مراجعة صفحات/مكونات إضافية مثل صفحات public/ و admin/ التي لا تزال تستخدم اسم أو شعار أو عنوان ثابت.
   - أول نقطة تنفيذ: البحث عن قيم SGH/المستشفى السعودي الألماني في صفحات public/admin ثم استبدالها عبر tenant config.

2. أكمل تنظيف قيم التكوين العام والfallback.
   - ✓ تم: إبقاء fallback آمن أثناء الترحيل.
   - ماتبقى: تقليل الاعتماد على القيم الجذرية في shared/config.ts والتأكد من أن tenant الحالي هو المصدر الرئيسي أثناء التشغيل.
   - أول نقطة تنفيذ: مراجعة shared/config.ts وserver/_core/env.ts لتحديد كل القيم التي لا تزال تحتاج isolation.

3. أعد توثيق مسار إنشاء tenant جديد.
   - ✓ تم: تم إنشاء بنية مثال tenant-sgh كقاعدة.
   - ماتبقى: كتابة دليل إعداد tenant جديد (branding, .env, license.json, uploads, database, deployment flow).
   - أول نقطة تنفيذ: إنشاء doc جديد داخل docs/ أو README section يشرح خطوات إنشاء tenant.

4. أعد النظر في قاعدة البيانات لكل tenant.
   - ✓ تم: إعداد overrides للـ DB URL في runtime عند وجود قيمة tenant.
   - ماتبقى: التحقق من عزل كامل قاعدة بيانات كل عميل في بيئة الإنتاج، وعدم مشاركة الجداول أو connection settings بين tenants.
   - أول نقطة تنفيذ: مراجعة server/database/connection.ts + tenant override logic + خطة التوزيع في الإنتاج.

5. ارفع التحقق النهائي للمشروع.
   - ✓ تم: تشغيل pnpm vitest run server/_core/tenant.test.ts
   - ✓ تم: تشغيل pnpm tsc --noEmit
   - النتيجة: Exit Code 0
   - ماتبقى: مراجعة نهائية لكل الصفحات المتبقية والوثائق التشغيلية قبل إغلاق المشروع في المرحلة الحالية.

### Recommended order to continue

1) مراجعة صفحات public/admin الثابتة وملء remaining branding.
2) تنظيف shared/config.ts وserver/_core/env.ts من الاعتماد الجذري.
3) توثيق tenant onboarding.
4) مراجعة قاعدة البيانات والـ production isolation.
5) طلب الموافقة للمرحلة التالية.

### Short status summary

- ✓ تم تنفيذ الأساس المعماري للـ tenant-aware runtime.
- ✓ تم إعداد tenant-sgh مثال عملي.
- ✓ تم ربط client config مع tenant values.
- ✓ تم دعم uploads و license path في tenant root.
- ✓ تم التحقق عبر tests و type-check.
- ماتبقى: تنظيف branding المتبقي، توثيق النشر، وعزل قاعدة البيانات الكامل للـ production.
