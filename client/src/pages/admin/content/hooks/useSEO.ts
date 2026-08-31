/**
 * useSEO - Custom Hook لإدارة إعدادات SEO
 * Hook مخصص لإدارة إعدادات SEO
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { emitToastHash } from '@/lib/toastHashRouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import type { SEOSettings, SEOSettingsFormData } from '../types/content.types';
import { initialSEOSettingsFormData } from '../types/content.types';
import { getPublicationQualityIssues } from '../utils/publicationQuality';

function toSeoPayload(formData: SEOSettingsFormData) {
  return {
    pageKey: formData.pageKey.trim() || null,
    pageId: formData.pageId ?? null,
    slug: formData.slug || undefined,
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
  const { can, isLoading: permissionsLoading } = useRolePermissions();
  const canViewSEO = can('content.view');
  const canManageSEO = can('content.seo.manage');
  const canPublishSEO = can('content.publish');
  const canDeleteSEO = can('content.delete');
  const canRestoreSEO = can('content.restore');

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
  } = trpc.content.seoSettings.list.useQuery(
    {
      language: language !== 'all' ? language : undefined,
      isActive: isActive !== 'all' ? (isActive as 'yes' | 'no') : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      includeDeleted: showDeleted,
      search: searchQuery || undefined,
    },
    { enabled: canViewSEO }
  );
  const { data: seoOverview, refetch: refetchOverview } =
    trpc.content.seoSettings.getOverview.useQuery(undefined, { enabled: canViewSEO });
  const { data: seoReport, refetch: refetchReport } = trpc.content.seoSettings.getReport.useQuery(
    undefined,
    { enabled: canViewSEO }
  );

  const refetchSEOInsights = () => {
    refetchOverview();
    refetchReport();
  };

  // Mutations
  const createMutation = trpc.content.seoSettings.create.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم إنشاء إعدادات SEO بنجاح',
        description: 'تم حفظ إعدادات SEO وربطها بالصفحة.',
        redirect: '/admin/content/content',
      });
      setQualityIssues([]);
      setIsCreateDialogOpen(false);
      setFormData(initialSEOSettingsFormData);
      refetch();
      refetchSEOInsights();
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
      emitToastHash({
        kind: 'success',
        message: 'تم تحديث إعدادات SEO بنجاح',
        description: 'تم حفظ تغييرات إعدادات محرك البحث.',
        redirect: '/admin/content/content',
      });
      setQualityIssues([]);
      setIsEditDialogOpen(false);
      setSelectedSEOSettings(null);
      setFormData(initialSEOSettingsFormData);
      refetch();
      refetchSEOInsights();
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
      refetchSEOInsights();
    },
    onError: (error) => {
      toast.error(`فشل حذف إعدادات SEO: ${error.message}`);
    },
  });

  const publishMutation = trpc.content.seoSettings.publish.useMutation({
    onSuccess: () => {
      toast.success('تم نشر إعداد SEO بنجاح.');
      refetch();
      refetchSEOInsights();
    },
    onError: (error) => toast.error(`تعذر نشر إعداد SEO: ${error.message}`),
  });

  const archiveMutation = trpc.content.seoSettings.archive.useMutation({
    onSuccess: () => {
      toast.success('تمت أرشفة إعداد SEO.');
      refetch();
      refetchSEOInsights();
    },
    onError: (error) => toast.error(`تعذرت أرشفة إعداد SEO: ${error.message}`),
  });

  const restoreMutation = trpc.content.seoSettings.restore.useMutation({
    onSuccess: () => {
      toast.success('تمت استعادة إعداد SEO كمسودة.');
      refetch();
      refetchSEOInsights();
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

  const exportSEOReportCsv = () => {
    const escapeCsv = (value: unknown) => {
      const text = String(value ?? '');
      const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const statusLabel: Record<string, string> = {
      draft: 'مسودة',
      published: 'منشور',
      archived: 'مؤرشف',
    };
    const header = [
      'المعرف',
      'مفتاح الصفحة',
      'الرابط',
      'اللغة',
      'العنوان',
      'حالة النشر',
      'نشط',
      'محذوف',
      'ينتظر الموافقة',
      'نسبة الجودة',
      'ملاحظات الجودة',
      'تاريخ النشر',
      'آخر تحديث',
    ];
    const rows = (seoReport?.rows ?? []).map((row) => [
      row.id,
      row.pageKey,
      row.slug,
      row.language,
      row.title,
      statusLabel[row.status] ?? row.status,
      row.isActive === 'yes' ? 'نعم' : 'لا',
      row.deletedAt ? 'نعم' : 'لا',
      row.pendingApproval ? 'نعم' : 'لا',
      `${row.qualityScore}%`,
      row.qualityIssueCodes.join(' | '),
      row.publishedAt ? new Date(row.publishedAt).toLocaleString('ar-SA') : '',
      new Date(row.updatedAt).toLocaleString('ar-SA'),
    ]);
    const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-status-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`تم تصدير تقرير SEO (${rows.length} سجل).`);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedSEOSettings,
    formData,
    qualityIssues,
    isAdmin,
    permissionsLoading,
    canViewSEO,
    canManageSEO,
    canPublishSEO,
    canDeleteSEO,
    canRestoreSEO,
    searchQuery,
    language,
    isActive,
    statusFilter,
    showDeleted,
    seoSettings,
    seoOverview,
    seoReport,
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
    exportSEOReportCsv,
    clearQualityIssues: () => setQualityIssues([]),

    // Refetch
    refetch,
    refetchSEOInsights,
  };
}
