/**
 * AbandonedFormsTable - جدول النماذج المهجورة
 * يعرض قائمة النماذج المهجورة مع الفلاتر والإجراءات
 */

import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Phone, RefreshCw, CheckCircle2, Clock, PhoneCall, Globe, MessageCircle, Smartphone, Search } from 'lucide-react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  facebook: <MessageCircle className="h-4 w-4" />,
  instagram: <Smartphone className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  google: <Search className="h-4 w-4" />,
  direct: <Globe className="h-4 w-4" />,
};

const AbandonedFormsTable = memo(function AbandonedFormsTable() {
  const [page, setPage] = useState(1);
  const [contacted, setContacted] = useState<boolean | undefined>(undefined);
  const [formType, setFormType] = useState<'appointment' | 'offer' | 'camp' | 'general' | undefined>(undefined);

  const { data, isLoading, refetch } = trpc.tracking.abandonedFormsList.useQuery({
    page,
    limit: 20,
    contacted,
    formType,
  });

  const markContactedMutation = trpc.tracking.markAbandonedContacted.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث حالة التواصل');
      refetch();
    },
  });

  const formTypeLabels: Record<string, string> = {
    appointment: 'موعد طبيب',
    offer: 'عرض',
    camp: 'مخيم',
    general: 'عام',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={contacted === undefined ? 'all' : contacted ? 'contacted' : 'not-contacted'}
          onValueChange={(v) => setContacted(v === 'all' ? undefined : v === 'contacted')}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="حالة التواصل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="not-contacted">لم يتم التواصل</SelectItem>
            <SelectItem value="contacted">تم التواصل</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={formType ?? 'all'}
          onValueChange={(v) => setFormType(v === 'all' ? undefined : (v as typeof formType))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="نوع النموذج" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="appointment">موعد طبيب</SelectItem>
            <SelectItem value="offer">عرض</SelectItem>
            <SelectItem value="camp">مخيم</SelectItem>
            <SelectItem value="general">عام</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground mr-auto">{data?.total ?? 0} فرصة ضائعة</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3 font-medium">الاسم</th>
              <th className="text-right p-3 font-medium">الهاتف</th>
              <th className="text-right p-3 font-medium">نوع النموذج</th>
              <th className="text-right p-3 font-medium">المصدر</th>
              <th className="text-right p-3 font-medium">التاريخ</th>
              <th className="text-right p-3 font-medium">الحالة</th>
              <th className="text-right p-3 font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد فرص ضائعة في هذه الفترة
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium">{item.name ?? '—'}</td>
                <td className="p-3">
                  {item.phone ? (
                    <a
                      href={`tel:${item.phone}`}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {item.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-3">
                  <Badge variant="outline">{formTypeLabels[item.formType] ?? item.formType}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {SOURCE_ICONS[item.source ?? ''] ?? <Globe className="h-3 w-3" />}
                    <span className="capitalize">{item.source ?? 'مباشر'}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground text-xs">
                  {item.createdAt ? format(new Date(item.createdAt), 'h:mm a, dd-MM-yyyy') : '—'}
                </td>
                <td className="p-3">
                  {item.contacted ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      تم التواصل
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <Clock className="h-3 w-3 mr-1" />
                      لم يتم التواصل
                    </Badge>
                  )}
                </td>
                <td className="p-3">
                  {!item.contacted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => markContactedMutation.mutate({ id: item.id })}
                      disabled={markContactedMutation.isPending}
                    >
                      <PhoneCall className="h-3 w-3 mr-1" />
                      تم التواصل
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            السابق
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            صفحة {page} من {Math.ceil(data.total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(data.total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
});

export default AbandonedFormsTable;
