/**
 * useSEO - Custom Hook لإدارة إعدادات SEO
 * Hook مخصص لإدارة إعدادات SEO
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import type { SEOSettings, SEOSettingsFormData } from '../types/content.types';
import { initialSEOSettingsFormData } from '../types/content.types';

/**
 * useSEO - Hook لإدارة إعدادات SEO
 */
export function useSEO() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSEOSettings, setSelectedSEOSettings] = useState<SEOSettings | null>(null);
  const [formData, setFormData] = useState<SEOSettingsFormData>(initialSEOSettingsFormData);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('all');
  const [isActive, setIsActive] = useState('all');

  // Query
  const {
    data: seoSettings,
    isLoading: loadingSEOSettings,
    refetch,
  } = trpc.content.seoSettings.list.useQuery({
    language: language !== 'all' ? language : undefined,
    isActive: isActive !== 'all' ? (isActive as 'yes' | 'no') : undefined,
    search: searchQuery || undefined,
  });

  // Mutations
  const createMutation = trpc.content.seoSettings.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء إعدادات SEO بنجاح');
      setIsCreateDialogOpen(false);
      setFormData(initialSEOSettingsFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل إنشاء إعدادات SEO: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.seoSettings.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث إعدادات SEO بنجاح');
      setIsEditDialogOpen(false);
      setSelectedSEOSettings(null);
      setFormData(initialSEOSettingsFormData);
      refetch();
    },
    onError: (error) => {
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

  // Handlers
  const handleCreateSEOSettings = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      pageKey: formData.pageKey,
      pageId: formData.pageId,
      slug: formData.slug || undefined,
      language: formData.language,
      title: formData.title || undefined,
      description: formData.description || undefined,
      keywords: formData.keywords || undefined,
      ogTitle: formData.ogTitle || undefined,
      ogDescription: formData.ogDescription || undefined,
      ogImage: formData.ogImage || undefined,
      canonicalUrl: formData.canonicalUrl || undefined,
      robots: formData.robots || undefined,
      structuredData: formData.structuredData || undefined,
      isActive: formData.isActive,
    });
  };

  const handleEditSEOSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSEOSettings) {
      return;
    }

    updateMutation.mutate({
      id: selectedSEOSettings.id,
      pageKey: formData.pageKey,
      pageId: formData.pageId,
      slug: formData.slug || undefined,
      language: formData.language,
      title: formData.title || undefined,
      description: formData.description || undefined,
      keywords: formData.keywords || undefined,
      ogTitle: formData.ogTitle || undefined,
      ogDescription: formData.ogDescription || undefined,
      ogImage: formData.ogImage || undefined,
      canonicalUrl: formData.canonicalUrl || undefined,
      robots: formData.robots || undefined,
      structuredData: formData.structuredData || undefined,
      isActive: formData.isActive,
    });
  };

  const handleDeleteSEOSettings = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذه الإعدادات؟')) {
      deleteMutation.mutate({ id });
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
    searchQuery,
    language,
    isActive,
    seoSettings,
    loadingSEOSettings,
    createMutation,
    updateMutation,
    deleteMutation,

    // Setters
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setSelectedSEOSettings,
    setFormData,
    setSearchQuery,
    setLanguage,
    setIsActive,

    // Handlers
    handleCreateSEOSettings,
    handleEditSEOSettings,
    handleDeleteSEOSettings,
    openEditDialog,
    resetForm,

    // Refetch
    refetch,
  };
}
