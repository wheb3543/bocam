/**
 * useSections - Custom Hook لإدارة الأقسام
 * Hook مخصص لإدارة الأقسام
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { getContentListData, getContentListPagination } from '../utils/listResponse';

export type SectionType =
  | 'slider'
  | 'text'
  | 'text-cards'
  | 'stats-cards'
  | 'image-cards'
  | 'image'
  | 'video'
  | 'hero'
  | 'cta'
  | 'features'
  | 'testimonials'
  | 'faq'
  | 'contact'
  | 'pricing'
  | 'team'
  | 'gallery'
  | 'timeline'
  | 'custom';

export interface Section {
  id: number;
  pageId: number;
  name: string;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
  type: SectionType;
  settings: string | null;
  status: 'draft' | 'published' | 'archived';
  sortOrder: number;
  isActive: 'yes' | 'no';
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionFormData {
  pageId: number;
  name: string;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
  type: SectionType;
  settings: string | null;
  status: 'draft' | 'published' | 'archived';
  sortOrder: number;
  isActive: 'yes' | 'no';
  publishedAt: Date | null;
}

export interface SectionOrderValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * قواعد الترتيب المنطقي للأقسام
 */
const SECTION_ORDER_RULES: Record<
  SectionType,
  { minPosition?: number; maxPosition?: number; maxCount?: number }
> = {
  hero: { minPosition: 0, maxPosition: 0, maxCount: 1 },
  slider: { minPosition: 0, maxPosition: 1, maxCount: 1 },
  features: { minPosition: 1, maxCount: 1 },
  testimonials: { minPosition: 2 },
  pricing: { minPosition: 2 },
  faq: { minPosition: 2 },
  contact: { minPosition: 3 },
  cta: { minPosition: 3 },
  text: {},
  'text-cards': {},
  'stats-cards': {},
  'image-cards': {},
  image: {},
  video: {},
  team: {},
  gallery: {},
  timeline: {},
  custom: {},
};

/**
 * التحقق من الترتيب المنطقي للأقسام
 */
export function validateSectionOrder(sections: Section[]): SectionOrderValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const sectionCounts: Record<SectionType, number> = {} as Record<SectionType, number>;

  // حساب عدد كل نوع من الأقسام
  sortedSections.forEach((section) => {
    sectionCounts[section.type] = (sectionCounts[section.type] || 0) + 1;
  });

  // التحقق من القواعد
  sortedSections.forEach((section, index) => {
    const rules = SECTION_ORDER_RULES[section.type];

    if (rules.minPosition !== undefined && index < rules.minPosition) {
      errors.push(
        `القسم "${section.name}" من نوع ${section.type} يجب أن يكون في الموقع ${rules.minPosition} أو بعده`
      );
    }

    if (rules.maxPosition !== undefined && index > rules.maxPosition) {
      errors.push(
        `القسم "${section.name}" من نوع ${section.type} يجب أن يكون في الموقع ${rules.maxPosition} أو قبله`
      );
    }

    if (rules.maxCount !== undefined && sectionCounts[section.type] > rules.maxCount) {
      errors.push(`لا يمكن إضافة أكثر من ${rules.maxCount} قسم من نوع ${section.type}`);
    }
  });

  // تحذيرات إضافية
  if (sectionCounts.hero === 0) {
    warnings.push('لا يوجد قسم Hero، يُنصح بإضافته في البداية');
  }

  if (sectionCounts.cta === 0) {
    warnings.push('لا يوجد قسم CTA، يُنصح بإضافته في النهاية');
  }

  if (
    sortedSections.length > 0 &&
    sortedSections[0].type !== 'hero' &&
    sortedSections[0].type !== 'slider'
  ) {
    warnings.push('القسم الأول يجب أن يكون Hero أو Slider');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export const initialSectionFormData: SectionFormData = {
  pageId: 0,
  name: '',
  titleAr: '',
  titleEn: '',
  subtitleAr: '',
  subtitleEn: '',
  type: 'text',
  settings: '',
  status: 'draft',
  sortOrder: 0,
  isActive: 'yes',
  publishedAt: null,
};

/**
 * useSections - Hook لإدارة الأقسام
 */
export function useSections() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState<SectionFormData>(initialSectionFormData);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [pageId, setPageId] = useState<number | undefined>(undefined);
  const [type, setType] = useState<string>('all');
  const [isActive, setIsActive] = useState<'all' | 'yes' | 'no'>('all');
  const [page, setPage] = useState(1);

  // Query
  const {
    data: sectionsData,
    isLoading: loadingSections,
    refetch,
  } = trpc.content.sections.list.useQuery({
    pageId,
    type: type !== 'all' ? type : undefined,
    isActive: isActive !== 'all' ? (isActive as 'yes' | 'no') : undefined,
    search: searchQuery || undefined,
    page,
  });

  const sections = getContentListData<Section>(sectionsData);
  const pagination = getContentListPagination<Section>(sectionsData);

  // Query for pages (for page selection)
  const { data: pagesData } = trpc.content.pages.list.useQuery({});
  const pages = getContentListData<{ id: number; name: string; titleAr: string; titleEn: string }>(
    pagesData
  );

  // Mutations
  const createMutation = trpc.content.sections.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء القسم بنجاح');
      setIsCreateDialogOpen(false);
      setFormData(initialSectionFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل إنشاء القسم: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.sections.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث القسم بنجاح');
      setIsEditDialogOpen(false);
      setSelectedSection(null);
      setFormData(initialSectionFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل تحديث القسم: ${error.message}`);
    },
  });

  const deleteMutation = trpc.content.sections.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف القسم بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل حذف القسم: ${error.message}`);
    },
  });

  const reorderMutation = trpc.content.sections.reorder.useMutation({
    onSuccess: () => {
      toast.success('تم إعادة ترتيب الأقسام بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل إعادة ترتيب الأقسام: ${error.message}`);
    },
  });

  const duplicateMutation = trpc.content.sections.duplicate.useMutation({
    onSuccess: () => {
      toast.success('تم نسخ القسم بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل نسخ القسم: ${error.message}`);
    },
  });

  // Handlers
  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من الترتيب المنطقي
    const pageSections = sections.filter((s) => s.pageId === formData.pageId);
    const newSection: Section = {
      id: 0,
      pageId: formData.pageId,
      name: formData.name,
      titleAr: formData.titleAr,
      titleEn: formData.titleEn,
      subtitleAr: formData.subtitleAr,
      subtitleEn: formData.subtitleEn,
      type: formData.type,
      settings: formData.settings,
      status: formData.status,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
      publishedAt: formData.publishedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validation = validateSectionOrder([...pageSections, newSection]);
    if (!validation.isValid) {
      toast.error(`خطأ في الترتيب: ${validation.errors.join(', ')}`);
      return;
    }
    if (validation.warnings.length > 0) {
      toast.warning(`تحذيرات: ${validation.warnings.join(', ')}`);
    }

    createMutation.mutate({
      pageId: formData.pageId,
      name: formData.name,
      titleAr: formData.titleAr || undefined,
      titleEn: formData.titleEn || undefined,
      subtitleAr: formData.subtitleAr || undefined,
      subtitleEn: formData.subtitleEn || undefined,
      type: formData.type,
      settings: formData.settings || undefined,
      status: formData.status,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
      publishedAt: formData.publishedAt || undefined,
    });
  };

  const handleEditSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) {
      return;
    }

    // التحقق من الترتيب المنطقي
    const pageSections = sections.filter(
      (s) => s.pageId === formData.pageId && s.id !== selectedSection.id
    );
    const updatedSection: Section = {
      ...selectedSection,
      pageId: formData.pageId,
      name: formData.name,
      titleAr: formData.titleAr,
      titleEn: formData.titleEn,
      subtitleAr: formData.subtitleAr,
      subtitleEn: formData.subtitleEn,
      type: formData.type,
      settings: formData.settings,
      status: formData.status,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
      publishedAt: formData.publishedAt,
    };

    const validation = validateSectionOrder([...pageSections, updatedSection]);
    if (!validation.isValid) {
      toast.error(`خطأ في الترتيب: ${validation.errors.join(', ')}`);
      return;
    }
    if (validation.warnings.length > 0) {
      toast.warning(`تحذيرات: ${validation.warnings.join(', ')}`);
    }

    updateMutation.mutate({
      id: selectedSection.id,
      pageId: formData.pageId,
      name: formData.name,
      titleAr: formData.titleAr || undefined,
      titleEn: formData.titleEn || undefined,
      subtitleAr: formData.subtitleAr || undefined,
      subtitleEn: formData.subtitleEn || undefined,
      type: formData.type,
      settings: formData.settings || undefined,
      status: formData.status,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
      publishedAt: formData.publishedAt || undefined,
    });
  };

  const handleDeleteSection = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDuplicateSection = (id: number) => {
    duplicateMutation.mutate({ id });
  };

  const handleReorderSections = (reorderedSections: { id: number; sortOrder: number }[]) => {
    reorderMutation.mutate({ sections: reorderedSections });
  };

  const openEditDialog = (section: Section) => {
    setSelectedSection(section);
    setFormData({
      pageId: section.pageId,
      name: section.name,
      titleAr: section.titleAr || null,
      titleEn: section.titleEn || null,
      subtitleAr: section.subtitleAr || null,
      subtitleEn: section.subtitleEn || null,
      type: section.type,
      settings: section.settings || null,
      status: section.status,
      sortOrder: section.sortOrder,
      isActive: section.isActive,
      publishedAt: section.publishedAt,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialSectionFormData);
    setSelectedSection(null);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedSection,
    formData,
    searchQuery,
    pageId,
    type,
    isActive,
    page,
    sections,
    pagination,
    pages,
    loadingSections,
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation,
    duplicateMutation,

    // Setters
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setSelectedSection,
    setFormData,
    setSearchQuery,
    setPageId,
    setType,
    setIsActive,
    setPage,

    // Handlers
    handleCreateSection,
    handleEditSection,
    handleDeleteSection,
    handleDuplicateSection,
    handleReorderSections,
    openEditDialog,
    resetForm,

    // Refetch
    refetch,
  };
}
