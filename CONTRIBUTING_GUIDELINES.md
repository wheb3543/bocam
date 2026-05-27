# دليل المساهمة - BOCAM Project
# Contributing Guidelines - BOCAM Project

**الإصدار:** 1.0  
**التاريخ:** 2026-05-27  
**الحالة:** ساري المفعول - ملزم لجميع المطورين  
**المعايير:** Git Flow, Code Review, Testing Standards

---

## جدول المحتويات

1. نظرة عامة
2. استراتيجية الفروع (Branching Strategy)
3. تدفق العمل (Workflow)
4. معايير Code Review
5. معايير الاختبار
6. التعامل مع Pull Requests
7. حل النزاعات (Resolving Conflicts)
8. Best Practices

---

## 1. نظرة عامة

### 1.1 الرؤية

هذا الدليل يوضح كيفية المساهمة في تطوير مشروع BOCAM بطريقة منظمة وفعالة، مع ضمان جودة الكود ومنع حدوث regressions.

### 1.2 المبادئ الأساسية

- **الجودة أولاً:** لا تضح بالجودة للسرعة
- **الاختبار إلزامي:** كل تغيير يجب أن يكون له اختبار
- **المراجعة إلزامية:** لا دمج بدون code review
- **التوثيق إلزامي:** كل تغيير يجب أن يكون له توثيق
- **التواصل:** التواصل الواضح والفعال

### 1.3 المتطلبات المسبقة

قبل البدء في المساهمة، تأكد من:

- [ ] قراءة `CODE_STYLE_GUIDELINES.md`
- [ ] قراءة `DOCUMENTATION_POLICY.md`
- [ ] فهم البنية المعمارية للمشروع
- [ ] إعداد بيئة التطوير محلياً
- [ ] تشغيل جميع الاختبارات بنجاح

---

## 2. استراتيجية الفروع (Branching Strategy)

### 2.1 Git Flow Strategy

نستخدم Git Flow strategy مع الفروع التالية:

```
main (production)
  ↑
  │
develop (integration)
  ↑
  │
feature/* (new features)
bugfix/* (bug fixes)
hotfix/* (urgent production fixes)
release/* (release preparation)
```

### 2.2 أوصاف الفروع

#### main
- **الاستخدام:** فرع الإنتاج فقط
- **الحماية:** محمي بالكامل
- **من يدمج:** فقط maintainers
- **متى:** بعد release كامل

#### develop
- **الاستخدام:** فرع التطوير والتكامل
- **الحماية:** محمي بالكامل
- **من يدمج:** بعد code review
- **متى:** دمج feature branches بعد المراجعة

#### feature/*
- **الاستخدام:** تطوير ميزات جديدة
- **التسمية:** `feature/description` أو `feature/ticket-id-description`
- **الأصل:** develop
- **المصير:** develop بعد المراجعة
- **الأمثلة:**
  - `feature/license-validation`
  - `feature/123-add-user-management`
  - `feature/whatsapp-integration`

#### bugfix/*
- **الاستخدام:** إصلاح أخطاء
- **التسمية:** `bugfix/description` أو `bugfix/ticket-id-description`
- **الأصل:** develop
- **المصير:** develop بعد المراجعة
- **الأمثلة:**
  - `bugfix/auth-token-expiry`
  - `bugfix/456-memory-leak`

#### hotfix/*
- **الاستخدام:** إصلاحات عاجلة للإنتاج
- **التسمية:** `hotfix/description` أو `hotfix/ticket-id-description`
- **الأصل:** main
- **المصير:** main و develop
- **الأمثلة:**
  - `hotfix/security-vulnerability`
  - `hotfix/789-critical-bug`

#### release/*
- **الاستخدام:** تحضير للإصدار
- **التسمية:** `release/vX.Y.Z`
- **الأصل:** develop
- **المصير:** main و develop
- **الأمثلة:**
  - `release/v1.0.0`
  - `release/v2.1.0`

### 2.3 قواعد الفروع

**✅ المسموح:**
- إنشاء feature branches من develop
- إنشاء bugfix branches من develop
- إنشاء hotfix branches من main
- دمج feature branches إلى develop
- دمج hotfix branches إلى main و develop

**❌ غير المسموح:**
- الدمج المباشر إلى main أو develop
- دمج feature branches مباشرة إلى main
- العمل مباشرة على main أو develop
- push إلى main أو develop بدون permission

---

## 3. تدفق العمل (Workflow)

### 3.1 تدفق عمل الميزة الجديدة

```
1. إنشاء feature branch من develop
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature

2. التطوير والاختبار محلياً
   - كتابة الكود
   - كتابة الاختبارات
   - كتابة التوثيق
   - اختبار محلي شامل

3. Commit التغييرات
   git add .
   git commit -m "feat(feature): add new feature"

4. Push إلى remote
   git push origin feature/new-feature

5. إنشاء Pull Request
   - وصف واضح للتغييرات
   - ربط مع issue
   - request reviewers

6. Code Review
   - reviewers يراجعون الكود
   - طلب التعديلات إذا لزم
   - approve بعد الموافقة

7. دمج إلى develop
   - merge من خلال PR (no direct merge)
   - تحديث develop محلياً
   - حذف feature branch

8. الانتظار لل release
   - develop يجري في CI/CD
   - testing في staging
   - release عند الجاهزية
```

### 3.2 تدفق عمل إصلاح الخطأ

```
1. إنشاء bugfix branch من develop
   git checkout develop
   git pull origin develop
   git checkout -b bugfix/fix-issue

2. إصلاح الخطأ واختباره
   - تحديد السبب الجذري
   - كتابة إصلاح
   - كتابة اختبار regression
   - اختبار محلي شامل

3. Commit و Push
   git add .
   git commit -m "fix(module): fix the issue"
   git push origin bugfix/fix-issue

4. إنشاء Pull Request
   - وصف الخطأ والإصلاح
   - إضافة test cases
   - request reviewers

5. Code Review و Merge
   - نفس تدفق الميزة
```

### 3.3 تدفق عمل Hotfix

```
1. إنشاء hotfix branch من main
   git checkout main
   git pull origin main
   git checkout -b hotfix/urgent-fix

2. إصلاح واختبار
   - إصلاح سريع
   - اختبار شامل
   - لا ميزات جديدة

3. Commit و Push
   git add .
   git commit -m "hotfix: urgent production fix"
   git push origin hotfix/urgent-fix

4. إنشاء Pull Request إلى main
   - وصف عاجل
   - request reviewers (senior maintainers)

5. Merge إلى main و develop
   - merge إلى main أولاً
   - cherry-pick إلى develop
   - bump version numbers
```

### 3.4 قواعد العمل اليومي

**بداية اليوم:**
```bash
# تحديث develop
git checkout develop
git pull origin develop

# إنشاء feature branch جديد أو continuation
git checkout -b feature/working-on-this
```

**نهاية اليوم:**
```bash
# commit التغييرات
git add .
git commit -m "feat(scope): progress on feature"

# push
git push origin feature/working-on-this
```

**عند اكتمال الميزة:**
```bash
# انتهاء العمل
git push origin feature/working-on-this

# إنشاء PR
# (عبر GitHub interface)

# بعد الموافقة، حذف الفرع محلياً
git checkout develop
git branch -D feature/working-on-this
```

---

## 4. معايير Code Review

### 4.1 مبدأ Code Review

**القاعدة:** كل تغيير يجب أن يمر بـ code review قبل الدمج

### 4.2 معايير المراجعة

**Reviewer يتحقق من:**
- [ ] **الوظيفة:** هل الكود يفعل ما يفترض أن يفعل؟
- [ ] **الجودة:** هل الكود نظيف ومنظم؟
- [ ] **الاختبارات:** هل الاختبارات كافية؟
- [ ] **التوثيق:** هل JSDoc مكتمل؟
- [ ] **الأمان:** هل هناك أي ثغرات أمنية؟
- [ ] **الأداء:** هل هناك أي مشاكل أداء؟
- [ ] **Regression:** هل يكسر أي شيء موجود؟
- [ ] **Best Practices:** هل يتبع أفضل الممارسات؟

### 4.3 نموذج Code Review

**✅ ممارسة جيدة:**
```markdown
## Code Review: Feature XYZ

### ✅ الموافقة
الكود يبدو جيداً. بعض تعليقات صغيرة:

### التعليقات

1. **Line 45:** يمكن استخدام `const` بدلاً من `let`
2. **Line 78:** نحتاج JSDoc لهذه الدالة
3. **General:** إضافة المزيد من edge cases في الاختبارات

### التغييرات المطلوبة
- إضافة JSDoc للدوال العامة
- تحسين الاختبارات

### الموافقة بعد التعديل
✅ Approve بعد التعديلات المذكورة
```

### 4.4 التعامل مع الرفض

**إذا تم رفض الكود:**
1. راجع التعليقات بعناية
2. قم بالتعديلات المطلوبة
3. استجب لكل تعليق
4. request review مرة أخرى

**لا ت:**
- تجاهل التعليقات
- push بالقوة بدون موافقة
- اتخاذ الأمور بشكل شخصي

### 4.5 عدد Reviewers

**القاعدة:**
- **تغييرات صغيرة:** 1 reviewer
- **تغييرات متوسطة:** 2 reviewers
- **تغييرات كبيرة:** 2-3 reviewers
- **hotfixes:** 1 senior reviewer

---

## 5. معايير الاختبار

### 5.1 مبدأ الاختبار

**القاعدة:** كل تغيير يجب أن يكون له اختبار

### 5.2 أنواع الاختبارات

#### Unit Tests
- **الهدف:** اختبار دوال/كلاسات معزولة
- **الأدوات:** Vitest, Jest
- **التغطية:** 80% كحد أدنى

**✅ ممارسة جيدة:**
```typescript
describe('UserService.getUserById', () => {
  it('should return user when valid id is provided', async () => {
    // Arrange
    const userId = 1;
    const expectedUser = { id: userId, name: 'John' };
    mockDb.users.findUnique.mockResolvedValue(expectedUser);

    // Act
    const result = await getUserById(userId);

    // Assert
    expect(result).toEqual(expectedUser);
  });

  it('should return null when user does not exist', async () => {
    // Arrange
    const userId = 999;
    mockDb.users.findUnique.mockResolvedValue(null);

    // Act
    const result = await getUserById(userId);

    // Assert
    expect(result).toBeNull();
  });
});
```

#### Integration Tests
- **الهدف:** اختبار تكامل بين modules
- **الأدوات:** Vitest, Supertest
- **التغطية:** 60% كحد أدنى للتكاملات الحرجة

**✅ ممارسة جيدة:**
```typescript
describe('User API Integration', () => {
  it('should create user via API', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword'
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

#### E2E Tests
- **الهدف:** اختبار تدفقات المستخدم الكاملة
- **الأدوات:** Playwright, Cypress
- **التغطية:** Critical user flows فقط

**✅ ممارسة جيدة:**
```typescript
test('user registration flow', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="name"]', 'John Doe');
  await page.fill('[name="email"]', 'john@example.com');
  await page.fill('[name="password"]', 'securePassword');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

### 5.3 قواعد الاختبار

**✅ المسموح:**
- Mock external dependencies
- Use test databases (SQLite in-memory)
- Use test fixtures

**❌ غير المسموح:**
- اختبار external APIs حقيقية
- استخدام production databases
- skip tests بدون سبب واضح

### 5.4 اختبار قبل الدمج

**القاعدة:** تشغيل جميع الاختبارات محلياً قبل commit

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل مع coverage
npm test -- --coverage

# تشغيل tests_changed فقط
npm test -- --changed
```

### 5.5 اختبار Regression

**القاعدة:** إضافة regression test لكل bug fix

```typescript
describe('Regression Tests', () => {
  it('should not allow duplicate emails (regression for #123)', async () => {
    // Create user with email
    await createUser({ email: 'test@example.com' });

    // Try to create another user with same email
    await expect(
      createUser({ email: 'test@example.com' })
    ).rejects.toThrow('Email already exists');
  });
});
```

---

## 6. التعامل مع Pull Requests

### 6.1 إنشاء Pull Request

**القاعدة:** PR يجب أن يكون واضح ومفصل

**Template:**
```markdown
## Title
[type(scope): brief description]

## Description
Detailed description of changes...

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123
Related to #456

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing locally

## Screenshots (if applicable)
[screenshot 1]
[screenshot 2]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### 6.2 مراجعة PR

**القاعدة:** reviewer يجب أن:
- مراجعة الكود بعناية
- إعطاء تعليقات بناءة
- الموافقة أو طلب تغييرات بوضوح
- عدم الموافقة بدون مراجعة كاملة

### 6.3 دمج PR

**القاعدة:**
- بعد الحصول على approvals
- بعد مرور جميع الاختبارات في CI
- بعد حل جميع التعليقات
- use "Squash and merge" للحفاظ على نظافة history

### 6.4 إغلاق PR بعد الدمج

**القاعدة:** بعد الدمج:
1. حذف الفرع من remote (automatic مع squash merge)
2. حذف الفرع من local
3. إغلاق issues المرتبطة
4. update CHANGELOG إذا لزم

---

## 7. حل النزاعات (Resolving Conflicts)

### 7.1 عند حدوث conflict في develop

**الخطوات:**
```bash
# تحديث develop
git checkout develop
git pull origin develop

# العودة إلى feature branch
git checkout feature/my-feature

# Merge develop إلى feature branch
git merge develop

# حل conflicts يدوياً
# editor opens conflicted files

# حل conflicts وحفظ الملفات

# Add حل conflicts
git add .

# Complete merge
git commit -m "conflict: resolve merge conflicts with develop"

# Push
git push origin feature/my-feature
```

### 7.2 حل conflicts الصحيح

**✅ ممارسة جيدة:**
```typescript
// conflict marker
<<<<<<< HEAD
const value = 'original';
=======
const value = 'new';
>>>>>>> feature/my-feature

// الحل الصحيح - فهم السياق
const value = 'correct_value';
```

**❌ ممارسة سيئة:**
```typescript
// اختيار واحد بشكل عشوائي
const value = 'original'; // أو 'new' دون تفكير

// أو ترك conflict markers
<<<<<<< HEAD
const value = 'original';
=======
const value = 'new';
>>>>>>> feature/my-feature
```

### 7.3 اختبار بعد حل Conflicts

**القاعدة:** دائماً اختبار بعد حل conflicts

```bash
# تشغيل جميع الاختبارات
npm test

# اختبار manual للتأكد من عدم كسر شيء
# run application locally
```

---

## 8. Best Practices

### 8.1 Commits الصغيرة والمركزة

**✅ ممارسة جيدة:**
```bash
git commit -m "feat(license): add hardware ID verification"
git commit -m "feat(license): add signature validation"
git commit -m "docs(license): update API documentation"
```

**❌ ممارسة سيئة:**
```bash
# commit واحد ضخم يغير كل شيء
git commit -m "feat: add complete license system"
```

### 8.2 Commits الذرية

**القاعدة:** commits يجب أن تكون atomic (قابلة للتراجع)

**✅ ممارسة جيدة:**
```bash
# كل feature في commit منفصل
git commit -m "feat(auth): add login function"
git commit -m "feat(auth): add logout function"
git commit -m "feat(auth): add password reset"
```

**❌ ممارسة سيئة:**
```bash
# كل شيء في commit واحد
git commit -m "feat: add auth system with login, logout, and reset"
```

### 8.3 Rebase vs Merge

**القاعدة:****
- استخدام **rebase** لتحديث feature branch
- استخدام **merge** فقط للدمج النهائي

**تحديث feature branch:**
```bash
git checkout feature/my-feature
git rebase develop
```

**الدمج النهائي:**
```bash
git checkout develop
git merge feature/my-feature
```

### 8.4 Interactive Rebase

**الاستخدام:** لتنظيف history قبل merge

```bash
# آخر 3 commits
git rebase -i HEAD~3

# يمكن:
# - squash (دمج commits)
# - reword (تعديل رسالة)
# - drop (حذف commit)
# - re-order (ترتيب commits)
```

### 8.5 التحقق قبل Commit

**Checklist:**
- [ ] هل الكود يتبع CODE_STYLE_GUIDELINES.md؟
- [ ] هل التوثيق JSDoc مكتمل؟
- [ ] هل الاختبارات تمر؟
- [ ] هل ESLint لا يوجد أخطاء؟
- [ ] هل Prettier format مطبق؟
- [ ] هل commit message يتبع DOCUMENTATION_POLICY.md؟

### 8.6 Pre-commit Hooks

**القاعدة:** استخدام pre-commit hooks للتحقق الآلي

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{json,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
```

### 8.7 Communication

**القاعدة:** التواصل الواضح والفعال

**في Code Review:**
- كن بناء في تعليقاتك
- وضح "لماذا" وليس فقط "ماذا"
- اقترح بدائل إذا رفضت شيئاً

**في Pull Requests:**
- وضح السياق والتغييرات
- ربط مع issues
- استجب للتعليقات بسرعة

**في Teams/Slack:**
- أعلن عن PRs الكبيرة
- اطلب مراجعة عندما تحتاج
- شارك المعرفة

### 8.8 وقت الاستجابة

**الأوق المستهدفة:**
- **Code Review:** 24 ساعة
- **Response to comments:** 12 ساعة
- **Merge after approval:** 4 ساعات
- **Hotfix response:** 2 ساعة

---

## 9. حالات الطوارئ

### 9.1 Production Down

**الخطوات:**
1. إنشاء hotfix branch من main
2. إصلاح المشكلة بسرعة
3. اختبار محلي شامل
4. إنشاء PR إلى main (high priority)
5. request senior reviewers
6. merge بعد approval فوري
7. نشر فوري

### 9.2 Security Vulnerability

**الخطوات:**
1. لا commit في public repo
2. إصلاح في private branch
3. اختبار شامل
4. إبلاغ maintainers
5. coordinate disclosure
6. patch + release
7. announce security fix

### 9.3 Data Loss Risk

**الخطوات:**
1. توقف جميع العمليات فوراً
2. إنشاء backup فوري
3. تقييم الضرر
4. استعادة من backup إذا لزم
5. مراجعة السبب الجذري
6. implement prevention
7. document learnings

---

## 10. Resources

### 10.1 أدوات مفيدة

- **GitHub Desktop:** UI for Git
- **SourceTree:** GUI for Git operations
- **GitKraken:** Advanced Git client
- **VS Code Git Integration:** Built-in Git support

### 10.2 روابط مفيدة

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

### 10.3 قيادة Git Commands

```bash
# Branching
git branch -a                 # list all branches
git checkout -b feature/name   # create and checkout branch
git branch -d feature/name     # delete local branch
git push origin --delete feature/name  # delete remote branch

# Merging
git merge feature/name         # merge branch
git merge --no-ff feature/name # merge with commit
git rebase develop            # rebase onto develop

# Conflict
git status                    # check conflicts
git diff                      # view conflicts
git add .                     # mark as resolved
git commit                    # complete merge

# History
git log --oneline             # compact history
git log --graph               # visual history
git blame file.ts             # who changed what

# Reset (careful!)
git reset --soft HEAD~1       # undo commit, keep changes
git reset --hard HEAD~1       # undo commit, discard changes
git revert <commit>           # safe undo
```

---

## الخاتمة

هذا الدليل يوضح كيفية المساهمة في مشروع BOCAM بطريقة منظمة وفعالة. الالتزام بهذه الإرشادات يضمن:

- جودة عالية للكود
- workflow منظم وفعال
- تقليل conflicts و regressions
- تحسين collaboration
- نجاح المشروع

**أي مساهمة لا تتبع هذه الإرشادات سيتم رفضها.**

---

## المصافحة

شكراً لمساهمتك في مشروع BOCAM! 🎉

إذا كان لديك أي أسئلة، لا تتردد في التواصل مع maintainers.
