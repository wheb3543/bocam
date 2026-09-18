import { useState, useEffect, useRef } from 'react';
import { Phone, Menu, X, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { COMPANY_PHONE } from '@/const';
import SghTopHeader from './SghTopHeader';

export default function SghNavbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [patientsDropdownOpen, setPatientsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setPatientsDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
        setPatientsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const aboutSubMenu = [
    { label: 'لمحة عامة عن المستشفى', href: '/#about' },
    { label: 'قصتنا ومسيرتنا', href: '/#about' },
    { label: 'مجموعتنا الصحية', href: '/#about' },
    { label: 'هدفنا ورؤيتنا', href: '/#about' },
    { label: 'الجوائز والاعتمادات', href: '/#accreditations' },
    { label: 'الأسئلة الشائعة', href: '/#faq' },
  ];

  const patientsSubMenu = [
    { label: 'الرعاية الصحية والتعليم', href: '/#blog' },
    { label: 'خدمات كبار الشخصيات (VIP)', href: '/#services' },
    { label: 'عيادات التخصصات الفرعية', href: '/departments' },
    { label: 'شبكة Mayo Clinic للرعاية', href: '/#about' },
    { label: 'قصص وتجارب المرضى', href: '/#feedback' },
  ];

  return (
    <header
      className="sticky top-0 z-50 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.11)] select-none"
      dir="rtl"
      ref={dropdownRef}
    >
      {/* Top Utility Bar */}
      <SghTopHeader />

      {/* Main Bar */}
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo (Right side in RTL) */}
          <Link href="/">
            <div className="flex items-center cursor-pointer py-1">
              <img
                src="/sgh/logo.svg"
                alt="المستشفى السعودي الألماني - حائل"
                className="w-[157px] h-[64px] object-contain shrink-0"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center text-[14.4px] font-normal text-[#333333]">
            {/* Dropdown: عن المستشفى */}
            <div className="relative">
              <button
                onClick={() => {
                  setAboutDropdownOpen(!aboutDropdownOpen);
                  setPatientsDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-[14.4px] py-2 hover:text-[#1ea74d] transition-colors cursor-pointer"
              >
                <span>عن المستشفى</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180 text-[#1ea74d]' : ''}`}
                />
              </button>

              {aboutDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {aboutSubMenu.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      onClick={() => setAboutDropdownOpen(false)}
                      className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1ea74d] transition-colors text-right"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown: المرضى والزوار */}
            <div className="relative">
              <button
                onClick={() => {
                  setPatientsDropdownOpen(!patientsDropdownOpen);
                  setAboutDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-[14.4px] py-2 hover:text-[#1ea74d] transition-colors cursor-pointer"
              >
                <span>المرضى والزوار</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${patientsDropdownOpen ? 'rotate-180 text-[#1ea74d]' : ''}`}
                />
              </button>

              {patientsDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {patientsSubMenu.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      onClick={() => setPatientsDropdownOpen(false)}
                      className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1ea74d] transition-colors text-right"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link href="/doctors">
              <span
                className={`px-[14.4px] py-2 hover:text-[#1ea74d] transition-colors cursor-pointer ${location === '/doctors' ? 'text-[#1ea74d]' : ''}`}
              >
                الأطباء
              </span>
            </Link>

            <Link href="/departments">
              <span
                className={`px-[14.4px] py-2 hover:text-[#1ea74d] transition-colors cursor-pointer ${location === '/departments' ? 'text-[#1ea74d]' : ''}`}
              >
                التخصصات الطبية
              </span>
            </Link>

            <a
              href="/#news"
              className="px-[14.4px] py-2 hover:text-[#1ea74d] transition-colors cursor-pointer"
            >
              الأخبار
            </a>
          </nav>

          {/* Left Action: Phone Pill Button */}
          <div className="flex items-center gap-3">
            {COMPANY_PHONE && (
              <a
                href={`tel:${COMPANY_PHONE}`}
                className="flex items-center gap-2 h-[34px] px-[14.4px] rounded-full border border-[#2eb34b] text-[#2eb34b] hover:bg-[#2eb34b] hover:text-white transition-all text-[14.4px] font-normal"
              >
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">{COMPANY_PHONE}</span>
              </a>
            )}

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#1ea74d] rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="قائمة التنقل"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-2">
            <Link href="/">
              <span className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#1ea74d]">
                الرئيسية
              </span>
            </Link>
            <Link href="/doctors">
              <span className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#1ea74d]">
                الأطباء
              </span>
            </Link>
            <Link href="/departments">
              <span className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#1ea74d]">
                التخصصات الطبية
              </span>
            </Link>
            <Link href="/offers">
              <span className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#1ea74d]">
                العروض الطبية
              </span>
            </Link>
            <a
              href="/#news"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#1ea74d]"
            >
              الأخبار والفعاليات
            </a>
            <a
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#1ea74d]"
            >
              اتصل بنا
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
