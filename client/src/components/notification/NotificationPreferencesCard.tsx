import { useEffect, useMemo, useState } from 'react';
import { BellRing, Check, Eye, Loader2, ShieldCheck, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import {
  NOTIFICATION_SOURCES,
  type NotificationPreferences,
  type NotificationSource,
} from '@shared/notifications';

const sourceLabels: Record<NotificationSource, string> = {
  content: 'المحتوى والموافقات',
  bookings: 'حجوزات المواعيد',
  camps: 'تسجيلات المخيمات',
  offers: 'تسجيلات العروض',
  whatsapp: 'رسائل WhatsApp',
  social_inbox: 'صندوق البريد الاجتماعي',
  tasks: 'المهام والمتابعة',
  leads: 'العملاء المحتملون',
  campaigns: 'الحملات',
  integrations: 'التكاملات',
  operations: 'عمليات النظام',
  privacy: 'الخصوصية',
  security: 'الأمان',
  system: 'النظام',
  manual: 'تنبيهات الإدارة',
};

function fallbackPreferences(): NotificationPreferences {
  return {
    enabled: true,
    highPriorityOnly: false,
    dailyDigestEnabled: false,
    visualAlertEnabled: true,
    soundAlertEnabled: false,
    enabledSources: Object.fromEntries(
      NOTIFICATION_SOURCES.map((source) => [source, true])
    ) as Record<NotificationSource, boolean>,
  };
}

export function NotificationPreferencesCard() {
  const { data, isLoading } = trpc.notifications.preferences.useQuery();
  const [preferences, setPreferences] = useState<NotificationPreferences>(fallbackPreferences);
  const mutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: (updated) => {
      setPreferences(updated);
      toast.success('تم حفظ تفضيلات الإشعارات');
    },
    onError: () => toast.error('تعذر حفظ تفضيلات الإشعارات'),
  });

  useEffect(() => {
    if (data) {
      setPreferences(data);
    }
  }, [data]);

  const visibleSources = useMemo(
    () => NOTIFICATION_SOURCES.filter((source) => source !== 'manual'),
    []
  );

  const toggleSource = (source: NotificationSource, checked: boolean) => {
    setPreferences((current) => ({
      ...current,
      enabledSources: { ...current.enabledSources, [source]: checked },
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-green-50 p-2.5 text-green-700">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>تفضيلات الإشعارات</CardTitle>
            <CardDescription>اختر التنبيهات التي تريد ظهورها في مركز الإشعارات.</CardDescription>
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
            <PreferenceRow
              label="تفعيل الإشعارات"
              description="إيقاف هذا الخيار يمنع كل إشعارات العمليات غير الحرجة."
              checked={preferences.enabled}
              onCheckedChange={(checked) =>
                setPreferences((current) => ({ ...current, enabled: checked }))
              }
            />
            <PreferenceRow
              label="التنبيهات عالية الأولوية فقط"
              description="تقليل التنبيهات للتركيز على الحالات التي تحتاج تدخلاً عاجلاً."
              checked={preferences.highPriorityOnly}
              disabled={!preferences.enabled}
              onCheckedChange={(checked) =>
                setPreferences((current) => ({ ...current, highPriorityOnly: checked }))
              }
            />
            <PreferenceRow
              label="الملخص اليومي"
              description="إشعار يومي يلخص ما بقي غير مقروء خلال آخر 24 ساعة."
              checked={preferences.dailyDigestEnabled}
              disabled={!preferences.enabled}
              onCheckedChange={(checked) =>
                setPreferences((current) => ({ ...current, dailyDigestEnabled: checked }))
              }
            />
            <div className="rounded-xl border border-primary/15 bg-primary/[0.025] p-3 sm:p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <BellRing className="h-4 w-4 text-primary" /> تنبيهات الإشعارات المهمة
              </div>
              <div className="space-y-3">
                <PreferenceRow
                  label="تنبيه مرئي داخل النظام"
                  description="يظهر تنبيه واضح عند وصول إشعار جديد عالي الأولوية أثناء استخدام لوحة التحكم."
                  checked={preferences.visualAlertEnabled}
                  disabled={!preferences.enabled}
                  icon={<Eye className="h-4 w-4 text-primary" />}
                  onCheckedChange={(checked) =>
                    setPreferences((current) => ({ ...current, visualAlertEnabled: checked }))
                  }
                />
                <PreferenceRow
                  label="تنبيه صوتي قصير"
                  description="يشغّل نغمة خفيفة للإشعارات الجديدة عالية الأولوية؛ قد تحتاج المتصفحات تفاعلاً سابقاً لتشغيل الصوت."
                  checked={preferences.soundAlertEnabled}
                  disabled={!preferences.enabled}
                  icon={<Volume2 className="h-4 w-4 text-primary" />}
                  onCheckedChange={(checked) =>
                    setPreferences((current) => ({ ...current, soundAlertEnabled: checked }))
                  }
                />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-green-700" /> المصادر المفعّلة
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleSources.map((source) => (
                  <PreferenceRow
                    key={source}
                    label={sourceLabels[source]}
                    checked={preferences.enabledSources[source]}
                    disabled={!preferences.enabled}
                    onCheckedChange={(checked) => toggleSource(source, checked)}
                    compact
                  />
                ))}
              </div>
            </div>
            <Button
              className="w-full sm:w-auto"
              onClick={() => mutation.mutate(preferences)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="ml-2 h-4 w-4" />
              )}{' '}
              حفظ التفضيلات
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PreferenceRow({
  label,
  description,
  icon,
  checked,
  onCheckedChange,
  disabled = false,
  compact = false,
}: {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${compact ? 'rounded-lg bg-background p-2.5' : 'rounded-xl border border-border p-3'}`}
    >
      <div>
        <Label className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </Label>
        {description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  );
}
