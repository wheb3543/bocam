import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { applyTenantRuntimeConfig, resolveTenantRoot } from './tenant';
import { getLicenseFilePath } from './license/helpers';

describe('tenant runtime loader', () => {
  const originalEnv = { ...process.env };
  let tempRoot: string;

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tenant-loader-'));

    const tenantDir = path.join(tempRoot, 'tenants', 'tenant-demo');
    fs.mkdirSync(tenantDir, { recursive: true });
    fs.mkdirSync(path.join(tenantDir, 'branding'), { recursive: true });

    fs.writeFileSync(
      path.join(tenantDir, 'tenant.json'),
      JSON.stringify(
        {
          tenantId: 'tenant-demo',
          clientName: 'عيادة مثال',
          clientNameEn: 'Example Clinic',
        },
        null,
        2
      )
    );

    fs.writeFileSync(
      path.join(tenantDir, '.env'),
      [
        'TENANT_ID=tenant-demo',
        'VITE_COMPANY_NAME=Example Clinic',
        'VITE_COMPANY_ARABIC_NAME=عيادة مثال',
        'DB_HOST=tenant-db',
        'DB_PORT=3307',
        'DB_NAME=example_db',
        'FILE_UPLOAD_PATH=./tenants/tenant-demo/uploads',
        'FILE_UPLOAD_BASE_URL=/uploads',
        '',
      ].join('\n')
    );

    fs.writeFileSync(
      path.join(tenantDir, 'branding', 'config.ts'),
      `export type BrandingConfig = { client: { nameEn: string; nameAr: string; email: string; phone: string; sloganEn: string; sloganAr: string }; theme: { primary: string; secondary: string } };

export const branding = {
  tenantId: 'tenant-demo',
  client: {
    nameEn: 'Example Clinic',
    nameAr: 'عيادة مثال',
    email: 'hello@example.com',
    phone: '+966500000001',
    sloganEn: 'Excellence in care',
    sloganAr: 'تميز في الرعاية',
  },
  theme: {
    primary: '#123456',
    secondary: '#654321',
  },
};

export default branding;
`
    );

    process.env.TENANT_ID = 'tenant-demo';
    process.env.TENANT_PATH = tenantDir;
    delete process.env.VITE_COMPANY_NAME;
    delete process.env.VITE_COMPANY_ARABIC_NAME;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.FILE_UPLOAD_PATH;
    delete process.env.FILE_UPLOAD_BASE_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('resolves the active tenant directory from the environment', () => {
    expect(resolveTenantRoot()).toBe(path.join(tempRoot, 'tenants', 'tenant-demo'));
  });

  it('loads tenant env and branding values before the app starts', async () => {
    await applyTenantRuntimeConfig();

    expect(process.env.VITE_COMPANY_NAME).toBe('Example Clinic');
    expect(process.env.VITE_COMPANY_ARABIC_NAME).toBe('عيادة مثال');
    expect(process.env.DB_HOST).toBe('tenant-db');
    expect(process.env.DB_PORT).toBe('3307');
    expect(process.env.DB_NAME).toBe('example_db');
    expect(process.env.VITE_COMPANY_EMAIL).toBe('hello@example.com');
    expect(process.env.VITE_COMPANY_PHONE).toBe('+966500000001');
    expect(process.env.TENANT_THEME_PRIMARY).toBe('#123456');
    expect(process.env.TENANT_THEME_SECONDARY).toBe('#654321');
    expect(process.env.DATABASE_URL).toBe('mysql://root@tenant-db:3307/example_db');
    expect(process.env.FILE_UPLOAD_PATH).toBe(path.resolve(tempRoot, 'tenants', 'tenant-demo', 'uploads'));
  });

  it('uses the tenant license path configured at runtime', async () => {
    const tenantLicensePath = path.join(tempRoot, 'tenants', 'tenant-demo', 'license.json');
    process.env.LICENSE_PATH = tenantLicensePath;

    expect(getLicenseFilePath()).toBe(tenantLicensePath);
  });

  it('rejects upload paths that escape the tenant directory', async () => {
    process.env.FILE_UPLOAD_PATH = '../../../outside/uploads';

    await applyTenantRuntimeConfig();

    expect(process.env.FILE_UPLOAD_PATH).toBe(
      path.resolve(path.join(tempRoot, 'tenants', 'tenant-demo'), 'uploads')
    );
  });
});
