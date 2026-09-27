/**
 * BlogArticleBody - جسم المقال الطبي المنسّق
 *
 * يعرض HTML بعد تعقيمه مرتين (على الخادم عند الحفظ، ثم هنا قبل الإدراج)
 * كطبقة دفاع ثالثة ضد XSS. نعتمد `isomorphic-dompurify` لتوحيد السلوك
 * بين الخادم والمتصفح.
 *
 * ملاحظة أمنية: لا نسمح بـ <script> أو <iframe> أو معالجات الأحداث إطلاقاً؛
 * قائمة الوسوم المسموحة معرّفة داخل blogContentService.
 */

import { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

type BlogArticleBodyProps = {
  html: string;
  className?: string;
};

/** روابط مقالات المدونة الداخلية تبقى داخل التبويب، والخارجية تُعزَّز بـ rel. */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  const element = node as Element;
  if (element.tagName !== 'A') {
    return;
  }
  const href = element.getAttribute('href') ?? '';
  if (/^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
    element.setAttribute('target', '_blank');
    element.setAttribute('rel', 'noopener noreferrer nofollow');
  } else {
    element.removeAttribute('target');
  }
});

/** أنماط القراءة: خط واضح، مسافات مريحة، وتنسيق الجداول الطبية. */
const ARTICLE_PROSE_CLASSES = [
  'text-[15px] leading-[2] text-[#333333]',
  '[&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:text-[26px] [&_h1]:font-bold [&_h1]:text-[#212529]',
  '[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:text-[#007242]',
  '[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-[#212529]',
  '[&_p]:mb-4',
  '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pe-6',
  '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pe-6',
  '[&_li]:leading-[2]',
  '[&_a]:text-[#1ca8e5] [&_a]:underline [&_a]:transition-colors hover:[&_a]:text-[#0f6d95]',
  '[&_strong]:font-bold [&_strong]:text-[#212529]',
  '[&_blockquote]:my-5 [&_blockquote]:border-s-4 [&_blockquote]:border-[#1ca8e5]',
  '[&_blockquote]:bg-[#f8f8f8] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-[#565656]',
  '[&_blockquote]:rounded-e-lg',
  '[&_table]:mb-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
  '[&_th]:border [&_th]:border-[#e6e6e6] [&_th]:bg-[#f8f8f8] [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold',
  '[&_td]:border [&_td]:border-[#e6e6e6] [&_td]:px-3 [&_td]:py-2',
  '[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg',
  '[&_hr]:my-6 [&_hr]:border-t [&_hr]:border-[#e6e6e6]',
].join(' ');

export function BlogArticleBody({ html, className = '' }: BlogArticleBodyProps) {
  const safeHtml = useMemo(() => DOMPurify.sanitize(html ?? ''), [html]);

  if (!safeHtml) {
    return null;
  }

  return (
    <div
      className={`${ARTICLE_PROSE_CLASSES} ${className}`}
      dir="rtl"
      // المحتوى مُعقَّم أعلاه بسائمة بيضاء صارمة قبل الإدراج.
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

export default BlogArticleBody;
