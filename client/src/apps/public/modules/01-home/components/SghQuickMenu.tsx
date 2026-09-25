import { Stethoscope, CalendarCheck, Building, Smartphone } from 'lucide-react';
import { Link } from 'wouter';
import { useBookingModal } from '@/hooks/booking/useBookingModal';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  type: 'link' | 'booking' | 'external' | 'anchor';
  href?: string;
}

export default function SghQuickMenu() {
  const { openBookingModal } = useBookingModal();

  // Exactly matches SGH Hail .section-menuinline ul: 6 items in RTL order
  // Note: Only the first 4 items have icons (A, B, C, D in icon font), the last 2 have no icons
  const menuItems: MenuItem[] = [
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
      href: '/appointment',
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
      type: 'external',
      href: 'https://saudigermanhealth.com/en/mobile-application-0',
    },
    {
      id: 'overview',
      label: 'لمحة عامة',
      type: 'anchor',
      href: '#about',
    },
    {
      id: 'about',
      label: 'نبذة عنا',
      type: 'anchor',
      href: '#about',
    },
  ];

  return (
    <section
      className="sgh-hero-surface section section-menuinline w-full py-0 mb-4 select-none"
      dir="rtl"
    >
      {/* SGH Hail: .inner-section with exact linear-gradient(90deg, #2ab24b 0%, #007242 100%) */}
      <div
        className="inner-section w-full overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #2ab24b 0%, #007242 100%)',
        }}
      >
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row w-full list-none p-0 m-0 text-center divide-y sm:divide-y-0 divide-white/15">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === menuItems.length - 1;

            const content = (
              <div
                className={`w-full h-full min-h-[56px] lg:h-[88px] flex items-center justify-center text-center font-bold text-[15px] lg:text-[16px] text-white px-3 lg:px-4 py-4 lg:py-0 hover:bg-white/10 transition-colors duration-200 cursor-pointer ${
                  !isLast ? 'lg:border-l lg:border-white/15' : ''
                }`}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0 text-white ml-[6.4px] inline-block" />}
                <span className="leading-tight">{item.label}</span>
              </div>
            );

            if (item.type === 'booking') {
              return (
                <li key={item.id} className="lg:flex-1 text-center">
                  <button
                    onClick={() => openBookingModal()}
                    className="w-full h-full focus:outline-none cursor-pointer"
                    aria-label={item.label}
                  >
                    {content}
                  </button>
                </li>
              );
            }

            if (item.type === 'external') {
              return (
                <li key={item.id} className="lg:flex-1 text-center">
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    {content}
                  </a>
                </li>
              );
            }

            if (item.type === 'anchor') {
              return (
                <li key={item.id} className="lg:flex-1 text-center">
                  <a href={item.href} className="block w-full h-full">
                    {content}
                  </a>
                </li>
              );
            }

            return (
              <li key={item.id} className="lg:flex-1 text-center">
                <Link href={item.href || '/'}>{content}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
