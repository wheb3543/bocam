import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, ScanLine, ClipboardList, FileText, ChevronLeft, User } from 'lucide-react';
import { ReactNode } from 'react';
import type { PatientResult } from '@shared/types';
import {
  RELATIONSHIP_LABELS,
  getRelationshipBadgeStyle,
} from '@/components/patient/FamilyMembersFilter';

type ExtendedResult = Omit<Partial<PatientResult>, 'resultDate' | 'createdAt'> & {
  id: number;
  title: string;
  resultType: 'lab' | 'radiology' | 'report';
  status: string;
  doctorName?: string | null;
  beneficiaryName?: string;
  relationship?: string;
  resultDate?: string | Date | null;
  createdAt?: string | Date;
  fileUrl?: string | null;
};

type ResultCardProps = {
  result: ExtendedResult;
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

  const isFamilyMember = result.relationship && result.relationship !== 'self';
  const relLabel = result.relationship
    ? RELATIONSHIP_LABELS[result.relationship] || result.relationship
    : null;

  return (
    <Card className="rounded-2xl shadow-sm border-emerald-100 dark:border-gray-700 hover:border-emerald-200 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="mt-0.5 shrink-0 rounded-xl bg-muted/60 p-2">{icon}</div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-bold truncate text-foreground">{result.title}</p>
              {result.beneficiaryName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3 w-3 text-muted-foreground/70" />
                  <span className="font-medium text-foreground/80">{result.beneficiaryName}</span>
                  {isFamilyMember && relLabel && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md border font-normal ${getRelationshipBadgeStyle(
                        result.relationship
                      )}`}
                    >
                      {relLabel}
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {result.doctorName && <p>د. {result.doctorName}</p>}
                <p>{formatDate(result.resultDate || result.createdAt || new Date())}</p>
              </div>
            </div>
          </div>
          <div className="shrink-0">{statusBadge(result.status)}</div>
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
