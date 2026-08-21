/**
 * useTextContent - Custom Hook لإدارة المحتوى النصي
 * Hook مخصص لإدارة المحتوى النصي
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import type { TextContent, TextContentFormData } from '../types/content.types';
import { initialTextContentFormData } from '../types/content.types';
import { getContentListData, getContentListPagination } from '../utils/listResponse';

/**
 * useTextContent - Hook لإدارة المحتوى النصي
 */
export function useTextContent() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTextContent, setSelectedTextContent] = useState<TextContent | null>(null);
  const [formData, setFormData] = useState<TextContentFormData>(initialTextContentFormData);

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
      toast.success('تم إنشاء المحتوى النصي بنجاح');
      setIsCreateDialogOpen(false);
      setFormData(initialTextContentFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل إنشاء المحتوى النصي: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.textContent.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث المحتوى النصي بنجاح');
      setIsEditDialogOpen(false);
      setSelectedTextContent(null);
      setFormData(initialTextContentFormData);
      refetch();
    },
    onError: (error) => {
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
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialTextContentFormData);
    setSelectedTextContent(null);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedTextContent,
    formData,
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

    // Refetch
    refetch,
  };
}
