import { useMemo } from 'react';
import { trpc } from '@/lib/api/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Globe,
  Phone,
  Edit,
  TrendingUp,
  Facebook,
  Instagram,
  Send,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Booking {
  source?: string | null;
  [key: string]: unknown;
}

// Map sources to display info
const sourceDisplayMap: Record<
  string,
  { name: string; color: string; lightColor: string; textColor: string; icon: LucideIcon }
> = {
  facebook: {
    name: 'فيسبوك',
    color: 'bg-[#1877F2]',
    lightColor: 'bg-blue-100',
    textColor: 'text-[#1877F2]',
    icon: Facebook,
  },
  instagram: {
    name: 'إنستغرام',
    color: 'bg-[#E4405F]',
    lightColor: 'bg-pink-100',
    textColor: 'text-[#E4405F]',
    icon: Instagram,
  },
  telegram: {
    name: 'تيليجرام',
    color: 'bg-[#0088CC]',
    lightColor: 'bg-cyan-100',
    textColor: 'text-[#0088CC]',
    icon: Send,
  },
  manual: {
    name: 'يدوي',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    icon: Edit,
  },
  direct: {
    name: 'مباشر',
    color: 'bg-gray-500',
    lightColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    icon: Globe,
  },
  // للتوافق مع التسجيلات القديمة
  website: {
    name: 'الموقع الإلكتروني',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    icon: Globe,
  },
  web: {
    name: 'الموقع الإلكتروني',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    icon: Globe,
  },
  phone: {
    name: 'الهاتف',
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    textColor: 'text-green-600',
    icon: Phone,
  },
};

export default function SourceAnalytics() {
  const {
    data: leads,
    isLoading: leadsLoading,
    error: leadsError,
  } = trpc.leads.unifiedList.useQuery(
    undefined,
    { refetchInterval: 60000 } // Auto-refresh every 60 seconds
  );
  const {
    data: appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = trpc.appointments.list.useQuery(
    undefined,
    { refetchInterval: 60000 } // Auto-refresh every 60 seconds
  );
  const {
    data: offerLeads,
    isLoading: offerLeadsLoading,
    error: offerLeadsError,
  } = trpc.offerLeads.list.useQuery(
    undefined,
    { refetchInterval: 60000 } // Auto-refresh every 60 seconds
  );
  const {
    data: campRegsPaged,
    isLoading: campLoading,
    error: campError,
  } = trpc.campRegistrations.listPaginated.useQuery(
    { page: 1, limit: 500 },
    { refetchInterval: 60000 } // Auto-refresh every 60 seconds
  );
  const campRegistrations = campRegsPaged?.data ?? [];

  const isLoading = leadsLoading || appointmentsLoading || offerLeadsLoading || campLoading;
  const hasError = leadsError || appointmentsError || offerLeadsError || campError;

  // Calculate source statistics dynamically
  const sourceStats = useMemo(() => {
    // Note: leads are the same people who made bookings, so we don't include them
    // Only count actual bookings: appointments, offerLeads, campRegistrations
    const allBookings = [
      ...(appointments || []),
      ...(offerLeads || []),
      ...(campRegistrations || []),
    ];

    const total = allBookings.length;

    // Count by source
    const sourceCountsMap = new Map<string, number>();
    allBookings.forEach((b: Booking) => {
      const source = b.source || 'direct';
      sourceCountsMap.set(source, (sourceCountsMap.get(source) || 0) + 1);
    });

    // Convert to array with display info
    const sources = Array.from(sourceCountsMap.entries())
      .map(([source, count]) => {
        const displayInfo = sourceDisplayMap[source] || {
          name: source,
          color: 'bg-gray-500',
          lightColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          icon: Globe,
        };

        return {
          source,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          ...displayInfo,
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return {
      sources,
      total,
    };
  }, [leads, appointments, offerLeads, campRegistrations]);

  // Get top source for insights
  const topSource = sourceStats.sources[0];

  // Loading state
  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>تحليل مصادر التسجيل</CardTitle>
          </div>
          <CardDescription>توزيع الحجوزات حسب المصدر</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (hasError) {
    return (
      <Card className="col-span-full lg:col-span-2 border-destructive bg-destructive/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">فشل تحميل البيانات</CardTitle>
          </div>
          <CardDescription className="text-destructive/70">
            حدث خطأ أثناء تحميل البيانات
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-destructive" />
            <p className="text-sm font-semibold text-destructive mb-2">فشل تحميل تحليل المصادر</p>
            <p className="text-xs text-muted-foreground mb-4">
              حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (sourceStats.total === 0) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>تحليل مصادر التسجيل</CardTitle>
          </div>
          <CardDescription>توزيع الحجوزات حسب المصدر</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-lg font-semibold text-muted-foreground mb-2">لا توجد بيانات</p>
            <p className="text-sm text-muted-foreground">لم يتم العثور على أي حجوزات في النظام</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>تحليل مصادر التسجيل</CardTitle>
        </div>
        <CardDescription>توزيع الحجوزات حسب المصدر</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bars */}
          <div className="space-y-4">
            {sourceStats.sources.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.source}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 ${stat.lightColor} rounded-full flex items-center justify-center`}
                      >
                        <Icon className={`h-4 w-4 ${stat.textColor}`} />
                      </div>
                      <span className="font-medium">{stat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${stat.textColor}`}>{stat.percentage}%</span>
                      <span className="text-sm text-muted-foreground">({stat.count})</span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stat.color} transition-all duration-500`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">إجمالي الحجوزات</span>
              <span className="text-lg sm:text-2xl font-bold text-primary">
                {sourceStats.total}
              </span>
            </div>

            {/* Insights */}
            {topSource && (
              <div className={`${topSource.lightColor} p-3 rounded-lg`}>
                <p className="text-sm">
                  <span className="font-semibold">{topSource.name}</span> هو المصدر الأكثر فعالية
                  بنسبة <span className="font-bold">{topSource.percentage}%</span> من إجمالي
                  الحجوزات.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
