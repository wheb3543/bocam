/**
 * Page Preview Component
 * مكون معاينة الصفحة
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  X,
  Globe,
  Lock,
  Layers,
  ChevronRight,
  Star,
  Check,
  Mail,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import type { Page } from '../hooks/usePages';
import { useLanguage } from '@/contexts/LanguageContext';

interface PagePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: Page | null;
  sections: Array<{
    id: number;
    pageId: number;
    name: string;
    titleAr: string | null;
    titleEn: string | null;
    subtitleAr: string | null;
    subtitleEn: string | null;
    type: string;
    sortOrder: number;
    isActive: 'yes' | 'no';
    createdAt: Date;
    updatedAt: Date;
  }>;
  textContents?: Array<{
    id: number;
    key: string;
    language: string;
    content: string;
    section: string | null;
    sectionId: number | null;
    pageId: number | null;
    type: string;
  }>;
  images?: Array<{
    id: number;
    key: string;
    url: string;
    alt: string | null;
    altAr: string | null;
    altEn: string | null;
    section: string | null;
    sectionId: number | null;
    pageId: number | null;
  }>;
}

/**
 * PagePreview - مكون معاينة الصفحة
 */
export function PagePreview({
  open,
  onOpenChange,
  page,
  sections,
  textContents = [],
  images = [],
}: PagePreviewProps) {
  const { language } = useLanguage();

  if (!page) {
    return null;
  }

  // استخراج المحتوى النصي حسب القسم والنوع
  const getTextContent = (section: string, type: string, key?: string) => {
    return (
      textContents.find(
        (item) => item.section === section && item.type === type && (!key || item.key === key)
      )?.content || ''
    );
  };

  // استخراج الصور حسب القسم
  const getImage = (section: string, key?: string) => {
    return images.find((item) => item.section === section && (!key || item.key === key));
  };

  // مكونات الأقسام
  const renderSection = (section: PagePreviewProps['sections'][0]) => {
    switch (section.type) {
      case 'hero':
        return (
          <div
            key={section.id}
            className="py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-lg mb-4"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {getTextContent(section.name, 'title')}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                {getTextContent(section.name, 'subtitle')}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto">
                {getTextContent(section.name, 'description')}
              </p>
              <Button size="sm">{getTextContent(section.name, 'button')}</Button>
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={section.id} className="py-8 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <div>
              <h3 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300 text-center">
                {getTextContent(section.name, 'text')}
              </p>
            </div>
          </div>
        );

      case 'text-cards':
        return (
          <div key={section.id} className="py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {getTextContent(section.name, 'title', `${section.name}.card${i}`)}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {getTextContent(section.name, 'text', `${section.name}.card${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'stats-cards':
        return (
          <div key={section.id} className="py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {getTextContent(section.name, 'text', `${section.name}.stat${i}`)}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {getTextContent(section.name, 'description', `${section.name}.stat${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'image-cards':
        return (
          <div key={section.id} className="py-8 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => {
                const img = getImage(section.name, `${section.name}.card${i}`);
                return (
                  <div
                    key={i}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
                  >
                    {img && (
                      <img
                        src={img.url}
                        alt={
                          language === 'ar'
                            ? img.altAr || img.alt || ''
                            : img.altEn || img.alt || ''
                        }
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                        {getTextContent(section.name, 'title', `${section.name}.card${i}`)}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {getTextContent(section.name, 'text', `${section.name}.card${i}`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'image': {
        const singleImage = getImage(section.name);
        return (
          <div key={section.id} className="py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h3>
              {singleImage && (
                <img
                  src={singleImage.url}
                  alt={
                    language === 'ar'
                      ? singleImage.altAr || singleImage.alt || ''
                      : singleImage.altEn || singleImage.alt || ''
                  }
                  className="max-w-md mx-auto rounded-lg shadow-md"
                />
              )}
              <p className="text-base text-gray-700 dark:text-gray-300 mt-4 max-w-xl mx-auto">
                {getTextContent(section.name, 'description')}
              </p>
            </div>
          </div>
        );
      }

      case 'cta':
        return (
          <div key={section.id} className="py-8 px-4 bg-blue-600 dark:bg-blue-700 rounded-lg mb-4">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-white">
                {getTextContent(section.name, 'title')}
              </h3>
              <p className="text-lg text-blue-100 mb-4 max-w-xl mx-auto">
                {getTextContent(section.name, 'description')}
              </p>
              <Button size="sm" variant="secondary">
                {getTextContent(section.name, 'button')}
              </Button>
            </div>
          </div>
        );

      case 'features':
        return (
          <div key={section.id} className="py-8 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-start space-x-2 space-x-reverse">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-base font-bold mb-1 text-gray-900 dark:text-white">
                      {getTextContent(section.name, 'title', `${section.name}.feature${i}`)}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {getTextContent(section.name, 'text', `${section.name}.feature${i}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div key={section.id} className="py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {getTextContent(section.name, 'text', `${section.name}.testimonial${i}`)}
                  </p>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    {getTextContent(section.name, 'title', `${section.name}.testimonial${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'faq':
        return (
          <div key={section.id} className="py-8 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <h4 className="text-base font-bold mb-2 text-gray-900 dark:text-white flex items-center">
                    <ChevronRight className="h-4 w-4 ml-2 text-blue-600 dark:text-blue-400" />
                    {getTextContent(section.name, 'title', `${section.name}.faq${i}`)}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mr-6">
                    {getTextContent(section.name, 'text', `${section.name}.faq${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div key={section.id} className="py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Mail className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <h4 className="text-base font-bold mb-1 text-gray-900 dark:text-white">
                  {getTextContent(section.name, 'title', 'contact.email')}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {getTextContent(section.name, 'text', 'contact.email')}
                </p>
              </div>
              <div className="text-center">
                <Phone className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <h4 className="text-base font-bold mb-1 text-gray-900 dark:text-white">
                  {getTextContent(section.name, 'title', 'contact.phone')}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {getTextContent(section.name, 'text', 'contact.phone')}
                </p>
              </div>
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <h4 className="text-base font-bold mb-1 text-gray-900 dark:text-white">
                  {getTextContent(section.name, 'title', 'contact.address')}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {getTextContent(section.name, 'text', 'contact.address')}
                </p>
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div key={section.id} className="py-8 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {getTextContent(section.name, 'title', `${section.name}.plan${i}`)}
                  </h4>
                  <div className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                    {getTextContent(section.name, 'text', `${section.name}.plan${i}`)}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {[1, 2, 3, 4].map((j) => (
                      <li
                        key={j}
                        className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                        {getTextContent(
                          section.name,
                          'description',
                          `${section.name}.plan${i}.feature${j}`
                        )}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full">
                    {getTextContent(section.name, 'button', `${section.name}.plan${i}`)}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'team':
        return (
          <div key={section.id} className="py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => {
                const memberImg = getImage(section.name, `${section.name}.member${i}`);
                return (
                  <div key={i} className="text-center">
                    {memberImg && (
                      <img
                        src={memberImg.url}
                        alt={
                          language === 'ar'
                            ? memberImg.altAr || memberImg.alt || ''
                            : memberImg.altEn || memberImg.alt || ''
                        }
                        className="w-20 h-20 mx-auto rounded-full object-cover mb-2"
                      />
                    )}
                    <h4 className="text-base font-bold mb-1 text-gray-900 dark:text-white">
                      {getTextContent(section.name, 'title', `${section.name}.member${i}`)}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {getTextContent(section.name, 'text', `${section.name}.member${i}`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div key={section.id} className="py-8 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-4 gap-3">
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
                        alt={
                          language === 'ar'
                            ? galleryImg.altAr || galleryImg.alt || ''
                            : galleryImg.altEn || galleryImg.alt || ''
                        }
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div key={section.id} className="py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start space-x-2 space-x-reverse">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-base font-bold mb-1 text-gray-900 dark:text-white">
                      {getTextContent(section.name, 'title', `${section.name}.event${i}`)}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {getTextContent(section.name, 'text', `${section.name}.event${i}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'slider':
        return (
          <div key={section.id} className="py-8 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
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
                        alt={
                          language === 'ar'
                            ? sliderImg.altAr || sliderImg.alt || ''
                            : sliderImg.altEn || sliderImg.alt || ''
                        }
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h4 className="text-lg font-bold text-white mb-1">
                        {getTextContent(section.name, 'title', `${section.name}.slide${i}`)}
                      </h4>
                      <p className="text-sm text-gray-200">
                        {getTextContent(section.name, 'text', `${section.name}.slide${i}`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div key={section.id} className="py-8 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <div>
              <h3 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                {language === 'ar' ? section.titleAr : section.titleEn}
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300 text-center">
                {language === 'ar' ? section.subtitleAr : section.subtitleEn}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>معاينة الصفحة</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {page.name} - {page.slug}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Page Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                معلومات الصفحة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الاسم:</p>
                  <p className="font-medium">{page.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الرابط:</p>
                  <p className="font-mono text-sm">{page.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">النوع:</p>
                  <Badge variant="outline">
                    {page.type === 'main' ? 'صفحة رئيسية' : 'صفحة فرعية'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الحالة:</p>
                  <Badge variant={page.isActive === 'yes' ? 'default' : 'secondary'}>
                    {page.isActive === 'yes' ? (
                      <>
                        <Lock className="h-3 w-3 ml-1" />
                        نشط
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 ml-1" />
                        معطل
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">العنوان (AR):</p>
                  <p className="font-medium">{page.titleAr}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">العنوان (EN):</p>
                  <p className="font-medium">{page.titleEn}</p>
                </div>
              </div>
              {page.metaTitleAr && (
                <div>
                  <p className="text-sm text-muted-foreground">عنوان SEO (AR):</p>
                  <p className="text-sm">{page.metaTitleAr}</p>
                </div>
              )}
              {page.metaDescriptionAr && (
                <div>
                  <p className="text-sm text-muted-foreground">وصف SEO (AR):</p>
                  <p className="text-sm">{page.metaDescriptionAr}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                معاينة حية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                {sections.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد أقسام مرتبطة بهذه الصفحة
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sections
                      .filter((s) => s.isActive === 'yes')
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map(renderSection)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
            <Button onClick={() => window.open(`/${page.slug}`, '_blank')}>فتح الصفحة</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
