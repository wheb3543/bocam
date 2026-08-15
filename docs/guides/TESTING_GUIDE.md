# دليل الاختبار الشامل | Testing Complete Guide

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 📋 نظرة عامة

يستخدم المشروع إطار **Vitest** للاختبارات مع **Testing Library** لاختبار المكونات. يتم تشغيل الاختبارات تلقائياً عند كل commit ويتم عرض نتائجها في CI/CD pipeline.

### أطر الاختبار المستخدمة

| الإطار | الاستخدام |
|--------|-----------|
| **Vitest** | اختبار Unit و Integration |
| **@testing-library/react** | اختبار مكونات React |
| **@testing-library/jest-dom** | matchers إضافية لـ DOM |
| **msw** | Mock Service Worker لاختبار API |

---

## 🚀 تشغيل الاختبارات

### تشغيل جميع الاختبارات

```bash
pnpm test
```

### تشغيل الاختبارات مع المراقبة (Watch Mode)

```bash
pnpm test:watch
```

### تشغيل الاختبارات مع تغطية الكود

```bash
pnpm test:coverage
```

### تشغيل اختبار محدد

```bash
pnpm test -- --testNamePattern="اسم الاختبار"
```

---

## 📁 هيكل ملفات الاختبار

```
project/
├── server/
│   ├── __tests__/
│   │   ├── auth.test.ts          # اختبارات المصادقة
│   │   ├── customers.test.ts     # اختبارات العملاء
│   │   └── whatsapp.test.ts      # اختبارات WhatsApp
│   └── routers/
│       └── __tests__/
│           └── *.test.ts         # اختبارات الـ routers
├── client/
│   └── src/
│       └── __tests__/
│           ├── App.test.tsx      # اختبار التطبيق الرئيسي
│           └── components/
│               └── *.test.tsx    # اختبار المكونات
└── vitest.config.ts              # إعدادات Vitest
```

---

## 🧪 كتابة الاختبارات

### اختبار Unit بسيط

```typescript
// server/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { normalizePhone } from '../utils/phone';

describe('normalizePhone', () => {
  it('should normalize local phone number', () => {
    expect(normalizePhone('777123456')).toBe('967777123456');
  });

  it('should keep international format', () => {
    expect(normalizePhone('+967777123456')).toBe('967777123456');
  });

  it('should remove special characters', () => {
    expect(normalizePhone('+967-777-123-456')).toBe('967777123456');
  });
});
```

### اختبار Component

```typescript
// client/src/__tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../ui/Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### اختبار مع Mock API

```typescript
// server/__tests__/customers.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { getCustomerByPhone } from '../routers/customers';

const server = setupServer(
  rest.get('/api/customers/:phone', (req, res, ctx) => {
    return res(ctx.json({
      id: 1,
      name: 'أحمد محمد',
      phone: req.params.phone
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getCustomerByPhone', () => {
  it('should fetch customer by phone', async () => {
    const customer = await getCustomerByPhone('777123456');
    
    expect(customer).toEqual({
      id: 1,
      name: 'أحمد محمد',
      phone: '777123456'
    });
  });
});
```

---

## 🔧 أفضل الممارسات

### 1. تسمية الاختبارات

استخدم أسماء واضحة تصف السلوك المتوقع:

```typescript
// ❌ سيء
describe('test', () => {});

// ✅ جيد
describe('getCustomerByPhone', () => {
  it('should return customer when phone exists', () => {});
  it('should return null when phone not found', () => {});
  it('should throw error for invalid phone format', () => {});
});
```

### 2. ترتيب الاختبار (AAA Pattern)

```typescript
it('should calculate total correctly', () => {
  // Arrange - التجهيز
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ];
  
  // Act - التنفيذ
  const total = calculateTotal(items);
  
  // Assert - التحقق
  expect(total).toBe(250);
});
```

### 3. استخدام beforeEach/afterEach

```typescript
describe('Database operations', () => {
  beforeEach(async () => {
    // تنظيف قاعدة البيانات قبل كل اختبار
    await db.delete(users);
  });

  it('should create user', async () => {
    // الاختبار
  });
});
```

### 4. اختبار الحالات الحدية

```typescript
describe('calculateDiscount', () => {
  it('should handle zero amount', () => {});
  it('should handle negative amount', () => {});
  it('should handle very large amount', () => {});
  it('should handle decimal amounts', () => {});
});
```

---

## 📊 تغطية الكود (Code Coverage)

### تشغيل تقرير التغطية

```bash
pnpm test:coverage
```

### أهداف التغطية

| النوع | الهدف الأدنى |
|-------|-------------|
| **Statements** | 80% |
| **Branches** | 70% |
| **Functions** | 80% |
| **Lines** | 80% |

### استثناء ملفات من التغطية

بعض الملفات لا تحتاج لاختبارات:
- ملفات الإعدادات (config files)
- ملفات الأنواع (type definitions)
- ملفات التصدير (barrel exports)

---

## 🔍 استكشاف أخطاء الاختبارات

### الاختبار يفشل بشكل عشوائي

**السبب:** اعتماد على حالة مشتركة بين الاختبارات.

**الحل:**
```typescript
// ❌ سيء - مشاركة حالة
let counter = 0;
describe('tests', () => {
  it('test 1', () => { counter++; });
  it('test 2', () => { expect(counter).toBe(1); }); // قد يفشل!
});

// ✅ جيد - حالة محلية
it('test 1', () => {
  let counter = 0;
  counter++;
  expect(counter).toBe(1);
});
```

### الاختبار بطيء

**الأسباب المحتملة:**
1. عمليات I/O كثيرة
2. انتظار مواعيد طويلة
3. بيانات اختبار كبيرة جداً

**الحلول:**
```typescript
// استخدام mocks للعمليات البطيئة
vi.mock('../database', () => ({
  query: vi.fn().mockResolvedValue({ rows: [] })
}));

// تقليل حجم البيانات
const smallDataset = items.slice(0, 10);
```

---

## 📚 موارد إضافية

### روابط مفيدة
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)

### أدوات مساعدة
- **vitest-fail-on-console**: كشف أخطاء console
- **@vitest/coverage-v8**: تغطية كود دقيقة
- **vitest-mock-extended**: mocks أسهل

---

<a name="english"></a>

## 📋 Overview

The project uses **Vitest** for testing with **Testing Library** for React components. Tests run automatically on every commit and results are displayed in the CI/CD pipeline.

### Testing Frameworks Used

| Framework | Usage |
|-----------|-------|
| **Vitest** | Unit and Integration tests |
| **@testing-library/react** | React component testing |
| **@testing-library/jest-dom** | Additional DOM matchers |
| **msw** | Mock Service Worker for API testing |

---

## 🚀 Running Tests

### Run all tests

```bash
pnpm test
```

### Run tests in watch mode

```bash
pnpm test:watch
```

### Run tests with coverage

```bash
pnpm test:coverage
```

### Run specific test

```bash
pnpm test -- --testNamePattern="test name"
```

---

## 📁 Test File Structure

```
project/
├── server/
│   ├── __tests__/
│   │   ├── auth.test.ts          # Authentication tests
│   │   ├── customers.test.ts     # Customer tests
│   │   └── whatsapp.test.ts      # WhatsApp tests
│   └── routers/
│       └── __tests__/
│           └── *.test.ts         # Router tests
├── client/
│   └── src/
│       └── __tests__/
│           ├── App.test.tsx      # Main app test
│           └── components/
│               └── *.test.tsx    # Component tests
└── vitest.config.ts              # Vitest configuration
```

---

## 🧪 Writing Tests

### Simple Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { normalizePhone } from '../utils/phone';

describe('normalizePhone', () => {
  it('should normalize local phone number', () => {
    expect(normalizePhone('777123456')).toBe('967777123456');
  });
});
```

### Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../ui/Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🔧 Best Practices

### 1. Test Naming

Use clear names that describe expected behavior:

```typescript
describe('getCustomerByPhone', () => {
  it('should return customer when phone exists', () => {});
  it('should return null when phone not found', () => {});
  it('should throw error for invalid phone format', () => {});
});
```

### 2. Arrange-Act-Assert (AAA) Pattern

```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 100, quantity: 2 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(200);
});
```

### 3. Use beforeEach/afterEach

```typescript
describe('Database operations', () => {
  beforeEach(async () => {
    await db.delete(users); // Clean up before each test
  });
});
```

---

## 📊 Code Coverage

### Coverage Goals

| Type | Minimum Target |
|------|----------------|
| **Statements** | 80% |
| **Branches** | 70% |
| **Functions** | 80% |
| **Lines** | 80% |

---

<div align="center">

**نرعاكم كأهالينا - Caring like family**

Made with ❤️ by SGH Team

</div>