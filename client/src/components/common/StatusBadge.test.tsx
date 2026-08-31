import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('uses a soft success palette for active states', () => {
    render(<StatusBadge status="success" label="نشط" />);

    const badge = screen.getByText('نشط');
    expect(badge.className).toContain('bg-emerald-50');
    expect(badge.className).toContain('text-emerald-700');
    expect(badge.className).toContain('border-emerald-200');
  });

  it('uses a soft error palette for failed states', () => {
    render(<StatusBadge status="error" label="مرفوض" />);

    const badge = screen.getByText('مرفوض');
    expect(badge.className).toContain('bg-red-50');
    expect(badge.className).toContain('text-red-700');
    expect(badge.className).toContain('border-red-200');
  });

  it('uses a soft warning palette for pending states', () => {
    render(<StatusBadge status="warning" label="قيد الانتظار" />);

    const badge = screen.getByText('قيد الانتظار');
    expect(badge.className).toContain('bg-amber-50');
    expect(badge.className).toContain('text-amber-700');
    expect(badge.className).toContain('border-amber-200');
  });
});
