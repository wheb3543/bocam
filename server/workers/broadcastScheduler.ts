import { queueWhatsAppMessage } from '../queues/whatsappQueue';

async function processScheduledBroadcasts() {
  try {
    const { getDb } = await import('../db');
    const db = await getDb();
    if (!db) return;
    const { whatsappBroadcasts } = await import('../../drizzle/schema');

    const now = new Date();
    const rows = await db.select().from(whatsappBroadcasts).where(whatsappBroadcasts.status.eq('scheduled')).where(whatsappBroadcasts.scheduledAt.lte(now));

    for (const b of rows) {
      try {
        console.log('[Broadcast Scheduler] Enqueuing broadcast', b.id, b.name);
        // Mark as sending
        await db.update(whatsappBroadcasts).set({ status: 'sending' }).where(whatsappBroadcasts.id.eq(b.id));

        // TODO: expand targetFilter into recipient list. For now we enqueue a placeholder job
        await queueWhatsAppMessage({
          to: '+000000000', // placeholder: implement recipient expansion based on b.targetFilter
          templateName: 'custom_message',
          language: 'en',
          components: [
            { type: 'body', parameters: [{ type: 'text', text: b.message }] }
          ],
          metadata: { bookingId: b.id }
        });

        // mark as completed (or keep status sending if processing continues)
        await db.update(whatsappBroadcasts).set({ status: 'completed', completedAt: new Date() }).where(whatsappBroadcasts.id.eq(b.id));
        console.log('[Broadcast Scheduler] Broadcast processed', b.id);
      } catch (err) {
        console.error('[Broadcast Scheduler] Failed to process broadcast', b.id, err);
        await db.update(whatsappBroadcasts).set({ status: 'failed' }).where(whatsappBroadcasts.id.eq(b.id));
      }
    }
  } catch (err) {
    console.error('[Broadcast Scheduler] Error while scanning scheduled broadcasts', err);
  }
}

// Run the scheduler every minute using native setInterval
setInterval(async () => {
  try { await processScheduledBroadcasts(); } catch (e) { console.error(e); }
}, 60 * 1000);

// Run once on startup
processScheduledBroadcasts();

export {};
