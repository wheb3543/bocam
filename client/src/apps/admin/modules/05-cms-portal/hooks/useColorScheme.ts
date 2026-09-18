/**
 * useColorScheme - Custom Hook لإدارة نظام الألوان
 * Hook مخصص لإدارة نظام الألوان
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import type { ColorScheme, ColorSchemeFormData } from '../types/content.types';
import { initialColorSchemeFormData } from '../types/content.types';

/**
 * useColorScheme - Hook لإدارة نظام الألوان
 */
export function useColorScheme() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme | null>(null);
  const [formData, setFormData] = useState<ColorSchemeFormData>(initialColorSchemeFormData);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState('all');
  const [shade, setShade] = useState('all');
  const [isActive, setIsActive] = useState('all');

  // Query
  const {
    data: colorSchemes,
    isLoading: loadingColorSchemes,
    refetch,
  } = trpc.content.colorScheme.list.useQuery({
    type: type !== 'all' ? type : undefined,
    shade: shade !== 'all' ? shade : undefined,
    isActive: isActive !== 'all' ? (isActive as 'yes' | 'no') : undefined,
    search: searchQuery || undefined,
  });

  // Mutations
  const createMutation = trpc.content.colorScheme.create.useMutation({
    onSuccess: () => {
      toast.success('تم إضافة اللون بنجاح');
      setIsCreateDialogOpen(false);
      setFormData(initialColorSchemeFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل إضافة اللون: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.colorScheme.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث اللون بنجاح');
      setIsEditDialogOpen(false);
      setSelectedColorScheme(null);
      setFormData(initialColorSchemeFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل تحديث اللون: ${error.message}`);
    },
  });

  const deleteMutation = trpc.content.colorScheme.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف اللون بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل حذف اللون: ${error.message}`);
    },
  });

  // Handlers
  const handleCreateColorScheme = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      key: formData.key,
      value: formData.value,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: formData.type as any,
      shade: formData.shade || undefined,
      isActive: formData.isActive,
    });
  };

  const handleEditColorScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColorScheme) {
      return;
    }

    updateMutation.mutate({
      id: selectedColorScheme.id,
      key: formData.key,
      value: formData.value,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: formData.type as any,
      shade: formData.shade || undefined,
      isActive: formData.isActive,
    });
  };

  const handleDeleteColorScheme = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذا اللون؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const openEditDialog = (colorScheme: ColorScheme) => {
    setSelectedColorScheme(colorScheme);
    setFormData({
      key: colorScheme.key,
      value: colorScheme.value,
      type: colorScheme.type || 'primary',
      shade: colorScheme.shade || '',
      isActive: colorScheme.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialColorSchemeFormData);
    setSelectedColorScheme(null);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedColorScheme,
    formData,
    searchQuery,
    type,
    shade,
    isActive,
    colorSchemes,
    loadingColorSchemes,
    createMutation,
    updateMutation,
    deleteMutation,

    // Setters
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setSelectedColorScheme,
    setFormData,
    setSearchQuery,
    setType,
    setShade,
    setIsActive,

    // Handlers
    handleCreateColorScheme,
    handleEditColorScheme,
    handleDeleteColorScheme,
    openEditDialog,
    resetForm,

    // Refetch
    refetch,
  };
}
