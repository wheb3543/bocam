import { describe, expect, it } from 'vitest';
import { buildSocialInboxFilters, inboxTabs, platformConfig } from './socialInboxConfig';

describe('social inbox configuration', () => {
  it('contains the requested message and comment tabs', () => {
    expect(inboxTabs.map((tab) => tab.id)).toEqual([
      'all-messages',
      'messenger',
      'instagram',
      'x',
      'linkedin',
      'facebook-comments',
      'instagram-comments',
      'x-comments',
      'linkedin-comments',
      'youtube-comments',
    ]);
  });

  it('maps every supported platform to a branded display config', () => {
    expect(Object.keys(platformConfig).sort()).toEqual(
      ['facebook', 'instagram', 'linkedin', 'messenger', 'x', 'youtube'].sort()
    );
    expect(platformConfig.facebook.label).toBe('Facebook');
    expect(platformConfig.instagram.label).toBe('Instagram');
    expect(platformConfig.linkedin.label).toBe('LinkedIn');
  });

  it('builds message filters with a trimmed search value', () => {
    const tab = inboxTabs.find((item) => item.id === 'instagram');
    if (!tab) {
      throw new Error('Instagram tab is not configured');
    }
    expect(buildSocialInboxFilters(tab, '  appointment  ')).toEqual({
      platform: 'instagram',
      channelType: 'message',
      search: 'appointment',
    });
  });

  it('builds a Facebook-specific comment filter', () => {
    const tab = inboxTabs.find((item) => item.id === 'facebook-comments');
    if (!tab) {
      throw new Error('Facebook comments tab is not configured');
    }
    expect(buildSocialInboxFilters(tab, '   ')).toEqual({
      platform: 'facebook',
      channelType: 'comment',
      search: undefined,
    });
  });
});
