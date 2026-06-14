/**
 * WhatsApp Broadcast Page
 * صفحة إرسال البث الجماعي
 */

import { useState, useCallback } from "react";
import { trpc } from "@/lib/api/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useWhatsAppSSE, AccountUpdateEvent } from "@/hooks/integrations/useWhatsAppSSE";

export default function WhatsAppBroadcast() {
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastRecipients, setBroadcastRecipients] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  // Queries
  const broadcastStatsQuery = trpc.whatsapp.getBroadcastStats.useQuery();
  const broadcastStatusQuery = trpc.whatsapp.getBroadcastStatus.useQuery(
    { jobId: "latest" },
    { enabled: false, refetchInterval: 10000 }
  );

  // SSE: تحديث فوري عند وصول أحداث الحساب الجديدة
  useWhatsAppSSE({
    onAccountUpdate: useCallback((event: AccountUpdateEvent) => {
      toast.info(`تحديث الحساب: ${event.eventType}`);
    }, []),
  });

  // Mutations
  const sendBroadcastMutation = trpc.whatsapp.sendBroadcast.useMutation();
  const scheduleBroadcastMutation = trpc.whatsapp.scheduleBroadcast.useMutation({
    onSuccess: () => {
      toast.success("تم جدولة البث بنجاح");
      setBroadcastMessage("");
      setBroadcastRecipients("");
      setScheduledAt("");
      setIsScheduleMode(false);
      broadcastStatsQuery.refetch();
    },
    onError: () => toast.error("فشل جدولة البث"),
  });

  const handleSendBroadcast = async () => {
    if (!broadcastMessage || !broadcastRecipients) {
      toast.error("يرجى إدخال الرسالة والمستقبلين");
      return;
    }

    setIsLoading(true);
    try {
      const recipients = broadcastRecipients
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const result = await sendBroadcastMutation.mutateAsync({
        message: broadcastMessage,
        recipients,
        priority: "normal",
      });

      if (result.success) {
        toast.success(`تم إرسال البث إلى ${recipients.length} مستقبل`);
        setBroadcastMessage("");
        setBroadcastRecipients("");
        broadcastStatsQuery.refetch();
      } else {
        toast.error(result.error || "فشل إرسال البث");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إرسال البث");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleBroadcast = async () => {
    if (!broadcastMessage || !broadcastRecipients || !scheduledAt) {
      toast.error("يرجى إدخال جميع البيانات");
      return;
    }

    const recipients = broadcastRecipients.split("\n").map(r => r.trim()).filter(r => r.length > 0);
    
    scheduleBroadcastMutation.mutate({
      message: broadcastMessage,
      recipients,
      scheduledAt: new Date(scheduledAt),
      priority: "normal",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">البث الجماعي</h1>
        <p className="text-muted-foreground">إرسال رسالة إلى عدة مستقبلين في نفس الوقت</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي البث</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {broadcastStatsQuery.data?.stats?.totalBroadcasts || 0}
            </div>
            <p className="text-xs text-muted-foreground">حملات بث</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الرسائل المرسلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {broadcastStatsQuery.data?.stats?.totalMessagesSent || 0}
            </div>
            <p className="text-xs text-muted-foreground">رسالة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {broadcastStatsQuery.data?.stats?.totalMessagesSent
                ? Math.round(
                    ((broadcastStatsQuery.data.stats.totalMessagesSent -
                      broadcastStatsQuery.data.stats.totalMessagesFailed) /
                      broadcastStatsQuery.data.stats.totalMessagesSent) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">نسبة النجاح</p>
          </CardContent>
        </Card>

        {broadcastStatusQuery.data && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">حالة البث الأخير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{broadcastStatusQuery.data.status || "غير متوفر"}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Broadcast Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            إرسال بث جماعي
          </CardTitle>
          <CardDescription>إرسال رسالة إلى عدة مستقبلين في نفس الوقت</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={isScheduleMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsScheduleMode(!isScheduleMode)}
            >
              {isScheduleMode ? "إرسال الآن" : "جدولة"}
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium">الرسالة</label>
            <Textarea
              placeholder="أدخل الرسالة..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">المستقبلون (واحد في كل سطر)</label>
            <Textarea
              placeholder="967777165305&#10;967777165306&#10;967777165307"
              value={broadcastRecipients}
              onChange={(e) => setBroadcastRecipients(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>

          {isScheduleMode && (
            <div>
              <label className="text-sm font-medium">وقت الإرسال</label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <Button 
            onClick={isScheduleMode ? handleScheduleBroadcast : handleSendBroadcast} 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? (isScheduleMode ? "جاري الجدولة..." : "جاري الإرسال...") : (isScheduleMode ? "جدولة البث" : "إرسال البث")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
