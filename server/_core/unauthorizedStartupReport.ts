import crypto from 'crypto';
import { createLogger } from './logger';
import {
  getHardwareId,
  getLicenseFilePath,
  licenseFileExists,
  loadLicenseFile,
} from './license/helpers';

const logger = createLogger('unauthorizedStartupReport');

function getIdeaHubUrl(): string | null {
  const value = process.env.IDEA_HUB_URL?.trim();
  return value ? value.replace(/\/$/, '') : null;
}

function getSystemId(): number | null {
  const value = Number(process.env.IDEA_HUB_SYSTEM_ID);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function getServerUrl(): string {
  return process.env.BOCAM_PUBLIC_URL?.trim() || process.env.SERVER_URL?.trim() || 'unknown';
}

export async function reportUnauthorizedStartup(reason: string): Promise<void> {
  const baseUrl = getIdeaHubUrl();
  const systemId = getSystemId();
  const licensePath = getLicenseFilePath();
  if (!baseUrl || !systemId || !licenseFileExists(licensePath)) {
    return;
  }

  try {
    const licenseFile = loadLicenseFile(licensePath);
    const licenseKeyFingerprint = crypto.createHash('sha256').update(licenseFile.key).digest('hex');
    const response = await fetch(`${baseUrl}/api/security/unauthorized-bocam-startup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'BOCAM-Security-Report/1.0' },
      body: JSON.stringify({
        systemId,
        hardwareId: getHardwareId(),
        serverUrl: getServerUrl(),
        reason: reason.slice(0, 300),
        licenseKeyFingerprint,
      }),
      signal: globalThis.AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      logger.warn(`Unauthorized startup report was rejected: ${response.status}`);
    }
  } catch (error) {
    logger.warn(
      'Unable to report unauthorized startup:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
