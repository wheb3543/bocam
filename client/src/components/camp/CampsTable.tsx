/**
 * Camps Table Component
 * مكون جدول المخيمات
 */

import { TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tent, Edit, Copy, Trash2 } from 'lucide-react';
import {
  ResizableTable,
  ResizableHeaderCell,
  FrozenTableCell,
} from '@/components/table/ResizableTable';
import { campColumns } from './columns';
import type { Camp } from './types';

interface CampsTableProps {
  camps: Camp[];
  tableFeatures: {
    campTable: ReturnType<typeof import('@/hooks/table/useTableFeatures').useTableFeatures>;
  };
  formatDate: (date: Date | string | null) => string;
  onEdit: (camp: Camp) => void;
  onDuplicate: (camp: Camp) => void;
  onDelete: (camp: Camp) => void;
}

export default function CampsTable({
  camps,
  tableFeatures,
  formatDate,
  onEdit,
  onDuplicate,
  onDelete,
}: CampsTableProps) {
  const { campTable } = tableFeatures;

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-gray-100 overflow-hidden">
      <ResizableTable {...campTable.resizableTableProps}>
        <TableHeader>
          <TableRow>
            {campTable.visibleColumnOrder.map((colKey) => {
              const col = campColumns.find((c) => c.key === colKey);
              if (!col || !campTable.visibleColumns[colKey]) {return null;}
              return (
                <ResizableHeaderCell
                  key={colKey}
                  columnKey={colKey}
                  width={campTable.columnWidths.columnWidths[colKey] || col.defaultWidth || 150}
                  minWidth={col.minWidth || 80}
                  maxWidth={col.maxWidth || 500}
                  onResize={campTable.columnWidths.handleResize}
                  {...campTable.getSortProps(colKey)}
                >
                  {col.label}
                </ResizableHeaderCell>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {camps.map((camp: Camp) => (
            <TableRow key={camp.id} className="hover:bg-muted/50/50">
              {campTable.visibleColumnOrder.map((colKey) => {
                if (!campTable.visibleColumns[colKey]) {return null;}

                switch (colKey) {
                  case 'name':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey} className="font-medium">
                        <div className="flex items-center gap-3">
                          {camp.imageUrl ? (
                            <img
                              src={camp.imageUrl}
                              alt={camp.name}
                              className="h-10 w-10 rounded-lg object-cover flex-shrink-0 ring-1 ring-gray-100"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <Tent className="h-5 w-5 text-purple-500" />
                            </div>
                          )}
                          <span className="truncate text-sm font-semibold">{camp.name}</span>
                        </div>
                      </FrozenTableCell>
                    );
                  case 'slug':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <a
                          href={`/camps/${camp.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:underline text-sm truncate"
                        >
                          {camp.slug}
                        </a>
                      </FrozenTableCell>
                    );
                  case 'status':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <Badge
                          variant="outline"
                          className={
                            camp.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-muted/50 text-muted-foreground border-border'
                          }
                        >
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 ${camp.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
                          />
                          {camp.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </FrozenTableCell>
                    );
                  case 'startDate':
                    return (
                      <FrozenTableCell
                        key={colKey}
                        columnKey={colKey}
                        className="text-sm text-muted-foreground"
                      >
                        {formatDate(camp.startDate)}
                      </FrozenTableCell>
                    );
                  case 'endDate':
                    return (
                      <FrozenTableCell
                        key={colKey}
                        columnKey={colKey}
                        className="text-sm text-muted-foreground"
                      >
                        {formatDate(camp.endDate)}
                      </FrozenTableCell>
                    );
                  case 'description':
                    return (
                      <FrozenTableCell
                        key={colKey}
                        columnKey={colKey}
                        className="text-sm text-muted-foreground"
                      >
                        <span className="truncate block max-w-[200px]">
                          {camp.description || '-'}
                        </span>
                      </FrozenTableCell>
                    );
                  case 'imageUrl':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        {camp.imageUrl ? (
                          <img
                            src={camp.imageUrl}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          '-'
                        )}
                      </FrozenTableCell>
                    );
                  case 'createdAt':
                    return (
                      <FrozenTableCell
                        key={colKey}
                        columnKey={colKey}
                        className="text-sm text-muted-foreground"
                      >
                        {formatDate(camp.createdAt)}
                      </FrozenTableCell>
                    );
                  case 'actions':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(camp)}
                            title="تعديل"
                          >
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDuplicate(camp)}
                            title="نسخ"
                          >
                            <Copy className="h-3.5 w-3.5 text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDelete(camp)}
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
    </div>
  );
}
