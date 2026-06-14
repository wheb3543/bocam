/**
 * WhatsAppStatusBadge — مكون شارة حالة إشعار WhatsApp
 * يُستخدم في صفحات المواعيد والتسجيلات والعروض
 * يعرض حالة الإشعار مع زر إعادة الإرسال
 * يستخدم SSE للتحديث الفوري بدلاً من polling
 */

import { useState, useCallback } from "react";
import { trpc } from "@/lib/api/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircle, RefreshCw, CheckCheck, Clock, XCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useWhatsAppSSE } from "@/hooks/integrations/useWhatsAppSSE";

type EntityType = "appointment" | "camp_registration" | "offer_lead";

interface WhatsAppStatusBadgeProps {
  entityType: EntityType;
  entityId: number;
  /** رقم هاتف الكيان (لمطابقة أحداث SSE) */
  phoneNumber?: string | null;
  /** إظهار زر إعادة الإرسال */
  showResend?: boolean;
  /** حجم الشارة */
  size?: "sm" | "default";
}

const statusConfig = {
  sent: {
    label: "أُرسل",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Send,
  },
  delivered: {
    label: "تم التسليم",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCheck,
  },
  read: {
    label: "تمت القراءة",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCheck,
  },
  pending: {
    label: "في الانتظار",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  failed: {
    label: "فشل الإرسال",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
};

// ترتيب الحالات من الأدنى للأعلى (لمنع التراجع)
const statusRank: Record<string, number> = {
  pending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 1, // failed لا يتجاوز delivered/read
};

export function WhatsAppStatusBadge({
  entityType,
  entityId,
  phoneNumber,
  showResend = true,
  size = "sm",
}: WhatsAppStatusBadgeProps) {
  const [isResending, setIsResending] = useState(false);
  // حالة محلية للتحديث الفوري عبر SSE
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.whatsapp.getEntityWhatsAppStatus.useQuery(
    { entityType, entityId },
    {
      // staleTime أطول لأن SSE يتولى التحديثات الفورية
      staleTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    }
  );

  // ── SSE: تحديث فوري عند تغيير حالة الرسالة ──────────────────────────────
  const handleMessageStatusUpdate = useCallback(
    (event: { status: string; errorCode?: number; errorTitle?: string }) => {
      // نحدّث فقط إذا كانت الحالة الجديدة أعلى رتبة من الحالية
      const currentStatus = liveStatus || data?.status || "pending";
      const currentRank = statusRank[currentStatus] ?? 0;
      const newRank = statusRank[event.status] ?? 0;

      if (event.status === "failed" || newRank > currentRank) {
        setLiveStatus(event.status);
        // تحديث الـ cache في الخلفية
        utils.whatsapp.getEntityWhatsAppStatus.invalidate({ entityType, entityId });
      }
    },
    [liveStatus, data?.status, utils, entityType, entityId]
  );

  useWhatsAppSSE({
    onMessageStatusUpdate: handleMessageStatusUpdate,
  });

  const resendMutation = trpc.whatsapp.resendNotification.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("✅ تم إعادة إرسال رسالة WhatsApp بنجاح");
        setLiveStatus("sent");
        utils.whatsapp.getEntityWhatsAppStatus.invalidate({ entityType, entityId });
      } else {
        toast.error(`❌ فشل الإرسال: ${result.error}`);
      }
      setIsResending(false);
    },
    onError: (error) => {
      toast.error(`❌ خطأ: ${error.message}`);
      setIsResending(false);
    },
  });

  const handleResend = () => {
    setIsResending(true);
    resendMutation.mutate({ entityType, entityId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
        <span className="text-xs text-gray-400">جاري التحقق...</span>
      </div>
    );
  }

  // الحالة الفعلية: SSE أولاً ثم DB
  const status = (liveStatus || data?.status) as keyof typeof statusConfig | null;
  const config = status ? statusConfig[status] : null;
  const Icon = config?.icon || MessageCircle;
  // مؤشر التحديث الفوري
  const isLive = !!liveStatus && liveStatus !== data?.status;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {data?.hasSent && config ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 cursor-default border ${config.color} ${size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1"} ${isLive ? "ring-1 ring-offset-1 ring-current" : ""}`}
            >
              <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
              <span>WhatsApp: {config.label}</span>
              {isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse ml-0.5" />
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {data.sentAt
              ? `أُرسل ${formatDistanceToNow(new Date(data.sentAt), { addSuffix: true, locale: ar })}`
              : "تم الإرسال"}
            {data.count > 1 && ` · ${data.count} رسائل`}
            {isLive && " · تحديث مباشر ⚡"}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Badge
          variant="outline"
          className={`flex items-center gap-1 border border-gray-200 text-gray-500 bg-gray-50 ${size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1"}`}
        >
          <MessageCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>لم يُرسل WhatsApp</span>
        </Badge>
      )}

      {showResend && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <MessageCircle className="w-3 h-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {data?.hasSent ? "إعادة إرسال WhatsApp" : "إرسال WhatsApp"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export default WhatsAppStatusBadge;