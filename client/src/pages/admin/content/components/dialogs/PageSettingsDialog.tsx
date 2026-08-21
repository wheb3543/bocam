/**
 * Page Settings Dialog Component
 * مكون حوار إعدادات الصفحة
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Layers, FileText, Image as ImageIcon, Search, ArrowLeft } from 'lucide-react';
import type { Page } from '../../hooks/usePages';
import type { Section } from '../../hooks/useSections';
import type { TextContent, Image } from '../../types/content.types';
import { useTextContent } from '../../hooks/useTextContent';
import { useImages } from '../../hooks/useImages';
import { useSections } from '../../hooks/useSections';
import { useSEO } from '../../hooks/useSEO';

interface PageSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: Page | null;
  onNavigateToTab?: (tab: string) => void;
}

export function PageSettingsDialog({
  open,
  onOpenChange,
  page,
  onNavigateToTab,
}: PageSettingsDialogProps) {
  const textContent = useTextContent();
  const images = useImages();
  const sections = useSections();
  const seo = useSEO();

  if (!page) {
    return null;
  }

  // تصفية المحتوى المرتبط بهذه الصفحة
  const pageTextContent =
    textContent.textContents?.filter((tc: TextContent) => tc.pageId === page.id) || [];
  const pageImages = images.images?.filter((img: Image) => img.pageId === page.id) || [];
  const pageSections = sections.sections?.filter((sec: Section) => sec.pageId === page.id) || [];
  const pageSEO = seo.seoSettings?.find(
    (setting) => setting.pageId === page.id || setting.slug === page.slug
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات الصفحة: {page.name}
          </DialogTitle>
          <DialogDescription>إدارة المحتوى المرتبط بالصفحة {page.titleAr}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sections" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              الأقسام ({pageSections.length})
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              المحتوى ({pageTextContent.length})
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              الصور ({pageImages.length})
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>الأقسام المرتبطة بالصفحة</CardTitle>
                <CardDescription>إدارة الأقسام التي تظهر في هذه الصفحة</CardDescription>
              </CardHeader>
              <CardContent>
                {pageSections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد أقسام مرتبطة بهذه الصفحة</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        onNavigateToTab?.('sections');
                        onOpenChange(false);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      الذهاب لإدارة الأقسام
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pageSections.map((section: Section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{section.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {section.titleAr || section.titleEn}
                          </div>
                        </div>
                        <Badge variant={section.isActive === 'yes' ? 'default' : 'secondary'}>
                          {section.isActive === 'yes' ? 'نشط' : 'معطل'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>المحتوى النصي المرتبط بالصفحة</CardTitle>
                <CardDescription>إدارة النصوص والعناوين والوصف المرتبط بهذه الصفحة</CardDescription>
              </CardHeader>
              <CardContent>
                {pageTextContent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا يوجد محتوى نصي مرتبط بهذه الصفحة</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        onNavigateToTab?.('content');
                        onOpenChange(false);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      الذهاب لإدارة المحتوى النصي
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pageTextContent.map((content: TextContent) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {content.type}
                            </Badge>
                            <span className="text-sm font-medium">{content.key}</span>
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {content.content}
                          </div>
                        </div>
                        <Badge variant={content.isActive === 'yes' ? 'default' : 'secondary'}>
                          {content.isActive === 'yes' ? 'نشط' : 'معطل'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>الصور المرتبطة بالصفحة</CardTitle>
                <CardDescription>إدارة الصور والرسومات المرتبطة بهذه الصفحة</CardDescription>
              </CardHeader>
              <CardContent>
                {pageImages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد صور مرتبطة بهذه الصفحة</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        onNavigateToTab?.('images');
                        onOpenChange(false);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      الذهاب لإدارة الصور
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {pageImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.altAr || image.altEn || ''}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Badge variant={image.isActive === 'yes' ? 'default' : 'secondary'}>
                            {image.isActive === 'yes' ? 'نشط' : 'معطل'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات SEO للصفحة</CardTitle>
                <CardDescription>
                  إدارة العناوين والوصف والكلمات المفتاحية لمحركات البحث
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">العنوان (AR)</label>
                  <div className="p-3 bg-muted rounded-md">
                    {pageSEO?.title || page.metaTitleAr || 'غير محدد'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">العنوان (EN)</label>
                  <div className="p-3 bg-muted rounded-md">
                    {pageSEO?.title || page.metaTitleEn || 'غير محدد'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الوصف (AR)</label>
                  <div className="p-3 bg-muted rounded-md">
                    {pageSEO?.description || page.metaDescriptionAr || 'غير محدد'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الوصف (EN)</label>
                  <div className="p-3 bg-muted rounded-md">
                    {pageSEO?.description || page.metaDescriptionEn || 'غير محدد'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الكلمات المفتاحية (AR)</label>
                  <div className="p-3 bg-muted rounded-md">
                    {pageSEO?.keywords || page.keywordsAr || 'غير محدد'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الكلمات المفتاحية (EN)</label>
                  <div className="p-3 bg-muted rounded-md">
                    {pageSEO?.keywords || page.keywordsEn || 'غير محدد'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onNavigateToTab?.('seo');
                    onOpenChange(false);
                  }}
                >
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  تعديل إعدادات SEO
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
