/**
 * UsersManagementPage - صفحة إدارة المستخدمين
 * تم إعادة هيكللتها لتقليل التعقيد وتحسين قابلية الصيانة
 */

import { useState } from 'react';
import { useConfirmDialog } from '@/hooks/ui/useConfirmDialog';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardLayoutSkeleton } from '@/components/DashboardLayoutSkeleton';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { type ColumnConfig } from '@/components/table/ColumnVisibility';
import { useTableFeatures } from '@/hooks/table/useTableFeatures';
import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';
import { Users, UserCheck, UserCog, Download } from 'lucide-react';
import type { User, AccessRequest, UserFormData, ActiveSection } from './types/user.types';
import { exportToCSV } from './utils/userHelpers';
import UserStatsCards from './components/UserStatsCards';
import UserFormDialog from './components/UserFormDialog';
import UsersTable from './components/UsersTable';
import AccessRequestsTable from './components/AccessRequestsTable';
import RoleDescriptionsCard from './components/RoleDescriptionsCard';
import { useUsers } from './hooks/useUsers';

// تعريف أعمدة جدول طلبات الوصول
const requestColumns: ColumnConfig[] = [
  {
    key: 'name',
    label: 'الاسم',
    defaultVisible: true,
    defaultWidth: 180,
    minWidth: 120,
    maxWidth: 350,
    sortType: 'string',
  },
  {
    key: 'email',
    label: 'البريد الإلكتروني',
    defaultVisible: true,
    defaultWidth: 220,
    minWidth: 140,
    maxWidth: 400,
    sortType: 'string',
  },
  {
    key: 'phone',
    label: 'الهاتف',
    defaultVisible: true,
    defaultWidth: 150,
    minWidth: 100,
    maxWidth: 250,
    sortType: 'string',
  },
  {
    key: 'reason',
    label: 'السبب',
    defaultVisible: true,
    defaultWidth: 200,
    minWidth: 120,
    maxWidth: 400,
    sortType: 'string',
  },
  {
    key: 'requestedAt',
    label: 'تاريخ الطلب',
    defaultVisible: true,
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
    maxWidth: 280,
    sortable: false,
  },
];

// تعريف أعمدة جدول المستخدمين
const userColumns: ColumnConfig[] = [
  {
    key: 'user',
    label: 'المستخدم',
    defaultVisible: true,
    defaultWidth: 220,
    minWidth: 150,
    maxWidth: 400,
    sortType: 'string',
  },
  {
    key: 'email',
    label: 'البريد الإلكتروني',
    defaultVisible: true,
    defaultWidth: 200,
    minWidth: 120,
    maxWidth: 400,
    sortType: 'string',
  },
  {
    key: 'role',
    label: 'الدور',
    defaultVisible: true,
    defaultWidth: 120,
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
    maxWidth: 180,
    sortType: 'string',
  },
  {
    key: 'lastSignedIn',
    label: 'آخر تسجيل',
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
    defaultWidth: 150,
    minWidth: 120,
    maxWidth: 250,
    sortable: false,
  },
];

export default function UsersManagementPage() {
  const { formatPhoneDisplay } = usePhoneFormat();
  const [activeSection, setActiveSection] = useState<ActiveSection>('users');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'user',
    isActive: 'yes',
  });

  // useTableFeatures hook
  const userTable = useTableFeatures({
    tableKey: 'users',
    columns: userColumns,
    defaultFrozenColumns: ['user'],
  });

  // useTableFeatures hook لجدول طلبات الوصول
  const requestTable = useTableFeatures({
    tableKey: 'accessRequests',
    columns: requestColumns,
    defaultFrozenColumns: ['name'],
  });

  const {
    accessRequests,
    filteredUsers,
    isLoading,
    totalUsers,
    activeUsers,
    adminUsers,
    approveMutation,
    rejectMutation,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleActiveMutation,
    handleSubmit,
  } = useUsers({
    searchQuery,
    roleFilter,
    statusFilter,
    userTable,
  });

  const deleteConfirm = useConfirmDialog<{ id: number; name: string }>();

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'user',
      isActive: 'yes',
    });
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      isActive: user.isActive,
    });
    setShowAddDialog(true);
  };

  const handleToggleActive = (userId: number) => {
    toggleActiveMutation.mutate({ id: userId });
  };

  const handleDelete = (id: number, name: string) => {
    deleteConfirm.openConfirm({ id, name });
  };

  // Sort access requests using useTableFeatures
  const sortedRequests = accessRequests
    ? requestTable.sortData(accessRequests, (item: AccessRequest, key: string) => {
        switch (key) {
          case 'name':
            return item.name;
          case 'email':
            return item.email;
          case 'phone':
            return item.phone;
          case 'reason':
            return item.reason;
          case 'requestedAt':
            return item.requestedAt;
          default:
            return undefined;
        }
      })
    : [];

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  return (
    <DashboardLayout pageTitle="إدارة المستخدمين" pageDescription="إدارة ومتابعة مستخدمي النظام">
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSection === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveSection('users')}
            className="flex-1 sm:flex-none"
          >
            <Users className="w-4 h-4 ml-2" />
            إدارة المستخدمين
          </Button>
          <Button
            variant={activeSection === 'requests' ? 'default' : 'outline'}
            onClick={() => setActiveSection('requests')}
            className="flex-1 sm:flex-none relative"
          >
            <UserCheck className="w-4 h-4 ml-2" />
            طلبات التصريح
            {accessRequests && accessRequests.length > 0 && (
              <Badge className="mr-2 bg-red-500 text-white">{accessRequests.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeSection === 'activity' ? 'default' : 'outline'}
            onClick={() => setActiveSection('activity')}
            className="flex-1 sm:flex-none"
          >
            <UserCog className="w-4 h-4 ml-2" />
            تتبع النشاط
          </Button>
        </div>

        {/* Users Section */}
        {activeSection === 'users' && (
          <>
            {/* Statistics Cards */}
            <UserStatsCards
              totalUsers={totalUsers}
              activeUsers={activeUsers}
              adminUsers={adminUsers}
            />

            {/* Main Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>قائمة المستخدمين</CardTitle>
                    <CardDescription>إدارة المستخدمين والأدوار والصلاحيات</CardDescription>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => filteredUsers && exportToCSV(filteredUsers)}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تصدير
                    </Button>
                    <UserFormDialog
                      open={showAddDialog}
                      onOpenChange={setShowAddDialog}
                      formData={formData}
                      onFormDataChange={setFormData}
                      editingUser={editingUser}
                      onSubmit={() => {
                        handleSubmit(formData, editingUser);
                        resetForm();
                        setShowAddDialog(false);
                      }}
                      isPending={createMutation.isPending || updateMutation.isPending}
                      onReset={resetForm}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsersTable
                  filteredUsers={filteredUsers}
                  totalUsers={totalUsers}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  roleFilter={roleFilter}
                  onRoleFilterChange={setRoleFilter}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  userTable={userTable}
                  userColumns={userColumns}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>

            {/* Role Descriptions */}
            <RoleDescriptionsCard />
          </>
        )}

        {/* Access Requests Section */}
        {activeSection === 'requests' && (
          <Card>
            <CardHeader>
              <CardTitle>طلبات التصريح المعلقة</CardTitle>
              <CardDescription>مراجعة والموافقة على طلبات الوصول الجديدة</CardDescription>
            </CardHeader>
            <CardContent>
              {!accessRequests || accessRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground mb-2">
                    لا توجد طلبات معلقة
                  </p>
                  <p className="text-sm text-muted-foreground">جميع طلبات الوصول تمت معالجتها</p>
                </div>
              ) : (
                <AccessRequestsTable
                  sortedRequests={sortedRequests}
                  requestTable={requestTable}
                  requestColumns={requestColumns}
                  onApprove={(requestId) => approveMutation.mutate({ requestId })}
                  onReject={(requestId) => rejectMutation.mutate({ requestId })}
                  isPending={approveMutation.isPending || rejectMutation.isPending}
                  formatPhoneDisplay={formatPhoneDisplay}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Section */}
        {activeSection === 'activity' && (
          <Card>
            <CardHeader>
              <CardTitle>تتبع النشاط الحي</CardTitle>
              <CardDescription>عرض آخر الأنشطة والعمليات في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        )}
      </div>
      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onOpenChange={deleteConfirm.closeConfirm}
        itemName={deleteConfirm.item?.name}
        itemType="المستخدم"
        onConfirm={() =>
          deleteConfirm.confirm(() => deleteMutation.mutate({ id: deleteConfirm.item?.id ?? 0 }))
        }
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
