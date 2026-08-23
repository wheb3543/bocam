import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createLogger } from './logger';
import { getHardwareId, getLicenseFilePath } from './license/helpers';
import { validateLicense } from './license';

const logger = createLogger('centralLicenseRequest');
const PENDING_REQUEST_FILE = '.idea-hub-license-request.json';

function requestTimeoutSignal() {
  return globalThis.AbortSignal.timeout(15_000);
}

type PendingLicenseRequest = {
  requestId: number;
  requestToken: string;
  status: 'pending';
  expiresAt: string;
  createdAt: string;
};

type PendingFeatureRequest = PendingLicenseRequest & {
  featureKey: string;
};

export type CentralLicenseFile = {
  key: string;
  hardwareId: string;
  expiryDate: string;
  features: string[];
  issuedAt: string;
  version: string;
};

function getIdeaHubUrl(): string | null {
  const value = process.env.IDEA_HUB_URL?.trim();
  return value ? value.replace(/\/$/, '') : null;
}

function getSystemId(): number | null {
  const value = Number(process.env.IDEA_HUB_SYSTEM_ID);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function getPendingRequestPath(): string {
  return path.join(process.cwd(), PENDING_REQUEST_FILE);
}

function readPendingRequest(): PendingLicenseRequest | null {
  try {
    const raw = fs.readFileSync(getPendingRequestPath(), 'utf8');
    const parsed = JSON.parse(raw) as PendingLicenseRequest;
    if (!parsed.requestId || !parsed.requestToken || parsed.status !== 'pending') {
      return null;
    }
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      fs.rmSync(getPendingRequestPath(), { force: true });
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePendingRequest(request: PendingLicenseRequest): void {
  const target = getPendingRequestPath();
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(request, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, target);
}

function clearPendingRequest(): void {
  fs.rmSync(getPendingRequestPath(), { force: true });
}

function getPendingFeatureRequestPath(featureKey: string): string {
  const fingerprint = crypto.createHash('sha256').update(featureKey).digest('hex').slice(0, 16);
  return path.join(process.cwd(), `.idea-hub-feature-request-${fingerprint}.json`);
}

function readPendingFeatureRequest(featureKey: string): PendingFeatureRequest | null {
  const target = getPendingFeatureRequestPath(featureKey);
  try {
    const raw = fs.readFileSync(target, 'utf8');
    const parsed = JSON.parse(raw) as PendingFeatureRequest;
    if (
      !parsed.requestId ||
      !parsed.requestToken ||
      parsed.status !== 'pending' ||
      parsed.featureKey !== featureKey
    ) {
      return null;
    }
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      fs.rmSync(target, { force: true });
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePendingFeatureRequest(request: PendingFeatureRequest): void {
  const target = getPendingFeatureRequestPath(request.featureKey);
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(request, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, target);
}

function clearPendingFeatureRequest(featureKey: string): void {
  fs.rmSync(getPendingFeatureRequestPath(featureKey), { force: true });
}

export function getCentralLicenseConfiguration() {
  const baseUrl = getIdeaHubUrl();
  const systemId = getSystemId();
  return { configured: Boolean(baseUrl && systemId), baseUrl, systemId };
}

export function getPendingCentralLicenseRequest() {
  const request = readPendingRequest();
  return request
    ? { requestId: request.requestId, expiresAt: request.expiresAt, status: request.status }
    : null;
}

export async function requestCentralLicense(input: { instanceName: string; serverUrl: string }) {
  const { configured, baseUrl, systemId } = getCentralLicenseConfiguration();
  if (!configured || !baseUrl || !systemId) {
    throw new Error('لم يُضبط IDEA_HUB_URL أو IDEA_HUB_SYSTEM_ID لهذه النسخة');
  }

  const pending = readPendingRequest();
  if (pending) {
    return {
      status: 'pending' as const,
      requestId: pending.requestId,
      expiresAt: pending.expiresAt,
      reused: true,
    };
  }

  const response = await fetch(`${baseUrl}/api/license-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'BOCAM-License-Request/1.0' },
    body: JSON.stringify({
      systemId,
      hardwareId: getHardwareId(),
      instanceName: input.instanceName.trim(),
      serverUrl: input.serverUrl.trim(),
      systemVersion: process.env.npm_package_version || '1.0.0',
      nonce: crypto.randomBytes(32).toString('base64url'),
    }),
    signal: requestTimeoutSignal(),
  });
  const body = (await response.json()) as {
    success?: boolean;
    error?: string;
    data?: { requestId: number; requestToken: string; status: 'pending'; expiresAt: string };
  };
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error || 'تعذر إرسال طلب الترخيص إلى إيديا هب');
  }

  const request: PendingLicenseRequest = { ...body.data, createdAt: new Date().toISOString() };
  savePendingRequest(request);
  logger.info(`Central license request created: ${request.requestId}`);
  return {
    status: 'pending' as const,
    requestId: request.requestId,
    expiresAt: request.expiresAt,
    reused: false,
  };
}

function getSupportTicketServerUrl(): string {
  const value = process.env.BOCAM_PUBLIC_URL?.trim() || process.env.SERVER_URL?.trim();
  if (!value) {
    throw new Error('لم يُضبط BOCAM_PUBLIC_URL أو SERVER_URL لهذه النسخة');
  }
  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error('عنوان النسخة الموزعة غير صالح لإرسال طلب الدعم');
  }
}

/** يرسل بلاغ دعم من واجهة bocam دون كشف بيانات الترخيص للمتصفح. */
export async function requestCentralSupportTicket(input: {
  subject: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}) {
  const { configured, baseUrl } = getCentralLicenseConfiguration();
  if (!configured || !baseUrl) {
    throw new Error('لم يُضبط اتصال Idea Hub لهذه النسخة');
  }

  const validation = validateLicense();
  if (!validation.isValid) {
    throw new Error(validation.validationMessage || 'لا يمكن إرسال طلب دعم بترخيص غير صالح');
  }

  let signedLicenseKey: string;
  try {
    const license = JSON.parse(fs.readFileSync(getLicenseFilePath(), 'utf8')) as CentralLicenseFile;
    signedLicenseKey = license.key;
  } catch {
    throw new Error('تعذر قراءة ملف الترخيص المحلي لإرسال طلب الدعم');
  }
  if (!signedLicenseKey) {
    throw new Error('ملف الترخيص المحلي لا يحتوي مفتاحاً موقعاً');
  }

  const response = await fetch(`${baseUrl}/api/support/tickets/intake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'BOCAM-Support-Ticket/1.0' },
    body: JSON.stringify({
      hardwareId: getHardwareId(),
      serverUrl: getSupportTicketServerUrl(),
      licenseKeyFingerprint: crypto.createHash('sha256').update(signedLicenseKey).digest('hex'),
      subject: input.subject.trim(),
      content: input.content.trim(),
      priority: input.priority,
    }),
    signal: requestTimeoutSignal(),
  });
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    error?: string;
    ticketId?: number;
    ticketNumber?: string;
  } | null;
  if (!response.ok || !body?.success || !body.ticketId || !body.ticketNumber) {
    throw new Error(body?.error || 'تعذر إرسال تذكرة الدعم إلى إيديا هب');
  }
  logger.info(`Central support ticket created: ${body.ticketNumber}`);
  return { ticketId: body.ticketId, ticketNumber: body.ticketNumber };
}

export function installCentralLicense(license: CentralLicenseFile) {
  if (
    !license?.key ||
    !license.hardwareId ||
    !license.expiryDate ||
    !Array.isArray(license.features)
  ) {
    throw new Error('صيغة الترخيص المستلم من إيديا هب غير صالحة');
  }
  if (license.hardwareId !== getHardwareId()) {
    throw new Error('الترخيص المعتمد لا يطابق بصمة هذا الجهاز');
  }

  const licensePath = getLicenseFilePath();
  const temporaryPath = `${licensePath}.new`;
  fs.writeFileSync(temporaryPath, JSON.stringify(license, null, 2), { mode: 0o600 });
  fs.renameSync(temporaryPath, licensePath);

  const validation = validateLicense();
  if (!validation.isValid) {
    fs.rmSync(licensePath, { force: true });
    throw new Error(validation.validationMessage || 'فشل التحقق المحلي من توقيع الترخيص');
  }
  return validation;
}

export async function checkCentralLicenseRequest() {
  const { configured, baseUrl } = getCentralLicenseConfiguration();
  if (!configured || !baseUrl) {
    throw new Error('لم يُضبط اتصال إيديا هب لهذه النسخة');
  }
  const pending = readPendingRequest();
  if (!pending) {
    return { status: 'none' as const, message: 'لا يوجد طلب ترخيص معلق' };
  }

  const response = await fetch(`${baseUrl}/api/license-requests/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'BOCAM-License-Request/1.0' },
    body: JSON.stringify({ requestId: pending.requestId, requestToken: pending.requestToken }),
    signal: requestTimeoutSignal(),
  });
  const body = (await response.json()) as {
    success?: boolean;
    error?: string;
    data?: { status: string; message: string; license?: CentralLicenseFile };
  };
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error || 'تعذر قراءة حالة طلب الترخيص');
  }

  if (body.data.status === 'approved' && body.data.license) {
    const licenseInfo = installCentralLicense(body.data.license);
    const confirmation = await fetch(`${baseUrl}/api/license-requests/delivered`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'BOCAM-License-Request/1.0' },
      body: JSON.stringify({ requestId: pending.requestId, requestToken: pending.requestToken }),
      signal: requestTimeoutSignal(),
    });
    if (!confirmation.ok) {
      logger.warn(
        `License was installed but delivery confirmation returned ${confirmation.status}`
      );
    }
    clearPendingRequest();
    return {
      status: 'activated' as const,
      message: 'تم حفظ الترخيص والتحقق من توقيعه محلياً. أعد تشغيل النظام.',
      licenseInfo,
    };
  }

  if (body.data.status === 'rejected' || body.data.status === 'expired') {
    clearPendingRequest();
  }
  return { status: body.data.status, message: body.data.message };
}

export async function requestCentralFeatureActivation(input: {
  featureKey: string;
  instanceName: string;
  serverUrl: string;
}) {
  const { configured, baseUrl, systemId } = getCentralLicenseConfiguration();
  if (!configured || !baseUrl || !systemId) {
    throw new Error('لم يُضبط IDEA_HUB_URL أو IDEA_HUB_SYSTEM_ID لهذه النسخة');
  }

  const pending = readPendingFeatureRequest(input.featureKey);
  if (pending) {
    return {
      status: 'pending' as const,
      requestId: pending.requestId,
      expiresAt: pending.expiresAt,
      reused: true,
    };
  }

  const response = await fetch(`${baseUrl}/api/license-requests/feature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'BOCAM-Feature-Request/1.0' },
    body: JSON.stringify({
      systemId,
      featureKey: input.featureKey,
      hardwareId: getHardwareId(),
      instanceName: input.instanceName.trim(),
      serverUrl: input.serverUrl.trim(),
      systemVersion: process.env.npm_package_version || '1.0.0',
      nonce: crypto.randomBytes(32).toString('base64url'),
    }),
    signal: requestTimeoutSignal(),
  });
  const body = (await response.json()) as {
    success?: boolean;
    error?: string;
    data?: { requestId: number; requestToken: string; status: 'pending'; expiresAt: string };
  };
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error || 'تعذر إرسال طلب تفعيل الميزة إلى إيديا هب');
  }

  const request: PendingFeatureRequest = {
    ...body.data,
    featureKey: input.featureKey,
    createdAt: new Date().toISOString(),
  };
  savePendingFeatureRequest(request);
  logger.info(`Central feature request created: ${request.requestId} (${input.featureKey})`);
  return {
    status: 'pending' as const,
    requestId: request.requestId,
    expiresAt: request.expiresAt,
    reused: false,
  };
}

export async function checkCentralFeatureRequest(featureKey: string) {
  const { configured, baseUrl } = getCentralLicenseConfiguration();
  if (!configured || !baseUrl) {
    throw new Error('لم يُضبط اتصال إيديا هب لهذه النسخة');
  }
  const pending = readPendingFeatureRequest(featureKey);
  if (!pending) {
    return { status: 'none' as const, message: 'لا يوجد طلب تفعيل معلق لهذه الميزة' };
  }

  const response = await fetch(`${baseUrl}/api/license-requests/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'BOCAM-Feature-Request/1.0' },
    body: JSON.stringify({ requestId: pending.requestId, requestToken: pending.requestToken }),
    signal: requestTimeoutSignal(),
  });
  const body = (await response.json()) as {
    success?: boolean;
    error?: string;
    data?: { status: string; message: string; license?: CentralLicenseFile };
  };
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error || 'تعذر قراءة حالة طلب تفعيل الميزة');
  }

  if (body.data.status === 'approved' && body.data.license) {
    const licenseInfo = installCentralLicense(body.data.license);
    const confirmation = await fetch(`${baseUrl}/api/license-requests/delivered`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'BOCAM-Feature-Request/1.0' },
      body: JSON.stringify({ requestId: pending.requestId, requestToken: pending.requestToken }),
      signal: requestTimeoutSignal(),
    });
    if (!confirmation.ok) {
      logger.warn(
        `Feature license was installed but delivery confirmation returned ${confirmation.status}`
      );
    }
    clearPendingFeatureRequest(featureKey);
    return {
      status: 'activated' as const,
      message: 'تم حفظ الترخيص المحدث والتحقق من توقيعه محلياً. أعد تشغيل النظام.',
      licenseInfo,
    };
  }

  if (body.data.status === 'rejected' || body.data.status === 'expired') {
    clearPendingFeatureRequest(featureKey);
  }
  return { status: body.data.status, message: body.data.message };
}
