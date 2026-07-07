# تقرير تفعيل قاعدة no-promise-executor-return

## تاريخ التقرير
2026-07-05

## شرح القاعدة no-promise-executor-return

### ما هي القاعدة؟
قاعدة `no-promise-executor-return` هي قاعدة ESLint تمنع استخدام قيمة الإرجاع (return value) من دالة Promise executor. دالة Promise executor هي الدالة التي تُمرر إلى منشئ Promise `new Promise(executor)`.

### كيف تعمل القاعدة؟
تقوم القاعدة بفحص الكود وتكتشف الحالات التي يتم فيها استخدام قيمة الإرجاع من دالة مثل `setTimeout` أو `fetch` داخل Promise executor. هذه القيم لا يمكن قراءتها أو استخدامها من داخل Promise executor.

### لماذا هذه القاعدة مهمة؟
1. **منع الأخطاء البرمجية**: قيم الإرجاع من دوال مثل `setTimeout` لا يمكن استخدامها داخل Promise executor
2. **تحسين قابلية القراءة**: جعل الكود أكثر وضوحاً بفصل منطق Promise executor
3. **منع السلوك غير المتوقع**: تجنب الاعتماد على قيم لا يمكن الوصول إليها
4. **تحسين الأداء**: تجنب عمليات غير ضرورية

### أمثلة على الأخطاء التي تكتشفها القاعدة

#### مثال 1: استخدام return value من setTimeout
```typescript
// ❌ خطأ
await new Promise((resolve) => setTimeout(resolve, 1000));
// setTimeout يُرجع رقم (timeout ID) لكن لا يمكن استخدامه

// ✅ صحيح
await new Promise((resolve) => {
  setTimeout(resolve, 1000);
});
```

#### مثال 2: استخدام return value من fetch
```typescript
// ❌ خطأ
new Promise((resolve) => {
  return fetch(url).then(resolve);
});
// return value من fetch لا يمكن استخدامه

// ✅ صحيح
new Promise((resolve) => {
  fetch(url).then(resolve);
});
```

#### مثال 3: استخدام return value من دوال أخرى
```typescript
// ❌ خطأ
new Promise((resolve) => {
  return someAsyncFunction().then(resolve);
});

// ✅ صحيح
new Promise((resolve) => {
  someAsyncFunction().then(resolve);
});
```

---

## تحليل الأخطاء المكتشفة

### ملخص الأخطاء
- **إجمالي الأخطاء**: 8 أخطاء
- **الملفات المتأثرة**: 7 ملفات
- **نمط الخطأ**: جميع الأخطاء من نفس النوع (استخدام return value من setTimeout)

---

## تفاصيل الملفات المتأثرة

### 1. client/src/__tests__/darkMode.test.ts

**الخطأ:**
```
210:36  error  Return values from promise executor functions cannot be read  no-promise-executor-return
```

**السبب:**
- استخدام `setTimeout` مع return value داخل Promise executor
- السطر: `await new Promise(resolve => setTimeout(resolve, 10));`

**الحل المطبق:**
```typescript
// ❌ قبل الإصلاح
await new Promise(resolve => setTimeout(resolve, 10));

// ✅ بعد الإصلاح
await new Promise(resolve => {
  setTimeout(resolve, 10);
});
```

---

### 2. client/src/pages/admin/AdvancedSettingsPage.tsx

**الخطأ:**
```
82:38  error  Return values from promise executor functions cannot be read  no-promise-executor-return
```

**السبب:**
- استخدام `setTimeout` مع return value داخل Promise executor
- السطر: `await new Promise((resolve) => setTimeout(resolve, 1000));`

**الحل المطبق:**
```typescript
// ❌ قبل الإصلاح
await new Promise((resolve) => setTimeout(resolve, 1000));

// ✅ بعد الإصلاح
await new Promise((resolve) => {
  setTimeout(resolve, 1000);
});
```

---

### 3. server/_core/updateChecker.ts

**الخطأ:**
```
734:34  error  Return values from promise executor functions cannot be read  no-promise-executor-return
```

**السبب:**
- استخدام `setTimeout` مع return value داخل Promise executor
- السطر: `await new Promise((resolve) => setTimeout(resolve, 2000));`

**الحل المطبق:**
```typescript
// ❌ قبل الإصلاح
await new Promise((resolve) => setTimeout(resolve, 2000));

// ✅ بعد الإصلاح
await new Promise((resolve) => {
  setTimeout(resolve, 2000);
});
```

---

### 4. server/api/MetaApiService.ts

**الخطأ:**
```
120:37  error  Return values from promise executor functions cannot be read  no-promise-executor-return
```

**السبب:**
- استخدام `setTimeout` مع return value داخل Promise executor
- السطر: `return new Promise((resolve) => setTimeout(resolve, ms));`

**الحل المطبق:**
```typescript
// ❌ قبل الإصلاح
private async _delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ✅ بعد الإصلاح
private async _delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

---

### 5. server/integrations/webhooks/whatsappWebhook.ts

**الخطأ:**
```
620:40  error  Return values from promise executor functions cannot be read  no-promise-executor-return
```

**السبب:**
- استخدام `setTimeout` مع return value داخل Promise executor
- السطر: `await new Promise((resolve) => setTimeout(resolve, 200));`

**الحل المطبق:**
```typescript
// ❌ قبل الإصلاح
await new Promise((resolve) => setTimeout(resolve, 200)); // Increased delay to ensure DB commit

// ✅ بعد الإصلاح
await new Promise((resolve) => {
  setTimeout(resolve, 200);
}); // Increased delay to ensure DB commit
```

---

### 6. server/services/whatsappBroadcast.ts

**الخطأ:**
```
116:40  error  Return values from promise executor functions cannot be read  no-promise-executor-return
```

**السبب:**
- استخدام `setTimeout` مع return value داخل Promise executor
- السطر: `await new Promise((resolve) => setTimeout(resolve, delay));`

**الحل المطبق:**
```typescript
// ❌ قبل الإصلاح
await new Promise((resolve) => setTimeout(resolve, delay));

// ✅ بعد الإصلاح
await new Promise((resolve) => {
  setTimeout(resolve, delay);
});
```

---

### 7. server/tasks/cron/appointmentReminders.ts

**الأخطاء:**
```
108:40  error  Return values from promise executor functions cannot be read  no-promise-executor-return
119:40  error  Return values from promise executor functions cannot be read  no-promise-executor-return
```

**السبب:**
- استخدام `setTimeout` مع return value داخل Promise executor (مرتين)
- السطر 108: `await new Promise((resolve) => setTimeout(resolve, delay));`
- السطر 119: `await new Promise((resolve) => setTimeout(resolve, delay));`

**الحل المطبق:**
```typescript
// ❌ قبل الإصلاح
await new Promise((resolve) => setTimeout(resolve, delay));

// ✅ بعد الإصلاح
await new Promise((resolve) => {
  setTimeout(resolve, delay);
});
```

---

## ملخص الإصلاحات

### الملفات المعدلة
1. `client/src/__tests__/darkMode.test.ts`
2. `client/src/pages/admin/AdvancedSettingsPage.tsx`
3. `server/_core/updateChecker.ts`
4. `server/api/MetaApiService.ts`
5. `server/integrations/webhooks/whatsappWebhook.ts`
6. `server/services/whatsappBroadcast.ts`
7. `server/tasks/cron/appointmentReminders.ts`

### نمط الإصلاح
جميع الإصلاحات تتبع نفس النمط:
- تغيير `new Promise((resolve) => setTimeout(resolve, ms))` إلى:
- `new Promise((resolve) => { setTimeout(resolve, ms); })`

### النتائج
- **قبل الإصلاح**: 8 أخطاء
- **بعد الإصلاح**: 0 أخطاء
- **الحالة**: ✅ تم التفعيل بنجاح

---

## أفضل الممارسات لتجنب أخطاء no-promise-executor-return

### 1. استخدام block statements في Promise executors
```typescript
// ❌ سيء
new Promise((resolve) => setTimeout(resolve, 1000));

// ✅ جيد
new Promise((resolve) => {
  setTimeout(resolve, 1000);
});
```

### 2. استخدام async/await بدلاً من Promise constructor
```typescript
// ❌ سيء
new Promise((resolve) => {
  fetch(url).then(data => resolve(data));
});

// ✅ جيد
const data = await fetch(url);
```

### 3. استخدام دوال مساعدة للتأخير
```typescript
// ✅ جيد - دالة مساعدة قابلة لإعادة الاستخدام
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// الاستخدام
await delay(1000);
```

### 4. تجنب return statements في Promise executors
```typescript
// ❌ سيء
new Promise((resolve) => {
  return someFunction().then(resolve);
});

// ✅ جيد
new Promise((resolve) => {
  someFunction().then(resolve);
});
```

### 5. استخدام Promise.resolve للقيم البسيطة
```typescript
// ❌ سيء
new Promise((resolve) => resolve(value));

// ✅ جيد
Promise.resolve(value);
```

---

## الخاتمة

تم تفعيل قاعدة `no-promise-executor-return` بنجاح بعد إصلاح 8 أخطاء في 7 ملفات. جميع الأخطاء كانت من نفس النوع (استخدام return value من setTimeout داخل Promise executor).

الإصلاحات كانت بسيطة ومتسقة، حيث تم تغيير نمط الكود من:
```typescript
new Promise((resolve) => setTimeout(resolve, ms))
```
إلى:
```typescript
new Promise((resolve) => {
  setTimeout(resolve, ms);
})
```

القاعدة الآن مفعلة وتعمل بشكل صحيح، مما يساعد في منع الأخطاء المستقبلية المتعلقة باستخدام قيم الإرجاع من Promise executors.
