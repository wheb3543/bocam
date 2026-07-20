/**
 * AccessRequestsTable - جدول طلبات الوصول
 * يعرض جدول طلبات الوصول مع الإجراءات
 */

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, UserCheck, UserX } from 'lucide-react';
import { ColumnVisibility } from '@/components/table/ColumnVisibility';
import {
  ResizableTable,
  ResizableHeaderCell,
  FrozenTableCell,
} from '@/components/table/ResizableTable';
import type { ColumnConfig } from '@/components/table/ColumnVisibility';
import type { AccessRequest } from '../types/user.types';
import { formatDateUtil } from '@/hooks/export/useFormatDate';

interface AccessRequestsTableProps {
  sortedRequests: AccessRequest[];
  requestTable: ReturnType<typeof import('@/hooks/table/useTableFeatures').useTableFeatures>;
  requestColumns: ColumnConfig[];
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
  isPending: boolean;
  formatPhoneDisplay: (phone: string) => string;
}

const AccessRequestsTable = memo(function AccessRequestsTable({
  sortedRequests,
  requestTable,
  requestColumns,
  onApprove,
  onReject,
  isPending,
  formatPhoneDisplay,
}: AccessRequestsTableProps) {
  return (
    <>
      {/* Column Controls */}
      <div className="flex justify-end">
        <ColumnVisibility {...requestTable.columnVisibilityProps} />
      </div>

      {/* Requests Table - ResizableTable */}
      <ResizableTable {...requestTable.resizableTableProps}>
        <TableHeader>
          <TableRow>
            {requestTable.visibleColumnOrder.map((colKey) => {
              const col = requestColumns.find((c) => c.key === colKey);
              if (!col || !requestTable.visibleColumns[colKey]) {return null;}
              return (
                <ResizableHeaderCell
                  key={colKey}
                  columnKey={colKey}
                  width={
                    requestTable.columnWidths.columnWidths[colKey] ||
                    col.defaultWidth ||
                    150
                  }
                  minWidth={col.minWidth || 80}
                  maxWidth={col.maxWidth || 500}
                  onResize={requestTable.columnWidths.handleResize}
                  {...requestTable.getSortProps(colKey)}
                >
                  {col.label}
                </ResizableHeaderCell>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody className={sortedRequests.length > 0 ? 'stagger-rows' : ''}>
          {sortedRequests.map((request) => (
            <TableRow key={request.id}>
              {requestTable.visibleColumnOrder.map((colKey) => {
                if (!requestTable.visibleColumns[colKey]) {return null;}

                switch (colKey) {
                  case 'name':
                    return (
                      <FrozenTableCell
                        key={colKey}
                        columnKey={colKey}
                        className="font-medium"
                      >
                        {request.name}
                      </FrozenTableCell>
                    );
                  case 'email':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate" dir="ltr">
                            {request.email}
                          </span>
                        </div>
                      </FrozenTableCell>
                    );
                  case 'phone':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        {request.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span dir="ltr">{formatPhoneDisplay(request.phone)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </FrozenTableCell>
                    );
                  case 'reason':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey} wrap>
                        <span className="text-sm text-muted-foreground">
                          {request.reason || 'غير محدد'}
                        </span>
                      </FrozenTableCell>
                    );
                  case 'requestedAt':
                    return (
                      <FrozenTableCell
                        key={colKey}
                        columnKey={colKey}
                        className="text-sm text-muted-foreground"
                      >
                        {formatDateUtil(request.requestedAt)}
                      </FrozenTableCell>
                    );
                  case 'actions':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onApprove(request.id)}
                            disabled={isPending}
                          >
                            <UserCheck className="w-4 h-4 ml-1" />
                            موافقة
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onReject(request.id)}
                            disabled={isPending}
                          >
                            <UserX className="w-4 h-4 ml-1" />
                            رفض
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

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        عرض {sortedRequests.length} طلب معلق
      </div>
    </>
  );
});

export default AccessRequestsTable;
