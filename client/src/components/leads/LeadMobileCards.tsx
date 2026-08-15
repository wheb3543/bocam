import { Users, Loader2 } from 'lucide-react';
import LeadCard from '@/components/lead/LeadCard';
import EmptyState from '@/components/EmptyState';
import type { UnifiedLead } from '@shared/types';

interface LeadMobileCardsProps {
  leads: UnifiedLead[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onUpdateStatus: (lead: UnifiedLead) => void;
  onWhatsApp: (lead: UnifiedLead) => void;
}

export default function LeadMobileCards({
  leads,
  isLoading,
  hasActiveFilters,
  onClearFilters,
  onUpdateStatus,
  onWhatsApp,
}: LeadMobileCardsProps) {
  return (
    <div className="md:hidden space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="لا توجد تسجيلات"
          description={
            hasActiveFilters
              ? 'لا توجد نتائج مطابقة للفلاتر المحددة. جرب تغيير معايير البحث.'
              : 'لم يتم تسجيل أي عملاء بعد.'
          }
          action={hasActiveFilters ? { label: 'مسح الفلاتر', onClick: onClearFilters } : undefined}
        />
      ) : (
        leads.map((lead: UnifiedLead) => (
          <LeadCard
            key={`lead-mobile-${lead.id}`}
            lead={lead}
            onUpdateStatus={onUpdateStatus}
            onWhatsApp={onWhatsApp}
          />
        ))
      )}
    </div>
  );
}
