import { Stethoscope, CalendarCheck, Building, Smartphone, Info, Hospital } from 'lucide-react';
import { Link } from 'wouter';
import { useBookingModal } from '@/hooks/booking/useBookingModal';

export default function SghQuickMenu() {
  const { openBookingModal } = useBookingModal();

  const menuItems = [
    {
      id: 'doctor',
      label: 'ابحث عن طبيب',
      icon: Stethoscope,
      type: 'link',
      href: '/doctors',
    },
    {
      id: 'appointment',
      label: 'احجز موعد',
      icon: CalendarCheck,
      type: 'booking',
    },
    {
      id: 'departments',
      label: 'الأقسام',
      icon: Building,
      type: 'link',
      href: '/departments',
    },
    {
      id: 'app',
      label: 'تحميل التطبيق',
      icon: Smartphone,
      type: 'link',
      href: 'https://saudigermanhealth.com/en/mobile-application-0',
    },
    {
      id: 'overview',
      label: 'لمحة عامة',
      icon: Info,
      type: 'anchor',
      href: '#about',
    },
    {
      id: 'about',
      label: 'نبذة عنا',
      icon: Hospital,
      type: 'anchor',
      href: '#about',
    },
  ];

  return (
    <section
      className="w-full bg-[#1ea74d] select-none text-white shadow-md z-30 relative"
      dir="rtl"
    >
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-white/20">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.type === 'booking') {
              return (
                <button
                  key={item.id}
                  onClick={() => openBookingModal()}
                  className="flex items-center justify-center gap-2 py-4 px-3 hover:bg-[#16883d] transition-colors cursor-pointer text-center font-bold text-xs sm:text-sm text-white"
                >
                  <Icon className="w-4 h-4 shrink-0 text-white/90" />
                  <span>{item.label}</span>
                </button>
              );
            }

            if (item.type === 'anchor') {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-center gap-2 py-4 px-3 hover:bg-[#16883d] transition-colors text-center font-bold text-xs sm:text-sm text-white"
                >
                  <Icon className="w-4 h-4 shrink-0 text-white/90" />
                  <span>{item.label}</span>
                </a>
              );
            }

            return (
              <Link key={item.id} href={item.href || '/'}>
                <div className="flex items-center justify-center gap-2 py-4 px-3 hover:bg-[#16883d] transition-colors cursor-pointer text-center font-bold text-xs sm:text-sm text-white h-full">
                  <Icon className="w-4 h-4 shrink-0 text-white/90" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
