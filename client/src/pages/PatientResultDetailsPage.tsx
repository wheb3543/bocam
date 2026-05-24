import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useFormatDate } from "@/hooks/useFormatDate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, FlaskConical, ScanLine, ClipboardList } from "lucide-react";

export default function PatientResultDetailsPage() {
  const { formatDate } = useFormatDate();
  const [, params] = useRoute("/patient-portal/results/:id");
  const resultId = Number(params?.id);
  const { data: results, isLoading } = trpc.patientPortal.myResults.useQuery();
  const result = results?.find((item: any) => item.id === resultId);

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>النتيجة غير موجودة أو لا تملك صلاحية عرضها.</p>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {result.resultType === "lab" && <FlaskConical className="h-4 w-4 text-blue-500" />}
          {result.resultType === "radiology" && <ScanLine className="h-4 w-4 text-purple-500" />}
          {result.resultType === "report" && <ClipboardList className="h-4 w-4 text-amber-500" />}
          {result.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">تاريخ النتيجة</span>
          <span>{formatDate(result.resultDate || result.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">الحالة</span>
          <Badge variant="outline">{result.status}</Badge>
        </div>
        {result.doctorName && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">الطبيب</span>
            <span>د. {result.doctorName}</span>
          </div>
        )}
        {result.description && (
          <div className="pt-2 border-t">
            <p className="text-muted-foreground mb-1">الوصف</p>
            <p>{result.description}</p>
          </div>
        )}
        {result.fileUrl && (
          <a href={result.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-green-600">
            <FileText className="h-4 w-4 ml-1" />
            فتح الملف المرفق
          </a>
        )}
      </CardContent>
    </Card>
  );
}
