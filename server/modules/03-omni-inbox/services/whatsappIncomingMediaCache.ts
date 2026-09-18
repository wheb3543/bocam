import { randomUUID } from 'node:crypto';
import { storageGet, storagePut } from '../../../services/storage';

const CACHE_PREFIX = 'whatsapp-media/incoming/';

// ذاكرة احتياطية محلية في حال عدم توفر خدمة التخزين السحابي
const localMemoryFallback = new Map<string, { bytes: Uint8Array; mimeType: string }>();

function extensionForMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'audio/ogg': 'ogg',
    'audio/mpeg': 'mp3',
    'application/pdf': 'pdf',
  };
  return extensions[mimeType] || 'bin';
}

export function buildIncomingWhatsAppMediaCacheKey(mediaId: string, mimeType: string): string {
  return `${CACHE_PREFIX}${mediaId}-${randomUUID()}.${extensionForMimeType(mimeType)}`;
}

export function isSafeIncomingWhatsAppMediaCacheKey(cacheKey: string): boolean {
  return /^whatsapp-media\/incoming\/\d+-[0-9a-f-]{36}\.[a-z0-9]{2,8}$/.test(cacheKey);
}

export async function cacheIncomingWhatsAppMedia(input: {
  mediaId: string;
  accessToken: string;
  phoneNumberId?: string | null;
  mimeType?: string | null;
}): Promise<{ cacheKey: string; fileSize: number; mimeType: string }> {
  const mediaInfoUrl = new URL(`https://graph.facebook.com/v25.0/${input.mediaId}`);
  if (input.phoneNumberId) {
    mediaInfoUrl.searchParams.set('phone_number_id', input.phoneNumberId);
  }
  const mediaResponse = await fetch(mediaInfoUrl, {
    headers: { Authorization: `Bearer ${input.accessToken}` },
  });
  if (!mediaResponse.ok) {
    throw new Error(`WhatsApp media metadata request failed (${mediaResponse.status})`);
  }

  const mediaData = (await mediaResponse.json()) as { url?: string; mime_type?: string };
  if (!mediaData.url) {
    throw new Error('WhatsApp media metadata did not include a download URL');
  }

  const fileResponse = await fetch(mediaData.url, {
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      'User-Agent': 'curl/7.64.1',
    },
  });
  if (!fileResponse.ok) {
    throw new Error(`WhatsApp media download failed (${fileResponse.status})`);
  }

  const mimeType =
    fileResponse.headers.get('content-type') ||
    input.mimeType ||
    mediaData.mime_type ||
    'application/octet-stream';
  const fileBytes = new Uint8Array(await fileResponse.arrayBuffer());
  const cacheKey = buildIncomingWhatsAppMediaCacheKey(input.mediaId, mimeType);

  try {
    await storagePut(cacheKey, fileBytes, mimeType);
  } catch {
    // حفظ في الذاكرة المحلية كإجراء احتياطي إذا لم تكن إعدادات التخزين السحابي مهيأة
    localMemoryFallback.set(cacheKey, { bytes: fileBytes, mimeType });
  }

  return { cacheKey, fileSize: fileBytes.byteLength, mimeType };
}

export async function readCachedIncomingWhatsAppMedia(
  cacheKey: string
): Promise<{ bytes: Uint8Array; mimeType: string } | null> {
  if (!isSafeIncomingWhatsAppMediaCacheKey(cacheKey)) {
    return null;
  }

  if (localMemoryFallback.has(cacheKey)) {
    return localMemoryFallback.get(cacheKey)!;
  }

  try {
    const { url } = await storageGet(cacheKey);
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return {
      bytes: new Uint8Array(await response.arrayBuffer()),
      mimeType: response.headers.get('content-type') || 'application/octet-stream',
    };
  } catch {
    return null;
  }
}
