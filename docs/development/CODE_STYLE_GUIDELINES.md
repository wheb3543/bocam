# دليل نمط الكود - BOCAM Project
# Code Style Guidelines - BOCAM Project

**الإصدار:** 1.0  
**التاريخ:** 2026-05-27  
**الحالة:** ساري المفعول - ملزم لجميع المطورين  
**المعايير:** TypeScript Best Practices, Clean Architecture, SOLID Principles

---

## جدول المحتويات

1. المبادئ الأساسية
2. قواعد TypeScript العامة
3. معايير التسمية
4. تنظيم الملفات والمجلدات
5. قواعد كتابة الدوال
6. معالجة الأخطاء
7. كتابة الاختبارات
8. أفضل الممارسات
9. أدوات التحقق (Linting)

---

## 1. المبادئ الأساسية

### 1.1 المبادئ التوجيهية

- **الوضوح:** الكود يجب أن يكون سهل القراءة والفهم
- **البساطة:** تجنب التعقيد غير الضروري
- **القابلية للصيانة:** الكود يجب أن يكون سهل التعديل والتوسع
- **إعادة الاستخدام:** تجنب تكرار الكود (DRY Principle)
- **الأمان:** الكود يجب أن يكون آمن ومحمي

### 1.2 CLEAN CODE Principles

- **Meaningful Names:** أسماء توضح الغرض والنية
- **Small Functions:** دوال صغيرة تقوم بمهمة واحدة
- **No Code Duplication:** تجنب تكرار الكود
- **Comments:** تعليقات تشرح "لماذا" وليس "ماذا"
- **Error Handling:** معالجة أخطاء واضحة وصريحة

### 1.3 SOLID Principles

- **S - Single Responsibility:** كل دالة/كلاس له مسؤولية واحدة
- **O - Open/Closed:** مفتوح لل extension، مغلق لل modification
- **L - Liskov Substitution:** الـ subclasses يجب أن تكون بديل للـ base classes
- **I - Interface Segregation:** واجهات صغيرة ومحددة
- **D - Dependency Inversion:** الاعتماد على التجريدات وليس التفاصيل

---

## 2. قواعد TypeScript العامة

### 2.1 استخدام Types

**✅ ممارسة جيدة:**
```typescript
// استخدام types محددة
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
}

function getUser(id: number): Promise<User> {
  // implementation
}
```

**❌ ممارسة سيئة:**
```typescript
// استخدام any ممنوع تماماً
function getUser(id: any): Promise<any> {
  // implementation
}
```

### 2.2 منع استخدام any

**القاعدة:** استخدام `any` ممنوع تماماً في جميع الحالات

**البدائل المسموحة:**
```typescript
// استخدام unknown بدلاً من any
function processData(data: unknown) {
  if (typeof data === 'string') {
    // handle string
  }
}

// استخدام generic types
function processItem<T>(item: T): T {
  // implementation
}

// استخدام union types
type Status = 'pending' | 'active' | 'completed';
```

### 2.3 استخدام const assertions

**✅ ممارسة جيدة:**
```typescript
// استخدام const assertions للـ types دقيقة
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;

type Config = typeof config;
```

### 2.4 استخدام type guards

**✅ ممارسة جيدة:**
```typescript
// Type guards للتحقق من types
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}
```

---

## 3. معايير التسمية

### 3.1 أسماء المتغيرات والدوال

**القاعدة:** camelCase للأسماء

**✅ ممارسات جيدة:**
```typescript
const userName = 'John';
const isActive = true;
const getUserById = (id: number) => { /* ... */ };
const hasFeature = (feature: string) => { /* ... */ };
```

**❌ ممارسات سيئة:**
```typescript
const user_name = 'John';           // underscores
const UserName = 'John';            // PascalCase
const username = 'John';            // غير واضح
const getData = () => { /* ... */ }; // غير محدد
```

### 3.2 أسماء الثوابت

**القاعدة:** UPPER_SNAKE_CASE للثوابت

**✅ ممارسات جيدة:**
```typescript
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;
```

### 3.3 أسماء الواجهات والأنواع

**القاعدة:** PascalCase للواجهات والأنواع

**✅ ممارسات جيدة:**
```typescript
interface UserProfile { /* ... */ }
type UserStatus = 'active' | 'inactive';
type ApiResponse<T> = {
  data: T;
  error: string | null;
};
```

### 3.4 أسماء الكلاسات

**القاعدة:** PascalCase للكلاسات

**✅ ممارسات جيدة:**
```typescript
class UserService { /* ... */ }
class DatabaseConnection { /* ... */ }
class LicenseValidator { /* ... */ }
```

### 3.5 أسماء الملفات

**القاعدة:** kebab-case لاسماء الملفات

**✅ ممارسات جيدة:**
```
user-service.ts
license-validator.ts
api-client.ts
error-handler.ts
```

**❌ ممارسات سيئة:**
```
userService.ts        // camelCase
license_validator.ts  // snake_case
UserService.ts        // PascalCase
```

### 3.6 أسماء المجلدات

**القاعدة:** kebab-case لاسماء المجلدات

**✅ ممارسات جيدة:**
```
src/
├── user-management/
├── license-validation/
├── api-client/
└── error-handling/
```

### 3.7 أسماء المكونات (React)

**القاعدة:** PascalCase للمكونات

**✅ ممارسات جيدة:**
```typescript
const UserProfile = () => { /* ... */ };
const LicenseValidator = () => { /* ... */ };
const ApiClient = () => { /* ... */ };
```

### 3.8 بادئات خاصة

**البادئات المسموحة:**
- `is` / `has` / `should` للـ booleans
- `get` / `set` / `create` / `update` / `delete` للـ CRUD operations
- `on` / `handle` للـ event handlers
- `use` للـ React hooks

**✅ ممارسات جيدة:**
```typescript
const isActive = true;
const hasPermission = true;
const shouldRender = true;

const getUser = () => { /* ... */ };
const createUser = () => { /* ... */ };

const onSubmit = () => { /* ... */ };
const handleClick = () => { /* ... */ };

const useAuth = () => { /* ... */ };
const useLicense = () => { /* ... */ };
```

---

## 4. تنظيم الملفات والمجلدات

### 4.1 هيكل المجلدات

**القاعدة:** تنظيم حسب الوظيفة (Feature-based)

**✅ الهيكل الموصى به:**
```
src/
├── components/           # مكونات قابلة لإعادة الاستخدام
│   ├── ui/             # مكونات واجهة المستخدم الأساسية
│   ├── layout/         # مكونات التخطيط
│   └── features/       # مكونات الميزات
├── pages/              # الصفحات
├── hooks/              # React hooks مخصصة
├── services/           # الخدمات الخارجية
├── utils/              # دوال مساعدة
├── types/              # TypeScript types
├── constants/          # الثوابت
├── config/             # الإعدادات
└── lib/                # مكتبات خارجية
```

### 4.2 ترتيب الاستيرادات (Imports)

**القاعدة:** ترتيب محدد للاستيرادات

**✅ الترتيب الصحيح:**
```typescript
// 1. External libraries (Node.js)
import express from 'express';
import crypto from 'crypto';

// 2. External libraries (third-party)
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// 3. Internal modules (alias imports)
import { validateLicense } from '@shared/license';
import { db } from '@shared/db';

// 4. Relative imports (same module)
import { getUserById } from './utils';
import { UserSchema } from './types';

// 5. Types (if any)
import type { User, LicenseInfo } from './types';

// 6. Styles (if any)
import './styles.css';
```

### 4.3 تصدير الملفات

**القاعدة:** تصدير افتراضي واحد + تصديرات مسماة

**✅ ممارسة جيدة:**
```typescript
// تصدير افتراضي للكلاس/الدالة الرئيسية
export default class UserService {
  // ...
}

// تصديرات مسماة للـ types helpers
export type { User, UserRole };
export { ValidationError, AuthenticationError };
```

---

## 5. قواعد كتابة الدوال

### 5.1 حجم الدوال

**القاعدة:** الدوال يجب أن تكون صغيرة (أقل من 50 سطر)

**✅ ممارسة جيدة:**
```typescript
// دالة صغيرة ومحددة
function getUserById(id: number): Promise<User> {
  return db.users.findUnique({
    where: { id }
  });
}

// دالة صغيرة ومحددة
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**❌ ممارسة سيئة:**
```typescript
// دالة كبيرة تقوم بأكثر من مهمة
function processUserData(id: number) {
  // أكثر من 100 سطر من الكود
  // تقوم بvalidation، database queries، logging، إلخ
}
```

### 5.2 معاملات الدوال

**القاعدة:** أقل من 4 معامل، استخدام objects للمعاملات المتعددة

**✅ ممارسات جيدة:**
```typescript
// معاملات قليلة
function getUser(id: number): Promise<User> {
  // ...
}

// معاملات متعددة - استخدام object
function createUser(data: CreateUserInput): Promise<User> {
  // ...
}

interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}
```

**❌ ممارسة سيئة:**
```typescript
// معاملات كثيرة جداً
function createUser(
  name: string,
  email: string,
  role: UserRole,
  isActive: boolean,
  createdAt: Date
): Promise<User> {
  // ...
}
```

### 5.3 قيم الإرجاع

**القاعدة:** تجنب return متعددة، استخدام early returns

**✅ ممارسة جيدة:**
```typescript
function getUser(id: number): User | null {
  const user = db.users.find({ id });
  
  if (!user) {
    return null;
  }
  
  if (!user.isActive) {
    return null;
  }
  
  return user;
}
```

**❌ ممارسة سيئة:**
```typescript
function getUser(id: number): User | null {
  const user = db.users.find({ id });
  
  if (user && user.isActive) {
    return user;
  } else {
    return null;
  }
}
```

### 5.4 Async/Await

**القاعدة:** استخدام async/await بدلاً من callbacks

**✅ ممارسة جيدة:**
```typescript
async function getUserById(id: number): Promise<User> {
  const user = await db.users.findUnique({ where: { id } });
  return user;
}
```

**❌ ممارسة سيئة:**
```typescript
function getUserById(id: number, callback: (user: User) => void) {
  db.users.find({ id }, (err, user) => {
    callback(user);
  });
}
```

---

## 6. معالجة الأخطاء

### 6.1 مبدأ معالجة الأخطاء

**القاعدة:** كل دالة قد تFAIL يجب أن تتعامل مع الأخطاء بشكل صريح

### 6.2 استخدام Try-Catch

**✅ ممارسة جيدة:**
```typescript
async function getUserById(id: number): Promise<User> {
  try {
    const user = await db.users.findUnique({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Failed to get user:', error);
    throw new Error('Database error', { cause: error });
  }
}
```

### 6.2.1 قاعدة preserve-caught-error

**القاعدة:** عند re-throwing errors، يجب إضافة `cause` إلى Error object للحفاظ على معلومات الخطأ الأصلي

**✅ ممارسة جيدة:**
```typescript
try {
  // some operation
} catch (error) {
  // إضافة cause للحفاظ على معلومات الخطأ الأصلي
  throw new Error('Operation failed', { cause: error });
}
```

**❌ ممارسة سيئة:**
```typescript
try {
  // some operation
} catch (error) {
  // فقدان معلومات الخطأ الأصلي
  throw new Error('Operation failed');
}
```

### 6.2.2 قاعدة no-non-null-assertion

**القاعدة:** يمنع استخدام `!` (non-null assertion) في TypeScript

**✅ ممارسة جيدة:**
```typescript
// استخدام optional chaining
const value = obj?.property;

// استخدام nullish coalescing
const value = param ?? defaultValue;

// فحص صريح
if (value != null) {
  // use value
}
```

**❌ ممارسة سيئة:**
```typescript
// non-null assertion غير آمن
const value = obj!.property;
const value = param!;
```

### 6.3 Custom Error Classes

**القاعدة:** إنشاء custom error classes للأخطاء المختلفة

**✅ ممارسة جيدة:**
```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class LicenseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LicenseError';
  }
}

// استخدام
function validateUser(data: unknown): User {
  if (!isUser(data)) {
    throw new ValidationError('Invalid user data', 'user');
  }
  return data;
}
```

### 6.4 Error Boundaries (React)

**✅ ممارسة جيدة:**
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 6.5 logging الأخطاء

**القاعدة:** تسجيل جميع الأخطاء مع context كافي

**✅ ممارسة جيدة:**
```typescript
async function processPayment(amount: number): Promise<void> {
  try {
    await paymentService.charge(amount);
  } catch (error) {
    console.error('Payment processing failed:', {
      amount,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
```

---

## 7. كتابة الاختبارات

### 7.1 مبدأ الاختبار

**القاعدة:** كل دالة/مكون يجب أن يكون له اختبار

### 7.2 تسمية الاختبارات

**القاعدة:** وصف واضح لما يختبره الاختبار

**✅ ممارسة جيدة:**
```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when valid id is provided', async () => {
      // ...
    });

    it('should return null when user does not exist', async () => {
      // ...
    });

    it('should throw error when database connection fails', async () => {
      // ...
    });
  });
});
```

### 7.3 Arrange-Act-Assert Pattern

**القاعدة:** استخدام AAA pattern في الاختبارات

**✅ ممارسة جيدة:**
```typescript
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
```

### 7.4 Test Coverage

**القاعدة:** هدف coverage 80% كحد أدنى

---

## 8. أفضل الممارسات

### 8.1 تجنب السحرية (Magic Numbers/Strings)

**✅ ممارسة جيدة:**
```typescript
// استخدام ثوابت
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
const USER_ROLES = ['admin', 'user', 'manager'] as const;

// استخدام
for (let i = 0; i < MAX_RETRY_COUNT; i++) {
  // ...
}
```

**❌ ممارسة سيئة:**
```typescript
// أرقام/strings سحرية
for (let i = 0; i < 3; i++) {
  // ...
}

setTimeout(() => { /* ... */ }, 5000);
```

### 8.2 استخدام Early Returns

**✅ ممارسة جيدة:**
```typescript
function validateUser(user: User): boolean {
  if (!user) return false;
  if (!user.email) return false;
  if (!user.isActive) return false;
  return true;
}
```

**❌ ممارسة سيئة:**
```typescript
function validateUser(user: User): boolean {
  if (user && user.email && user.isActive) {
    return true;
  } else {
    return false;
  }
}
```

### 8.3 تجنب التعشيش العميق (Deep Nesting)

**✅ ممارسة جيدة:**
```typescript
async function processUser(userId: number) {
  const user = await getUserById(userId);
  if (!user) return;

  const profile = await getUserProfile(user.id);
  if (!profile) return;

  await sendWelcomeEmail(user.email);
}
```

**❌ ممارسة سيئة:**
```typescript
async function processUser(userId: number) {
  const user = await getUserById(userId);
  if (user) {
    const profile = await getUserProfile(user.id);
    if (profile) {
      if (profile.email) {
        await sendWelcomeEmail(profile.email);
      }
    }
  }
}
```

### 8.4 استخدام Optional Chaining

**✅ ممارسة جيدة:**
```typescript
const userName = user?.profile?.name ?? 'Unknown';
const userEmail = user?.email ?? '';
```

**❌ ممارسة سيئة:**
```typescript
const userName = user && user.profile && user.profile.name ? user.profile.name : 'Unknown';
const userEmail = user ? user.email : '';
```

### 8.5 استخدام Nullish Coalescing

**✅ ممارسة جيدة:**
```typescript
const timeout = config.timeout ?? 5000;
const retries = config.retries ?? 3;
```

**❌ ممارسة سيئة:**
```typescript
const timeout = config.timeout || 5000;
const retries = config.retries || 3;
```

---

## 9. أدوات التحقق (Linting)

### 9.1 ESLint Configuration

**القاعدة:** استخدام ESLint مع قواعد صارمة

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 9.2 Prettier Configuration

**القاعدة:** استخدام Prettier لتنسيق الكود تلقائياً

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### 9.3 Pre-commit Hooks

**القاعدة:** استخدام pre-commit hooks للتحقق من الكود

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

---

## 10. قواعد خاصة بـ BOCAM Project

### 10.1 معالجة الترخيص

**القاعدة:** جميع دوال الترخيص يجب أن تتعامل مع الأخطاء بشكل صارم

```typescript
// جميع دوال الترخيص يجب أن ترمي خطأ عند الفشل
async function validateLicense(): Promise<LicenseInfo> {
  try {
    const license = await loadLicense();
    if (!license) {
      throw new LicenseError('License file not found');
    }
    // ...
  } catch (error) {
    // re-throw as LicenseError
    throw new LicenseError('License validation failed');
  }
}
```

### 10.2 Feature Flags

**القاعدة:** جميع الصفحات المتغيرة يجب أن تتحقق من Feature Flag

```typescript
// استخدام useFeature hook في جميع الصفحات المتغيرة
function WhatsAppPage() {
  const { hasFeature } = useFeature();
  
  if (!hasFeature('whatsapp')) {
    return <UnauthorizedFeature feature="WhatsApp" />;
  }
  
  // render page
}
```

### 10.3 Environment Variables

**القاعدة:** جميع متغيرات البيئة يجب أن يتم التحقق منها عند بدء التطبيق

```typescript
// validation function للـ environment variables
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OAUTH_SERVER_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
```

---

## الخاتمة

هذا الدليل يحدد القواعد والمعايير التي يجب اتباعها في جميع أكواد مشروع BOCAM. الالتزام بهذه القواعد يضمن:

- كود نظيف ومقروء
- سهولة الصيانة والتطوير
- تقليل الأخطاء
- تحسين الأداء
- جودة عالية

**أي مخالفة لهذه القواعد يجب أن يتم تصحيحها قبل دمج الكود في الفرع الرئيسي.**
