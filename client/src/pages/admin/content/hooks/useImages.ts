/**
 * useImages - Custom Hook لإدارة الصور
 * Hook مخصص لإدارة الصور
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import type { Image, ImageFormData } from '../types/content.types';
import { initialImageFormData } from '../types/content.types';
import { getPublicationQualityIssues } from '../utils/publicationQuality';

/**
 * useImages - Hook لإدارة الصور
 */
export function useImages() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [formData, setFormData] = useState<ImageFormData>(initialImageFormData);
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [section, setSection] = useState('all');
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [pageId, setPageId] = useState<number | undefined>(undefined);
  const [format, setFormat] = useState('all');
  const [isActive, setIsActive] = useState('all');

  // Query
  const {
    data: images,
    isLoading: loadingImages,
    refetch,
  } = trpc.content.images.list.useQuery({
    section: section !== 'all' ? section : undefined,
    sectionId,
    pageId,
    format: format !== 'all' ? format : undefined,
    isActive: isActive !== 'all' ? (isActive as 'yes' | 'no') : undefined,
    search: searchQuery || undefined,
  });

  // Mutations
  const createMutation = trpc.content.images.create.useMutation({
    onSuccess: () => {
      toast.success('تم إضافة الصورة بنجاح');
      setQualityIssues([]);
      setIsCreateDialogOpen(false);
      setFormData(initialImageFormData);
      refetch();
    },
    onError: (error) => {
      const issues = getPublicationQualityIssues(error);
      if (issues.length > 0) {
        setQualityIssues(issues);
        toast.error('تعذر نشر الصورة. راجع أخطاء الجودة الظاهرة في النموذج.');
        return;
      }
      toast.error(`فشل إضافة الصورة: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.images.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الصورة بنجاح');
      setQualityIssues([]);
      setIsEditDialogOpen(false);
      setSelectedImage(null);
      setFormData(initialImageFormData);
      refetch();
    },
    onError: (error) => {
      const issues = getPublicationQualityIssues(error);
      if (issues.length > 0) {
        setQualityIssues(issues);
        toast.error('تعذر نشر الصورة. راجع أخطاء الجودة الظاهرة في النموذج.');
        return;
      }
      toast.error(`فشل تحديث الصورة: ${error.message}`);
    },
  });

  const deleteMutation = trpc.content.images.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الصورة بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل حذف الصورة: ${error.message}`);
    },
  });

  // Handlers
  const handleCreateImage = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      key: formData.key,
      url: formData.url,
      altAr: formData.altAr || formData.alt || undefined,
      altEn: formData.altEn || undefined,
      section: formData.section || undefined,
      sectionId: formData.sectionId,
      pageId: formData.pageId,
      width: formData.width ? Number(formData.width) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      format: formData.format || undefined,
      size: formData.size ? Number(formData.size) : undefined,
      status: formData.status,
      isActive: formData.isActive,
      publishedAt: formData.publishedAt || undefined,
      qualityOverrideReason: formData.qualityOverrideReason.trim() || undefined,
    });
  };

  const handleEditImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      return;
    }

    updateMutation.mutate({
      id: selectedImage.id,
      key: formData.key,
      url: formData.url,
      altAr: formData.altAr || formData.alt || undefined,
      altEn: formData.altEn || undefined,
      section: formData.section || undefined,
      sectionId: formData.sectionId,
      pageId: formData.pageId,
      width: formData.width ? Number(formData.width) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      format: formData.format || undefined,
      size: formData.size ? Number(formData.size) : undefined,
      status: formData.status,
      isActive: formData.isActive,
      publishedAt: formData.publishedAt || undefined,
      qualityOverrideReason: formData.qualityOverrideReason.trim() || undefined,
    });
  };

  const handleDeleteImage = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const openEditDialog = (image: Image) => {
    setSelectedImage(image);
    setQualityIssues([]);
    setFormData({
      key: image.key,
      url: image.url,
      altAr: image.altAr || '',
      altEn: image.altEn || '',
      alt: image.altAr || '',
      section: image.section || '',
      sectionId: image.sectionId || undefined,
      pageId: image.pageId || undefined,
      width: image.width?.toString() || '',
      height: image.height?.toString() || '',
      format: image.format || '',
      size: image.size?.toString() || '',
      status: image.status,
      isActive: image.isActive,
      publishedAt: image.publishedAt || null,
      qualityOverrideReason: '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialImageFormData);
    setSelectedImage(null);
    setQualityIssues([]);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedImage,
    formData,
    qualityIssues,
    isAdmin,
    searchQuery,
    section,
    sectionId,
    pageId,
    format,
    isActive,
    images,
    loadingImages,
    createMutation,
    updateMutation,
    deleteMutation,

    // Setters
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setSelectedImage,
    setFormData,
    setSearchQuery,
    setSection,
    setSectionId,
    setPageId,
    setFormat,
    setIsActive,

    // Handlers
    handleCreateImage,
    handleEditImage,
    handleDeleteImage,
    openEditDialog,
    resetForm,
    clearQualityIssues: () => setQualityIssues([]),

    // Refetch
    refetch,
  };
}
