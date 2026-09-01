import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

interface Offer {
  fullName?: string;
  createdAt?: string | Date;
  status?: string;
  [key: string]: unknown;
}

type OfferCardProps = {
  item: Offer;
  formatDate: (value: string | Date) => string;
};

export default function OfferCard({ item, formatDate }: OfferCardProps) {
  return (
    <Card className="overflow-hidden rounded-[24px] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 shadow-sm transition hover:shadow-md dark:border-sky-900/30 dark:from-sky-950/10 dark:via-background dark:to-blue-950/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-sky-100 p-1.5 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                <Gift className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-bold text-foreground">{item.fullName || 'حجز عرض'}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDate(item.createdAt || new Date())}
            </p>
          </div>
          <Badge className="rounded-full border-sky-200 bg-sky-100 px-2 py-1 text-[11px] font-bold text-sky-700 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300">
            {item.status || 'new'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
