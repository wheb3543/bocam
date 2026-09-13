import { spawn } from 'node:child_process';

const MAX_AUDIO_BYTES = 16 * 1024 * 1024;
const TRANSCODE_TIMEOUT_MS = 60_000;

export function isBrowserRecordedWebm(mimeType: string): boolean {
  return mimeType.trim().toLowerCase().startsWith('audio/webm');
}

/**
 * يحول تسجيل المتصفح WebM/Opus إلى OGG/Opus، وهي الصيغة المدعومة لرسائل واتساب الصوتية الرسمية (Voice Notes).
 */
export async function prepareWhatsAppAudioUpload(
  input: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (!isBrowserRecordedWebm(mimeType)) {
    return { buffer: input, mimeType };
  }
  if (input.length === 0) {
    throw new Error('التسجيل الصوتي فارغ');
  }
  if (input.length > MAX_AUDIO_BYTES) {
    throw new Error('حجم التسجيل الصوتي يتجاوز 16 ميغابايت');
  }

  const output = await new Promise<Buffer>((resolve, reject) => {
    const process = spawn(
      'ffmpeg',
      [
        '-v',
        'error',
        '-nostdin',
        '-i',
        'pipe:0',
        '-vn',
        '-map',
        '0:a:0',
        '-ac',
        '1',
        '-c:a',
        'libopus',
        '-b:a',
        '32k',
        '-application',
        'voip',
        '-f',
        'ogg',
        'pipe:1',
      ],
      { stdio: ['pipe', 'pipe', 'pipe'] }
    );
    const chunks: Buffer[] = [];
    let stderr = '';
    let outputSize = 0;
    const timeout = setTimeout(() => {
      process.kill('SIGKILL');
      reject(new Error('استغرق تحويل التسجيل الصوتي وقتاً أطول من المسموح'));
    }, TRANSCODE_TIMEOUT_MS);

    process.stdout.on('data', (chunk: Buffer) => {
      outputSize += chunk.length;
      if (outputSize > MAX_AUDIO_BYTES) {
        process.kill('SIGKILL');
        return;
      }
      chunks.push(chunk);
    });
    process.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    process.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`تعذر بدء تحويل التسجيل الصوتي: ${error.message}`));
    });
    process.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0 || outputSize === 0 || outputSize > MAX_AUDIO_BYTES) {
        reject(new Error(stderr.trim() || 'تعذر تحويل التسجيل الصوتي إلى صيغة مدعومة'));
        return;
      }
      resolve(Buffer.concat(chunks));
    });
    process.stdin.end(input);
  });

  return { buffer: output, mimeType: 'audio/ogg' };
}
