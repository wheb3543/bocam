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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Download, Calendar, TrendingUp, DollarSign, Filter } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useWhatsAppSSE, ConversationCostUpdateEvent } from "@/hooks/integrations/useWhatsAppSSE";
import { toast } from "sonner";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function WhatsAppCostsPage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pricingCategory, setPricingCategory] = useState<string>("all");

  const { data: conversationCosts, isLoading, refetch } = trpc.whatsapp.getConversationCosts.useQuery({
    startDate,
    endDate,
  });

  // SSE: تحديث فوري عند وصول أحداث التكلفة الجديدة
  useWhatsAppSSE({
    onConversationCostUpdate: useCallback((event: ConversationCostUpdateEvent) => {
      toast.info(`تحديث تكلفة المحادثة: ${event.phoneNumber}`);
      refetch();
    }, [refetch]),
  });

  // Process data for charts
  const costData = conversationCosts?.map((conv: any) => ({
    date: format(new Date(conv.createdAt), 'dd/MM', { locale: ar }),
    conversationCost: conv.conversationCost || 0,
    billable: conv.billable ? 1 : 0,
    pricingCategory: conv.pricingCategory || 'غير محدد',
  })) || [];

  // Group by pricing category
  const categoryData = conversationCosts?.reduce((acc: any, conv: any) => {
    const category = conv.pricingCategory || 'غير محدد';
    if (!acc[category]) acc[category] = 0;
    acc[category] += conv.conversationCost || 0;
    return acc;
  }, {}) || {};

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  // Calculate totals
  const totalCost = Array.isArray(conversationCosts) ? conversationCosts.reduce((sum: number, conv: any) => sum + (conv.conversationCost || 0), 0) : 0;
  const billableCount = Array.isArray(conversationCosts) ? conversationCosts.filter((conv: any) => conv.billable).length : 0;
  const totalCount = Array.isArray(conversationCosts) ? conversationCosts.length : 0;

  const handleExport = () => {
    // Export functionality placeholder
    console.log("Exporting costs data...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">تكاليف المحادثات</h1>
            <p className="text-muted-foreground">عرض وتحليل تكاليف محادثات WhatsApp</p>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>فئة التسعير</Label>
              <Select value={pricingCategory} onValueChange={setPricingCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="marketing">تسويق</SelectItem>
                  <SelectItem value="utility">خدمات</SelectItem>
                  <SelectItem value="authentication">مصادقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي التكلفة</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {totalCount} محادثة
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المحادثات القابلة للفوترة</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billableCount}</div>
              <p className="text-xs text-muted-foreground">
                من أصل {totalCount} محادثة
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط التكلفة</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalCount > 0 ? (totalCost / totalCount).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                لكل محادثة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>التكاليف بمرور الوقت</CardTitle>
              <CardDescription>تتبع التكاليف اليومية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="conversationCost" stroke="#8884d8" name="تكاليف المحادثات" />
                  <Line type="monotone" dataKey="billable" stroke="#82ca9d" name="المحادثات القابلة للفوترة" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التكاليف حسب الفئة</CardTitle>
              <CardDescription>توزيع التكاليف حسب نوع التسعير</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل التكاليف</CardTitle>
            <CardDescription>عرض تفصيلي لكل محادثة</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>نموذج التسعير</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>قابل للفوترة</TableHead>
                    <TableHead>التكلفة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversationCosts?.map((conv: any) => (
                    <TableRow key={conv.id}>
                      <TableCell dir="ltr">{conv.phoneNumber}</TableCell>
                      <TableCell>{conv.pricingModel || 'غير محدد'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{conv.pricingCategory || 'غير محدد'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={conv.billable ? 'default' : 'secondary'}>
                          {conv.billable ? 'نعم' : 'لا'}
                        </Badge>
                      </TableCell>
                      <TableCell>${(conv.conversationCost || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {format(new Date(conv.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
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
