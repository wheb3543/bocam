import { trpc } from "@/lib/api/trpc";
import { useFormatDate } from "@/hooks/export/useFormatDate";
import { Loader2, Tent } from "lucide-react";
import CampCard from "@/components/patient/CampCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PatientCampsPage() {
  const { formatDate } = useFormatDate();
  const { data: camps, isLoading } = trpc.patientPortal.myCampRegistrations.useQuery();

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">تسجيلات المخيمات الخاصة بك</p>
        <Link href="/patient-portal/offers">
          <Button size="sm" variant="outline">العروض</Button>
        </Link>
      </div>
      {!camps?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Tent className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>لا توجد تسجيلات مخيمات حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {camps.map((item: any) => (
            <CampCard key={item.id} item={item} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}
