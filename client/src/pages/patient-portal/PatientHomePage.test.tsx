import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockMeQuery, mockAppointmentsQuery, mockResultsQuery, mockOffersQuery } = vi.hoisted(() => ({
  mockMeQuery: vi.fn(),
  mockAppointmentsQuery: vi.fn(),
  mockResultsQuery: vi.fn(),
  mockOffersQuery: vi.fn(),
}));

vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    patientPortal: {
      me: { useQuery: mockMeQuery },
      myAppointments: { useQuery: mockAppointmentsQuery },
      myResults: { useQuery: mockResultsQuery },
      myOfferBookings: { useQuery: mockOffersQuery },
    },
  },
}));

vi.mock('wouter', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import PatientHomePage from './PatientHomePage';

describe('PatientHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMeQuery.mockReturnValue({ data: { fullName: 'أحمد محمد' } });
    mockAppointmentsQuery.mockReturnValue({ data: [], isLoading: false });
    mockResultsQuery.mockReturnValue({ data: [], isLoading: false });
    mockOffersQuery.mockReturnValue({ data: [], isLoading: false });
  });

  it('shows a polished patient overview summary', () => {
    render(<PatientHomePage />);

    expect(screen.getByText('أهلاً بك')).toBeInTheDocument();
    expect(screen.getByText('معلوماتك السريعة')).toBeInTheDocument();
    expect(screen.getByText('آخر موعد')).toBeInTheDocument();
  });
});
