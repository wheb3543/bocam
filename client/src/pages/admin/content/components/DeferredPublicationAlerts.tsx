import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarClock, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/api/trpc';

type DeferredPublicationEntityType = 'text' | 'image' | 'page' | 'section' | 'sectionButton';

const entityLabels: Record<DeferredPublicationEntityType, string> = {
  text: 'محتوى نصي',
  image: 'صورة أو وسيط',
  page: 'صفحة',
  section: 'قسم',
  sectionButton: 'زر قسم',
};

const tabByEntityType: Record<DeferredPublicationEntityType, string> = {
  text: 'text',
  image: 'images',
  page: 'pages',
  section: 'sections',
  sectionButton: 'sectionButtons',
};

interface DeferredPublicationAlertsProps {
  onNavigateToTab: (tab: string) => void;
}

/** تنبيهات العناصر التي أوقفت بوابة الجودة نشرها المجدول. */
export function DeferredPublicationAlerts({ onNavigateToTab }: DeferredPublicationAlertsProps) {
  const {
    data: blocks = [],
    isLoading,
    isFetching,
    refetch,
  } = trpc.content.auditLog.getDeferredPublicationBlocks.useQuery(
    { limit: 5 },
    { refetchInterval: 60_000, refetchOnWindowFocus: true }
  );

  if (isLoading || blocks.length === 0) {
    return null;
  }

  return (
    <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
      <AlertTriangle className="h-4 w-4" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <AlertTitle>تم إيقاف نشر مجدول بسبب فحص الجودة</AlertTitle>
            <AlertDescription>
              بقيت العناصر أدناه مسودات وأُلغي موعدها. صحح المشكلات ثم أعد جدولتها أو انشرها.
            </AlertDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-amber-300 bg-transparent"
          >
            <RefreshCw className={`ml-1 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        <div className="space-y-2">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="rounded-md border border-amber-200 bg-background/75 p-3 text-sm dark:border-amber-900/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{entityLabels[block.entityType]}</Badge>
                  <span className="font-medium">العنصر #{block.entityId}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {new Date(block.blockedAt).toLocaleString('ar-SA')}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToTab(tabByEntityType[block.entityType])}
                >
                  فتح المحتوى
                </Button>
              </div>
              <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900 dark:text-amber-100">
                {block.issues.length > 0 ? (
                  block.issues.map((issue, index) => (
                    <li key={`${block.id}-${index}`}>{issue.message}</li>
                  ))
                ) : (
                  <li>{block.reason ?? 'تعذر اجتياز فحص الجودة قبل النشر.'}</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Alert>
  );
}
