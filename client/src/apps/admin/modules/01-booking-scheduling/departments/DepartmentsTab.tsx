/**
 * DepartmentsTab - مكون إدارة الأقسام والعيادات الطبية في لوحة التحكم
 *
 * Provides a responsive management view for departments with live search,
 * status filtering, stats overview, create/edit modal dialog, and safe deletion.
 */

import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  RefreshCw,
  Stethoscope,
  HeartPulse,
  Brain,
  Eye,
  Baby,
  Bone,
  Smile,
  Pill,
  Activity,
  Microscope,
  Dna,
  ShieldAlert,
  Thermometer,
  Syringe,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { trpc } from '@/lib/api/trpc';
import { useConfirmDialog } from '@/hooks/ui/useConfirmDialog';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { DepartmentFormDialog, type DepartmentFormData } from './DepartmentFormDialog';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { PermissionHint } from '@/components/PermissionHint';

// Medical icon resolver
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
  heart: HeartPulse,
  heartpulse: HeartPulse,
  cardiology: HeartPulse,
  brain: Brain,
  neurology: Brain,
  eye: Eye,
  ophthalmology: Eye,
  activity: Activity,
  baby: Baby,
  pediatrics: Baby,
  bone: Bone,
  orthopedics: Bone,
  pill: Pill,
  pharmacy: Pill,
  sparkles: Sparkles,
  smile: Smile,
  dental: Smile,
  shield: ShieldAlert,
  emergency: ShieldAlert,
  thermometer: Thermometer,
  syringe: Syringe,
  microscope: Microscope,
  dna: Dna,
  building: Building2,
  building2: Building2,
};

function DepartmentIconBadge({ iconName }: { iconName?: string | null }) {
  const normalized = (iconName || '').toLowerCase().replace(/[-_\s]/g, '');
  const IconComponent = ICON_MAP[normalized] || Building2;

  return (
    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 p-2 flex items-center justify-center ring-1 ring-emerald-500/20 shrink-0">
      <IconComponent className="w-5 h-5" />
    </div>
  );
}

export default function DepartmentsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentFormData | null>(null);

  const { can } = useRolePermissions();
  const canCreate = can('catalog.create');
  const canUpdate = can('catalog.update');
  const canDelete = can('catalog.delete');

  const utils = trpc.useUtils();
  const deleteConfirm = useConfirmDialog<DepartmentFormData>();

  // Query all departments for admin
  const {
    data: departments,
    isLoading,
    isError,
    refetch,
  } = trpc.departments.getAllAdmin.useQuery();

  // Delete mutation
  const deleteMutation = trpc.departments.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف القسم الطبي بنجاح');
      utils.departments.getAllAdmin.invalidate();
      utils.departments.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'فشل حذف القسم');
    },
  });

  // Filter departments by search term and status
  const filteredDepartments = useMemo(() => {
    if (!departments || !Array.isArray(departments)) {
      return [];
    }

    return departments.filter((dept) => {
      // Status filter
      if (statusFilter === 'active' && !dept.isActive) {
        return false;
      }
      if (statusFilter === 'inactive' && dept.isActive) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        const matchName = dept.name?.toLowerCase().includes(query);
        const matchNameEn = dept.nameEn?.toLowerCase().includes(query);
        const matchSlug = dept.slug?.toLowerCase().includes(query);
        const matchDesc = dept.description?.toLowerCase().includes(query);
        if (!matchName && !matchNameEn && !matchSlug && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [departments, searchTerm, statusFilter]);

  // Overall Stats
  const stats = useMemo(() => {
    if (!departments) {
      return { total: 0, active: 0, inactive: 0, totalDoctors: 0 };
    }
    const active = departments.filter((d) => d.isActive).length;
    const totalDoctors = departments.reduce((acc, d) => acc + (d.doctorCount || 0), 0);
    return {
      total: departments.length,
      active,
      inactive: departments.length - active,
      totalDoctors,
    };
  }, [departments]);

  const handleOpenCreate = () => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentFormData) => {
    setEditingDepartment(dept);
    setIsFormOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4" dir="rtl">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">إجمالي الأقسام</span>
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">الأقسام النشطة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.active}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">الأقسام المعطلة</span>
            <XCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">الأطباء الموزعون</span>
            <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">
            {stats.totalDoctors}
          </p>
        </div>
      </div>

      {/* Toolbar / Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 p-3 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم، المعرف الرمزي، أو الوصف..."
              className="pr-9 h-9 text-xs sm:text-sm rounded-xl"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as 'all' | 'active' | 'inactive')}
            >
              <SelectTrigger className="h-9 text-xs sm:text-sm rounded-xl">
                <SelectValue placeholder="حالة التفعيل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">الأقسام النشطة فقط</SelectItem>
                <SelectItem value="inactive">الأقسام المعطلة فقط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 rounded-xl px-2.5"
            title="تحديث البيانات"
            aria-label="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {canCreate ? (
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="h-9 rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم جديد</span>
            </Button>
          ) : (
            <PermissionHint message="لا تملك صلاحية إضافة عناصر الكتالوج" label="إضافة قسم" />
          )}
        </div>
      </div>

      {/* Content Area: Table / Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-border bg-card shadow-xs">
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="p-12 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-destructive mx-auto" />
            <h3 className="text-base font-bold text-foreground">تعذر تحميل بيانات الأقسام</h3>
            <p className="text-xs text-muted-foreground">
              يرجى التأكد من الاتصال بقاعدة البيانات وإعادة المحاولة.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredDepartments.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">لا توجد أقسام مطابقة</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'لم يتم العثور على أي قسم يطابق معايير البحث والتصفية المحددة.'
                : 'لم يتم تسجيل أي قسم طبي حتى الآن. ابدأ بإضافة قسمك الأول.'}
            </p>
            {canCreate && (
              <Button
                onClick={handleOpenCreate}
                size="sm"
                className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم الآن</span>
              </Button>
            )}
          </div>
        )}

        {/* Desktop Table View */}
        {!isLoading && !isError && filteredDepartments.length > 0 && (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">القسم والعيادة</TableHead>
                    <TableHead className="text-right">المعرف الرمزي (Slug)</TableHead>
                    <TableHead className="text-center">الأطباء</TableHead>
                    <TableHead className="text-center">الترتيب</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((dept) => (
                    <TableRow key={dept.id} className="hover:bg-muted/40 transition-colors">
                      {/* Name & Icon */}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <DepartmentIconBadge iconName={dept.icon} />
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-foreground">{dept.name}</p>
                            {dept.nameEn && (
                              <p className="text-xs text-muted-foreground font-sans uppercase">
                                {dept.nameEn}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Slug with public link */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <span>{dept.slug}</span>
                          <Link
                            href={`/departments/${dept.slug}`}
                            target="_blank"
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 p-0.5"
                            title="عرض في الواجهة العامة"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </TableCell>

                      {/* Doctor Count */}
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="font-semibold text-xs bg-muted text-foreground"
                        >
                          {dept.doctorCount || 0} أطباء
                        </Badge>
                      </TableCell>

                      {/* Sort Order */}
                      <TableCell className="text-center text-xs font-mono text-muted-foreground">
                        {dept.sortOrder}
                      </TableCell>

                      {/* Active Status */}
                      <TableCell className="text-center">
                        {dept.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-0 text-[11px] font-medium">
                            نشط
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-muted text-muted-foreground border-0 text-[11px]"
                          >
                            معطل
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {canUpdate ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(dept)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-600 rounded-lg"
                              title="تعديل القسم"
                              aria-label="تعديل القسم"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-40"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}

                          {canDelete ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteConfirm.openConfirm(dept)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive rounded-lg"
                              title="حذف القسم"
                              aria-label="حذف القسم"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-border/60">
              {filteredDepartments.map((dept) => (
                <div key={dept.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <DepartmentIconBadge iconName={dept.icon} />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{dept.name}</h4>
                        {dept.nameEn && (
                          <p className="text-xs text-muted-foreground font-sans uppercase">
                            {dept.nameEn}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-0 text-[11px]">
                        نشط
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">
                        معطل
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono">{dept.slug}</span>
                      <Link
                        href={`/departments/${dept.slug}`}
                        target="_blank"
                        className="text-emerald-600"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>الأطباء: {dept.doctorCount || 0}</span>
                      <span>الترتيب: {dept.sortOrder}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    {canUpdate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(dept)}
                        className="h-8 text-xs rounded-xl gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteConfirm.openConfirm(dept)}
                        className="h-8 text-xs rounded-xl gap-1 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Form Dialog for Create and Edit */}
      <DepartmentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        department={editingDepartment}
      />

      {/* Safe Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onOpenChange={deleteConfirm.closeConfirm}
        itemName={deleteConfirm.item?.name}
        itemType="القسم الطبي"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          const targetId = deleteConfirm.item?.id;
          if (targetId) {
            deleteConfirm.confirm(() => {
              deleteMutation.mutate({ id: targetId });
            });
          }
        }}
      />
    </div>
  );
}
