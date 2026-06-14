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
import { Megaphone, Download, Filter, TrendingUp, ExternalLink, Users, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useWhatsAppSSE, AccountUpdateEvent, ReferralReceivedEvent } from "@/hooks/useWhatsAppSSE";
import { toast } from "sonner";

export default function WhatsAppReferralsPage() {
  const [sourceType, setSourceType] = useState<string>("all");
  const [limit, setLimit] = useState(50);

  const { data: referrals, isLoading, refetch } = trpc.whatsapp.getReferrals.useQuery({
    sourceType: sourceType === "all" ? undefined : sourceType,
    limit,
  });

  // SSE: تحديث فوري عند وصول أحداث الحساب الجديدة
  useWhatsAppSSE({
    onAccountUpdate: useCallback((event: AccountUpdateEvent) => {
      toast.info(`تحديث الحساب: ${event.eventType}`);
      refetch();
    }, [refetch]),
    onReferralReceived: useCallback((event: ReferralReceivedEvent) => {
      toast.info(`استلام إحالة جديدة`);
      refetch();
    }, [refetch]),
  });

  // Calculate stats
  const totalReferrals = Array.isArray(referrals) ? referrals.length : 0;
  const adReferrals = Array.isArray(referrals) ? referrals.filter((r: any) => r.sourceType === 'ad').length : 0;
  const organicReferrals = Array.isArray(referrals) ? referrals.filter((r: any) => r.sourceType === 'organic').length : 0;
  const conversionRate = totalReferrals > 0 ? ((adReferrals / totalReferrals) * 100).toFixed(1) : '0';

  const getSourceTypeBadge = (sourceType: string) => {
    const sourceColors: Record<string, string> = {
      'ad': 'bg-blue-100 text-blue-800 border-blue-200',
      'organic': 'bg-green-100 text-green-800 border-green-200',
      'referral': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return sourceColors[sourceType] || 'bg-gray-100 text-gray-800';
  };

  const getSourceTypeLabel = (sourceType: string) => {
    const labels: Record<string, string> = {
      'ad': 'إعلان',
      'organic': 'عضوي',
      'referral': 'إحالة',
    };
    return labels[sourceType] || sourceType;
  };

  const handleExport = () => {
    console.log("Exporting referrals data...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إحالات WhatsApp</h1>
            <p className="text-muted-foreground">عرض وتحليل الإحالات من الإعلانات والمصادر الأخرى</p>
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
              <Label>نوع المصدر</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="ad">إعلان</SelectItem>
                  <SelectItem value="organic">عضوي</SelectItem>
                  <SelectItem value="referral">إحالة</SelectItem>
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
              <CardTitle className="text-sm font-medium">إجمالي الإحالات</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReferrals}</div>
              <p className="text-xs text-muted-foreground">إحالة واردة</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">من الإعلانات</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{adReferrals}</div>
              <p className="text-xs text-muted-foreground">من إعلانات مدفوعة</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عضوي</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{organicReferrals}</div>
              <p className="text-xs text-muted-foreground">من مصادر عضوية</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">من الإعلانات</p>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الإحالات</CardTitle>
            <CardDescription>عرض تفصيلي لجميع الإحالات الواردة</CardDescription>
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
                    <TableHead>نوع المصدر</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>رابط المصدر</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals?.map((referral: any) => (
                    <TableRow key={referral.id}>
                      <TableCell dir="ltr">{referral.phoneNumber}</TableCell>
                      <TableCell>{referral.conversationId}</TableCell>
                      <TableCell>
                        <Badge className={getSourceTypeBadge(referral.sourceType)}>
                          {getSourceTypeLabel(referral.sourceType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {referral.metadata ? (() => {
                          try {
                            const meta = JSON.parse(referral.metadata);
                            return (
                              <div className="text-sm">
                                <div className="font-medium">{meta.headline || 'بدون عنوان'}</div>
                                {meta.sourceType && <div className="text-xs text-muted-foreground">{meta.sourceType}</div>}
                              </div>
                            );
                          } catch {
                            return <span className="text-sm">{referral.content || 'بدون تفاصيل'}</span>;
                          }
                        })() : (
                          <span className="text-sm">{referral.content || 'بدون تفاصيل'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {referral.metadata ? (() => {
                          try {
                            const meta = JSON.parse(referral.metadata);
                            return meta.sourceUrl ? (
                              <a
                                href={meta.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span className="text-xs">عرض الرابط</span>
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">غير متوفر</span>
                            );
                          } catch {
                            return <span className="text-xs text-muted-foreground">غير متوفر</span>;
                          }
                        })() : (
                          <span className="text-xs text-muted-foreground">غير متوفر</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(referral.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
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
