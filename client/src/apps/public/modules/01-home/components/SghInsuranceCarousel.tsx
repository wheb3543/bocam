import { Shield } from 'lucide-react';

export default function SghInsuranceCarousel() {
  const partners = [
    {
      name: 'بوبا العربية',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/bupa.png?itok=XOio3Jfl',
    },
    {
      name: 'التعاونية للتأمين',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/tawuiniya.png?itok=qsFlrQwS',
    },
    {
      name: 'تكافل الراجحي',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/alrajhi.png?itok=noLff1oe',
    },
    {
      name: 'ميدغلف',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/medgulf.png?itok=L6INJqny',
    },
    {
      name: 'سايكو',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/saico.png?itok=oAap-aTm',
    },
    {
      name: 'نكست كير',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/nextcare.png?itok=IY9fJT_5',
    },
    {
      name: 'غلوب ميد',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/globemed.png?itok=BtlQMNLq',
    },
    {
      name: 'مدنت',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/mednet.png?itok=JdlkVL8u',
    },
    {
      name: 'ملاذ للتأمين',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/malath.png?itok=pFhXq6om',
    },
    {
      name: 'عناية للتأمين',
      logo: 'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-02/3inaya.png?itok=BWsZDtXW',
    },
  ];

  return (
    <section className="py-20 bg-white select-none overflow-hidden" dir="rtl">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            شركاء التأمين
          </h2>
        </div>

        {/* Logos Grid matching reference site */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {partners.map((partner, idx) => (
            <div
              key={idx}
              className="h-28 bg-[#f8f9fa] rounded-2xl border border-slate-100/80 shadow-xs hover:shadow-md p-5 flex items-center justify-center transition-all duration-300 hover:scale-105 group"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows matching reference site */}
        <div className="flex items-center justify-center gap-3 pt-10">
          <button
            className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-500 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="السابق"
          >
            <span className="text-xs">❯</span>
          </button>
          <button
            className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-500 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="التالي"
          >
            <span className="text-xs">❮</span>
          </button>
        </div>
      </div>
    </section>
  );
}
