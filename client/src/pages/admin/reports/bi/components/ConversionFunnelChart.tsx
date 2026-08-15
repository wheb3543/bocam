/**
 * ConversionFunnelChart - رسم بياني لقمع التحويل
 * يعرض قمع التحويل مع النسب المئوية
 */

import { memo } from 'react';
import type { ConversionFunnelData } from '../types/bi.types';

interface ConversionFunnelChartProps {
  data: ConversionFunnelData;
}

const ConversionFunnelChart = memo(function ConversionFunnelChart({
  data,
}: ConversionFunnelChartProps) {
  const funnelData = [
    { name: 'إجمالي الزوار', value: data.totalSessions, fill: '#2563eb' },
    { name: 'فتحوا نموذجاً', value: data.formOpens, fill: '#7c3aed' },
    { name: 'بدأوا الملء', value: data.formStarts, fill: '#0891b2' },
    { name: 'أكملوا الحجز', value: data.converted, fill: '#16a34a' },
  ];

  const maxVal = data.totalSessions || 1;

  return (
    <div className="space-y-3">
      {funnelData.map((step, idx) => {
        const pct = Math.round((step.value / maxVal) * 100);
        const dropFromPrev =
          idx > 0
            ? Math.round(
                ((funnelData[idx - 1].value - step.value) / (funnelData[idx - 1].value || 1)) * 100
              )
            : 0;
        return (
          <div key={step.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{step.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold">{step.value.toLocaleString()}</span>
                <span className="text-muted-foreground">{pct}%</span>
                {idx > 0 && dropFromPrev > 0 && (
                  <span className="text-red-500 text-xs">-{dropFromPrev}%</span>
                )}
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-700"
                style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: step.fill }}
              >
                {pct > 10 && <span className="text-white text-xs font-bold">{pct}%</span>}
              </div>
            </div>
          </div>
        );
      })}
      <div className="pt-2 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">معدل التحويل الإجمالي</span>
          <span className="font-bold text-green-600">
            {data.totalSessions > 0 ? Math.round((data.converted / data.totalSessions) * 100) : 0}%
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">الفرص الضائعة</span>
          <span className="font-bold text-red-500">{data.abandoned.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
});

export default ConversionFunnelChart;
