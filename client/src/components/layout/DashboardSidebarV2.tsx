import { useAuth } from '@/_core/hooks/useAuth';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSidebarState } from '@/hooks/ui/useSidebarState';
import { useRecentlyUsed } from '@/hooks/data/useRecentlyUsed';
import AllToolsDrawer from '@/components/AllToolsDrawer';
import EditSidebarModal from '@/components/EditSidebarModal';
import DesktopSidebar from './sidebar/DesktopSidebar';
import MobileBottomNav from './sidebar/MobileBottomNav';
import { useSidebarNotifications } from '@/hooks/layout/useSidebarNotifications';
import {
  allNavItems,
  allToolsGroups,
  bottomNavItems,
  defaultVisibleItemIds,
  type NavItem,
} from './sidebarData';

export default function DashboardSidebarV2({ currentPath }: { currentPath: string }) {
  const { user: _user } = useAuth();
  const { shouldShowText, handleMouseEnter, handleMouseLeave, closeMobile } = useSidebarState();

  const { addRecentlyUsed } = useRecentlyUsed();
  const { whatsappUnreadCount } = useSidebarNotifications(currentPath);
  const [allToolsOpen, setAllToolsOpen] = useState(false);
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);

  // تحديد العناصر المرئية في الشريط (أول 10 عناصر)
  const [visibleItemIds, setVisibleItemIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sidebar_visible_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        // التأكد من أن "home" موجود دائماً في البداية
        if (!parsed.includes('home')) {
          return ['home', ...parsed.slice(0, 9)];
        }
        return parsed.slice(0, 10);
      }
    } catch {
      // Silently handle localStorage errors
    }
    // القيم الافتراضية
    return defaultVisibleItemIds;
  });

  // حفظ العناصر المرئية في localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_visible_items', JSON.stringify(visibleItemIds));
    } catch {
      // Silently handle localStorage errors
    }
  }, [visibleItemIds]);

  // الحصول على العناصر المرئية
  const primaryNavItems = useMemo(() => {
    return visibleItemIds
      .map((id) => allNavItems.find((item) => item.id === id))
      .filter((item): item is NavItem => item !== undefined);
  }, [visibleItemIds]);

  // التحقق من أن العنصر نشط
  const isItemActive = useCallback(
    (href: string) => {
      if (href === '/admin') {
        return currentPath === '/admin' || currentPath === '/admin/';
      }
      return currentPath.startsWith(href);
    },
    [currentPath]
  );

  // الحصول على عدد الإشعارات لعنصر معين
  const getBadgeCount = useCallback(
    (itemId: string) => {
      switch (itemId) {
        case 'whatsapp':
          return whatsappUnreadCount;
        default:
          return 0;
      }
    },
    [whatsappUnreadCount]
  );

  // معالج النقر على عنصر التنقل
  const handleNavClick = useCallback(
    (href: string) => {
      const item = allNavItems.find((i) => i.href === href);
      if (item) {
        addRecentlyUsed({ id: item.id, title: item.title, href: item.href });
      }
      window.location.href = href;
      closeMobile();
      setAllToolsOpen(false);
    },
    [addRecentlyUsed, closeMobile]
  );

  // ============================================
  // الشريط الجانبي الديناميكي (Desktop) - Meta Business Suite Style
  // ============================================
  const renderDesktopSidebar = () => (
    <DesktopSidebar
      shouldShowText={shouldShowText}
      primaryNavItems={primaryNavItems}
      isItemActive={isItemActive}
      getBadgeCount={getBadgeCount}
      handleNavClick={handleNavClick}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
      onAllToolsClick={() => setAllToolsOpen(!allToolsOpen)}
      onEditClick={() => setEditSidebarOpen(true)}
      allToolsOpen={allToolsOpen}
    />
  );

  // ============================================
  // الشريط السفلي للهاتف (Mobile Bottom Navigation)
  // ============================================
  const renderMobileBottomNav = () => (
    <MobileBottomNav
      bottomNavItems={bottomNavItems}
      isItemActive={isItemActive}
      getBadgeCount={getBadgeCount}
      handleNavClick={handleNavClick}
      onMoreClick={() => setAllToolsOpen(true)}
    />
  );

  // معالج حفظ تعديلات الشريط
  const handleSaveVisibleItems = useCallback((newVisibleIds: string[]) => {
    setVisibleItemIds(newVisibleIds);
  }, []);

  return (
    <>
      {renderDesktopSidebar()}
      {renderMobileBottomNav()}
      <AllToolsDrawer
        isOpen={allToolsOpen}
        onClose={() => setAllToolsOpen(false)}
        allToolsGroups={allToolsGroups}
        allNavItems={allNavItems}
      />
      <EditSidebarModal
        isOpen={editSidebarOpen}
        onClose={() => setEditSidebarOpen(false)}
        allToolsGroups={allToolsGroups}
        visibleItemIds={visibleItemIds}
        onSave={handleSaveVisibleItems}
      />
    </>
  );
}
