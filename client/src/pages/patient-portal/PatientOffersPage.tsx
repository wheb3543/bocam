import { trpc } from "@/lib/api/trpc";
import { useFormatDate } from "@/hooks/export/useFormatDate";
import { Loader2, Gift } from "lucide-react";
import OfferCard from "@/components/patient/OfferCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PatientOffersPage() {
  const { formatDate } = useFormatDate();
  const { data: offers, isLoading } = trpc.patientPortal.myOfferBookings.useQuery();

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
        <p className="text-sm text-muted-foreground">حجوزات العروض الخاصة بك</p>
        <Link href="/patient-portal/camps">
          <Button size="sm" variant="outline">المخيمات</Button>
        </Link>
      </div>
      {!offers?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Gift className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>لا توجد عروض محجوزة حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((item: any) => (
            <OfferCard key={item.id} item={item} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}
