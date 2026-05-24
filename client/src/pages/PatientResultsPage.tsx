import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useFormatDate } from "@/hooks/useFormatDate";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText } from "lucide-react";
import ResultCard from "@/components/patient/ResultCard";

export default function PatientResultsPage() {
  const [, navigate] = useLocation();
  const { formatDate } = useFormatDate();
  const { data: results, isLoading } = trpc.patientPortal.myResults.useQuery();

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      pending: { label: "قيد الانتظار", variant: "outline" },
      ready: { label: "جاهز", variant: "default" },
      delivered: { label: "تم التسليم", variant: "secondary" },
    };
    const info = map[status] || { label: status, variant: "outline" as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!results?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>لا توجد نتائج أو تقارير حالياً</p>
        </div>
      ) : (
        results.map((result: any) => (
          <ResultCard
            key={result.id}
            result={result}
            statusBadge={statusBadge}
            formatDate={formatDate}
            onOpenDetails={() => navigate(`/patient-portal/results/${result.id}`)}
          />
        ))
      )}
    </div>
  );
}
