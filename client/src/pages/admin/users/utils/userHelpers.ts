/**
 * User Helpers - دوال مساعدة لصفحة إدارة المستخدمين
 * دوال مساعدة للتعامل مع المستخدمين والتصدير
 */

import { formatDateUtil } from '@/hooks/export/useFormatDate';
import type { User } from '../types/user.types';
import { roleLabels } from '../types/user.types';

export const getInitials = (name: string) => {
  if (!name) {return '؟';}
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name[0];
};

export const exportToCSV = (users: User[]) => {
  const headers = [
    'اسم المستخدم',
    'الاسم الكامل',
    'البريد الإلكتروني',
    'الدور',
    'الحالة',
    'آخر تسجيل دخول',
  ];
  const rows = users.map((user) => [
    user.username,
    user.name || '-',
    user.email || '-',
    roleLabels[user.role],
    user.isActive === 'yes' ? 'نشط' : 'معطل',
    formatDateUtil(user.lastSignedIn),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
