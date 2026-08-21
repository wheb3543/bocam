import crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import { verifySignatureWithPublicKeys } from './helpers';

function createSignedLicense(privateKey: string) {
  const payload = { hid: 'TEST-HARDWARE', exp: '2027-01-01T00:00:00.000Z', feat: ['reports'], iat: '2026-01-01T00:00:00.000Z', ver: '1.0.0' };
  const signature = crypto.sign('sha256', Buffer.from(JSON.stringify(payload)), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
  }).toString('base64');
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
}

describe('مفاتيح التحقق خلال تدوير الترخيص', () => {
  it('يقبل الترخيص الموقع بالمفتاح السابق أو النشط ضمن فترة الانتقال', () => {
    const previous = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
    const active = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });

    expect(verifySignatureWithPublicKeys(createSignedLicense(previous.privateKey), [active.publicKey, previous.publicKey]).valid).toBe(true);
    expect(verifySignatureWithPublicKeys(createSignedLicense(active.privateKey), [active.publicKey, previous.publicKey]).valid).toBe(true);
  });
});
