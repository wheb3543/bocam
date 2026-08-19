import { describe, expect, it, vi } from 'vitest';
import { publishToExternalPlatform } from './externalPublishingConnector';

describe('external publishing connector', () => {
  it('publishes a text post to X and returns its external id without exposing the token', async () => {
    const http = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ data: { id: 'x-post-42' } }),
      headers: { get: () => null },
    });
    const result = await publishToExternalPlatform(
      {
        platform: 'x',
        targetId: 'x-user',
        accessToken: 'secret-x-token',
        caption: 'رسالة اختبار',
        contentType: 'post',
        media: [],
      },
      http
    );

    expect(result).toEqual(expect.objectContaining({ kind: 'published', externalPostId: 'x-post-42' }));
    expect(http).toHaveBeenCalledWith(
      'https://api.x.com/2/tweets',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer secret-x-token' }) })
    );
    expect(JSON.stringify(result)).not.toContain('secret-x-token');
  });

  it('uses the current LinkedIn Posts API contract for an organization author', async () => {
    const http = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({}),
      headers: { get: (name: string) => (name === 'x-restli-id' ? 'urn:li:share:99' : null) },
    });
    const result = await publishToExternalPlatform(
      {
        platform: 'linkedin',
        targetId: 'urn:li:organization:77',
        accessToken: 'linkedin-token',
        caption: 'منشور المؤسسة',
        contentType: 'post',
        media: [],
      },
      http
    );

    expect(result).toEqual(expect.objectContaining({ kind: 'published', externalPostId: 'urn:li:share:99' }));
    const [, init] = http.mock.calls[0] as [string, { headers?: Record<string, string> }];
    expect(init.headers).toEqual(expect.objectContaining({ 'Linkedin-Version': '202602' }));
  });

  it('does not try to send a YouTube or TikTok post without the required video transfer session', async () => {
    const http = vi.fn();
    const result = await publishToExternalPlatform(
      {
        platform: 'youtube',
        targetId: 'channel-1',
        accessToken: 'youtube-token',
        caption: 'فيديو',
        contentType: 'video',
        media: [{ url: 'https://cdn.example.test/video.mp4', type: 'video' }],
      },
      http
    );

    expect(result).toEqual(expect.objectContaining({ kind: 'failed', retryable: false }));
    expect(http).not.toHaveBeenCalled();
  });
});
