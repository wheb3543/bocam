import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tent } from 'lucide-react';

interface Camp {
  campName?: string;
  campImage?: string;
  fullName?: string;
  createdAt?: string | Date;
  status?: string;
  [key: string]: unknown;
}

type CampCardProps = {
  item: Camp;
  formatDate: (value: string | Date) => string;
};

export default function CampCard({ item, formatDate }: CampCardProps) {
  const title = item.campName || 'تسجيل مخيم طبي';

  return (
    <Card className="overflow-hidden rounded-[24px] border border-purple-100 bg-gradient-to-r from-purple-50 via-white to-fuchsia-50 shadow-sm transition hover:shadow-md dark:border-purple-900/30 dark:from-purple-950/10 dark:via-background dark:to-fuchsia-950/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-purple-100 p-1.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 shrink-0">
                <Tent className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-foreground truncate">{title}</p>
            </div>
            {item.fullName && (
              <p className="text-xs text-muted-foreground">
                المستفيد: <span className="font-medium text-foreground/80">{item.fullName}</span>
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              تاريخ التسجيل: {formatDate(item.createdAt || new Date())}
            </p>
          </div>
          <Badge className="rounded-full border-purple-200 bg-purple-100 px-2 py-1 text-[11px] font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 shrink-0">
            {item.status || 'registered'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
