export default function SghFeaturedSection() {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden select-none" dir="rtl">
      {/* Subtle organic background glow/shape */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-slate-50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text & Stats on Right (in RTL: col-span-7) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-snug">
              المستشفى السعودي الألماني - حائل هو مستشفى متعدد التخصصات للرعاية الصحية بدأ تشغيله في
              عام 2017م، بسعة 150 سريرًا.
            </h2>

            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
              <p>
                يقع المستشفى في حي الخزامى، بالقرب من قصر الأمير عبد العزيز بن سعد لتوفير الرعاية
                الصحية الجيدة للمقيمين في حائل.
              </p>
              <p>
                يتكون المستشفى السعودي الألماني في حائل من المبنى الرئيسي الذي تبلغ مساحته 19,456
                متراً مربع، وهو مبنى لموظفيه وبمنشآته الخاصة وبمواقف السيارات.
              </p>
              <p>
                يستقبل المستشفى السعودي الألماني في حائل المرضى من المناطق المجاورة إلى حائل لتلقي
                العلاج.
              </p>
            </div>

            {/* SGH Stat Numbers */}
            <div className="grid grid-cols-2 gap-8 pt-8 max-w-md">
              <div className="text-center">
                <span className="block text-xs font-semibold text-slate-400">مساحة</span>
                <span className="block text-4xl sm:text-5xl lg:text-6xl font-black text-[#8ca4b8] tracking-tight my-1">
                  19,456
                </span>
                <span className="block text-xs font-semibold text-slate-400">متر</span>
              </div>

              <div className="text-center">
                <span className="block text-xs font-semibold text-slate-400">&nbsp;</span>
                <span className="block text-4xl sm:text-5xl lg:text-6xl font-black text-[#8ca4b8] tracking-tight my-1">
                  150
                </span>
                <span className="block text-xs font-semibold text-slate-400">سرير</span>
              </div>
            </div>
          </div>

          {/* Masked Photo on Left with Authentic SGH Organic Kidney Blob Curve */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div
              className="relative w-full max-w-md aspect-4/3 overflow-hidden shadow-2xl bg-slate-100"
              style={{
                borderRadius: '45% 55% 65% 35% / 40% 50% 50% 60%',
              }}
            >
              <img
                src="https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/056A1519_0.JPG?itok=WRKUxfyg"
                alt="المستشفى السعودي الألماني حائل"
                className="w-full h-full object-cover scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
