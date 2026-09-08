import fs from 'fs';
import path from 'path';
import { describe, expect, it, vi } from 'vitest';
import { validateLicense } from '../license';
import { getHardwareId, verifySignature } from './helpers';

describe('provided production license', () => {
  it('has a valid signature and enables all licensed features', () => {
    const licensePath = path.join(process.cwd(), 'tenants', 'tenant-sgh', 'license.json');
    const license = JSON.parse(fs.readFileSync(licensePath, 'utf-8')) as { key: string };
    const result = verifySignature(license.key);

    expect(result.valid).toBe(true);
    expect(result.payload?.feat).toEqual(
      expect.arrayContaining(['reports', 'whatsapp', 'camps', 'offers'])
    );
    expect(result.payload?.feat?.length).toBeGreaterThan(0);
    expect(result.payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('uses the configured production hardware ID for the signed license', () => {
    expect(process.env.LICENSE_HARDWARE_ID).toBe('42004E494300');
    expect(getHardwareId()).toBe('42004E494300');
  });

  it('validates the license as active and enables all features', () => {
    const licensePath = path.join(process.cwd(), 'tenants', 'tenant-sgh', 'license.json');
    const licenseFile = JSON.parse(fs.readFileSync(licensePath, 'utf-8')) as { key: string };
    const result = verifySignature(licenseFile.key);
    const hardwareId = result.payload?.hid;
    if (!hardwareId) {
      throw new Error('The provided license payload has no hardware ID');
    }
    const configuredHardwareId = process.env.LICENSE_HARDWARE_ID;
    vi.stubEnv('LICENSE_HARDWARE_ID', hardwareId);

    const validatedLicense = validateLicense();
    vi.stubEnv('LICENSE_HARDWARE_ID', configuredHardwareId ?? '');

    expect(validatedLicense.isValid).toBe(true);
    expect(validatedLicense.features).toEqual(
      expect.arrayContaining(['reports', 'whatsapp', 'camps', 'offers'])
    );
  });
});
