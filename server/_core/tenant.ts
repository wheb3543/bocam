import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export const DEFAULT_TENANT_ID = 'tenant-sgh';

export function resolveTenantRoot(): string {
  const explicitTenantPath = (process.env.TENANT_PATH || '').trim();
  const tenantId = (process.env.TENANT_ID || process.env.TENANT || DEFAULT_TENANT_ID).trim();
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

  const candidates = [
    explicitTenantPath ? path.resolve(explicitTenantPath) : '',
    path.resolve(repoRoot, 'tenants', tenantId),
    path.resolve(process.cwd(), 'tenants', tenantId),
  ].filter(Boolean) as string[];

  const resolved = candidates.find((candidate) => fs.existsSync(candidate));
  return resolved || candidates[0] || path.resolve(repoRoot, 'tenants', tenantId);
}

function extractBrandingObjectLiteral(source: string): string | null {
  const marker = 'export const branding =';
  const index = source.indexOf(marker);
  if (index === -1) {
    return null;
  }

  const start = source.indexOf('{', index);
  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString: string | null = null;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  return null;
}

async function loadBrandingConfig(tenantRoot: string) {
  const brandingConfigPath = path.join(tenantRoot, 'branding', 'config.ts');
  if (!fs.existsSync(brandingConfigPath)) {
    return null;
  }

  try {
    const source = fs.readFileSync(brandingConfigPath, 'utf8');
    const objectLiteral = extractBrandingObjectLiteral(source);
    if (!objectLiteral) {
      return null;
    }

    const branding = Function(`"use strict"; return (${objectLiteral});`)() as Record<string, any>;
    return branding;
  } catch {
    return null;
  }
}

function applyMappedEnvValues(source: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(source)) {
    if (value && value.trim()) {
      process.env[key] = value.trim();
    }
  }
}

function buildDatabaseUrlFromParts(envPrefix: 'DB' | 'HOSPITAL_DB'): string | undefined {
  const host = process.env[`${envPrefix}_HOST`]?.trim() || 'localhost';
  const port = process.env[`${envPrefix}_PORT`]?.trim() || '3306';
  const name = process.env[`${envPrefix}_NAME`]?.trim();
  const user = process.env[`${envPrefix}_USER`]?.trim() || 'root';
  const password = process.env[`${envPrefix}_PASSWORD`] ?? '';

  if (!name) {
    return undefined;
  }

  const auth =
    user || password
      ? `${encodeURIComponent(user)}${password ? `:${encodeURIComponent(password)}` : ''}@`
      : '';
  return `mysql://${auth}${host}:${port}/${name}`;
}

function isWithinTenantRoot(candidatePath: string, tenantRoot: string): boolean {
  const resolvedRoot = path.resolve(tenantRoot);
  const resolvedCandidate = path.resolve(candidatePath);
  const relative = path.relative(resolvedRoot, resolvedCandidate);

  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function resolveTenantPathValue(
  rawPath: string | undefined,
  tenantRoot: string
): string | undefined {
  if (!rawPath || !rawPath.trim()) {
    return undefined;
  }

  const trimmed = rawPath.trim();
  const resolvedTenantRoot = path.resolve(tenantRoot);

  if (path.isAbsolute(trimmed)) {
    return isWithinTenantRoot(trimmed, resolvedTenantRoot) ? trimmed : undefined;
  }

  const normalized = trimmed.replace(/^\.\//, '').replace(/^\/+/, '');
  const tenantDirName = path.basename(resolvedTenantRoot);

  if (
    normalized === `tenants/${tenantDirName}` ||
    normalized.startsWith(`tenants/${tenantDirName}/`)
  ) {
    const relativeSuffix = normalized.replace(new RegExp(`^tenants/${tenantDirName}/?`), '');
    const candidate = path.resolve(resolvedTenantRoot, relativeSuffix || '.');
    return isWithinTenantRoot(candidate, resolvedTenantRoot) ? candidate : undefined;
  }

  if (normalized.startsWith('tenants/')) {
    const relativeSuffix = normalized.replace(/^tenants\/[^/]+\/?/, '');
    const candidate = path.resolve(
      path.dirname(resolvedTenantRoot),
      path.basename(resolvedTenantRoot),
      relativeSuffix || '.'
    );
    return isWithinTenantRoot(candidate, resolvedTenantRoot) ? candidate : undefined;
  }

  const candidate = path.resolve(resolvedTenantRoot, normalized);
  return isWithinTenantRoot(candidate, resolvedTenantRoot) ? candidate : undefined;
}

export async function applyTenantRuntimeConfig(): Promise<{
  tenantRoot: string;
  tenantId: string;
  branding: Record<string, any> | null;
}> {
  const tenantRoot = resolveTenantRoot();
  const tenantEnvPath = path.join(tenantRoot, '.env');

  if (fs.existsSync(tenantEnvPath)) {
    dotenv.config({ path: tenantEnvPath, override: true });
  }

  const tenantJsonPath = path.join(tenantRoot, 'tenant.json');
  let tenantId = (process.env.TENANT_ID || DEFAULT_TENANT_ID).trim();

  if (fs.existsSync(tenantJsonPath)) {
    try {
      const tenantJson = JSON.parse(fs.readFileSync(tenantJsonPath, 'utf8')) as {
        tenantId?: string;
        clientName?: string;
        clientNameEn?: string;
      };
      tenantId = tenantJson.tenantId || tenantId;
      process.env.TENANT_ID = tenantId;
      process.env.TENANT_NAME = tenantJson.clientName || process.env.TENANT_NAME || tenantId;
      process.env.TENANT_NAME_EN =
        tenantJson.clientNameEn || process.env.TENANT_NAME_EN || tenantId;
    } catch {
      process.env.TENANT_ID = tenantId;
    }
  } else {
    process.env.TENANT_ID = tenantId;
  }

  const tenantDatabaseUrl = buildDatabaseUrlFromParts('DB');
  if (tenantDatabaseUrl) {
    process.env.DATABASE_URL = tenantDatabaseUrl;
  }

  const tenantHospitalDbUrl = buildDatabaseUrlFromParts('HOSPITAL_DB');
  if (tenantHospitalDbUrl) {
    process.env.HOSPITAL_DB_URL = tenantHospitalDbUrl;
  }

  const branding = await loadBrandingConfig(tenantRoot);
  const clientBranding = branding?.client ?? branding?.brand ?? branding?.default?.client ?? null;

  if (clientBranding) {
    applyMappedEnvValues({
      COMPANY_NAME: clientBranding.nameEn || clientBranding.name || process.env.COMPANY_NAME,
      COMPANY_ARABIC_NAME:
        clientBranding.nameAr || clientBranding.name || process.env.COMPANY_ARABIC_NAME,
      COMPANY_ENGLISH_NAME: clientBranding.nameEn || process.env.COMPANY_ENGLISH_NAME,
      COMPANY_LOGO: branding?.seo?.logoPath || process.env.COMPANY_LOGO,
      COMPANY_PHONE: clientBranding.phone || process.env.COMPANY_PHONE,
      COMPANY_EMAIL: clientBranding.email || process.env.COMPANY_EMAIL,
      COMPANY_ADDRESS:
        clientBranding.addressEn || clientBranding.addressAr || process.env.COMPANY_ADDRESS,
      COMPANY_CITY: clientBranding.city || process.env.COMPANY_CITY,
      COMPANY_SLOGAN_AR: clientBranding.sloganAr || process.env.COMPANY_SLOGAN_AR,
      COMPANY_SLOGAN_EN: clientBranding.sloganEn || process.env.COMPANY_SLOGAN_EN,
      TENANT_THEME_PRIMARY: branding?.theme?.primary || process.env.TENANT_THEME_PRIMARY,
      TENANT_THEME_SECONDARY: branding?.theme?.secondary || process.env.TENANT_THEME_SECONDARY,
      TENANT_THEME_ACCENT: branding?.theme?.accent || process.env.TENANT_THEME_ACCENT,
      TENANT_THEME_BACKGROUND: branding?.theme?.background || process.env.TENANT_THEME_BACKGROUND,
      TENANT_THEME_TEXT: branding?.theme?.text || process.env.TENANT_THEME_TEXT,
      TENANT_THEME_SUCCESS: branding?.theme?.success || process.env.TENANT_THEME_SUCCESS,
      TENANT_THEME_DANGER: branding?.theme?.danger || process.env.TENANT_THEME_DANGER,
      TENANT_THEME_WARNING: branding?.theme?.warning || process.env.TENANT_THEME_WARNING,
      FACEBOOK_URL: branding?.contact?.facebook || process.env.FACEBOOK_URL,
      INSTAGRAM_URL: branding?.contact?.instagram || process.env.INSTAGRAM_URL,
      TWITTER_URL: branding?.contact?.twitter || process.env.TWITTER_URL,
      LINKEDIN_URL: branding?.contact?.linkedin || process.env.LINKEDIN_URL,
    });
  }

  const normalizedUploadPath = resolveTenantPathValue(process.env.FILE_UPLOAD_PATH, tenantRoot);
  process.env.FILE_UPLOAD_PATH = normalizedUploadPath || path.resolve(tenantRoot, 'uploads');

  if (!process.env.FILE_UPLOAD_BASE_URL) {
    process.env.FILE_UPLOAD_BASE_URL = '/uploads';
  }

  const normalizedLicensePath = resolveTenantPathValue(process.env.LICENSE_PATH, tenantRoot);
  process.env.LICENSE_PATH = normalizedLicensePath || path.join(tenantRoot, 'license.json');

  const normalizedBrandingPath = resolveTenantPathValue(process.env.BRANDING_PATH, tenantRoot);
  process.env.BRANDING_PATH = normalizedBrandingPath || path.join(tenantRoot, 'branding');

  if (!process.env.TENANT_ROOT) {
    process.env.TENANT_ROOT = tenantRoot;
  }

  return {
    tenantRoot,
    tenantId,
    branding,
  };
}
