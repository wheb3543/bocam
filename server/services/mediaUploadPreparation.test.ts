import { describe, expect, it, vi } from 'vitest';
import { prepareMediaUpload } from './mediaUploadPreparation';

describe('prepareMediaUpload', () => {
  it('converts only image uploads to AVIF', async () => {
    const processor = vi.fn().mockResolvedValue({
      buffer: Buffer.from('avif'),
      mimeType: 'image/avif',
      extension: 'avif',
      width: 120,
      height: 80,
    });
    const prepared = await prepareMediaUpload(
      { originalname: 'صورة.png', mimetype: 'image/png', buffer: Buffer.from('png') },
      processor
    );

    expect(processor).toHaveBeenCalledOnce();
    expect(prepared).toMatchObject({ type: 'image', mimeType: 'image/avif', extension: 'avif', width: 120 });
  });

  it.each([
    ['video/mp4', 'فيديو.mp4', 'video', 'mp4'],
    ['audio/mpeg', 'تسجيل.mp3', 'audio', 'mp3'],
    ['application/pdf', 'تقرير.pdf', 'document', 'pdf'],
  ] as const)('keeps %s uploads in their original format', async (mimeType, name, type, extension) => {
    const processor = vi.fn();
    const source = Buffer.from('source-file');
    const prepared = await prepareMediaUpload({ originalname: name, mimetype: mimeType, buffer: source }, processor);

    expect(processor).not.toHaveBeenCalled();
    expect(prepared).toMatchObject({ type, mimeType, extension, buffer: source });
  });
});
