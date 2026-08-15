import OfferLeadCard from '@/components/offer/OfferLeadCard';
import type { RouterOutputs } from '@/types/trpc';

type OfferLead = RouterOutputs['offerLeads']['listPaginated']['data'][number];

interface OfferLeadsCardsProps {
  leads: OfferLead[];
  onEdit: (lead: OfferLead) => void;
  onPrint: (lead: OfferLead) => Promise<void>;
}

export default function OfferLeadsCards({ leads, onEdit, onPrint }: OfferLeadsCardsProps) {
  return (
    <>
      {leads.map((lead: OfferLead) => (
        <OfferLeadCard
          key={lead.id}
          lead={{
            id: lead.id,
            fullName: lead.fullName,
            phone: lead.phone,
            email: lead.email,
            status: lead.status,
            offerName: lead.offerTitle || undefined,
            createdAt: lead.createdAt,
          }}
          onEdit={() => onEdit(lead)}
          onPrint={() => onPrint(lead)}
        />
      ))}
    </>
  );
}
