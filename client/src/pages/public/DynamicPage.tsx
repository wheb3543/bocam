import { useAuth } from '@/_core/hooks/useAuth';
import {
  usePublicPageBySlug,
  usePublicPageContentByPageId,
  usePublicSectionsByPageId,
  usePublicSEOSettings,
} from '@/hooks/usePublicContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight, Star, Check, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useParams } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';

interface SectionButton {
  id: number;
  textAr: string;
  textEn: string;
  link: string;
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
}

interface Section {
  id: number;
  name: string;
  type: string;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
}

/**
 * صفحة ديناميكية للصفحات العامة
 * Dynamic Page for Public Pages
 */
export default function DynamicPage() {
  useAuth();
  const { language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();

  // جلب بيانات الصفحة
  const { data: page, isLoading: pageLoading } = usePublicPageBySlug(slug || '', language);
  const { data: seoSettings = [] } = usePublicSEOSettings({ slug: slug || '', language });

  // جلب محتوى الصفحة
  const { data: pageContent, isLoading: contentLoading } = usePublicPageContentByPageId(
    page?.id || 0,
    language
  );

  // جلب أقسام الصفحة
  const { data: sections } = usePublicSectionsByPageId(page?.id || 0, 'yes');

  if (pageLoading || contentLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
        <Footer />
      </>
    );
  }

  if (!page) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>الصفحة غير موجودة</p>
        </div>
        <Footer />
      </>
    );
  }

  const title = language === 'ar' ? page.titleAr : page.titleEn;
  const metaTitle = language === 'ar' ? page.metaTitleAr : page.metaTitleEn;
  const metaDescription = language === 'ar' ? page.metaDescriptionAr : page.metaDescriptionEn;
  const pageSEO = seoSettings[0];
  const seoProps = {
    title: pageSEO?.title || metaTitle || title,
    description: pageSEO?.description || metaDescription || '',
    image: pageSEO?.ogImage || undefined,
    canonicalUrl: pageSEO?.canonicalUrl || undefined,
    keywords: pageSEO?.keywords || undefined,
    ogTitle: pageSEO?.ogTitle || undefined,
    ogDescription: pageSEO?.ogDescription || undefined,
    ogImage: pageSEO?.ogImage || undefined,
    robots: pageSEO?.robots || undefined,
    structuredData: pageSEO?.structuredData || undefined,
    locale: language === 'ar' ? 'ar_YE' : 'en_US',
  };

  // إذا لم يوجد محتوى، عرض صفحة بسيطة
  if (!sections || sections.length === 0) {
    return (
      <>
        <SEO {...seoProps} />
        <Navbar />
        <div className="min-h-screen flex flex-col">
          <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                {title}
              </h1>
              {metaDescription && (
                <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                  {metaDescription}
                </p>
              )}
            </div>
          </section>
          <section className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-700 dark:text-gray-300">جاري إضافة المحتوى لهذه الصفحة...</p>
            </div>
          </section>
        </div>
        <Footer />
      </>
    );
  }

  // استخراج المحتوى النصي حسب القسم والنوع
  const getTextContent = (section: string, type: string, key?: string) => {
    if (!pageContent?.textContents) {
      return '';
    }
    return (
      pageContent.textContents.find(
        (item) =>
          (item.sectionName === section || item.section === section) &&
          item.type === type &&
          (!key || item.key === key)
      )?.content || ''
    );
  };

  // استخراج الصور حسب القسم
  const getImage = (section: string, key?: string) => {
    if (!pageContent?.images) {
      return null;
    }
    return pageContent.images.find(
      (item) =>
        (item.sectionName === section || item.section === section) && (!key || item.key === key)
    );
  };

  // استخراج أزرار قسم معين
  const getSectionButtons = (sectionId: number) => {
    if (!pageContent?.sectionButtons) {
      return [];
    }
    return pageContent.sectionButtons.filter(
      (item) => item.sectionId === sectionId && item.isActive === 'yes'
    );
  };

  // مكونات الأقسام
  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'hero': {
        const heroButtons = getSectionButtons(section.id);
        return (
          <section
            key={section.id}
            className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
          >
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                {getTextContent(section.name, 'title')}
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
                {getTextContent(section.name, 'subtitle')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                {getTextContent(section.name, 'description')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                {heroButtons.length > 0 ? (
                  heroButtons.map((button: SectionButton) => (
                    <Button
                      key={button.id}
                      size="lg"
                      variant={
                        button.style === 'primary'
                          ? 'default'
                          : button.style === 'secondary'
                            ? 'secondary'
                            : button.style === 'outline'
                              ? 'outline'
                              : 'ghost'
                      }
                      className="text-lg px-8 py-6"
                      onClick={() => (window.location.href = button.link)}
                    >
                      {language === 'ar' ? button.textAr : button.textEn}
                    </Button>
                  ))
                ) : (
                  <Button size="lg" className="text-lg px-8 py-6">
                    {getTextContent(section.name, 'button')}
                  </Button>
                )}
              </div>
            </div>
          </section>
        );
      }

      case 'text':
        return (
          <section key={section.id} className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center">
                {getTextContent(section.name, 'text')}
              </p>
            </div>
          </section>
        );

      case 'text-cards':
        return (
          <section key={section.id} className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      {getTextContent(section.name, 'title', `${section.name}.card${i}`)}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {getTextContent(section.name, 'text', `${section.name}.card${i}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'stats-cards':
        return (
          <section key={section.id} className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {getTextContent(section.name, 'text', `${section.name}.stat${i}`)}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {getTextContent(section.name, 'description', `${section.name}.stat${i}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'image-cards':
        return (
          <section key={section.id} className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => {
                  const img = getImage(section.name, `${section.name}.card${i}`);
                  return (
                    <div
                      key={i}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
                    >
                      {img && (
                        <img
                          src={img.url}
                          alt={language === 'ar' ? img.altAr : img.altEn}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                          {getTextContent(section.name, 'title', `${section.name}.card${i}`)}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {getTextContent(section.name, 'text', `${section.name}.card${i}`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case 'image': {
        const singleImage = getImage(section.name);
        return (
          <section key={section.id} className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              {singleImage && (
                <img
                  src={singleImage.url}
                  alt={language === 'ar' ? singleImage.altAr : singleImage.altEn}
                  className="max-w-4xl mx-auto rounded-lg shadow-lg"
                />
              )}
              <p className="text-lg text-gray-700 dark:text-gray-300 mt-8 max-w-2xl mx-auto">
                {getTextContent(section.name, 'description')}
              </p>
            </div>
          </section>
        );
      }

      case 'video':
        return (
          <section key={section.id} className="py-16 px-4 bg-gray-900">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">
                  {getTextContent(section.name, 'description') || 'Video placeholder'}
                </p>
              </div>
            </div>
          </section>
        );

      case 'cta': {
        const ctaButtons = getSectionButtons(section.id);
        return (
          <section key={section.id} className="py-16 px-4 bg-blue-600 dark:bg-blue-700">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {getTextContent(section.name, 'description')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                {ctaButtons.length > 0 ? (
                  ctaButtons.map((button: SectionButton) => (
                    <Button
                      key={button.id}
                      size="lg"
                      variant={
                        button.style === 'primary'
                          ? 'default'
                          : button.style === 'secondary'
                            ? 'secondary'
                            : button.style === 'outline'
                              ? 'outline'
                              : 'ghost'
                      }
                      className="text-lg px-8 py-6"
                      onClick={() => (window.location.href = button.link)}
                    >
                      {language === 'ar' ? button.textAr : button.textEn}
                    </Button>
                  ))
                ) : (
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    {getTextContent(section.name, 'button')}
                  </Button>
                )}
              </div>
            </div>
          </section>
        );
      }

      case 'features':
        return (
          <section key={section.id} className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                        {getTextContent(section.name, 'title', `${section.name}.feature${i}`)}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {getTextContent(section.name, 'text', `${section.name}.feature${i}`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'testimonials':
        return (
          <section key={section.id} className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {getTextContent(section.name, 'text', `${section.name}.testimonial${i}`)}
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {getTextContent(section.name, 'title', `${section.name}.testimonial${i}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'faq':
        return (
          <section key={section.id} className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white flex items-center">
                      <ChevronRight className="h-5 w-5 ml-2 text-blue-600 dark:text-blue-400" />
                      {getTextContent(section.name, 'title', `${section.name}.faq${i}`)}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mr-7">
                      {getTextContent(section.name, 'text', `${section.name}.faq${i}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section key={section.id} className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {getTextContent(section.name, 'title', 'contact.email')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {getTextContent(section.name, 'text', 'contact.email')}
                  </p>
                </div>
                <div className="text-center">
                  <Phone className="h-8 w-8 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {getTextContent(section.name, 'title', 'contact.phone')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {getTextContent(section.name, 'text', 'contact.phone')}
                  </p>
                </div>
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {getTextContent(section.name, 'title', 'contact.address')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {getTextContent(section.name, 'text', 'contact.address')}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      case 'pricing': {
        const pricingButtons = getSectionButtons(section.id);
        return (
          <section key={section.id} className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      {getTextContent(section.name, 'title', `${section.name}.plan${i}`)}
                    </h3>
                    <div className="text-4xl font-bold mb-6 text-blue-600 dark:text-blue-400">
                      {getTextContent(section.name, 'text', `${section.name}.plan${i}`)}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {[1, 2, 3, 4].map((j) => (
                        <li key={j} className="flex items-center text-gray-700 dark:text-gray-300">
                          <Check className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                          {getTextContent(
                            section.name,
                            'description',
                            `${section.name}.plan${i}.feature${j}`
                          )}
                        </li>
                      ))}
                    </ul>
                    {pricingButtons.length > 0 ? (
                      pricingButtons.map((button: SectionButton) => (
                        <Button
                          key={button.id}
                          variant={
                            button.style === 'primary'
                              ? 'default'
                              : button.style === 'secondary'
                                ? 'secondary'
                                : button.style === 'outline'
                                  ? 'outline'
                                  : 'ghost'
                          }
                          className="w-full"
                          onClick={() => (window.location.href = button.link)}
                        >
                          {language === 'ar' ? button.textAr : button.textEn}
                        </Button>
                      ))
                    ) : (
                      <Button className="w-full">
                        {getTextContent(section.name, 'button', `${section.name}.plan${i}`)}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case 'team': {
        return (
          <section key={section.id} className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => {
                  const memberImg = getImage(section.name, `${section.name}.member${i}`);
                  return (
                    <div key={i} className="text-center">
                      {memberImg && (
                        <img
                          src={memberImg.url}
                          alt={language === 'ar' ? memberImg.altAr : memberImg.altEn}
                          className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
                        />
                      )}
                      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                        {getTextContent(section.name, 'title', `${section.name}.member${i}`)}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {getTextContent(section.name, 'text', `${section.name}.member${i}`)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case 'gallery': {
        return (
          <section key={section.id} className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                  const galleryImg = getImage(section.name, `${section.name}.gallery${i}`);
                  return (
                    <div
                      key={i}
                      className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                    >
                      {galleryImg && (
                        <img
                          src={galleryImg.url}
                          alt={language === 'ar' ? galleryImg.altAr : galleryImg.altEn}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case 'timeline': {
        return (
          <section key={section.id} className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="space-y-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                        {getTextContent(section.name, 'title', `${section.name}.event${i}`)}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {getTextContent(section.name, 'text', `${section.name}.event${i}`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case 'slider': {
        return (
          <section key={section.id} className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => {
                  const sliderImg = getImage(section.name, `${section.name}.slide${i}`);
                  return (
                    <div
                      key={i}
                      className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                    >
                      {sliderImg && (
                        <img
                          src={sliderImg.url}
                          alt={language === 'ar' ? sliderImg.altAr : sliderImg.altEn}
                          className="w-full h-64 object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {getTextContent(section.name, 'title', `${section.name}.slide${i}`)}
                        </h3>
                        <p className="text-gray-200">
                          {getTextContent(section.name, 'text', `${section.name}.slide${i}`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      default:
        return (
          <section key={section.id} className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                {language === 'ar' ? section.titleAr : section.titleEn}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
                {language === 'ar' ? section.subtitleAr : section.subtitleEn}
              </p>
            </div>
          </section>
        );
    }
  };

  return (
    <>
      <SEO {...seoProps} />
      <Navbar />
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        {getTextContent('hero', 'title') && (
          <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                {getTextContent('hero', 'title') || title}
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
                {getTextContent('hero', 'subtitle')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                {getTextContent('hero', 'description')}
              </p>
              <Button size="lg" className="text-lg px-8 py-6">
                {getTextContent('hero', 'button')}
              </Button>
            </div>
          </section>
        )}

        {/* Dynamic Sections */}
        {sections && sections.length > 0 && sections.map(renderSection)}

        {/* Fallback sections */}
        {getTextContent('about', 'title') && (
          <section className="py-16 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                {getTextContent('about', 'title')}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                {getTextContent('about', 'text')}
              </p>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
