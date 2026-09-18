import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PublicationQualityFeedback } from './PublicationQualityFeedback';

describe('PublicationQualityFeedback', () => {
  it('يعرض أخطاء النشر وحقل التجاوز الإداري للمدير', () => {
    render(
      <PublicationQualityFeedback
        status="published"
        issues={['الصورة لا تحتوي على نص بديل.']}
        isAdmin
        overrideReason=""
        onOverrideReasonChange={vi.fn()}
      />
    );

    expect(screen.getByText('تعذر النشر بسبب فحص الجودة')).toBeInTheDocument();
    expect(screen.getByText('الصورة لا تحتوي على نص بديل.')).toBeInTheDocument();
    expect(screen.getByLabelText('سبب التجاوز الإداري')).toBeInTheDocument();
  });

  it('لا يعرض حقل التجاوز للمستخدم غير الإداري', () => {
    render(
      <PublicationQualityFeedback
        status="published"
        issues={['رابط الصورة غير صالح.']}
        isAdmin={false}
        overrideReason=""
        onOverrideReasonChange={vi.fn()}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('تجاوز الفحص متاح للمدير فقط.');
    expect(screen.queryByLabelText('سبب التجاوز الإداري')).not.toBeInTheDocument();
  });
});
