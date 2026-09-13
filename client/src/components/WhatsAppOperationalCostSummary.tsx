import { Card, CardContent } from '@/components/ui/card';
import type { OperationalCostSummary } from '@/lib/whatsappOperationalCostSummary';
import { DollarSign, ReceiptText, TriangleAlert } from 'lucide-react';

export function WhatsAppOperationalCostSummary({
  summary,
  isLoading,
}: {
  summary: OperationalCostSummary;
  isLoading: boolean;
}) {
  const displayCost = (value: number) =>
    isLoading ? '—' : summary.costDataAvailable ? `$${value.toFixed(2)}` : 'غير متاح';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="ملخص تكلفة التشغيل">
      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي التكلفة المسجلة</p>
              <p className="text-2xl font-bold text-blue-700">{displayCost(summary.totalCost)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                آخر {summary.conversationCount} محادثة في النطاق
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-emerald-100 bg-emerald-50/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">متوسط التكلفة المسجلة</p>
              <p className="text-2xl font-bold text-emerald-700">
                {displayCost(summary.averageCost)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.billableCount} محادثة قابلة للفوترة
              </p>
            </div>
            <ReceiptText className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-amber-100 bg-amber-50/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">سجلات التكلفة العالية</p>
              <p className="text-2xl font-bold text-amber-700">
                {displayCost(summary.highCostTotal)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.costDataAvailable
                  ? `${summary.highCostCount} محادثة فوق $1.00`
                  : 'Meta لا ترسل مبلغ تكلفة عبر Webhook'}
              </p>
            </div>
            <TriangleAlert className="h-8 w-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
