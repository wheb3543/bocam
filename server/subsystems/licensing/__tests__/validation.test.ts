import { afterEach, describe, expect, it } from 'vitest';
import { getHardwareId } from '../helpers';
import { validateLicensePayload } from '../validation';

const originalLicenseDomain = process.env.LICENSE_DOMAIN;

function validPayload(domain?: string) {
  return {
    hid: getHardwareId(),
    ...(domain ? { domain } : {}),
    exp: Math.floor(Date.now() / 1000) + 3600,
    feat: ['reports'],
    iat: Math.floor(Date.now() / 1000),
    ver: '1.0.0',
  };
}

afterEach(() => {
  if (originalLicenseDomain === undefined) {
    delete process.env.LICENSE_DOMAIN;
  } else {
    process.env.LICENSE_DOMAIN = originalLicenseDomain;
  }
});

describe('domain-bound licenses', () => {
  it('accepts a licensed domain matching the deployment domain', () => {
    process.env.LICENSE_DOMAIN = 'https://portal.hospital.sa/';

    expect(validateLicensePayload(validPayload('portal.hospital.sa')).isValid).toBe(true);
  });

  it('rejects a licensed domain that differs from the deployment domain', () => {
    process.env.LICENSE_DOMAIN = 'portal.hospital.sa';

    const result = validateLicensePayload(validPayload('other-hospital.sa'));

    expect(result.isValid).toBe(false);
    expect(result.validationMessage).toBe('License domain mismatch');
  });
});
