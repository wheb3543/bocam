import { useAuth } from '@/_core/hooks/useAuth';
import { usePublicPageBySlug, usePublicPageContentByPageId } from '@/hooks/usePublicContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * الصفحة الرئيسية - تستخدم نظام إدارة المحتوى
 * Home Page - Uses Content Management System
 */
export default function Home() {
  useAuth();
  const { language } = useLanguage();

  // جلب بيانات الصفحة الرئيسية
  const { data: page, isLoading: pageLoading } = usePublicPageBySlug('home', language);

  // جلب محتوى الصفحة الرئيسية
  const { data: pageContent, isLoading: contentLoading } = usePublicPageContentByPageId(
    page?.id || 0,
    language
  );

  if (pageLoading || contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>الصفحة الرئيسية غير موجودة</p>
      </div>
    );
  }

  // استخراج المحتوى النصي حسب القسم والنوع
  const getTextContent = (section: string, type: string, key?: string) => {
    if (!pageContent?.textContents) {
      return '';
    }
    return (
      pageContent.textContents.find(
        (item) => item.section === section && item.type === type && (!key || item.key === key)
      )?.content || ''
    );
  };

  // استخراج الصور حسب القسم
  const _getImage = (section: string, key?: string) => {
    if (!pageContent?.images) {
      return null;
    }
    return pageContent.images.find(
      (item) => item.section === section && (!key || item.key === key)
    );
  };

  const title = language === 'ar' ? page.titleAr : page.titleEn;
  const heroTitle = getTextContent('hero', 'title');
  const heroSubtitle = getTextContent('hero', 'subtitle');
  const heroDescription = getTextContent('hero', 'description');
  const heroButtonText = getTextContent('hero', 'button');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {heroTitle || title}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">{heroSubtitle}</p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {heroDescription}
          </p>
          <Button size="lg" className="text-lg px-8 py-6">
            {heroButtonText || 'احجز موعدك الآن'}
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      {getTextContent('stats', 'text') && (
        <section className="py-16 px-4 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            {['doctors', 'specialties', 'patients', 'service'].map((stat) => (
              <div key={stat} className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {getTextContent('stats', 'text', `stats.${stat}.label.${language}`)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services Section */}
      {getTextContent('services', 'title') && (
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              {getTextContent('services', 'title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {getTextContent('services', 'title', 'services.doctors.title')}
                </h3>
                <Button variant="outline" className="w-full">
                  {getTextContent('services', 'button', 'services.explore.button')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {getTextContent('about', 'title') && (
        <section className="py-16 px-4 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              {getTextContent('about', 'title')}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              {getTextContent('about', 'title', 'about.features.global.title')}
            </p>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {getTextContent('cta', 'title') && (
        <section className="py-16 px-4 bg-blue-600 dark:bg-blue-700">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-white">{getTextContent('cta', 'title')}</h2>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              {getTextContent('cta', 'button', 'cta.book.button')}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
