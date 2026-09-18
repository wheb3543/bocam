import React from 'react';
import { FileArchive, FileText, Music2 } from 'lucide-react';
import { getMediaPresentation } from './mediaPresentation';

type PreviewType = 'image' | 'video' | 'audio' | 'document' | 'other';

export function createMediaPreview({
  type,
  url,
  alt,
  label,
}: {
  type: PreviewType;
  url: string;
  alt: string;
  label: string;
}): React.ReactNode {
  const presentation = getMediaPresentation(type);
  if (presentation === 'image') {
    return React.createElement('img', {
      'data-media-presentation': 'image',
      src: url,
      alt,
      className: 'h-full w-full object-cover',
    });
  }
  if (presentation === 'video') {
    return React.createElement('video', {
      'data-media-presentation': 'video',
      src: url,
      controls: true,
      className: 'h-full w-full object-cover',
    });
  }
  if (presentation === 'audio') {
    return React.createElement(
      'div',
      {
        'data-media-presentation': 'audio',
        className: 'flex h-full flex-col items-center justify-center gap-3 p-4',
      },
      [
        React.createElement(Music2, { key: 'icon', className: 'h-10 w-10 text-violet-600' }),
        React.createElement('audio', {
          key: 'audio',
          src: url,
          controls: true,
          className: 'w-full',
        }),
      ]
    );
  }
  return React.createElement(
    'div',
    {
      'data-media-presentation': 'document',
      className: 'flex h-full flex-col items-center justify-center gap-2 text-slate-500',
    },
    [
      React.createElement(type === 'document' ? FileText : FileArchive, {
        key: 'icon',
        className: type === 'document' ? 'h-12 w-12 text-red-500' : 'h-12 w-12 text-amber-600',
      }),
      React.createElement('span', { key: 'label', className: 'text-xs' }, label),
    ]
  );
}
