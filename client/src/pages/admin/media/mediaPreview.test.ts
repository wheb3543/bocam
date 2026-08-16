import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createMediaPreview } from './mediaPreview';

describe('createMediaPreview', () => {
  const baseProps = { url: 'https://example.test/file', alt: 'وسيط اختباري', label: 'وسيط' };

  function render(type: 'image' | 'video' | 'audio' | 'document' | 'other') {
    return renderToStaticMarkup(createMediaPreview({ ...baseProps, type }));
  }

  it('renders image, video, audio, and document interface elements for their respective types', () => {
    expect(render('image')).toContain('data-media-presentation="image"');
    expect(render('image')).toContain('<img');
    expect(render('video')).toContain('data-media-presentation="video"');
    expect(render('video')).toContain('<video');
    expect(render('audio')).toContain('data-media-presentation="audio"');
    expect(render('audio')).toContain('<audio');
    expect(render('document')).toContain('data-media-presentation="document"');
    expect(render('other')).toContain('data-media-presentation="document"');
  });
});
