import { useFormatDate } from "@/hooks/useFormatDate";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Users, Calendar, TrendingUp, UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function NotificationCenter() {
  const { formatDate, formatDateTime } = useFormatDate();
  const [, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    campRegistrations: false,
    appointments: false,
    offerLeads: false,
  });

  // Fetch all pending bookings
  const { data: appointments, isLoading: appointmentsLoading, error: appointmentsError } = trpc.appointments.list.useQuery();
  const { data: offerLeads, isLoading: offerLeadsLoading, error: offerLeadsError } = trpc.offerLeads.list.useQuery();
  const { data: campRegsPaged, isLoading: campLoading, error: campError } = trpc.campRegistrations.listPaginated.useQuery({
    page: 1,
    limit: 50,
  });
  const campRegistrations = campRegsPaged?.data ?? [];

  const isLoading = appointmentsLoading || offerLeadsLoading || campLoading;
  const hasError = appointmentsError || offerLeadsError || campError;

  // Get last 5 pending items for each type
  const pendingItems = useMemo(() => {
    const pendingAppointments = (appointments || [])
      .filter(a => a.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    const pendingOfferLeads = (offerLeads || [])
      .filter(o => o.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    const pendingCampRegistrations = (campRegistrations || [])
      .filter(c => c.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      appointments: pendingAppointments,
      offerLeads: pendingOfferLeads,
      campRegistrations: pendingCampRegistrations,
    };
  }, [appointments, offerLeads, campRegistrations]);

  // Count pending items
  const counts = useMemo(() => ({
    appointments: appointments?.filter(a => a.status === 'pending').length || 0,
    offerLeads: offerLeads?.filter(o => o.status === 'pending').length || 0,
    campRegistrations: campRegistrations?.filter(c => c.status === 'pending').length || 0,
  }), [appointments, offerLeads, campRegistrations]);

  const totalCount = counts.appointments + counts.offerLeads + counts.campRegistrations;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleItemClick = (type: string) => {
    // Navigate to bookings management page with the appropriate tab
    setLocation(`/dashboard/bookings?tab=${type}`);
  };

  const sections = [
    {
      id: 'campRegistrations',
      title: 'تسجيلات المخيمات',
      count: counts.campRegistrations,
      items: pendingItems.campRegistrations,
      icon: UserCheck,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      type: 'campRegistrations',
    },
    {
      id: 'appointments',
      title: 'مواعيد الأطباء',
      count: counts.appointments,
      items: pendingItems.appointments,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      type: 'appointments',
    },
    {
      id: 'offerLeads',
      title: 'حجوزات العروض',
      count: counts.offerLeads,
      items: pendingItems.offerLeads,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      type: 'offerLeads',
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">طلبات قيد الانتظار</h2>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">جاري تحميل الإشعارات...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">طلبات قيد الانتظار</h2>
        </div>
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive" />
            <p className="text-sm font-semibold text-destructive mb-2">فشل تحميل الإشعارات</p>
            <p className="text-xs text-muted-foreground mb-4">حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
            >
              إعادة المحاولة
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">طلبات قيد الانتظار</h2>
        {totalCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {totalCount} إشعار
          </Badge>
        )}
      </div>

      {/* Notification Sections */}
      {totalCount === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-lg font-semibold text-muted-foreground mb-2">لا توجد طلبات قيد الانتظار</p>
            <p className="text-sm text-muted-foreground">جميع الحجوزات محدثة ومعالجة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id];
            
            if (section.count === 0) return null;

            return (
              <Card 
                key={section.id}
                className={`border-2 ${section.borderColor} ${section.bgColor} transition-all`}
              >
                <CardContent className="p-0">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${section.bgColor} rounded-full flex items-center justify-center border-2 ${section.borderColor}`}>
                        <Icon className={`h-5 w-5 ${section.color}`} />
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{section.title}</p>
                        <p className="text-sm text-muted-foreground">
                          هناك {section.count} {section.count === 1 ? 'طلب' : 'طلبات'} قيد الانتظار
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="font-bold">
                        {section.count}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content - Show last 5 requests */}
                  {isExpanded && (
                    <div className="border-t bg-white dark:bg-card">
                      {section.items.length > 0 ? (
                        <div className="divide-y">
                          {section.items.map((item: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => handleItemClick(section.type)}
                              className="w-full p-3 text-right hover:bg-muted/50 transition-colors flex items-center justify-between group"
                            >
                              <span className="font-medium group-hover:text-primary transition-colors">
                                {item.fullName || item.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(item.createdAt)}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          لا توجد طلبات
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
