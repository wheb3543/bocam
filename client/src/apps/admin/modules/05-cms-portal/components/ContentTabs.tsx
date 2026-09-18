/**
 * Content Tabs Component
 * مكون التبويبات لإدارة المحتوى
 */

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Image,
  Palette,
  Search,
  Layout,
  Layers,
  MousePointerClick,
  Trash2,
} from 'lucide-react';

interface ContentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children?: React.ReactNode;
}

/**
 * ContentTabs - مكون التبويبات للتنقل بين أقسام المحتوى
 */
export function ContentTabs({ activeTab, onTabChange, children }: ContentTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 gap-1 md:grid-cols-8">
        <TabsTrigger value="text" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">النصوص</span>
        </TabsTrigger>
        <TabsTrigger value="images" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">الصور</span>
        </TabsTrigger>
        <TabsTrigger value="pages" className="flex items-center gap-2">
          <Layout className="h-4 w-4" />
          <span className="hidden sm:inline">الصفحات</span>
        </TabsTrigger>
        <TabsTrigger value="sections" className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">الأقسام</span>
        </TabsTrigger>
        <TabsTrigger value="sectionButtons" className="flex items-center gap-2">
          <MousePointerClick className="h-4 w-4" />
          <span className="hidden sm:inline">أزرار الأقسام</span>
        </TabsTrigger>
        <TabsTrigger value="colors" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">الألوان</span>
        </TabsTrigger>
        <TabsTrigger value="seo" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">SEO</span>
        </TabsTrigger>
        <TabsTrigger value="trash" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">المحذوفات</span>
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
}
