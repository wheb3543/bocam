import type { MetaPublishMedia, MetaPublishResult } from '../meta/metaPublishingConnector';

export type ExternalPublishPlatform = 'x' | 'linkedin' | 'youtube' | 'tiktok';

export type ExternalPublishRequest = {
  platform: ExternalPublishPlatform;
  targetId: string;
  accessToken: string;
  caption: string;
  contentType: 'post' | 'image' | 'video' | 'reel' | 'story' | 'short';
  media: MetaPublishMedia[];
};

type FetchHeaders = { get: (name: string) => string | null };
type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  headers: FetchHeaders;
};
type FetchInit = { method?: string; headers?: Record<string, string>; body?: string };
type FetchClient = (input: string, init?: FetchInit) => Promise<FetchResponse>;

function retriable(status: number) {
  return status === 0 || status === 429 || status >= 500;
}

function jsonHeaders(token: string, extra?: Record<string, string>) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(extra ?? {}) };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function errorMessage(payload: unknown, fallback: string) {
  const record = asRecord(payload);
  const detail = record?.detail ?? record?.message ?? record?.error ?? record?.title;
  return typeof detail === 'string' ? detail.slice(0, 500) : fallback;
}

async function publishX(
  request: ExternalPublishRequest,
  http: FetchClient
): Promise<MetaPublishResult> {
  if (request.media.length) {
    return {
      kind: 'failed',
      retryable: false,
      message:
        'رفع وسائط X يحتاج تدفق media.write وفحص خطة التطبيق؛ لا يُرسل قبل تفعيل هذا المسار في الربط الحي.',
    };
  }
  const response = await http('https://api.x.com/2/tweets', {
    method: 'POST',
    headers: jsonHeaders(request.accessToken),
    body: JSON.stringify({ text: request.caption.slice(0, 25_000) }),
  });
  const payload = await response.json();
  const data = asRecord(payload)?.data as Record<string, unknown> | undefined;
  const id = typeof data?.id === 'string' ? data.id : null;
  if (!response.ok || !id) {
    return {
      kind: 'failed',
      retryable: retriable(response.status),
      message: errorMessage(payload, 'تعذر نشر المحتوى على X.'),
    };
  }
  return { kind: 'published', externalPostId: id, externalUrl: `https://x.com/i/web/status/${id}` };
}

async function publishLinkedIn(
  request: ExternalPublishRequest,
  http: FetchClient
): Promise<MetaPublishResult> {
  if (request.media.length) {
    return {
      kind: 'failed',
      retryable: false,
      message:
        'يتطلب نشر وسائط LinkedIn تسجيل الأصل ورفعه أولاً؛ موصل الرفع سيُفعل بعد اعتماد صلاحيات التطبيق الحية.',
    };
  }
  const author = request.targetId.startsWith('urn:li:')
    ? request.targetId
    : `urn:li:person:${request.targetId}`;
  const response = await http('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: jsonHeaders(request.accessToken, {
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202602',
    }),
    body: JSON.stringify({
      author,
      commentary: request.caption,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });
  const payload = await response.json().catch(() => null);
  const id =
    response.headers.get('x-restli-id') || (asRecord(payload)?.id as string | undefined) || null;
  if (!response.ok || !id) {
    return {
      kind: 'failed',
      retryable: retriable(response.status),
      message: errorMessage(payload, 'تعذر نشر المحتوى على LinkedIn.'),
    };
  }
  return { kind: 'published', externalPostId: id, externalUrl: null };
}

export async function publishToExternalPlatform(
  request: ExternalPublishRequest,
  http: FetchClient = fetch
): Promise<MetaPublishResult> {
  if (request.platform === 'x') {
    return publishX(request, http);
  }
  if (request.platform === 'linkedin') {
    return publishLinkedIn(request, http);
  }
  if (request.platform === 'youtube') {
    return {
      kind: 'failed',
      retryable: false,
      message:
        'يتطلب YouTube فيديوً وجلسة رفع قابلة للاستئناف؛ سيتاح التشغيل بعد اختيار القناة وربط مصدر الملف في التفعيل الحي.',
    };
  }
  return {
    kind: 'failed',
    retryable: false,
    message:
      'يتطلب TikTok فيديوً ومراجعة Content Posting API؛ سيتاح التشغيل بعد تفعيل التطبيق واختيار الحساب.',
  };
}
