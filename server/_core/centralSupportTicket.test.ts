import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('fs', () => ({
  default: { readFileSync: vi.fn(() => JSON.stringify({ key: 'signed-local-license-key' })) },
}));
vi.mock('./license', () => ({
  validateLicense: vi.fn(() => ({ isValid: true })),
}));
vi.mock('./license/helpers', () => ({
  getHardwareId: vi.fn(() => 'HW-BOCAM-123'),
  getLicenseFilePath: vi.fn(() => '/tmp/license.json'),
}));

import { requestCentralSupportTicket } from './centralLicenseRequest';

describe('إرسال طلب الدعم المركزي من bocam', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('يرسل البصمة وبصمة المفتاح والمرفق واللقطة التشخيصية دون كشف مفتاح الترخيص', async () => {
    vi.stubEnv('IDEA_HUB_URL', 'https://idea-hub.example.test/');
    vi.stubEnv('IDEA_HUB_SYSTEM_ID', '30001');
    vi.stubEnv('BOCAM_PUBLIC_URL', 'https://bocam.example.test/');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, ticketId: 71, ticketNumber: 'SUP-SYS-71' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(requestCentralSupportTicket({ subject: 'تعذر فتح التقارير', content: 'تظهر رسالة خطأ عند فتح التقارير.', priority: 'high', attachments: [{ fileName: 'screenshot.png', mimeType: 'image/png', dataBase64: 'aW1hZ2U=' }] })).resolves.toEqual({ ticketId: 71, ticketNumber: 'SUP-SYS-71' });

    expect(fetchMock).toHaveBeenCalledWith('https://idea-hub.example.test/api/support/tickets/intake', expect.objectContaining({ method: 'POST' }));
    const options = fetchMock.mock.calls[0]?.[1] as { body?: string };
    const payload = JSON.parse(options.body || '{}');
    expect(payload).toMatchObject({ hardwareId: 'HW-BOCAM-123', attachments: [{ fileName: 'screenshot.png', mimeType: 'image/png' }] });
    expect(payload.diagnostics).toMatchObject({ runtime: expect.objectContaining({ node: expect.any(String), platform: expect.any(String) }) });
    expect(options.body).toContain('licenseKeyFingerprint');
    expect(options.body).not.toContain('signed-local-license-key');
  });
});
