import { useState, useCallback } from 'react';

/**
 * Hook مشترك لإدارة حالة الشريط الجانبي (expanded/collapsed)
 *
 * السلوك:
 * - يتم الفتح والطي حصرياً عبر زر التحكم.
 * - لا يتم فرضه مفتوحاً في الصفحة الرئيسية.
 * - تم إلغاء التمدد عند تمرير الماوس (hover).
 * - يتم حفظ تفضيل المستخدم في localStorage.
 *
 * @returns {object} - حالة الشريط ودوال التحكم
 */
export function useSidebarState() {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('bocam_sidebar_expanded');
      return stored !== null ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bocam_sidebar_expanded', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // دوال الـ hover أصبحت no-op للتوافق العكسي
  const handleMouseEnter = useCallback(() => {}, []);
  const handleMouseLeave = useCallback(() => {}, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // حالة العرض النهائية: تعتمد حصرياً على حالة الزر isExpanded
  const shouldShowText = isExpanded;

  return {
    isExpanded,
    isHovered: false,
    isMobileOpen,
    shouldShowText,
    isHomePage: false,
    toggleExpanded,
    handleMouseEnter,
    handleMouseLeave,
    toggleMobile,
    closeMobile,
  };
}
