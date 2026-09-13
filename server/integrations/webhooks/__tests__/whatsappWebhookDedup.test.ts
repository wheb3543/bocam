import { describe, expect, it } from 'vitest';
import {
  canRetryWhatsAppWebhookDelivery,
  createWhatsAppDeliveryKey,
  filterDuplicateWhatsAppDeliveries,
} from '../whatsappWebhookDedup';

describe('WhatsApp webhook replay protection', () => {
  it('keeps each incoming Meta message once before downstream effects', async () => {
    const reservations = new Set<string>();
    const reserve = async ({ deliveryKey }: { deliveryKey: string }) => {
      if (reservations.has(deliveryKey)) {return false;}
      reservations.add(deliveryKey);
      return true;
    };
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba_1',
          changes: [
            {
              field: 'messages',
              value: {
                messages: [{ id: 'wamid.inbound', from: '967700000000', type: 'text' }],
              },
            },
          ],
        },
      ],
    };

    const first = await filterDuplicateWhatsAppDeliveries(payload, reserve);
    const replay = await filterDuplicateWhatsAppDeliveries(payload, reserve);

    expect(first.stats).toMatchObject({ acceptedMessages: 1, skippedMessages: 0 });
    expect(first.body.entry).toHaveLength(1);
    expect(replay.stats).toMatchObject({ acceptedMessages: 0, skippedMessages: 1 });
    expect(replay.body.entry).toHaveLength(0);
    expect(payload.entry[0].changes[0].value.messages).toHaveLength(1);
  });

  it('does not collapse distinct sent, delivered, and read statuses for the same Meta message', async () => {
    const reservations = new Set<string>();
    const reserve = async ({ deliveryKey }: { deliveryKey: string }) => {
      if (reservations.has(deliveryKey)) {return false;}
      reservations.add(deliveryKey);
      return true;
    };
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                statuses: [
                  { id: 'wamid.outbound', status: 'sent', timestamp: '1780000000' },
                  { id: 'wamid.outbound', status: 'delivered', timestamp: '1780000001' },
                  { id: 'wamid.outbound', status: 'read', timestamp: '1780000002' },
                ],
              },
            },
          ],
        },
      ],
    };

    const first = await filterDuplicateWhatsAppDeliveries(payload, reserve);
    const replay = await filterDuplicateWhatsAppDeliveries(payload, reserve);

    expect(first.stats.acceptedStatuses).toBe(3);
    expect(replay.stats.skippedStatuses).toBe(3);
    expect(createWhatsAppDeliveryKey('status', 'wamid.outbound', 'sent', '1780000000')).not.toBe(
      createWhatsAppDeliveryKey('status', 'wamid.outbound', 'read', '1780000002')
    );
  });

  it('يسمح بإعادة التسليم بعد فشل المعالجة أو انتهاء حجز عالق، ولا يعيد معالجة المكتمل', () => {
    const now = new Date('2026-08-26T12:00:00.000Z');
    expect(canRetryWhatsAppWebhookDelivery('failed', now, now)).toBe(true);
    expect(
      canRetryWhatsAppWebhookDelivery('processing', new Date('2026-08-26T11:57:59.000Z'), now)
    ).toBe(true);
    expect(
      canRetryWhatsAppWebhookDelivery('processing', new Date('2026-08-26T11:59:00.000Z'), now)
    ).toBe(false);
    expect(
      canRetryWhatsAppWebhookDelivery('processed', new Date('2026-08-26T10:00:00.000Z'), now)
    ).toBe(false);
  });
});
