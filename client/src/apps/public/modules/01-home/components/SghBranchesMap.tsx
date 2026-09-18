import { MapPin, Phone, Clock, Navigation, CheckCircle2 } from 'lucide-react';
import { COMPANY_PHONE, COMPANY_ADDRESS, COMPANY_CITY } from '@/const';

export default function SghBranchesMap() {
  const address =
    COMPANY_ADDRESS || 'شارع الخزامى، حي الخزامى 55482، حائل، المملكة العربية السعودية';
  const googleMapsUrl = 'https://maps.google.com/?q=Saudi+German+Hospital+Hail';

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 select-none"
      dir="rtl"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Info Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E2B6D]/10 text-[#1E2B6D] text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-[#1DA8E5]" />
              <span>موقع المستشفى وبيانات الاتصال</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                المستشفى السعودي الألماني - حائل
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                يسعدنا استقبالكم في صرحنا الطبي الرائد بحائل لتقديم أرقى خدمات الرعاية الصحية
                والتشخيصية.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Address */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#1DA8E5] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">العنوان والموقع</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{address}</p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">أوقات العمل واستقبال الحالات</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    قسم الطوارئ والعناية المركزة:{' '}
                    <span className="font-bold text-emerald-600">24/7 على مدار الساعة</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    العيادات الخارجية: السبت إلى الخميس (8:00 صباحاً – 10:00 مساءً)
                  </p>
                </div>
              </div>

              {/* Contact Phone */}
              {COMPANY_PHONE && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#1E2B6D] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">خدمة العملاء وحجز المواعيد</h4>
                    <a
                      href={`tel:${COMPANY_PHONE}`}
                      className="text-xs font-bold text-[#1DA8E5] hover:underline mt-0.5 block"
                      dir="ltr"
                    >
                      {COMPANY_PHONE}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Button */}
            <div className="pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1E2B6D] hover:bg-[#162152] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Navigation className="w-4 h-4 text-[#40B6FF]" />
                <span>الاتجاهات عبر خرائط Google</span>
              </a>
            </div>
          </div>

          {/* Visual Map Frame */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
              <img
                src="https://hail.saudigermanhealth.com/sites/default/files/styles/hd/public/2021-06/sghmaps.jpg?itok=fnZlEaFX"
                alt="خريطة موقع المستشفى السعودي الألماني حائل"
                className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2B6D]/80 via-transparent to-transparent pointer-events-none" />

              {/* Pin Indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#1E2B6D] text-white flex items-center justify-center shadow-2xl border-2 border-white animate-bounce">
                  <MapPin className="w-5 h-5 text-[#40B6FF]" />
                </div>
                <div className="px-3 py-1 rounded-full bg-white text-[#1E2B6D] text-[11px] font-bold shadow-md mt-1 whitespace-nowrap">
                  المستشفى السعودي الألماني - حائل
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
