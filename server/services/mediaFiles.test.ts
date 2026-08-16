import { describe, expect, it } from 'vitest';
import { createStorageName, decodeFileName, getMediaKind, getOriginalExtension } from './mediaFiles';

describe('media file helpers', () => {
  it('classifies the supported media families', () => {
    expect(getMediaKind('image/png')).toBe('image');
    expect(getMediaKind('video/mp4')).toBe('video');
    expect(getMediaKind('audio/mpeg')).toBe('audio');
    expect(getMediaKind('application/pdf')).toBe('document');
    expect(getMediaKind('application/zip')).toBe('other');
  });

  it('keeps Arabic file names readable and selects a safe extension', () => {
    expect(decodeFileName('ملف تقرير طبي.pdf')).toBe('ملف تقرير طبي.pdf');
    expect(getOriginalExtension('ملف تقرير طبي.pdf', 'application/pdf')).toBe('pdf');
  });

  it('uses a neutral storage key that does not depend on the uploaded name', () => {
    expect(createStorageName('video', 'mp4')).toMatch(/^video-\d+-[a-f0-9]{16}\.mp4$/);
  });
});
