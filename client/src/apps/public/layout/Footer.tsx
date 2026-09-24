import { useState } from 'react';
import {
  Send,
  ShieldCheck,
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  Plus,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { Link } from 'wouter';
import { openPrivacyPreferences } from '@/core/feedback/PrivacyPolicyConsentBanner';
import { usePWAInstall } from '@/core/pwa/usePWAInstall';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [pwaGuideOpen, setPwaGuideOpen] = useState(false);

  // Progressive Web App hook
  const { canInstall, isInstalled, isIOS, isInstalling, installApp } = usePWAInstall('public');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const handlePwaClick = async () => {
    if (isInstalled) {
      setPwaGuideOpen(true);
      return;
    }
    if (isIOS) {
      setPwaGuideOpen(true);
      return;
    }
    if (canInstall) {
      const res = await installApp();
      if (res === 'unavailable') {
        setPwaGuideOpen(true);
      }
    } else {
      setPwaGuideOpen(true);
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
    <footer
      className="relative w-full overflow-hidden text-white pt-14 pb-8 select-none"
      style={{
        background: '#40ad56',
        backgroundImage: 'linear-gradient(270deg, #40ad56 0%, #007438 100%)',
        minHeight: '480px',
      }}
      dir="rtl"
    >
      {/* Official SGH Curved Watermark Background */}
      <div
        className="absolute pointer-events-none opacity-10 bg-no-repeat bg-top"
        style={{
          backgroundImage: 'url(/sgh/footer.svg)',
          top: '10%',
          left: '-25%',
          width: '150%',
          height: '100%',
          backgroundSize: 'cover',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 lg:px-12 max-w-6xl space-y-12">
        {/* Top Tier: Newsletter & PWA Download */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 border-b border-white/20 items-center">
          {/* Newsletter Box */}
          <div className="space-y-3 text-right">
            <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-white m-0">
              اشترك في نشرتنا الإخبارية
            </h2>
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

          {/* Progressive Web App Download */}
          <div className="space-y-3 text-right md:text-left">
            <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-white m-0">
              تثبيت التطبيق
            </h2>
            <div className="flex flex-wrap items-center justify-start md:justify-end">
              <button
                type="button"
                onClick={handlePwaClick}
                disabled={isInstalling}
                className="group inline-flex items-center gap-3.5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 backdrop-blur-xs transition-all duration-300 text-right cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98]"
                title="تثبيت تطبيق"
              >
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0 group-hover:scale-105 group-hover:bg-white/25 transition-all">
                  {isInstalled ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-emerald-200" />
                  )}
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-white/80 font-medium leading-tight">
                    {isInstalled ? 'التطبيق مثبت على جهازك' : 'تطبيق الهاتف'}
                  </span>
                  <span className="block text-xs sm:text-[13px] font-bold text-white leading-snug flex items-center gap-1.5">
                    {isInstalling
                      ? 'جارٍ التثبيت...'
                      : isInstalled
                        ? 'التطبيق جاهز للاستخدام'
                        : 'تثبيت التطبيق'}
                    {!isInstalled && (
                      <Download className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-y-0.5 transition-transform" />
                    )}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Tier: Links & Sana'a Hospital Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-right text-xs">
          {/* Column 1 */}
          <ul className="space-y-3">
            {navCol1.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  className="text-white/85 hover:text-white hover:-translate-x-1 transition-all duration-200 inline-block text-[13px]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Column 2 */}
          <ul className="space-y-3">
            {navCol2.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  className="text-white/85 hover:text-white hover:-translate-x-1 transition-all duration-200 inline-block text-[13px]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Column 3 */}
          <ul className="space-y-3">
            {navCol3.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  className="text-white/85 hover:text-white hover:-translate-x-1 transition-all duration-200 inline-block text-[13px]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Column 4: Sana'a Hospital Contacts */}
          <div className="space-y-3 col-span-2 md:col-span-1 bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/15 pb-2">
              <span>المستشفى السعودي الألماني - صنعاء</span>
            </h3>
            <ul className="space-y-2 text-[11.5px] text-white/90">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span>
                  الرقم المجاني:{' '}
                  <a
                    href="tel:+9678000018"
                    className="font-bold text-white hover:text-emerald-200 underline"
                    dir="ltr"
                  >
                    8000018
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span>
                  هاتف:{' '}
                  <a
                    href="tel:+9671313333"
                    className="font-bold text-white hover:text-emerald-200 underline"
                    dir="ltr"
                  >
                    +967 1 313 333
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-200 shrink-0 mt-0.5" />
                <span>صنعاء، شارع الستين الشمالي، جولة الجمنة</span>
              </li>
              <li className="flex items-center gap-2 pt-1 text-[11px] text-emerald-100/80">
                <Clock className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span>خدمة طبية ورعاية ألمانية على مدار الساعة</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Tier: Logo, Copyright, Made by & Legal Links */}
        <div className="pt-7 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/85">
          {/* Logo and hospital branch */}
          <div className="flex items-center gap-3">
            <img
              src="/sgh/logo.svg"
              alt="المستشفى السعودي الألماني - صنعاء"
              className="h-10 w-auto filter brightness-0 invert"
            />
            <div className="flex flex-col text-right">
              <span className="font-bold text-white text-[13px]">
                المستشفى السعودي الألماني - صنعاء
              </span>
            </div>
          </div>

          {/* Copyright & Made By Attribution */}
          <div className="text-center space-y-1">
            <p className="text-xs text-white/90">حقوق النشر ٢٠٢٦ جميع الحقوق محفوظة</p>
            <p className="text-[11px] text-white/75">
              صنع بواسطة{' '}
              <span className="font-bold text-white hover:text-emerald-200 transition-colors">
                آيديا للاستشارات والحلول التسويقية والرقمية
              </span>
            </p>
          </div>

          {/* Legal Links (Terms of Use removed as requested) */}
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end text-[11.5px]">
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

      {/* PWA Install Guidance Modal */}
      <Dialog open={pwaGuideOpen} onOpenChange={setPwaGuideOpen}>
        <DialogContent className="max-w-md text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>
                {isInstalled
                  ? 'التطبيق مثبت بالفعل'
                  : 'تثبيت تطبيق الويب للمستشفى السعودي الألماني'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isInstalled
                ? 'تطبيق الويب التقدمي مثبت بالفعل على هذا الجهاز وجاهز للاستخدام السريع.'
                : 'احصل على وصول فوري ومباشر إلى الخدمات الطبية وحجز المواعيد بدون متاجر التطبيقات.'}
            </DialogDescription>
          </DialogHeader>

          {isInstalled ? (
            <div className="py-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-700">
                يمكنك فتح التطبيق مباشرة من الشاشة الرئيسية لهاتفك أو من قائمة التطبيقات على حاسوبك.
              </p>
            </div>
          ) : isIOS ? (
            <div className="space-y-3 py-3 text-xs text-slate-700">
              <p className="font-bold text-slate-800">خطوات التثبيت على أجهزة iPhone و iPad:</p>
              <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[11px]">
                  1
                </span>
                <span>
                  اضغط على زر المشاركة <Share2 className="inline h-3.5 w-3.5 mx-1 text-blue-600" />{' '}
                  في متصفح Safari أسفل الشاشة.
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[11px]">
                  2
                </span>
                <span>
                  مرر للأسفل واختر <b className="text-slate-900">"إضافة إلى الشاشة الرئيسية"</b>{' '}
                  <Plus className="inline h-3.5 w-3.5 mx-1 text-emerald-600" />
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[11px]">
                  3
                </span>
                <span>اضغط على "إضافة" في الزاوية العلوية لتثبيت الأيقونة على جهازك.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-3 text-xs text-slate-700">
              <p className="font-bold text-slate-800">طريقة تثبيت التطبيق على جهازك:</p>
              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <Download className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <b className="block text-slate-900">على أجهزة الكمبيوتر (Chrome / Edge):</b>
                  <span>
                    اضغط على أيقونة التثبيت (🖥️ أو ⬇️) الموجودة في شريط العنوان أعلى المتصفح، ثم
                    انقر على "تثبيت".
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <b className="block text-slate-900">على هواتف Android (Chrome):</b>
                  <span>
                    اضغط على قائمة النقاط الثلاث (⋮) في أعلى المتصفح واختر "تثبيت التطبيق" أو "إضافة
                    إلى الشاشة الرئيسية".
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  );
}
