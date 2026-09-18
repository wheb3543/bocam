import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface DepartmentItem {
  id: string;
  title: string;
  image: string;
  href: string;
}

export default function SghDepartmentsSection() {
  const departments: DepartmentItem[] = [
    {
      id: 'pediatrics',
      title: 'طب الأطفال وحديثي الولادة',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2024-05/%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B7%D9%81%D8%A7%D9%84%20%D9%88%D8%AD%D8%AF%D9%8A%D8%AB%D9%8A%20%D8%A7%D9%84%D9%88%D9%84%D8%A7%D8%AF%D8%A9.jpg?itok=-LsVlbx_',
      href: '/departments',
    },
    {
      id: 'internal',
      title: 'الطب الباطني',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2024-07/%D9%82%D8%B3%D9%85%20%D8%A7%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A8%D8%A7%D8%B7%D9%86%D9%8A.jpg?itok=yDVtEByt',
      href: '/departments',
    },
    {
      id: 'surgery',
      title: 'الجراحة العامة والتخصصية',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2024-05/%D9%82%D8%B3%D9%85%20%D8%A7%D9%84%D8%AC%D8%B1%D8%A7%D8%AD%D8%A9%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D8%A9.jpg?itok=3p8Yh1-v',
      href: '/departments',
    },
    {
      id: 'obgyn',
      title: 'قسم أمراض النساء والتوليد',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2024-05/%D9%82%D8%B3%D9%85%20%D8%A3%D9%85%D8%B1%D8%A7%D8%B6%20%D8%A7%D9%84%D9%86%D8%B3%D8%A7%D8%A1%20%D9%88%D8%A7%D9%84%D9%88%D9%84%D8%A7%D8%AF%D8%A9.jpg?itok=ncDmgFdS',
      href: '/departments',
    },
    {
      id: 'cardiology',
      title: 'طب القلب وجراحة القلب والصدر',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2024-05/%D8%B7%D8%A8%20%D8%A7%D9%84%D9%82%D9%84%D8%A8.jpg?itok=x0TAeb-L',
      href: '/departments',
    },
    {
      id: 'orthopedics',
      title: 'طب العظام ورعاية الإصابات',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2024-07/%D9%82%D8%B3%D9%85%20%D8%A7%D9%84%D8%B9%D8%B8%D8%A7%D9%85%20%D9%88%D8%A7%D9%84%D9%85%D9%81%D8%A7%D8%B5%D9%84.jpg?itok=Vgd8ujEC',
      href: '/departments',
    },
    {
      id: 'urology',
      title: 'قسم المسالك البولية',
      image:
        'https://hail.saudigermanhealth.com/sites/default/files/styles/large/public/2024-04/%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D9%84%D9%83%20%D8%A7%D9%84%D8%A8%D9%88%D9%84%D9%8A%D8%A9.jpg?itok=lx1azW4m',
      href: '/departments',
    },
  ];

  return (
    <section
      id="departments"
      className="pt-16 pb-24 bg-white select-none overflow-hidden"
      dir="rtl"
    >
      {/* Header Container with Angled Polygon Shape on Left */}
      <div className="relative w-full mb-16 min-h-[160px] flex items-center">
        {/* Angled background banner on the left */}
        <div
          className="absolute inset-y-0 left-0 w-full sm:w-2/3 md:w-1/2 bg-[#f4f6f8] z-0"
          style={{
            clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0 100%)',
          }}
        />

        <div className="container mx-auto px-6 lg:px-16 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Title on the Right */}
          <div className="text-right w-full md:w-auto">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight">
              أقسامنا الطبية
            </h2>
          </div>

          {/* Text and Button inside the angled block on the Left */}
          <div className="w-full md:w-auto max-w-md text-right space-y-3 py-4">
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              لقد جمعنا أفضل الأطباء في الرعاية الصحية لنقدم لك خدمة طبية فائقة الجودة بمستوى عالمي
            </p>
            <div>
              <Link href="/departments">
                <span className="inline-block px-8 py-2.5 rounded-full bg-[#00a3e0] hover:bg-[#008fc5] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer">
                  عرض المزيد
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Department Cards Grid */}
      <div className="container mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <Link key={dept.id} href={dept.href}>
              <div className="group h-80 rounded-3xl overflow-hidden bg-[#f4f6f8] border border-slate-200/50 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between p-6">
                {/* Image Container */}
                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-white shadow-xs">
                  <img
                    src={dept.image}
                    alt={dept.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Department Title */}
                <div className="text-center pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#00a3e0] transition-colors leading-snug">
                    {dept.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
