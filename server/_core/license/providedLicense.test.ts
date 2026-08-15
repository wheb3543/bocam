import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { validateLicense } from '../license';
import { getHardwareId, verifySignature } from './helpers';

describe('provided production license', () => {
  it('has a valid signature and enables all licensed features', () => {
    const licensePath = path.join(process.cwd(), 'license.json');
    const license = JSON.parse(fs.readFileSync(licensePath, 'utf-8')) as { key: string };
    const result = verifySignature(license.key);

    expect(result.valid).toBe(true);
    expect(result.payload?.feat).toContain('*');
    expect(result.payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('uses the configured production hardware ID for the signed license', () => {
    expect(process.env.LICENSE_HARDWARE_ID).toBe('42004E494300');
    expect(getHardwareId()).toBe('42004E494300');
  });

  it('validates the license as active and enables all features', () => {
    const license = validateLicense();

    expect(license.isValid).toBe(true);
    expect(license.features).toContain('*');
  });
});
