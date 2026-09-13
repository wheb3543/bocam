export type WhatsAppMediaType = 'image' | 'video' | 'audio' | 'document';

export function classifyWhatsAppMedia(mimeType: string): WhatsAppMediaType {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  return 'document';
}

export async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

export function getWhatsAppMediaId(message: {
  mediaUrl?: string | null;
  metadata?: string | null;
}): string | null {
  if (message.mediaUrl && /^\d+$/.test(message.mediaUrl)) {
    return message.mediaUrl;
  }
  try {
    const metadata = message.metadata ? JSON.parse(message.metadata) : null;
    if (typeof metadata?.mediaId === 'string' && /^\d+$/.test(metadata.mediaId)) {
      return metadata.mediaId;
    }
  } catch {
    // لا تمنع الرسالة غير الصالحة عرض بقية المحادثة.
  }
  return null;
}

export function getWhatsAppMediaProxyUrl(
  message: { mediaUrl?: string | null; metadata?: string | null },
  options?: { download?: boolean }
): string | null {
  const mediaId = getWhatsAppMediaId(message);
  if (!mediaId) {
    return null;
  }
  let cacheKey: string | null = null;
  try {
    const metadata = message.metadata ? JSON.parse(message.metadata) : null;
    cacheKey = typeof metadata?.cacheKey === 'string' ? metadata.cacheKey : null;
  } catch {
    // تجاهل البيانات الوصفية غير الصالحة والرجوع لمعالجة معرّف Meta.
  }
  const cacheQuery = cacheKey ? `?cacheKey=${encodeURIComponent(cacheKey)}` : '';
  const mediaUrl = `/api/whatsapp/media/${encodeURIComponent(mediaId)}${cacheQuery}`;
  return options?.download ? `${mediaUrl}${cacheQuery ? '&' : '?'}download=1` : mediaUrl;
}
