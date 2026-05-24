# دليل تحسين الأداء الشامل | Performance Optimization Guide

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 📋 نظرة عامة

تم تصميم SGH CRM Portal ليكون سريعاً وفعالاً. يغطي هذا الدليل استراتيجيات تحسين الأداء المطبقة في النظام وكيفية الحفاظ على الأداء العالي.

### أهداف الأداء

| المقياس | الهدف |
|---------|-------|
| **First Contentful Paint (FCP)** | < 1.5 ثانية |
| **Time to Interactive (TTI)** | < 3.5 ثانية |
| **Largest Contentful Paint (LCP)** | < 2.5 ثانية |
| **Cumulative Layout Shift (CLS)** | < 0.1 |
| **Time to First Byte (TTFB)** | < 600 مللي ثانية |

---

## 🚀 تحسينات Frontend

### 1. تقسيم الكود (Code Splitting)

يستخدم المشروع تقسيم الكود الديناميكي لتقليل حجم الحزمة الأولية:

```typescript
// تحميل مكونات بشكل ديناميكي
const WhatsAppDashboard = lazy(() => import('../pages/WhatsAppDashboard'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));

// في المكون
<Suspense fallback={<LoadingSpinner />}>
  <WhatsAppDashboard />
</Suspense>
```

### 2. تحسين الصور

```typescript
// استخدام تنسيقات الصور الحديثة
<Image 
  src="/doctors/ahmed.jpg" 
  alt="د. أحمد"
  width={300}
  height={300}
  loading="lazy"
  quality={80}
/>

// استخدام WebP مع fallback
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="صورة" />
</picture>
```

### 3. Virtualization للجداول الكبيرة

```typescript
import { useVirtual } from '@tanstack/react-virtual';

// للجداول التي تحتوي على 1000+ صف
const { virtualItems, totalSize } = useVirtual({
  count: data.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 50,
  overscan: 10
});
```

### 4. تحسين استعلامات tRPC

```typescript
// استخدام prefetching للبيانات المتوقعة
const utils = trpc.useContext();
utils.prefetchQuery(['customers', { page: 1 }]);

// استخدام select لاختيار الحقول المطلوبة فقط
const { data } = trpc.customers.list.useQuery(
  { page: 1 },
  { select: (data) => ({ customers: data.customers }) }
);
```

### 5. Memoization للمكونات

```typescript
// استخدام React.memo للمكونات الثابتة
const CustomerRow = memo(({ customer }: { customer: Customer }) => {
  return (
    <tr>
      <td>{customer.name}</td>
      <td>{customer.phone}</td>
    </tr>
  );
});

// استخدام useMemo للحسابات المعقدة
const filteredData = useMemo(() => {
  return data.filter(item => matchesFilter(item, filters));
}, [data, filters]);
```

---

## ⚡ تحسينات Backend

### 1. فهرسة قاعدة البيانات

```sql
-- فهارس أساسية
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);

-- فهارس مركبة
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
```

### 2. تحسين استعلامات Drizzle

```typescript
// ❌ سيء - تحميل جميع الحقول
const users = await db.select().from(users);

// ✅ جيد - تحميل الحقول المطلوبة فقط
const users = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email
  })
  .from(users)
  .where(eq(users.isActive, true));
```

### 3. Pagination للبيانات الكبيرة

```typescript
// استخدام pagination دائماً للجداول الكبيرة
const PAGE_SIZE = 25;

const [data, total] = await Promise.all([
  db.select().from(customers)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .orderBy(desc(customers.createdAt)),
  
  db.select({ count: count() }).from(customers)
]);
```

### 4. Caching مع Redis

```typescript
import { redis } from './redis';

// تخزين البيانات المؤقتة
async function getCachedCustomers(page: number) {
  const cacheKey = `customers:page:${page}`;
  
  // التحقق من الذاكرة المؤقتة
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // جلب من قاعدة البيانات
  const data = await fetchCustomers(page);
  
  // تخزين في الذاكرة المؤقتة لمدة 5 دقائق
  await redis.setex(cacheKey, 300, JSON.stringify(data));
  
  return data;
}
```

### 5. تحسين عمليات WhatsApp

```typescript
// استخدام Queue للرسائل الجماعية
const broadcastQueue = new Queue('whatsapp-broadcast', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

// معالجة متوازية
broadcastQueue.process('send', 10, async (job) => {
  return sendWhatsAppMessage(job.data);
});
```

---

## 📊 المراقبة والقياس

### 1. أدوات القياس

```bash
# قياس أداء الصفحة
npm install -g lighthouse
lighthouse https://sghsanaa.net --view

# قياس حجم الحزمة
npm install -g webpack-bundle-analyzer
pnpm build
webpack-bundle-analyzer dist/
```

### 2. مراقبة الأداء في الإنتاج

```typescript
// Web Vitals monitoring
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onFCP(console.log);
onLCP(console.log);
onTTFB(console.log);

// إرسال البيانات إلى خادم المراقبة
function sendToAnalytics(metric) {
  const body = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
  };

  navigator.sendBeacon('/api/analytics', JSON.stringify(body));
}
```

### 3. تتبع الاستعلامات البطيئة

```typescript
// في drizzle.config.ts
import { logger } from './logger';

db.$on('query', (event) => {
  if (event.duration > 1000) { // أكثر من ثانية
    logger.warn('Slow query detected', {
      query: event.query,
      duration: event.duration,
      params: event.params
    });
  }
});
```

---

## 🔧 نصائح التحسين

### Frontend

| النصيحة | التأثير |
|---------|---------|
| استخدام React.lazy للمكونات الكبيرة | تقليل حجم الحزمة الأولية |
| تحميل الصور بشكل كسول (lazy loading) | تحسين FCP |
| تقليل إعادة التقديم (re-renders) | تحسين الاستجابة |
| استخدام Service Worker | تمكين العمل بدون إنترنت |
| ضغط ملفات JavaScript | تقليل حجم التحميل |

### Backend

| النصيحة | التأثير |
|---------|---------|
| فهرسة الأعمدة المستخدمة في WHERE | تسريع الاستعلامات |
| استخدام SELECT بدلاً من SELECT * | تقليل نقل البيانات |
| تخزين النتائج المؤقتة | تقليل حمل قاعدة البيانات |
| معالجة الخلفية مع Queue | تحسين وقت الاستجابة |
| ضغط استجابات API | تقليل حجم النقل |

### Database

| النصيحة | التأثير |
|---------|---------|
| استخدام CONNECTION POOLING | تحسين أداء الاتصالات |
| تحليل الاستعلامات البطيئة | تحديد الاختناقات |
| صيانة الفهارس بانتظام | الحفاظ على الأداء |
| تقسيم الجداول الكبيرة | تحسين استعلامات البحث |
| استخدام READ REPLICAS | توزيع حمل القراءة |

---

## 📈 تقارير الأداء

### تقرير الأداء الشهري

يتم إنشاء تقرير أداء شهري يتضمن:

1. **مقاييس Core Web Vitals**
2. **أوقات استجابة API**
3. **معدلات الخطأ**
4. **استخدام الموارد**
5. **توصيات التحسين**

### أدوات المراقبة

- **Google Analytics 4** - تحليل حركة المرور
- **Sentry** - تتبع الأخطاء
- **LogRocket** - تسجيل الجلسات
- **Prometheus + Grafana** - مراقبة الخادم

---

<a name="english"></a>

## 📋 Overview

SGH CRM Portal is designed to be fast and efficient. This guide covers the performance optimization strategies applied in the system and how to maintain high performance.

### Performance Goals

| Metric | Target |
|--------|--------|
| **First Contentful Paint (FCP)** | < 1.5 seconds |
| **Time to Interactive (TTI)** | < 3.5 seconds |
| **Largest Contentful Paint (LCP)** | < 2.5 seconds |
| **Cumulative Layout Shift (CLS)** | < 0.1 |
| **Time to First Byte (TTFB)** | < 600 milliseconds |

---

## 🚀 Frontend Optimizations

### 1. Code Splitting

The project uses dynamic code splitting to reduce initial bundle size:

```typescript
const WhatsAppDashboard = lazy(() => import('../pages/WhatsAppDashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <WhatsAppDashboard />
</Suspense>
```

### 2. Image Optimization

```typescript
<Image 
  src="/doctors/ahmed.jpg" 
  alt="Dr. Ahmed"
  width={300}
  height={300}
  loading="lazy"
  quality={80}
/>
```

### 3. Virtualization for Large Tables

```typescript
const { virtualItems } = useVirtual({
  count: data.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 50,
  overscan: 10
});
```

### 4. tRPC Query Optimization

```typescript
// Prefetch expected data
const utils = trpc.useContext();
utils.prefetchQuery(['customers', { page: 1 }]);
```

---

## ⚡ Backend Optimizations

### 1. Database Indexing

```sql
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
```

### 2. Query Optimization

```typescript
// Good - select only needed fields
const users = await db
  .select({ id: users.id, name: users.name })
  .from(users)
  .where(eq(users.isActive, true));
```

### 3. Redis Caching

```typescript
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Cache for 5 minutes
await redis.setex(cacheKey, 300, JSON.stringify(data));
```

---

## 📊 Monitoring

### Performance Monitoring

```bash
# Lighthouse audit
lighthouse https://sghsanaa.net --view

# Bundle analysis
webpack-bundle-analyzer dist/
```

### Web Vitals Tracking

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onFCP(console.log);
onLCP(console.log);
onTTFB(console.log);
```

---

<div align="center">

**نرعاكم كأهالينا - Caring like family**

Made with ❤️ by SGH Team

</div>