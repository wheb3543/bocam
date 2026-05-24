# ✅ اختبار سريع لـ Webhook

## 📋 الخطوة 1: تحقق من الخادم

```bash
# تشغيل الخادم في terminal 1
cd /Users/cela/Documents/GitHub/sgh-crm-portal0
npm run dev
```

يجب أن ترى:
```
✅ Server running on http://localhost:5000
✅ Database connected
```

---

## 📋 الخطوة 2: اختبر Webhook Token Verification

```bash
# في terminal 2
curl -X GET "http://localhost:5000/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=TEST123&hub.verify_token=sgh_crm_webhook_2024"
```

**النتيجة المتوقعة:**
```
TEST123
```

---

## 📋 الخطوة 3: اختبر استقبال رسالة واردة

```bash
# إنشاء ملف JSON للاختبار
cat > /tmp/webhook_test.json << 'EOF'
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "102290129340398",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550783881",
          "phone_number_id": "106540352242922"
        },
        "contacts": [{
          "profile": { "name": "أحمد الحرازي" },
          "wa_id": "201001234567"
        }],
        "messages": [{
          "from": "201001234567",
          "id": "wamid.test123",
          "timestamp": "1749416383",
          "type": "text",
          "text": { "body": "مرحباً! هذه رسالة اختبار" }
        }]
      },
      "field": "messages"
    }]
  }]
}
EOF

# إرسال الـ webhook
curl -X POST "http://localhost:5000/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=invalid" \
  -d @/tmp/webhook_test.json
```

**النتيجة المتوقعة:**
```json
{"success": true}
```

**تحقق من السجلات (في terminal الخادم):**
```
[WhatsApp Webhook] 📨 Processing webhook with 1 entries
[WhatsApp Webhook] 📨 Incoming text message from 201001234567
[WhatsApp Webhook] ✅ Message processed from 201001234567
[WhatsApp Webhook] ✅ Saved message to conversation...
```

---

## 📋 الخطوة 4: تحقق من قاعدة البيانات

```sql
-- فتح قاعدة البيانات
mysql -u root -p your_database

-- تحقق من المحادثات الجديدة
SELECT id, phoneNumber, customerName, lastMessage FROM whatsapp_conversations 
WHERE phoneNumber = '201001234567' 
ORDER BY createdAt DESC LIMIT 1;

-- تحقق من الرسائل الجديدة
SELECT id, conversationId, direction, content, status FROM whatsapp_messages 
WHERE direction = 'inbound' 
ORDER BY createdAt DESC LIMIT 5;
```

**النتيجة المتوقعة:**
- محادثة جديدة مع رقم `201001234567`
- رسالة جديدة بنص "مرحباً! هذه رسالة اختبار"
- الحالة: `received`

---

## 📋 الخطوة 5: تحقق من الواجهة الأمامية

1. افتح المتصفح: `http://localhost:3000/dashboard/whatsapp`
2. يجب أن ترى محادثة جديدة من "أحمد الحرازي"
3. انقر عليها وتحقق من ظهور الرسالة

**إذا لم تظهر:**
- افتح Browser DevTools (F12)
- انظر إلى Network tab → WS/EventSource
- تحقق من وجود اتصال SSE نشط

---

## 🧪 اختبارات إضافية

### اختبار رسالة مع صورة:

```bash
cat > /tmp/webhook_image.json << 'EOF'
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "102290129340398",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550783881",
          "phone_number_id": "106540352242922"
        },
        "contacts": [{
          "profile": { "name": "محمد علي" },
          "wa_id": "201001234568"
        }],
        "messages": [{
          "from": "201001234568",
          "id": "wamid.image123",
          "timestamp": "1749416383",
          "type": "image",
          "image": {
            "id": "media_id_123",
            "mime_type": "image/jpeg",
            "sha256": "abc123",
            "caption": "صورة طبية"
          }
        }]
      },
      "field": "messages"
    }]
  }]
}
EOF

curl -X POST "http://localhost:5000/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d @/tmp/webhook_image.json
```

### اختبار تحديث حالة الرسالة:

```bash
cat > /tmp/webhook_status.json << 'EOF'
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "102290129340398",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550783881",
          "phone_number_id": "106540352242922"
        },
        "statuses": [{
          "id": "wamid.status123",
          "status": "delivered",
          "timestamp": "1749416383",
          "recipient_id": "201001234567"
        }]
      },
      "field": "messages"
    }]
  }]
}
EOF

curl -X POST "http://localhost:5000/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d @/tmp/webhook_status.json
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: لا تظهر الرسائل

**✓ تحقق من:**
1. السجلات تعرض `[WhatsApp Webhook]` messages
2. قاعدة البيانات تحتوي على records جديدة
3. SSE connection نشط في Browser DevTools

**✗ إذا لم تعمل:**
```bash
# 1. إعادة تشغيل الخادم
npm run dev

# 2. تنظيف قاعدة البيانات (اختياري)
npm run db:reset

# 3. التحقق من متغيرات البيئة
cat .env | grep WHATSAPP
```

### المشكلة: خطأ توقيع

```
[WhatsApp Webhook] ❌ Invalid signature — request rejected
```

**السبب:** غياب أو خطأ في `X-Hub-Signature-256`

**الحل:** تجاهل التوقيع للاختبار (سيتم التحقق من Meta في الإنتاج)

---

## 📊 قائمة فحص الإصلاح

- [ ] الخادم يعمل بدون أخطاء
- [ ] Token verification يعمل
- [ ] استقبال رسالة نصية يعمل
- [ ] قاعدة البيانات تحتوي على data جديد
- [ ] الواجهة الأمامية تعرض محادثات جديدة
- [ ] SSE events تصل بنجاح
- [ ] أنواع رسائل مختلفة تعمل

---

## 📞 معلومات للتواصل

**الملفات المعدلة:**
- ✅ `server/webhooks/whatsappWebhook.ts` - إصلاح استخراج metadata ومعالجة الأخطاء
- ✅ `server/webhookRoutes.ts` - معالج webhook وSSE
- ✅ `server/whatsappSse.ts` - خادم SSE

**الملفات الجديدة:**
- ✅ `WEBHOOK_DIAGNOSTICS.md` - تشخيص مفصل
- ✅ `WEBHOOK_FIX_SUMMARY.md` - ملخص الإصلاح
- ✅ `test-webhook.sh` - اختبار آلي
- ✅ `QUICK_TEST.md` - هذا الملف

---

**آخر تحديث:** 13 مايو 2026  
**الحالة:** ✅ جاهز للاختبار
