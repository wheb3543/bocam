# دليل الاختبارات - Testing Guide

## نظرة عامة

هذا الدليل يشرح كيفية كتابة وتشغيل وصيانة الاختبارات في مشروع Bocam.

## جدول المحتويات

- [أنواع الاختبارات](#أنواع-الاختبارات)
- [أدوات الاختبار](#أدوات-الاختبار)
- [كتابة الاختبارات](#كتابة-الاختبارات)
- [تشغيل الاختبارات](#تشغيل-الاختبارات)
- [أفضل الممارسات](#أفضل-الممارسات)
- [صيانة الاختبارات](#صيانة-الاختبارات)
- [استكشاف الأخطاء](#استكشاف-الأخطاء)

## أنواع الاختبارات

### 1. Unit Tests (اختبارات الوحدة)
- **الهدف:** اختبار دوال ومكونات فردية
- **الأدوات:** Vitest, Testing Library
- **الموقع:** `client/src/**/__tests__/*.test.ts`, `server/routers/__tests__/*.test.ts`
- **المثال:** اختبار دالة معالجة البيانات

### 2. Integration Tests (اختبارات التكامل)
- **الهدف:** اختبار تكامل المكونات معاً
- **الأدوات:** Vitest, Testing Library
- **الموقع:** `client/src/**/__tests__/*.test.tsx`
- **المثال:** اختبار مكون React مع tRPC

### 3. E2E Tests (اختبارات نهاية إلى نهاية)
- **الهدف:** اختبار مسارات المستخدم الكاملة
- **الأدوات:** Playwright
- **الموقع:** `e2e/*.spec.ts`
- **المثال:** اختبار تسجيل الدخول الكامل

## أدوات الاختبار

### Vitest
- إطار اختبار سريع وسريع
- متوافق مع Jest API
- يدعم TypeScript

### Testing Library
- React Testing Library لاختبار المكونات
- يركز على سلوك المستخدم
- يوفر أدوات للبحث عن العناصر

### Playwright
- إطار اختبار E2E قوي
- يدعم متصفحات متعددة
- يوفر أدوات للتصوير والتسجيل

## كتابة الاختبارات

### هيكل الاختبار القياسي

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يعرض المكون بنجاح', () => {
    render(<MyComponent />);
    expect(screen.getByText('مرحباً')).toBeInTheDocument();
  });
});
```

### قواعد التسمية

- **أسماء الملفات:** `ComponentName.test.ts` أو `ComponentName.test.tsx`
- **أسماء الاختبارات:** باللغة العربية، تصفية السلوك
- **أمثلة:**
  - `يجب أن يعرض المكون بنجاح`
  - `يجب أن يرسل البيانات عند النقر`
  - `يجب أن يعرض خطأ عند البيانات غير الصحيحة`

### Mocking

#### Mocking External Dependencies

```typescript
// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock tRPC
vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    myRouter: {
      useQuery: vi.fn(() => ({ data: [], isLoading: false })),
    },
  },
}));
```

#### Mocking Functions

```typescript
const mockFn = vi.fn();
mockFn('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
```

### Async Testing

```typescript
it('يجب أن يحمّل البيانات بشكل غير متزامن', async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('البيانات')).toBeInTheDocument();
  });
});
```

## تشغيل الاختبارات

### تشغيل جميع الاختبارات

```bash
pnpm vitest
```

### تشغيل اختبار محدد

```bash
pnpm vitest run client/src/components/__tests__/MyComponent.test.tsx
```

### تشغيل اختبارات E2E

```bash
pnpm playwright test
```

### تشغيل اختبارات E2E في وضع UI

```bash
pnpm playwright test --ui
```

### تشغيل اختبارات في وضع Watch

```bash
pnpm vitest watch
```

## أفضل الممارسات

### 1. اتباع AAA Pattern

```typescript
it('يجب أن يحسب المجموع', () => {
  // Arrange (الترتيب)
  const a = 5;
  const b = 10;
  
  // Act (التنفيذ)
  const result = add(a, b);
  
  // Assert (التأكيد)
  expect(result).toBe(15);
});
```

### 2. ركز على سلوك المستخدم

```typescript
// ❌ سيء
expect(component.state.isOpen).toBe(true);

// ✅ جيد
expect(screen.getByText('القائمة')).toBeVisible();
```

### 3. تجنب تفاصيل التنفيذ

```typescript
// ❌ سيء
expect(screen.getByClassName('btn-primary')).toBeInTheDocument();

// ✅ جيد
expect(screen.getByRole('button', { name: 'حفظ' })).toBeInTheDocument();
```

### 4. استخدم Selectors المناسبة

```typescript
// حسب النص
screen.getByText('مرحباً')

// حسب الدور
screen.getByRole('button')

// حسب الـ aria-label
screen.getByLabelText('البريد الإلكتروني')

// حسب الـ placeholder
screen.getByPlaceholderText('أدخل الاسم')
```

### 5. نظف بعد كل اختبار

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
```

### 6. استخدم Describes لتجميع الاختبارات

```typescript
describe('MyComponent', () => {
  describe('Rendering', () => {
    it('يجب أن يعرض المكون');
  });
  
  describe('Interactions', () => {
    it('يجب أن يستجيب للنقر');
  });
});
```

### 7. اكتب اختبارات قابلة للصيانة

```typescript
// ❌ سيء - اختبار طويل ومعقد
it('يجب أن يعمل كل شيء', () => {
  // 50 سطر من الكود
});

// ✅ جيد - اختبارات صغيرة ومحددة
it('يجب أن يعرض الخطأ');
it('يجب أن يرسل البيانات');
it('يجب أن يحدث الصفحة');
```

### 8. تجنب استخدام any

```typescript
// ❌ سيء
const data: any = response;

// ✅ جيد
const data: MyType = response;
```

## صيانة الاختبارات

### تحديث الاختبارات عند تغيير الكود

1. **تعرف على الاختبارات المتأثرة:**
   ```bash
   pnpm vitest run --reporter=verbose
   ```

2. **شغل الاختبارات المتأثرة فقط:**
   ```bash
   pnpm vitest run client/src/components/__tests__/
   ```

3. **حدّث الاختبارات:**
   - عدّل الـ selectors إذا تغيرت الـ UI
   - حدّث الـ mocks إذا تغيرت الـ API
   - أضف اختبارات جديدة للميزات الجديدة

### إزالة الاختبارات القديمة

```bash
# ابحث عن اختبارات لم تعد مستخدمة
pnpm vitest run --reporter=json
```

### إعادة هيكلة الاختبارات

```typescript
// قبل: اختبارات غير منظمة
it('يجب أن يعرض');
it('يجب أن يخفي');
it('يجب أن يرسل');

// بعد: اختبارات منظمة
describe('Display', () => {
  it('يجب أن يعرض');
  it('يجب أن يخفي');
});

describe('Actions', () => {
  it('يجب أن يرسل');
});
```

## استكشاف الأخطاء

### مشاكل شائعة

#### 1. React is not defined

**الحل:**
```typescript
import React from 'react';
```

#### 2. Cannot find module

**الحل:**
```typescript
// تأكد من المسار الصحيح
import MyComponent from '@/components/MyComponent';
```

#### 3. Timeout errors

**الحل:**
```typescript
// زد مهلة الانتظار
it('يجب أن يحمّل', async () => {
  await waitFor(() => {
    expect(screen.getByText('البيانات')).toBeInTheDocument();
  }, { timeout: 5000 });
});
```

#### 4. Element not found

**الحل:**
```typescript
// انتظر حتى يظهر العنصر
await screen.findByText('البيانات');

// أو استخدم waitFor
await waitFor(() => {
  expect(screen.getByText('البيانات')).toBeInTheDocument();
});
```

#### 5. Mock not working

**الحل:**
```typescript
// تأكد من تنظيف الـ mocks
beforeEach(() => {
  vi.clearAllMocks();
});

// تأكد من الـ mock الصحيح
vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    myRouter: {
      useQuery: vi.fn(() => ({ data: [], isLoading: false })),
    },
  },
}));
```

### أدوات التصحيح

#### 1. استخدام console.log

```typescript
it('يجب أن يعمل', () => {
  console.log('Debug info');
  // الكود
});
```

#### 2. استخدام screen.debug()

```typescript
it('يجب أن يعرض', () => {
  render(<MyComponent />);
  screen.debug();
});
```

#### 3. استخدام Playwright Inspector

```bash
pnpm playwright test --debug
```

#### 4. استخدام Vitest UI

```bash
pnpm vitest --ui
```

## إحصائيات الاختبارات

### إجمالي الاختبارات

- **Unit Tests:** 943 اختبار
- **E2E Tests:** 70 اختبار
- **المجموع:** 1013 اختبار

### توزيع الاختبارات

- **Server Tests:** 704 اختبار
- **Client Tests:** 239 اختبار
- **E2E Tests:** 70 اختبار

### نسبة النجاح

- **Unit Tests:** 100%
- **E2E Tests:** 100%
- **المجموع:** 100%

## المراجع

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## الدعم

إذا واجهت أي مشاكل في الاختبارات، يرجى:
1. مراجعة هذا الدليل
2. مراجعة التوثيق الرسمي
3. التواصل مع فريق التطوير

---

**آخر تحديث:** 11 يوليو 2026
