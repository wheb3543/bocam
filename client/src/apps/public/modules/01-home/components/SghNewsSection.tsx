import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface NewsCard {
  id: string;
  title: string;
  day: string;
  month: string;
}

export default function SghNewsSection() {
  const [page, setPage] = useState(0);

  const newsList: NewsCard[] = [
    {
      id: 'n1',
      title: 'إشارة إلى البيان الصادر عن هيئة السوق المالية بالمملكة العربية السعودية',
      day: '25',
      month: 'أيار',
    },
    {
      id: 'n2',
      title: 'السعودي الألماني الصحية تُعزِّز مكانتها كأكبر مجموعةٍ في شبكة Mayo Clinic بالمنطقة',
      day: '1',
      month: 'تشرين الأول',
    },
    {
      id: 'n3',
      title: 'عيادة اضطرابات النوم – تشخيص وعلاج متكامل فرع المدينة',
      day: '24',
      month: 'آذار',
    },
    {
      id: 'n4',
      title: 'استئصال ورم يهدد حياة مريضة بفرع مكة',
      day: '9',
      month: 'كانون الثاني',
    },
    {
      id: 'n5',
      title: 'أمل جديد لمريضة فقدت قدرتها على المشي',
      day: '3',
      month: 'تشرين الثاني',
    },
  ];

  return (
    <section id="news" className="py-20 bg-white select-none border-t border-slate-100" dir="rtl">
      <div className="container mx-auto px-4 lg:px-12 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">الأخبار</h2>

          <a
            href="/#news"
            className="px-7 py-2.5 rounded-full bg-[#00a3e0] hover:bg-[#008fc5] text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
          >
            عرض المزيد
          </a>
        </div>

        {/* 2 Columns Cards Grid with Sky Blue Square Date Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsList.map((item) => (
            <div
              key={item.id}
              className="bg-[#f8f9fa] rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[220px] group cursor-pointer"
            >
              {/* Top: Square Date Block */}
              <div className="flex justify-start">
                <div className="w-16 h-16 rounded-2xl bg-[#a4c9e8] text-white flex flex-col items-center justify-center font-bold shadow-xs">
                  <span className="text-2xl leading-none font-black">{item.day}</span>
                  <span className="text-[10px] mt-0.5 leading-tight opacity-95">{item.month}</span>
                </div>
              </div>

              {/* Title */}
              <div className="pt-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-[#00a3e0] transition-colors leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Arrows */}
        <div className="flex items-center justify-center gap-3 pt-12">
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            className="w-9 h-9 rounded-full border border-slate-300 hover:border-slate-500 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="w-9 h-9 rounded-full border border-slate-300 hover:border-slate-500 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
