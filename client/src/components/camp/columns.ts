/**
 * Camp Table Columns Configuration
 * تكوين أعمدة جدول المخيمات
 */

import { type ColumnConfig } from '@/components/table/ColumnVisibility';

export const campColumns: ColumnConfig[] = [
  {
    key: 'name',
    label: 'الاسم',
    defaultVisible: true,
    defaultWidth: 220,
    minWidth: 150,
    maxWidth: 400,
    sortType: 'string',
  },
  {
    key: 'slug',
    label: 'الرابط',
    defaultVisible: true,
    defaultWidth: 160,
    minWidth: 100,
    maxWidth: 300,
    sortType: 'string',
  },
  {
    key: 'description',
    label: 'الوصف',
    defaultVisible: false,
    defaultWidth: 200,
    minWidth: 120,
    maxWidth: 400,
    sortable: false,
  },
  {
    key: 'imageUrl',
    label: 'الصورة',
    defaultVisible: false,
    defaultWidth: 100,
    minWidth: 80,
    maxWidth: 200,
    sortable: false,
  },
  {
    key: 'status',
    label: 'الحالة',
    defaultVisible: true,
    defaultWidth: 100,
    minWidth: 80,
    maxWidth: 200,
    sortType: 'string',
  },
  {
    key: 'startDate',
    label: 'تاريخ البداية',
    defaultVisible: true,
    defaultWidth: 140,
    minWidth: 100,
    maxWidth: 250,
    sortType: 'date',
  },
  {
    key: 'endDate',
    label: 'تاريخ النهاية',
    defaultVisible: true,
    defaultWidth: 140,
    minWidth: 100,
    maxWidth: 250,
    sortType: 'date',
  },
  {
    key: 'createdAt',
    label: 'تاريخ الإنشاء',
    defaultVisible: false,
    defaultWidth: 140,
    minWidth: 100,
    maxWidth: 250,
    sortType: 'date',
  },
  {
    key: 'actions',
    label: 'الإجراءات',
    defaultVisible: true,
    defaultWidth: 180,
    minWidth: 140,
    maxWidth: 300,
    sortable: false,
  },
];
