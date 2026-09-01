import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockNavigate, mockAppointmentsQuery, mockResultsQuery } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockAppointmentsQuery: vi.fn(),
  mockResultsQuery: vi.fn(),
}));

vi.mock('wouter', () => ({
  useLocation: () => [null, mockNavigate],
}));

vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    patientPortal: {
      myAppointments: { useQuery: mockAppointmentsQuery },
      myResults: { useQuery: mockResultsQuery },
    },
  },
}));

vi.mock('@/hooks/export/useFormatDate', () => ({
  useFormatDate: () => ({
    formatDate: (value: string | Date) => new Date(value).toLocaleDateString('ar-SA'),
  }),
}));

import PatientAppointmentsPage from './PatientAppointmentsPage';
import PatientResultsPage from './PatientResultsPage';

describe('Patient portal list pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppointmentsQuery.mockReturnValue({
      data: [
        {
          id: 1,
          fullName: 'حجز متابعة',
          appointmentDate: '2026-09-10T10:00:00.000Z',
          createdAt: '2026-09-10T10:00:00.000Z',
          procedure: 'فحص عام',
          status: 'confirmed',
        },
      ],
      isLoading: false,
    });
    mockResultsQuery.mockReturnValue({
      data: [
        {
          id: 1,
          title: 'نتيجة تحليل الدم',
          doctorName: 'د. علي',
          resultDate: '2026-09-09T09:00:00.000Z',
          createdAt: '2026-09-09T09:00:00.000Z',
          status: 'ready',
          fileUrl: 'https://example.com/report.pdf',
          resultType: 'lab',
        },
      ],
      isLoading: false,
    });
  });

  it('shows polished patient appointment and result headers', () => {
    render(<PatientAppointmentsPage />);
    render(<PatientResultsPage />);

    expect(screen.getByText('مواعيدك')).toBeInTheDocument();
    expect(screen.getByText('نتائجك')).toBeInTheDocument();
    expect(screen.getByText('المواعيد القادمة')).toBeInTheDocument();
  });
});
