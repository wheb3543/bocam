import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminContentSkeleton from '@/components/layout/AdminContentSkeleton';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
  COMPANY_ARABIC_NAME,
  COMPANY_ENGLISH_NAME,
  COMPANY_LOGO,
} from '@/config';

describe('P0 interface foundation', () => {
  it('provides SGH branding fallbacks when company environment values are absent', () => {
    expect(COMPANY_ARABIC_NAME).toBeTruthy();
    expect(COMPANY_ENGLISH_NAME).toBeTruthy();
    expect(COMPANY_LOGO).toBeTruthy();
  });

  it('renders the unified administrative page hierarchy with optional status and actions', () => {
    render(
      <AdminPageHeader
        eyebrow="التواصل الاجتماعي"
        title="صندوق البريد الموحد"
        description="إدارة الرسائل والتعليقات من مكان واحد"
        status={<span>3 حسابات متصلة</span>}
        actions={<button type="button">تحديث</button>}
      />
    );

    expect(screen.getByRole('heading', { name: 'صندوق البريد الموحد' })).toBeTruthy();
    expect(screen.getByText('التواصل الاجتماعي')).toBeTruthy();
    expect(screen.getByText('3 حسابات متصلة')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'تحديث' })).toBeTruthy();
  });

  it('renders accessible dashboard and workspace loading skeletons', () => {
    const { rerender } = render(<AdminContentSkeleton />);
    expect(screen.getByRole('status', { name: 'جاري تحميل الصفحة' })).toBeTruthy();

    rerender(<AdminContentSkeleton variant="workspace" />);
    expect(screen.getByText('جاري تحميل الصفحة')).toBeTruthy();
  });
});
