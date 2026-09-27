/**
 * BlogContentEditor - محرر جسم المقال المنسّق
 *
 * عزل مقصود في مكوّن مستقل لتسهيل استبداله لاحقاً بمحرر WYSIWYG كامل
 * (مثل Tiptap) دون المساس ببقية نموذج المقال.
 *
 * الحل الحالي بلا اعتمادات جديدة: Textarea لمحرير HTML + شريط وسوم يُدرج
 * الوسوم الطبية الشائعة + معاينة حيّة بجانبه.
 *
 * ملاحظة أمنية: المعاينة تعرض النص بعد تعقيمه عبر DOMPurify، تماماً كما يفعل
 * الخادم، حتى لا يرى المحرر شيئاً يخالف ما سيُنشر.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import {
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Underline,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/** وصف إدراج كل وسم: أيقونته ونصّه بالإنجليزية ووسومه الافتتاحية/الختامية. */
type TagSpec = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  wrap: [string, string];
};

const TAG_SPECS: TagSpec[] = [
  { key: 'h2', label: 'عنوان فرعي', icon: Heading2, wrap: ['<h2>', '</h2>'] },
  { key: 'h3', label: 'عنوان مصغّر', icon: Heading3, wrap: ['<h3>', '</h3>'] },
  { key: 'p', label: 'فقرة', icon: Quote, wrap: ['<p>', '</p>'] },
  { key: 'strong', label: 'عريض', icon: Bold, wrap: ['<strong>', '</strong>'] },
  { key: 'em', label: 'مائل', icon: Italic, wrap: ['<em>', '</em>'] },
  { key: 'u', label: 'تسطير', icon: Underline, wrap: ['<u>', '</u>'] },
  { key: 'ul', label: 'قائمة نقطية', icon: List, wrap: ['<ul>\n  <li>', '</li>\n</ul>'] },
  {
    key: 'ol',
    label: 'قائمة مرقمة',
    icon: ListOrdered,
    wrap: ['<ol>\n  <li>', '</li>\n</ol>'],
  },
  { key: 'a', label: 'رابط', icon: Link2, wrap: ['<a href="https://">', '</a>'] },
  { key: 'code', label: 'كود', icon: Code, wrap: ['<code>', '</code>'] },
  {
    key: 'table',
    label: 'جدول طبي',
    icon: TableIcon,
    wrap: [
      '<table>\n  <thead>\n    <tr><th scope="col">العلامة</th><th scope="col">التفسير</th></tr>\n  </thead>\n  <tbody>\n    <tr><td></td><td></td></tr>\n  </tbody>\n</table>',
      '',
    ],
  },
];

type BlogContentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  rows?: number;
  label?: string;
};

/** يحصي أحرف النص دون وسوم HTML. */
function countTextChars(html: string): number {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}

/**
 * يحيط النص المحدد بوسم، أو يُدرج الوسم عند نهاية المحتوى إذا لم يوجد تحديد.
 * دالة نقية مستقلة عن React لتسهيل الاختبار.
 */
export function wrapWithTag(
  html: string,
  wrap: readonly [string, string],
  selection: { start: number; end: number }
): { html: string; caret: number } {
  const [open, close] = wrap;
  const start = Math.max(0, Math.min(selection.start, html.length));
  const end = Math.max(start, Math.min(selection.end, html.length));
  const selected = html.slice(start, end);

  return {
    html: `${html.slice(0, start)}${open}${selected}${close}${html.slice(end)}`,
    caret: start + open.length + selected.length + close.length,
  };
}

export function BlogContentEditor({
  value,
  onChange,
  disabled = false,
  className,
  rows = 20,
  label = 'محتوى المقال (HTML)',
}: BlogContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  /** يُدرج وسمًا حول النص المحدد، أو في نهاية الموضع الحالي. */
  const insertTag = useCallback(
    (spec: TagSpec) => {
      const field = textareaRef.current;
      if (!field) {
        return;
      }
      const { html, caret } = wrapWithTag(value, spec.wrap, {
        start: field.selectionStart ?? value.length,
        end: field.selectionEnd ?? value.length,
      });

      onChange(html);

      // نستعيد المؤشر داخل الوسم المُدرج لتسهيل الكتابة المستمرة.
      requestAnimationFrame(() => {
        field.focus();
        field.setSelectionRange(caret, caret);
      });
    },
    [onChange, value]
  );

  // المعاينة تمر بنفس تعقيم الخادم حتى تطابق ما سيُنشر فعلياً.
  const previewHtml = useMemo(() => DOMPurify.sanitize(value ?? ''), [value]);
  const charCount = useMemo(() => countTextChars(value), [value]);

  return (
    <div className={cn('grid gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor="blog-content">{label}</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {charCount.toLocaleString('ar-EG')} حرف · وقت القراءة يُحسب تلقائياً
          </span>
          <Button
            type="button"
            size="sm"
            variant={showPreview ? 'default' : 'outline'}
            onClick={() => setShowPreview((prev) => !prev)}
            disabled={disabled}
          >
            <Eye className="me-1.5 h-4 w-4" />
            {showPreview ? 'إخفاء المعاينة' : 'معاينة حيّة'}
          </Button>
        </div>
      </div>

      {/* شريط الوسوم الطبية */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1.5">
        {TAG_SPECS.map((spec) => {
          const Icon = spec.icon;
          return (
            <Button
              key={spec.key}
              type="button"
              size="sm"
              variant="ghost"
              title={spec.label}
              aria-label={`إدراج ${spec.label}`}
              disabled={disabled}
              onClick={() => insertTag(spec)}
              className="h-8 w-8 p-0"
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
        <span className="ms-auto px-2 text-[0.7rem] text-muted-foreground">
          حدّد النص ثم اضغط الوسم لإحاطته
        </span>
      </div>

      <div className={cn('grid gap-3', showPreview && 'lg:grid-cols-2')}>
        <Textarea
          id="blog-content"
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={rows}
          dir="ltr"
          className="font-mono text-[13px] leading-relaxed"
          placeholder={'<h2>عنوان فرعي</h2>\n<p>فقرة تشرح الأعراض والعلاج...</p>'}
        />

        {showPreview && (
          <div
            className="max-h-[520px] overflow-y-auto rounded-lg border border-border bg-white p-4 text-[15px] leading-[1.9] text-[#333333] [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#007242] [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_li]:my-1 [&_p]:mb-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[#e6e6e6] [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[#e6e6e6] [&_th]:bg-[#f8f8f8] [&_th]:px-2 [&_th]:py-1"
            dir="rtl"
          >
            {previewHtml ? (
              // المحتوى معقَّم مسبقاً بنفس قائمة الوسوم المسموحة في الخادم.
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p className="text-sm text-muted-foreground">اكتب المحتوى لعرضه هنا قبل النشر.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogContentEditor;
