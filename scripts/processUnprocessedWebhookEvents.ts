import { getWebhookEvents, markWebhookEventAsProcessed } from "../server/db";
import { processWebhookEvent } from "../server/webhooks/whatsappWebhook";

async function processUnprocessedWebhookEvents() {
  const events = await getWebhookEvents({ processed: false, limit: 100 });
  if (!events.length) {
    console.log("لا توجد أحداث غير معالجة.");
    return;
  }
  for (const event of events) {
    try {
      const payload = JSON.parse(event.rawPayload);
      await processWebhookEvent(payload);
      await markWebhookEventAsProcessed(event.id, true);
      console.log(`[WebhookEvents] ✅ Event ${event.id} processed successfully`);
    } catch (error) {
      console.error(`[WebhookEvents] ❌ Failed to process event ${event.id}:`, error);
    }
  }
}

processUnprocessedWebhookEvents().then(() => {
  console.log("انتهت معالجة جميع الأحداث غير المعالجة.");
  process.exit(0);
});
