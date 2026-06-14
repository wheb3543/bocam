import { useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Download, Filter, Package, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useWhatsAppSSE, AccountUpdateEvent, OrderReceivedEvent, TransactionStatusUpdateEvent } from "@/hooks/integrations/useWhatsAppSSE";
import { toast } from "sonner";

export default function WhatsAppOrdersPage() {
  const [status, setStatus] = useState<string>("all");
  const [limit, setLimit] = useState(50);

  const { data: orders, isLoading, refetch } = trpc.whatsapp.getOrders.useQuery({
    status: status === "all" ? undefined : status,
    limit,
  });

  // SSE: تحديث فوري عند وصول أحداث الحساب الجديدة
  useWhatsAppSSE({
    onAccountUpdate: useCallback((event: AccountUpdateEvent) => {
      toast.info(`تحديث الحساب: ${event.eventType}`);
      refetch();
    }, [refetch]),
    onOrderReceived: useCallback((event: OrderReceivedEvent) => {
      toast.info(`استلام طلب جديد`);
      refetch();
    }, [refetch]),
    onTransactionStatusUpdate: useCallback((event: TransactionStatusUpdateEvent) => {
      toast.info(`تحديث حالة المعاملة`);
      refetch();
    }, [refetch]),
  });

  // Calculate stats
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const pendingOrders = Array.isArray(orders) ? orders.filter((o: any) => o.status === 'pending').length : 0;
  const confirmedOrders = Array.isArray(orders) ? orders.filter((o: any) => o.status === 'confirmed').length : 0;
  const completedOrders = Array.isArray(orders) ? orders.filter((o: any) => o.status === 'completed').length : 0;

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'confirmed': 'مؤكد',
      'completed': 'مكتمل',
      'cancelled': 'ملغي',
    };
    return labels[status] || status;
  };

  const handleExport = () => {
    console.log("Exporting orders data...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">طلبات WhatsApp</h1>
            <p className="text-muted-foreground">عرض وإدارة الطلبات الواردة عبر WhatsApp</p>
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              تصفية البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>عدد النتائج</Label>
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">طلب وارد</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">بانتظار المعالجة</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مؤكد</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{confirmedOrders}</div>
              <p className="text-xs text-muted-foreground">تم تأكيد الطلب</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مكتمل</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">تم إكمال الطلب</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلبات</CardTitle>
            <CardDescription>عرض تفصيلي لجميع الطلبات الواردة</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>رقم المحادثة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تفاصيل الطلب</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell dir="ltr">{order.phoneNumber}</TableCell>
                      <TableCell>{order.conversationId}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.metadata ? (() => {
                          try {
                            const meta = JSON.parse(order.metadata);
                            return (
                              <div className="text-sm">
                                <div className="font-medium">{meta.text || 'بدون وصف'}</div>
                                {meta.productId && <div className="text-xs text-muted-foreground">منتج: {meta.productId}</div>}
                                {meta.quantity && <div className="text-xs text-muted-foreground">الكمية: {meta.quantity}</div>}
                              </div>
                            );
                          } catch {
                            return <span className="text-sm">{order.content || 'بدون تفاصيل'}</span>;
                          }
                        })() : (
                          <span className="text-sm">{order.content || 'بدون تفاصيل'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          عرض التفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
