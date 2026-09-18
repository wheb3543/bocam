/**
 * Sidebar Badge Component
 * مكون شارة الشريط الجانبي
 */

function SidebarBadge({ count }: { count: number }) {
  if (!count) {
    return null;
  }
  return (
    <span
      className="absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white"
      aria-hidden="true"
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}

export default SidebarBadge;
