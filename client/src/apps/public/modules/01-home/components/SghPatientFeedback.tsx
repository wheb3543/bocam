import { ArrowLeft } from 'lucide-react';
import { COMPANY_PHONE } from '@/const';

export default function SghPatientFeedback() {
  const contactHref = COMPANY_PHONE ? `tel:${COMPANY_PHONE}` : '/#contact';

  return (
    <section
      id="feedback"
      className="section section-html-content feedback with-image my-6 select-none relative overflow-hidden"
      dir="rtl"
    >
      <div className="container max-w-[1380px] mx-auto px-[15px]">
        <div className="inner-section relative min-h-[340px] sm:min-h-[390px] overflow-hidden rounded-none sm:rounded-sm flex items-center p-8 sm:p-14 lg:p-16 shadow-xs border border-slate-100">
          {/* Authentic Background Photo */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-102"
            style={{
              backgroundImage: 'url(/sgh/feedback/feedback-bg.jpg)',
            }}
          />

          {/* RTL Soft White Gradient Overlay protecting the text contrast on the right */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to left, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.82) 40%, rgba(255, 255, 255, 0.3) 70%, transparent 100%)',
            }}
          />

          {/* Content Column on the Right */}
          <div className="relative z-10 max-w-lg text-right">
            <div className="below-text text-[13px] sm:text-[14px] font-medium text-slate-500 mb-2">
              تجربة المريض
            </div>

            <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-bold text-[#212529] tracking-tight leading-tight mb-6">
              نحن نقدر تعليقاتك
            </h2>

            <div className="actions">
              <a
                href={contactHref}
                className="btn btn-primary bg-[#1ca8e5] hover:bg-[#1694cc] text-white text-[15px] sm:text-[16px] font-normal px-8 py-2.5 rounded-full inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <span>اتصل بنا</span>
                <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Subtle Decorative Heart SVG in Corner */}
          <div className="absolute bottom-6 left-6 pointer-events-none opacity-20 hidden sm:block">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1ca8e5"
              strokeWidth="1.5"
            >
              <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
