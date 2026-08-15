/**
 * Content Preview Panel Component
 * مكون لوحة المعاينة الفورية للمحتوى
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  EyeOff,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  Sun,
  Moon,
  Layers,
} from 'lucide-react';
import { PreviewHero } from './PreviewHero';
import { PreviewSection } from './PreviewSection';
import { PreviewFeatures } from './PreviewFeatures';
import type { TextContent, Image, ColorScheme } from '../../types/content.types';
import type { Page } from '../../hooks/usePages';
import type { Section } from '../../hooks/useSections';

interface ContentPreviewPanelProps {
  textContents: TextContent[];
  images: Image[];
  colorSchemes: ColorScheme[];
  pages?: Page[];
  sections?: Section[];
  isVisible: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  language: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ThemeType = 'light' | 'dark';
type PreviewMode = 'content' | 'page';

/**
 * ContentPreviewPanel - مكون لوحة المعاينة الفورية
 */
export function ContentPreviewPanel({
  textContents,
  images,
  colorSchemes,
  pages = [],
  sections = [],
  isVisible,
  onToggle,
  onRefresh,
  language,
}: ContentPreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('content');
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);

  if (!isVisible) {
    return (
      <Button onClick={onToggle} variant="outline" className="fixed bottom-4 left-4 z-50">
        <Eye className="h-4 w-4 ml-2" />
        عرض المعاينة
      </Button>
    );
  }

  // Get active content
  const activeTextContents = textContents.filter(
    (t) => t.isActive === 'yes' && t.language === language
  );
  const activeImages = images.filter((i) => i.isActive === 'yes');
  const activeColorSchemes = colorSchemes.filter((c) => c.isActive === 'yes');

  // Build color map
  const colorMap = activeColorSchemes.reduce(
    (acc, color) => {
      acc[color.key] = color.value;
      return acc;
    },
    {} as Record<string, string>
  );

  // Build text map
  const textMap = activeTextContents.reduce(
    (acc, text) => {
      acc[text.key] = text.content;
      return acc;
    },
    {} as Record<string, string>
  );

  // Build image map
  const imageMap = activeImages.reduce(
    (acc, image) => {
      acc[image.key] = image.url;
      return acc;
    },
    {} as Record<string, string>
  );

  // Get selected page sections
  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const pageSections = selectedPage
    ? sections
        .filter((s) => s.pageId === selectedPageId && s.isActive === 'yes')
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  // استخراج المحتوى النصي حسب القسم والنوع
  const getTextContent = (section: string, type: string, key?: string) => {
    return (
      activeTextContents.find(
        (item) => item.section === section && item.type === type && (!key || item.key === key)
      )?.content || ''
    );
  };

  // استخراج الصور حسب القسم
  const getImage = (section: string, key?: string) => {
    return activeImages.find((item) => item.section === section && (!key || item.key === key));
  };

  // مكونات الأقسام (نسخة مبسطة من PagePreview)
  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'hero': {
        const heroImage = getImage(section.name, 'background');
        return (
          <div
            key={section.id}
            className="py-8 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-lg mb-4 relative overflow-hidden"
          >
            {heroImage && (
              <img
                src={heroImage.url}
                alt={heroImage.altAr || heroImage.altEn || 'Hero Image'}
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
            )}
            <div className="text-center relative z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {getTextContent(section.name, 'title')}
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-3">
                {getTextContent(section.name, 'subtitle')}
              </p>
              <Button size="sm">{getTextContent(section.name, 'button')}</Button>
            </div>
          </div>
        );
      }

      case 'text':
        return (
          <div key={section.id} className="py-6 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <div>
              <h3 className="text-lg font-bold text-center mb-3 text-gray-900 dark:text-white">
                {getTextContent(section.name, 'title')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                {getTextContent(section.name, 'text')}
              </p>
            </div>
          </div>
        );

      case 'features':
        return (
          <div key={section.id} className="py-6 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <h3 className="text-lg font-bold text-center mb-4 text-gray-900 dark:text-white">
              {getTextContent(section.name, 'title')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start space-x-2 space-x-reverse">
                  <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold mb-1 text-gray-900 dark:text-white">
                      {getTextContent(section.name, 'title', `${section.name}.feature${i}`)}
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {getTextContent(section.name, 'text', `${section.name}.feature${i}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div key={section.id} className="py-6 px-4 bg-blue-600 dark:bg-blue-700 rounded-lg mb-4">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-3 text-white">
                {getTextContent(section.name, 'title')}
              </h3>
              <Button size="sm" variant="secondary">
                {getTextContent(section.name, 'button')}
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div key={section.id} className="py-6 px-4 bg-white dark:bg-gray-900 rounded-lg mb-4">
            <div>
              <h3 className="text-lg font-bold text-center mb-3 text-gray-900 dark:text-white">
                {language === 'ar' ? section.titleAr : section.titleEn}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                {language === 'ar' ? section.subtitleAr : section.subtitleEn}
              </p>
            </div>
          </div>
        );
    }
  };

  // Device width mapping
  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-[500px] z-50">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">معاينة فورية</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="تحديث">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggle} aria-label="إخفاء">
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview Mode and Page Selection */}
            <div className="flex gap-2">
              <Select
                value={previewMode}
                onValueChange={(value: PreviewMode) => setPreviewMode(value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="وضع المعاينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>المحتوى</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="page">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>الصفحة</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {previewMode === 'page' && (
                <Select
                  value={selectedPageId?.toString() || ''}
                  onValueChange={(value) => setSelectedPageId(value ? Number(value) : null)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="اختر صفحة" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.id} value={page.id.toString()}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Device and Theme Controls */}
            <div className="flex gap-2">
              <Select value={device} onValueChange={(value: DeviceType) => setDevice(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="الجهاز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>سطح المكتب</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4" />
                      <span>تابلت</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>جوال</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={theme} onValueChange={(value: ThemeType) => setTheme(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="الوضع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>فاتح</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>مظلم</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview Content */}
            <div
              className={`border rounded-lg overflow-hidden transition-all ${
                isDark ? 'bg-gray-900 text-white' : 'bg-white'
              }`}
              style={{ maxWidth: deviceWidths[device], margin: '0 auto' }}
            >
              <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
                {previewMode === 'content' ? (
                  <>
                    {/* Hero Section Preview */}
                    <PreviewHero textMap={textMap} imageMap={imageMap} colorMap={colorMap} />

                    {/* Features Section Preview */}
                    <PreviewFeatures textMap={textMap} imageMap={imageMap} colorMap={colorMap} />

                    {/* Additional Section Preview */}
                    <PreviewSection
                      textMap={textMap}
                      imageMap={imageMap}
                      colorMap={colorMap}
                      sectionKey="about"
                    />
                  </>
                ) : (
                  <>
                    {selectedPage ? (
                      pageSections.length > 0 ? (
                        pageSections.map(renderSection)
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          لا توجد أقسام مرتبطة بهذه الصفحة
                        </p>
                      )
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        اختر صفحة لعرض معاينة كاملة
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
