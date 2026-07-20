import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, XCircle, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { AnimatedCounter } from '@/components/animations';

interface CampStatsCardsProps {
  stats: {
    totalRegistrations: number;
    pendingCount: number;
    confirmedCount: number;
    attendedCount: number;
    cancelledCount: number;
    attendanceRate: number;
    cancellationRate: number;
  };
}

const statConfig = [
  {
    key: 'totalRegistrations' as const,
    label: 'إجمالي التسجيلات',
    icon: Calendar,
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    key: 'pendingCount' as const,
    label: 'قيد الانتظار',
    icon: Clock,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    key: 'confirmedCount' as const,
    label: 'مؤكد',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  {
    key: 'attendedCount' as const,
    label: 'حضر',
    icon: Users,
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    key: 'cancelledCount' as const,
    label: 'ملغي',
    icon: XCircle,
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
    iconBg: 'bg-red-100',
  },
  {
    key: 'attendanceRate' as const,
    label: 'معدل الحضور',
    icon: TrendingUp,
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
    isPercentage: true,
  },
  {
    key: 'cancellationRate' as const,
    label: 'معدل الإلغاء',
    icon: TrendingDown,
    gradient: 'from-orange-500 to-red-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    isPercentage: true,
  },
];

export default function CampStatsCards({ stats }: CampStatsCardsProps) {
  const total = stats?.totalRegistrations || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 stagger-cards">
      {statConfig.map((config) => {
        const Icon = config.icon;
        const value = stats?.[config.key] || 0;
        const isPercentage = config.isPercentage;
        const percentage =
          !isPercentage && total > 0 && config.key !== 'totalRegistrations'
            ? Math.round((value / total) * 100)
            : null;

        return (
          <Card
            key={config.key}
            className="group relative overflow-hidden border-0 shadow-sm stat-card-animated"
          >
            {/* Top gradient bar */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${config.gradient}`} />

            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1 truncate">
                    {config.label}
                  </p>
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={value} duration={900} />
                    {isPercentage && <span className="text-lg">%</span>}
                  </p>
                  {percentage !== null && (
                    <div className="flex items-center gap-1 mt-2">
                      <div
                        className={`flex items-center gap-0.5 text-xs font-medium ${config.textColor}`}
                      >
                        <span>{percentage}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">من الإجمالي</span>
                    </div>
                  )}
                </div>
                <div
                  className={`${config.iconBg} p-2 sm:p-2.5 md:p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${config.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
