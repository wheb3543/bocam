import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FileText, Search, RefreshCw, CheckCircle, XCircle, Clock,
  AlertCircle, Download, Filter, Calendar, User, Phone,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

interface LabOrder {
  ORDER_ID: number;
  PATIENT_NAME: string;
  PHONE_NO: string;
  DOCTOR_NAME: string;
  MAIN_TEST_NAME: string;
  RESULT_DATE: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  retry_count: number;
  error_message?: string;
  whatsapp_msg_id?: string;
  processed_at?: string;
}

type StatusFilter = "all" | "pending" | "processing" | "sent" | "failed";

export default function WhatsAppLabResultsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  // Mock data - في الإنتاج، سيتم استبدال هذا بـ tRPC query
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = () => {
    setIsLoading(true);
    // Mock data - سيتم استبدال هذا بـ tRPC query
    setTimeout(() => {
      setLabOrders([]);
      setIsLoading(false);
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="h-3 w-3 mr-1" /> قيد الانتظار</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> جاري المعالجة</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> تم الإرسال</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" /> فشل</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredOrders = labOrders?.filter((order: LabOrder) => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        order.PATIENT_NAME.toLowerCase().includes(searchLower) ||
        order.PHONE_NO.includes(searchQuery) ||
        order.ORDER_ID.toString().includes(searchQuery)
      );
    }
    return true;
  }) || [];

  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter((o: LabOrder) => o.status === "pending").length,
    processing: filteredOrders.filter((o: LabOrder) => o.status === "processing").length,
    sent: filteredOrders.filter((o: LabOrder) => o.status === "sent").length,
    failed: filteredOrders.filter((o: LabOrder) => o.status === "failed").length,
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">إدارة نتائج المختبر</h1>
            <p className="text-sm text-muted-foreground">متابعة وإرسال نتائج فحوصات المختبر عبر واتساب</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
          {[
            { label: "الكل", value: stats.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" },
            { label: "قيد الانتظار", value: stats.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/20" },
            { label: "جاري المعالجة", value: stats.processing, icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" },
            { label: "تم الإرسال", value: stats.sent, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" },
            { label: "فشل", value: stats.failed, icon: XCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/20" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className={`${bg} border-0`}>
              <CardContent className="p-3 sm:p-4">
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color} mb-2`} />
                <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم، الهاتف، أو رقم الطلب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="processing">جاري المعالجة</SelectItem>
                  <SelectItem value="sent">تم الإرسال</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as "all" | "today" | "week" | "month")}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="التاريخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التواريخ</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>طلبات المختبر</CardTitle>
            <CardDescription>
              {isLoading ? "جاري التحميل..." : `عرض ${filteredOrders.length} طلب`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-2 opacity-50" />
                  <p>لا توجد طلبات</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order: LabOrder) => (
                    <Card key={order.ORDER_ID} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="font-mono">#{order.ORDER_ID}</Badge>
                              {getStatusBadge(order.status)}
                              {order.retry_count > 0 && (
                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                  إعادة المحاولة: {order.retry_count}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{order.PATIENT_NAME}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span dir="ltr">{order.PHONE_NO}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{order.MAIN_TEST_NAME}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>الطبيب: {order.DOCTOR_NAME}</span>
                              </div>
                            </div>
                            {order.error_message && (
                              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>{order.error_message}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>تاريخ النتيجة: {format(new Date(order.RESULT_DATE), "dd/MM/yyyy", { locale: ar })}</span>
                              {order.processed_at && (
                                <span>تم المعالجة: {format(new Date(order.processed_at), "dd/MM/yyyy HH:mm", { locale: ar })}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {order.status === "failed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.info("إعادة المحاولة - ميزة قادمة")}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                إعادة المحاولة
                              </Button>
                            )}
                            {order.status === "sent" && order.whatsapp_msg_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.info("عرض الرسالة - ميزة قادمة")}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                عرض الرسالة
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
