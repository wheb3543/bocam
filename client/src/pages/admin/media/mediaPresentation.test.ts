import { describe, expect, it } from 'vitest';
import { getMediaPresentation } from './mediaPresentation';

describe('getMediaPresentation', () => {
  it('returns an appropriate display mode for every media type', () => {
    expect(getMediaPresentation('image')).toBe('image');
    expect(getMediaPresentation('video')).toBe('video');
    expect(getMediaPresentation('audio')).toBe('audio');
    expect(getMediaPresentation('document')).toBe('document');
    expect(getMediaPresentation('other')).toBe('document');
  });
});
