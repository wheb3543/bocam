import { describe, expect, it, vi } from 'vitest';
import { publishToMeta, type MetaPublishClient } from './metaPublishingConnector';

function createClient(): MetaPublishClient & { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> } {
  const post = vi.fn();
  const get = vi.fn();
  return { postWithAccessToken: post, getWithAccessToken: get, post, get };
}

describe('Meta social publishing connector', () => {
  it('publishes a single Facebook image using the Page photos endpoint and returns the external post id', async () => {
    const client = createClient();
    client.post.mockResolvedValue({ ok: true, status: 200, data: { id: 'photo-id', post_id: 'page-post-id' } });

    const result = await publishToMeta(
      {
        platform: 'facebook',
        targetId: 'page-1',
        accessToken: 'server-only-token',
        caption: 'نص المنشور',
        contentType: 'image',
        media: [{ url: 'https://cdn.example/image.jpg', type: 'image' }],
      },
      client
    );

    expect(client.post).toHaveBeenCalledWith('page-1/photos', 'server-only-token', {
      url: 'https://cdn.example/image.jpg',
      caption: 'نص المنشور',
    });
    expect(result).toEqual(
      expect.objectContaining({ kind: 'published', externalPostId: 'page-post-id' })
    );
  });

  it('stores a new Instagram container as processing before its media is ready to publish', async () => {
    const client = createClient();
    client.post.mockResolvedValue({ ok: true, status: 200, data: { id: 'ig-container-1' } });

    const result = await publishToMeta(
      {
        platform: 'instagram',
        targetId: 'ig-1',
        accessToken: 'server-only-token',
        caption: 'فيديو تجريبي',
        contentType: 'reel',
        media: [{ url: 'https://cdn.example/video.mp4', type: 'video' }],
      },
      client
    );

    expect(result).toEqual({
      kind: 'processing',
      retryAfterSeconds: 60,
      providerState: { containerId: 'ig-container-1' },
    });
    expect(client.post).toHaveBeenCalledWith(
      'ig-1/media',
      'server-only-token',
      expect.objectContaining({ video_url: 'https://cdn.example/video.mp4', media_type: 'REELS' })
    );
  });

  it('publishes an Instagram container only after Meta reports that it is finished', async () => {
    const client = createClient();
    client.get.mockResolvedValue({ ok: true, status: 200, data: { status_code: 'FINISHED' } });
    client.post.mockResolvedValue({ ok: true, status: 200, data: { id: 'ig-media-1' } });

    const result = await publishToMeta(
      {
        platform: 'instagram',
        targetId: 'ig-1',
        accessToken: 'server-only-token',
        caption: 'صورة',
        contentType: 'image',
        media: [{ url: 'https://cdn.example/image.jpg', type: 'image' }],
        providerState: { containerId: 'ig-container-ready' },
      },
      client
    );

    expect(client.get).toHaveBeenCalledWith('ig-container-ready', 'server-only-token', {
      fields: 'status_code',
    });
    expect(client.post).toHaveBeenCalledWith('ig-1/media_publish', 'server-only-token', {
      creation_id: 'ig-container-ready',
    });
    expect(result).toEqual(
      expect.objectContaining({ kind: 'published', externalPostId: 'ig-media-1' })
    );
  });
});
