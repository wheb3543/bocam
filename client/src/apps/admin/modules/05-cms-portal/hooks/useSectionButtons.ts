/**
 * useSectionButtons - دورة إدارة أزرار الأقسام ضمن CMS.
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { getPublicationQualityIssues } from '../utils/publicationQuality';

export type ButtonStyle = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonStatus = 'draft' | 'published' | 'archived';

export interface SectionButton {
  id: number;
  sectionId: number;
  textAr: string;
  textEn: string;
  link: string;
  style: ButtonStyle;
  sortOrder: number;
  isActive: 'yes' | 'no';
  status: ButtonStatus;
  publishedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionButtonFormData {
  sectionId: number;
  textAr: string;
  textEn: string;
  link: string;
  style: ButtonStyle;
  sortOrder: number;
  isActive: 'yes' | 'no';
  status: ButtonStatus;
  publishedAt: Date | null;
  qualityOverrideReason: string;
}

export const initialSectionButtonFormData: SectionButtonFormData = {
  sectionId: 0,
  textAr: '',
  textEn: '',
  link: '',
  style: 'primary',
  sortOrder: 0,
  isActive: 'yes',
  status: 'draft',
  publishedAt: null,
  qualityOverrideReason: '',
};

function validateLink(link: string): { isValid: boolean; error?: string } {
  const normalized = link.trim();
  if (!normalized) {
    return { isValid: false, error: 'الرابط مطلوب' };
  }
  if (/^(javascript|data):/i.test(normalized)) {
    return { isValid: false, error: 'بروتوكول الرابط غير مسموح' };
  }
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    normalized.startsWith('mailto:') ||
    normalized.startsWith('tel:')
  ) {
    return { isValid: true };
  }
  try {
    const url = new URL(normalized);
    return ['http:', 'https:'].includes(url.protocol)
      ? { isValid: true }
      : { isValid: false, error: 'بروتوكول الرابط غير مدعوم' };
  } catch {
    return { isValid: false, error: 'تنسيق الرابط غير صالح' };
  }
}

export function useSectionButtons() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState<SectionButton | null>(null);
  const [formData, setFormData] = useState<SectionButtonFormData>(initialSectionButtonFormData);
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [style, setStyle] = useState<string>('all');
  const [status, setStatus] = useState<'all' | ButtonStatus>('all');
  const [isActive, setIsActive] = useState<'all' | 'yes' | 'no'>('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    data: sectionButtons = [],
    isLoading: loadingSectionButtons,
    refetch,
  } = trpc.content.sectionButtons.list.useQuery({
    sectionId,
    style: style !== 'all' ? (style as ButtonStyle) : undefined,
    status: status !== 'all' ? status : undefined,
    isActive: isActive !== 'all' ? isActive : undefined,
    includeDeleted: showDeleted,
    search: searchQuery || undefined,
  });
  const { data: sectionsData } = trpc.content.sections.list.useQuery({});
  const sections = Array.isArray(sectionsData)
    ? sectionsData
    : ((sectionsData as { data?: Array<{ id: number; name: string }> } | undefined)?.data ?? []);

  const handleQualityError = (error: unknown, fallback: string) => {
    const issues = getPublicationQualityIssues(error);
    if (issues.length > 0) {
      setQualityIssues(issues);
      toast.error('تعذر النشر. راجع أخطاء الجودة الظاهرة في النموذج.');
      return;
    }
    const message = error instanceof Error ? error.message : fallback;
    toast.error(message);
  };

  const createMutation = trpc.content.sectionButtons.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء الزر بنجاح');
      setQualityIssues([]);
      setIsCreateDialogOpen(false);
      setFormData(initialSectionButtonFormData);
      refetch();
    },
    onError: (error) => handleQualityError(error, 'فشل إنشاء الزر'),
  });
  const updateMutation = trpc.content.sectionButtons.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الزر بنجاح');
      setQualityIssues([]);
      setIsEditDialogOpen(false);
      setSelectedButton(null);
      setFormData(initialSectionButtonFormData);
      refetch();
    },
    onError: (error) => handleQualityError(error, 'فشل تحديث الزر'),
  });
  const deleteMutation = trpc.content.sectionButtons.delete.useMutation({
    onSuccess: () => {
      toast.success('تم نقل الزر إلى المحذوفات');
      refetch();
    },
    onError: (error) => handleQualityError(error, 'فشل حذف الزر'),
  });
  const archiveMutation = trpc.content.sectionButtons.archive.useMutation({
    onSuccess: () => {
      toast.success('تمت أرشفة الزر');
      refetch();
    },
    onError: (error) => handleQualityError(error, 'فشل أرشفة الزر'),
  });
  const restoreMutation = trpc.content.sectionButtons.restore.useMutation({
    onSuccess: () => {
      toast.success('تمت استعادة الزر كمسودة');
      refetch();
    },
    onError: (error) => handleQualityError(error, 'فشل استعادة الزر'),
  });
  const duplicateMutation = trpc.content.sectionButtons.duplicate.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء نسخة مسودة من الزر');
      refetch();
    },
    onError: (error) => handleQualityError(error, 'فشل نسخ الزر'),
  });
  const reorderMutation = trpc.content.sectionButtons.reorder.useMutation({
    onSuccess: () => {
      toast.success('تم إعادة ترتيب الأزرار بنجاح');
      refetch();
    },
    onError: (error) => handleQualityError(error, 'فشل إعادة ترتيب الأزرار'),
  });

  const toMutationInput = () => ({
    sectionId: formData.sectionId,
    textAr: formData.textAr,
    textEn: formData.textEn,
    link: formData.link.trim(),
    style: formData.style,
    sortOrder: formData.sortOrder,
    isActive: formData.isActive,
    status: formData.status,
    publishedAt: formData.publishedAt || undefined,
    qualityOverrideReason: formData.qualityOverrideReason.trim() || undefined,
  });

  const handleCreateButton = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateLink(formData.link);
    if (!validation.isValid) {
      return toast.error(validation.error);
    }
    createMutation.mutate(toMutationInput());
  };
  const handleEditButton = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedButton) {
      return;
    }
    const validation = validateLink(formData.link);
    if (!validation.isValid) {
      return toast.error(validation.error);
    }
    updateMutation.mutate({ id: selectedButton.id, ...toMutationInput() });
  };
  const handleDeleteButton = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من نقل هذا الزر إلى المحذوفات؟')) {
      deleteMutation.mutate({ id });
    }
  };
  const handleArchiveButton = (id: number) => archiveMutation.mutate({ id });
  const handleRestoreButton = (id: number) => restoreMutation.mutate({ id });
  const handleDuplicateButton = (id: number) => duplicateMutation.mutate({ id });
  const handleReorderButtons = (buttons: { id: number; sortOrder: number }[]) =>
    reorderMutation.mutate({ buttons });

  const openEditDialog = (button: SectionButton) => {
    setSelectedButton(button);
    setQualityIssues([]);
    setFormData({
      sectionId: button.sectionId,
      textAr: button.textAr,
      textEn: button.textEn,
      link: button.link,
      style: button.style,
      sortOrder: button.sortOrder,
      isActive: button.isActive,
      status: button.status,
      publishedAt: button.publishedAt || null,
      qualityOverrideReason: '',
    });
    setIsEditDialogOpen(true);
  };
  const resetForm = () => {
    setFormData(initialSectionButtonFormData);
    setSelectedButton(null);
    setQualityIssues([]);
  };

  return {
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedButton,
    formData,
    qualityIssues,
    isAdmin,
    searchQuery,
    sectionId,
    style,
    status,
    isActive,
    showDeleted,
    sectionButtons: sectionButtons as SectionButton[],
    sections,
    loadingSectionButtons,
    createMutation,
    updateMutation,
    deleteMutation,
    archiveMutation,
    restoreMutation,
    duplicateMutation,
    reorderMutation,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setSelectedButton,
    setFormData,
    setSearchQuery,
    setSectionId,
    setStyle,
    setStatus,
    setIsActive,
    setShowDeleted,
    handleCreateButton,
    handleEditButton,
    handleDeleteButton,
    handleArchiveButton,
    handleRestoreButton,
    handleDuplicateButton,
    handleReorderButtons,
    openEditDialog,
    resetForm,
    clearQualityIssues: () => setQualityIssues([]),
    refetch,
  };
}
