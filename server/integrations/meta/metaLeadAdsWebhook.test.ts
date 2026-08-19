import { describe, expect, it } from 'vitest';
import { extractMetaLeadgenNotifications } from './metaLeadAdsWebhook';

describe('Meta Lead Ads webhook extraction', () => {
  it('extracts leadgen identifiers without exposing or resolving form fields inside the callback', () => {
    const events = extractMetaLeadgenNotifications({
      object: 'page',
      entry: [
        {
          id: 'page-42',
          changes: [
            {
              field: 'leadgen',
              value: { leadgen_id: 'lead-77', form_id: 'form-18', created_time: 1_700_000_000 },
            },
          ],
        },
      ],
    });

    expect(events).toEqual([
      expect.objectContaining({
        externalLeadId: 'lead-77',
        externalFormId: 'form-18',
        externalPageId: 'page-42',
        eventKey: 'meta-leadgen:page-42:lead-77:1700000000',
      }),
    ]);
    expect(JSON.stringify(events)).not.toContain('full_name');
  });

  it('ignores message and comment change notifications', () => {
    expect(
      extractMetaLeadgenNotifications({
        entry: [{ id: 'page-42', changes: [{ field: 'feed', value: { comment_id: 'comment-1' } }] }],
      })
    ).toEqual([]);
  });
});
