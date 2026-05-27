# سياسة التوثيق - BOCAM Project
# Documentation Policy - BOCAM Project

**الإصدار:** 1.0  
**التاريخ:** 2026-05-27  
**الحالة:** ساري المفعول - ملزم لجميع المطورين  
**المعايير:** JSDoc, Conventional Commits, API Documentation

---

## جدول المحتويات

1. المبادئ الأساسية
2. توثيق الكود (JSDoc)
3. توثيق الـ API
4. توثيق المشروع
5. رسائل Git Commits (Conventional Commits)
6. تحديث المستندات
7. معايير الجودة
8. أدوات التوثيق

---

## 1. المبادئ الأساسية

### 1.1 مبدأ التوثيق

**"الكود بدون توثيق هو كود غير موجود"**

- كل دالة يجب أن يكون لها توثيق JSDoc
- كل مكون React يجب أن يكون له توثيق
- كل API endpoint يجب أن يكون له توثيق
- كل change مهم يجب أن يكون له مستند توضيحي

### 1.2 متى نوثق؟

**التوثيق إلزامي في الحالات التالية:**
- دوال جديدة
- دوال معدلة بشكل كبير
- مكونات React جديدة
- API endpoints جديدة
- types/interfaces جديدة
- ثوابت عامة جديدة
- أي منطق معقد

**التوثيق اختياري في الحالات التالية:**
- دوال بسيطة جداً (أقل من 5 أسطر)
- دوال helper واضحة من اسمها
- test functions

### 1.3 لغة التوثيق

**القاعدة:** التوثيق باللغة الإنجليزية للكود والتعليقات الفنية

```typescript
/**
 * Validates user data before creating a new user
 * @param data - The user data to validate
 * @returns The validated user data
 * @throws ValidationError when data is invalid
 */
function validateUser(data: UserInput): User {
  // implementation
}
```

**الاستثناء:** التعليقات داخل الكود يمكن أن تكون بالعربية إذا كانت تشرح منطق أعمال معقد (business logic)

```typescript
// تحقق من أن المستخدم لديه الصلاحية للوصول لهذه الميزة
if (!hasPermission(user.role, requiredPermission)) {
  throw new Error('Unauthorized');
}
```

---

## 2. توثيق الكود (JSDoc)

### 2.1 قالب JSDoc الأساسي

**القاعدة:** كل دالة يجب أن يكون لها JSDoc كامل

```typescript
/**
 * Brief description of what the function does
 * 
 * @param paramName - Description of the parameter
 * @param paramType - Type of the parameter (optional if TypeScript is clear)
 * @returns Description of what the function returns
 * @throws {ErrorType} Description of when error is thrown
 * @example
 * ```typescript
 * const result = functionName(arg1, arg2);
 * ```
 */
function functionName(paramName: ParamType): ReturnType {
  // implementation
}
```

### 2.2 توثيق الدوال البسيطة

**✅ ممارسة جيدة:**
```typescript
/**
 * Gets a user by their ID
 * @param id - The user's ID
 * @returns The user object or null if not found
 */
function getUserById(id: number): Promise<User | null> {
  return db.users.findUnique({ where: { id } });
}
```

### 2.3 توثيق الدوال المعقدة

**✅ ممارسة جيدة:**
```typescript
/**
 * Validates and creates a new user in the database
 * 
 * Performs the following validations:
 * - Email format validation
 * - Username uniqueness check
 * - Password strength validation
 * 
 * @param data - The user data to create
 * @param data.name - The user's full name (2-100 characters)
 * @param data.email - The user's email address (must be valid format)
 * @param data.password - The user's password (min 8 characters)
 * @param data.role - The user's role (admin, manager, staff, or viewer)
 * @returns The created user with their ID
 * @throws {ValidationError} when validation fails
 * @throws {DatabaseError} when database operation fails
 * @example
 * ```typescript
 * const user = await createUser({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'securePassword123',
 *   role: 'staff'
 * });
 * ```
 */
async function createUser(data: CreateUserInput): Promise<User> {
  // implementation
}
```

### 2.4 توثيق المكونات (React)

**✅ ممارسة جيدة:**
```typescript
/**
 * UserProfile Component
 * 
 * Displays user profile information including name, email, and role.
 * Supports editing mode for admin users.
 * 
 * @param props - Component props
 * @param props.user - The user object to display
 * @param props.editMode - Whether to show edit controls (default: false)
 * @param props.onUpdate - Callback when user is updated
 * @returns JSX element representing the user profile
 * 
 * @example
 * ```tsx
 * <UserProfile 
 *   user={currentUser} 
 *   editMode={true}
 *   onUpdate={handleUserUpdate}
 * />
 * ```
 */
function UserProfile({ user, editMode = false, onUpdate }: UserProfileProps) {
  // implementation
}
```

### 2.5 توثيق Types و Interfaces

**✅ ممارسة جيدة:**
```typescript
/**
 * Represents a user in the system
 * 
 * @interface User
 * @property {number} id - Unique identifier
 * @property {string} name - User's full name
 * @property {string} email - User's email address (unique)
 * @property {UserRole} role - User's role in the system
 * @property {boolean} isActive - Whether the user account is active
 * @property {Date} createdAt - When the user was created
 * @property {Date} updatedAt - When the user was last updated
 */
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User roles in the system
 * 
 * @type {UserRole}
 * @enum {string}
 * @property {string} admin - Full system access
 * @property {string} manager - Can manage users and content
 * @property {string} staff - Can access assigned features
 * @property {string} viewer - Read-only access
 */
type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';
```

### 2.6 توثيق الثوابت

**✅ ممارسة جيدة:**
```typescript
/**
 * Maximum number of retry attempts for failed API calls
 * 
 * This constant defines how many times the system will retry
 * a failed API call before giving up and throwing an error.
 */
const MAX_RETRY_COUNT = 3;

/**
 * Default timeout for API requests in milliseconds
 * 
 * Can be overridden by setting the API_TIMEOUT environment variable.
 */
const DEFAULT_API_TIMEOUT = 5000;

/**
 * Supported user roles in the system
 * 
 * @constant {ReadonlyArray<string>}
 */
const USER_ROLES = ['admin', 'manager', 'staff', 'viewer'] as const;
```

### 2.7 توثيق الكلاسات

**✅ ممارسة جيدة:**
```typescript
/**
 * LicenseValidator class
 * 
 * Handles validation of license keys and hardware ID verification.
 * Uses RSA-2048 encryption for cryptographic verification.
 * 
 * @class LicenseValidator
 * 
 * @example
 * ```typescript
 * const validator = new LicenseValidator();
 * const isValid = await validator.validate(licenseKey);
 * ```
 */
class LicenseValidator {
  private publicKey: string;
  
  /**
   * Creates a new LicenseValidator instance
   * 
   * @param publicKey - The public key for signature verification
   */
  constructor(publicKey: string) {
    this.publicKey = publicKey;
  }
  
  /**
   * Validates a license key
   * 
   * Performs the following checks:
   * - Signature verification
   * - Hardware ID matching
   * - Expiry date validation
   * 
   * @param licenseKey - The base64-encoded license key
   * @returns Validation result with license information
   * @throws {LicenseError} when validation fails
   */
  async validate(licenseKey: string): Promise<LicenseInfo> {
    // implementation
  }
}
```

---

## 3. توثيق الـ API

### 3.1 توثيق tRPC Routers

**✅ ممارسة جيدة:**
```typescript
/**
 * User Router
 * 
 * Provides endpoints for user management operations including:
 * - Creating users
 * - Reading user information
 * - Updating user data
 * - Deleting users
 * 
 * @module userRouter
 */
export const userRouter = router({
  /**
   * Get user by ID
   * 
   * @route getUser
   * @param input.id - The user ID to fetch
   * @returns The user object
   * @throws {TRPCError} when user not found (NOT_FOUND)
   * @example
   * ```typescript
   * const user = await trpc.user.getUser.query({ id: 1 });
   * ```
   */
  getUser: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await getUserById(input.id);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }
      return user;
    }),
  
  /**
   * Create a new user
   * 
   * @route createUser
   * @param input - User creation data
   * @returns The created user with ID
   * @throws {TRPCError} when validation fails (BAD_REQUEST)
   * @throws {TRPCError} when user already exists (CONFLICT)
   * @example
   * ```typescript
   * const user = await trpc.user.createUser.mutate({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   password: 'securePassword',
   *   role: 'staff'
   * });
   * ```
   */
  createUser: protectedProcedure
    .input CreateUserSchema)
    .mutation(async ({ input }) => {
      // implementation
    })
});
```

### 3.2 توثيق Express Routes

**✅ ممارسة جيدة:**
```typescript
/**
 * License API Routes
 * 
 * @module routes/license
 * @description Provides endpoints for license validation and management
 */

/**
 * GET /api/license/info
 * 
 * Returns current license information including:
 * - Hardware ID
 * - Expiry date
 * - Enabled features
 * - Validation status
 * 
 * @returns {LicenseInfo} License information object
 * @throws {500} When license file cannot be read
 * @example
 * ```bash
 * curl http://localhost:3000/api/license/info
 * ```
 */
router.get('/info', async (req, res) => {
  try {
    const license = await validateLicense();
    res.json(license);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read license' });
  }
});

/**
 * POST /api/license/validate
 * 
 * Validates a license key without installing it
 * 
 * @param body.licenseKey - The license key to validate
 * @returns {ValidationResult} Validation result
 * @throws {400} When license key is invalid
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/license/validate \
 *   -H "Content-Type: application/json" \
 *   -d '{"licenseKey": "..."}'
 * ```
 */
router.post('/validate', async (req, res) => {
  // implementation
});
```

---

## 4. توثيق المشروع

### 4.1 ملف README.md

**القاعدة:** README.md يجب أن يحتوي على:

1. **وصف المشروع:** ماذا يفعل المشروع ولمن
2. **الميزات الرئيسية:** قائمة بالميزات
3. **التقنيات المستخدمة:** stack تقني
4. **التثبيت:** خطوات التثبيت
5. **التشغيل:** كيفية تشغيل المشروع
6. **التكوين:** متغيرات البيئة المطلوبة
7. **الهيكل:** وصف هيكل المشروع
8. **التطوير:** كيفية المساهمة
9. **الترخيص:** نوع الترخيص

### 4.2 مستندات docs/

**القاعدة:** إنشاء مستندات توضيحية لكل جزء رئيسي:

```
docs/
├── ARCHITECTURE.md          # البنية المعمارية
├── API_DOCUMENTATION.md    # توثيق الـ API
├── DATABASE_SCHEMA.md      # schema قاعدة البيانات
├── DEPLOYMENT_GUIDE.md     # دليل النشر
├── CONTRIBUTING_GUIDE.md   # كيفية المساهمة
├── CODE_STYLE_GUIDELINES.md # قواعد الكود
├── DOCUMENTATION_POLICY.md # سياسة التوثيق (هذا الملف)
└── CHANGELOG.md            # سجل التغييرات
```

### 4.3 توثيق التغييرات الكبيرة

**القاعدة:** أي تغيير كبير يجب أن يكون له مستند توضيحي

**التغييرات الكبيرة تشمل:**
- إضافة ميزة جديدة كبيرة
- تغيير في البنية المعمارية
- تغيير في قاعدة البيانات
- إعادة كتابة module كبير

**مثال: docs/FEATURE-NEW-LICENSE-SYSTEM.md**
```markdown
# نظام الترخيص الجديد

## نظرة عامة
شرح النظام الجديد...

## التغييرات
- إضافة LicenseValidator class
- إضافة endpoints جديدة
- تغيير في عملية بدء السيرفر

## الهجرة
خطوات الهجرة من النظام القديم...

## التوافق
ما الذي يتأثر...

## الاختبار
كيفية اختبار النظام الجديد...
```

---

## 5. رسائل Git Commits (Conventional Commits)

### 5.1 صيغة Conventional Commits

**القاعدة:** استخدام Conventional Commits specification

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 5.2 أنواع Commits المسموحة

**Types:**
- `feat`: ميزة جديدة
- `fix`: إصلاح خطأ
- `docs`: تغيير في التوثيق فقط
- `style`: تغيير في التنسيق (semicolons, spacing, etc)
- `refactor`: إعادة كتابة كود بدون تغيير في الوظيفة
- `perf`: تحسين الأداء
- `test`: إضافة أو تعديل اختبارات
- `build`: تغيير في build system أو dependencies
- `ci`: تغيير في CI configuration
- `chore`: مهام أخرى (update dependencies, etc)

### 5.3 أمثلة صحيحة

**✅ ممارسات جيدة:**
```bash
feat(license): add cryptographic license validation
- Add LicenseValidator class
- Add hardware ID verification
- Add signature verification using RSA-2048
- Add license validation endpoint

fix(auth): resolve JWT token expiration issue
- Fix token validation logic
- Add proper error handling
- Update token refresh mechanism

docs(readme): update installation instructions
- Add Node.js version requirement
- Add database setup steps
- Fix broken links

refactor(user-service): simplify user creation logic
- Extract validation to separate function
- Improve error handling
- Add unit tests
```

### 5.4 أمثلة خاطئة

**❌ ممارسات سيئة:**
```bash
# Subject line طويل جداً
feat(license): add a new cryptographic license validation system that uses RSA-2048 encryption and validates hardware ID before allowing system startup

# Subject line غير واضح
fix: fixed it

# لا يوجد type
updated the user service

# Subject line يبدأ بحرف كبير
Feat(license): Add license validation

# لا يوجد scope
feat: add license validation
```

### 5.5 Body و Footer

**Body:**
```bash
feat(license): add cryptographic license validation

Add comprehensive license validation system with:
- Hardware ID verification using MAC address
- Digital signature verification using RSA-2048
- Expiry date checking
- Feature flag validation

The validation runs at server startup and prevents
the system from starting if the license is invalid.
```

**Footer:**
```bash
feat(license): add cryptographic license validation

Body...

Closes #123
Breaking change: System will not start without valid license
```

### 5.6 Commit Message Template

**القاعدة:** استخدام template لضمان الاتساق

```bash
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
# Scope: license, auth, user, database, api, ui, etc
# Subject: Short description (max 50 chars)
# Body: Detailed description (what and why, not how)
# Footer: Issue references, breaking changes
```

---

## 6. تحديث المستندات

### 6.1 متى نحدث المستندات؟

**التحديث إلزامي في الحالات التالية:**
- إضافة ميزة جديدة → تحديث README.md
- تغيير في API → تحديث API_DOCUMENTATION.md
- تغيير في قاعدة البيانات → تحديث DATABASE_SCHEMA.md
- تغيير في البنية المعمارية → تحديث ARCHITECTURE.md
- تغيير كبير في المشروع → إنشاء مستند جديد

### 6.2 كيفية التحديث

**القاعدة:** تحديث التوثيق مع الكود في نفس commit

**✅ ممارسة جيدة:**
```bash
# إضافة ميزة جديدة + تحديث README
git add src/license-validator.ts README.md
git commit -m "feat(license): add license validation

Add LicenseValidator class for cryptographic license validation.

Updates:
- Add license validator module
- Update README with new feature
- Add API documentation

Closes #123"
```

**❌ ممارسة سيئة:**
```bash
# إضافة الميزة في commit واحد
git commit -m "feat(license): add license validation"

# تحديث التوثيق في commit آخر
git add README.md
git commit -m "docs: update readme"
```

### 6.3 مراجعة التوثيق

**القاعدة:** مراجعة التوثيق في Code Review

**Checklist:**
- [ ] هل التوثيق JSDoc موجود ومكتمل؟
- [ ] هل أمثلة الاستخدام صحيحة؟
- [ ] هل README.md محدث؟
- [ ] هل API documentation محدث؟
- [ ] هل CHANGELOG.md محدث (للتغييرات الكبيرة)؟

---

## 7. معايير الجودة

### 7.1 معايير جودة التوثيق

**التوثيق يجب أن يكون:**
- **دقيق:** يصف الكود بدقة
- **مكتمل:** يغطي جميع الجوانب المهمة
- **محديث:** يُحدث مع كل تغيير
- **قابل للفهم:** سهل القراءة والفهم
- **عملي:** يحتوي على أمثلة عملية

### 7.2 معايير JSDoc

**كل دالة يجب أن تحتوي على:**
- [ ] وصف موجز (single line)
- [ ] وصف مفصل (optional للدوال المعقدة)
- [ ] توثيق جميع المعاملات (@param)
- [ ] توثيق القيمة المرجعة (@returns)
- [ ] توثيق الأخطاء (@throws) إذا كانت تنطقي خطأ
- [ ] أمثلة الاستخدام (@example) للدوال العامة

### 7.3 معايير Git Commits

**كل commit يجب أن:**
- [ ] يتبع Conventional Commits
- [ ] له subject line واضح وموجز
- [ ] له body يشرح "ماذا" و "لماذا"
- [ ] له footer إذا كان يصلح issue أو يحدث breaking change
- [ ] يكون بحجم معقول (لا يغير أكثر من 200 سطر)

---

## 8. أدوات التوثيق

### 8.1 TypeDoc

**الاستخدام:** توليد توثيق HTML من JSDoc

**التثبيت:**
```bash
npm install --save-dev typedoc
```

**التكوين (typedoc.json):**
```json
{
  "entryPoints": ["./src"],
  "out": "./docs/api",
  "excludePrivate": true,
  "excludeProtected": false,
  "theme": "default"
}
```

**التشغيل:**
```bash
npx typedoc
```

### 8.2 Commitlint

**الاستخدام:** التحقق من رسائل Git commits

**التثبيت:**
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

**التكوين (commitlint.config.js):**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore'
    ]],
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72]
  }
};
```

### 8.3 Pre-commit Hooks

**التكوين (package.json):**
```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

---

## الخاتمة

هذه السياسة تحدد المعايير والإرشادات للتوثيق في مشروع BOCAM. الالتزام بهذه السياسة يضمن:

- توثيق شامل ودقيق
- سهولة فهم الكود
- تحسين collaboration
- تقليل time to onboarding للمطورين الجدد
- جودة عالية للمشروع

**أي كود بدون توثيق يعتبر غير مكتمل ويجب رفضه في Code Review.**
