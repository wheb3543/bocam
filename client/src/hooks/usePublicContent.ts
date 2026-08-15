/**
 * Public Content Hooks
 * Hooks لاستخدام المحتوى العام من قاعدة البيانات في الواجهات العامة
 */

import { trpc } from '@/lib/api/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface TextContentItem {
  id: number;
  key: string;
  content: string;
  language: string;
  section: string;
  sectionName?: string | null;
  type: 'text' | 'title' | 'subtitle' | 'description' | 'button' | 'link';
  isActive: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PageItem {
  id: number;
  name: string;
  slug: string;
  type: 'main' | 'sub';
  parentId: number | null;
  titleAr: string;
  titleEn: string;
  metaTitleAr: string | null;
  metaTitleEn: string | null;
  metaDescriptionAr: string | null;
  metaDescriptionEn: string | null;
  keywordsAr: string | null;
  keywordsEn: string | null;
  isActive: 'yes' | 'no';
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SectionItem {
  id: number;
  pageId: number;
  name: string;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
  type: string;
  settings: string | null;
  sortOrder: number;
  isActive: 'yes' | 'no';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hook للحصول على المحتوى النصي العام
 */
export function usePublicTextContent(options?: {
  key?: string;
  language?: 'ar' | 'en';
  section?: string;
  type?: 'text' | 'title' | 'subtitle' | 'description' | 'button' | 'link';
  limit?: number;
  offset?: number;
}) {
  const { language: currentLanguage } = useLanguage();
  const language = options?.language || currentLanguage;

  return trpc.publicContent.getTextContent.useQuery(
    {
      key: options?.key,
      language,
      section: options?.section,
      type: options?.type,
      limit: options?.limit,
      offset: options?.offset,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  ) as {
    data:
      | {
          data: TextContentItem[];
          pagination: { limit: number; offset: number; total: number; hasMore: boolean };
        }
      | undefined;
  };
}

/**
 * Hook للحصول على الصور العامة
 */
export function usePublicImages(options?: {
  key?: string;
  section?: string;
  format?: string;
  limit?: number;
  offset?: number;
}) {
  return trpc.publicContent.getImages.useQuery(
    {
      key: options?.key,
      section: options?.section,
      format: options?.format,
      limit: options?.limit,
      offset: options?.offset,
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  ) as {
    data:
      | {
          data: Array<{
            id: number;
            key: string;
            url: string;
            alt: string | null;
            section: string | null;
            width: number | null;
            height: number | null;
            format: string | null;
            size: number | null;
            isActive: string;
            createdAt: Date;
            updatedAt: Date;
          }>;
          pagination: { limit: number; offset: number; total: number; hasMore: boolean };
        }
      | undefined;
  };
}

/**
 * Hook للحصول على نظام الألوان العام
 */
export function usePublicColorScheme(options?: {
  key?: string;
  type?: 'primary' | 'secondary' | 'accent' | 'background' | 'text' | 'border';
  shade?: string;
}) {
  return trpc.publicContent.getColorScheme.useQuery(
    {
      key: options?.key,
      type: options?.type,
      shade: options?.shade,
    },
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Hook للحصول على إعدادات SEO العامة
 */
export function usePublicSEOSettings(options?: {
  pageKey?: string;
  slug?: string;
  language?: 'ar' | 'en';
}) {
  const { language: currentLanguage } = useLanguage();
  const language = options?.language || currentLanguage;

  return trpc.publicContent.getSEOSettings.useQuery(
    {
      pageKey: options?.pageKey,
      slug: options?.slug,
      language,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Hook للحصول على كل المحتوى العام لصفحة معينة
 */
export function usePublicPageContent(section: string, language?: 'ar' | 'en') {
  const { language: currentLanguage } = useLanguage();
  const lang = language || currentLanguage;

  return trpc.publicContent.getPageContent.useQuery(
    {
      section,
      language: lang,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Hook للحصول على الصفحات العامة
 */
export function usePublicPages(options?: {
  type?: 'main' | 'sub';
  isActive?: 'yes' | 'no';
  language?: 'ar' | 'en';
  limit?: number;
  offset?: number;
}) {
  const { language: currentLanguage } = useLanguage();
  const language = options?.language || currentLanguage;

  return trpc.publicContent.getPages.useQuery(
    {
      type: options?.type,
      isActive: options?.isActive,
      language,
      limit: options?.limit,
      offset: options?.offset,
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  ) as {
    data:
      | {
          data: PageItem[];
          pagination: { limit: number; offset: number; total: number; hasMore: boolean };
        }
      | undefined;
  };
}

/**
 * Hook للحصول على صفحة بواسطة الرابط (slug)
 */
export function usePublicPageBySlug(slug: string, language?: 'ar' | 'en') {
  const { language: currentLanguage } = useLanguage();
  const lang = language || currentLanguage;

  return trpc.publicContent.getPageBySlug.useQuery(
    {
      slug,
      language: lang,
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  ) as { data: PageItem | undefined; isLoading: boolean };
}

/**
 * Hook للحصول على الأقسام العامة
 */
export function usePublicSections(options?: {
  pageId?: number;
  type?: string;
  isActive?: 'yes' | 'no';
  limit?: number;
  offset?: number;
}) {
  return trpc.publicContent.getSections.useQuery(
    {
      pageId: options?.pageId,
      type: options?.type,
      isActive: options?.isActive,
      limit: options?.limit,
      offset: options?.offset,
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  ) as {
    data:
      | {
          data: SectionItem[];
          pagination: { limit: number; offset: number; total: number; hasMore: boolean };
        }
      | undefined;
  };
}

/**
 * Hook للحصول على أقسام صفحة معينة
 */
export function usePublicSectionsByPageId(pageId: number, isActive?: 'yes' | 'no') {
  return trpc.publicContent.getSectionsByPageId.useQuery(
    {
      pageId,
      isActive,
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  ) as { data: SectionItem[] | undefined };
}

/**
 * Hook للحصول على كل المحتوى لصفحة معينة بواسطة pageId
 */
export function usePublicPageContentByPageId(pageId: number, language?: 'ar' | 'en') {
  const { language: currentLanguage } = useLanguage();
  const lang = language || currentLanguage;

  return trpc.publicContent.getPageContentByPageId.useQuery(
    {
      pageId,
      language: lang,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  ) as {
    data:
      | {
          textContents: TextContentItem[];
          images: any[];
          colors: any[];
          sections: SectionItem[];
          sectionButtons: any[];
        }
      | undefined;
    isLoading: boolean;
  };
}

/**
 * Hook للحصول على أزرار قسم معين
 */
export function usePublicSectionButtons(sectionId: number) {
  return trpc.publicContent.getSectionButtons.useQuery(
    {
      sectionId,
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  );
}
