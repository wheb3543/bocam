import {
  ensureSocialInboxAccount,
  ingestMetaSocialInboxEvent,
  updateSocialInboxAccount,
} from '../../database/db/socialInbox';
import { META_TEST_DATA_LABEL, metaPayloadFixtures } from './metaPayloadFixtures';
import { normalizeMetaSocialInboxPayload } from './socialInboxMetaWebhook';

type SeedResult = {
  expected: number;
  normalized: number;
  processed: number;
  duplicate: number;
  ignored: number;
  gapFixtures: string[];
};

const accountNames = {
  messenger: 'Meta Test · Messenger',
  instagram: 'Meta Test · Instagram',
  facebook: 'Meta Test · Facebook',
} as const;

/**
 * يُدخل أحداث الاختبار بعد تشغيل نفس دالة التطبيع والتخزين المستخدمة من Webhook.
 * المعرفات محجوزة للبادئة sgh-meta-test- ويمكن تنظيفها عبر الإجراء الإداري.
 */
export async function seedMetaSocialInboxTestData(): Promise<SeedResult> {
  const normalizedByFixture = metaPayloadFixtures.map((fixture) => ({
    fixture,
    events: normalizeMetaSocialInboxPayload(fixture.payload),
  }));
  const events = normalizedByFixture.flatMap(({ events: fixtureEvents }) => fixtureEvents);
  const testAccounts = new Map<string, { id: number; platform: keyof typeof accountNames }>();

  for (const event of events) {
    const accountKey = `${event.platform}:${event.accountExternalId}`;
    if (testAccounts.has(accountKey)) {
      continue;
    }

    const accountId = await ensureSocialInboxAccount({
      platform: event.platform,
      externalAccountId: event.accountExternalId,
      displayName: accountNames[event.platform],
      accountType: event.platform === 'instagram' ? 'business' : 'page',
    });
    await updateSocialInboxAccount(accountId, {
      metadata: JSON.stringify({ testData: true, label: META_TEST_DATA_LABEL }),
    });
    testAccounts.set(accountKey, { id: accountId, platform: event.platform });
  }

  const results = [] as Array<Awaited<ReturnType<typeof ingestMetaSocialInboxEvent>>>;
  for (const event of events) {
    results.push(await ingestMetaSocialInboxEvent(event));
  }

  for (const account of Array.from(testAccounts.values())) {
    await updateSocialInboxAccount(account.id, {
      status: 'connected',
      lastSyncedAt: new Date(),
      lastError: null,
    });
  }

  return {
    expected: metaPayloadFixtures.reduce((count, fixture) => count + fixture.expectedEventCount, 0),
    normalized: events.length,
    processed: results.filter((result) => result.status === 'processed').length,
    duplicate: results.filter((result) => result.status === 'duplicate').length,
    ignored: results.filter((result) => result.status === 'ignored').length,
    gapFixtures: normalizedByFixture
      .filter(
        ({ fixture, events: fixtureEvents }) =>
          fixture.expectedEventCount === 0 && fixtureEvents.length === 0
      )
      .map(({ fixture }) => fixture.label),
  };
}
