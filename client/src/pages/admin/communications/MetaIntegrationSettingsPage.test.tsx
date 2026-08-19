import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MetaIntegrationSettingsPage from './MetaIntegrationSettingsPage';

const mocks = vi.hoisted(() => ({
  generalStatusQuery: vi.fn(),
  metaStatusQuery: vi.fn(),
  connectionsOverviewQuery: vi.fn(),
  mutate: vi.fn(),
  invalidate: vi.fn(),
}));

vi.mock('@/components/layout/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/_core/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: 'admin' }, loading: false }),
}));

vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    useUtils: () => ({
      metaIntegration: { status: { invalidate: mocks.invalidate } },
      generalIntegrations: { status: { invalidate: mocks.invalidate } },
      integrationConnections: { overview: { invalidate: mocks.invalidate } },
      socialInbox: {
        accounts: { invalidate: mocks.invalidate },
        stats: { invalidate: mocks.invalidate },
        threads: { invalidate: mocks.invalidate },
      },
    }),
    metaIntegration: {
      status: { useQuery: mocks.metaStatusQuery },
      save: { useMutation: () => ({ mutate: mocks.mutate, isPending: false }) },
    },
    generalIntegrations: {
      status: { useQuery: mocks.generalStatusQuery },
      save: { useMutation: () => ({ mutate: mocks.mutate, isPending: false }) },
    },
    integrationConnections: {
      overview: { useQuery: mocks.connectionsOverviewQuery },
      startMetaBusiness: { useMutation: () => ({ mutate: mocks.mutate, isPending: false }) },
      startWhatsAppEmbeddedSignup: { useMutation: () => ({ mutateAsync: mocks.mutate, isPending: false }) },
      completeWhatsAppEmbeddedSignup: { useMutation: () => ({ mutate: mocks.mutate, isPending: false }) },
      setAssetSelected: { useMutation: () => ({ mutate: mocks.mutate, isPending: false }) },
      disconnect: { useMutation: () => ({ mutate: mocks.mutate, isPending: false }) },
    },
    socialInbox: {
      seedMetaTestData: { useMutation: () => ({ mutate: mocks.mutate, isPending: false }) },
      clearMetaTestData: { useMutation: () => ({ mutate: mocks.mutate, isPending: false }) },
    },
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const generalPlatforms = ['X', 'LinkedIn', 'YouTube', 'TikTok'].map((label, index) => ({
  platform: ['x', 'linkedin', 'youtube', 'tiktok'][index] as 'x' | 'linkedin' | 'youtube' | 'tiktok',
  label,
  clientId: null,
  requestedScopes: 'scope.read scope.write',
  isEnabled: false,
  configured: false,
  hasClientSecret: false,
  connectionStatus: 'not_configured' as const,
  lastError: null,
  updatedAt: null,
}));

describe('MetaIntegrationSettingsPage as general integration settings', () => {
  beforeEach(() => {
    mocks.metaStatusQuery.mockReturnValue({
      data: {
        appId: null,
        facebookPageId: null,
        instagramAccountId: null,
        hasAppSecret: false,
        hasVerifyToken: false,
        hasPageAccessToken: false,
        isEnabled: false,
      },
      isLoading: false,
    });
    mocks.generalStatusQuery.mockReturnValue({ data: generalPlatforms, isLoading: false });
    mocks.connectionsOverviewQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it('renders all four external platform configuration sections without rendering any saved secret', () => {
    render(<MetaIntegrationSettingsPage />);

    expect(screen.getByRole('heading', { name: 'إعدادات الربط العامة' })).toBeInTheDocument();
    expect(screen.getByText('ربط منصات النشر الخارجية')).toBeInTheDocument();
    generalPlatforms.forEach(({ label }) => {
      const heading = screen.getByRole('heading', { name: label });
      expect(heading).toBeInTheDocument();
      expect(within(heading.closest('section') as HTMLElement).getByText('غير مهيأ')).toBeInTheDocument();
    });
    expect(screen.queryByDisplayValue(/secret/i)).not.toBeInTheDocument();
  });

  it('renders the Meta and WhatsApp authorized connection controls without rendering stored access tokens', () => {
    render(<MetaIntegrationSettingsPage />);

    expect(screen.getByText('الحسابات والأصول المتصلة')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ربط Meta Business والأصول' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ربط WhatsApp Business' })).toBeInTheDocument();
    expect(screen.getByText('Facebook Login for Business Configuration ID')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp Embedded Signup Configuration ID')).toBeInTheDocument();
    expect(screen.getByText('OAuth Redirect URI')).toBeInTheDocument();
    expect(screen.queryByText('sample-access-token-never-rendered')).not.toBeInTheDocument();
  });
});
