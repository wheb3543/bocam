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

interface ContentPreviewPanelProps {
  textContents: TextContent[];
  images: Image[];
  colorSchemes: ColorScheme[];
  pages?: Page[];
  sections?: Array<{ id: number; name: string; pageId?: number | null; type?: string | null }>;
  isVisible: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  language: string;
  onOpenDraftPreview?: (pageId: number, language: 'ar' | 'en') => void;
  isDraftPreviewPending?: boolean;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ThemeType = 'light' | 'dark';
type PreviewMode = 'content' | 'site';

/**
 * ContentPreviewPanel - مكون لوحة المعاينة الفورية
 */
export function ContentPreviewPanel({
  textContents,
  images,
  colorSchemes,
  pages = [],
  isVisible,
  onToggle,
  onRefresh,
  language,
  onOpenDraftPreview,
  isDraftPreviewPending = false,
}: ContentPreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('content');
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

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

  // Device width mapping
  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-x-2 bottom-2 z-50 max-h-[calc(100dvh-1rem)] md:bottom-4 md:left-4 md:right-auto md:w-[500px]">
      <Card className="max-h-[calc(100dvh-1rem)] overflow-hidden shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">معاينة فورية</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onRefresh();
                setPreviewKey((key) => key + 1);
              }}
              aria-label="تحديث المعاينة"
            >
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
                  <SelectItem value="site">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>الصفحة المنشورة</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {previewMode === 'site' && (
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

            {previewMode === 'site' && selectedPage && onOpenDraftPreview && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isDraftPreviewPending}
                onClick={() => onOpenDraftPreview(selectedPage.id, language === 'en' ? 'en' : 'ar')}
              >
                {isDraftPreviewPending ? 'جاري إنشاء رابط آمن…' : 'فتح معاينة المسودة الآمنة'}
              </Button>
            )}

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
                ) : selectedPage ? (
                  <iframe
                    key={`${selectedPage.id}-${previewKey}`}
                    src={`/page/${selectedPage.slug}`}
                    title={`المعاينة المنشورة لصفحة ${selectedPage.titleAr || selectedPage.name}`}
                    className="min-h-[420px] w-full border-0 bg-white"
                    loading="lazy"
                  />
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    اختر صفحة لعرض النسخة المنشورة الفعلية ضمن المقاس المحدد.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
