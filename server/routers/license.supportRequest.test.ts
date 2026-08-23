import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../_core/centralLicenseRequest', () => ({
  checkCentralFeatureRequest: vi.fn(),
  checkCentralLicenseRequest: vi.fn(),
  getCentralSupportTickets: vi.fn(),
  getCentralLicenseConfiguration: vi.fn(),
  getPendingCentralLicenseRequest: vi.fn(),
  requestCentralFeatureActivation: vi.fn(),
  requestCentralLicense: vi.fn(),
  requestCentralSupportTicket: vi.fn(),
}));

import { getCentralSupportTickets, requestCentralSupportTicket } from '../_core/centralLicenseRequest';
import { licenseRouter } from './license';

describe('إجراء طلب الدعم الفني من bocam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('يمرر نص البلاغ والأولوية فقط إلى عميل Idea Hub الخادمي', async () => {
    vi.mocked(requestCentralSupportTicket).mockResolvedValue({ ticketId: 88, ticketNumber: 'SUP-SYS-88' });
    const caller = licenseRouter.createCaller({ user: { id: 3, role: 'admin' } } as never);

    await expect(caller.requestCentralSupportTicket({ subject: 'تعذر فتح التقارير', content: 'تظهر رسالة خطأ عند فتح شاشة التقارير.', priority: 'high' })).resolves.toEqual({ success: true, ticketId: 88, ticketNumber: 'SUP-SYS-88' });
    expect(requestCentralSupportTicket).toHaveBeenCalledWith({ subject: 'تعذر فتح التقارير', content: 'تظهر رسالة خطأ عند فتح شاشة التقارير.', priority: 'high', attachments: [] });
  });

  it('يعرض تذاكر النسخة من خلال عميل Idea Hub الخادمي فقط', async () => {
    vi.mocked(getCentralSupportTickets).mockResolvedValue([{ id: 88, ticketNumber: 'SUP-SYS-88' }] as never);
    const caller = licenseRouter.createCaller({ user: { id: 3, role: 'admin' } } as never);

    await expect(caller.getCentralSupportTickets()).resolves.toEqual({ success: true, tickets: [{ id: 88, ticketNumber: 'SUP-SYS-88' }] });
  });
});
