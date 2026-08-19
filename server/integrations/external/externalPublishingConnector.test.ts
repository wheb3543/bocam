import { describe, expect, it, vi } from 'vitest';
import { publishToExternalPlatform } from './externalPublishingConnector';

const video = {
  url: '/manus-storage/media/test-video.mp4',
  key: 'media/test-video.mp4',
  type: 'video' as const,
  size: 16 * 1024 * 1024,
  mimeType: 'video/mp4',
};

function response(input: {
  status?: number;
  json?: unknown;
  headers?: Record<string, string>;
}) {
  const headers = Object.fromEntries(
    Object.entries(input.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])
  );
  return {
    ok: (input.status ?? 200) >= 200 && (input.status ?? 200) < 300,
    status: input.status ?? 200,
    json: async () => input.json ?? {},
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
  };
}

describe('external publishing connector', () => {
  it('publishes a text post to X and returns its external id without exposing the token', async () => {
    const http = vi.fn().mockResolvedValue(response({ status: 201, json: { data: { id: 'x-post-42' } } }));
    const result = await publishToExternalPlatform(
      { platform: 'x', targetId: 'x-user', accessToken: 'secret-x-token', caption: 'رسالة اختبار', contentType: 'post', media: [] },
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
    const http = vi.fn().mockResolvedValue(response({ status: 201, headers: { 'x-restli-id': 'urn:li:share:99' } }));
    const result = await publishToExternalPlatform(
      { platform: 'linkedin', targetId: 'urn:li:organization:77', accessToken: 'linkedin-token', caption: 'منشور المؤسسة', contentType: 'post', media: [] },
      http
    );

    expect(result).toEqual(expect.objectContaining({ kind: 'published', externalPostId: 'urn:li:share:99' }));
    const [, init] = http.mock.calls[0] as [string, { headers?: Record<string, string> }];
    expect(init.headers).toEqual(expect.objectContaining({ 'Linkedin-Version': '202602' }));
  });

  it('starts a YouTube resumable session and persists the next byte after a partial upload', async () => {
    const http = vi
      .fn()
      .mockResolvedValueOnce(response({ status: 200, headers: { location: 'https://upload.youtube.test/session-1' } }))
      .mockResolvedValueOnce(response({ status: 308, headers: { range: 'bytes=0-8388607' } }));
    const readMediaChunk = vi.fn().mockResolvedValue(new Uint8Array(8 * 1024 * 1024));

    const result = await publishToExternalPlatform(
      { platform: 'youtube', targetId: 'channel-1', accessToken: 'youtube-token', title: 'فيديو SGH', caption: 'وصف الفيديو', contentType: 'video', media: [video] },
      http,
      { readMediaChunk }
    );

    expect(result).toEqual(expect.objectContaining({ kind: 'processing', retryAfterSeconds: 5 }));
    expect(result).toEqual(expect.objectContaining({ providerState: expect.objectContaining({ protocol: 'youtube-resumable', nextByte: 8 * 1024 * 1024 }) }));
    expect(http.mock.calls[0]?.[0]).toContain('upload/youtube/v3/videos?uploadType=resumable');
    expect(http.mock.calls[1]).toEqual(
      expect.arrayContaining([
        'https://upload.youtube.test/session-1',
        expect.objectContaining({ headers: expect.objectContaining({ 'Content-Range': 'bytes 0-8388607/16777216' }) }),
      ])
    );
  });

  it('probes a previous YouTube session before retrying the next chunk after an interruption', async () => {
    const http = vi
      .fn()
      .mockResolvedValueOnce(response({ status: 308, headers: { range: 'bytes=0-4194303' } }))
      .mockResolvedValueOnce(response({ status: 308, headers: { range: 'bytes=0-12582911' } }));
    const readMediaChunk = vi.fn().mockResolvedValue(new Uint8Array(8 * 1024 * 1024));

    const result = await publishToExternalPlatform(
      {
        platform: 'youtube',
        targetId: 'channel-1',
        accessToken: 'youtube-token',
        caption: 'فيديو',
        contentType: 'video',
        media: [video],
        providerState: {
          protocol: 'youtube-resumable',
          transferUrl: 'https://upload.youtube.test/session-2',
          mediaKey: video.key,
          totalBytes: video.size,
          mimeType: 'video/mp4',
          nextByte: 0,
          probeBeforeNextChunk: true,
        },
      },
      http,
      { readMediaChunk }
    );

    expect(result).toEqual(expect.objectContaining({ kind: 'processing', providerState: expect.objectContaining({ nextByte: 12 * 1024 * 1024 }) }));
    expect(http.mock.calls[0]?.[1]).toEqual(expect.objectContaining({ headers: expect.objectContaining({ 'Content-Range': 'bytes */16777216' }) }));
    expect(readMediaChunk).toHaveBeenCalledWith(expect.objectContaining({ key: video.key }), 4 * 1024 * 1024, 12 * 1024 * 1024 - 1);
  });

  it('initializes TikTok direct post, uploads one chunk, and persists publish tracking state', async () => {
    const http = vi
      .fn()
      .mockResolvedValueOnce(response({ status: 200, json: { data: { privacy_level_options: ['SELF_ONLY'], comment_disabled: false, duet_disabled: false, stitch_disabled: false }, error: { code: 'ok' } } }))
      .mockResolvedValueOnce(response({ status: 200, json: { data: { publish_id: 'pub-1', upload_url: 'https://upload.tiktok.test/1' }, error: { code: 'ok' } } }))
      .mockResolvedValueOnce(response({ status: 200 }));
    const readMediaChunk = vi.fn().mockResolvedValue(new Uint8Array(8 * 1024 * 1024));

    const result = await publishToExternalPlatform(
      { platform: 'tiktok', targetId: 'creator-1', accessToken: 'tiktok-token', caption: 'فيديو تجريبي', contentType: 'video', media: [video] },
      http,
      { readMediaChunk, now: () => 1_000 }
    );

    expect(result).toEqual(expect.objectContaining({ kind: 'processing', providerState: expect.objectContaining({ publishId: 'pub-1', mode: 'direct', nextByte: 8 * 1024 * 1024 }) }));
    expect(http.mock.calls[0]?.[0]).toBe('https://open.tiktokapis.com/v2/post/publish/creator_info/query/');
    expect(http.mock.calls[1]?.[0]).toBe('https://open.tiktokapis.com/v2/post/publish/video/init/');
    expect(http.mock.calls[2]?.[1]).toEqual(expect.objectContaining({ headers: expect.objectContaining({ 'Content-Range': 'bytes 0-8388607/16777216' }) }));
  });

  it('tracks TikTok upload completion by publish_id without issuing another media transfer', async () => {
    const http = vi.fn().mockResolvedValue(
      response({ status: 200, json: { data: { status: 'PUBLISH_COMPLETE', publicaly_available_post_id: ['tt-42'] }, error: { code: 'ok' } } })
    );

    const result = await publishToExternalPlatform(
      {
        platform: 'tiktok',
        targetId: 'creator-1',
        accessToken: 'tiktok-token',
        caption: 'فيديو',
        contentType: 'video',
        media: [video],
        providerState: {
          protocol: 'tiktok-file-upload',
          transferUrl: 'https://upload.tiktok.test/1',
          publishId: 'pub-42',
          mode: 'upload',
          mediaKey: video.key,
          totalBytes: video.size,
          mimeType: 'video/mp4',
          nextByte: video.size,
        },
      },
      http
    );

    expect(result).toEqual(expect.objectContaining({ kind: 'published', externalPostId: 'tt-42' }));
    expect(http).toHaveBeenCalledWith('https://open.tiktokapis.com/v2/post/publish/status/fetch/', expect.any(Object));
  });
});
