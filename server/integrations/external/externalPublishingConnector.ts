import type { MetaPublishMedia, MetaPublishResult } from '../meta/metaPublishingConnector';
import { storageGet } from '../../services/storage';

export type ExternalPublishPlatform = 'x' | 'linkedin' | 'youtube' | 'tiktok';

export type ExternalPublishMedia = MetaPublishMedia & {
  key?: string | null;
  size?: number | null;
  mimeType?: string | null;
};

export type ExternalPublishRequest = {
  platform: ExternalPublishPlatform;
  targetId: string;
  accessToken: string;
  title?: string | null;
  caption: string;
  contentType: 'post' | 'image' | 'video' | 'reel' | 'story' | 'short';
  media: ExternalPublishMedia[];
  providerState?: Record<string, unknown> | null;
  providerSettings?: Record<string, unknown> | null;
};

type FetchHeaders = { get: (name: string) => string | null };
type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  headers: FetchHeaders;
};
type FetchInit = { method?: string; headers?: Record<string, string>; body?: string | Uint8Array };
type FetchClient = (input: string, init?: FetchInit) => Promise<FetchResponse>;

type VideoTransferState = {
  protocol: 'youtube-resumable' | 'tiktok-file-upload';
  transferUrl?: string;
  publishId?: string;
  mode?: 'direct' | 'upload';
  mediaKey: string;
  totalBytes: number;
  mimeType: string;
  nextByte: number;
  probeBeforeNextChunk?: boolean;
  restartSession?: boolean;
  expiresAt?: number;
};

type MediaChunkReader = (
  media: ExternalPublishMedia,
  start: number,
  end: number
) => Promise<Uint8Array>;

export type ExternalPublishingOptions = {
  readMediaChunk?: MediaChunkReader;
  now?: () => number;
};

const VIDEO_CHUNK_BYTES = 8 * 1024 * 1024;

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

function stateFrom(value: Record<string, unknown> | null | undefined): VideoTransferState | null {
  if (!value || typeof value.protocol !== 'string' || typeof value.mediaKey !== 'string') {
    return null;
  }
  if (
    (value.protocol !== 'youtube-resumable' && value.protocol !== 'tiktok-file-upload') ||
    typeof value.totalBytes !== 'number' ||
    typeof value.nextByte !== 'number' ||
    typeof value.mimeType !== 'string'
  ) {
    return null;
  }
  return {
    protocol: value.protocol,
    transferUrl: typeof value.transferUrl === 'string' ? value.transferUrl : undefined,
    publishId: typeof value.publishId === 'string' ? value.publishId : undefined,
    mode: value.mode === 'direct' || value.mode === 'upload' ? value.mode : undefined,
    mediaKey: value.mediaKey,
    totalBytes: value.totalBytes,
    mimeType: value.mimeType,
    nextByte: value.nextByte,
    probeBeforeNextChunk: value.probeBeforeNextChunk === true,
    restartSession: value.restartSession === true,
    expiresAt: typeof value.expiresAt === 'number' ? value.expiresAt : undefined,
  };
}

function videoMedia(request: ExternalPublishRequest) {
  const video = request.media.find(
    (item) =>
      item.type === 'video' && Boolean(item.key) && typeof item.size === 'number' && item.size > 0
  );
  if (!video || !video.key || !video.size) {
    return null;
  }
  return {
    ...video,
    key: video.key,
    size: video.size,
    mimeType: video.mimeType?.startsWith('video/') ? video.mimeType : 'application/octet-stream',
  };
}

function nextChunk(state: VideoTransferState) {
  const start = state.nextByte;
  const end = Math.min(state.totalBytes - 1, start + VIDEO_CHUNK_BYTES - 1);
  return { start, end, size: end - start + 1 };
}

function rangeEnd(value: string | null) {
  if (!value) {
    return null;
  }
  const match = value.match(/(?:bytes=)?\d+-(\d+)/i);
  return match ? Number(match[1]) : null;
}

function processing(providerState: VideoTransferState, retryAfterSeconds = 20): MetaPublishResult {
  return {
    kind: 'processing',
    retryAfterSeconds,
    providerState: providerState as Record<string, unknown>,
  };
}

async function readStoredMediaChunk(media: ExternalPublishMedia, start: number, end: number) {
  if (!media.key) {
    throw new Error('الوسيط المختار لا يحتوي على مفتاح تخزين صالح لنقل الفيديو.');
  }
  const { url } = await storageGet(media.key);
  const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
  if (!response.ok) {
    throw new Error(`تعذر جلب جزء الفيديو من التخزين (${response.status}).`);
  }
  const chunk = new Uint8Array(await response.arrayBuffer());
  if (chunk.byteLength !== end - start + 1) {
    throw new Error('أعاد التخزين طولاً غير متوقع لكتلة الفيديو؛ أوقف النقل لحماية الذاكرة.');
  }
  return chunk;
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

async function probeYouTubeSession(
  state: VideoTransferState,
  token: string,
  http: FetchClient
): Promise<MetaPublishResult | VideoTransferState> {
  if (!state.transferUrl) {
    return processing({ ...state, restartSession: true }, 5);
  }
  const response = await http(state.transferUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Range': `bytes */${state.totalBytes}`,
      'Content-Length': '0',
    },
  });
  if (response.status === 308) {
    const uploadedEnd = rangeEnd(response.headers.get('range'));
    return {
      ...state,
      nextByte: uploadedEnd === null ? 0 : uploadedEnd + 1,
      probeBeforeNextChunk: false,
    };
  }
  const payload = await response.json().catch(() => null);
  const id = typeof asRecord(payload)?.id === 'string' ? String(asRecord(payload)?.id) : null;
  if ((response.status === 200 || response.status === 201) && id) {
    return {
      kind: 'published',
      externalPostId: id,
      externalUrl: `https://www.youtube.com/watch?v=${id}`,
    };
  }
  if (response.status === 404) {
    return processing({ ...state, transferUrl: undefined, nextByte: 0, restartSession: true }, 5);
  }
  return {
    kind: 'failed',
    retryable: retriable(response.status),
    message: errorMessage(payload, 'تعذر استعلام جلسة رفع YouTube.'),
  };
}

async function publishYouTube(
  request: ExternalPublishRequest,
  http: FetchClient,
  readChunk: MediaChunkReader
): Promise<MetaPublishResult> {
  const media = videoMedia(request);
  if (!media) {
    return {
      kind: 'failed',
      retryable: false,
      message: 'يتطلب YouTube ملف فيديو مخزناً مع حجم ومفتاح تخزين صالحين.',
    };
  }
  let state = stateFrom(request.providerState);
  if (state?.protocol !== 'youtube-resumable') {
    state = null;
  }
  if (!state || state.restartSession) {
    const response = await http(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: jsonHeaders(request.accessToken, {
          'X-Upload-Content-Length': String(media.size),
          'X-Upload-Content-Type': media.mimeType,
        }),
        body: JSON.stringify({
          snippet: {
            title: (request.title || request.caption || 'SGH video').slice(0, 100),
            description: request.caption,
          },
          status: { privacyStatus: 'private' },
        }),
      }
    );
    const payload = await response.json().catch(() => null);
    const sessionUrl = response.headers.get('location');
    if (!response.ok || !sessionUrl) {
      return {
        kind: 'failed',
        retryable: retriable(response.status),
        message: errorMessage(payload, 'تعذر بدء جلسة رفع YouTube.'),
      };
    }
    state = {
      protocol: 'youtube-resumable',
      transferUrl: sessionUrl,
      mediaKey: media.key,
      totalBytes: media.size,
      mimeType: media.mimeType,
      nextByte: 0,
    };
  }
  if (state.probeBeforeNextChunk) {
    const probe = await probeYouTubeSession(state, request.accessToken, http);
    if ('kind' in probe) {
      return probe;
    }
    state = probe;
  }
  if (!state.transferUrl || state.nextByte >= state.totalBytes) {
    return processing({ ...state, probeBeforeNextChunk: true }, 10);
  }
  const chunk = nextChunk(state);
  let bytes: Uint8Array;
  try {
    bytes = await readChunk(media, chunk.start, chunk.end);
  } catch (error) {
    return {
      kind: 'failed',
      retryable: true,
      message: error instanceof Error ? error.message : 'تعذر قراءة كتلة فيديو YouTube.',
    };
  }
  const response = await http(state.transferUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${request.accessToken}`,
      'Content-Type': state.mimeType,
      'Content-Length': String(bytes.byteLength),
      'Content-Range': `bytes ${chunk.start}-${chunk.end}/${state.totalBytes}`,
    },
    body: bytes,
  });
  const payload = await response.json().catch(() => null);
  const id = typeof asRecord(payload)?.id === 'string' ? String(asRecord(payload)?.id) : null;
  if ((response.status === 200 || response.status === 201) && id) {
    return {
      kind: 'published',
      externalPostId: id,
      externalUrl: `https://www.youtube.com/watch?v=${id}`,
    };
  }
  if (response.status === 308) {
    const uploadedEnd = rangeEnd(response.headers.get('range'));
    return processing(
      { ...state, nextByte: uploadedEnd === null ? chunk.end + 1 : uploadedEnd + 1 },
      5
    );
  }
  if (retriable(response.status)) {
    return processing({ ...state, probeBeforeNextChunk: true }, 30);
  }
  return {
    kind: 'failed',
    retryable: false,
    message: errorMessage(payload, 'فشل رفع كتلة فيديو YouTube.'),
  };
}

function tiktokMode(settings: Record<string, unknown> | null | undefined) {
  return settings?.tiktokMode === 'upload' ? 'upload' : 'direct';
}

type TikTokCreatorInfo = {
  privacyLevel: string;
  disableComment: boolean;
  disableDuet: boolean;
  disableStitch: boolean;
};

async function queryTikTokCreatorInfo(
  token: string,
  http: FetchClient
): Promise<TikTokCreatorInfo | MetaPublishResult> {
  const response = await http('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
    method: 'POST',
    headers: jsonHeaders(token),
  });
  const payload = await response.json().catch(() => null);
  const data = asRecord(asRecord(payload)?.data);
  const error = asRecord(asRecord(payload)?.error);
  const options = Array.isArray(data?.privacy_level_options)
    ? data.privacy_level_options.filter((item): item is string => typeof item === 'string')
    : [];
  if (!response.ok || error?.code !== 'ok') {
    return {
      kind: 'failed',
      retryable: retriable(response.status),
      message: errorMessage(payload, 'تعذر التحقق من إعدادات منشئ TikTok.'),
    };
  }
  if (!options.includes('SELF_ONLY')) {
    return {
      kind: 'failed',
      retryable: false,
      message:
        'لا يتيح حساب TikTok مستوى الخصوصية الآمن SELF_ONLY للنشر الأولي؛ راجع إعدادات الخصوصية للحساب.',
    };
  }
  return {
    privacyLevel: 'SELF_ONLY',
    disableComment: data?.comment_disabled === true,
    disableDuet: data?.duet_disabled === true,
    disableStitch: data?.stitch_disabled === true,
  };
}

async function queryTikTokStatus(
  state: VideoTransferState,
  token: string,
  http: FetchClient
): Promise<MetaPublishResult> {
  if (!state.publishId) {
    return { kind: 'failed', retryable: false, message: 'تعذر تتبع TikTok لغياب publish_id.' };
  }
  const response = await http('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ publish_id: state.publishId }),
  });
  const payload = await response.json().catch(() => null);
  const data = asRecord(asRecord(payload)?.data);
  const status = typeof data?.status === 'string' ? data.status : null;
  if (
    !response.ok ||
    (asRecord(payload)?.error && asRecord(asRecord(payload)?.error)?.code !== 'ok')
  ) {
    return {
      kind: 'failed',
      retryable: retriable(response.status),
      message: errorMessage(payload, 'تعذر قراءة حالة TikTok.'),
    };
  }
  if (status === 'PUBLISH_COMPLETE') {
    const ids = Array.isArray(data?.publicaly_available_post_id)
      ? data?.publicaly_available_post_id
      : [];
    const id = ids.find(
      (item): item is string | number => typeof item === 'string' || typeof item === 'number'
    );
    return {
      kind: 'published',
      externalPostId: id ? String(id) : state.publishId,
      externalUrl: null,
    };
  }
  if (status === 'FAILED') {
    const reason =
      typeof data?.fail_reason === 'string' ? data.fail_reason : 'فشل TikTok دون سبب مفصل.';
    return { kind: 'failed', retryable: false, message: `فشل نشر TikTok: ${reason}` };
  }
  const uploadedBytes =
    typeof data?.uploaded_bytes === 'number' ? data.uploaded_bytes : state.nextByte;
  return processing(
    { ...state, nextByte: Math.max(state.nextByte, uploadedBytes) },
    status === 'SEND_TO_USER_INBOX' ? 300 : 30
  );
}

async function publishTikTok(
  request: ExternalPublishRequest,
  http: FetchClient,
  readChunk: MediaChunkReader,
  now: () => number
): Promise<MetaPublishResult> {
  const media = videoMedia(request);
  if (!media) {
    return {
      kind: 'failed',
      retryable: false,
      message: 'يتطلب TikTok ملف فيديو مخزناً مع حجم ومفتاح تخزين صالحين.',
    };
  }
  let state = stateFrom(request.providerState);
  if (state?.protocol !== 'tiktok-file-upload') {
    state = null;
  }
  if (
    !state ||
    !state.transferUrl ||
    !state.publishId ||
    (state.expiresAt && state.expiresAt <= now())
  ) {
    const mode = tiktokMode(request.providerSettings);
    const endpoint = mode === 'upload' ? 'inbox/video/init/' : 'video/init/';
    const creator =
      mode === 'direct' ? await queryTikTokCreatorInfo(request.accessToken, http) : null;
    if (creator && 'kind' in creator) {
      return creator;
    }
    const init = await http(`https://open.tiktokapis.com/v2/post/publish/${endpoint}`, {
      method: 'POST',
      headers: jsonHeaders(request.accessToken),
      body: JSON.stringify(
        mode === 'upload'
          ? {
              source_info: {
                source: 'FILE_UPLOAD',
                video_size: media.size,
                chunk_size: VIDEO_CHUNK_BYTES,
                total_chunk_count: Math.ceil(media.size / VIDEO_CHUNK_BYTES),
              },
            }
          : {
              post_info: {
                title: request.caption.slice(0, 2200),
                privacy_level: creator?.privacyLevel ?? 'SELF_ONLY',
                disable_duet: creator?.disableDuet ?? false,
                disable_comment: creator?.disableComment ?? false,
                disable_stitch: creator?.disableStitch ?? false,
                brand_content_toggle: false,
                brand_organic_toggle: false,
              },
              source_info: {
                source: 'FILE_UPLOAD',
                video_size: media.size,
                chunk_size: VIDEO_CHUNK_BYTES,
                total_chunk_count: Math.ceil(media.size / VIDEO_CHUNK_BYTES),
              },
            }
      ),
    });
    const payload = await init.json().catch(() => null);
    const data = asRecord(asRecord(payload)?.data);
    const error = asRecord(asRecord(payload)?.error);
    const publishId = typeof data?.publish_id === 'string' ? data.publish_id : null;
    const transferUrl = typeof data?.upload_url === 'string' ? data.upload_url : null;
    if (!init.ok || error?.code !== 'ok' || !publishId || !transferUrl) {
      return {
        kind: 'failed',
        retryable: retriable(init.status),
        message: errorMessage(payload, 'تعذر تهيئة نقل فيديو TikTok.'),
      };
    }
    state = {
      protocol: 'tiktok-file-upload',
      transferUrl,
      publishId,
      mode,
      mediaKey: media.key,
      totalBytes: media.size,
      mimeType: media.mimeType,
      nextByte: 0,
      expiresAt: now() + 55 * 60 * 1000,
    };
  }
  if (state.nextByte >= state.totalBytes) {
    return queryTikTokStatus(state, request.accessToken, http);
  }
  const chunk = nextChunk(state);
  let bytes: Uint8Array;
  try {
    bytes = await readChunk(media, chunk.start, chunk.end);
  } catch (error) {
    return {
      kind: 'failed',
      retryable: true,
      message: error instanceof Error ? error.message : 'تعذر قراءة كتلة فيديو TikTok.',
    };
  }
  const transferUrl = state.transferUrl;
  if (!transferUrl) {
    return {
      kind: 'failed',
      retryable: true,
      message: 'انتهت صلاحية رابط رفع TikTok؛ سيعاد بدء الجلسة.',
    };
  }
  const upload = await http(transferUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': state.mimeType,
      'Content-Length': String(bytes.byteLength),
      'Content-Range': `bytes ${chunk.start}-${chunk.end}/${state.totalBytes}`,
    },
    body: bytes,
  });
  if (!upload.ok) {
    return {
      kind: 'failed',
      retryable: retriable(upload.status),
      message: `تعذر رفع كتلة فيديو TikTok (${upload.status}).`,
    };
  }
  return processing({ ...state, nextByte: chunk.end + 1 }, 10);
}

export async function publishToExternalPlatform(
  request: ExternalPublishRequest,
  http: FetchClient = (input, init) => fetch(input, init as never),
  options: ExternalPublishingOptions = {}
): Promise<MetaPublishResult> {
  const readChunk = options.readMediaChunk ?? readStoredMediaChunk;
  const now = options.now ?? Date.now;
  if (request.platform === 'x') {
    return publishX(request, http);
  }
  if (request.platform === 'linkedin') {
    return publishLinkedIn(request, http);
  }
  if (request.platform === 'youtube') {
    return publishYouTube(request, http, readChunk);
  }
  return publishTikTok(request, http, readChunk, now);
}
