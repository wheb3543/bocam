import { Link } from 'wouter';

interface DepartmentItem {
  id: string;
  title: string;
  image: string;
  href: string;
}

export default function SghDepartmentsSection() {
  // Ordered exactly as displayed in SGH Hail reference site (Row 1: Pediatrics, Internal, Surgery | Row 2: ObGyn, Cardiology, Orthopedics | Row 3: Urology)
  const departments: DepartmentItem[] = [
    {
      id: 'pediatrics',
      title: 'طب الأطفال وحديثي الولادة',
      image: '/sgh/departments/pediatrics.jpg',
      href: '/departments',
    },
    {
      id: 'internal',
      title: 'الطب الباطني',
      image: '/sgh/departments/internal.jpg',
      href: '/departments',
    },
    {
      id: 'surgery',
      title: 'الجراحة العامة والتخصصية',
      image: '/sgh/departments/surgery.jpg',
      href: '/departments',
    },
    {
      id: 'obgyn',
      title: 'قسم أمراض النساء والتوليد',
      image: '/sgh/departments/obgyn.jpg',
      href: '/departments',
    },
    {
      id: 'cardiology',
      title: 'طب القلب وجراحة القلب والصدر',
      image: '/sgh/departments/cardiology.jpg',
      href: '/departments',
    },
    {
      id: 'orthopedics',
      title: 'طب العظام ورعاية الإصابات',
      image: '/sgh/departments/orthopedics.jpg',
      href: '/departments',
    },
    {
      id: 'urology',
      title: 'قسم المسالك البولية',
      image: '/sgh/departments/urology.jpg',
      href: '/departments',
    },
  ];

  return (
    <section
      id="departments"
      className="section section-departments block-atheme-departments-mosaic my-6 sm:my-8 bg-white select-none overflow-hidden"
      dir="rtl"
    >
      {/* SGH Hail: .inner-section with authentic #f8f8f8 background card, circular gradients, and 3rem padding */}
      <div className="container max-w-[1380px] mx-auto px-[15px]">
        <div className="inner-section relative w-full bg-[#f8f8f8] py-10 sm:py-12 px-4 sm:px-12 rounded-none sm:rounded-2xl overflow-hidden">
          {/* Exact organic circular gradient shapes from SGH Hail CSS */}
          <div
            className="absolute -top-[50%] right-[30%] w-[200%] h-[200%] rounded-full pointer-events-none z-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(226, 226, 226, 0.6) 0%, rgba(226, 226, 226, 0.2) 40%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute top-[30%] -right-[50%] w-[200%] h-[200%] rounded-full pointer-events-none z-0"
            style={{
              background:
                'linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.36) 40%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          {/* Inner Content Grid: .col-md-10.offset-md-1 (max-w-[1140px] mx-auto) */}
          <div className="w-full max-w-[1140px] mx-auto relative z-10">
            {/* Header Section (.section-header with-cta align-top) */}
            <header className="section-header with-cta align-top flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
              <div className="w-full md:w-auto">
                <h2 className="text-[28px] sm:text-[32px] font-bold text-[#212529] tracking-tight m-0 leading-tight">
                  أقسامنا الطبية
                </h2>
              </div>
              <div className="w-full md:max-w-[420px] text-right space-y-3">
                <p className="text-[15px] sm:text-[16px] text-[#212529] leading-relaxed m-0 font-normal">
                  لقد جمعنا أفضل الأطباء في الرعاية الصحية لنقدم لك خدمة طبية فائقة الجودة بمستوى
                  عالمي
                </p>
                <div>
                  <Link href="/departments">
                    <span className="inline-block bg-[#1ca8e5] hover:bg-[#1896cd] text-white text-[15px] sm:text-[16px] font-normal px-[22.4px] py-[6px] rounded-[30px] transition-all duration-200 cursor-pointer shadow-xs">
                      عرض المزيد
                    </span>
                  </Link>
                </div>
              </div>
            </header>

            {/* Department Cards Mosaic Grid (3 Columns, 110% aspect ratio, 30px rounded corners) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {departments.map((dept) => (
                <div key={dept.id} className="department-item w-full">
                  <Link href={dept.href}>
                    <div className="node-title block cursor-pointer">
                      {/* Card with 60% height padding on mobile and 110% on desktop, 10px radius on mobile and 30px on desktop */}
                      <span
                        className="relative block w-full pt-[60%] sm:pt-[110%] rounded-[10px] sm:rounded-[30px] overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.19)] transition-transform duration-500 hover:scale-[1.03] bg-cover bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${dept.image})`,
                        }}
                      >
                        {/* Title Pill Tab anchored to the RIGHT edge with rounded-l-[20px] on mobile, rounded-l-[30px] on desktop */}
                        <h3
                          className="absolute right-0 bottom-[10%] max-w-[90%] z-10 m-0 py-2 px-4 sm:py-3.5 sm:px-8 text-[#333333] text-[15px] sm:text-[20px] font-semibold leading-tight rounded-l-[20px] sm:rounded-l-[30px] rounded-r-none backdrop-blur-xs shadow-xs"
                          style={{
                            background:
                              'linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.42) 100%)',
                          }}
                        >
                          {dept.title}
                        </h3>
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
