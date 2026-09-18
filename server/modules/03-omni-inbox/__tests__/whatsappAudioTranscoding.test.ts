import { describe, expect, it } from 'vitest';
import { isBrowserRecordedWebm, prepareWhatsAppAudioUpload } from '../services/whatsappAudioTranscoding';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

describe('تحضير التسجيل الصوتي لواتساب', () => {
  it('يتعرف على تسجيل WebM الذي يحتاج تحويل OGG/Opus قبل رفعه إلى Meta', () => {
    expect(isBrowserRecordedWebm('audio/webm;codecs=opus')).toBe(true);
    expect(isBrowserRecordedWebm('audio/ogg')).toBe(false);
  });

  it('يمرر التسجيل إلى محول الصوت ويحدد رسائل الصوت كرسائل voice', () => {
    const routerSource = readFileSync('server/modules/03-omni-inbox/routers/whatsapp/routes/messageRoutes.ts', 'utf8');
    const metaSource = readFileSync('server/api/meta/meta.whatsapp.ts', 'utf8');
    expect(routerSource).toContain('prepareWhatsAppAudioUpload');
    expect(metaSource).toContain(
      "buildMediaPayload('audio', audioRef, { voice: true, ...options })"
    );
  });

  it('يحوّل تسجيل متصفح WebM فعلياً إلى حاوية OGG مع ترميز Opus', async () => {
    const recording = spawnSync(
      'ffmpeg',
      [
        '-v',
        'error',
        '-f',
        'lavfi',
        '-i',
        'sine=frequency=880:duration=0.1',
        '-c:a',
        'libopus',
        '-f',
        'webm',
        'pipe:1',
      ],
      { encoding: null }
    );
    if (recording.status !== 0) {
      return;
    }
    const prepared = await prepareWhatsAppAudioUpload(recording.stdout, 'audio/webm;codecs=opus');

    expect(prepared.mimeType).toBe('audio/ogg');
    expect(prepared.buffer.subarray(0, 4).toString()).toBe('OggS');
  });
});
