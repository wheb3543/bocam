import { useState } from 'react';
import { Send, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { openPrivacyPreferences } from '@/core/feedback/PrivacyPolicyConsentBanner';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const navCol1 = [
    { label: 'الصفحة الرئيسية', href: '/' },
    { label: 'لمحة عامة', href: '/#about' },
    { label: 'قصتنا', href: '/#about' },
    { label: 'هدفنا ورؤيتنا', href: '/#about' },
    { label: 'المرضى من خارج الدولة', href: '/#services' },
  ];

  const navCol2 = [
    { label: 'خدمات الرعاية الصحية المنزلية', href: '/#services' },
    { label: 'الأخبار', href: '/#news' },
    { label: 'الفعاليات', href: '/#news' },
    { label: 'العروض', href: '/offers' },
    { label: 'المدونة الطبية', href: '/#blog' },
  ];

  const navCol3 = [
    { label: 'الصحية للرعاية القائمة على القيمة والنتائج', href: '/#services' },
    { label: 'الأطباء', href: '/doctors' },
    { label: 'الأقسام', href: '/departments' },
    { label: 'الأسئلة الشائعة', href: '/#faq' },
    { label: 'الوظائف', href: '/careers' },
  ];

  return (
    <footer className="bg-[#146c36] text-white pt-16 pb-6 select-none" dir="rtl">
      <div className="container mx-auto px-4 lg:px-12 max-w-6xl space-y-12">
        {/* Top Tier: Newsletter & App Download */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12 border-b border-white/20 items-start">
          {/* Newsletter Box */}
          <div className="space-y-3 text-right">
            <h3 className="text-lg sm:text-xl font-bold text-white">اشترك في نشرتنا الإخبارية</h3>
            {subscribed ? (
              <p className="text-xs text-emerald-200 flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>تم الاشتراك بنجاح في النشرة الإخبارية!</span>
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center max-w-sm gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني..."
                  className="flex-1 bg-white text-slate-800 placeholder:text-slate-400 rounded-full px-4 py-2.5 text-xs outline-none shadow-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#00a3e0] hover:bg-[#008fc5] text-white font-bold text-xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                  <span>اشتراك</span>
                </button>
              </form>
            )}
          </div>

          {/* Mobile App Download */}
          <div className="space-y-3 text-right md:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white">تحميل التطبيق</h3>
            <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
              <a
                href="https://apple.co/3XqfKhK"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2 transition-all"
              >
                <span className="text-lg font-bold"></span>
                <div className="text-right">
                  <span className="block text-[9px] text-white/80 leading-none">تنزيل من</span>
                  <span className="block text-xs font-bold text-white leading-tight">
                    App Store
                  </span>
                </div>
              </a>

              <a
                href="https://bit.ly/3GIU76j"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2 transition-all"
              >
                <span className="text-base font-bold text-emerald-300">▶</span>
                <div className="text-right">
                  <span className="block text-[9px] text-white/80 leading-none">متاح على</span>
                  <span className="block text-xs font-bold text-white leading-tight">
                    Google Play
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Middle Tier: 4 Columns Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-right text-xs">
          {/* Column 1 */}
          <ul className="space-y-2.5">
            {navCol1.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  className="text-white/90 hover:text-white hover:underline transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Column 2 */}
          <ul className="space-y-2.5">
            {navCol2.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  className="text-white/90 hover:text-white hover:underline transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Column 3 */}
          <ul className="space-y-2.5">
            {navCol3.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  className="text-white/90 hover:text-white hover:underline transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Column 4: Certificates */}
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-xl shadow-md max-w-[180px]">
              <img
                src="/sgh/accreditation.jpg"
                alt="اعتمادات المستشفى السعودي الألماني"
                className="max-h-12 w-auto object-contain mx-auto"
              />
            </div>
            <p className="text-[10px] text-white/80 leading-relaxed">
              معتمدون من قِبل المركز السعودي لاعتماد المنشآت الصحية واللجنة الدولية المشتركة.
            </p>
          </div>
        </div>

        {/* Bottom Tier: Logo, Copyright & Legal Links */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/80">
          <div className="flex items-center gap-3">
            <img
              src="/sgh/logo.svg"
              alt="المستشفى السعودي الألماني - حائل"
              className="h-9 w-auto filter brightness-0 invert"
            />
            <span className="font-bold text-white">المستشفى السعودي الألماني - حائل</span>
          </div>

          <div className="text-center">
            <p>حقوق النشر ٢٠٢٦ جميع الحقوق محفوظة</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
            <Link href="/terms">
              <span className="hover:text-white hover:underline cursor-pointer">
                تعليمات الاستخدام
              </span>
            </Link>
            <span>|</span>
            <Link href="/privacy-policy">
              <span className="hover:text-white hover:underline cursor-pointer">
                سياسة الخصوصية
              </span>
            </Link>
            <span>|</span>
            <Link href="/privacy-policy-changelog">
              <span className="hover:text-white hover:underline cursor-pointer">
                سجل تغييرات الخصوصية
              </span>
            </Link>
            <span>|</span>
            <button
              type="button"
              onClick={openPrivacyPreferences}
              className="hover:text-white hover:underline cursor-pointer"
            >
              إدارة الخصوصية
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
