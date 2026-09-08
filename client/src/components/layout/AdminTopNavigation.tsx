import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { APP_LOGO, COMPANY_ARABIC_NAME } from '@/const';
import { useLicense } from '@/hooks/integrations/useLicense';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { canAccessSocialInbox } from '@shared/socialInboxAccess';
import {
  ADMIN_NAVIGATION_SECTIONS,
  type AdminNavigationSection,
  type AdminNavigationSubsection,
} from '@/config/adminNavigation';
import type { NavItem } from '@/config/sidebarNavigation';
import AdminMainNavigation from './AdminMainNavigation';
import AdminSubsectionMenu from './AdminSubsectionMenu';

interface AdminTopNavigationProps {
  currentPath: string;
}

export default function AdminTopNavigation({ currentPath }: AdminTopNavigationProps) {
  const { user } = useAuth();
  const { hasFeature } = useLicense();
  const { can, isLoading: arePermissionsLoading } = useRolePermissions();
  const [, setLocation] = useLocation();
  const navigationRef = useRef<HTMLElement>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeSubsectionId, setActiveSubsectionId] = useState<string | null>(null);

  const visibleSections = useMemo<AdminNavigationSection[]>(() => {
    const canAccessNavItem = (item: NavItem) => {
      if (item.feature && !hasFeature(item.feature)) {
        return false;
      }
      if (item.requiredPermission && (arePermissionsLoading || !can(item.requiredPermission))) {
        return false;
      }
      if (item.allowedRoles?.length) {
        if (item.id === 'messages') {
          return canAccessSocialInbox(user?.role);
        }
        return Boolean(user?.role && item.allowedRoles.includes(user.role));
      }
      return true;
    };

    return ADMIN_NAVIGATION_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(canAccessNavItem),
      subsections: section.subsections
        .map((subsection: AdminNavigationSubsection) => ({
          ...subsection,
          items: subsection.items.filter(canAccessNavItem),
        }))
        .filter((subsection) => subsection.items.length > 0),
    })).filter((section) => section.items.length > 0 || section.subsections.length > 0);
  }, [arePermissionsLoading, can, hasFeature, user?.role]);

  const activeSection = visibleSections.find((section) => section.id === activeSectionId) ?? null;

  const isItemActive = (href: string) => {
    if (href === '/admin') {
      return currentPath === '/admin' || currentPath === '/admin/';
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const isSectionActive = (section: AdminNavigationSection) => {
    return [
      ...section.items,
      ...section.subsections.flatMap((subsection) => subsection.items),
    ].some((item) => isItemActive(item.href));
  };

  const handleNavigate = (item: NavItem) => {
    setActiveSectionId(null);
    setActiveSubsectionId(null);
    setLocation(item.href);
  };

  const handleSectionChange = (sectionId: string | null) => {
    setActiveSectionId(sectionId);
    setActiveSubsectionId(null);
  };

  useEffect(() => {
    const handlePointerDown = (event: Event) => {
      if (!navigationRef.current?.contains(event.target as Node)) {
        setActiveSectionId(null);
        setActiveSubsectionId(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveSectionId(null);
        setActiveSubsectionId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setActiveSectionId(null);
    setActiveSubsectionId(null);
  }, [currentPath]);

  return (
    <header
      ref={navigationRef}
      className="sticky top-0 z-40 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur"
      dir="rtl"
    >
      <div className="mx-auto flex min-h-16 max-w-[1800px] items-center gap-4 px-4 lg:px-6">
        <div className="flex shrink-0 items-center gap-2 border-l border-border/70 pl-4">
          <img src={APP_LOGO} alt={COMPANY_ARABIC_NAME} className="h-9 w-9 object-contain" />
          <span className="hidden text-sm font-bold text-foreground xl:inline">
            {COMPANY_ARABIC_NAME}
          </span>
        </div>
        <AdminMainNavigation
          sections={visibleSections}
          activeSectionId={activeSectionId}
          onSectionChange={handleSectionChange}
          isSectionActive={isSectionActive}
        />
        <div className="mr-auto flex items-center gap-1">
          <span className="hidden text-xs text-muted-foreground lg:inline">لوحة الإدارة</span>
          {activeSection ? (
            <button
              type="button"
              aria-label="إغلاق قائمة التنقل"
              onClick={() => handleSectionChange(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
      </div>
      {activeSection ? (
        <div className="relative mx-auto max-w-[1800px] px-4 pb-3 lg:px-6">
          <AdminSubsectionMenu
            section={activeSection}
            activeSubsectionId={activeSubsectionId}
            onSubsectionChange={setActiveSubsectionId}
            onNavigate={handleNavigate}
            isItemActive={isItemActive}
          />
        </div>
      ) : null}
    </header>
  );
}
