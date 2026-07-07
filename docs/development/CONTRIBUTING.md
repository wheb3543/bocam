# دليل المساهمة البرمجية ومعايير التطوير | Contributing & Development Guidelines

الدليل الشامل لكيفية المساهمة وتدفق العمل البرمجي ومعايير مراجعة الكود في مشروع BOCAM.

## 📋 جدول المحتويات
1. [دليل المساهمة والمشاركة العام](#الجزء-1-contributingmd)
2. [معايير التطوير البرمجي واستراتيجية الفروع](#الجزء-2-contributing_guidelinesmd)

---

# الجزء 1: CONTRIBUTING.md

# دليل المساهمة | Contributing Guide

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 🤝 المساهمة في المشروع

نرحب بجميع المساهمات التي تساعد في تحسين هذا المشروع! سواء كنت ترغب في إصلاح خطأ، إضافة ميزة جديدة، أو تحسين الوثائق، مساهمتك موضع ترحيب.

### 📋 قبل البدء

قبل المساهمة، يرجى:

1. **قراءة الوثائق**: تأكد من قراءة [README.md](README.md) و [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) لفهم المشروع وبنيته
2. **البحث عن المشاكل الموجودة**: تحقق من [Issues](https://github.com/wheb3543/bocam/issues) للتأكد من عدم وجود مشكلة مماثلة
3. **فهم معايير الكود**: راجع قسم "معايير الكود" أدناه
4. **إعداد بيئة التطوير**: اتبع تعليمات التثبيت في [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

### 🚀 كيفية المساهمة

#### 1. Fork المستودع

انقر على زر "Fork" في أعلى الصفحة لإنشاء نسخة خاصة بك من المستودع.

#### 2. استنساخ المستودع

```bash
git clone https://github.com/YOUR-USERNAME/bocam.git
cd bocam
```

#### 3. إنشاء فرع جديد

```bash
git checkout -b feature/your-feature-name
# أو
git checkout -b fix/your-fix-name
```

**تسمية الفروع:**
- `feature/` - للميزات الجديدة
- `fix/` - لإصلاح الأخطاء
- `docs/` - لتحديثات الوثائق
- `refactor/` - لإعادة هيكلة الكود
- `test/` - لإضافة أو تحديث الاختبارات
- `chore/` - للمهام الروتينية (تحديث dependencies، إلخ)

#### 4. تثبيت الحزم

```bash
pnpm install
```

#### 5. إجراء التغييرات

قم بإجراء التغييرات المطلوبة مع الالتزام بمعايير الكود:

```bash
# تشغيل وضع التطوير
pnpm dev

# فحص TypeScript
pnpm check

# تنسيق الكود
pnpm format

# تشغيل الاختبارات
pnpm test
```

#### 6. Commit التغييرات

```bash
git add .
git commit -m "نوع: وصف مختصر للتغيير"
```

**أنواع Commits:**
- `feat:` - ميزة جديدة
- `fix:` - إصلاح خطأ
- `docs:` - تحديث الوثائق
- `style:` - تغييرات التنسيق (لا تؤثر على الكود)
- `refactor:` - إعادة هيكلة الكود
- `test:` - إضافة أو تحديث الاختبارات
- `chore:` - تحديثات الصيانة

**أمثلة:**
```bash
git commit -m "feat: إضافة نظام تصدير البيانات إلى PDF"
git commit -m "fix: إصلاح مشكلة عرض التاريخ في جدول المواعيد"
git commit -m "docs: تحديث دليل التثبيت في README"
git commit -m "refactor: تحسين أداء استعلامات قاعدة البيانات"
```

#### 7. Push التغييرات

```bash
git push origin feature/your-feature-name
```

#### 8. إنشاء Pull Request

1. اذهب إلى مستودعك على GitHub
2. انقر على "Compare & pull request"
3. املأ نموذج Pull Request بالتفاصيل التالية:
   - **العنوان**: وصف مختصر وواضح
   - **الوصف**: شرح مفصل للتغييرات
   - **المشاكل المرتبطة**: اذكر رقم Issue إن وجد (مثل: `Fixes #123`)
   - **لقطات الشاشة**: إذا كانت التغييرات تؤثر على الواجهة

### 📝 معايير الكود

#### TypeScript/JavaScript

```typescript
// ✅ جيد - أنواع واضحة، معالجة أخطاء
export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// ❌ سيء - بدون أنواع، بدون معالجة أخطاء
export async function getUserById(id) {
  const db = await getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}
```

**المعايير:**
- استخدم TypeScript دائماً
- عرف الأنواع بوضوح
- استخدم `async/await` للمهام غير المتزامنة
- تعامل مع الأخطاء بشكل صحيح
- استخدم أسماء واضحة ومعبرة

#### React Components

```tsx
// ✅ جيد - أنواع واضحة، فصل المنطق
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'btn',
        variant === 'primary' ? 'btn-primary' : 'btn-secondary'
      )}
    >
      {label}
    </button>
  );
}

// ❌ سيء - بدون أنواع، خلط المنطق بالعرض
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

**المعايير:**
- استخدم TypeScript مع React
- عرف واجهات للمكونات
- استخدم القيم الافتراضية
- فصل المنطق عن العرض (Custom Hooks)
- استخدم `cn()` لدمج فئات Tailwind

#### CSS/Tailwind

```tsx
// ✅ جيد - استخدام Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">العنوان</h2>
</div>

// ❌ سيء - استخدام inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  <h2 style={{ fontSize: '20px' }}>العنوان</h2>
</div>
```

**المعايير:**
- استخدم Tailwind CSS دائماً
- تجنب inline styles
- استخدم مكونات shadcn/ui الجاهزة
- اتبع نظام التصميم (Design System)

#### قاعدة البيانات

```typescript
// ✅ جيد - استخدام Drizzle ORM مع أنواع
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';

export async function updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
  const db = await getDb();
  const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return updated;
}

// ❌ سيء - SQL خام بدون معاملات
export async function updateUser(id: number, data: any) {
  const db = await getDb();
  await db.execute(`UPDATE users SET name = '${data.name}' WHERE id = ${id}`);
}
```

**المعايير:**
- استخدم Drizzle ORM دائماً
- لا تستخدم SQL خام إلا عند الضرورة
- استخدم معاملات معلمية
- عرف أنواع Insert و Select

#### ESLint

**القاعدة:** يجب أن يمر الكود عبر ESLint بدون أخطاء قبل الدمج

**تشغيل ESLint:**
```bash
# فحص جميع الملفات
pnpm lint

# فحص ملف معين
pnpm lint path/to/file.ts

# إصلاح تلقائي للمشاكل القابلة للإصلاح
pnpm lint --fix
```

**القواعد المهمة:**
- **React Hooks Rules**: يجب استدعاء React Hooks في نفس الترتيب في كل render، على مستوى أعلى من المكون
- **preserve-caught-error**: عند re-throwing errors، يجب إضافة `cause` للحفاظ على معلومات الخطأ الأصلي
- **no-explicit-any**: ممنوع استخدام `any` في TypeScript
- **no-unused-vars**: لا يسمح بمتغيرات غير مستخدمة

**أمثلة على حل مشاكل ESLint الشائعة:**

```typescript
// ❌ سيء - React Hook called conditionally
function MyComponent({ data }) {
  if (!data) return <Loader />;

  const processedData = useMemo(() => processData(data), [data]);
  return <div>{processedData}</div>;
}

// ✅ جيد - جميع Hooks على مستوى أعلى
function MyComponent({ data }) {
  const processedData = useMemo(() => processData(data), [data]);

  if (!data) return <Loader />;

  return <div>{processedData}</div>;
}
```

```typescript
// ❌ سيء - فقدان معلومات الخطأ الأصلي
try {
  await someOperation();
} catch (error) {
  throw new Error('Operation failed');
}

// ✅ جيد - الحفاظ على معلومات الخطأ الأصلي
try {
  await someOperation();
} catch (error) {
  throw new Error('Operation failed', { cause: error });
}
```

```typescript
// ❌ سيء - unused eslint-disable directive
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response.data;

// ✅ جيد - استخدام types صحيحة
const data: UserData = response.data;
```

### 🧪 الاختبار

قبل إرسال Pull Request، تأكد من:

- [ ] الكود يعمل بدون أخطاء
- [ ] لا توجد أخطاء TypeScript (`pnpm check`)
- [ ] الكود يتبع معايير Linting (`pnpm lint`)
- [ ] جميع الميزات الموجودة تعمل بشكل صحيح
- [ ] التغييرات متوافقة مع جميع المتصفحات الرئيسية
- [ ] الواجهة متجاوبة على جميع أحجام الشاشات
- [ ] تمت إضافة اختبارات للميزات الجديدة
- [ ] جميع الاختبارات تمر بنجاح (`pnpm test`)

### 📚 أنواع المساهمات

#### 🐛 الإبلاغ عن الأخطاء

عند الإبلاغ عن خطأ، يرجى تضمين:

- **الوصف**: وصف واضح ومختصر للمشكلة
- **خطوات إعادة الإنتاج**: خطوات تفصيلية لإعادة إنتاج المشكلة
- **السلوك المتوقع**: ما كان يجب أن يحدث
- **السلوك الفعلي**: ما حدث بالفعل
- **لقطات الشاشة**: إن أمكن
- **البيئة**: نظام التشغيل، المتصفح، النسخة

#### ✨ اقتراح ميزات جديدة

عند اقتراح ميزة جديدة، يرجى تضمين:

- **الوصف**: وصف واضح للميزة المقترحة
- **المشكلة**: ما المشكلة التي تحلها هذه الميزة؟
- **الحل المقترح**: كيف يمكن تنفيذ هذه الميزة؟
- **البدائل**: هل هناك بدائل أخرى؟
- **أمثلة**: أمثلة من مشاريع أخرى إن وجدت

#### 📖 تحسين الوثائق

- تصحيح الأخطاء الإملائية والنحوية
- إضافة أمثلة وتوضيحات
- تحسين الشرح والتنسيق
- ترجمة الوثائق

#### 🎨 تحسين التصميم

- تحسين تجربة المستخدم (UX)
- تحسين الواجهة (UI)
- تحسين إمكانية الوصول (Accessibility)
- تحسين الأداء

### 🔍 مراجعة الكود

عند مراجعة Pull Requests، نركز على:

- **الوظيفة**: هل الكود يعمل كما هو متوقع？
- **الجودة**: هل الكود نظيف وقابل للصيانة؟
- **الأداء**: هل هناك تأثير على الأداء؟
- **الأمان**: هل هناك ثغرات أمنية محتملة؟
- **التوثيق**: هل الكود موثق بشكل كافٍ؟
- **الاختبار**: هل تمت إضافة اختبارات كافية؟

### 💬 التواصل

- **GitHub Issues**: للإبلاغ عن الأخطاء واقتراح الميزات
- **Pull Requests**: للمساهمة بالكود
- **Email**: abood22828@gmail.com للاستفسارات العامة

### 📜 قواعد السلوك

نتوقع من جميع المساهمين:

- **الاحترام**: احترام جميع المساهمين بغض النظر عن خلفيتهم
- **البناء**: تقديم نقد بناء ومفيد
- **التعاون**: العمل معاً لتحسين المشروع
- **الصبر**: التحلي بالصبر مع المساهمين الجدد

### 🙏 شكراً لمساهمتك!

كل مساهمة، مهما كانت صغيرة، تساعد في تحسين هذا المشروع. شكراً لك على وقتك وجهدك!

---

<a name="english"></a>

## 🤝 Contributing to the Project

We welcome all contributions that help improve this project! Whether you want to fix a bug, add a new feature, or improve documentation, your contribution is welcome.

### 📋 Before You Start

Before contributing, please:

1. **Read the documentation**: Make sure to read [README.md](README.md) and [Installation Guide](INSTALLATION_GUIDE.md) to understand the project and its structure
2. **Search existing issues**: Check [Issues](https://github.com/wheb3543/bocam/issues) to ensure there isn't a similar issue
3. **Understand code standards**: Review the "Code Standards" section below
4. **Setup development environment**: Follow installation instructions in [Installation Guide](INSTALLATION_GUIDE.md)

### 🚀 How to Contribute

#### 1. Fork the Repository

Click the "Fork" button at the top of the page to create your own copy of the repository.

#### 2. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/bocam.git
cd bocam
```

#### 3. Create a New Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

**Branch Naming:**
- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation updates
- `refactor/` - for code refactoring
- `test/` - for adding or updating tests
- `chore/` - for routine tasks (updating dependencies, etc.)

#### 4. Install Dependencies

```bash
pnpm install
```

#### 5. Make Changes

Make the required changes while adhering to code standards:

```bash
# Run development mode
pnpm dev

# Type check
pnpm check

# Format code
pnpm format

# Run tests
pnpm test
```

#### 6. Commit Changes

```bash
git add .
git commit -m "type: brief description of change"
```

**Commit Types:**
- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation update
- `style:` - formatting changes (no code impact)
- `refactor:` - code refactoring
- `test:` - adding or updating tests
- `chore:` - maintenance updates

**Examples:**
```bash
git commit -m "feat: add PDF export system"
git commit -m "fix: fix date display issue in appointments table"
git commit -m "docs: update installation guide in README"
git commit -m "refactor: improve database query performance"
```

#### 7. Push Changes

```bash
git push origin feature/your-feature-name
```

#### 8. Create Pull Request

1. Go to your repository on GitHub
2. Click "Compare & pull request"
3. Fill out the Pull Request form with the following details:
   - **Title**: Brief and clear description
   - **Description**: Detailed explanation of changes
   - **Related Issues**: Mention issue number if exists (e.g., `Fixes #123`)
   - **Screenshots**: If changes affect the UI

### 📝 Code Standards

#### TypeScript/JavaScript

```typescript
// ✅ Good - clear types, error handling
export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// ❌ Bad - no types, no error handling
export async function getUserById(id) {
  const db = await getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}
```

**Standards:**
- Always use TypeScript
- Define types clearly
- Use `async/await` for async operations
- Handle errors properly
- Use clear and expressive names

#### React Components

```tsx
// ✅ Good - clear types, logic separation
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'btn',
        variant === 'primary' ? 'btn-primary' : 'btn-secondary'
      )}
    >
      {label}
    </button>
  );
}

// ❌ Bad - no types, mixing logic with presentation
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

**Standards:**
- Use TypeScript with React
- Define interfaces for components
- Use default values
- Separate logic from presentation (Custom Hooks)
- Use `cn()` to combine Tailwind classes

#### CSS/Tailwind

```tsx
// ✅ Good - using Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
</div>

// ❌ Bad - using inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  <h2 style={{ fontSize: '20px' }}>Title</h2>
</div>
```

**Standards:**
- Always use Tailwind CSS
- Avoid inline styles
- Use shadcn/ui components
- Follow the Design System

#### Database

```typescript
// ✅ Good - using Drizzle ORM with types
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';

export async function updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
  const db = await getDb();
  const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return updated;
}

// ❌ Bad - raw SQL without parameters
export async function updateUser(id: number, data: any) {
  const db = await getDb();
  await db.execute(`UPDATE users SET name = '${data.name}' WHERE id = ${id}`);
}
```

**Standards:**
- Always use Drizzle ORM
- Don't use raw SQL unless necessary
- Use parameterized queries
- Define Insert and Select types

#### ESLint

**Rule:** Code must pass ESLint without errors before merging

**Running ESLint:**
```bash
# Check all files
pnpm lint

# Check specific file
pnpm lint path/to/file.ts

# Auto-fix fixable issues
pnpm lint --fix
```

**Important Rules:**
- **React Hooks Rules**: React Hooks must be called in the same order on every render, at the top level of the component
- **preserve-caught-error**: When re-throwing errors, must add `cause` to preserve original error information
- **no-explicit-any**: Using `any` in TypeScript is prohibited
- **no-unused-vars**: Unused variables are not allowed

**Examples of Solving Common ESLint Issues:**

```typescript
// ❌ Bad - React Hook called conditionally
function MyComponent({ data }) {
  if (!data) return <Loader />;

  const processedData = useMemo(() => processData(data), [data]);
  return <div>{processedData}</div>;
}

// ✅ Good - all Hooks at top level
function MyComponent({ data }) {
  const processedData = useMemo(() => processData(data), [data]);

  if (!data) return <Loader />;

  return <div>{processedData}</div>;
}
```

```typescript
// ❌ Bad - losing original error information
try {
  await someOperation();
} catch (error) {
  throw new Error('Operation failed');
}

// ✅ Good - preserving original error information
try {
  await someOperation();
} catch (error) {
  throw new Error('Operation failed', { cause: error });
}
```

```typescript
// ❌ Bad - unused eslint-disable directive
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response.data;

// ✅ Good - using proper types
const data: UserData = response.data;
```

### 🧪 Testing

Before submitting a Pull Request, make sure:

- [ ] Code works without errors
- [ ] No TypeScript errors (`pnpm check`)
- [ ] Code follows linting standards (`pnpm lint`)
- [ ] All existing features work correctly
- [ ] Changes are compatible with all major browsers
- [ ] UI is responsive on all screen sizes
- [ ] Tests are added for new features
- [ ] All tests pass (`pnpm test`)

### 📚 Types of Contributions

#### 🐛 Reporting Bugs

When reporting a bug, please include:

- **Description**: Clear and concise description of the issue
- **Reproduction Steps**: Detailed steps to reproduce the issue
- **Expected Behavior**: What should have happened
- **Actual Behavior**: What actually happened
- **Screenshots**: If possible
- **Environment**: OS, browser, version

#### ✨ Suggesting New Features

When suggesting a new feature, please include:

- **Description**: Clear description of the proposed feature
- **Problem**: What problem does this feature solve?
- **Proposed Solution**: How can this feature be implemented?
- **Alternatives**: Are there other alternatives?
- **Examples**: Examples from other projects if available

#### 📖 Improving Documentation

- Fix spelling and grammar errors
- Add examples and clarifications
- Improve explanation and formatting
- Translate documentation

#### 🎨 Improving Design

- Improve user experience (UX)
- Improve user interface (UI)
- Improve accessibility
- Improve performance

### 🔍 Code Review

When reviewing Pull Requests, we focus on:

- **Functionality**: Does the code work as expected?
- **Quality**: Is the code clean and maintainable?
- **Performance**: Is there any performance impact?
- **Security**: Are there potential security vulnerabilities?
- **Documentation**: Is the code adequately documented?
- **Testing**: Are there sufficient tests?

### 💬 Communication

- **GitHub Issues**: For reporting bugs and suggesting features
- **Pull Requests**: For code contributions
- **Email**: abood22828@gmail.com for general inquiries

### 📜 Code of Conduct

We expect all contributors to:

- **Respect**: Respect all contributors regardless of their background
- **Constructive**: Provide constructive and helpful criticism
- **Collaborate**: Work together to improve the project
- **Patience**: Be patient with new contributors

### 🙏 Thank You for Your Contribution!

Every contribution, no matter how small, helps improve this project. Thank you for your time and effort!

---

<div align="center">

Made with ❤️ by the Community

</div>

---

# الجزء 2: CONTRIBUTING_GUIDELINES.md

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

  await expect(page).toHaveURL('/admin');
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


---

