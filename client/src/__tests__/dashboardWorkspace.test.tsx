import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/layout/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('@/hooks/integrations/useLicense', () => ({
  useLicense: () => ({ hasFeature: () => false, isLicenseValid: false }),
}));

vi.mock('@/components/form/ManualRegistrationForm', () => ({
  default: () => <div>نموذج التسجيل التجريبي</div>,
}));

vi.mock('@/components/notification/NotificationCenter', () => ({
  default: () => <div>تنبيهات التشغيل التجريبية</div>,
}));

vi.mock('@/components/dashboard/QuickPatientSearch', () => ({
  default: () => <div>البحث السريع التجريبي</div>,
}));

import AdminDashboard from '@/pages/admin/AdminDashboard';

describe('Dashboard operational workspace', () => {
  it('prioritizes daily operations and remains useful when analytics are unavailable', async () => {
    render(<AdminDashboard />);

    expect(screen.getByRole('heading', { name: 'لوحة التحكم' })).toBeTruthy();
    expect(screen.getByText('وضع التشغيل الأساسي')).toBeTruthy();
    expect(screen.getByRole('link', { name: /صندوق البريد/ })).toHaveAttribute(
      'href',
      '/admin/communications/messages'
    );
    expect(screen.getByRole('link', { name: /إنشاء منشور/ })).toHaveAttribute(
      'href',
      '/admin/content/publishing'
    );
    expect(screen.getByText('ابحث عن مريض')).toBeTruthy();
    expect(screen.getByText('راجع التنبيهات')).toBeTruthy();
    expect(await screen.findByText('البحث السريع التجريبي')).toBeTruthy();
    expect(await screen.findByText('تنبيهات التشغيل التجريبية')).toBeTruthy();
  });
});
