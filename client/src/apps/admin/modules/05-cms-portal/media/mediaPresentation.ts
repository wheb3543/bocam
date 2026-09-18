export type MediaPresentation = 'image' | 'video' | 'audio' | 'document';

export function getMediaPresentation(
  type: 'image' | 'video' | 'audio' | 'document' | 'other'
): MediaPresentation {
  if (type === 'image') {
    return 'image';
  }
  if (type === 'video') {
    return 'video';
  }
  if (type === 'audio') {
    return 'audio';
  }
  return 'document';
}
