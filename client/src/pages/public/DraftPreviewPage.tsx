import { AlertTriangle, Clock3, Eye } from 'lucide-react';
import { useParams } from 'wouter';
import { useDraftPreview } from '@/hooks/usePublicContent';
import SEO from '@/components/SEO';
import { COMPANY_ARABIC_NAME, COMPANY_ENGLISH_NAME } from '@/const';

type PreviewSection = {
  id: number;
  name: string;
  type: string;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
};

/**
 * لقطة صفحة مسودة لا تعتمد على جلسة تسجيل الدخول. الوصول متاح حصراً عبر رمز
 * عشوائي قصير العمر صادر من لوحة CMS، مع منع الفهرسة وإحالة رابط الرمز للوسائط.
 */
export default function DraftPreviewPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading } = useDraftPreview(token || '');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6" dir="rtl">
        <div className="max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="text-xl font-bold">رابط المعاينة غير متاح</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            ربما انتهت صلاحية الرابط، أو أُلغي من إدارة المحتوى، أو أن الصفحة لم تعد متاحة.
          </p>
        </div>
      </div>
    );
  }

  const isArabic = data.language === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';
  const title = isArabic ? data.page.titleAr : data.page.titleEn;
  const metaDescription = isArabic ? data.page.metaDescriptionAr : data.page.metaDescriptionEn;
  const textFor = (sectionName: string, type: string, key?: string) =>
    data.textContents.find(
      (item) =>
        (item.sectionName === sectionName || item.section === sectionName) &&
        item.type === type &&
        (!key || item.key === key)
    )?.content || '';
  const imageFor = (sectionName: string, key?: string) =>
    data.images.find(
      (item) =>
        (item.sectionName === sectionName || item.section === sectionName) &&
        (!key || item.key === key)
    );

  const renderSection = (section: PreviewSection) => {
    const sectionTitle =
      textFor(section.name, 'title') || (isArabic ? section.titleAr : section.titleEn);
    const subtitle =
      textFor(section.name, 'subtitle') || (isArabic ? section.subtitleAr : section.subtitleEn);
    const description = textFor(section.name, 'description') || textFor(section.name, 'text');
    const image = imageFor(section.name);
    const buttons = data.sectionButtons.filter((button) => button.sectionId === section.id);

    return (
      <section
        key={section.id}
        className={
          section.type === 'hero'
            ? 'relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 px-5 py-20 text-center'
            : 'border-b bg-background px-5 py-14'
        }
      >
        {image && section.type === 'hero' && (
          <img
            src={image.url}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
        )}
        <div className="relative mx-auto max-w-5xl">
          {sectionTitle && (
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{sectionTitle}</h2>
          )}
          {subtitle && (
            <p className="mx-auto mt-5 max-w-3xl text-lg text-muted-foreground">{subtitle}</p>
          )}
          {description && (
            <p className="mx-auto mt-4 max-w-3xl whitespace-pre-line leading-8 text-foreground/80">
              {description}
            </p>
          )}
          {image && section.type !== 'hero' && (
            <img
              src={image.url}
              alt={isArabic ? image.altAr || '' : image.altEn || ''}
              referrerPolicy="no-referrer"
              className="mx-auto mt-8 max-h-[440px] rounded-xl object-cover shadow-md"
            />
          )}
          {buttons.length > 0 && (
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {buttons.map((button) => (
                <span
                  key={button.id}
                  className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
                >
                  {isArabic ? button.textAr : button.textEn}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground" dir={direction}>
      <SEO
        title={`${title} — معاينة مسودة`}
        description={metaDescription || 'معاينة مسودة خاصة'}
        robots="noindex,nofollow,noarchive"
      />
      <div className="sticky top-0 z-20 border-b border-amber-300 bg-amber-50/95 px-4 py-3 text-amber-950 shadow-sm backdrop-blur dark:border-amber-900 dark:bg-amber-950/90 dark:text-amber-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 font-semibold">
            <Eye className="h-4 w-4" /> هذه معاينة خاصة لمسودة غير منشورة
          </span>
          <span className="flex items-center gap-2 text-xs">
            <Clock3 className="h-4 w-4" /> ينتهي هذا الرابط قريباً
          </span>
        </div>
      </div>
      <header className="border-b bg-background px-5 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium text-primary">
            {isArabic ? COMPANY_ARABIC_NAME : COMPANY_ENGLISH_NAME || 'BOCAM'}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        </div>
      </header>
      {data.sections.length > 0 ? (
        data.sections.map(renderSection)
      ) : (
        <section className="px-5 py-20 text-center">
          <h2 className="text-3xl font-bold">{title}</h2>
          {metaDescription && (
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{metaDescription}</p>
          )}
        </section>
      )}
    </main>
  );
}
