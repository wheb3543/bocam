import { beforeEach, describe, expect, it, vi } from 'vitest';

const insertedRows: Record<string, unknown>[] = [];
const processImageMock = vi.fn();
const storagePutMock = vi.fn();

vi.mock('../_core/databaseGuard', () => ({
  ensureDatabaseAvailable: async () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [{ id: 7, name: 'عام', path: '/general' }],
        }),
      }),
    }),
    insert: () => ({
      values: (row: Record<string, unknown>) => ({
        $returningId: async () => {
          insertedRows.push(row);
          return [{ id: insertedRows.length }];
        },
      }),
    }),
  }),
}));

vi.mock('../services/storage', () => ({
  storagePut: (...args: unknown[]) => storagePutMock(...args),
}));

vi.mock('../services/imageProcessor', () => ({
  processImageToAvif: (...args: unknown[]) => processImageMock(...args),
}));

vi.mock('../../drizzle/schema', () => ({
  images: {},
  media: {},
  mediaFolders: { id: 'id', path: 'path' },
}));

vi.mock('drizzle-orm', () => ({
  and: vi.fn(),
  eq: vi.fn(),
  isNull: vi.fn(),
}));

describe('uploadAndIndexMedia', () => {
  beforeEach(() => {
    insertedRows.length = 0;
    processImageMock.mockReset();
    storagePutMock.mockReset().mockResolvedValue({ key: 'media/folder-7/test-file', url: 'https://storage.test/file' });
  });

  it.each([
    ['video/mp4', 'فيديو تعريفي.mp4', 'video', 'mp4'],
    ['audio/mpeg', 'رسالة صوتية.mp3', 'audio', 'mp3'],
    ['application/pdf', 'تقرير طبي.pdf', 'document', 'pdf'],
  ] as const)('indexes %s as %s without image conversion', async (mimetype, originalname, type, format) => {
    const { uploadAndIndexMedia } = await import('./uploadRoute');
    const result = await uploadAndIndexMedia(
      { originalname, mimetype, buffer: Buffer.from('binary-file'), size: 11 },
      7
    );

    expect(processImageMock).not.toHaveBeenCalled();
    expect(storagePutMock).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`^media/folder-7/${type}-`)), Buffer.from('binary-file'), mimetype);
    expect(insertedRows[0]).toMatchObject({ type, mimeType: mimetype, fileName: originalname, folderId: 7, format });
    expect(result).toMatchObject({ type, mimeType: mimetype, fileName: originalname, folderId: 7, format });
  });
});
