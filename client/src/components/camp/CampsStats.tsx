/**
 * Camps Stats Component
 * مكون إحصائيات المخيمات
 */

import { Tent, CheckCircle2, XCircle } from 'lucide-react';

interface CampsStatsProps {
  totalCamps: number;
  activeCamps: number;
  inactiveCamps: number;
}

export default function CampsStats({ totalCamps, activeCamps, inactiveCamps }: CampsStatsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
      {/* إجمالي المخيمات */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">إجمالي المخيمات</span>
          <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <Tent className="h-4 w-4 text-purple-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">{totalCamps}</div>
        <p className="text-[11px] text-muted-foreground mt-0.5">جميع المخيمات</p>
      </div>

      {/* مخيمات نشطة */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">مخيمات نشطة</span>
          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-600">{activeCamps}</div>
        <p className="text-[11px] text-muted-foreground mt-0.5">نشطة حالياً</p>
      </div>

      {/* مخيمات غير نشطة */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">غير نشطة</span>
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="text-2xl font-bold text-muted-foreground">{inactiveCamps}</div>
        <p className="text-[11px] text-muted-foreground mt-0.5">معطلة</p>
      </div>
    </div>
  );
}
