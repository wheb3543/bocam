import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  ServerCog,
  TicketCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/lib/api/trpc';

const statusLabels = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting_customer: 'بانتظاركم',
  resolved: 'محسومة',
  closed: 'مغلقة',
} as const;
const priorityLabels = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  critical: 'حرجة',
} as const;
const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString('ar-SA') : '-';

export default function SupportTicketsPage() {
  const supportTickets = trpc.license.getCentralSupportTickets.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const tickets = useMemo(
    () => (supportTickets.data?.success ? supportTickets.data.tickets : []),
    [supportTickets.data]
  );
  useEffect(() => {
    if (!selectedId && tickets.length) {
      setSelectedId(tickets[0]?.id ?? null);
    }
  }, [selectedId, tickets]);
  const selected = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0],
    [tickets, selectedId]
  );

  if (supportTickets.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="space-y-5 p-4 sm:p-6" dir="rtl">
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold">تذاكر الدعم الفني</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            متابعة بلاغات هذه النسخة وردود فريق Idea Hub ومرفقاتها.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => supportTickets.refetch()}
          disabled={supportTickets.isFetching}
        >
          <RefreshCw
            className={`ml-2 h-4 w-4 ${supportTickets.isFetching ? 'animate-spin' : ''}`}
          />
          تحديث الحالة
        </Button>
      </section>
      {!supportTickets.data?.success && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            {supportTickets.data?.error ||
              supportTickets.error?.message ||
              'تعذر الاتصال بمركز الدعم.'}
          </CardContent>
        </Card>
      )}
      {!tickets.length ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
            <TicketCheck className="h-10 w-10 text-primary" />
            <h2 className="font-semibold">لا توجد تذاكر لهذه النسخة</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              استخدم زر «طلب دعم فني» لإرسال بلاغ جديد إلى Idea Hub.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.7fr)]">
          <Card className="min-h-[32rem]">
            <CardHeader>
              <CardTitle className="text-base">تذاكر النسخة</CardTitle>
              <CardDescription>{tickets.length} تذكرة مرتبطة بهذه النسخة المرخّصة</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[25rem]">
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedId(ticket.id)}
                      className={`w-full rounded-lg border p-3 text-right transition-colors ${selected?.id === ticket.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium line-clamp-1">{ticket.subject}</span>
                        <Badge
                          variant={ticket.priority === 'critical' ? 'destructive' : 'secondary'}
                        >
                          {priorityLabels[ticket.priority]}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{ticket.ticketNumber}</span>
                        <span>{statusLabels[ticket.status]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          {selected && (
            <Card>
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle>{selected.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {selected.ticketNumber} · أُنشئت {formatDate(selected.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{statusLabels[selected.status]}</Badge>
                    <Badge variant={selected.priority === 'critical' ? 'destructive' : 'secondary'}>
                      {priorityLabels[selected.priority]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <section>
                  <h2 className="mb-3 text-sm font-semibold">المحادثة</h2>
                  <div className="space-y-3">
                    {selected.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-lg p-3 text-sm ${message.senderType === 'staff' ? 'bg-primary/10' : 'bg-muted'}`}
                      >
                        <div className="mb-1 flex justify-between gap-2 text-xs text-muted-foreground">
                          <span>
                            {message.senderType === 'staff'
                              ? message.senderName || 'فريق الدعم'
                              : 'هذه النسخة'}
                          </span>
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </section>
                {selected.attachments.length > 0 && (
                  <section>
                    <Separator className="mb-4" />
                    <h2 className="mb-3 text-sm font-semibold">المرفقات</h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selected.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">{attachment.fileName}</span>
                          </span>
                          <Download className="h-4 w-4 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </section>
                )}
                {selected.diagnostics && (
                  <section>
                    <Separator className="mb-4" />
                    <div className="mb-3 flex items-center gap-2">
                      <ServerCog className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-semibold">اللقطة التشخيصية عند الإرسال</h2>
                    </div>
                    <pre
                      className="max-h-56 overflow-auto rounded-lg bg-muted p-3 text-left text-xs"
                      dir="ltr"
                    >
                      {JSON.stringify(selected.diagnostics, null, 2)}
                    </pre>
                  </section>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
