/**
 * Broadcasts Page - Version 2
 * صفحة إدارة البث والعروض والتعميمات عبر WhatsApp
 * تستخدم البيانات الفعلية من قاعدة البيانات
 */

import React, { ChangeEvent, useMemo, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';

import { trpc } from '@/lib/api/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MultiSelect from '@/components/form/MultiSelect';
import {
  AlertCircle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Cloud,
  Download,
  Eye,
  Loader2,
  Search,
  Send,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  buildContactExportInput,
  buildContactListInput,
  buildGoogleSyncInput,
  buildRecipientQueryInput,
  buildSendRecipients,
  buildBroadcastContentSuggestion,
  applyContentSuggestionToVariables,
  CONTACT_SOURCE_KEYS,
  initializeTemplateVariables,
} from '@/lib/broadcastContracts';
import type { BroadcastContentSource, ContactSource } from '@/lib/broadcastContracts';

const CONTACT_SOURCE_LABELS: Record<(typeof CONTACT_SOURCE_KEYS)[number], string> = {
  appointments: 'مواعيد الأطباء',
  camp_registrations: 'تسجيلات المخيمات',
  offer_leads: 'طلبات العروض',
  leads: 'العملاء المحتملون',
};

const BROADCAST_STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  scheduled: 'مجدول',
  sending: 'قيد الإرسال',
  completed: 'مكتمل',
  failed: 'فشل',
};

const BROADCAST_STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  sending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200',
};

const HEARTBEAT_STATUS_LABELS: Record<string, string> = {
  active: 'نشطة',
  paused: 'متوقفة',
  not_found: 'غير موجودة',
  unavailable: 'تعذّر التحقق',
  not_created: 'لم تُنشأ بعد',
};

const HEARTBEAT_STATUS_CLASSES: Record<string, string> = {
  active: 'text-emerald-700 dark:text-emerald-300',
  paused: 'text-amber-700 dark:text-amber-300',
  not_found: 'text-destructive',
  unavailable: 'text-muted-foreground',
  not_created: 'text-muted-foreground',
};

function formatBroadcastDate(value: Date | string | null | undefined) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('ar-YE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function BroadcastStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${BROADCAST_STATUS_CLASSES[status] ?? BROADCAST_STATUS_CLASSES.draft}`}
    >
      {BROADCAST_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function BroadcastHistoryList({
  broadcasts,
  isLoading,
  error,
  emptyText,
  showSchedule,
  onOpenDetails,
}: {
  broadcasts: any[];
  isLoading: boolean;
  error?: { message?: string } | null;
  emptyText: string;
  showSchedule?: boolean;
  onOpenDetails: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> جاري تحميل سجل البث...
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          تعذّر تحميل سجل البث. {error.message || 'يرجى إعادة المحاولة.'}
        </AlertDescription>
      </Alert>
    );
  }
  if (!broadcasts.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {broadcasts.map((broadcast) => (
        <div
          key={broadcast.id}
          className="grid gap-3 rounded-lg border bg-card p-3 sm:p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold">{broadcast.name}</p>
              <BroadcastStatusBadge status={broadcast.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              أُنشئ: {formatBroadcastDate(broadcast.createdAt)}
              {showSchedule ? ` · موعد التنفيذ: ${formatBroadcastDate(broadcast.scheduledAt)}` : ''}
            </p>
            {showSchedule && (
              <p className="truncate text-xs text-muted-foreground">
                معرّف مهمة الجدولة: {broadcast.scheduleCronTaskUid || 'بانتظار إنشاء المهمة'}
              </p>
            )}
            {showSchedule && (
              <p
                className={`text-xs font-medium ${HEARTBEAT_STATUS_CLASSES[broadcast.heartbeat?.status] ?? HEARTBEAT_STATUS_CLASSES.unavailable}`}
              >
                حالة المهمة:{' '}
                {HEARTBEAT_STATUS_LABELS[broadcast.heartbeat?.status] ?? 'تعذّر التحقق'}
                {broadcast.heartbeat?.nextExecutionAt
                  ? ` · التنفيذ التالي: ${formatBroadcastDate(broadcast.heartbeat.nextExecutionAt)}`
                  : ''}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs sm:text-sm">
            <div>
              <p className="font-bold">{broadcast.recipientCount}</p>
              <p className="text-muted-foreground">المستلمون</p>
            </div>
            <div>
              <p className="font-bold text-emerald-600">{broadcast.sentCount}</p>
              <p className="text-muted-foreground">مُرسل</p>
            </div>
            <div>
              <p className="font-bold text-destructive">{broadcast.failedCount}</p>
              <p className="text-muted-foreground">فشل</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full md:w-auto"
            onClick={() => onOpenDetails(broadcast.id)}
          >
            <Eye className="ml-2 h-4 w-4" />
            التتبع
          </Button>
        </div>
      ))}
    </div>
  );
}

export function ContactsManagementTab() {
  const [search, setSearch] = useState('');
  const [googleAccessToken, setGoogleAccessToken] = useState('');
  const [selectedContactSources, setSelectedContactSources] = useState<ContactSource[]>([
    ...CONTACT_SOURCE_KEYS,
  ]);
  const [contactStatus, setContactStatus] = useState('');
  const [syncSummary, setSyncSummary] = useState<{
    syncedCount: number;
    failedCount: number;
    duplicateCount: number;
    syncLogId?: number;
  } | null>(null);

  const selectedStatuses = useMemo(() => (contactStatus ? [contactStatus] : []), [contactStatus]);
  const contactQueryInput = useMemo(
    () => buildContactListInput(search, selectedContactSources, selectedStatuses),
    [search, selectedContactSources, selectedStatuses]
  );

  const contactsQuery = trpc.broadcast.listContacts.useQuery(contactQueryInput);
  const exportMutation = trpc.broadcast.exportContacts.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        const link = document.createElement('a');
        link.href = result.data.url;
        link.download = result.data.fileName;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.click();
        toast.success(`تم تجهيز ${result.data.totalContacts} جهة اتصال للتنزيل`);
      } else {
        toast.error((result as any).error ?? 'تعذر تصدير الجهات');
      }
    },
    onError: (error) => toast.error(`تعذر تصدير الجهات: ${error.message}`),
  });

  const syncMutation = trpc.googleSync.syncContacts.useMutation({
    onSuccess: (result) => {
      const summary = (result as any).data;
      if (summary) {
        setSyncSummary(summary);
      }
      if (result.success && (summary?.failedCount ?? 0) === 0) {
        toast.success((result as any).message ?? 'تمت مزامنة الجهات مع Google');
        setGoogleAccessToken('');
      } else {
        toast.error(
          (result as any).message ?? `اكتملت المزامنة مع ${summary?.failedCount ?? 0} أخطاء`
        );
      }
    },
    onError: (error) => toast.error(`فشلت مزامنة Google: ${error.message}`),
  });

  const contactsData = contactsQuery.data?.data;
  const contacts = contactsData?.contacts ?? [];
  const queryError =
    contactsQuery.data && !contactsQuery.data.success ? contactsQuery.data.error : undefined;

  const handleExport = (exportType: 'vcf' | 'csv') => {
    exportMutation.mutate(
      buildContactExportInput(exportType, selectedContactSources, selectedStatuses)
    );
  };

  const handleGoogleSync = () => {
    const accessToken = googleAccessToken.trim();
    if (!accessToken) {
      toast.error('يرجى إدخال رمز وصول Google قبل بدء المزامنة');
      return;
    }

    setSyncSummary(null);
    syncMutation.mutate(
      buildGoogleSyncInput(accessToken, selectedContactSources, selectedStatuses)
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>إدارة جهات الاتصال</CardTitle>
            <CardDescription>
              قائمة موحدة من بيانات المواعيد والمخيمات والعروض والعملاء مع إزالة الأرقام المكررة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">مصادر الجهات</p>
                {CONTACT_SOURCE_KEYS.map((source) => (
                  <label key={source} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedContactSources.includes(source)}
                      onChange={(event) => {
                        setSelectedContactSources((current) =>
                          event.target.checked
                            ? Array.from(new Set([...current, source]))
                            : current.filter((item) => item !== source)
                        );
                      }}
                    />
                    <span>{CONTACT_SOURCE_LABELS[source]}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="contact-status-filter">
                  الحالة
                </label>
                <select
                  id="contact-status-filter"
                  value={contactStatus}
                  onChange={(event) => setContactStatus(event.target.value)}
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">كل الحالات</option>
                  <option value="new">جديد</option>
                  <option value="contacted">تم التواصل</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                  <option value="booked">محجوز</option>
                  <option value="pending">قيد الانتظار</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الهاتف أو البريد الإلكتروني"
                className="w-full rounded-md border bg-background px-10 py-2 text-sm"
                aria-label="البحث في جهات الاتصال"
              />
            </div>

            {contactsQuery.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> جاري تحميل الجهات...
              </div>
            )}
            {queryError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{queryError}</AlertDescription>
              </Alert>
            )}

            {!contactsQuery.isLoading && !queryError && contacts.length === 0 && (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                لا توجد جهات اتصال مطابقة للبحث الحالي.
              </div>
            )}

            {contacts.length > 0 && (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>إجمالي النتائج: {contactsData?.total ?? contacts.length}</span>
                  <span>عرض أول {contacts.length} جهة</span>
                </div>
                <div className="max-h-[28rem] space-y-2 overflow-y-auto">
                  {contacts.map((contact: any, index: number) => (
                    <div
                      key={`${contact.phoneNumber}-${index}`}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{contact.fullName || 'بدون اسم'}</p>
                        <p className="text-sm text-muted-foreground">{contact.phoneNumber}</p>
                      </div>
                      <div className="text-left text-xs text-muted-foreground">
                        <p>{contact.email || 'بدون بريد'}</p>
                        <p>{contact.sourceType || 'مصدر غير محدد'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تصدير الجهات</CardTitle>
              <CardDescription>تصدير النتائج الموحدة الحالية إلى ملف VCF أو CSV.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleExport('vcf')}
                disabled={exportMutation.isPending}
              >
                <Download className="ml-2 h-4 w-4" /> VCF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={exportMutation.isPending}
              >
                <Download className="ml-2 h-4 w-4" /> CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" /> مزامنة Google Contacts
              </CardTitle>
              <CardDescription>
                أدخل رمز وصول Google الممنوح من حسابك لبدء تصدير الجهات إلى Google Contacts. لا يتم
                حفظ الرمز في الواجهة بعد انتهاء العملية.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {syncSummary && (
                <Alert variant={syncSummary.failedCount > 0 ? 'destructive' : 'default'}>
                  <AlertDescription>
                    تمت المزامنة: {syncSummary.syncedCount}، فشل: {syncSummary.failedCount}، مكرر تم
                    تجاوزه: {syncSummary.duplicateCount}
                    {syncSummary.syncLogId ? ` (سجل #${syncSummary.syncLogId})` : ''}
                  </AlertDescription>
                </Alert>
              )}
              <input
                type="password"
                value={googleAccessToken}
                onChange={(event) => setGoogleAccessToken(event.target.value)}
                placeholder="Google access token"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                aria-label="رمز وصول Google"
                autoComplete="off"
              />
              <Button
                className="w-full"
                onClick={handleGoogleSync}
                disabled={syncMutation.isPending || !googleAccessToken.trim()}
              >
                {syncMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {syncMutation.isPending ? 'جاري المزامنة...' : 'مزامنة مع Google'}
              </Button>
              <p className="text-xs text-muted-foreground">
                المصادر المشمولة:{' '}
                {CONTACT_SOURCE_KEYS.map((source) => CONTACT_SOURCE_LABELS[source]).join('، ')}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export type TemplatePickerItem = {
  id: number;
  name: string;
  metaName?: string | null;
  content?: string | null;
  variables?: string[] | null;
  buttons?: Array<{ type?: string; url?: string; example?: string[] }> | null;
};

type TemplatePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: TemplatePickerItem[];
  selectedTemplateId: number | null;
  onSelect: (template: TemplatePickerItem) => void;
};

export function TemplatePickerDialog({
  open,
  onOpenChange,
  templates,
  selectedTemplateId,
  onSelect,
}: TemplatePickerDialogProps) {
  const [search, setSearch] = useState('');
  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('ar');
    if (!term) {
      return templates;
    }
    return templates.filter((template) =>
      [template.name, template.metaName, template.content]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase('ar').includes(term))
    );
  }, [search, templates]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] p-0 sm:max-w-5xl" dir="rtl">
        <DialogHeader className="border-b px-5 py-4 text-right sm:px-6">
          <DialogTitle>القوالب المعتمدة</DialogTitle>
          <DialogDescription>
            اختر القالب المناسب؛ يُملأ الاسم تلقائياً لكل مستلم، بينما تظهر بقية المتغيرات بعد
            الاختيار.
          </DialogDescription>
        </DialogHeader>
        <div className="border-b bg-muted/20 px-4 py-3 sm:px-5">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث باسم القالب أو محتواه..."
              aria-label="ابحث باسم القالب أو محتواه..."
              className="h-10 w-full rounded-md border bg-background py-2 pr-9 pl-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {filteredTemplates.length} قالب متاح للعرض
          </p>
        </div>
        <div className="max-h-[62vh] overflow-y-auto p-3 sm:p-5">
          {filteredTemplates.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              لا توجد قوالب مطابقة للبحث.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((template) => {
                const manualVariables =
                  template.variables?.filter((variable) => variable !== 'name') ?? [];
                const isSelected = selectedTemplateId === template.id;
                return (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => {
                      onSelect(template);
                      onOpenChange(false);
                    }}
                    className={`flex min-h-48 flex-col rounded-lg border p-4 text-right transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'hover:border-primary/60 hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{template.name}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {template.metaName || 'قالب Meta'}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />}
                    </div>
                    <p className="mt-4 line-clamp-4 flex-1 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                      {template.content || 'لا توجد معاينة نصية لهذا القالب.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="rounded bg-secondary px-2 py-1 text-xs">الاسم تلقائي</span>
                      {manualVariables.map((variable) => (
                        <span
                          key={variable}
                          className="rounded border bg-background px-2 py-1 text-xs"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function WhatsAppBroadcast() {
  return <BroadcastsContent />;
}

export function BroadcastsContent() {
  const { user } = useAuth();
  const trpcUtils = trpc.useUtils();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [contentSourceSelection, setContentSourceSelection] = useState('');
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [headerImageError, setHeaderImageError] = useState('');
  const [headerImageReady, setHeaderImageReady] = useState(false);
  const [isUploadingHeaderImage, setIsUploadingHeaderImage] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<number | null>(null);

  // Fetch real data. The routers return wrapped responses, not raw arrays.
  const { data: templatesData, isLoading: templatesLoading } =
    trpc.broadcastData.getTemplates.useQuery();
  const { data: doctorsData, isLoading: doctorsLoading } = trpc.broadcastData.getDoctors.useQuery();
  const { data: campsData, isLoading: campsLoading } = trpc.broadcastData.getCamps.useQuery();
  const { data: offersData, isLoading: offersLoading } = trpc.broadcastData.getOffers.useQuery();
  const templateRequirementsQuery = trpc.broadcastExecute.getTemplateRequirements.useQuery(
    { templateId: selectedTemplate ?? 0 },
    { enabled: Boolean(selectedTemplate) }
  );

  const templateList = useMemo(() => templatesData?.templates ?? [], [templatesData?.templates]);
  const doctorList = useMemo(() => doctorsData?.doctors ?? [], [doctorsData?.doctors]);
  const campList = useMemo(() => campsData?.camps ?? [], [campsData?.camps]);
  const offerList = useMemo(() => offersData?.offers ?? [], [offersData?.offers]);

  const contentSourceOptions = useMemo(
    () => [
      ...doctorList.map((doctor) => ({
        value: `doctor:${doctor.id}`,
        label: `طبيب — ${doctor.name}`,
        source: {
          kind: 'doctor' as const,
          id: doctor.id,
          title: doctor.name,
          slug: doctor.slug,
          specialty: doctor.specialty,
          description: doctor.bio,
          imageUrl: doctor.image,
        } satisfies BroadcastContentSource,
      })),
      ...campList.map((camp) => ({
        value: `camp:${camp.id}`,
        label: `مخيم — ${camp.name}`,
        source: {
          kind: 'camp' as const,
          id: camp.id,
          title: camp.name,
          slug: camp.slug,
          description: camp.description,
          imageUrl: camp.imageUrl,
        } satisfies BroadcastContentSource,
      })),
      ...offerList.map((offer) => ({
        value: `offer:${offer.id}`,
        label: `عرض — ${offer.title}`,
        source: {
          kind: 'offer' as const,
          id: offer.id,
          title: offer.title,
          slug: offer.slug,
          description: offer.description,
          imageUrl: offer.imageUrl,
        } satisfies BroadcastContentSource,
      })),
    ],
    [doctorList, campList, offerList]
  );
  const selectedContentSource = contentSourceOptions.find(
    (option) => option.value === contentSourceSelection
  )?.source;
  const contentSuggestion = selectedContentSource
    ? buildBroadcastContentSuggestion(selectedContentSource)
    : undefined;

  // Translate the UI source keys into the actual getRecipients contract.
  const recipientQueryInput = buildRecipientQueryInput(selectedSources);

  const { data: recipientsData, isLoading: recipientsLoading } =
    trpc.broadcastData.getRecipients.useQuery(recipientQueryInput, {
      enabled: selectedSources.length > 0,
    });
  const recipientList = recipientsData?.recipients ?? [];
  const scheduledHistoryQuery = trpc.broadcastScheduling.getScheduledBroadcasts.useQuery();
  const sentHistoryQuery = trpc.broadcastExecute.getBroadcasts.useQuery({
    limit: 100,
    offset: 0,
    statuses: ['completed', 'failed', 'sending'],
  });
  const reportQuery = trpc.broadcastExecute.getBroadcastReports.useQuery({ limit: 100 });
  const detailsQuery = trpc.broadcastExecute.getBroadcastDetails.useQuery(
    { broadcastId: selectedBroadcastId ?? 0 },
    { enabled: selectedBroadcastId !== null }
  );

  // Send broadcast mutation
  const sendBroadcast = trpc.broadcastExecute.sendBroadcast.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        const failureNotice = result.failureCount > 0 ? `، وفشل ${result.failureCount}` : '';
        toast.success(
          `تم قبول إرسال البث إلى ${result.sentCount} من ${result.totalRecipients} جهة اتصال${failureNotice}`
        );
        setSelectedTemplate(null);
        setTemplateVariables({});
        setSelectedSources([]);
        void trpcUtils.broadcastExecute.getBroadcasts.invalidate();
        void trpcUtils.broadcastExecute.getBroadcastReports.invalidate();
      } else {
        toast.error(
          `لم يقبل Meta أي رسالة من هذا البث. عدد المحاولات الفاشلة: ${result.failureCount}`
        );
      }
    },
    onError: (error) => {
      toast.error('خطأ: ' + error.message);
    },
  });

  // Schedule broadcast mutation
  const scheduleBroadcast = trpc.broadcastScheduling.createScheduledBroadcast.useMutation({
    onSuccess: () => {
      toast.success('تم جدولة البث بنجاح');
      setSelectedTemplate(null);
      setTemplateVariables({});
      setSelectedSources([]);
      void trpcUtils.broadcastExecute.getBroadcasts.invalidate();
      void trpcUtils.broadcastExecute.getBroadcastReports.invalidate();
      void trpcUtils.broadcastScheduling.getScheduledBroadcasts.invalidate();
    },
    onError: (error) => {
      toast.error('خطأ: ' + error.message);
    },
  });

  const selectedRecipientPayload = buildSendRecipients(recipientList);
  const scheduledBroadcasts = scheduledHistoryQuery.data ?? [];
  const sentBroadcasts = sentHistoryQuery.data?.broadcasts ?? [];
  const reports = useMemo(() => reportQuery.data?.reports ?? [], [reportQuery.data?.reports]);
  const reportTotals = useMemo(
    () =>
      reports.reduce(
        (
          totals: {
            campaigns: number;
            recipients: number;
            sent: number;
            failed: number;
            delivered: number;
            read: number;
          },
          report: {
            broadcast: { recipientCount: number; sentCount: number; failedCount: number };
            recipientStats: { delivered?: number; read?: number };
          }
        ) => ({
          campaigns: totals.campaigns + 1,
          recipients: totals.recipients + report.broadcast.recipientCount,
          sent: totals.sent + report.broadcast.sentCount,
          failed: totals.failed + report.broadcast.failedCount,
          delivered: totals.delivered + (report.recipientStats.delivered ?? 0),
          read: totals.read + (report.recipientStats.read ?? 0),
        }),
        { campaigns: 0, recipients: 0, sent: 0, failed: 0, delivered: 0, read: 0 }
      ),
    [reports]
  );

  const selectedTemplateData = templateList.find((template) => template.id === selectedTemplate);
  const recipientCount = recipientsData?.totalCount ?? 0;
  const selectedDoctorSources = selectedSources.filter((source) => source.startsWith('doctor_'));
  const selectedCampSources = selectedSources.filter((source) => source.startsWith('camp_'));
  const selectedOfferSources = selectedSources.filter((source) => source.startsWith('offer_'));
  const selectedHeaderDoctorId =
    selectedDoctorSources.length === 1
      ? Number(selectedDoctorSources[0].replace('doctor_', ''))
      : undefined;
  const selectedHeaderDoctor = selectedHeaderDoctorId
    ? doctorList.find((doctor) => doctor.id === selectedHeaderDoctorId)
    : undefined;
  const suggestedHeaderImageUrl = selectedHeaderDoctor?.image ?? '';
  const resolvedHeaderImageUrl = headerImageUrl.trim() || suggestedHeaderImageUrl;
  const requiresImageHeader = templateRequirementsQuery.data?.requiresImageHeader === true;
  const doctorsOptions = useMemo(
    () => doctorList.map((doctor) => ({ value: `doctor_${doctor.id}`, label: doctor.name })),
    [doctorList]
  );
  const campsOptions = useMemo(
    () => campList.map((camp) => ({ value: `camp_${camp.id}`, label: camp.name })),
    [campList]
  );
  const offersOptions = useMemo(
    () => offerList.map((offer) => ({ value: `offer_${offer.id}`, label: offer.title })),
    [offerList]
  );

  const replaceSourceGroup = (prefix: string, selectedGroup: string[]) => {
    setSelectedSources((current) => [
      ...current.filter((source) => !source.startsWith(prefix)),
      ...selectedGroup,
    ]);
  };

  const handleTemplateSelect = (template: TemplatePickerItem) => {
    setSelectedTemplate(template.id);
    const initialVariables = initializeTemplateVariables(template);
    setTemplateVariables(
      contentSuggestion
        ? applyContentSuggestionToVariables(initialVariables, contentSuggestion)
        : initialVariables
    );
    setHeaderImageUrl(contentSuggestion?.imageUrl ?? '');
    setHeaderImageError('');
    setHeaderImageReady(false);
    setTemplatePickerOpen(false);
  };

  const handleContentSourceSelection = (value: string) => {
    setContentSourceSelection(value);
    const suggestion = contentSourceOptions.find((option) => option.value === value)?.source;
    if (!suggestion) {
      return;
    }
    const nextSuggestion = buildBroadcastContentSuggestion(suggestion);
    setTemplateVariables((current) => applyContentSuggestionToVariables(current, nextSuggestion));
    setHeaderImageUrl(nextSuggestion.imageUrl ?? '');
    setHeaderImageError('');
    setHeaderImageReady(false);
  };

  const handleHeaderImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile) {
      return;
    }

    if (!imageFile.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      toast.error('يجب ألا يتجاوز حجم الصورة 10 ميغابايت');
      return;
    }

    setIsUploadingHeaderImage(true);
    setHeaderImageError('');
    setHeaderImageReady(false);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('folder', 'broadcast-headers');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok || !result.url) {
        throw new Error(result.error || 'تعذر رفع الصورة');
      }

      setHeaderImageUrl(result.url);
      toast.success('تم رفع صورة رأس القالب بنجاح');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر رفع الصورة');
    } finally {
      setIsUploadingHeaderImage(false);
      event.target.value = '';
    }
  };

  const handleSendBroadcast = async () => {
    if (!selectedTemplate) {
      toast.error('يرجى اختيار قالب');
      return;
    }

    if (selectedSources.length === 0) {
      toast.error('يرجى اختيار مصدر واحد على الأقل');
      return;
    }

    if (recipientCount === 0) {
      toast.error('لا توجد جهات اتصال للإرسال إليها');
      return;
    }

    if (templateRequirementsQuery.isLoading) {
      toast.error('يرجى انتظار التحقق من متطلبات قالب Meta قبل الإرسال.');
      return;
    }

    if (requiresImageHeader && (!resolvedHeaderImageUrl || headerImageError || !headerImageReady)) {
      toast.error('تأكد من تحميل معاينة صورة رأس صالحة قبل الإرسال.');
      return;
    }

    try {
      if (isScheduled) {
        if (!scheduledDate || !scheduledTime) {
          toast.error('يرجى تحديد التاريخ والوقت');
          return;
        }

        await scheduleBroadcast.mutateAsync({
          templateId: selectedTemplate,
          variables: templateVariables,
          headerImageUrl: resolvedHeaderImageUrl || undefined,
          recipients: selectedRecipientPayload,
          scheduledDate,
          scheduledTime,
        });
      } else {
        await sendBroadcast.mutateAsync({
          templateId: selectedTemplate,
          variables: templateVariables,
          headerDoctorId: selectedHeaderDoctorId,
          headerImageUrl: resolvedHeaderImageUrl || undefined,
          recipients: selectedRecipientPayload,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl py-1 sm:py-2">
      <Tabs defaultValue="send" className="w-full">
        <div
          className="-mx-4 mb-4 overflow-x-auto border-y border-border/70 bg-background/95 px-4 py-2 scrollbar-none sm:mx-0 sm:mb-6 sm:rounded-xl sm:border sm:px-2"
          aria-label="تبويبات إدارة البث"
        >
          <TabsList className="flex h-10 w-max min-w-[33rem] flex-nowrap gap-1 bg-muted/60 p-1 sm:w-full sm:min-w-0 sm:justify-evenly">
            <TabsTrigger
              value="send"
              className="h-8 min-w-[5.75rem] shrink-0 whitespace-nowrap px-3 text-xs sm:flex-1 sm:text-sm"
            >
              إعداد البث
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="h-8 min-w-[5.75rem] shrink-0 whitespace-nowrap px-3 text-xs sm:flex-1 sm:text-sm"
            >
              المجدولة
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="h-8 min-w-[5.75rem] shrink-0 whitespace-nowrap px-3 text-xs sm:flex-1 sm:text-sm"
            >
              المرسلة
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="h-8 min-w-[5.75rem] shrink-0 whitespace-nowrap px-3 text-xs sm:flex-1 sm:text-sm"
            >
              التقارير
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="h-8 min-w-[6.5rem] shrink-0 whitespace-nowrap px-3 text-xs sm:flex-1 sm:text-sm"
            >
              إدارة الجهات
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="send">
          {/* Main Content */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>اختيار القالب</CardTitle>
                  <CardDescription>
                    اختر قالباً معتمداً من Meta ثم أكمل المتغيرات المطلوبة فقط.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {templatesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> جاري تحميل القوالب...
                    </div>
                  ) : templateList.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setTemplatePickerOpen(true)}
                        className="group flex w-full flex-col items-stretch gap-3 rounded-lg border bg-muted/20 p-3 text-right transition-colors hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring sm:flex-row sm:items-center sm:justify-between sm:p-4"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            القالب المختار
                          </p>
                          <p className="truncate font-semibold">
                            {selectedTemplateData?.name ?? 'لم يتم اختيار قالب بعد'}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {selectedTemplateData?.content ?? 'اضغط لفتح قائمة القوالب المعتمدة'}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground group-hover:bg-primary/90 sm:mr-4">
                          اختيار قالب
                        </span>
                      </button>
                      {selectedTemplateData && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>متغير الاسم يُملأ تلقائياً من بيانات المستلم.</span>
                          <span className="rounded bg-secondary px-2 py-1">
                            {selectedTemplateData.variables?.filter(
                              (variable: string) => variable !== 'name'
                            ).length ?? 0}{' '}
                            متغيرات يدوية
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>لا توجد قوالب معتمدة</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <TemplatePickerDialog
                open={templatePickerOpen}
                onOpenChange={setTemplatePickerOpen}
                templates={templateList}
                selectedTemplateId={selectedTemplate}
                onSelect={handleTemplateSelect}
              />

              <Card>
                <CardHeader>
                  <CardTitle>
                    محتوى البث من صفحة موجودة{' '}
                    <span className="text-sm font-normal text-muted-foreground">(اختياري)</span>
                  </CardTitle>
                  <CardDescription>
                    اختر طبيباً أو مخيماً أو عرضاً لاقتراح النص والرابط والصورة تلقائياً. لا يغير
                    ذلك قائمة المستلمين، ويمكنك تعديل كل حقل بعد الملء.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="text-sm font-medium" htmlFor="broadcast-content-source">
                    المصدر
                  </label>
                  <select
                    id="broadcast-content-source"
                    value={contentSourceSelection}
                    onChange={(event) => handleContentSourceSelection(event.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">بدون مصدر محتوى — أدخل المحتوى يدوياً</option>
                    {contentSourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {contentSuggestion && (
                    <div className="grid gap-4 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[120px_1fr] sm:p-4">
                      {contentSuggestion.imageUrl ? (
                        <img
                          src={contentSuggestion.imageUrl}
                          alt={`صورة ${selectedContentSource?.title}`}
                          className="h-28 w-full rounded-md bg-background object-contain"
                        />
                      ) : (
                        <div className="flex h-28 items-center justify-center rounded-md border border-dashed bg-background text-xs text-muted-foreground">
                          لا توجد صورة محفوظة
                        </div>
                      )}
                      <div className="min-w-0 space-y-2">
                        <p className="font-semibold">{selectedContentSource?.title}</p>
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {contentSuggestion.announcementText}
                        </p>
                        <a
                          href={contentSuggestion.pageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-sm text-primary underline"
                          dir="ltr"
                        >
                          {contentSuggestion.pageUrl}
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTemplateVariables((current) =>
                              applyContentSuggestionToVariables(current, contentSuggestion)
                            );
                            setHeaderImageUrl(contentSuggestion.imageUrl ?? '');
                            setHeaderImageError('');
                            setHeaderImageReady(false);
                          }}
                        >
                          إعادة تطبيق الاقتراح
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Template Variables */}
              {selectedTemplateData && Object.keys(templateVariables).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>متغيرات القالب</CardTitle>
                    <CardDescription>أكمل متغيرات القالب</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.keys(templateVariables).map((key) => (
                      <div key={key}>
                        <label className="text-sm font-medium">
                          {key.startsWith('button_') ? 'رابط زر الحجز' : key}
                        </label>
                        <input
                          type="text"
                          value={templateVariables[key]}
                          onChange={(e) =>
                            setTemplateVariables({
                              ...templateVariables,
                              [key]: e.target.value,
                            })
                          }
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder={
                            key.startsWith('button_') ? 'أدخل رابط صفحة الحجز' : `أدخل ${key}`
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {selectedTemplateData &&
                (templateRequirementsQuery.isLoading || requiresImageHeader) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>صورة رأس القالب</CardTitle>
                      <CardDescription>
                        {templateRequirementsQuery.isLoading
                          ? 'جاري التحقق من متطلبات وسائط القالب في Meta...'
                          : 'هذا القالب يتطلب صورة في رأس الرسالة. يمكنك رفع صورة جديدة أو إدخال رابط صورة عام.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {requiresImageHeader && (
                        <>
                          {suggestedHeaderImageUrl && !headerImageUrl && (
                            <Alert>
                              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <span>
                                  سيُستخدم تلقائياً اقتراح صورة الطبيب المختار:{' '}
                                  {selectedHeaderDoctor?.name}.
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setHeaderImageUrl(suggestedHeaderImageUrl)}
                                >
                                  استخدام صورة الطبيب الآن
                                </Button>
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                            <div>
                              <label
                                className="text-sm font-medium"
                                htmlFor="broadcast-header-image-url"
                              >
                                رابط الصورة
                              </label>
                              <input
                                id="broadcast-header-image-url"
                                type="url"
                                value={headerImageUrl}
                                onChange={(event) => {
                                  setHeaderImageUrl(event.target.value);
                                  setHeaderImageError('');
                                  setHeaderImageReady(false);
                                }}
                                placeholder={
                                  suggestedHeaderImageUrl || 'https://example.com/header.jpg'
                                }
                                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                dir="ltr"
                              />
                            </div>
                            <div>
                              <label className="inline-flex h-10 cursor-pointer items-center rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted">
                                {isUploadingHeaderImage ? (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {isUploadingHeaderImage ? 'جاري الرفع...' : 'رفع صورة'}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  className="sr-only"
                                  disabled={isUploadingHeaderImage}
                                  onChange={handleHeaderImageUpload}
                                />
                              </label>
                            </div>
                          </div>

                          {resolvedHeaderImageUrl && (
                            <div className="overflow-hidden rounded-md border bg-muted/20 p-3">
                              <p className="mb-2 text-xs text-muted-foreground">
                                معاينة رأس القالب
                              </p>
                              <img
                                src={resolvedHeaderImageUrl}
                                alt="معاينة صورة رأس قالب البث"
                                className="h-44 w-full rounded object-contain bg-background"
                                onLoad={() => {
                                  setHeaderImageError('');
                                  setHeaderImageReady(true);
                                }}
                                onError={() => {
                                  setHeaderImageReady(false);
                                  setHeaderImageError(
                                    'تعذر تحميل الصورة من الرابط الحالي. تأكد من أنه رابط صورة عام ومتاح.'
                                  );
                                }}
                              />
                              {headerImageError && (
                                <p className="mt-2 text-sm text-destructive">{headerImageError}</p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

              {/* Recipient Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>اختيار جهات الاتصال</CardTitle>
                  <CardDescription>اختر مصدر واحد أو أكثر</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        الأطباء <span className="text-muted-foreground">({doctorList.length})</span>
                      </label>
                      {doctorsLoading ? (
                        <div className="h-10 animate-pulse rounded-md bg-muted" />
                      ) : (
                        <MultiSelect
                          options={doctorsOptions}
                          selected={selectedDoctorSources}
                          onChange={(values) => replaceSourceGroup('doctor_', values)}
                          placeholder="اختر الأطباء"
                          itemLabel="طبيب"
                          pluralLabel="أطباء"
                          searchPlaceholder="ابحث باسم الطبيب..."
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        المخيمات <span className="text-muted-foreground">({campList.length})</span>
                      </label>
                      {campsLoading ? (
                        <div className="h-10 animate-pulse rounded-md bg-muted" />
                      ) : (
                        <MultiSelect
                          options={campsOptions}
                          selected={selectedCampSources}
                          onChange={(values) => replaceSourceGroup('camp_', values)}
                          placeholder="اختر المخيمات"
                          itemLabel="مخيم"
                          pluralLabel="مخيمات"
                          searchPlaceholder="ابحث باسم المخيم..."
                        />
                      )}
                    </div>
                    <div className="space-y-2 sm:col-span-2 xl:col-span-1">
                      <label className="text-sm font-medium">
                        العروض <span className="text-muted-foreground">({offerList.length})</span>
                      </label>
                      {offersLoading ? (
                        <div className="h-10 animate-pulse rounded-md bg-muted" />
                      ) : (
                        <MultiSelect
                          options={offersOptions}
                          selected={selectedOfferSources}
                          onChange={(values) => replaceSourceGroup('offer_', values)}
                          placeholder="اختر العروض"
                          itemLabel="عرض"
                          pluralLabel="عروض"
                          searchPlaceholder="ابحث باسم العرض..."
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 rounded-lg border bg-muted/25 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={selectedSources.includes('all_leads')}
                        onChange={(event) =>
                          setSelectedSources((current) =>
                            event.target.checked
                              ? Array.from(new Set([...current, 'all_leads']))
                              : current.filter((source) => source !== 'all_leads')
                          )
                        }
                      />
                      إضافة جميع العملاء المحتملين
                    </label>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground sm:items-center">
                      <Users className="h-4 w-4" />
                      تم اختيار {selectedDoctorSources.length} طبيب، {selectedCampSources.length}{' '}
                      مخيم، {selectedOfferSources.length} عرض
                      {selectedSources.includes('all_leads') ? '، والعملاء المحتملون' : ''}.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              {/* Recipients Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>معاينة المستقبلين</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-3xl font-bold text-primary">{recipientCount}</div>
                    <p className="text-sm text-muted-foreground">جهة اتصال</p>
                  </div>

                  {recipientsLoading && <div>جاري تحميل المستقبلين...</div>}

                  {recipientList.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recipientList.slice(0, 5).map((r, i) => (
                        <div key={i} className="text-sm p-2 bg-background rounded border">
                          <p className="font-medium">{r.fullName}</p>
                          <p className="text-muted-foreground">{r.phone}</p>
                        </div>
                      ))}
                      {recipientList.length > 5 && (
                        <p className="text-sm text-muted-foreground">
                          +{recipientList.length - 5} آخرون
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Scheduling */}
              <Card>
                <CardHeader>
                  <CardTitle>خيارات الإرسال</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                    />
                    <span>جدولة الإرسال</span>
                  </label>

                  {isScheduled && (
                    <>
                      <div>
                        <label className="text-sm font-medium">التاريخ</label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">الوقت</label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleSendBroadcast}
                    disabled={
                      !selectedTemplate ||
                      selectedSources.length === 0 ||
                      recipientCount === 0 ||
                      sendBroadcast.isPending ||
                      scheduleBroadcast.isPending
                    }
                    className="w-full"
                    size="lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isScheduled ? 'جدولة الإرسال' : 'إرسال الآن'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsManagementTab />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6" dir="rtl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-blue-600" />
                سجل البثوث المجدولة
              </CardTitle>
              <CardDescription>
                يعرض البثوث التي تنتظر التنفيذ وموعدها ومعرّف مهمة الجدولة وحالتها الفعلية.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BroadcastHistoryList
                broadcasts={scheduledBroadcasts}
                isLoading={scheduledHistoryQuery.isLoading}
                error={scheduledHistoryQuery.error}
                emptyText="لا توجد بثوث مجدولة حالياً."
                showSchedule
                onOpenDetails={setSelectedBroadcastId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-6" dir="rtl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-600" />
                سجل البثوث المرسلة
              </CardTitle>
              <CardDescription>
                سجل الإرسال الفعلي وحالة كل حملة وعدد الرسائل المقبولة أو الفاشلة لدى Meta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BroadcastHistoryList
                broadcasts={sentBroadcasts}
                isLoading={sentHistoryQuery.isLoading}
                error={sentHistoryQuery.error}
                emptyText="لا توجد بثوث مرسلة بعد."
                onOpenDetails={setSelectedBroadcastId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6" dir="rtl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-muted/30 p-3.5 text-xs gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground font-medium">
                هل تبحث عن مؤشرات أداء القناة الشاملة ومعدلات الاستجابة والتكاليف؟
              </span>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs h-8 gap-1.5 w-fit">
              <Link href="/admin/whatsapp/analytics">فتح مركز التحليلات الموحد 📊</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ['الحملات', reportTotals.campaigns, 'text-primary'],
              ['إجمالي المستلمين', reportTotals.recipients, 'text-foreground'],
              ['الرسائل المُرسلة', reportTotals.sent, 'text-emerald-600'],
              ['الفاشلة', reportTotals.failed, 'text-destructive'],
              ['تم التسليم', reportTotals.delivered, 'text-blue-600'],
              ['تمت القراءة', reportTotals.read, 'text-violet-600'],
            ].map(([label, value, className]) => (
              <Card key={String(label)}>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`mt-2 text-3xl font-bold ${className}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                تقارير وتتبع البثوث
              </CardTitle>
              <CardDescription>
                افتح تفاصيل أي بث لمراجعة حالة كل مستلم ومعرف رسالة Meta وأسباب الفشل عند توفرها.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BroadcastHistoryList
                broadcasts={reports.map((report: any) => report.broadcast)}
                isLoading={reportQuery.isLoading}
                error={reportQuery.error}
                emptyText="لا توجد بيانات تقارير بعد."
                onOpenDetails={setSelectedBroadcastId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={selectedBroadcastId !== null}
        onOpenChange={(open) => !open && setSelectedBroadcastId(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل وتتبع البث</DialogTitle>
            <DialogDescription>
              النتائج المسجلة لكل مستلم بعد طلب الإرسال إلى Meta.
            </DialogDescription>
          </DialogHeader>
          {detailsQuery.isLoading && (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري تحميل التفاصيل...
            </div>
          )}
          {detailsQuery.data && (
            <div className="space-y-5">
              {detailsQuery.data.trackingMode === 'aggregate_only' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    هذا سجل تاريخي؛ تتوفر له عدادات الحملة الإجمالية، لكن لا تتوفر نتائج منفصلة لكل
                    مستلم لأن التتبع التفصيلي بدأ بعد إنشائه.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-3 sm:grid-cols-5">
                {Object.entries(detailsQuery.data.recipientStats).map(([status, count]) => (
                  <div key={status} className="rounded-lg border p-3 text-center">
                    <BroadcastStatusBadge status={status} />
                    <p className="mt-2 text-xl font-bold">{count as number}</p>
                  </div>
                ))}
              </div>
              {detailsQuery.data.trackingMode === 'per_recipient' && (
                <div className="rounded-lg border">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3 border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
                    <span>المستلم</span>
                    <span>الحالة</span>
                    <span>التوقيت</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {detailsQuery.data.recipients.map((recipient: any) => (
                      <div
                        key={recipient.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3 border-b px-3 py-3 text-sm last:border-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{recipient.fullName || 'بدون اسم'}</p>
                          <p className="text-xs text-muted-foreground" dir="ltr">
                            {recipient.phoneNumber}
                          </p>
                          {recipient.errorInfo && (
                            <p className="mt-1 text-xs text-destructive">{recipient.errorInfo}</p>
                          )}
                        </div>
                        <BroadcastStatusBadge status={recipient.status} />
                        <span className="text-xs text-muted-foreground">
                          {formatBroadcastDate(
                            recipient.readAt || recipient.deliveredAt || recipient.sentAt
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detailsQuery.data.results.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  معرّفات رسائل Meta المسجلة:{' '}
                  {
                    detailsQuery.data.results.filter((result: any) => result.whatsappMessageId)
                      .length
                  }
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
