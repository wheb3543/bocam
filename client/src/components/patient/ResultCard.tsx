import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, ScanLine, ClipboardList, FileText, ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

type ResultCardProps = {
  result: any;
  statusBadge: (status: string) => ReactNode;
  formatDate: (value: string | Date) => string;
  onOpenDetails?: () => void;
};

export default function ResultCard({
  result,
  statusBadge,
  formatDate,
  onOpenDetails,
}: ResultCardProps) {
  const icon =
    result.resultType === 'lab' ? (
      <FlaskConical className="h-4 w-4 text-blue-500" />
    ) : result.resultType === 'radiology' ? (
      <ScanLine className="h-4 w-4 text-purple-500" />
    ) : (
      <ClipboardList className="h-4 w-4 text-amber-500" />
    );

  return (
    <Card className="rounded-2xl shadow-sm border-green-100 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="mt-0.5">{icon}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{result.title}</p>
              {result.doctorName && (
                <p className="text-xs text-muted-foreground mt-0.5">د. {result.doctorName}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(result.resultDate || result.createdAt)}
              </p>
            </div>
          </div>
          {statusBadge(result.status)}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {result.fileUrl && (
            <a href={result.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-4 w-4 ml-1" />
                فتح الملف
              </Button>
            </a>
          )}
          {onOpenDetails && (
            <Button variant="ghost" size="sm" className="text-green-600" onClick={onOpenDetails}>
              التفاصيل
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
