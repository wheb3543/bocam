/**
 * useDoctorManagement - Custom hook لإدارة الأطباء
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { useSlugGenerator } from '@/hooks/data/useSlugGenerator';
import type { Doctor, DoctorFormData } from '../types/doctor.types';
import { initialFormData } from '../types/doctor.types';
import { calculateDoctorStats } from '../utils/doctorHelpers';

export function useDoctorManagement() {
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');

  // Slug auto-generation hook
  const { autoGenerateSlug, resetManualEdit } = useSlugGenerator(
    (slug) => setFormData((prev) => ({ ...prev, slug })),
    { isEditing: !!editingDoctor }
  );

  // Queries
  const { data: doctors, isLoading, refetch } = trpc.doctors.list.useQuery();

  // Stats
  const doctorStats = useMemo(() => calculateDoctorStats(doctors), [doctors]);

  // Mutations
  const createMutation = trpc.doctors.create.useMutation({
    onSuccess: () => {
      toast.success('تم إضافة الطبيب بنجاح');
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء إضافة الطبيب');
    },
  });

  const updateMutation = trpc.doctors.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث بيانات الطبيب بنجاح');
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث البيانات');
    },
  });

  const deleteMutation = trpc.doctors.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الطبيب بنجاح');
      refetch();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء حذف الطبيب');
    },
  });

  const toggleAvailabilityMutation = trpc.doctors.toggleAvailability.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث حالة التوفر بنجاح');
      refetch();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
  });

  // Handlers
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingDoctor(null);
    resetManualEdit();
  };

  const handleDuplicate = (doctor: Doctor) => {
    setEditingDoctor(null);
    setFormData({
      name: (doctor.name || '') + ' (نسخة)',
      slug: (doctor.slug || '') + '-copy',
      specialty: doctor.specialty || '',
      image: doctor.image || '',
      bio: doctor.bio || '',
      experience: doctor.experience || '',
      languages: doctor.languages || '',
      consultationFee: doctor.consultationFee || '',
      procedures: doctor.procedures || '',
      isVisiting: (doctor.isVisiting as 'yes' | 'no') || 'no',
      available: 'yes',
    });
    setDialogOpen(true);
  };

  const handleOpenDialog = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name || '',
        slug: doctor.slug || '',
        specialty: doctor.specialty || '',
        image: doctor.image || '',
        bio: doctor.bio || '',
        experience: doctor.experience || '',
        languages: doctor.languages || '',
        consultationFee: doctor.consultationFee || '',
        procedures: doctor.procedures || '',
        isVisiting: (doctor.isVisiting as 'yes' | 'no') || 'no',
        available: (doctor.available as 'yes' | 'no') || 'yes',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.slug || !formData.specialty) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (editingDoctor) {
      updateMutation.mutate({
        id: editingDoctor.id ?? 0,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleAvailability = (doctor: Doctor) => {
    const newAvailability = doctor.available === 'yes' ? 'no' : 'yes';
    toggleAvailabilityMutation.mutate({
      id: doctor.id ?? 0,
      available: newAvailability,
    });
  };

  return {
    // State
    dialogOpen,
    editingDoctor,
    formData,
    searchTerm,
    doctors,
    isLoading,
    doctorStats,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleAvailabilityMutation,

    // Setters
    setDialogOpen,
    setFormData,
    setSearchTerm,
    setEditingDoctor,

    // Handlers
    resetForm,
    handleDuplicate,
    handleOpenDialog,
    handleSubmit,
    handleToggleAvailability,
    autoGenerateSlug,

    // Refetch
    refetch,
  };
}
