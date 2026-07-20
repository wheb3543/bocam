# تقرير تحليل الأكواد المكررة
## Code Duplication Analysis Report

**التاريخ:** 20 يوليو 2026  
**الهدف:** تحديد وإزالة الأكواد المكررة لتحسين جودة الكود وقابلية الصيانة

---

## ملخص التنفيذ

تم فحص المشروع وتحديد أنماط التكرار الرئيسية في:
- Routers (TRPC procedures)
- Services
- Helpers
- Cache invalidation patterns
- Status timestamp management

---

## أنماط التكرار المحددة

### 1. التحقق من قاعدة البيانات (Database Availability Check)

**النمط:**
```typescript
const db = await getDb();
if (!db) {
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
}
```

**عدد التكرارات:** 50+ مرة

**الملفات المتأثرة:**
- `server/routers/auth.ts` (2 مرات)
- `server/routers/camps.ts` (8 مرات)
- `server/routers/charts.ts` (6 مرات)
- `server/routers/doctors.ts` (5 مرات)
- `server/routers/users.ts` (10+ مرات)
- `server/routers/campRegistrations/*.ts` (4 مرات)
- `server/routers/offerLeads/*.ts` (4 مرات)
- `server/routers/whatsapp/*.ts` (3 مرات)
- وغيرها...

**الأثر:** تكرار كبير، يصعب الصيانة، رسائل خطأ غير متسقة

---

### 2. إبطال الـ Cache (Cache Invalidation)

**النمط:**
```typescript
serverCache.invalidateByPrefix('paginated:xxx:');
serverCache.invalidate('list:xxx');
serverCache.invalidate(CacheKeys.xxxStats());
```

**عدد التكرارات:** 15+ مرة

**الملفات المتأثرة:**
- `server/routers/doctors.ts` (4 مرات)
- `server/routers/camps.ts` (4 مرات)
- `server/routers/offers.ts` (4 مرات)
- `server/routers/offerLeads/status.ts` (2 مرات)
- `server/routers/offerLeads/admin.ts` (1 مرة)
- `server/routers/offerLeads/registration.ts` (1 مرة)
- `server/routers/webhooks.ts` (3 مرات)
- `server/routers/campRegistrationHelpers.ts` (1 مرة)

**الأثر:** تكرار، احتمال نسيان إبطال cache معين

---

### 3. تحديث Timestamps للحالة (Status Timestamp Updates)

**النمط:**
```typescript
const now = new Date();
const updateData: Record<string, unknown> = {
  status: input.status,
  statusNotes: input.notes,
  updatedAt: now,
};

if (input.status === 'contacted') {updateData.contactedAt = now;}
else if (input.status === 'confirmed') {updateData.confirmedAt = now;}
else if (input.status === 'attended') {updateData.attendedAt = now;}
else if (input.status === 'completed') {updateData.completedAt = now;}
else if (input.status === 'cancelled') {updateData.cancelledAt = now;}
```

**عدد التكرارات:** 4 مرات

**الملفات المتأثرة:**
- `server/routers/campRegistrations/status.ts` (2 مرات - updateStatus و bulkUpdateStatus)
- `server/routers/offerLeads/status.ts` (2 مرات - updateStatus و bulkUpdateStatus)

**الأثر:** تكرار منطق الأعمال، احتمال عدم اتساق

---

### 4. إنشاء Timestamps للحالة (Status Timestamp Creation)

**النمط:**
```typescript
const now = new Date();
const statusTimestamps: Record<string, Date> = {};
const initialStatus = input.status || 'pending';
if (initialStatus === 'contacted') {statusTimestamps.contactedAt = now;}
else if (initialStatus === 'confirmed') {statusTimestamps.confirmedAt = now;}
else if (initialStatus === 'attended') {statusTimestamps.attendedAt = now;}
else if (initialStatus === 'completed') {statusTimestamps.completedAt = now;}
else if (initialStatus === 'cancelled') {statusTimestamps.cancelledAt = now;}
```

**عدد التكرارات:** 2 مرة

**الملفات المتأثرة:**
- `server/routers/campRegistrationHelpers.ts` (createStatusTimestamps)
- `server/routers/offerLeads/registration.ts` (inline)

**الأثر:** تكرار، عدم إعادة الاستخدام

---

### 5. التحقق من صحة رقم الهاتف (Phone Validation)

**النمط:**
```typescript
const validation = await validatePhoneNumber(params.phone);
if (!validation.valid || !validation.normalized) {
  return { success: false, error: validation.error };
}
const normalizedPhone = validation.normalized;
```

**عدد التكرارات:** 5 مرات

**الملفات المتأثرة:**
- `server/services/whatsapp/appointments.ts` (3 مرات)
- `server/services/whatsapp/camps-offers.ts` (2 مرات)

**الأثر:** تكرار منطق التحقق

---

### 6. إرسال إشعارات WhatsApp (WhatsApp Notification Sending)

**النمط:**
```typescript
const notificationId = await saveNotification({
  entityType: 'xxx',
  entityId: params.xxxId,
  notificationType: 'booking_confirmation',
  phone: normalizedPhone,
  recipientName: params.patientName,
  messageContent: message,
  status: result.success ? 'sent' : 'failed',
  metaMessageId: result.messageId,
  errorMessage: result.error,
  sentBy: params.sentBy,
});
```

**عدد التكرارات:** 5 مرات

**الملفات المتأثرة:**
- `server/services/whatsapp/appointments.ts` (3 مرات)
- `server/services/whatsapp/camps-offers.ts` (2 مرات)

**الأثر:** تكرار منطق حفظ الإشعارات

---

### 7. معالجة الأخطاء (Error Handling)

**النمط:**
```typescript
try {
  // logic
} catch (error) {
  console.error('[Module] Failed to do something:', error);
  return { success: false, error: error instanceof Error ? error.message : 'خطأ غير معروف' };
}
```

**عدد التكرارات:** 10+ مرات

**الملفات المتأثرة:**
- جميع ملفات services
- بعض ملفات routers

**الأثر:** تكرار منطق معالجة الأخطاء

---

## حلول مقترحة لإزالة التكرار

### الحل 1: إنشاء دالة مساعدة للتحقق من قاعدة البيانات

**الملف المقترح:** `server/_core/databaseGuard.ts`

```typescript
import { TRPCError } from '@trpc/server';
import { getDb } from './database/db';

/**
 * التحقق من توفر قاعدة البيانات
 * @throws TRPCError إذا لم تكن قاعدة البيانات متاحة
 */
export async function ensureDatabaseAvailable(): Promise<ReturnType<typeof getDb>> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({ 
      code: 'INTERNAL_SERVER_ERROR', 
      message: 'قاعدة البيانات غير متاحة' 
    });
  }
  return db;
}
```

**الاستخدام:**
```typescript
// قبل:
const db = await getDb();
if (!db) {
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
}

// بعد:
const db = await ensureDatabaseAvailable();
```

**الأثر:** تقليل التكرار من 50+ إلى 0، تحسين اتساق رسائل الخطأ

---

### الحل 2: إنشاء دالة مساعدة لإبطال الـ Cache

**الملف المقترح:** `server/services/cacheInvalidator.ts`

```typescript
import { serverCache, CacheKeys } from './cache';

/**
 * إبطال cache للكائنات
 */
export function invalidateEntityCache(entityType: 'appointments' | 'campRegistrations' | 'offerLeads') {
  const prefixMap = {
    appointments: 'paginated:appointments:',
    campRegistrations: 'paginated:campRegistrations:',
    offerLeads: 'paginated:offerLeads:',
  };
  
  const listMap = {
    appointments: 'list:appointments',
    campRegistrations: 'list:campRegistrations',
    offerLeads: 'list:offerLeads',
  };
  
  const statsKeyMap = {
    appointments: CacheKeys.appointmentStats(),
    campRegistrations: CacheKeys.campRegistrationStats(),
    offerLeads: CacheKeys.offerLeadStats(),
  };
  
  serverCache.invalidateByPrefix(prefixMap[entityType]);
  serverCache.invalidate(listMap[entityType]);
  serverCache.invalidate(statsKeyMap[entityType]);
}
```

**الاستخدام:**
```typescript
// قبل:
serverCache.invalidateByPrefix('paginated:offerLeads:');
serverCache.invalidate('list:offerLeads');
serverCache.invalidate(CacheKeys.offerLeadStats());

// بعد:
invalidateEntityCache('offerLeads');
```

**الأثر:** تقليل التكرار من 15+ إلى 0، تحسين قابلية الصيانة

---

### الحل 3: إنشاء دالة مساعدة لتحديث Timestamps

**الملف المقترح:** `server/_core/statusTimestamps.ts`

```typescript
/**
 * إنشاء timestamps للحالة
 */
export function createStatusTimestamps(status: string): Record<string, Date> {
  const now = new Date();
  const timestamps: Record<string, Date> = {};
  
  const statusTimestampMap: Record<string, string> = {
    contacted: 'contactedAt',
    confirmed: 'confirmedAt',
    attended: 'attendedAt',
    completed: 'completedAt',
    cancelled: 'cancelledAt',
  };
  
  const timestampField = statusTimestampMap[status];
  if (timestampField) {
    timestamps[timestampField] = now;
  }
  
  return timestamps;
}

/**
 * تحديث timestamps للحالة
 */
export function updateStatusTimestamps(status: string): Record<string, Date> {
  const now = new Date();
  const updateData: Record<string, Date> = {};
  
  if (status === 'contacted') {updateData.contactedAt = now;}
  else if (status === 'confirmed') {updateData.confirmedAt = now;}
  else if (status === 'attended') {updateData.attendedAt = now;}
  else if (status === 'completed') {updateData.completedAt = now;}
  else if (status === 'cancelled') {updateData.cancelledAt = now;}
  
  return updateData;
}
```

**الاستخدام:**
```typescript
// قبل:
const now = new Date();
const updateData: Record<string, unknown> = {
  status: input.status,
  statusNotes: input.notes,
  updatedAt: now,
};
if (input.status === 'contacted') {updateData.contactedAt = now;}
else if (input.status === 'confirmed') {updateData.confirmedAt = now;}
// ...

// بعد:
const now = new Date();
const updateData: Record<string, unknown> = {
  status: input.status,
  statusNotes: input.notes,
  updatedAt: now,
  ...updateStatusTimestamps(input.status),
};
```

**الأثر:** تقليل التكرار من 4 إلى 0، تحسين قابلية الصيانة

---

### الحل 4: إنشاء دالة مساعدة للتحقق من رقم الهاتف

**الملف المقترح:** تحسين `server/services/whatsapp/helpers.ts`

```typescript
/**
 * التحقق من صحة رقم الهاتف وإرجاع الرقم المعياري
 * @throws Error إذا كان الرقم غير صحيح
 */
export async function validateAndNormalizePhone(phone: string): Promise<string> {
  const validation = await validatePhoneNumber(phone);
  if (!validation.valid || !validation.normalized) {
    throw new Error(validation.error || 'رقم الهاتف غير صحيح');
  }
  return validation.normalized;
}
```

**الاستخدام:**
```typescript
// قبل:
const validation = await validatePhoneNumber(params.phone);
if (!validation.valid || !validation.normalized) {
  return { success: false, error: validation.error };
}
const normalizedPhone = validation.normalized;

// بعد:
const normalizedPhone = await validateAndNormalizePhone(params.phone);
```

**الأثر:** تقليل التكرار من 5 إلى 0، تبسيط الكود

---

### الحل 5: إنشاء دالة مساعدة لإرسال وحفظ الإشعارات

**الملف المقترح:** تحسين `server/services/whatsapp/helpers.ts`

```typescript
/**
 * إرسال رسالة وحفظ الإشعار
 */
export async function sendAndSaveNotification(params: {
  phone: string;
  message: string;
  entityType: EntityType;
  entityId: number;
  notificationType: NotificationType;
  recipientName?: string;
  sentBy?: number;
}): Promise<SendResult> {
  const normalizedPhone = await validateAndNormalizePhone(params.phone);
  
  const result = await sendWhatsAppTextMessage(normalizedPhone, params.message);
  
  const notificationId = await saveNotification({
    entityType: params.entityType,
    entityId: params.entityId,
    notificationType: params.notificationType,
    phone: normalizedPhone,
    recipientName: params.recipientName,
    messageContent: params.message,
    status: result.success ? 'sent' : 'failed',
    metaMessageId: result.messageId,
    errorMessage: result.error,
    sentBy: params.sentBy,
  });
  
  return {
    success: result.success,
    messageId: result.messageId,
    notificationId: notificationId ?? undefined,
    error: result.error,
  };
}
```

**الأثر:** تقليل التكرار من 5 إلى 0، تحسين قابلية الصيانة

---

### الحل 6: إنشاء دالة مساعدة لمعالجة الأخطاء

**الملف المقترح:** `server/_core/errorHandler.ts`

```typescript
/**
 * معالجة الأخطاء بشكل موحد
 */
export function handleServiceError(error: unknown, context: string): { success: false; error: string } {
  console.error(`[${context}] Error:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'خطأ غير معروف' 
  };
}
```

**الاستخدام:**
```typescript
// قبل:
try {
  // logic
} catch (error) {
  console.error('[WhatsApp Appointments] Failed to send confirmation:', error);
  return { success: false, error: error instanceof Error ? error.message : 'خطأ غير معروف' };
}

// بعد:
try {
  // logic
} catch (error) {
  return handleServiceError(error, 'WhatsApp Appointments');
}
```

**الأثر:** تقليل التكرار من 10+ إلى 0، تحسين اتساق معالجة الأخطاء

---

## خطة التنفيذ المقترحة

### المرحلة 1: إنشاء الدوال المساعدة (Priority: High)
1. إنشاء `server/_core/databaseGuard.ts`
2. إنشاء `server/services/cacheInvalidator.ts`
3. إنشاء `server/_core/statusTimestamps.ts`
4. تحسين `server/services/whatsapp/helpers.ts`
5. إنشاء `server/_core/errorHandler.ts`

### المرحلة 2: استبدال الأنماط المكررة (Priority: High)
1. استبدال التحقق من قاعدة البيانات في جميع Routers
2. استبدال إبطال الـ Cache في جميع الملفات
3. استبدال تحديث Timestamps في campRegistrations و offerLeads
4. استبدال التحقق من رقم الهاتف في خدمات WhatsApp
5. استبدال معالجة الأخطاء في جميع Services

### المرحلة 3: الاختبار والتحقق (Priority: Medium)
1. تشغيل `pnpm check` للتأكد من عدم وجود أخطاء TypeScript
2. تشغيل `pnpm lint` للتأكد من عدم وجود تحذيرات ESLint
3. اختبار الوظائف المتأثرة يدوياً

---

## الفوائد المتوقعة

### تحسين جودة الكود
- ✅ تقليل التكرار بنسبة 80%+
- ✅ تحسين قابلية الصيانة
- ✅ تحسين قابلية إعادة الاستخدام
- ✅ تحسين اتساق الكود

### تحسين الأداء
- ✅ لا يوجد تأثير سلبي على الأداء
- ✅ تحسين كفاءة التطوير

### تحسين الأمان
- ✅ اتساق رسائل الخطأ
- ✅ معالجة أخطاء موحدة

---

## الإحصائيات

| النمط | عدد التكرارات الحالي | بعد التنفيذ | نسبة التحسين |
|-------|----------------------|--------------|---------------|
| التحقق من قاعدة البيانات | 50+ | 0 | 100% |
| إبطال الـ Cache | 15+ | 0 | 100% |
| تحديث Timestamps | 4 | 0 | 100% |
| التحقق من رقم الهاتف | 5 | 0 | 100% |
| إرسال وحفظ الإشعارات | 5 | 0 | 100% |
| معالجة الأخطاء | 10+ | 0 | 100% |
| **المجموع** | **89+** | **0** | **100%** |

---

## التوصيات

1. **البدء بالأنماط الأكثر تكراراً** (التحقق من قاعدة البيانات)
2. **إنشاء الدوال المساعدة في ملفات منفصلة** لسهولة الصيانة
3. **توثيق الدوال المساعدة** بشكل جيد
4. **اختبار كل تغيير** قبل الانتقال إلى التالي
5. **تحديث تقرير CODE_COMPLEXITY_ANALYSIS.md** بعد الانتهاء

---

**حالة التقرير:** ✅ مكتمل - جاهز للتنفيذ
