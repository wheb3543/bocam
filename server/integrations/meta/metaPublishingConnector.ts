import type { MetaApiResponse } from '../../api/meta.types';

export type MetaPublishPlatform = 'facebook' | 'instagram';

export type MetaPublishMedia = {
  url: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  altText?: string | null;
};

export type MetaPublishRequest = {
  platform: MetaPublishPlatform;
  targetId: string;
  accessToken: string;
  caption: string;
  contentType: 'post' | 'image' | 'video' | 'reel' | 'story' | 'short';
  media: MetaPublishMedia[];
  providerState?: Record<string, unknown> | null;
};

export type MetaPublishResult =
  | {
      kind: 'published';
      externalPostId: string;
      externalUrl: string | null;
      providerState?: Record<string, unknown>;
    }
  | { kind: 'processing'; retryAfterSeconds: number; providerState: Record<string, unknown> }
  | {
      kind: 'failed';
      message: string;
      retryable: boolean;
      providerState?: Record<string, unknown>;
    };

export type MetaPublishClient = {
  postWithAccessToken: <T>(
    endpoint: string,
    accessToken: string,
    payload?: Record<string, unknown>
  ) => Promise<MetaApiResponse<T>>;
  getWithAccessToken: <T>(
    endpoint: string,
    accessToken: string,
    params?: Record<string, string>
  ) => Promise<MetaApiResponse<T>>;
};

type IdResponse = { id?: string; post_id?: string };
type ContainerStatus = { status_code?: string };

function failure(response: MetaApiResponse<unknown>, fallback: string): MetaPublishResult {
  const code = response.error?.code ?? response.status;
  return {
    kind: 'failed',
    message: response.error?.message ?? fallback,
    // Rate limiting and transient server/network errors should be retried; permission and validation errors should not.
    retryable:
      code === 0 ||
      code === 1 ||
      code === 2 ||
      code === 4 ||
      code === 17 ||
      code === 32 ||
      code >= 500,
  };
}

function instagramMediaPayload(
  request: MetaPublishRequest,
  item: MetaPublishMedia,
  carouselItem = false
) {
  if (item.type === 'image') {
    return {
      image_url: item.url,
      caption: carouselItem ? undefined : request.caption || undefined,
      alt_text: carouselItem ? undefined : item.altText || undefined,
      is_carousel_item: carouselItem || undefined,
    };
  }
  if (item.type === 'video') {
    return {
      video_url: item.url,
      caption: carouselItem ? undefined : request.caption || undefined,
      media_type:
        request.contentType === 'reel'
          ? 'REELS'
          : request.contentType === 'story'
            ? 'STORIES'
            : 'VIDEO',
      is_carousel_item: carouselItem || undefined,
    };
  }
  return null;
}

async function publishFacebook(
  request: MetaPublishRequest,
  client: MetaPublishClient
): Promise<MetaPublishResult> {
  if (request.media.length === 0) {
    const response = await client.postWithAccessToken<IdResponse>(
      `${request.targetId}/feed`,
      request.accessToken,
      {
        message: request.caption,
      }
    );
    if (!response.ok || !response.data?.id) {
      return failure(response, 'تعذر نشر منشور Facebook النصي.');
    }
    return {
      kind: 'published',
      externalPostId: response.data.id,
      externalUrl: `https://www.facebook.com/${response.data.id}`,
    };
  }

  if (request.media.length !== 1 || request.media[0]?.type !== 'image') {
    return {
      kind: 'failed',
      message:
        'يدعم موصل Facebook الحالي النص أو صورة واحدة فقط؛ سيضاف رفع الفيديو والمعارض بعد اختبار API الحي.',
      retryable: false,
    };
  }
  const response = await client.postWithAccessToken<IdResponse>(
    `${request.targetId}/photos`,
    request.accessToken,
    {
      url: request.media[0].url,
      caption: request.caption || undefined,
    }
  );
  const externalPostId = response.data?.post_id ?? response.data?.id;
  if (!response.ok || !externalPostId) {
    return failure(response, 'تعذر نشر صورة Facebook.');
  }
  return {
    kind: 'published',
    externalPostId,
    externalUrl: `https://www.facebook.com/${externalPostId}`,
  };
}

async function publishInstagram(
  request: MetaPublishRequest,
  client: MetaPublishClient
): Promise<MetaPublishResult> {
  const existingContainerId =
    typeof request.providerState?.containerId === 'string'
      ? request.providerState.containerId
      : null;

  if (existingContainerId) {
    const status = await client.getWithAccessToken<ContainerStatus>(
      existingContainerId,
      request.accessToken,
      { fields: 'status_code' }
    );
    if (!status.ok) {
      return failure(status, 'تعذر قراءة حالة حاوية Instagram.');
    }
    if (status.data?.status_code === 'IN_PROGRESS') {
      return {
        kind: 'processing',
        retryAfterSeconds: 60,
        providerState: { containerId: existingContainerId },
      };
    }
    if (['ERROR', 'EXPIRED'].includes(status.data?.status_code ?? '')) {
      return {
        kind: 'failed',
        message: `فشلت حاوية Instagram بالحالة ${status.data?.status_code}.`,
        retryable: status.data?.status_code === 'IN_PROGRESS',
        providerState: { containerId: existingContainerId },
      };
    }
    const publishResponse = await client.postWithAccessToken<IdResponse>(
      `${request.targetId}/media_publish`,
      request.accessToken,
      { creation_id: existingContainerId }
    );
    if (!publishResponse.ok || !publishResponse.data?.id) {
      return failure(publishResponse, 'تعذر إتمام نشر حاوية Instagram.');
    }
    return {
      kind: 'published',
      externalPostId: publishResponse.data.id,
      externalUrl: null,
      providerState: { containerId: existingContainerId },
    };
  }

  if (!request.media.length) {
    return {
      kind: 'failed',
      message: 'يتطلب Instagram وسيطاً واحداً على الأقل للنشر.',
      retryable: false,
    };
  }
  if (request.media.length > 10) {
    return {
      kind: 'failed',
      message: 'يدعم Instagram Carousel عشرة عناصر كحد أقصى.',
      retryable: false,
    };
  }

  const createContainer = async (item: MetaPublishMedia, carouselItem = false) => {
    const payload = instagramMediaPayload(request, item, carouselItem);
    if (!payload) {
      return null;
    }
    const response = await client.postWithAccessToken<IdResponse>(
      `${request.targetId}/media`,
      request.accessToken,
      payload
    );
    return response.ok && response.data?.id ? response.data.id : null;
  };

  let containerId: string | null;
  if (request.media.length === 1) {
    containerId = await createContainer(request.media[0]);
  } else {
    const childIds = await Promise.all(request.media.map((item) => createContainer(item, true)));
    if (childIds.some((id) => !id)) {
      return {
        kind: 'failed',
        message: 'تعذر إنشاء إحدى حاويات Carousel في Instagram.',
        retryable: true,
      };
    }
    const carousel = await client.postWithAccessToken<IdResponse>(
      `${request.targetId}/media`,
      request.accessToken,
      {
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption: request.caption || undefined,
      }
    );
    containerId = carousel.ok ? (carousel.data?.id ?? null) : null;
  }
  if (!containerId) {
    return { kind: 'failed', message: 'تعذر إنشاء حاوية النشر في Instagram.', retryable: true };
  }
  return { kind: 'processing', retryAfterSeconds: 60, providerState: { containerId } };
}

export async function publishToMeta(
  request: MetaPublishRequest,
  client: MetaPublishClient
): Promise<MetaPublishResult> {
  return request.platform === 'facebook'
    ? publishFacebook(request, client)
    : publishInstagram(request, client);
}
