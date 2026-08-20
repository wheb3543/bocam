import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MobileBottomNav from '@/components/layout/sidebar/MobileBottomNav';
import {
  allToolsGroups,
  bottomNavItems,
  defaultVisibleItemIds,
} from '@/components/layout/sidebarData';

describe('P1 navigation structure', () => {
  it('groups administrative tools around the revised user tasks', () => {
    expect(allToolsGroups.map((group) => group.label)).toEqual(
      expect.arrayContaining([
        'تشغيل المرضى والحجوزات',
        'المحتوى والنشر',
        'التواصل والقنوات',
        'القياس والتقارير',
        'الإدارة والنظام',
      ])
    );

    const communication = allToolsGroups.find((group) => group.label === 'التواصل والقنوات');
    expect(communication?.items[0]?.id).toBe('messages');
    expect(communication?.items.find((item) => item.id === 'integration-settings')?.title).toBe(
      'ربط المنصات الاجتماعية'
    );
    expect(defaultVisibleItemIds).toEqual(
      expect.arrayContaining(['messages', 'publishing', 'media-library'])
    );
  });

  it('renders a mobile navigation state with accessible unread counts and touch-friendly actions', () => {
    const onNavigate = vi.fn();
    render(
      <MobileBottomNav
        bottomNavItems={bottomNavItems}
        isItemActive={(href) => href === '/admin'}
        getBadgeCount={(id) => (id === 'home' ? 2 : 0)}
        handleNavClick={onNavigate}
        onMoreClick={vi.fn()}
      />
    );

    const home = screen.getByRole('button', { name: 'الرئيسية، 2 إشعارات غير مقروءة' });
    expect(home.getAttribute('aria-current')).toBe('page');
    fireEvent.click(home);
    expect(onNavigate).toHaveBeenCalledWith('/admin');
    expect(screen.getByRole('button', { name: 'المزيد من الأدوات' })).toBeTruthy();
  });
});
