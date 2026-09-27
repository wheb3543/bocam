/**
 * Blog HTML Sanitizer Service
 * خدمة تعقيم محتوى مقالات المدونة الطبية
 *
 * محتوى المقال يُحرَّر كـ HTML منسّق (مطابق لمحرّر Drupal المرجعي الذي يستورد
 * مستندات Google Docs). لذلك نطبّق دفاعاً متعدد الطبقات:
 *  1) على الخادم عند الحفظ (الكتابة) — المصدر الموثوق.
 *  2) على العميل قبل العرض — طبقة ثانٍة تحمي من أي محتوى قديم أو مستورد.
 *
 * نعتمد `isomorphic-dompurify` لأنه يعمل في بيئة Node (jsdom) وداخل المتصفح
 * بالسلوك نفسه، مما يضمن تطابق نتيجة التعقيم على الطرفين.
 */

import DOMPurify from 'isomorphic-dompurify';
import { and, eq, ne } from 'drizzle-orm';
import { blogPosts } from '../../../../../drizzle/schema';
import { ensureDatabaseAvailable } from '../../../../_core/databaseGuard';

type DbClient = Awaited<ReturnType<typeof ensureDatabaseAvailable>>;

/** الوسوم المسموح بها داخل جسم المقال الطبي. */
const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'hr',
  'div',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'mark',
  'small',
  'sub',
  'sup',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
  'figure',
  'figcaption',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'caption',
  'colgroup',
  'col',
];

/** السمات المسموح بها؛ `class` مقصود لتحتفظ بتنسيقات Google Docs المستوردة. */
const ALLOWED_ATTR = [
  'href',
  'title',
  'target',
  'rel',
  'src',
  'alt',
  'width',
  'height',
  'loading',
  'colspan',
  'rowspan',
  'scope',
  'align',
  'dir',
  'lang',
  'class',
  'id',
  'style',
];

/**
 * يحصّن الروابط والصور بعد التعقيم: أي رابط يفتح نافذة جديدة يحصل على
 * `rel` مضادة للتصيّد، وكل صورة تُحمَّل بشكل كسول (lazy).
 *
 * ملاحظة: لا تدعم `DOMPurify.sanitize()` تمرير الـ hooks داخل إعدادات
 * الاستدعاء، بل يجب تسجيلها مرة واحدة عبر `addHook` على مستوى الوحدة.
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  const element = node as Element;
  if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
    element.setAttribute('rel', 'noopener noreferrer nofollow');
  }
  if (element.tagName === 'IMG') {
    element.setAttribute('loading', 'lazy');
  }
});

/**
 * يعقّم HTML المقال ويحوّل أي قيمة غير نصية إلى نص فارغ آمن.
 * يُستدعى على الخادم عند الإنشاء والتحديث، وعلى العميل قبل العرض.
 */
export function sanitizeBlogHtml(input: unknown): string {
  if (typeof input !== 'string' || input.trim().length === 0) {
    return '';
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // نعتمد نمط URI الافتراضي في DOMPurify لمنع javascript: و data: في href/src.
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: [
      'style',
      'script',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'link',
      'meta',
      'base',
    ],
    FORBID_ATTR: ['srcset', 'formaction', 'xlink:href'],
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  } as Parameters<typeof DOMPurify.sanitize>[1]);
}

/**
 * يتحقق أن جسم المقال المنشور يحتوي محتوى فعلياً بعد التعقيم.
 * يمنع نشر قشرة فارغة أو محتوى تالف بالكامل.
 */
export function hasMeaningfulBlogContent(input: unknown): boolean {
  const sanitized = sanitizeBlogHtml(input);
  if (!sanitized) {
    return false;
  }
  // نتجاهل المسافات ووسوم التنسيق الفارغة عند احتساب الطول.
  return (
    sanitized
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim().length >= 20
  );
}

/**
 * يحسب وقت القراءة بالدقائق اعتماداً على 200 كلمة/دقيقة.
 * الوسم تُزال قبل القياس حتى لا تُحتسب كلمات التنسيق.
 */
export function calculateReadingTime(input: unknown): number {
  const sanitized = sanitizeBlogHtml(input);
  if (!sanitized) {
    return 0;
  }
  const plainText = sanitized
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}

/**
 * يبني مقتطفاً نصياً تلقائياً من جسم المقال عند عدم توفير مقتطف يدوي.
 * يُحافظ على أول 220 حرف مع عدم قطع الكلمة الأخيرة.
 */
export function buildBlogExcerpt(input: unknown, maxLength = 220): string {
  const sanitized = sanitizeBlogHtml(input);
  if (!sanitized) {
    return '';
  }

  const plainText = sanitized
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
}

/**
 * نطاقات المحارف المسموحة في الرابط.
 * نستخدم نطاقات صريحة بدل `\p{L}` مع الراية `u` لأن هدف TypeScript في
 * المشروع هو ES5 افتراضياً، والراية `u` غير مدعومة فيه.
 */
const SLUG_SAFE_CHARS =
  /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9]+/g;

/** يحوّل نصاً حراً إلى صيغة رابط: حروف وأرقام وشرطات فقط. */
export function slugifyText(input: string): string {
  return input
    .replace(SLUG_SAFE_CHARS, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * يوحّد الهمزات والتشكيل في النص العربي قبل توليد الرابط، حتى لا تنتج
 * روابط مختلفة لنفس العنوان المكتوب بأشكال همزة أو تشكيل مختلفة.
 */
export function normalizeArabicForSlug(input: string): string {
  return input
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(SLUG_SAFE_CHARS, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * يولّد رابطاً مقروءاً من عنوان المقال.
 * نبقي الحروف العربية (كما في الموقع المرجعي الذي يشفّر العناوين العربية في
 * الرابط) ونتجاهل التطويل والتشكيل، فتصبح الروابط متسقة وقابلة للمشاركة.
 */
export function buildBlogSlug(title: string): string {
  return normalizeArabicForSlug(title)
    .slice(0, 120)
    .replace(/^-+|-+$/g, '');
}

/**
 * يضمن أن الرابط فريد بإلحاق لاحقة رقمية تصاعدية عند وجود تكرار.
 * نتجاهل السجلات المحذوفة ناعماً لأنها محجوزة للتراجع، ونتجاهل السجل
 * الحالي عند التعديل على مقال قائم.
 */
export async function resolveUniqueBlogSlug(
  db: DbClient,
  title: string,
  options: { excludeId?: number } = {}
): Promise<string> {
  const baseSlug = buildBlogSlug(title) || 'article';

  async function isTaken(candidate: string): Promise<boolean> {
    const conditions = [eq(blogPosts.slug, candidate)];
    if (options.excludeId !== undefined) {
      conditions.push(ne(blogPosts.id, options.excludeId));
    }

    const [existing] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(...conditions))
      .limit(1);

    return Boolean(existing);
  }

  if (!(await isTaken(baseSlug))) {
    return baseSlug;
  }

  for (let suffix = 2; suffix <= 100; suffix += 1) {
    const candidate = `${baseSlug}-${suffix}`;
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  // شبكة أمان: معرّف زمني يضمن عدم تجاوز الحد أبداً.
  return `${baseSlug}-${Date.now().toString(36)}`;
}
