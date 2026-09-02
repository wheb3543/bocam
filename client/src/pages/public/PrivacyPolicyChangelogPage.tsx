import { useEffect } from 'react';
import { CheckCircle2, FileText, History, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/HeroSection';
import AnimatedCard from '@/components/AnimatedCard';
import ScrollReveal from '@/components/ScrollReveal';
import { Button } from '@/components/ui/button';
import { usePublicPageContent } from '@/hooks/usePublicContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { COMPANY_ARABIC_NAME } from '@/const';

type PublicPageTextContent = {
  key: string;
  content: string;
};

type ChangelogCopy = {
  language: 'ar' | 'en';
  t: (key: string, fallback: string) => string;
};

function useChangelogCopy(): ChangelogCopy {
  const { language } = useLanguage();
  const pageContentQuery = usePublicPageContent('privacy-changelog', language) as {
    data?: { textContents: PublicPageTextContent[] };
  };

  return {
    language,
    t: (key, fallback) =>
      pageContentQuery.data?.textContents.find(
        (item) => item.key === `privacy.changelog.${key}.${language}`
      )?.content || fallback,
  };
}

export default function PrivacyPolicyChangelogPage() {
  const copy = useChangelogCopy();
  const { t } = copy;
  const browserTitle = t(
    'meta.browserTitle',
    `سجل تغييرات سياسة الخصوصية | ${COMPANY_ARABIC_NAME}`
  );

  useEffect(() => {
    document.title = browserTitle;
    window.scrollTo(0, 0);
  }, [browserTitle]);

  return (
    <PageLayout
      title={t('meta.pageTitle', 'سجل تغييرات سياسة الخصوصية')}
      description={t(
        'meta.description',
        `اطلع على الإصدارات والتحديثات المنشورة لسياسة خصوصية ${COMPANY_ARABIC_NAME}.`
      )}
      keywords={t('meta.keywords', 'سجل الخصوصية, تحديثات السياسة, حماية البيانات')}
    >
      <main dir={copy.language === 'ar' ? 'rtl' : 'ltr'}>
        <HeroSection
          title={t('title', 'سجل تغييرات سياسة الخصوصية')}
          subtitle={t('current.badge', 'الإصدار الساري')}
          description={t(
            'hero.description',
            'نوضح هنا الإصدارات المنشورة والتحديثات الجوهرية على سياسة الخصوصية حتى تتمكن من مراجعة ما تغيّر بوضوح.'
          )}
          badge={{ text: t('current.version', 'الإصدار 2026-03-01'), icon: History }}
          backgroundGradient="from-green-800 to-green-600"
        />

        <section className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <ScrollReveal>
            <AnimatedCard
              className="border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
              hoverEffect={false}
            >
              <p className="text-sm leading-7 text-gray-700 sm:text-base">
                {t(
                  'intro',
                  'يوضح هذا السجل النسخ المنشورة من سياسة الخصوصية. نعرض النسخة السارية والتحديثات ذات الأثر على طريقة جمع البيانات أو استخدامها أو خياراتك المتاحة.'
                )}
              </p>
            </AnimatedCard>
          </ScrollReveal>

          <section className="mt-7" aria-labelledby="current-version-heading">
            <div className="mb-4 flex items-center gap-2 text-green-800">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <h2 id="current-version-heading" className="text-xl font-bold sm:text-2xl">
                {t('current.badge', 'الإصدار الساري')}
              </h2>
            </div>
            <AnimatedCard
              className="border border-green-200 bg-green-50 p-5 sm:p-6"
              delay={0.1}
              hoverEffect={false}
            >
              <div className="flex flex-col gap-1 border-b border-green-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-900">
                    {t('current.version', 'الإصدار 2026-03-01')}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-green-800">
                    {t('current.title', 'تحسين الشفافية وخيارات التحكم')}
                  </p>
                </div>
                <span className="text-sm text-green-800">
                  {t('current.date', 'نُشر في مارس 2026')}
                </span>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
                {['current.change1', 'current.change2', 'current.change3'].map((key, index) => (
                  <li key={key} className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-1 h-4 w-4 shrink-0 text-green-700"
                      aria-hidden="true"
                    />
                    <span>
                      {t(
                        key,
                        [
                          'إتاحة شريط موافقة مخصص على سياسة الخصوصية للمستخدمين الجدد.',
                          'إضافة خيار إدارة الخصوصية لمراجعة قرار الموافقة أو تحديثه لاحقاً.',
                          'تنظيم عرض معلومات ملفات الارتباط والتقنيات الرقمية ضمن سياسة الخصوصية.',
                        ][index]
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </AnimatedCard>
          </section>

          <section className="mt-8" aria-labelledby="previous-versions-heading">
            <div className="mb-4 flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5" aria-hidden="true" />
              <h2 id="previous-versions-heading" className="text-xl font-bold sm:text-2xl">
                {t('previous.heading', 'الإصدارات السابقة')}
              </h2>
            </div>
            <AnimatedCard
              className="border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700"
              delay={0.15}
              hoverEffect={false}
            >
              {t(
                'previous.empty',
                'لا توجد إصدارات مؤرشفة منشورة للعرض حالياً. ستظهر الإصدارات السابقة هنا عند إضافتها واعتمادها.'
              )}
            </AnimatedCard>
          </section>

          <section className="mt-8" aria-labelledby="changelog-method-heading">
            <AnimatedCard
              className="border border-blue-100 bg-blue-50 p-5 sm:p-6"
              delay={0.2}
              hoverEffect={false}
            >
              <h2 id="changelog-method-heading" className="text-lg font-bold text-blue-900">
                {t('notice.heading', 'كيف نُحدّث السجل؟')}
              </h2>
              <p className="mt-2 text-sm leading-7 text-blue-900/80">
                {t(
                  'notice.body',
                  'عند نشر تعديل جوهري، نضيف إصداراً جديداً ونوضح أثر التحديث في هذا السجل مع إبقاء النسخ المعتمدة السابقة متاحة للمراجعة.'
                )}
              </p>
            </AnimatedCard>
          </section>

          <div className="mt-8 flex justify-center">
            <Button asChild className="bg-green-700 hover:bg-green-800">
              <Link href="/privacy-policy">{t('backPolicy', 'العودة إلى سياسة الخصوصية')}</Link>
            </Button>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
