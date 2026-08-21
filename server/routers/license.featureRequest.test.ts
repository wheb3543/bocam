import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../_core/centralLicenseRequest', () => ({
  checkCentralFeatureRequest: vi.fn(),
  checkCentralLicenseRequest: vi.fn(),
  getCentralLicenseConfiguration: vi.fn(() => ({ configured: true, baseUrl: 'https://idea-hub.example', systemId: 4 })),
  getPendingCentralLicenseRequest: vi.fn(() => null),
  requestCentralFeatureActivation: vi.fn(),
  requestCentralLicense: vi.fn(),
}));

import { licenseRouter } from './license';
import { checkCentralFeatureRequest, requestCentralFeatureActivation } from '../_core/centralLicenseRequest';

describe('إجراءات طلب تفعيل الميزة المركزية في bocam', () => {
  const caller = licenseRouter.createCaller({} as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يرسل مفتاح الميزة والنسخة إلى عميل Idea Hub بدلاً من فتح بريد إلكتروني', async () => {
    vi.mocked(requestCentralFeatureActivation).mockResolvedValue({
      status: 'pending',
      requestId: 44,
      expiresAt: '2030-01-01T00:00:00.000Z',
      reused: false,
    });

    await expect(caller.requestCentralFeatureActivation({
      featureKey: 'whatsapp',
      instanceName: 'bocam – hospital-a',
      serverUrl: 'https://hospital-a.example',
    })).resolves.toMatchObject({ success: true, requestId: 44, status: 'pending' });

    expect(requestCentralFeatureActivation).toHaveBeenCalledWith({
      featureKey: 'whatsapp',
      instanceName: 'bocam – hospital-a',
      serverUrl: 'https://hospital-a.example',
    });
  });

  it('يمرر طلب التحقق اليدوي لنفس مفتاح الميزة فقط', async () => {
    vi.mocked(checkCentralFeatureRequest).mockResolvedValue({
      status: 'pending',
      message: 'الطلب بانتظار الموافقة',
    });

    await expect(caller.checkCentralFeatureStatus({ featureKey: 'whatsapp' })).resolves.toMatchObject({
      success: true,
      status: 'pending',
    });
    expect(checkCentralFeatureRequest).toHaveBeenCalledWith('whatsapp');
  });
});
