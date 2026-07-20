/**
 * اختبارات GlobalSearch Component
 * GlobalSearch Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlobalSearch from '../GlobalSearch';

// Mock trpc
const mockTrpc = {
  leads: {
    unifiedList: {
      useQuery: vi.fn(() => ({ data: [] })) as unknown as ReturnType<typeof vi.fn>,
    },
  },
  appointments: {
    list: {
      useQuery: vi.fn(() => ({ data: [] })) as unknown as ReturnType<typeof vi.fn>,
    },
  },
  offerLeads: {
    list: {
      useQuery: vi.fn(() => ({ data: [] })) as unknown as ReturnType<typeof vi.fn>,
    },
  },
  campRegistrations: {
    listPaginated: {
      useQuery: vi.fn(() => ({ data: { data: [] } })) as unknown as ReturnType<typeof vi.fn>,
    },
  },
};

vi.mock('@/lib/api/trpc', () => ({
  trpc: mockTrpc,
}));

vi.mock('@/hooks/form/usePhoneFormat', () => ({
  usePhoneFormat: () => ({
    formatPhoneDisplay: (phone: string) => phone,
  }),
}));

vi.mock('wouter', () => ({
  useLocation: () => [null, vi.fn()],
}));

describe('GlobalSearch - Component Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يعرض زر البحث', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    expect(searchButton).toBeInTheDocument();
  });

  it('يجب أن يعرض أيقونة البحث', () => {
    render(<GlobalSearch />);
    
    const searchIcon = document.querySelector('.lucide-search');
    expect(searchIcon).toBeInTheDocument();
  });

  it('يجب أن يعرض اختصار لوحة المفاتيح Ctrl+K', () => {
    render(<GlobalSearch />);
    
    const keyboardShortcut = screen.getByText('Ctrl');
    expect(keyboardShortcut).toBeInTheDocument();
  });
});

describe('GlobalSearch - Opening/Closing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يفتح البحث عند النقر على الزر', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchPanel = screen.getByRole('dialog', { name: 'بحث عام' });
    expect(searchPanel).toBeInTheDocument();
  });

  it('يجب أن يغلق البحث عند النقر على الزر مرة أخرى', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    fireEvent.click(searchButton);
    
    const searchPanel = screen.queryByRole('dialog', { name: 'بحث عام' });
    expect(searchPanel).not.toBeInTheDocument();
  });

  it('يجب أن يغلق البحث عند النقر بالخارج', async () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchPanel = screen.getByRole('dialog', { name: 'بحث عام' });
    expect(searchPanel).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'بحث عام' })).not.toBeInTheDocument();
    });
  });

  it('يجب أن يستدعي onClose عند الإغلاق', () => {
    const onClose = vi.fn();
    render(<GlobalSearch onClose={onClose} />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    fireEvent.click(searchButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});

describe('GlobalSearch - Keyboard Shortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يفتح البحث عند الضغط على Ctrl+K', () => {
    render(<GlobalSearch />);
    
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    
    const searchPanel = screen.getByRole('dialog', { name: 'بحث عام' });
    expect(searchPanel).toBeInTheDocument();
  });

  it('يجب أن يفتح البحث عند الضغط على Cmd+K (Mac)', () => {
    render(<GlobalSearch />);
    
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    
    const searchPanel = screen.getByRole('dialog', { name: 'بحث عام' });
    expect(searchPanel).toBeInTheDocument();
  });

  it('يجب أن يغلق البحث عند الضغط على Escape', async () => {
    render(<GlobalSearch />);
    
    // Open first
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog', { name: 'بحث عام' })).toBeInTheDocument();
    
    // Close with Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'بحث عام' })).not.toBeInTheDocument();
    });
  });
});

describe('GlobalSearch - Search Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock data
    mockTrpc.leads.unifiedList.useQuery.mockReturnValue({
      data: [
        { id: 1, fullName: 'أحمد محمد', phone: '967712345678', email: 'ahmed@example.com', registrationType: 'appointment' },
        { id: 2, fullName: 'سارة علي', phone: '967712345679', email: 'sara@example.com', registrationType: 'offer' },
      ],
    });
    
    mockTrpc.appointments.list.useQuery.mockReturnValue({
      data: [
        { id: 1, fullName: 'أحمد محمد', phone: '967712345678', doctorName: 'د. محمد' },
      ],
    });
  });

  it('يجب أن يعرض رسالة عند فتح البحث بدون نص', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    expect(screen.getByText('ابدأ الكتابة للبحث في جميع الحجوزات')).toBeInTheDocument();
  });

  it('يجب أن يعرض رسالة عند عدم وجود نتائج', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'xyz' } });
    
    expect(screen.getByText('لا توجد نتائج')).toBeInTheDocument();
  });

  it('يجب أن يبحث في الاسم', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });
    
    expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
  });

  it('يجب أن يبحث في رقم الهاتف', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: '967712345678' } });
    
    expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
  });

  it('يجب أن يبحث في البريد الإلكتروني', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'ahmed@example.com' } });
    
    expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
  });

  it('يجب أن يمسح نص البحث عند النقر على زر X', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });
    
    const clearButton = screen.getByLabelText('مسح نص البحث');
    fireEvent.click(clearButton);
    
    expect(searchInput).toHaveValue('');
  });
});

describe('GlobalSearch - Results Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock data
    mockTrpc.leads.unifiedList.useQuery.mockReturnValue({
      data: [
        { id: 1, fullName: 'أحمد محمد', phone: '967712345678', email: 'ahmed@example.com', registrationType: 'appointment' },
      ],
    });
    
    mockTrpc.appointments.list.useQuery.mockReturnValue({
      data: [
        { id: 1, fullName: 'سارة علي', phone: '967712345679', doctorName: 'د. محمد', status: 'pending' },
      ],
    });
  });

  it('يجب أن يعرض نتائج Leads', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });
    
    expect(screen.getByText('تسجيلات العملاء (1)')).toBeInTheDocument();
    expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
  });

  it('يجب أن يعرض نتائج Appointments', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'سارة' } });
    
    expect(screen.getByText('مواعيد الأطباء (1)')).toBeInTheDocument();
    expect(screen.getByText('سارة علي')).toBeInTheDocument();
  });

  it('يجب أن يعرض نوع التسجيل كـ Badge', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });
    
    expect(screen.getByText('موعد')).toBeInTheDocument();
  });

  it('يجب أن يعرض حالة الموعد كـ Badge', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'سارة' } });
    
    expect(screen.getByText('قيد الانتظار')).toBeInTheDocument();
  });
});

describe('GlobalSearch - Result Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock data
    mockTrpc.leads.unifiedList.useQuery.mockReturnValue({
      data: [
        { id: 1, fullName: 'أحمد محمد', phone: '967712345678', email: 'ahmed@example.com', registrationType: 'appointment' },
      ],
    });
    
    const setLocation = vi.fn();
    vi.mock('wouter', () => ({
      useLocation: () => [null, setLocation],
    }));
  });

  it('يجب أن ينتقل عند النقر على النتيجة', () => {
    const setLocation = vi.fn();
    
    vi.doMock('wouter', () => ({
      useLocation: () => [null, setLocation],
    }));
    
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });
    
    const resultCard = screen.getByText('أحمد محمد').closest('[role="button"]');
    if (resultCard) {
      fireEvent.click(resultCard);
    }
    
    expect(setLocation).toHaveBeenCalledWith('/bookings?tab=leads');
  });

  it('يجب أن ينتقل عند الضغط على Enter على النتيجة', () => {
    const setLocation = vi.fn();
    
    vi.doMock('wouter', () => ({
      useLocation: () => [null, setLocation],
    }));
    
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });
    
    const resultCard = screen.getByText('أحمد محمد').closest('[role="button"]');
    if (resultCard) {
      fireEvent.keyDown(resultCard, { key: 'Enter' });
    }
    
    expect(setLocation).toHaveBeenCalledWith('/bookings?tab=leads');
  });

  it('يجب أن ينتقل عند الضغط على Space على النتيجة', () => {
    const setLocation = vi.fn();
    
    vi.doMock('wouter', () => ({
      useLocation: () => [null, setLocation],
    }));
    
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });
    
    const resultCard = screen.getByText('أحمد محمد').closest('[role="button"]');
    if (resultCard) {
      fireEvent.keyDown(resultCard, { key: ' ' });
    }
    
    expect(setLocation).toHaveBeenCalledWith('/bookings?tab=leads');
  });
});

describe('GlobalSearch - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يحتوي على aria-label صحيح', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    expect(searchButton).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('يجب أن يحتوي على aria-expanded', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    expect(searchButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(searchButton);
    expect(searchButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('يجب أن يحتوي على aria-controls', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    expect(searchButton).toHaveAttribute('aria-controls', 'global-search-panel');
  });

  it('يجب أن يحتوي البحث على aria-describedby', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    expect(searchInput).toHaveAttribute('aria-describedby', 'global-search-help');
  });

  it('يجب أن يحتوي النتائج على role="button"', () => {
    // Mock data
    mockTrpc.leads.unifiedList.useQuery.mockReturnValue({
      data: [
        { id: 1, fullName: 'أحمد محمد', phone: '967712345678', email: 'ahmed@example.com', registrationType: 'appointment' },
      ],
    });
    
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });
    
    const resultCard = screen.getByText('أحمد محمد').closest('[role="button"]');
    expect(resultCard).toBeInTheDocument();
  });
});

describe('GlobalSearch - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يتعامل مع نص البحث الفارغ', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: ' ' } });
    
    expect(screen.getByText('ابدأ الكتابة للبحث في جميع الحجوزات')).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع الأحرف الخاصة', () => {
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: '@#$%' } });
    
    expect(screen.getByText('لا توجد نتائج')).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع البيانات الفارغة', () => {
    mockTrpc.leads.unifiedList.useQuery.mockReturnValue({ data: [] });
    mockTrpc.appointments.list.useQuery.mockReturnValue({ data: [] });
    mockTrpc.offerLeads.list.useQuery.mockReturnValue({ data: [] });
    mockTrpc.campRegistrations.listPaginated.useQuery.mockReturnValue({ data: { data: [] } });
    
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });
    
    expect(screen.getByText('لا توجد نتائج')).toBeInTheDocument();
  });

  it('يجب أن يحدد النتائج بـ 3 لكل نوع', () => {
    mockTrpc.leads.unifiedList.useQuery.mockReturnValue({
      data: Array.from({ length: 10 }, (_, i) => ({
        id: i,
        fullName: `عميل ${i}`,
        phone: '967712345678',
        email: `client${i}@example.com`,
        registrationType: 'appointment',
      })),
    });
    
    render(<GlobalSearch />);
    
    const searchButton = screen.getByLabelText('فتح البحث العام');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByLabelText('حقل البحث العام');
    fireEvent.change(searchInput, { target: { value: 'عميل' } });
    
    expect(screen.getByText('تسجيلات العملاء (3)')).toBeInTheDocument();
  });
});
