# تشخيص مشاكل Webhook للرسائل الواردة
**التاريخ:** 13 مايو 2026  
**الحالة:** 🔧 تحت الإصلاح

---

## 🔍 المشكلة المكتشفة

### المشاكل الموجودة في معالج Webhook:

#### ❌ المشكلة 1: استخراج Metadata غير صحيح
**المسار:** `server/webhooks/whatsappWebhook.ts` - السطر 762

**المشكلة:**
```typescript
// ❌ قديم - خطأ
const metadata = value.metadata || {
  phone_number_id: value.phone_number_id,  // ❌ لا يوجد هنا
  display_phone_number: value.display_phone_number,  // ❌ لا يوجد هنا
  contacts: value.contacts,  // ✅ هنا فقط صحيح
};
```

**البنية الصحيحة وفقاً لـ Meta:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "field": "messages",
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "phone_number_id": "106540352242922",
          "display_phone_number": "15550783881"
        },
        "contacts": [
          {
            "profile": { "name": "Sheena Nelson" },
            "wa_id": "16505551234"
          }
        ],
        "messages": [
          {
            "from": "16505551234",
            "id": "wamid.HBgL...",
            "timestamp": "1749416383",
            "type": "text",
            "text": { "body": "Does it come in another color?" }
          }
        ]
      }
    }]
  }]
}
```

**الإصلاح:**
```typescript
// ✅ جديد - صحيح
const metadata = {
  phone_number_id: value.metadata?.phone_number_id,
  display_phone_number: value.metadata?.display_phone_number,
  contacts: value.contacts || [],  // من value مباشرة
};
```

---

#### ❌ المشكلة 2: عدم التعامل مع الأخطاء من Meta
**البيانات الخاصة بـ Meta Webhooks تشمل أخطاء في ثلاثة مواضع:**

1. **أخطاء النظام/التطبيق/الحساب:**
   ```json
   {
     "value": {
       "errors": [
         {
           "code": 1234,
           "title": "Error Title",
           "message": "Error message"
         }
       ]
     }
   }
   ```

2. **أخطاء الرسائل الواردة (Unsupported message type):**
   ```json
   {
     "messages": [
       {
         "from": "...",
         "id": "...",
         "type": "unsupported",
         "errors": [
           {
             "code": 131030,
             "title": "Unsupported message type",
             "message": "..."
           }
         ]
       }
     ]
   }
   ```

3. **أخطاء حالة الرسائل الصادرة:**
   ```json
   {
     "statuses": [
       {
         "id": "wamid...",
         "status": "failed",
         "timestamp": "...",
         "errors": [
           {
             "code": 131047,
             "title": "Message failed to send",
             "message": "24-hour window expired"
           }
         ]
       }
     ]
   }
   ```

**الإصلاح:** تم إضافة معالجة للأخطاء في جميع المواضع الثلاثة

---

### ✅ التحسينات المطبقة:

1. ✅ **تصحيح استخراج Metadata**: استخراج صحيح من `value.metadata` و `value.contacts`
2. ✅ **معالجة الأخطاء**: معالجة الأخطاء في الثلاث مواضع حسب وثائق Meta
3. ✅ **تسجيل تفصيلي**: إضافة logs مفصلة للتحقق من البيانات
4. ✅ **التحقق من صحة البيانات**: التحقق من وجود البيانات الأساسية قبل المعالجة
5. ✅ **التعامل مع الرسائل غير المدعومة**: تخطي الرسائل من نوع "unsupported"

---

## 📋 Checklist للتحقق

- [ ] تم تلقي الرسالة من WhatsApp
- [ ] تم التحقق من توقيع الـ Webhook
- [ ] تم استخراج البيانات الأساسية بشكل صحيح
- [ ] تم إنشاء/تحديث المحادثة
- [ ] تم حفظ الرسالة في قاعدة البيانات
- [ ] تم نشر SSE event للتحديث الفوري
- [ ] تم معالجة الأخطاء إن وجدت

---

## 🧪 اختبار الـ Webhook

### باستخدام curl:

```bash
curl -X POST http://localhost:5000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "phone_number_id": "106540352242922",
            "display_phone_number": "15550783881"
          },
          "contacts": [{
            "profile": { "name": "Ahmed" },
            "wa_id": "201001234567"
          }],
          "messages": [{
            "from": "201001234567",
            "id": "wamid.test123",
            "timestamp": "1749416383",
            "type": "text",
            "text": { "body": "Hello World" }
          }]
        }
      }]
    }]
  }'
```

---

## 📊 رسائل الخطأ الشائعة من Meta

| الكود | العنوان | المعنى | الحل |
|------|--------|-------|------|
| 131030 | Unsupported message type | نوع رسالة غير مدعوم | تخطي الرسالة |
| 131047 | 24-hour window expired | انتهت نافذة 24 ساعة | إرسال قالب بدلاً من النص |
| 1104 | Invalid access token | توكن غير صالح | تحديث TOKEN |
| 1200 | 429 throttling error | عدد الطلبات كثير | انتظر وأعد المحاولة |

---

## 🔗 المراجع الرسمية من Meta

- [Webhook Reference - Messages](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-example#messages)
- [Error Handling](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/errors)
- [Webhook Payload Overview](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/overview)

---

## ✨ الخطوات التالية

- [ ] اختبار استقبال الرسائل الواردة
- [ ] التحقق من ظهورها في Dashboard
- [ ] اختبار أنواع رسائل مختلفة (نص، صور، ملفات)
- [ ] اختبار معالجة الأخطاء
