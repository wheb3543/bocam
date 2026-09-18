import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
}

export default function SghBlogSection() {
  const [currentPage, setCurrentPage] = useState(0);

  const posts: BlogPost[] = [
    {
      id: 'blog-1',
      title: 'الشك في مرض الإيدز',
      date: 'نيسان 15, 2026',
      excerpt:
        'الشك في مرض الإيدز، ماذا تفعل الآن؟ هل الشك في مرض الإيدز يعني الإصابة؟ لا، الشك وحده لا يعني الإصابة. كثير من الناس يمرون بقلق شديد بعد تعرض محتمل، لكن القلق لا يُشخّص أي مرض. الطريقة الوحيدة للتأكد هي إجراء تحليل HIV في الوقت المناسب. الإطمئنان الحقيقي يأتي من التحليل، لا من التخمين.',
    },
    {
      id: 'blog-2',
      title: 'أعراض الكلاميديا عند النساء',
      date: 'نيسان 14, 2026',
      excerpt:
        'أعراض الكلاميديا عند النساء: 7 علامات تحذيرية لا تتجاهليها + متى تزورين طبيبك في السعودي الألماني. تمت المراجعة الطبية بواسطة فريق أطباء عيادات الأمراض المعدية. لماذا تُسمى الكلاميديا بالعدوى الصامتة؟ تخيّلي أن جسمك يحمل عدوى بكتيرية دون أن تشعري بأي ألم أو أعراض واضحة.',
    },
    {
      id: 'blog-3',
      title: 'أسباب انقطاع النفس أثناء النوم',
      date: 'نيسان 12, 2026',
      excerpt:
        'أسباب انقطاع النفس أثناء النوم: 7 علامات خطيرة تستدعي فحص Sleep Study فوراً. تستيقظ كل يوم وأنت منهك، رغم أنك نمت ساعات طويلة. شريكك يشكو من شخيرك الشديد، وأحياناً تستيقظ مذعوراً وأنت تشعر أنك توقفت عن التنفس. هذه الأعراض ليست مجرد تعب عادي بل تستوجب مراجعة الطبيب المختص.',
    },
    {
      id: 'blog-4',
      title: 'تجربتي مع انقطاع النفس أثناء النوم',
      date: 'نيسان 12, 2026',
      excerpt:
        'تجربتي مع انقطاع النفس أثناء النوم: كيف اكتشفت المشكلة وبدأت العلاج. كنت أعتقد أن الشخير شيء طبيعي، لكن لم أكن أعرف أني أتوقف عن التنفس أثناء النوم! لسنوات وأنا أستيقظ كل صباح بنفس الشعور من التعب والصداع حتى راجعت المستشفى وبدأت خطة العلاج الفعالة.',
    },
    {
      id: 'blog-5',
      title: 'هل الشخير طبيعي',
      date: 'نيسان 12, 2026',
      excerpt:
        'هل الشخير طبيعي أم علامة على مرض خطير؟ ومتى تحتاج زيارة Sleep Lab؟ كثير من الناس يعتقدون أن الشخير أمر طبيعي، لكن الحقيقة قد تكون مختلفة تماماً. تعرف على أسبابه وكيفية تشخيصه وعلاجه بأحدث التقنيات.',
    },
  ];

  return (
    <section id="blog" className="py-20 bg-white select-none border-t border-slate-100" dir="rtl">
      <div className="container mx-auto px-4 lg:px-12 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            أحدث المقالات
          </h2>

          <a
            href="/#blog"
            className="px-7 py-2.5 rounded-full bg-[#00a3e0] hover:bg-[#008fc5] text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
          >
            عرض المزيد
          </a>
        </div>

        {/* Articles List */}
        <div className="space-y-8 divide-y divide-slate-100">
          {posts.map((post) => (
            <div key={post.id} className="pt-8 first:pt-0 space-y-2 text-right group">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-[#00a3e0] transition-colors cursor-pointer">
                {post.title}
              </h3>
              <div className="text-[11px] text-slate-400 font-medium">{post.date}</div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl pt-1">
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>

        {/* Carousel Prev/Next Arrows */}
        <div className="flex items-center justify-center gap-3 pt-12">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            className="w-9 h-9 rounded-full border border-slate-300 hover:border-slate-500 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
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
