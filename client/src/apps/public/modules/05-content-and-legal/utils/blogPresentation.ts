/**
 * Blog Presentation Utilities
 * أدوات عرض محتوى المدونة في الواجهة العامة
 *
 * تعزل كل تحويلات العرض (التاريخ العربي، الاقتطاع، وقت القراءة، التصنيف)
 * في طبقة نقية قابلة للاختبار، وتستخدمها صفحتا القائمة والمقال وقسم
 * المدونة بالصفحة الرئيسية، بدل تكرار المنطق في كل مكوّن.
 */

/** أسماء الأشهر بالlevantine المستخدمة في الموقع المرجعي (نيسـان، آذار...). */
const LEVANTINE_MONTHS = [
  'كانون الثاني',
  'شباط',
  'آذار',
  'نيسان',
  'أيار',
  'حزيران',
  'تموز',
  'آب',
  'أيلول',
  'تشرين الأول',
  'تشرين الثاني',
  'كانون الأول',
] as const;

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

/**
 * ينسّق تاريخ المقال بالتقويم الميلادي بصيغة عربية مفهومة.
 * نستخدم الترقيم الشرقي (١٢٣) كما في الموقع المرجعي.
 */
export function formatBlogDate(value: Date | string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ar-EG', {
    ...LONG_DATE_FORMAT,
    numberingSystem: 'latn',
  }).format(date);
}

/** اسم الشهر بالتقويم الشرقي (غير مستخدم في العرض الافتراضي لكن مفيد للتصنيفات). */
export function formatMonthName(monthIndex: number, locale: 'ar' | 'en' = 'ar'): string {
  const index = Math.min(11, Math.max(0, monthIndex));
  if (locale === 'en') {
    return new Date(2024, index, 1).toLocaleString('en-US', { month: 'long' });
  }
  return ARABIC_MONTHS[index];
}

/** أسماء الأشهر الشامية لاختيارات التاريخ. */
export const LEVANTINE_MONTH_NAMES = LEVANTINE_MONTHS;

/** يزيل وسوم HTML من نص غير موثوق ليُشتق منه مقتطف نصي آمن. */
export function stripHtml(html: string): string {
  return html
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** يبني مقتطفاً من نص عادي، دون قطع الكلمة الأخيرة. */
export function clampExcerpt(text: string | null | undefined, maxLength = 160): string {
  const plain = stripHtml(text ?? '');
  if (plain.length <= maxLength) {
    return plain;
  }
  const clipped = plain.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped).trim()}…`;
}

/** صيغة «X دقائق قراءة» أو «أقل من دقيقة». */
export function formatReadingTime(minutes: number | null | undefined): string {
  const value = Math.max(0, Math.round(minutes ?? 0));
  if (value < 1) {
    return 'أقل من دقيقة';
  }
  return `${value} ${value === 1 ? 'دقيقة' : 'دقائق'} قراءة`;
}

/** يحوّل مصفوفة وسوم مخزّنة كـ JSON إلى قائمة نظيفة. */
export function parseBlogTags(value: string | null | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }
  const raw = value.trim();

  // إن بدأت القيمة كـ JSON تالف نعتبرها تالفة تماماً بدل معاملتها كنص عادي،
  // حتى لا نعرض وسوماً مشوّهة للزائر.
  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((tag) => String(tag).trim()).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  // صيغة احتياطية قديمة: وسوم مفصولة بفواصل.
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/** يبني رابط المقال العام مع حماية من slug غير مرخّص. */
export function buildBlogPostHref(slug: string | null | undefined): string {
  const clean = (slug ?? '').trim().replace(/^\/+/, '');
  return clean ? `/blog/${encodeURIComponent(clean)}` : '/blog';
}
