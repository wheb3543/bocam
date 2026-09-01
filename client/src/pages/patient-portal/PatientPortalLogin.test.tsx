import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockNavigate, mockUseQuery, mockUseMutation } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseQuery: vi.fn(),
  mockUseMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('wouter', () => ({
  useLocation: () => [null, mockNavigate],
}));

vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    patientPortal: {
      me: { useQuery: mockUseQuery },
      sendOtp: { useMutation: mockUseMutation },
      verifyOtp: { useMutation: mockUseMutation },
      register: { useMutation: mockUseMutation },
      loginWithPassword: { useMutation: mockUseMutation },
    },
  },
}));

vi.mock('@/components/layout/PageLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/HeroSection', () => ({
  default: () => <div>Hero</div>,
}));

vi.mock('@/components/AnimatedCard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import PatientPortalLogin from './PatientPortalLogin';

describe('PatientPortalLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: null, isLoading: false });
  });

  it('shows phone and password login plus a create account button', () => {
    render(<PatientPortalLogin />);

    expect(screen.getByLabelText('رقم الهاتف')).toBeInTheDocument();
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إنشاء حساب جديد' })).toBeInTheDocument();
  });
});
