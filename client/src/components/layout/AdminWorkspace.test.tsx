import { useEffect, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AdminTab } from '@/hooks/layout/useAdminTabs';
import AdminWorkspace from './AdminWorkspace';

const tabs: AdminTab[] = [
  { id: 'home', title: 'الرئيسية', href: '/admin' },
  { id: 'reports', title: 'التقارير', href: '/admin/reports/reports' },
];

function StatefulPage({ id, onMount, onUnmount }: { id: string; onMount: () => void; onUnmount: () => void }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    onMount();
    return onUnmount;
  }, [onMount, onUnmount]);

  return (
    <label>
      {id}
      <input aria-label={id} value={value} onChange={(event) => setValue(event.target.value)} />
    </label>
  );
}

describe('AdminWorkspace', () => {
  it('keeps opened page instances mounted and preserves their input state', () => {
    const mounts = { home: vi.fn(), reports: vi.fn() };
    const unmounts = { home: vi.fn(), reports: vi.fn() };
    const renderContent = (tab: AdminTab) => (
      <StatefulPage
        id={tab.id}
        onMount={mounts[tab.id as keyof typeof mounts]}
        onUnmount={unmounts[tab.id as keyof typeof unmounts]}
      />
    );

    const { rerender } = render(
      <AdminWorkspace tabs={tabs} activeTabId="home" renderContent={renderContent} />
    );

    fireEvent.change(screen.getByLabelText('home'), { target: { value: 'draft text' } });
    rerender(<AdminWorkspace tabs={tabs} activeTabId="reports" renderContent={renderContent} />);
    rerender(<AdminWorkspace tabs={tabs} activeTabId="home" renderContent={renderContent} />);

    expect(screen.getByLabelText('home')).toHaveValue('draft text');
    expect(mounts.home).toHaveBeenCalledTimes(1);
    expect(mounts.reports).toHaveBeenCalledTimes(1);
    expect(unmounts.home).not.toHaveBeenCalled();
    expect(unmounts.reports).not.toHaveBeenCalled();
    expect(screen.getByTestId('admin-tab-content-reports')).toHaveAttribute('hidden');
  });

  it('unmounts only the tab removed from the open tabs list', () => {
    const mounts = { home: vi.fn(), reports: vi.fn() };
    const unmounts = { home: vi.fn(), reports: vi.fn() };
    const renderContent = (tab: AdminTab) => (
      <StatefulPage
        id={tab.id}
        onMount={mounts[tab.id as keyof typeof mounts]}
        onUnmount={unmounts[tab.id as keyof typeof unmounts]}
      />
    );

    const { rerender } = render(
      <AdminWorkspace tabs={tabs} activeTabId="reports" renderContent={renderContent} />
    );
    rerender(<AdminWorkspace tabs={[tabs[0]]} activeTabId="home" renderContent={renderContent} />);

    expect(unmounts.reports).toHaveBeenCalledTimes(1);
    expect(unmounts.home).not.toHaveBeenCalled();
  });
});
