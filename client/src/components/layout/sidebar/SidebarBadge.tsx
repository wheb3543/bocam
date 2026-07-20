/**
 * Sidebar Badge Component
 * مكون شارة الشريط الجانبي
 */

function SidebarBadge({ count }: { count: number }) {
  if (!count) {
    return null;
  }
  return (
    <span className="absolute -top-1 -left-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
}

export default SidebarBadge;
