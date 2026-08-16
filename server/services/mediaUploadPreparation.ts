import { getMediaKind, getOriginalExtension, type MediaKind } from './mediaFiles';

type ProcessedImage = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  width?: number;
  height?: number;
};

type UploadFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

export type PreparedMediaUpload = ProcessedImage & {
  type: MediaKind;
};

export async function prepareMediaUpload(
  file: UploadFile,
  processImage: (buffer: Buffer, mimeType: string) => Promise<ProcessedImage>
): Promise<PreparedMediaUpload> {
  const type = getMediaKind(file.mimetype);
  if (type === 'image') {
    return { type, ...(await processImage(file.buffer, file.mimetype)) };
  }

  return {
    type,
    buffer: file.buffer,
    mimeType: file.mimetype,
    extension: getOriginalExtension(file.originalname, file.mimetype),
  };
}
