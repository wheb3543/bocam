/**
 * Seed Blog Posts - بذر مقالات المدونة الطبية
 *
 * ينقل المقالات الخمس التي كانت ثابتة في الصفحة الرئيسية إلى قاعدة البيانات،
 * مع تصنيفاتها ونصوص صفحة المدونة وإعدادات SEO، فتعمل الصفحات ديناميكياً.
 *
 * السكربت idempotent: يُنشئ السجل إن لم يكن موجوداً، ويحدّث المحتوى إن وُجد،
 * لذلك يمكن إعادة تشغيله بأمان.
 *
 * الاستخدام: pnpm db:seed:blog
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';
import { and, count, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../../drizzle/schema';
import {
  buildBlogSlug,
  calculateReadingTime,
  sanitizeBlogHtml,
} from '../../server/modules/05-cms-portal/services/content/blogContentService';
const { blogCategories, blogPosts, seoSettings, textContent } = schema;

/** تصنيفات المدونة الابتدائية مع تمييز لوني من هوية المشروع. */
const CATEGORIES = [
  {
    name: 'الأمراض المعدية',
    nameEn: 'Infectious Diseases',
    slug: 'infectious-diseases',
    description: 'مقالات عن الأمراض المعدية وعلاماتها وعلاجها والوقاية منها.',
    color: '#dc2626',
    sortOrder: 1,
  },
  {
    name: 'صحة النوم والتنفس',
    nameEn: 'Sleep & Breathing',
    slug: 'sleep-breathing',
    description: 'اضطرابات النوم وتوقف التنفس أثناء النوم وصحة الجهاز التنفسي.',
    color: '#1ca8e5',
    sortOrder: 2,
  },
  {
    name: 'القدم السكري والعظام',
    nameEn: 'Diabetes Foot & Orthopedics',
    slug: 'diabetes-foot-orthopedics',
    description: 'مشكلات القدم عند مرضى السكري، والعظام، والمفاصل، وإصاباتها.',
    color: '#2eb34b',
    sortOrder: 3,
  },
  {
    name: 'صحة كبار السن',
    nameEn: 'Geriatric Health',
    slug: 'geriatric-health',
    description: 'مقالات تهم كبار السن والمشكلات الشائعة لديهم.',
    color: '#7c3aed',
    sortOrder: 4,
  },
] as const;

/**
 * المقالات المنقولة من القسم الثابت في الصفحة الرئيسية.
 * المحتوى بصيغة HTML بسيطة متوافقة مع قائمة الوسوم المسموحة،
 * ويُعقَّم آلياً عند الإدخال عبر sanitizeBlogHtml.
 */
const POSTS = [
  {
    title: 'الشك في مرض الإيدز: ماذا تفعل الآن؟',
    slug: 'hiv-suspicion-what-to-do',
    category: 'infectious-diseases',
    cover: '/sgh/blog/blog-1.jpg',
    coverAlt: 'صورة توضيحية لجهاز طبي معملي',
    publishedAt: new Date('2026-04-15T09:00:00Z'),
    featured: true,
    reviewer: 'فريق أطباء عيادات الأمراض المعدية',
    tags: ['الإيدز', 'الأمراض المعدية', 'الفحص الطبي'],
    excerpt:
      'الشك وحده لا يعني الإصابة. الطريقة الوحيدة للتأكد هي إجراء تحليل HIV في الوقت المناسب، والإطمئنان يأتي من التحليل لا من التخمين.',
    body: [
      '<h2>هل الشك في مرض الإيدز يعني الإصابة؟</h2>',
      '<p>لا، الشك وحده لا يعني الإصابة. القلق بعد تعرض محتمل لا يشخص أي مرض. الطريق الوحيد للتأكد هو تحليل HIV في الوقت المناسب.</p>',
      '<h2>متى تطلب الفحص؟</h2>',
      '<ul><li>تعرض لدم أو سوائل من شخص مصاب.</li><li>علاقة جنسية غير محمية مع شخص مجهول الحالة.</li><li>استخدام أدوات حقن مشتركة.</li></ul>',
      '<h2>قبل التحليل وبعده</h2>',
      '<p>قد تمتد فترة النافذة المناسبة حتى ثلاثة أشهر، وقد يوصي الطبيب بإعادة التحليل بعدها. لا تغيّر سلوكك الصحي قبل التأكد، وتجنّب التعرّض للآخرين احتياطاً.</p>',
      '<blockquote>الإطمئنان الحقيقي يأتي من التحليل، لا من التخمين.</blockquote>',
    ],
  },
  {
    title: 'أعراض الكلاميديا عند النساء: 7 علامات تحذيرية',
    slug: 'chlamydia-symptoms-women',
    category: 'infectious-diseases',
    cover: '/sgh/blog/blog-2.jpg',
    coverAlt: 'رسم توضيحي للجهاز التناسلي الأنثوي',
    publishedAt: new Date('2026-04-14T09:00:00Z'),
    featured: true,
    reviewer: 'فريق أطباء عيادات الأمراض المعدية',
    tags: ['الكلاميديا', 'الأمراض المعدية', 'صحة المرأة'],
    excerpt: 'عدوى بكتيرية صامتة تصيب معظم النساء دون أعراض واضحة، وإهمالها قد يسبب مضاعفات خطرة.',
    body: [
      '<h2>لماذا تسمى العدوى الصامتة؟</h2>',
      '<p>تتكاثر بكتيريا الكلاميديا داخل الخلايا بصمت تام، وقد لا يلاحظ المريض أي عرض. وتقدر منظمة الصحة العالمية أن أكثر من 127 مليون شخص يصابون بها سنوياً.</p>',
      '<h2>سبع علامات تحذيرية</h2>',
      '<ol><li>إفرازات مهبلية غير طبيعية.</li><li>ألم أثناء التبول.</li><li>ألم في أسفل الحوض.</li><li>نزيف بين الدورات.</li><li>ألم أثناء العلاقة الزوجية.</li><li>رائحة كريهة للإفرازات.</li><li>ألم حول الشرج.</li></ol>',
      '<h2>المضاعفات عند عدم العلاج</h2>',
      '<p>قد يؤدي إهمال العدوى إلى التهاب الرحم والتبويض والحمل خارج الرحم، مع أثر طويل على الخصوبة. والخطر الأكبر أنها غالباً بلا أعراض تنبه المصابة.</p>',
    ],
  },
  {
    title: 'أسباب انقطاع النفس أثناء النوم: علامات تستدعي الفحص',
    slug: 'sleep-apnea-causes-warning-signs',
    category: 'sleep-breathing',
    cover: '/sgh/blog/blog-3.jpg',
    coverAlt: 'رسم توضيحي لمقطع مجرى الهواء أثناء النوم',
    publishedAt: new Date('2026-04-12T09:00:00Z'),
    featured: true,
    reviewer: 'فريق عيادة اضطرابات النوم',
    tags: ['توقف التنفس', 'الشخير', 'الاختبار'],
    excerpt:
      'تستيقظ كل يوم وأنت منهك رغم ساعات النوم الطويلة، وقد يكون السبب انقطاع متكرر للتنفس يستدعي فحص النوم.',
    body: [
      '<h2>ما هو انقطاع النفس أثناء النوم؟</h2>',
      '<p>نوبات توقف متكررة للتنفس أثناء النوم، قد تستمر كل منها من عشرين إلى ستين ثانية، مما يخفض مستوى الأكسجين ويقطع مراحل النوم العميقة.</p>',
      '<h2>علامات تستدعي الفحص</h2>',
      '<ul><li>شخير مرتفع ومتقطع.</li><li>الاستيقاظ مع شعور بالاختناق.</li><li>النعاس خلال ساعات النهار.</li><li>صعوبة التركيز والذاكرة.</li><li>انتفاخ الوجه صباحاً.</li><li>التبول الليلي المتكرر.</li><li>الصداع الصباحي المتكرر.</li></ul>',
      '<h2>الفحص والعلاج</h2>',
      '<p>يشخّص الطبيب الحالة عبر دراسة النوم المخبرية، ويعتمد العلاج على تغيير نمط الحياة وتجنب الكحوليات والتدخين، وأحياناً جهاز الضغط الإيجابي المستمر.</p>',
    ],
  },

  {
    title: 'تجربتي مع انقطاع النفس أثناء النوم',
    slug: 'my-experience-with-sleep-apnea',
    category: 'sleep-breathing',
    cover: '/sgh/blog/blog-4.jpg',
    coverAlt: 'صورة تعبيرية عن التعب المزمن',
    publishedAt: new Date('2026-04-12T09:00:00Z'),
    featured: false,
    reviewer: 'فريق عيادة اضطرابات النوم',
    tags: ['تجربة شخصية', 'توقف التنفس', 'الاختبار'],
    excerpt:
      'لسنوات كنت أستيقظ كل صباح بالتعب والصداع دون سبب واضح، حتى اكتشفت أنني أتوقف عن التنفس أثناء النوم.',
    body: [
      '<h2>سنوات من التعب غير المفسّر</h2>',
      '<p>كان الشخير وقتها أمراً اعتدتُه، ولم أتخيل أنه إنذار خطر. كنت أستيقظ كل صباح والصداع يزاحمني، فتذهب ساعات النوم هباءً من غير فائدة.</p>',
      '<blockquote>ما كنت أعرف أني أتوقف عن التنفس أثناء النوم، ولا أنه أمر يمكن علاجه.</blockquote>',
      '<h2>التحول نحو الفحص</h2>',
      '<p>بعد تنبيه من شريكي بدأت أبحث عن سبب التعب المزمن، وعلمت أن تكرار انقطاع التنفس أثناء الليل объяснет أغلب أسباب الخمول النهاري.</p>',
      '<h2>العلاج وبداية حياة أفضل</h2>',
      '<p>بعد دراسة النوم وخطة العلاج تحسن مستوى طاقتي بشكل لم أتوقعه. أنصح كل من يعاني من الشخير المستمر وضعف التركيز الصباحي بطلب الفحص مبكراً.</p>',
    ],
  },
  {
    title: 'هل الشخير طبيعي أم علامة على مرض خطير؟',
    slug: 'is-snoring-normal-or-dangerous',
    category: 'sleep-breathing',
    cover: '/sgh/blog/blog-5.jpg',
    coverAlt: 'رسم يوضح موضع السان أثناء الشخير',
    publishedAt: new Date('2026-04-12T09:00:00Z'),
    featured: false,
    reviewer: 'فريق عيادة اضطرابات النوم',
    tags: ['الشخير', 'الأنف', 'البلعوم'],
    excerpt:
      'كثيرون يعتبرون الشخير أمراً طبيعياً، لكن تكراره الليلي مع الشهور قد يكون علامة على انسداد مجرى الهواء واضطراب النوم.',
    body: [
      '<h2>متى يكون الشخير طبيعياً؟</h2>',
      '<p>الشخير الخفيف الذي يزول بتغيير وضعية النوم ليس قلقاً بحد ذاته. يصيب نحو ثلث البالغين بشكل عرضي، وغالباً سببه انسداد الأنف أثناء نزلة البرد أو الإرهاق.</p>',
      '<h2>متى يستدعي الأمر زيارة طبيب؟</h2>',
      '<ul><li>حدث بصفة منتظمة أربع ليالٍ في الأسبوع فأكثر.</li><li>الشخير مع ركلات نفس متقطعة.</li><li>الاستيقاظ مع شعور بالاختناق.</li><li>النعاس نهاراً.</li><li>إيقاظ أفراد الأسرة بسبب الصوت.</li></ul>',
      '<h2>الفحص المناسب</h2>',
      '<p>يبدأ الطبيب بتقييم مجرى الهواء والحلق والأنف، وقد يطلب دراسة نوم منزلية أو مخبرية إذا اشتبه بانقطاع النفس. وغالباً تكون الوقاية بسيطة: إنقاص الوزن، وتجنب الكحول قبل النوم، وتغيير وضعية النوم.</p>',
    ],
  },
];

/** نصوص صفحة المدونة القابلة للتحرير من لوحة المحتوى. */
const PAGE_TEXTS = [
  {
    key: 'blog.list.hero.title.ar',
    content: 'المدونة الطبية',
    type: 'title' as const,
  },
  {
    key: 'blog.list.hero.description.ar',
    content:
      'مقالات تثقيفية طبية مكتوبة ومراجعة من أطباء أخصائيين، تساعدك على فهم الأعراض واختيار العلاج المناسب.',
    type: 'description' as const,
  },
  {
    key: 'blog.list.cta.title.ar',
    content: 'هل لديك استفسار طبي بعد قراءة المقالات؟',
    type: 'title' as const,
  },
  {
    key: 'blog.list.cta.button.ar',
    content: 'احجز موعدك الآن',
    type: 'button' as const,
  },
  {
    key: 'blog.list.empty.title.ar',
    content: 'لا توجد مقالات لعرضها',
    type: 'text' as const,
  },
  {
    key: 'blog.list.empty.description.ar',
    content: 'لم تُنشر أي مقالات في المدونة الطبية بعد.',
    type: 'text' as const,
  },
  {
    key: 'blog.post.disclaimer.ar',
    content:
      'هذه المادة تثقيفية عامة ولا تغني عن استشارة الطبيب المختص. لا تبدأ أي علاج أو تغيّر جرعة دواء دون إشراف طبي.',
    type: 'text' as const,
  },
  {
    key: 'blog.post.related.title.ar',
    content: 'المزيد من المقالات',
    type: 'title' as const,
  },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL غير موجود في متغيرات البيئة');
    process.exit(1);
  }

  const connection = await mysql.createConnection(databaseUrl);
  const db = drizzle(connection, { schema, mode: 'default' });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  try {
    // 1) التصنيفات
    const categoryIds = new Map<string, number>();
    for (const category of CATEGORIES) {
      const [existing] = await db
        .select({ id: blogCategories.id })
        .from(blogCategories)
        .where(eq(blogCategories.slug, category.slug))
        .limit(1);

      if (existing) {
        categoryIds.set(category.slug, existing.id);
        continue;
      }

      const [inserted] = await db
        .insert(blogCategories)
        .values({
          name: category.name,
          nameEn: category.nameEn,
          slug: category.slug,
          description: category.description,
          color: category.color,
          sortOrder: category.sortOrder,
          isActive: 'yes',
        })
        .$returningId();
      categoryIds.set(category.slug, Number(inserted.id));
    }
    console.log(`✅ التصنيفات جاهزة: ${categoryIds.size}`);

    // 2) المقالات: ننشئ السجل أو نحدّث محتواه ليصبح السكربت قابلاً لإعادة التشغيل.
    for (const post of POSTS) {
      const categoryId = categoryIds.get(post.category) ?? null;
      const content = sanitizeBlogHtml(post.body.join(''));
      const values = {
        title: post.title,
        slug: buildBlogSlug(post.slug),
        excerpt: post.excerpt,
        content,
        coverImage: post.cover,
        coverImageAlt: post.coverAlt,
        categoryId,
        reviewerName: post.reviewer,
        reviewDate: post.publishedAt,
        tags: JSON.stringify(post.tags),
        readingTime: calculateReadingTime(content),
        status: 'published' as const,
        isActive: 'yes' as const,
        isFeatured: post.featured ? ('yes' as const) : ('no' as const),
        sortOrder: 0,
        publishedAt: post.publishedAt,
      };

      const [existing] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, values.slug))
        .limit(1);

      if (existing) {
        await db.update(blogPosts).set(values).where(eq(blogPosts.id, existing.id));
        updated += 1;
      } else {
        await db.insert(blogPosts).values(values);
        created += 1;
      }
    }

    console.log(`✅ المقالات: ${created} جديد، ${updated} محدّث، ${skipped} متجاوز`);

    // 3) نصوص صفحة المدونة القابلة للتحرير من لوحة المحتوى.
    for (const text of PAGE_TEXTS) {
      const [existing] = await db
        .select({ id: textContent.id })
        .from(textContent)
        .where(eq(textContent.key, text.key))
        .limit(1);

      const values = {
        key: text.key,
        language: 'ar',
        content: text.content,
        section: 'blog',
        type: text.type,
        status: 'published' as const,
        isActive: 'yes' as const,
        publishedAt: new Date(),
      };

      if (existing) {
        await db.update(textContent).set(values).where(eq(textContent.id, existing.id));
      } else {
        await db.insert(textContent).values(values);
      }
    }
    console.log(`✅ نصوص صفحة المدونة: ${PAGE_TEXTS.length}`);

    // 4) إعداد SEO لصفحة /blog حتى تلتقطه الصفحة عبر usePublicSEOSettings.
    const [existingSeo] = await db
      .select({ id: seoSettings.id })
      .from(seoSettings)
      .where(and(eq(seoSettings.slug, 'blog'), eq(seoSettings.language, 'ar')))
      .limit(1);

    const seoValues = {
      slug: 'blog',
      pageKey: 'blog',
      language: 'ar',
      title: 'المدونة الطبية | مقالات تثقيفية للحالات والوقاية والعلاج',
      description:
        'مقالات طبية تثقيفية مكتوبة ومراجعة من أطباء أخصائيين: الأعراض، والعلاج، والإرشادات الوقائية، والتوعية الصحية.',
      keywords: 'مدونة طبية, مقالات طبية, توعية صحية, أمراض, علاج, وقاية',
      ogTitle: 'المدونة الطبية',
      robots: 'index, follow',
      status: 'published' as const,
      isActive: 'yes' as const,
      publishedAt: new Date(),
    };

    if (existingSeo) {
      await db.update(seoSettings).set(seoValues).where(eq(seoSettings.id, existingSeo.id));
    } else {
      await db.insert(seoSettings).values(seoValues);
    }
    console.log('✅ إعداد SEO لصفحة /blog');

    const [total] = await db.select({ total: count() }).from(blogPosts);
    console.log(`\n🎉 إجمالي المقالات في المدونة: ${Number(total.total)}`);
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error('❌ فشل بذر المدونة:', error instanceof Error ? error.message : error);
  process.exit(1);
});
