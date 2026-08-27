import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WhatsAppConnectionPage from './WhatsAppConnectionPage';

vi.mock('@/components/layout/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/integrations/useWhatsAppSSE', () => ({
  useWhatsAppSSE: vi.fn(),
}));

vi.mock('@/hooks/auth/useRolePermissions', () => ({
  useRolePermissions: () => ({ can: () => true, isLoading: false }),
}));

vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    whatsapp: {
      connection: {
        status: {
          useQuery: () => ({
            data: {
              setup: { phoneNumberConfigured: false },
              botReady: false,
              clientReady: false,
              queueReady: false,
            },
            isLoading: false,
            refetch: vi.fn(),
          }),
        },
      },
    },
  },
}));

describe('WhatsAppConnectionPage', () => {
  it('guides an unconfigured account to the secure integration settings flow', () => {
    render(<WhatsAppConnectionPage />);

    expect(screen.getByText('يلزم إكمال ربط WhatsApp Business')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'فتح إعدادات الربط الآمن' })).toHaveAttribute(
      'href',
      '/admin/communications/integration-settings'
    );
  });
});
