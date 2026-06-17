# دليل المساهمة | Contributing Guide

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 🤝 المساهمة في المشروع

نرحب بجميع المساهمات التي تساعد في تحسين هذا المشروع! سواء كنت ترغب في إصلاح خطأ، إضافة ميزة جديدة، أو تحسين الوثائق، مساهمتك موضع ترحيب.

### 📋 قبل البدء

قبل المساهمة، يرجى:

1. **قراءة الوثائق**: تأكد من قراءة [README.md](README.md) و [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) لفهم المشروع وبنيته
2. **البحث عن المشاكل الموجودة**: تحقق من [Issues](https://github.com/abood22828/sgh-crm-portal/issues) للتأكد من عدم وجود مشكلة مماثلة
3. **فهم معايير الكود**: راجع قسم "معايير الكود" أدناه
4. **إعداد بيئة التطوير**: اتبع تعليمات التثبيت في [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

### 🚀 كيفية المساهمة

#### 1. Fork المستودع

انقر على زر "Fork" في أعلى الصفحة لإنشاء نسخة خاصة بك من المستودع.

#### 2. استنساخ المستودع

```bash
git clone https://github.com/YOUR-USERNAME/sgh-crm-portal.git
cd sgh-crm-portal
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
2. **Search existing issues**: Check [Issues](https://github.com/abood22828/sgh-crm-portal/issues) to ensure there isn't a similar issue
3. **Understand code standards**: Review the "Code Standards" section below
4. **Setup development environment**: Follow installation instructions in [Installation Guide](INSTALLATION_GUIDE.md)

### 🚀 How to Contribute

#### 1. Fork the Repository

Click the "Fork" button at the top of the page to create your own copy of the repository.

#### 2. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/sgh-crm-portal.git
cd sgh-crm-portal
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