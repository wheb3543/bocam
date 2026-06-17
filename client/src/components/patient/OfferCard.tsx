import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

type OfferCardProps = {
  item: any;
  formatDate: (value: string | Date) => string;
};

export default function OfferCard({ item, formatDate }: OfferCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-blue-100 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{item.fullName || 'حجز عرض'}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(item.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-blue-600" />
            <Badge variant="outline">{item.status || 'new'}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
