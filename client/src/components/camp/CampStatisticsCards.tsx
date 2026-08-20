import { Users, UserCheck, Clock, Calendar } from 'lucide-react';

interface CampStatisticsCardsProps {
  stats: {
    total?: number;
    pending?: number;
    confirmed?: number;
    attended?: number;
  };
}

export default function CampStatisticsCards({ stats }: CampStatisticsCardsProps) {
  const cards = [
    {
      label: 'إجمالي التسجيلات',
      sub: null as string | null,
      value: stats?.total || 0,
      icon: Users,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
    },
    {
      label: 'قيد الانتظار',
      sub: null,
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'مؤكد (مسار)',
      sub: 'مؤكد + حضر + مكتمل',
      value: stats?.confirmed || 0,
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'حضر',
      sub: null,
      value: stats?.attended || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-4">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className="flex items-start gap-2 rounded-lg border bg-card p-2 sm:p-2.5"
        >
          <div className={`rounded-lg p-1.5 ${stat.bg}`}>
            <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold leading-none sm:text-lg">{stat.value}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground truncate">{stat.label}</p>
            {stat.sub && (
              <p className="mt-0.5 hidden text-[9px] leading-tight text-muted-foreground sm:block">
                {stat.sub}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
