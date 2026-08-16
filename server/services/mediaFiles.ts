import crypto from 'crypto';

export type MediaKind = 'image' | 'video' | 'audio' | 'document' | 'other';

export function getMediaKind(mimeType: string): MediaKind {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  if (
    mimeType.startsWith('text/') ||
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation')
  ) {
    return 'document';
  }
  return 'other';
}

export function decodeFileName(value: string) {
  let fileName = Array.from(value.trim().normalize('NFC'))
    .filter((character) => character.charCodeAt(0) >= 32)
    .join('');
  if (!fileName) {
    return 'media-file';
  }

  for (let attempt = 0; attempt < 2 && /[ÃÂâØÙ]/.test(fileName); attempt += 1) {
    const decoded = Buffer.from(fileName, 'latin1').toString('utf8');
    if (!decoded || decoded.includes('\uFFFD') || decoded === fileName) {
      break;
    }
    fileName = decoded.normalize('NFC');
  }
  return fileName;
}

export function getOriginalExtension(fileName: string, mimeType: string) {
  const extension = fileName
    .split('.')
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (extension && extension.length <= 10) {
    return extension;
  }
  const fallback: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'text/csv': 'csv',
  };
  return fallback[mimeType] ?? 'bin';
}

export function createStorageName(kind: MediaKind, extension: string) {
  const safeExtension = extension.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
  return `${kind}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${safeExtension}`;
}
