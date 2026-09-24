import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'الشك في مرض الإيدز',
    date: 'نيسـان 15, 2026',
    image: '/sgh/blog/blog-1.jpg',
    excerpt:
      'الشك في مرض الإيدز، ماذا تفعل الآن؟ هل الشك في مرض الإيدز يعني الإصابة؟ لا، الشك وحده لا يعني الإصابة. كثير من الناس يمرون بقلق شديد بعد تعرض محتمل، لكن القلق لا يُشخّص أي مرض. الطريقة الوحيدة للتأكد هي إجراء تحليل HIV في الوقت المناسب. الإطمئنان الحقيقي يأتي من التحليل، لا من التخمين.',
  },
  {
    id: 'blog-2',
    title: 'أعراض الكلاميديا عند النساء',
    date: 'نيسـان 14, 2026',
    image: '/sgh/blog/blog-2.jpg',
    excerpt:
      'أعراض الكلاميديا عند النساء: 7 علامات تحذيرية لا تتجاهليها + متى تزورين طبيبك في السعودي الألماني. تمت المراجعة الطبية بواسطة فريق أطباء عيادات الأمراض المعدية. لماذا تُسمى الكلاميديا بالعدوى الصامتة؟ تخيّلي أن جسمك يحمل عدوى بكتيرية دون أن تشعري بأي ألم أو أعراض واضحة.',
  },
  {
    id: 'blog-3',
    title: 'أسباب انقطاع النفس أثناء النوم',
    date: 'نيسـان 12, 2026',
    image: '/sgh/blog/blog-3.jpg',
    excerpt:
      'أسباب انقطاع النفس أثناء النوم: 7 علامات خطيرة تستدعي فحص Sleep Study فوراً. تستيقظ كل يوم وأنت منهك، رغم أنك نمت ساعات طويلة. شريكك يشكو من شخيرك الشديد، وأحياناً تستيقظ مذعوراً وأنت تشعر أنك توقفت عن التنفس. هذه الأعراض ليست مجرد تعب عادي بل تستوجب مراجعة الطبيب المختص.',
  },
  {
    id: 'blog-4',
    title: 'تجربتي مع انقطاع النفس أثناء النوم',
    date: 'نيسـان 12, 2026',
    image: '/sgh/blog/blog-4.jpg',
    excerpt:
      'تجربتي مع انقطاع النفس أثناء النوم: كيف اكتشفت المشكلة وبدأت العلاج. كنت أعتقد أن الشخير شيء طبيعي، لكن لم أكن أعرف أني أتوقف عن التنفس أثناء النوم! لسنوات وأنا أستيقظ كل صباح بنفس الشعور من التعب والصداع حتى راجعت المستشفى وبدأت خطة العلاج الفعالة.',
  },
  {
    id: 'blog-5',
    title: 'هل الشخير طبيعي',
    date: 'نيسـان 12, 2026',
    image: '/sgh/blog/blog-5.jpg',
    excerpt:
      'هل الشخير طبيعي أم علامة على مرض خطير؟ ومتى تحتاج زيارة Sleep Lab؟ كثير من الناس يعتقدون أن الشخير أمر طبيعي، لكن الحقيقة قد تكون مختلفة تماماً. تعرف على أسبابه وكيفية تشخيصه وعلاجه بأحدث التقنيات.',
  },
];

export default function SghBlogSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BLOG_POSTS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + BLOG_POSTS.length) % BLOG_POSTS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % BLOG_POSTS.length);
  };

  const currentPost = BLOG_POSTS[currentIndex];

  return (
    <section
      id="blog"
      className="section-blog my-6 sm:my-8 bg-white select-none overflow-hidden"
      dir="rtl"
    >
      {/* SGH Hail: .inner-section with authentic #f8f8f8 background card and 3rem padding */}
      <div className="inner-section w-full bg-[#f8f8f8] py-10 sm:py-12 px-4 sm:px-12 rounded-none sm:rounded-2xl">
        {/* Inner Content Grid: .col-md-10.offset-md-1 (max-w-[1140px] mx-auto) */}
        <div className="max-w-[1140px] mx-auto">
          {/* Header with CTA Button */}
          <div className="section-header with-cta flex items-center justify-between mb-8 sm:mb-10">
            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#212529] tracking-tight m-0">
              أحدث المقالات
            </h2>
            <a
              href="/#blog"
              className="btn btn-primary bg-[#1ca8e5] hover:bg-[#1694cc] text-white text-[15px] sm:text-[16px] font-normal px-[22.4px] py-[6px] rounded-[30px] transition-colors shadow-xs inline-flex items-center justify-center cursor-pointer"
            >
              عرض المزيد
            </a>
          </div>

          {/* Slider Row with authentic SGH card layout */}
          <div className="slider-row relative bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xs overflow-hidden border border-slate-100/80">
            <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12 min-h-[320px]">
              {/* Image Column (In RTL: on the right) with authentic 80% aspect ratio */}
              <div className="w-full md:w-[385px] shrink-0">
                <a
                  href="/#blog"
                  className="block w-full h-[260px] sm:h-[308px] overflow-hidden rounded-xl shadow-xs relative group cursor-pointer"
                >
                  <img
                    key={currentPost.id}
                    src={currentPost.image}
                    alt={currentPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 animate-in fade-in duration-300"
                  />
                </a>
              </div>

              {/* Content Column (In RTL: on the left) */}
              <div className="flex-1 text-right flex flex-col justify-start">
                <h3 className="text-[22px] sm:text-[26px] lg:text-[28px] font-bold leading-[1.25] text-[#212529] mb-2 hover:text-[#1ca8e5] transition-colors cursor-pointer">
                  <a href="/#blog">{currentPost.title}</a>
                </h3>

                <div className="inline-date flex items-center gap-1.5 text-[13.6px] text-[#8ca4b8] mb-4 sm:mb-6">
                  <Calendar className="w-3.5 h-3.5 text-[#8ca4b8]" />
                  <span>{currentPost.date}</span>
                </div>

                <div className="description text-[14.5px] sm:text-[15.2px] leading-[24px] text-[#333333] font-normal line-clamp-4">
                  {currentPost.excerpt}
                </div>
              </div>
            </div>

            {/* Navigator (Slider Navigation Buttons) */}
            <div className="navigator flex items-center justify-start gap-2 pt-6">
              <button
                onClick={handlePrev}
                className="na-slider-actions prev w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
                aria-label="السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="na-slider-actions next w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
                aria-label="التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
