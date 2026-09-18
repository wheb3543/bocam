import { ArrowLeft } from 'lucide-react';
import { COMPANY_PHONE } from '@/const';

export default function SghPatientFeedback() {
  return (
    <section id="feedback" className="py-12 bg-white select-none" dir="rtl">
      <div className="container mx-auto px-4 lg:px-12 max-w-5xl">
        <div className="bg-[#f8f9fa] rounded-3xl p-8 sm:p-12 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-right">
            <span className="text-[11px] font-semibold text-slate-400 block">تجربة المريض</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800">نحن نقدر تعليقاتك</h2>
          </div>

          <div>
            {COMPANY_PHONE ? (
              <a
                href={`tel:${COMPANY_PHONE}`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#00a3e0] hover:bg-[#008fc5] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                <span>اتصل بنا</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </a>
            ) : (
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#00a3e0] hover:bg-[#008fc5] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                <span>اتصل بنا</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
