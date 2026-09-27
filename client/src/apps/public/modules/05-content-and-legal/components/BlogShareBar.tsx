/**
 * BlogShareBar
 * شريط مشاركة المقال
 *
 * يتيح مشاركة المقال على القنوات المستخدمة محلياً (واتساب، فيسبوك، إكس)
 * والنسخ المباشر للرابط، مع قائمة XSS-آمنة: نمرّر القيم عبر encodeURIComponent
 * ونستخدم Clipboard API مع بديل نصي للبيئات القديمة.
 */

import { useCallback, useState } from 'react';
import { Check, Globe, Link2, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';

type BlogShareBarProps = {
  title: string;
  url: string;
  className?: string;
};

const SHARE_BUTTON_CLASS =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7dee3] bg-white text-[#565656] transition-all duration-200 hover:border-[#1ca8e5] hover:bg-[#1ca8e5] hover:text-white';

export function BlogShareBar({ title, url, className = '' }: BlogShareBarProps) {
  const [copied, setCopied] = useState(false);

  const absoluteUrl = useCallback(() => {
    if (typeof window === 'undefined') {
      return url;
    }
    return new URL(url, window.location.origin).toString();
  }, [url]);

  const copyLink = useCallback(async () => {
    const link = absoluteUrl();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // بديل للمتصفحات القديمة أو السياقات غير الآمنة.
        const field = document.createElement('textarea');
        field.value = link;
        field.setAttribute('readonly', '');
        field.style.position = 'absolute';
        field.style.left = '-9999px';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        document.body.removeChild(field);
      }
      setCopied(true);
      toast.success('تم نسخ رابط المقال');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('تعذّر نسخ الرابط، يمكنك نسخه يدوياً من شريط العنوان');
    }
  }, [absoluteUrl]);

  const targets = [
    {
      key: 'whatsapp',
      label: 'مشاركة عبر واتساب',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${absoluteUrl()}`)}`,
    },
    {
      key: 'facebook',
      label: 'مشاركة عبر فيسبوك',
      icon: Globe,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl())}`,
    },
    {
      key: 'x',
      label: 'مشاركة عبر إكس',
      icon: Share2,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(absoluteUrl())}`,
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#212529]">
        <Share2 className="h-4 w-4 text-[#1ca8e5]" />
        شارك المقال
      </span>

      {targets.map((target) => (
        <a
          key={target.key}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={target.label}
          title={target.label}
          className={SHARE_BUTTON_CLASS}
        >
          <target.icon className="h-4 w-4" />
        </a>
      ))}

      <button
        type="button"
        onClick={copyLink}
        aria-label="نسخ رابط المقال"
        title="نسخ الرابط"
        className={SHARE_BUTTON_CLASS}
      >
        {copied ? <Check className="h-4 w-4 text-[#2eb34b]" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default BlogShareBar;
