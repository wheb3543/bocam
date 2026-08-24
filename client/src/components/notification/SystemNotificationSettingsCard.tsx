import { useEffect, useState } from 'react';
import { BellRing, Check, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import {
  NOTIFICATION_RECIPIENT_ROLES,
  NOTIFICATION_SOURCES,
  type NotificationRecipientRole,
  type NotificationSource,
  type NotificationSystemSettings,
} from '@shared/notifications';

const sourceLabels: Record<NotificationSource, string> = {
  content: 'المحتوى والموافقات',
  bookings: 'المواعيد',
  camps: 'المخيمات',
  offers: 'العروض',
  campaigns: 'الحملات',
  integrations: 'التكاملات',
  privacy: 'الخصوصية',
  security: 'الأمان',
  system: 'النظام',
  manual: 'إداري',
};
const roleLabels: Record<NotificationRecipientRole, string> = {
  admin: 'مسؤول',
  manager: 'مدير',
  staff: 'موظف',
  team_leader: 'قائد فريق',
  viewer: 'مشاهد',
  user: 'مستخدم',
};

function fallbackSettings(): NotificationSystemSettings {
  const sourceEnabled = Object.fromEntries(
    NOTIFICATION_SOURCES.map((source) => [source, true])
  ) as Record<NotificationSource, boolean>;
  const recipientRoles = Object.fromEntries(
    NOTIFICATION_SOURCES.map((source) => [
      source,
      source === 'security' ? ['admin'] : ['admin', 'manager', 'staff', 'team_leader'],
    ])
  ) as Record<NotificationSource, NotificationRecipientRole[]>;
  return { enabled: true, sourceEnabled, recipientRoles };
}

export function SystemNotificationSettingsCard() {
  const { data, isLoading } = trpc.notifications.systemSettings.useQuery();
  const [settings, setSettings] = useState<NotificationSystemSettings>(fallbackSettings);
  const mutation = trpc.notifications.updateSystemSettings.useMutation({
    onSuccess: (updated) => {
      setSettings(updated);
      toast.success('تم حفظ إعدادات النظام');
    },
    onError: () => toast.error('تعذر حفظ إعدادات الإشعارات'),
  });

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const setSourceEnabled = (source: NotificationSource, checked: boolean) =>
    setSettings((current) => ({
      ...current,
      sourceEnabled: { ...current.sourceEnabled, [source]: checked },
    }));
  const setRole = (source: NotificationSource, role: NotificationRecipientRole, checked: boolean) =>
    setSettings((current) => ({
      ...current,
      recipientRoles: {
        ...current.recipientRoles,
        [source]: checked
          ? Array.from(new Set([...current.recipientRoles[source], role]))
          : current.recipientRoles[source].filter((item) => item !== role),
      },
    }));

  return (
    <Card className="border-green-100">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-green-50 p-2.5 text-green-700">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>إعدادات الإشعارات النظامية</CardTitle>
            <CardDescription>
              تحدد هذه السياسة الأحداث المفعلة والأدوار التي تتلقى تنبيهاتها.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-green-700" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <Label className="font-medium">تفعيل النظام الموحد</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  إيقافه يمنع إرسال تنبيهات العمليات الجديدة للمستلمين.
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  setSettings((current) => ({ ...current, enabled: checked }))
                }
              />
            </div>
            <div className="space-y-3">
              {NOTIFICATION_SOURCES.filter((source) => source !== 'manual').map((source) => (
                <div key={source} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="font-medium">{sourceLabels[source]}</Label>
                    <Switch
                      checked={settings.sourceEnabled[source]}
                      disabled={!settings.enabled}
                      onCheckedChange={(checked) => setSourceEnabled(source, checked)}
                    />
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="mb-2 text-xs text-muted-foreground">الأدوار المستلمة</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {NOTIFICATION_RECIPIENT_ROLES.filter(
                        (role) => role !== 'user' && role !== 'viewer'
                      ).map((role) => (
                        <label key={role} className="flex items-center gap-2 text-xs">
                          <Checkbox
                            checked={settings.recipientRoles[source].includes(role)}
                            disabled={!settings.enabled || !settings.sourceEnabled[source]}
                            onCheckedChange={(checked) => setRole(source, role, checked === true)}
                          />
                          {roleLabels[role]}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              لا تمنح هذه الصفحة صلاحية الوصول للبيانات؛ فهي تحدد فقط من يتلقى التنبيه ضمن أدواره
              الحالية.
            </div>
            <Button onClick={() => mutation.mutate(settings)} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="ml-2 h-4 w-4" />
              )}
              حفظ إعدادات النظام
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
