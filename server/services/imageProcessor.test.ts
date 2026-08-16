import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { processImageToAvif } from './imageProcessor';

describe('processImageToAvif', () => {
  it('converts a raster image to AVIF and preserves its dimensions', async () => {
    const source = await sharp({
      create: {
        width: 48,
        height: 32,
        channels: 3,
        background: { r: 12, g: 90, b: 180 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await processImageToAvif(source, 'image/jpeg');
    const metadata = await sharp(result.buffer).metadata();

    expect(result.mimeType).toBe('image/avif');
    expect(result.extension).toBe('avif');
    expect(result.width).toBe(48);
    expect(result.height).toBe(32);
    expect(metadata.format).toBe('heif');
    expect(metadata.width).toBe(48);
    expect(metadata.height).toBe(32);
  });

  it('does not rasterize SVG files', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"/>');
    const result = await processImageToAvif(svg, 'image/svg+xml');

    expect(result.buffer).toEqual(svg);
    expect(result.mimeType).toBe('image/svg+xml');
    expect(result.extension).toBe('svg');
  });
});
