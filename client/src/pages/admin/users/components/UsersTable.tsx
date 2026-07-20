/**
 * UsersTable - جدول المستخدمين
 * يعرض جدول المستخدمين مع الفلاتر والإجراءات
 */

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Edit, Power, Trash2, Users } from 'lucide-react';
import { ColumnVisibility } from '@/components/table/ColumnVisibility';
import {
  ResizableTable,
  ResizableHeaderCell,
  FrozenTableCell,
} from '@/components/table/ResizableTable';
import type { ColumnConfig } from '@/components/table/ColumnVisibility';
import type { User } from '../types/user.types';
import { roleLabels, roleColors } from '../types/user.types';
import { getInitials } from '../utils/userHelpers';
import { formatDateUtil } from '@/hooks/export/useFormatDate';

interface UsersTableProps {
  filteredUsers: User[];
  totalUsers: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  userTable: ReturnType<typeof import('@/hooks/table/useTableFeatures').useTableFeatures>;
  userColumns: ColumnConfig[];
  onEdit: (user: User) => void;
  onToggleActive: (userId: number) => void;
  onDelete: (id: number, name: string) => void;
}

const UsersTable = memo(function UsersTable({
  filteredUsers,
  totalUsers,
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  userTable,
  userColumns,
  onEdit,
  onToggleActive,
  onDelete,
}: UsersTableProps) {
  return (
    <>
      {/* Filters & Column Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="بحث عن مستخدم..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder="الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأدوار</SelectItem>
            <SelectItem value="admin">مسؤول</SelectItem>
            <SelectItem value="manager">مدير</SelectItem>
            <SelectItem value="staff">موظف</SelectItem>
            <SelectItem value="viewer">مشاهد</SelectItem>
            <SelectItem value="user">مستخدم</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="yes">نشط</SelectItem>
            <SelectItem value="no">معطل</SelectItem>
          </SelectContent>
        </Select>
        <ColumnVisibility {...userTable.columnVisibilityProps} />
      </div>

      {/* Users Table - ResizableTable */}
      <ResizableTable {...userTable.resizableTableProps}>
        <TableHeader>
          <TableRow>
            {userTable.visibleColumnOrder.map((colKey) => {
              const col = userColumns.find((c) => c.key === colKey);
              if (!col || !userTable.visibleColumns[colKey]) {return null;}
              return (
                <ResizableHeaderCell
                  key={colKey}
                  columnKey={colKey}
                  width={
                    userTable.columnWidths.columnWidths[colKey] || col.defaultWidth || 150
                  }
                  minWidth={col.minWidth || 80}
                  maxWidth={col.maxWidth || 500}
                  onResize={userTable.columnWidths.handleResize}
                  {...userTable.getSortProps(colKey)}
                >
                  {col.label}
                </ResizableHeaderCell>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody
          className={filteredUsers && filteredUsers.length > 0 ? 'stagger-rows' : ''}
        >
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                {userTable.visibleColumnOrder.map((colKey) => {
                  if (!userTable.visibleColumns[colKey]) {return null;}

                  switch (colKey) {
                    case 'user':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(user.name || user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {user.name || user.username}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </FrozenTableCell>
                      );
                    case 'email':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <span dir="ltr" className="truncate">
                            {user.email || '-'}
                          </span>
                        </FrozenTableCell>
                      );
                    case 'role':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <Badge className={roleColors[user.role] + ' border'}>
                            {roleLabels[user.role]}
                          </Badge>
                        </FrozenTableCell>
                      );
                    case 'status':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <Badge
                            variant={user.isActive === 'yes' ? 'default' : 'secondary'}
                          >
                            {user.isActive === 'yes' ? 'نشط' : 'معطل'}
                          </Badge>
                        </FrozenTableCell>
                      );
                    case 'lastSignedIn':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          className="text-sm text-muted-foreground"
                        >
                          {formatDateUtil(user.lastSignedIn)}
                        </FrozenTableCell>
                      );
                    case 'createdAt':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          className="text-sm text-muted-foreground"
                        >
                          {formatDateUtil(user.createdAt)}
                        </FrozenTableCell>
                      );
                    case 'actions':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(user)}
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onToggleActive(user.id)}
                              title={user.isActive === 'yes' ? 'تعطيل' : 'تفعيل'}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(user.id, user.name || user.username)}
                              className="text-red-600 hover:text-red-700"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </FrozenTableCell>
                      );
                    default:
                      return null;
                  }
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <FrozenTableCell
                columnKey=""
                colSpan={
                  userTable.visibleColumnOrder.filter((k) => userTable.visibleColumns[k])
                    .length
                }
                className="text-center py-12"
              >
                <div className="text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد نتائج</p>
                </div>
              </FrozenTableCell>
            </TableRow>
          )}
        </TableBody>
      </ResizableTable>

      {/* Results Count */}
      {filteredUsers && filteredUsers.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          عرض {filteredUsers.length} من أصل {totalUsers} مستخدم
        </div>
      )}
    </>
  );
});

export default UsersTable;
