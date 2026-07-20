/**
 * DoctorTable - جدول الأطباء
 */

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { Stethoscope, Edit, Copy, Trash2 } from 'lucide-react';
import { useFormatDate } from '@/hooks/export/useFormatDate';
import {
  ResizableTable,
  ResizableHeaderCell,
  FrozenTableCell,
} from '@/components/table/ResizableTable';
import { type ColumnConfig } from '@/components/table/ColumnVisibility';
import EmptyState from '@/components/EmptyState';
import type { Doctor } from '../types/doctor.types';

// تعريف أعمدة جدول الأطباء
export const doctorColumns: ColumnConfig[] = [
  {
    key: 'name',
    label: 'الاسم',
    defaultVisible: true,
    defaultWidth: 200,
    minWidth: 150,
    maxWidth: 400,
    sortType: 'string',
  },
  {
    key: 'slug',
    label: 'الرابط',
    defaultVisible: false,
    defaultWidth: 160,
    minWidth: 100,
    maxWidth: 300,
    sortType: 'string',
  },
  {
    key: 'specialty',
    label: 'التخصص',
    defaultVisible: true,
    defaultWidth: 180,
    minWidth: 120,
    maxWidth: 350,
    sortType: 'string',
  },
  {
    key: 'bio',
    label: 'السيرة الذاتية',
    defaultVisible: false,
    defaultWidth: 200,
    minWidth: 120,
    maxWidth: 400,
    sortable: false,
  },
  {
    key: 'image',
    label: 'الصورة',
    defaultVisible: false,
    defaultWidth: 100,
    minWidth: 80,
    maxWidth: 200,
    sortable: false,
  },
  {
    key: 'experience',
    label: 'الخبرة',
    defaultVisible: true,
    defaultWidth: 100,
    minWidth: 70,
    maxWidth: 200,
    sortType: 'string',
  },
  {
    key: 'languages',
    label: 'اللغات',
    defaultVisible: true,
    defaultWidth: 140,
    minWidth: 100,
    maxWidth: 300,
    sortType: 'string',
  },
  {
    key: 'consultationFee',
    label: 'رسوم الاستشارة',
    defaultVisible: true,
    defaultWidth: 130,
    minWidth: 100,
    maxWidth: 250,
    sortType: 'number',
  },
  {
    key: 'isVisiting',
    label: 'طبيب زائر',
    defaultVisible: false,
    defaultWidth: 100,
    minWidth: 80,
    maxWidth: 200,
    sortType: 'string',
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
    key: 'createdAt',
    label: 'تاريخ الإضافة',
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

interface DoctorTableProps {
  doctors: Doctor[] | undefined;
  searchTerm: string;
  doctorTable: {
    resizableTableProps: Record<string, unknown>;
    columnVisibilityProps: Record<string, unknown>;
    visibleColumnOrder: string[];
    visibleColumns: Record<string, boolean>;
    columnWidths: {
      columnWidths: Record<string, number>;
      handleResize: (columnKey: string, newWidth: number) => void;
    };
    sortData: <T>(data: T[], getValue: (item: T, key: string) => unknown) => T[];
    getSortProps: (columnKey: string) => Record<string, unknown>;
  };
  onToggleAvailability: (doctor: Doctor) => void;
  onEdit: (doctor: Doctor) => void;
  onDuplicate: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
  onAdd: () => void;
}

export function DoctorTable({
  doctors,
  searchTerm,
  doctorTable,
  onToggleAvailability,
  onEdit,
  onDuplicate,
  onDelete,
  onAdd,
}: DoctorTableProps) {
  const { formatDate } = useFormatDate();

  const filteredDoctors = useMemo(() => {
    if (!doctors) {
      return [];
    }
    let filtered = [...doctors];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc: Doctor) =>
          (doc.name ?? '').toLowerCase().includes(term) ||
          (doc.specialty ?? '').toLowerCase().includes(term) ||
          (doc.languages ?? '').toLowerCase().includes(term)
      );
    }

    return doctorTable.sortData(filtered, (item: Doctor, key: string) => {
      switch (key) {
        case 'name':
          return item.name;
        case 'specialty':
          return item.specialty;
        case 'experience':
          return item.experience;
        case 'languages':
          return item.languages;
        case 'consultationFee':
          return item.consultationFee;
        case 'isVisiting':
          return item.isVisiting ? 'نعم' : 'لا';
        case 'status':
          return item.status;
        default:
          return item[key];
      }
    });
  }, [doctors, searchTerm, doctorTable]);

  if (filteredDoctors.length === 0) {
    return (
      <EmptyState
        icon={Stethoscope}
        title={searchTerm ? 'لا توجد نتائج مطابقة' : 'لا يوجد أطباء بعد'}
        description={searchTerm ? 'جرّب تغيير كلمات البحث' : 'ابدأ بإضافة أول طبيب إلى النظام'}
        action={!searchTerm ? { label: 'إضافة طبيب جديد', onClick: onAdd } : undefined}
      />
    );
  }

  return (
    <ResizableTable {...doctorTable.resizableTableProps}>
      <TableHeader>
        <TableRow>
          {doctorTable.visibleColumnOrder.map((colKey: string) => {
            const col = doctorColumns.find((c) => c.key === colKey);
            if (!col || !doctorTable.visibleColumns[colKey]) {
              return null;
            }
            return (
              <ResizableHeaderCell
                key={colKey}
                columnKey={colKey}
                width={
                  doctorTable.columnWidths.columnWidths[colKey] || col.defaultWidth || 150
                }
                minWidth={col.minWidth || 80}
                maxWidth={col.maxWidth || 500}
                onResize={doctorTable.columnWidths.handleResize}
                {...doctorTable.getSortProps(colKey)}
              >
                {col.label}
              </ResizableHeaderCell>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredDoctors.map((doctor: Doctor) => (
          <TableRow key={`${doctor.id ?? doctor.slug ?? ''}`} className="hover:bg-muted/50/50">
            {doctorTable.visibleColumnOrder.map((colKey: string) => {
              if (!doctorTable.visibleColumns[colKey]) {
                return null;
              }

              switch (colKey) {
                case 'name':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey} className="font-medium">
                      <div className="flex items-center gap-3">
                        {doctor.image ? (
                          <img
                            src={doctor.image}
                            alt={doctor.name || undefined}
                            className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="truncate block text-sm font-semibold">
                            {doctor.name}
                          </span>
                          {doctor.isVisiting === 'yes' && (
                            <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                              زائر
                            </span>
                          )}
                        </div>
                      </div>
                    </FrozenTableCell>
                  );
                case 'specialty':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey}>
                      <span className="truncate text-sm text-foreground">
                        {doctor.specialty}
                      </span>
                    </FrozenTableCell>
                  );
                case 'experience':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey}>
                      <span className="text-sm text-muted-foreground">
                        {doctor.experience || '-'}
                      </span>
                    </FrozenTableCell>
                  );
                case 'languages':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey}>
                      <span className="text-sm text-muted-foreground">
                        {doctor.languages || '-'}
                      </span>
                    </FrozenTableCell>
                  );
                case 'consultationFee':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey}>
                      <span className="text-sm font-medium text-foreground">
                        {doctor.consultationFee || '-'}
                      </span>
                    </FrozenTableCell>
                  );
                case 'isVisiting':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey}>
                      <Badge
                        variant="outline"
                        className={
                          doctor.isVisiting === 'yes'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-muted/50 text-muted-foreground border-border'
                        }
                      >
                        {doctor.isVisiting === 'yes' ? 'زائر' : 'مقيم'}
                      </Badge>
                    </FrozenTableCell>
                  );
                case 'slug':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey}>
                      <a
                        href={`/doctors/${doctor.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:underline text-sm truncate"
                      >
                        {doctor.slug}
                      </a>
                    </FrozenTableCell>
                  );
                case 'bio':
                  return (
                    <FrozenTableCell
                      key={colKey}
                      columnKey={colKey}
                      className="text-sm text-muted-foreground"
                    >
                      <span className="truncate block max-w-[200px]">
                        {doctor.bio || '-'}
                      </span>
                    </FrozenTableCell>
                  );
                case 'image':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey}>
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        '-'
                      )}
                    </FrozenTableCell>
                  );
                case 'status':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey}>
                      <Badge
                        variant="outline"
                        className={
                          doctor.available === 'yes'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 ${doctor.available === 'yes' ? 'bg-emerald-500' : 'bg-red-500'}`}
                        />
                        {doctor.available === 'yes' ? 'متاح' : 'غير متاح'}
                      </Badge>
                    </FrozenTableCell>
                  );
                case 'createdAt':
                  return (
                    <FrozenTableCell
                      key={colKey}
                      columnKey={colKey}
                      className="text-sm text-muted-foreground"
                    >
                      {formatDate(doctor.createdAt ?? undefined)}
                    </FrozenTableCell>
                  );
                case 'actions':
                  return (
                    <FrozenTableCell key={colKey} columnKey={colKey}>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => onToggleAvailability(doctor)}
                        >
                          {doctor.available === 'yes' ? (
                            <span className="text-red-500">تعطيل</span>
                          ) : (
                            <span className="text-emerald-600">تفعيل</span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(doctor)}
                          title="تعديل"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDuplicate(doctor)}
                          title="نسخ"
                        >
                          <Copy className="h-3.5 w-3.5 text-blue-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDelete(doctor)}
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </FrozenTableCell>
                  );
                default:
                  return null;
              }
            })}
          </TableRow>
        ))}
      </TableBody>
    </ResizableTable>
  );
}

