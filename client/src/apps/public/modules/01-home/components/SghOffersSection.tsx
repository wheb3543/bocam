import { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useBookingModal } from '@/hooks/booking/useBookingModal';

interface OfferItem {
  id: string;
  title: string;
  price: number;
  date: string;
  image: string;
}

export default function SghOffersSection() {
  const { openBookingModal } = useBookingModal();
  const [scrollIndex, setScrollIndex] = useState(0);

  const offers: OfferItem[] = [
    {
      id: 'o1',
      title: 'باقة الربو',
      price: 1250,
      date: '12 شباط',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2023-07/%D9%81%D8%AD%D8%B5%20%D8%A7%D9%84%D8%B1%D8%A8%D9%88.png?itok=HUlGVik8',
    },
    {
      id: 'o2',
      title: 'باقة الانسداد الشعبي للمدخنين',
      price: 770,
      date: '12 شباط',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2021-08/4%20%D9%86%D8%B5%D8%A7%D8%A6%D8%AD%20%D9%84%D9%85%D8%B1%D8%B6%D9%89%20%D8%A3%D9%85%D8%B1%D8%A7%D8%B6%20%D8%A7%D9%84%D8%B1%D8%A6%D8%A9%20%D8%A7%D9%84%D9%85%D8%B2%D9%85%D9%86%D8%A9%20%D9%84%D8%AA%D8%AD%D8%B3%D9%8A%D9%86%20%D9%82%D8%AF%D8%B1%D8%AA%D9%87%D9%85%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%AA%D9%86%D9%81%D8%B3.jpg?itok=BxpmTA_b',
    },
    {
      id: 'o3',
      title: 'إبرة النيوفوند',
      price: 1199,
      date: 'كانون الثاني',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2022-05/%D8%A7%D8%A8%D8%B1%D8%A9%20%D8%A7%D9%84%D9%85%D8%B4%D8%A7%D9%87%D9%8A%D8%B1%20.jpg?itok=lzVUzAO6',
    },
    {
      id: 'o4',
      title: 'إبرة البروفايلو',
      price: 1199,
      date: 'كانون الثاني',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2024-07/%D8%AC%D9%84%D8%B3%D8%A9%20%D8%A8%D9%84%D8%A7%D8%B2%D9%85%D8%A7.jpg?itok=hF2T3Gb_',
    },
    {
      id: 'o5',
      title: 'إبره إنوفيال',
      price: 1199,
      date: 'كانون الثاني',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2024-01/%D8%AC%D9%84%D8%B3%D8%A9%20%D8%A8%D9%84%D8%A7%D8%B2%D9%85%D8%A7.jpg?itok=tmTYQMZ8',
    },
    {
      id: 'o6',
      title: 'فحص حصوات',
      price: 499,
      date: 'عرض سارٍ',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2022-02/shutterstock_1859648578.jpg?itok=MQ9j_Mp8',
    },
  ];

  return (
    <section id="offers" className="py-16 bg-white select-none" dir="rtl">
      {/* Full-width Cyan Blue Banner Exactly Like Reference */}
      <div className="w-full bg-[#00a3e0] py-8 px-6 lg:px-16 text-white mb-12">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-right">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              احصل على أفضل العروض اليوم!
            </h2>
            <p className="text-xs sm:text-sm text-white/90 italic">
              لقد قمنا بجمع قائمة بالعروض المذهلة عبر الإنترنت لتحويل حياتك الصحية إلى الأفضل
            </p>
          </div>

          <div>
            <Link href="/offers">
              <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#00a3e0] hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer whitespace-nowrap">
                <span>جميع العروض</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Offers Carousel / Grid */}
      <div className="container mx-auto px-4 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              onClick={() => openBookingModal()}
              className="bg-[#f8f9fa] rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer group p-3"
            >
              {/* Image & Price */}
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-200">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00a3e0]/80 via-transparent to-transparent" />

                {/* Price Display */}
                <div className="absolute bottom-2.5 right-2.5 text-white">
                  <span className="text-[10px] font-bold block opacity-90">SAR</span>
                  <span className="text-2xl font-black leading-none">{offer.price}</span>
                </div>
              </div>

              {/* Title */}
              <div className="pt-3 pb-1 text-center">
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-[#00a3e0] transition-colors line-clamp-2">
                  {offer.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-center gap-3 pt-10">
          <button
            onClick={() => setScrollIndex((p) => Math.max(0, p - 1))}
            className="w-8 h-8 rounded-full bg-[#00a3e0] text-white flex items-center justify-center hover:bg-[#008fc5] transition-colors cursor-pointer"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScrollIndex((p) => p + 1)}
            className="w-8 h-8 rounded-full bg-[#00a3e0] text-white flex items-center justify-center hover:bg-[#008fc5] transition-colors cursor-pointer"
            aria-label="التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
