import { describe, expect, it } from 'vitest';
import { decryptMetaSetting, encryptMetaSetting } from './metaSettingsCrypto';

const masterSecret = 'development-test-secret-with-at-least-thirty-two-characters';

describe('Meta settings encryption', () => {
  it('encrypts and decrypts a secret without persisting plaintext', () => {
    const encrypted = encryptMetaSetting('meta-app-secret', masterSecret);

    expect(encrypted).not.toContain('meta-app-secret');
    expect(decryptMetaSetting(encrypted, masterSecret)).toBe('meta-app-secret');
  });

  it('rejects a ciphertext that is malformed or has been modified', () => {
    expect(() => decryptMetaSetting('invalid', masterSecret)).toThrow('صيغة إعداد Meta المشفّر غير صالحة');
    const encrypted = encryptMetaSetting('value', masterSecret);
    expect(() => decryptMetaSetting(`${encrypted}x`, masterSecret)).toThrow();
  });
});
