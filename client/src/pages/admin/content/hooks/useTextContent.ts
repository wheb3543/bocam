/**
 * useTextContent - Custom Hook لإدارة المحتوى النصي
 * Hook مخصص لإدارة المحتوى النصي
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { emitToastHash } from '@/lib/toastHashRouter';
import { useAuth } from '@/_core/hooks/useAuth';
import type { TextContent, TextContentFormData } from '../types/content.types';
import { initialTextContentFormData } from '../types/content.types';
import { getContentListData, getContentListPagination } from '../utils/listResponse';
import { getPublicationQualityIssues } from '../utils/publicationQuality';

/**
 * useTextContent - Hook لإدارة المحتوى النصي
 */
export function useTextContent() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTextContent, setSelectedTextContent] = useState<TextContent | null>(null);
  const [formData, setFormData] = useState<TextContentFormData>(initialTextContentFormData);
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('all');
  const [section, setSection] = useState('all');
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [pageId, setPageId] = useState<number | undefined>(undefined);
  const [type, setType] = useState('all');
  const [isActive, setIsActive] = useState('all');
  const [page, setPage] = useState(1);

  // Query
  const {
    data: textContentsData,
    isLoading: loadingTextContents,
    refetch,
  } = trpc.content.textContent.list.useQuery({
    language: language !== 'all' ? language : undefined,
    section: section !== 'all' ? section : undefined,
    sectionId,
    pageId,
    type: type !== 'all' ? type : undefined,
    isActive: isActive !== 'all' ? (isActive as 'yes' | 'no') : undefined,
    search: searchQuery || undefined,
    page,
  });

  const textContents = getContentListData<TextContent>(textContentsData);
  const pagination = getContentListPagination<TextContent>(textContentsData);

  // Mutations
  const createMutation = trpc.content.textContent.create.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم إنشاء المحتوى النصي بنجاح',
        description: 'تم حفظ محتوى الصفحة بنجاح.',
        redirect: '/admin/content/content',
      });
      setQualityIssues([]);
      setIsCreateDialogOpen(false);
      setFormData(initialTextContentFormData);
      refetch();
    },
    onError: (error) => {
      const issues = getPublicationQualityIssues(error);
      if (issues.length > 0) {
        setQualityIssues(issues);
        toast.error('تعذر النشر. راجع أخطاء الجودة الظاهرة في النموذج.');
        return;
      }
      toast.error(`فشل إنشاء المحتوى النصي: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.textContent.update.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم تحديث المحتوى النصي بنجاح',
        description: 'تم حفظ آخر تغييرات المحتوى النصي.',
        redirect: '/admin/content/content',
      });
      setQualityIssues([]);
      setIsEditDialogOpen(false);
      setSelectedTextContent(null);
      setFormData(initialTextContentFormData);
      refetch();
    },
    onError: (error) => {
      const issues = getPublicationQualityIssues(error);
      if (issues.length > 0) {
        setQualityIssues(issues);
        toast.error('تعذر النشر. راجع أخطاء الجودة الظاهرة في النموذج.');
        return;
      }
      toast.error(`فشل تحديث المحتوى النصي: ${error.message}`);
    },
  });

  const deleteMutation = trpc.content.textContent.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف المحتوى النصي بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل حذف المحتوى النصي: ${error.message}`);
    },
  });

  // Handlers
  const handleCreateTextContent = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      key: formData.key,
      language: formData.language,
      content: formData.content,
      section: formData.section || undefined,
      sectionId: formData.sectionId,
      pageId: formData.pageId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: formData.type as any,
      status: formData.status,
      isActive: formData.isActive,
      publishedAt: formData.publishedAt || undefined,
      qualityOverrideReason: formData.qualityOverrideReason.trim() || undefined,
    });
  };

  const handleEditTextContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTextContent) {
      return;
    }

    updateMutation.mutate({
      id: selectedTextContent.id,
      key: formData.key,
      language: formData.language,
      content: formData.content,
      section: formData.section || undefined,
      sectionId: formData.sectionId,
      pageId: formData.pageId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: formData.type as any,
      status: formData.status,
      isActive: formData.isActive,
      publishedAt: formData.publishedAt || undefined,
      qualityOverrideReason: formData.qualityOverrideReason.trim() || undefined,
    });
  };

  const handleDeleteTextContent = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذا المحتوى النصي؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const openEditDialog = (textContent: TextContent) => {
    setSelectedTextContent(textContent);
    setQualityIssues([]);
    setFormData({
      key: textContent.key,
      language: textContent.language,
      content: textContent.content,
      section: textContent.section || '',
      sectionId: textContent.sectionId || undefined,
      pageId: textContent.pageId || undefined,
      type: textContent.type || 'text',
      status: textContent.status || 'draft',
      isActive: textContent.isActive,
      publishedAt: textContent.publishedAt || null,
      qualityOverrideReason: '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialTextContentFormData);
    setSelectedTextContent(null);
    setQualityIssues([]);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedTextContent,
    formData,
    qualityIssues,
    isAdmin,
    searchQuery,
    language,
    section,
    sectionId,
    pageId,
    type,
    isActive,
    page,
    textContents,
    pagination,
    loadingTextContents,
    createMutation,
    updateMutation,
    deleteMutation,

    // Setters
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setSelectedTextContent,
    setFormData,
    setSearchQuery,
    setLanguage,
    setSection,
    setSectionId,
    setPageId,
    setType,
    setIsActive,
    setPage,

    // Handlers
    handleCreateTextContent,
    handleEditTextContent,
    handleDeleteTextContent,
    openEditDialog,
    resetForm,
    clearQualityIssues: () => setQualityIssues([]),

    // Refetch
    refetch,
  };
}
