/**
 * useUsers - Custom hook لإدارة المستخدمين
 * يتولى جلب المستخدمين، الفلترة، والعمليات
 */

import { useMemo } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import type { RouterInputs } from '@/types/trpc';
import type { User, UserFormData } from '../types/user.types';
import { roleLabels } from '../types/user.types';

interface UseUsersProps {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  userTable: ReturnType<typeof import('@/hooks/table/useTableFeatures').useTableFeatures>;
}

export function useUsers({ searchQuery, roleFilter, statusFilter, userTable }: UseUsersProps) {
  const { data: users, isLoading, refetch } = trpc.users.getAll.useQuery();
  const { data: accessRequests, refetch: refetchRequests } = trpc.accessRequests.pending.useQuery();

  const approveMutation = trpc.accessRequests.approve.useMutation({
    onSuccess: () => {
      toast.success('تمت الموافقة على الطلب بنجاح');
      refetchRequests();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء معالجة الطلب');
    },
  });

  const rejectMutation = trpc.accessRequests.reject.useMutation({
    onSuccess: () => {
      toast.success('تم رفض الطلب');
      refetchRequests();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء معالجة الطلب');
    },
  });

  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء المستخدم بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل إنشاء المستخدم');
    },
  });

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث المستخدم بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تحديث المستخدم');
    },
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف المستخدم بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل حذف المستخدم');
    },
  });

  const toggleActiveMutation = trpc.users.toggleActive.useMutation({
    onSuccess: (data) => {
      toast.success(data.newStatus === 'yes' ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تغيير حالة المستخدم');
    },
  });

  const handleSubmit = (formData: UserFormData, editingUser: User | null) => {
    if (editingUser) {
      const updateData: RouterInputs['users']['update'] = {
        id: editingUser.id,
        name: formData.name.trim() ? formData.name.trim() : undefined,
        email: formData.email.trim() ? formData.email.trim() : undefined,
        role: formData.role,
        isActive: formData.isActive,
        ...(formData.password.trim() ? { password: formData.password } : {}),
      };
      updateMutation.mutate(updateData);
    } else {
      const createData: RouterInputs['users']['create'] = {
        username: formData.username.trim(),
        name: formData.name.trim() ? formData.name.trim() : undefined,
        email: formData.email.trim() ? formData.email.trim() : undefined,
        role: formData.role,
        isActive: formData.isActive,
        ...(formData.password.trim() ? { password: formData.password } : {}),
      };
      createMutation.mutate(createData);
    }
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!users) {return [];}

    const filtered = users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.isActive === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Apply sorting using useTableFeatures
    return userTable.sortData(filtered, (item: User, key: string) => {
      switch (key) {
        case 'user':
          return item.name || item.username;
        case 'email':
          return item.email;
        case 'role':
          return roleLabels[item.role] || item.role;
        case 'status':
          return item.isActive === 'yes' ? 'نشط' : 'معطل';
        case 'lastSignedIn':
          return item.lastSignedIn;
        case 'createdAt':
          return item.createdAt;
        default:
          return undefined;
      }
    });
  }, [users, searchQuery, roleFilter, statusFilter, userTable]);

  // Calculate statistics
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const activeUsers = Array.isArray(users) ? users.filter((u) => u.isActive === 'yes').length : 0;
  const adminUsers = Array.isArray(users) ? users.filter((u) => u.role === 'admin').length : 0;

  return {
    users,
    accessRequests,
    filteredUsers,
    isLoading,
    totalUsers,
    activeUsers,
    adminUsers,
    refetch,
    refetchRequests,
    approveMutation,
    rejectMutation,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleActiveMutation,
    handleSubmit,
  };
}
