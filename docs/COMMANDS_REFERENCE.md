# دليل أوامر المشروع

هذا المستند يحتوي على جميع الأوامر المستخدمة في المشروع مقسمة حسب الوظائف.

## جدول المحتويات

1. [أوامر التثبيت والتبعيات](#أوامر-التثبيت-والتبعيات)
2. [أوامر الفحص والتحقق](#أوامر-الفحص-والتحقق)
3. [أوامر التشغيل والاختبار](#أوامر-التشغيل-والاختبار)
4. [أوامر الترحيل (Migrations)](#أوامر-الترحيل-migrations)
5. [أوامر الرفع والنشر](#أوامر-الرفع-والنشر)
6. [أوامر Git](#أوامر-git)
7. [أوامر Docker](#أوامر-docker)
8. [أوامر أخرى مفيدة](#أوامر-أخرى-مفيدة)

---

## أوامر التثبيت والتبعيات

| الأمر | الوصف | ماذا يقوم به |
|-------|-------|--------------|
| `pnpm install` | تثبيت جميع التبعيات | يقوم بتثبيت جميع الحزم المذكورة في package.json |
| `pnpm add <package>` | إضافة تبعية جديدة | يضيف حزمة جديدة إلى dependencies |
| `pnpm add -D <package>` | إضافة تبعية تطوير | يضيف حزمة جديدة إلى devDependencies |
| `pnpm remove <package>` | إزالة تبعية | يزيل حزمة من المشروع |
| `pnpm update` | تحديث التبعيات | يقوم بتحديث جميع التبعيات إلى أحدث إصدارات متوافقة |
| `pnpm upgrade <package>` | تحديث تبعية محددة | يقوم بتحديث حزمة محددة إلى أحدث إصدار |
| `pnpm install --force` | إعادة تثبيت قسري | يعيد تثبيت جميع التبعيات بالقوة |
| `pnpm approve-builds` | الموافقة على build scripts | يسمح بتنفيذ build scripts للحزم |

---

## أوامر الفحص والتحقق

| الأمر | الوصف | ماذا يقوم به |
|-------|-------|--------------|
| `pnpm check` | فحص شامل للمشروع | يقوم بتشغيل TypeScript و ESLint معاً |
| `pnpm lint` | فحص ESLint | يقوم بفحص الكود باستخدام ESLint |
| `pnpm lint:fix` | إصلاح أخطاء ESLint | يقوم بإصلاح أخطاء ESLint تلقائياً |
| `npx eslint . --ext .js,.jsx,.ts,.tsx` | فحص ESLint يدوي | يقوم بفحص جميع ملفات JS/TS |
| `npx eslint . --ext .js,.jsx,.ts,.tsx --fix` | إصلاح ESLint يدوي | يقوم بإصلاح أخطاء ESLint تلقائياً |
| `npx tsc --noEmit` | فحص TypeScript | يقوم بفحص TypeScript بدون إنشاء ملفات |
| `pnpm type-check` | فحص الأنواع | يقوم بفحص أنواع TypeScript |
| `pnpm format` | تنسيق الكود | يقوم بتنسيق الكود باستخدام Prettier |
| `pnpm format:check` | فحص التنسيق | يقوم بفحص تنسيق الكود بدون تعديله |

---

## أوامر التشغيل والاختبار

| الأمر | الوصف | ماذا يقوم به |
|-------|-------|--------------|
| `pnpm dev` | تشغيل بيئة التطوير | يقوم بتشغيل الخادم في وضع التطوير |
| `pnpm build` | بناء المشروع | يقوم ببناء المشروع للإنتاج |
| `pnpm start` | تشغيل الإنتاج | يقوم بتشغيل المشروع في وضع الإنتاج |
| `pnpm test` | تشغيل الاختبارات | يقوم بتشغيل جميع اختبارات Vitest |
| `pnpm test:watch` | تشغيل الاختبارات بوضع المراقبة | يقوم بتشغيل الاختبارات وإعادة تشغيلها عند التغيير |
| `pnpm test:ui` | واجهة مستخدم للاختبارات | يفتح واجهة Vitest UI |
| `pnpm test:coverage` | تغطية الاختبارات | يقوم بتشغيل الاختبارات مع حساب التغطية |
| `pnpm e2e` | تشغيل اختبارات E2E | يقوم بتشغيل اختبارات Playwright |
| `pnpm e2e:ui` | واجهة مستخدم للاختبارات E2E | يفتح واجهة Playwright UI |
| `pnpm e2e:debug` | تصحيح اختبارات E2E | يقوم بتشغيل اختبارات Playwright في وضع التصحيح |

---

## أوامر الترحيل (Migrations)

| الأمر | الوصف | ماذا يقوم به |
|-------|-------|--------------|
| `pnpm db:generate` | توليد migrations | يقوم بتوليد migrations من Drizzle schema |
| `pnpm db:migrate` | تنفيذ migrations | يقوم بتنفيذ migrations الجديدة |
| `pnpm db:push` | دفع schema إلى قاعدة البيانات | يقوم بمزامنة schema مع قاعدة البيانات مباشرة |
| `pnpm db:studio` | فتح Drizzle Studio | يفتح واجهة Drizzle Studio لإدارة قاعدة البيانات |
| `pnpm db:seed` | بذور البيانات | يقوم بإضافة بيانات أولية لقاعدة البيانات |

---

## أوامر الرفع والنشر

| الأمر | الوصف | ماذا يقوم به |
|-------|-------|--------------|
| `git push` | رفع التغييرات إلى GitHub | يقوم برفع التغييرات إلى الفرع الحالي |
| `git push origin <branch>` | رفع إلى فرع محدد | يقوم برفع التغييرات إلى فرع محدد |
| `git push --tags` | رفع الوسوم | يقوم برفع جميع الوسوم إلى GitHub |
| `pnpm release` | إنشاء إصدار جديد | يقوم بإنشاء إصدار جديد ونشره |
| `pnpm deploy:staging` | نشر إلى Staging | يقوم بنشر المشروع إلى بيئة Staging |
| `pnpm deploy:production` | نشر إلى الإنتاج | يقوم بنشر المشروع إلى بيئة الإنتاج |

---

## أوامر Git

| الأمر | الوصف | ماذا يقوم به |
|-------|-------|--------------|
| `git status` | حالة الملفات | يعرض حالة جميع الملفات في المشروع |
| `git add .` | إضافة جميع الملفات | يقوم بإضافة جميع الملفات المعدلة إلى staging |
| `git add <file>` | إضافة ملف محدد | يقوم بإضافة ملف محدد إلى staging |
| `git commit -m "message"` | إنشاء commit | يقوم بإنشاء commit مع رسالة |
| `git log` | عرض سجل commits | يعرض سجل جميع commits |
| `git log --oneline` | عرض سجل مختصر | يعرض سجل commits بشكل مختصر |
| `git branch` | عرض الفروع | يعرض جميع الفروع المحلية |
| `git branch <name>` | إنشاء فرع جديد | يقوم بإنشاء فرع جديد |
| `git checkout <branch>` | التبديل بين الفروع | يقوم بالتبديل إلى فرع محدد |
| `git checkout -b <name>` | إنشاء والتبديل | يقوم بإنشاء فرع جديد والتبديل إليه |
| `git merge <branch>` | دمج فرع | يقوم بدمج فرع محدد في الفرع الحالي |
| `git pull` | سحب التغييرات | يقوم بسحب التغييرات من GitHub |
| `git pull origin <branch>` | سحب من فرع محدد | يقوم بسحب التغييرات من فرع محدد |
| `git stash` | حفظ التغييرات مؤقتاً | يقوم بحفظ التغييرات الحالية مؤقتاً |
| `git stash pop` | استعادة التغييرات | يقوم باستعادة التغييرات المحفوظة |
| `git reset --hard HEAD` | إعادة تعيين | يقوم بإعادة تعيين جميع التغييرات |

---

## أوامر Docker

| الأمر | الوصف | ماذا يقوم به |
|-------|-------|--------------|
| `docker build -t <name> .` | بناء صورة Docker | يقوم ببناء صورة Docker من Dockerfile |
| `docker run -p <port>:<port> <name>` | تشغيل حاوية | يقوم بتشغيل حاوية Docker |
| `docker ps` | عرض الحاويات النشطة | يعرض جميع الحاويات النشطة |
| `docker ps -a` | عرض جميع الحاويات | يعرض جميع الحاويات النشطة وغير النشطة |
| `docker stop <id>` | إيقاف حاوية | يقوم بإيقاف حاوية محددة |
| `docker start <id>` | تشغيل حاوية | يقوم بتشغيل حاوية محددة |
| `docker rm <id>` | حذف حاوية | يقوم بحذف حاوية محددة |
| `docker rmi <name>` | حذف صورة | يقوم بحذف صورة Docker |
| `docker logs <id>` | عرض سجلات الحاوية | يعرض سجلات حاوية محددة |
| `docker exec -it <id> sh` | الدخول إلى الحاوية | يقوم بالدخول إلى حاوية محددة |

---

## أوامر أخرى مفيدة

| الأمر | الوصف | ماذا يقوم به |
|-------|-------|--------------|
| `pnpm husky install` | تثبيت Git hooks | يقوم بتثبيت Husky Git hooks |
| `pnpm husky add .husky/pre-commit` | إضافة pre-commit hook | يقوم بإضافة pre-commit hook |
| `pnpm lint-staged` | فحص الملفات المعدلة | يقوم بفحص الملفات المعدلة فقط |
| `pnpm peers check` | فحص peer dependencies | يقوم بفحص peer dependencies |
| `npx create-vite@latest` | إنشاء مشروع Vite جديد | يقوم بإنشاء مشروع Vite جديد |
| `npx @playwright/test install` | تثبيت المتصفحات لـ Playwright | يقوم بتثبيت المتصفحات المطلوبة لـ Playwright |
| `npx playwright install` | تثبيت Playwright | يقوم بتثبيت Playwright والمتصفحات |
| `pnpm dlx <package>` | تشغيل حزمة مؤقتاً | يقوم بتشغيل حزمة بدون تثبيتها |
| `node -v` | عرض إصدار Node.js | يعرض إصدار Node.js المثبت |
| `pnpm -v` | عرض إصدار pnpm | يعرض إصدار pnpm المثبت |
| `npm -v` | عرض إصدار npm | يعرض إصدار npm المثبت |

---

## أوامر خاصة بالمشروع

| الأمر | الوصف | ماذا يقوم به |
|-------|-------|--------------|
| `pnpm backup` | إنشاء نسخة احتياطية | يقوم بإنشاء نسخة احتياطية لقاعدة البيانات |
| `pnpm restore` | استعادة نسخة احتياطية | يقوم باستعادة نسخة احتياطية لقاعدة البيانات |
| `pnpm update-check` | فحص التحديثات | يقوم بفحص وجود تحديثات للمشروع |
| `pnpm update:manual` | تحديث يدوي | يقوم بتحديث المشروع يدوياً |
| `pnpm rollback` | التراجع عن التحديث | يقوم بالتراجع عن آخر تحديث |

---

## ملاحظات مهمة

1. **استخدام pnpm**: المشروع يستخدم pnpm كمدير حزم، لذا يجب استخدام أوامر pnpm بدلاً من npm.
2. **Environment Variables**: تأكد من إعداد ملف `.env` قبل تشغيل المشروع.
3. **Git Hooks**: Husky يقوم بتشغيل pre-commit hooks تلقائياً.
4. **Linting**: يتم تشغيل ESLint و Prettier تلقائياً قبل كل commit.
5. **Testing**: يُنصح بتشغيل الاختبارات قبل رفع التغييرات.
6. **Type Checking**: يتم فحص TypeScript تلقائياً أثناء البناء.

---

## سيناريوهات شائعة

### بدء مشروع جديد

```bash
# استنساخ المشروع
git clone <repository-url>
cd bocam

# تثبيت التبعيات
pnpm install

# إعداد environment variables
cp .env.example .env

# تشغيل المشروع
pnpm dev
```

### إضافة ميزة جديدة

```bash
# إنشاء فرع جديد
git checkout -b feature/new-feature

# تطوير الميزة
# ... كود التطوير ...

# فحص الكود
pnpm lint
pnpm test

# إضافة التغييرات
git add .
git commit -m "feat: add new feature"

# رفع التغييرات
git push origin feature/new-feature
```

### إصلاح خطأ

```bash
# إنشاء فرع للإصلاح
git checkout -b fix/bug-name

# إصلاح الخطأ
# ... كود الإصلاح ...

# فحص الكود
pnpm lint
pnpm test

# إضافة التغييرات
git add .
git commit -m "fix: fix bug name"

# رفع التغييرات
git push origin fix/bug-name
```

### النشر إلى الإنتاج

```bash
# التأكد من الفرع الصحيح
git checkout main

# سحب آخر التغييرات
git pull origin main

# بناء المشروع
pnpm build

# تشغيل الاختبارات
pnpm test
pnpm e2e

# النشر
pnpm deploy:production
```

---

## الموارد الإضافية

- [pnpm Documentation](https://pnpm.io/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
