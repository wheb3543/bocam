/**
 * useSectionButtons - Custom Hook لإدارة أزرار الأقسام
 * Hook مخصص لإدارة أزرار الأقسام
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';

export type ButtonStyle = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface SectionButton {
  id: number;
  sectionId: number;
  textAr: string;
  textEn: string;
  link: string;
  style: ButtonStyle;
  sortOrder: number;
  isActive: 'yes' | 'no';
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
}

export const initialSectionButtonFormData: SectionButtonFormData = {
  sectionId: 0,
  textAr: '',
  textEn: '',
  link: '',
  style: 'primary',
  sortOrder: 0,
  isActive: 'yes',
};

/**
 * دالة التحقق من صحة الرابط
 */
const validateLink = (link: string): { isValid: boolean; error?: string } => {
  if (!link || link.trim() === '') {
    return { isValid: false, error: 'الرابط مطلوب' };
  }

  try {
    // التحقق من صحة تنسيق الرابط
    const url = new URL(link);

    // التحقق من أن البروتوكول مدعوم
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      return { isValid: false, error: 'بروتوكول الرابط غير مدعوم' };
    }

    // التحقق من أن الرابط ليس فارغاً
    if (!url.hostname && url.protocol !== 'mailto:' && url.protocol !== 'tel:') {
      return { isValid: false, error: 'الرابط غير صالح' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'تنسيق الرابط غير صالح' };
  }
};

/**
 * useSectionButtons - Hook لإدارة أزرار الأقسام
 */
export function useSectionButtons() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState<SectionButton | null>(null);
  const [formData, setFormData] = useState<SectionButtonFormData>(initialSectionButtonFormData);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [style, setStyle] = useState<string>('all');
  const [isActive, setIsActive] = useState<'all' | 'yes' | 'no'>('all');

  // Query
  const {
    data: sectionButtons,
    isLoading: loadingSectionButtons,
    refetch,
  } = trpc.content.sectionButtons.list.useQuery({
    sectionId,
    style: style !== 'all' ? (style as ButtonStyle) : undefined,
    isActive: isActive !== 'all' ? (isActive as 'yes' | 'no') : undefined,
    search: searchQuery || undefined,
  });

  // Query for sections (for section selection)
  const { data: sections } = trpc.content.sections.list.useQuery({});

  // Mutations
  const createMutation = trpc.content.sectionButtons.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء الزر بنجاح');
      setIsCreateDialogOpen(false);
      setFormData(initialSectionButtonFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل إنشاء الزر: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.sectionButtons.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الزر بنجاح');
      setIsEditDialogOpen(false);
      setSelectedButton(null);
      setFormData(initialSectionButtonFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل تحديث الزر: ${error.message}`);
    },
  });

  const deleteMutation = trpc.content.sectionButtons.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الزر بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل حذف الزر: ${error.message}`);
    },
  });

  const reorderMutation = trpc.content.sectionButtons.reorder.useMutation({
    onSuccess: () => {
      toast.success('تم إعادة ترتيب الأزرار بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل إعادة ترتيب الأزرار: ${error.message}`);
    },
  });

  // Handlers
  const handleCreateButton = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة الرابط
    const linkValidation = validateLink(formData.link);
    if (!linkValidation.isValid) {
      toast.error(linkValidation.error);
      return;
    }

    createMutation.mutate({
      sectionId: formData.sectionId,
      textAr: formData.textAr,
      textEn: formData.textEn,
      link: formData.link,
      style: formData.style,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    });
  };

  const handleEditButton = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedButton) {
      return;
    }

    // التحقق من صحة الرابط
    const linkValidation = validateLink(formData.link);
    if (!linkValidation.isValid) {
      toast.error(linkValidation.error);
      return;
    }

    updateMutation.mutate({
      id: selectedButton.id,
      sectionId: formData.sectionId,
      textAr: formData.textAr,
      textEn: formData.textEn,
      link: formData.link,
      style: formData.style,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    });
  };

  const handleDeleteButton = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذا الزر؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleReorderButtons = (reorderedButtons: { id: number; sortOrder: number }[]) => {
    reorderMutation.mutate({ buttons: reorderedButtons });
  };

  const openEditDialog = (button: SectionButton) => {
    setSelectedButton(button);
    setFormData({
      sectionId: button.sectionId,
      textAr: button.textAr,
      textEn: button.textEn,
      link: button.link,
      style: button.style,
      sortOrder: button.sortOrder,
      isActive: button.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialSectionButtonFormData);
    setSelectedButton(null);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedButton,
    formData,
    searchQuery,
    sectionId,
    style,
    isActive,
    sectionButtons,
    sections,
    loadingSectionButtons,
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation,

    // Setters
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setSelectedButton,
    setFormData,
    setSearchQuery,
    setSectionId,
    setStyle,
    setIsActive,

    // Handlers
    handleCreateButton,
    handleEditButton,
    handleDeleteButton,
    handleReorderButtons,
    openEditDialog,
    resetForm,

    // Refetch
    refetch,
  };
}
