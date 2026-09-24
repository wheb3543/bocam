import { useState, useEffect, useRef } from 'react';
import { Phone, Menu, X, ChevronDown, MapPin } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { COMPANY_PHONE } from '@/const';
import SghTopHeader from './SghTopHeader';

export default function SghNavbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [patientsDropdownOpen, setPatientsDropdownOpen] = useState(false);
  const [branchesDropdownOpen, setBranchesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setPatientsDropdownOpen(false);
    setBranchesDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
        setPatientsDropdownOpen(false);
        setBranchesDropdownOpen(false);
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
    { label: 'الأكاديمية', href: '/#about' },
    { label: 'برنامج الأطباء الزائرين', href: '/visiting-doctors' },
    { label: 'المخيمات الطبية الخيرية', href: '/camps' },
    { label: 'العروض الطبية', href: '/offers' },
    { label: 'قصص وتجارب المرضى', href: '/#feedback' },
    { label: 'شبكة Mayo Clinic للرعاية', href: '/#about' },
    { label: 'نصائح الخبراء', href: '/#blog' },
    { label: 'عيادات التخصصات الفرعية', href: '/departments' },
    { label: 'خدمات كبار الشخصيات (VIP)', href: '/#services' },
    { label: 'المرضى من خارج الدولة', href: '/#about' },
    { label: 'التمويل والتسهيلات', href: '/#services' },
  ];

  interface BranchItem {
    label: string;
    href: string;
    isCurrent?: boolean;
  }

  const saudiBranches: BranchItem[] = [
    { label: 'حائل', href: 'https://hail.saudigermanhealth.com/ar' },
    { label: 'جدة', href: 'https://jeddah.saudigermanhealth.com/ar' },
    { label: 'الرياض', href: 'https://riyadh.saudigermanhealth.com/ar' },
    { label: 'المدينة المنورة', href: 'https://madinah.saudigermanhealth.com/ar' },
    { label: 'عسير', href: 'https://aseer.saudigermanhealth.com/ar' },
    { label: 'الدمام', href: 'https://dammam.saudigermanhealth.com/ar' },
    { label: 'مكة المكرمة', href: 'https://saudigermanhealth.com/ar/makkah' },
    { label: 'مجمع عيادات أبها', href: 'https://saudigermanhealth.com/ar/abha' },
    { label: 'عيادات بيفرلي', href: 'https://beverlyclinics.com/ar/' },
    { label: 'حي الجامعة', href: 'https://haj.saudigermanhealth.com/' },
  ];

  const intlBranches: BranchItem[] = [
    { label: 'صنعاء (الفرع الحالي)', href: '/#', isCurrent: true },
    { label: 'دبي (الإمارات)', href: 'https://www.sghdubai.ae/' },
    { label: 'الشارقة (الإمارات)', href: 'https://www.sghsharjah.com/ar/' },
    { label: 'عجمان (الإمارات)', href: 'https://www.sghajman.ae/' },
    { label: 'القاهرة (مصر)', href: 'https://sghcairo.net/' },
  ];

  const displayPhone = COMPANY_PHONE || '+967 1 313333';

  return (
    <header
      className="sticky top-0 z-50 bg-white shadow-[0_1px_8px_0px_#0000001c] select-none font-['Diodrum_Arabic','Cairo',sans-serif]"
      dir="rtl"
      ref={dropdownRef}
    >
      {/* Top Utility Bar */}
      <SghTopHeader />

      {/* Main Bar */}
      <div className="container mx-auto px-[15px] max-w-[1380px]">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo (Far Right in RTL) */}
          <Link href="/">
            <div className="flex items-center cursor-pointer h-[80px]">
              <img
                src="/sgh/logo.svg"
                alt="المستشفى السعودي الألماني - صنعاء"
                className="w-[140px] sm:w-[157.1px] h-[50px] sm:h-[64px] object-contain shrink-0"
              />
            </div>
          </Link>

          {/* Flexible Spacer */}
          <div className="hidden lg:flex flex-1" />

          {/* Desktop Navigation Links & Action Button (Grouped on Left in RTL) */}
          <div className="hidden lg:flex items-center h-[80px]">
            <nav
              role="navigation"
              aria-label="القائمة الرئيسية"
              className="flex items-center h-[80px] text-[14.4px] font-normal text-[#333333]"
            >
              {/* Dropdown: عن المستشفى */}
              <div
                className="relative h-[80px] flex items-center"
                onMouseEnter={() => setAboutDropdownOpen(true)}
                onMouseLeave={() => setAboutDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAboutDropdownOpen(!aboutDropdownOpen);
                    setPatientsDropdownOpen(false);
                    setBranchesDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-[14.4px] h-[80px] hover:text-[#2eb34b] transition-colors cursor-pointer ${
                    aboutDropdownOpen ? 'text-[#2eb34b]' : ''
                  }`}
                >
                  <span>عن المستشفى</span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      aboutDropdownOpen ? 'rotate-180 text-[#2eb34b]' : ''
                    }`}
                  />
                </button>

                {aboutDropdownOpen && (
                  <div className="absolute top-[80px] right-0 w-56 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {aboutSubMenu.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={() => setAboutDropdownOpen(false)}
                        className="block px-4 py-2 text-[12.8px] text-[#333333] hover:text-[#2eb34b] hover:bg-[#f8f8f8] border-b border-slate-50 last:border-b-0 transition-colors text-right"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown: المرضى والزوار */}
              <div
                className="relative h-[80px] flex items-center"
                onMouseEnter={() => setPatientsDropdownOpen(true)}
                onMouseLeave={() => setPatientsDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setPatientsDropdownOpen(!patientsDropdownOpen);
                    setAboutDropdownOpen(false);
                    setBranchesDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-[14.4px] h-[80px] hover:text-[#2eb34b] transition-colors cursor-pointer ${
                    patientsDropdownOpen ? 'text-[#2eb34b]' : ''
                  }`}
                >
                  <span>المرضى والزوار</span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      patientsDropdownOpen ? 'rotate-180 text-[#2eb34b]' : ''
                    }`}
                  />
                </button>

                {patientsDropdownOpen && (
                  <div className="absolute top-[80px] right-0 w-64 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {patientsSubMenu.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={() => setPatientsDropdownOpen(false)}
                        className="block px-4 py-2 text-[12.8px] text-[#333333] hover:text-[#2eb34b] hover:bg-[#f8f8f8] border-b border-slate-50 last:border-b-0 transition-colors text-right"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown: الفرع */}
              <div
                className="relative h-[80px] flex items-center"
                onMouseEnter={() => setBranchesDropdownOpen(true)}
                onMouseLeave={() => setBranchesDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setBranchesDropdownOpen(!branchesDropdownOpen);
                    setAboutDropdownOpen(false);
                    setPatientsDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-[14.4px] h-[80px] hover:text-[#2eb34b] transition-colors cursor-pointer ${
                    branchesDropdownOpen ? 'text-[#2eb34b]' : ''
                  }`}
                >
                  <span>الفرع</span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      branchesDropdownOpen ? 'rotate-180 text-[#2eb34b]' : ''
                    }`}
                  />
                </button>

                {branchesDropdownOpen && (
                  <div className="absolute top-[80px] right-0 w-72 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-slate-100 py-2 z-50 max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                      المملكة العربية السعودية
                    </div>
                    {saudiBranches.map((branch, idx) => (
                      <a
                        key={idx}
                        href={branch.href}
                        onClick={() => setBranchesDropdownOpen(false)}
                        className={`block px-4 py-2 text-[12.8px] hover:text-[#2eb34b] hover:bg-[#f8f8f8] border-b border-slate-50 transition-colors text-right ${
                          branch.isCurrent
                            ? 'font-bold text-[#2eb34b] bg-emerald-50/50'
                            : 'text-[#333333]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{branch.label}</span>
                          {branch.isCurrent && (
                            <span className="text-[10px] bg-[#2eb34b] text-white px-1.5 py-0.5 rounded-full">
                              الحالي
                            </span>
                          )}
                        </div>
                      </a>
                    ))}

                    <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 mt-1">
                      الفروع الدولية
                    </div>
                    {intlBranches.map((branch, idx) => (
                      <a
                        key={idx}
                        href={branch.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setBranchesDropdownOpen(false)}
                        className="block px-4 py-2 text-[12.8px] text-[#333333] hover:text-[#2eb34b] hover:bg-[#f8f8f8] border-b border-slate-50 last:border-b-0 transition-colors text-right"
                      >
                        {branch.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* الأطباء */}
              <Link href="/doctors">
                <span
                  className={`h-[80px] flex items-center px-[14.4px] hover:text-[#2eb34b] transition-colors cursor-pointer ${
                    location === '/doctors' ? 'text-[#2eb34b]' : ''
                  }`}
                >
                  الأطباء
                </span>
              </Link>

              {/* التخصصات الطبية */}
              <Link href="/departments">
                <span
                  className={`h-[80px] flex items-center px-[14.4px] hover:text-[#2eb34b] transition-colors cursor-pointer ${
                    location === '/departments' ? 'text-[#2eb34b]' : ''
                  }`}
                >
                  التخصصات الطبية
                </span>
              </Link>

              {/* الأخبار */}
              <a
                href="/#news"
                className="h-[80px] flex items-center px-[14.4px] hover:text-[#2eb34b] transition-colors cursor-pointer"
              >
                الأخبار
              </a>
            </nav>

            {/* Left Action: Phone Pill Button */}
            <div className="mr-3">
              <a
                href={`tel:${displayPhone}`}
                className="flex items-center gap-2 h-[34px] px-[14.4px] rounded-[30px] border border-[#2eb34b] text-[#2eb34b] hover:bg-[#2eb34b] hover:text-white transition-all text-[14.4px] font-normal leading-[34px]"
              >
                <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                <span dir="ltr">{displayPhone}</span>
              </a>
            </div>
          </div>

          {/* Mobile Drawer Trigger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-800 hover:text-[#2eb34b] transition-colors cursor-pointer"
              aria-label="قائمة التنقل"
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <Link href="/">
              <span className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#2eb34b]">
                الرئيسية
              </span>
            </Link>

            {/* Mobile: عن المستشفى */}
            <div>
              <button
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#2eb34b]"
              >
                <span>عن المستشفى</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${aboutDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {aboutDropdownOpen && (
                <div className="pr-6 space-y-1 mt-1">
                  {aboutSubMenu.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs text-slate-600 hover:text-[#2eb34b]"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: المرضى والزوار */}
            <div>
              <button
                onClick={() => setPatientsDropdownOpen(!patientsDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#2eb34b]"
              >
                <span>المرضى والزوار</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${patientsDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {patientsDropdownOpen && (
                <div className="pr-6 space-y-1 mt-1">
                  {patientsSubMenu.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs text-slate-600 hover:text-[#2eb34b]"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: الفرع */}
            <div>
              <button
                onClick={() => setBranchesDropdownOpen(!branchesDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#2eb34b]"
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2eb34b]" />
                  <span>الفرع: صنعاء</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${branchesDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {branchesDropdownOpen && (
                <div className="pr-6 space-y-1 mt-1 max-h-48 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-400 py-1">
                    الفروع في السعودية
                  </div>
                  {saudiBranches.map((branch, idx) => (
                    <a
                      key={idx}
                      href={branch.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-1.5 text-xs ${
                        branch.isCurrent
                          ? 'font-bold text-[#2eb34b]'
                          : 'text-slate-600 hover:text-[#2eb34b]'
                      }`}
                    >
                      {branch.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link href="/doctors">
              <span className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#2eb34b]">
                الأطباء
              </span>
            </Link>

            <Link href="/departments">
              <span className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#2eb34b]">
                التخصصات الطبية
              </span>
            </Link>

            <a
              href="/#news"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#2eb34b]"
            >
              الأخبار
            </a>

            <div className="pt-4 border-t border-slate-100">
              <a
                href={`tel:${displayPhone}`}
                className="flex items-center justify-center gap-2 w-full h-[40px] rounded-full border border-[#2eb34b] text-[#2eb34b] hover:bg-[#2eb34b] hover:text-white transition-all text-sm font-semibold"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span dir="ltr">{displayPhone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
