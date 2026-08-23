/**
 * useSEO - Custom Hook لإدارة إعدادات SEO
 * Hook مخصص لإدارة إعدادات SEO
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import type { SEOSettings, SEOSettingsFormData } from '../types/content.types';
import { initialSEOSettingsFormData } from '../types/content.types';
import { getPublicationQualityIssues } from '../utils/publicationQuality';

function toSeoPayload(formData: SEOSettingsFormData) {
  return {
    pageKey: formData.pageKey.trim() || null,
    pageId: formData.pageId ?? null,
    slug: formData.slug.trim() || null,
    language: formData.language,
    title: formData.title.trim() || null,
    description: formData.description.trim() || null,
    keywords: formData.keywords.trim() || null,
    ogTitle: formData.ogTitle.trim() || null,
    ogDescription: formData.ogDescription.trim() || null,
    ogImage: formData.ogImage.trim() || null,
    canonicalUrl: formData.canonicalUrl.trim() || null,
    robots: formData.robots.trim() || null,
    structuredData: formData.structuredData.trim() || null,
    isActive: formData.isActive,
    status: formData.status,
    publishedAt: formData.publishedAt,
    qualityOverrideReason: formData.qualityOverrideReason.trim() || undefined,
  };
}

/**
 * useSEO - Hook لإدارة إعدادات SEO
 */
export function useSEO() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSEOSettings, setSelectedSEOSettings] = useState<SEOSettings | null>(null);
  const [formData, setFormData] = useState<SEOSettingsFormData>(initialSEOSettingsFormData);
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('all');
  const [isActive, setIsActive] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SEOSettings['status']>('all');
  const [showDeleted, setShowDeleted] = useState(false);

  // Query
  const {
    data: seoSettings,
    isLoading: loadingSEOSettings,
    refetch,
  } = trpc.content.seoSettings.list.useQuery({
    language: language !== 'all' ? language : undefined,
    isActive: isActive !== 'all' ? (isActive as 'yes' | 'no') : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    includeDeleted: showDeleted,
    search: searchQuery || undefined,
  });

  // Mutations
  const createMutation = trpc.content.seoSettings.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء إعدادات SEO بنجاح');
      setQualityIssues([]);
      setIsCreateDialogOpen(false);
      setFormData(initialSEOSettingsFormData);
      refetch();
    },
    onError: (error) => {
      const issues = getPublicationQualityIssues(error);
      if (issues.length > 0) {
        setQualityIssues(issues);
        toast.error('تعذر نشر إعداد SEO. راجع أخطاء الجودة في النموذج.');
        return;
      }
      toast.error(`فشل إنشاء إعدادات SEO: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.seoSettings.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث إعدادات SEO بنجاح');
      setQualityIssues([]);
      setIsEditDialogOpen(false);
      setSelectedSEOSettings(null);
      setFormData(initialSEOSettingsFormData);
      refetch();
    },
    onError: (error) => {
      const issues = getPublicationQualityIssues(error);
      if (issues.length > 0) {
        setQualityIssues(issues);
        toast.error('تعذر نشر إعداد SEO. راجع أخطاء الجودة في النموذج.');
        return;
      }
      toast.error(`فشل تحديث إعدادات SEO: ${error.message}`);
    },
  });

  const deleteMutation = trpc.content.seoSettings.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف إعدادات SEO بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل حذف إعدادات SEO: ${error.message}`);
    },
  });

  const publishMutation = trpc.content.seoSettings.publish.useMutation({
    onSuccess: () => {
      toast.success('تم نشر إعداد SEO بنجاح.');
      refetch();
    },
    onError: (error) => toast.error(`تعذر نشر إعداد SEO: ${error.message}`),
  });

  const archiveMutation = trpc.content.seoSettings.archive.useMutation({
    onSuccess: () => {
      toast.success('تمت أرشفة إعداد SEO.');
      refetch();
    },
    onError: (error) => toast.error(`تعذرت أرشفة إعداد SEO: ${error.message}`),
  });

  const restoreMutation = trpc.content.seoSettings.restore.useMutation({
    onSuccess: () => {
      toast.success('تمت استعادة إعداد SEO كمسودة.');
      refetch();
    },
    onError: (error) => toast.error(`تعذرت استعادة إعداد SEO: ${error.message}`),
  });

  // Handlers
  const handleCreateSEOSettings = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(toSeoPayload(formData));
  };

  const handleEditSEOSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSEOSettings) {
      return;
    }

    updateMutation.mutate({ id: selectedSEOSettings.id, ...toSeoPayload(formData) });
  };

  const handleDeleteSEOSettings = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذه الإعدادات؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleRestoreSEOSettings = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('سيُستعاد إعداد SEO كمسودة غير منشورة. هل تريد المتابعة؟')) {
      restoreMutation.mutate({ id });
    }
  };

  const openEditDialog = (seoSetting: SEOSettings) => {
    setSelectedSEOSettings(seoSetting);
    setFormData({
      pageKey: seoSetting.pageKey || '',
      pageId: seoSetting.pageId || undefined,
      slug: seoSetting.slug || '',
      language: seoSetting.language || 'ar',
      title: seoSetting.title || '',
      description: seoSetting.description || '',
      keywords: seoSetting.keywords || '',
      ogTitle: seoSetting.ogTitle || '',
      ogDescription: seoSetting.ogDescription || '',
      ogImage: seoSetting.ogImage || '',
      canonicalUrl: seoSetting.canonicalUrl || '',
      robots: seoSetting.robots || '',
      structuredData: seoSetting.structuredData || '',
      isActive: seoSetting.isActive,
      status: seoSetting.status,
      publishedAt: seoSetting.publishedAt,
      qualityOverrideReason: '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialSEOSettingsFormData);
    setSelectedSEOSettings(null);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedSEOSettings,
    formData,
    qualityIssues,
    isAdmin,
    searchQuery,
    language,
    isActive,
    statusFilter,
    showDeleted,
    seoSettings,
    loadingSEOSettings,
    createMutation,
    updateMutation,
    deleteMutation,
    publishMutation,
    archiveMutation,
    restoreMutation,

    // Setters
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setSelectedSEOSettings,
    setFormData,
    setSearchQuery,
    setLanguage,
    setIsActive,
    setStatusFilter,
    setShowDeleted,

    // Handlers
    handleCreateSEOSettings,
    handleEditSEOSettings,
    handleDeleteSEOSettings,
    handlePublishSEOSettings: (id: number, qualityOverrideReason?: string) =>
      publishMutation.mutate({ id, qualityOverrideReason }),
    handleArchiveSEOSettings: (id: number) => archiveMutation.mutate({ id }),
    handleRestoreSEOSettings,
    openEditDialog,
    resetForm,
    clearQualityIssues: () => setQualityIssues([]),

    // Refetch
    refetch,
  };
}
