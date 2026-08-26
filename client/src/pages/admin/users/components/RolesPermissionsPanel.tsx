import { useMemo, useState } from 'react';
import { Check, Plus, ShieldCheck, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { trpc } from '@/lib/api/trpc';
import type { RouterOutputs } from '@/types/trpc';
import {
  ROLE_BASE_KEYS,
  ROLE_PERMISSION_GROUPS,
  ROLE_PERMISSION_LABELS,
  type RoleBaseKey,
  type RolePermission,
} from '@shared/rolePermissions';

type RoleForm = {
  id?: number;
  key: string;
  name: string;
  description: string;
  baseRole: RoleBaseKey;
  permissions: RolePermission[];
  isActive: boolean;
};
type RoleDefinition = RouterOutputs['users']['roles']['list'][number];

const baseRoleLabels: Record<RoleBaseKey, string> = {
  admin: 'مسؤول',
  manager: 'مدير',
  staff: 'موظف',
  team_leader: 'قائد فريق',
  viewer: 'مشاهد',
  user: 'مستخدم',
};

const emptyRole = (): RoleForm => ({
  key: '',
  name: '',
  description: '',
  baseRole: 'staff',
  permissions: [],
  isActive: true,
});

export default function RolesPermissionsPanel() {
  const utils = trpc.useUtils();
  const { data: roleData, isLoading } = trpc.users.roles.list.useQuery();
  const roles = (roleData || []) as RoleDefinition[];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RoleForm>(emptyRole);
  const mutation = trpc.users.roles.save.useMutation({
    onSuccess: () => {
      utils.users.roles.list.invalidate();
      utils.users.roles.listAssignable.invalidate();
      toast.success('تم حفظ الدور وصلاحياته');
      setOpen(false);
      setForm(emptyRole());
    },
    onError: (error) => toast.error(error.message || 'تعذر حفظ الدور'),
  });

  const selectedCount = useMemo(() => form.permissions.length, [form.permissions]);
  const editRole = (role: RoleDefinition) => {
    setForm({
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description || '',
      baseRole: role.baseRole,
      permissions: role.permissions,
      isActive: role.isActive,
    });
    setOpen(true);
  };
  const togglePermission = (permission: RolePermission, enabled: boolean) =>
    setForm((current) => ({
      ...current,
      permissions: enabled
        ? Array.from(new Set([...current.permissions, permission]))
        : current.permissions.filter((item) => item !== permission),
    }));
  const toggleGroupPermissions = (permissions: readonly RolePermission[]) =>
    setForm((current) => {
      const selected = permissions.every((permission) => current.permissions.includes(permission));
      return {
        ...current,
        permissions: selected
          ? current.permissions.filter((permission) => !permissions.includes(permission))
          : Array.from(new Set([...current.permissions, ...permissions])),
      };
    });

  return (
    <>
      <Card>
        <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              الأدوار والصلاحيات
            </CardTitle>
            <CardDescription className="mt-1">
              إدارة الأدوار النظامية والمخصصة وتحديد الصلاحيات الممنوحة لكل دور.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setForm(emptyRole());
              setOpen(true);
            }}
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة دور
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              جارٍ تحميل الأدوار…
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => editRole(role)}
                  className="rounded-xl border border-border bg-card p-4 text-right transition hover:border-primary/50 hover:bg-primary/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{role.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {role.description || 'دور مخصص بلا وصف.'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${role.isSystem ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-700'}`}
                    >
                      {role.isSystem ? 'نظامي' : 'مخصص'}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>{baseRoleLabels[role.baseRole as RoleBaseKey]}</span>
                    <span className="flex items-center gap-1">
                      <UsersRound className="h-3.5 w-3.5" />
                      {role.permissions.length} صلاحية
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'تعديل الدور والصلاحيات' : 'إضافة دور جديد'}</DialogTitle>
            <DialogDescription>
              الأدوار المخصصة ترث دوراً تشغيلياً أساسياً، ثم تضبط صلاحياتها التفصيلية من هنا.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">اسم الدور</Label>
              <Input
                id="role-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="مثال: مشرف التسويق"
              />
            </div>
            {!form.id && (
              <div className="space-y-2">
                <Label htmlFor="role-key">المعرف الفني</Label>
                <Input
                  id="role-key"
                  value={form.key}
                  onChange={(event) => setForm({ ...form, key: event.target.value })}
                  placeholder="marketing-supervisor"
                  dir="ltr"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>الدور التشغيلي الأساسي</Label>
              <Select
                value={form.baseRole}
                onValueChange={(value) => setForm({ ...form, baseRole: value as RoleBaseKey })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_BASE_KEYS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {baseRoleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end justify-between rounded-lg border border-border p-3">
              <div>
                <Label>الدور نشط</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  يمكن إسناد الأدوار النشطة فقط للمستخدمين.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(isActive) => setForm({ ...form, isActive })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role-description">الوصف</Label>
              <Input
                id="role-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="وصف مسؤوليات الدور وحدود عمله"
              />
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">الصلاحيات</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  تم اختيار {selectedCount} صلاحية. لا يمكن إزالة صلاحيات حماية المسؤول الأساسية.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {selectedCount}/{Object.keys(ROLE_PERMISSION_LABELS).length}
              </span>
            </div>
            <div className="space-y-4">
              {ROLE_PERMISSION_GROUPS.map((group) => (
                <div key={group.key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{group.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {
                          group.permissions.filter((permission) =>
                            form.permissions.includes(permission)
                          ).length
                        }
                        /{group.permissions.length} صلاحية
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => toggleGroupPermissions(group.permissions)}
                    >
                      {group.permissions.every((permission) =>
                        form.permissions.includes(permission)
                      )
                        ? 'إلغاء المجموعة'
                        : 'تحديد المجموعة'}
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 text-sm"
                      >
                        <Checkbox
                          checked={form.permissions.includes(permission)}
                          disabled={
                            form.baseRole === 'admin' &&
                            ['users.manage', 'roles.manage', 'settings.manage'].includes(permission)
                          }
                          onCheckedChange={(checked) =>
                            togglePermission(permission, checked === true)
                          }
                        />
                        {ROLE_PERMISSION_LABELS[permission]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button
              disabled={!form.name.trim() || mutation.isPending}
              onClick={() => mutation.mutate({ ...form, description: form.description || null })}
            >
              {mutation.isPending ? (
                'جارٍ الحفظ…'
              ) : (
                <>
                  <Check className="ml-2 h-4 w-4" />
                  حفظ الدور
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
