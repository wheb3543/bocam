import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';

function encryptionKey(masterSecret = process.env.JWT_SECRET) {
  if (!masterSecret || masterSecret.length < 32) {
    throw new Error('مفتاح تشفير الإعدادات غير متاح أو غير آمن');
  }

  return createHash('sha256').update(masterSecret).digest();
}

export function encryptMetaSetting(value: string, masterSecret?: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(masterSecret), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':');
}

export function decryptMetaSetting(value: string, masterSecret?: string) {
  const [version, ivValue, authTagValue, encryptedValue] = value.split(':');
  if (version !== VERSION || !ivValue || !authTagValue || !encryptedValue) {
    throw new Error('صيغة إعداد Meta المشفّر غير صالحة');
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    encryptionKey(masterSecret),
    Buffer.from(ivValue, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
