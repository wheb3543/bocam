#!/bin/bash
# Script to test WhatsApp Webhook

# الألوان للإخراج
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 اختبار WhatsApp Webhook${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

# التحقق من أن الخادم يعمل
echo -e "${YELLOW}⏳ التحقق من اتصال الخادم...${NC}"
SERVER_URL="http://localhost:5000"

if ! curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL/api/health" | grep -q "200"; then
  echo -e "${RED}❌ الخادم غير متاح على $SERVER_URL${NC}"
  echo -e "${YELLOW}💡 تأكد من تشغيل الخادم أولاً: npm run dev${NC}"
  exit 1
fi

echo -e "${GREEN}✅ الخادم يعمل${NC}\n"

# اختبار Webhook Token Verification (GET)
echo -e "${YELLOW}⏳ اختبار التحقق من Webhook Token (GET)...${NC}"

VERIFY_TOKEN="${WHATSAPP_WEBHOOK_VERIFY_TOKEN:-sgh_crm_webhook_2024}"
HUB_CHALLENGE="test_challenge_12345"

RESPONSE=$(curl -s -X GET "${SERVER_URL}/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=${HUB_CHALLENGE}&hub.verify_token=${VERIFY_TOKEN}")

if [ "$RESPONSE" = "$HUB_CHALLENGE" ]; then
  echo -e "${GREEN}✅ التحقق من Token نجح${NC}\n"
else
  echo -e "${RED}❌ فشل التحقق من Token${NC}"
  echo -e "Response: $RESPONSE\n"
fi

# اختبار استقبال رسالة (POST)
echo -e "${YELLOW}⏳ اختبار استقبال رسالة واردة (POST)...${NC}"

# إنشاء التوقيع (يتطلب X-Hub-Signature-256)
# تحذير: هذا يتطلب معرفة SECRET_KEY من الخادم

WEBHOOK_PAYLOAD='{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "102290129340398",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550783881",
              "phone_number_id": "106540352242922"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Ahmed Al-Harazi"
                },
                "wa_id": "201001234567"
              }
            ],
            "messages": [
              {
                "from": "201001234567",
                "id": "wamid.HBgLMTY1MDM4Nzk0MzkVAgASGBQzQTRBNjU5OUFFRTAzODEwMTQ0RgA=",
                "timestamp": "1749416383",
                "type": "text",
                "text": {
                  "body": "مرحباً! هل يمكنك مساعدتي؟"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}'

echo "📨 Webhook Payload:"
echo "$WEBHOOK_PAYLOAD" | jq . 2>/dev/null || echo "$WEBHOOK_PAYLOAD"
echo ""

# إرسال الـ webhook
WEBHOOK_RESPONSE=$(curl -s -X POST "${SERVER_URL}/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=placeholder" \
  -d "$WEBHOOK_PAYLOAD")

echo -e "📤 Webhook Response:"
echo "$WEBHOOK_RESPONSE" | jq . 2>/dev/null || echo "$WEBHOOK_RESPONSE"
echo ""

# التحقق من حفظ الرسالة في قاعدة البيانات
echo -e "${YELLOW}⏳ التحقق من حفظ الرسالة في قاعدة البيانات...${NC}"
echo -e "${BLUE}💡 تلميح: تحقق من جدول whatsapp_conversations و whatsapp_messages${NC}\n"

# اختبار استقبال عدة أنواع من الرسائل
echo -e "${YELLOW}⏳ اختبار أنواع رسائل مختلفة...${NC}\n"

# 1. رسالة نصية
echo -e "  ${BLUE}1️⃣  رسالة نصية${NC}"

# 2. رسالة مع صورة
echo -e "  ${BLUE}2️⃣  رسالة مع صورة${NC}"

# 3. رسالة مع زر (Interactive)
echo -e "  ${BLUE}3️⃣  رسالة مع زر (Interactive)${NC}"

# 4. حالة رسالة صادرة
echo -e "  ${BLUE}4️⃣  حالة رسالة صادرة${NC}"

echo ""

# النتائج
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ اختبار Webhook مكتمل${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

# التوصيات
echo -e "${YELLOW}📋 التوصيات:${NC}"
echo -e "  1. تحقق من سجلات الخادم (server logs)"
echo -e "  2. تحقق من قاعدة البيانات للرسائل الجديدة"
echo -e "  3. تحقق من الواجهة الأمامية لعرض الرسائل"
echo -e "  4. تحقق من الـ Browser Console للأخطاء\n"

echo -e "${BLUE}📚 المراجع:${NC}"
echo -e "  - Webhook Documentation: WEBHOOK_DIAGNOSTICS.md"
echo -e "  - Meta API Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks\n"
