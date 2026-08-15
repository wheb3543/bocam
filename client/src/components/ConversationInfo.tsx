import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import ConversationHeader from './conversation/ConversationHeader';
import QuickActions from './conversation/QuickActions';
import ConversationStats from './conversation/ConversationStats';
import CustomerInfoCard from './conversation/CustomerInfoCard';
import CrmRecordsCard from './conversation/CrmRecordsCard';
import NotesCard from './conversation/NotesCard';
import ConversationStatisticsCard from './conversation/ConversationStatisticsCard';
import PricingCard from './conversation/PricingCard';
import RelatedItemsBadge from './conversation/RelatedItemsBadge';
import LinkEntityDialog from './conversation/LinkEntityDialog';
import { handleCopyPhone, handleCall, handleWhatsApp, handleEmail } from './conversation/utils';
import type { ConversationInfoProps, CustomerInfo, CustomerRecords } from './conversation/types';

export default function ConversationInfo({
  conversation,
  messageCount = 0,
  onMarkAsImportant,
  onArchive,
  onConversationUpdate,
  onSendReminder,
  onSendFollowup,
  entityWhatsAppStatus,
  isSendingReminder = false,
  isSendingFollowup = false,
}: ConversationInfoProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [customerRecords, setCustomerRecords] = useState<CustomerRecords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Collapsible states
  const [customerInfoOpen, setCustomerInfoOpen] = useState(true);
  const [crmRecordsOpen, setCrmRecordsOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  // Edit states
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState(conversation.customerName || '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(conversation.notes || '');

  // Link entity dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkEntityType, setLinkEntityType] = useState<'lead' | 'appointment' | 'offer' | 'camp'>(
    'lead'
  );
  const [linkEntityId, setLinkEntityId] = useState<number | null>(null);
  const [linkEntitySearch, setLinkEntitySearch] = useState('');

  const { data: infoData, isLoading: infoLoading } =
    trpc.whatsapp.conversations.getCustomerInfo.useQuery(
      { phone: conversation.phoneNumber },
      { enabled: !!conversation.phoneNumber }
    );

  const { data: recordsData, isLoading: recordsLoading } =
    trpc.whatsapp.conversations.getCustomerRecords.useQuery(
      { phone: conversation.phoneNumber },
      { enabled: !!conversation.phoneNumber }
    );

  const { data: conversationStats } = trpc.whatsapp.conversations.getStats.useQuery(
    { conversationId: conversation.id },
    { enabled: !!conversation.id }
  );

  const updateNameMutation = trpc.whatsapp.conversations.updateName.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث اسم العميل');
      setEditingName(false);
      onConversationUpdate?.();
    },
    onError: () => toast.error('فشل تحديث الاسم'),
  });

  const updateNotesMutation = trpc.whatsapp.conversations.updateNotes.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الملاحظات');
      setEditingNotes(false);
      onConversationUpdate?.();
    },
    onError: () => toast.error('فشل تحديث الملاحظات'),
  });

  const handleLinkEntity = () => {
    if (!linkEntityId) {
      toast.error('يرجى اختيار كيان للربط');
      return;
    }

    const updateData: Record<string, number | null> = {};
    if (linkEntityType === 'lead') {
      updateData.leadId = linkEntityId;
    } else if (linkEntityType === 'appointment') {
      updateData.appointmentId = linkEntityId;
    } else if (linkEntityType === 'offer') {
      updateData.offerLeadId = linkEntityId;
    } else if (linkEntityType === 'camp') {
      updateData.campRegistrationId = linkEntityId;
    }

    updateNameMutation.mutate(
      { id: conversation.id, customerName: conversation.customerName ?? '', ...updateData },
      {
        onSuccess: () => {
          toast.success('تم ربط المحادثة بالكيان');
          setLinkDialogOpen(false);
          setLinkEntityId(null);
          setLinkEntitySearch('');
          onConversationUpdate?.();
        },
        onError: () => toast.error('فشل ربط المحادثة'),
      }
    );
  };

  const handleCopyPhoneClick = () => handleCopyPhone(conversation.phoneNumber);
  const handleCallClick = () => handleCall(conversation.phoneNumber);
  const handleWhatsAppClick = () => handleWhatsApp(conversation.phoneNumber);
  const handleEmailClick = () => handleEmail(customerInfo?.email);

  // Reset data when conversation changes to prevent data collision
  useEffect(() => {
    setCustomerInfo(null);
    setCustomerRecords(null);
    setError(null);
    setLoading(true);
  }, [conversation.id]);

  useEffect(() => {
    if (infoData) {
      setCustomerInfo(infoData as CustomerInfo);
    }
    if (recordsData) {
      setCustomerRecords(recordsData as CustomerRecords);
    }
  }, [infoData, recordsData]);

  useEffect(() => {
    const loading = infoLoading || recordsLoading;
    setLoading(loading);
  }, [infoLoading, recordsLoading]);

  const handleSaveName = () => {
    if (!editedName.trim()) {
      toast.error('الاسم لا يمكن أن يكون فارغاً');
      return;
    }
    updateNameMutation.mutate({
      id: conversation.id,
      customerName: editedName,
    });
  };

  const handleCancelEditName = () => {
    setEditedName(conversation.customerName || '');
    setEditingName(false);
  };

  const handleSaveNotes = () => {
    updateNotesMutation.mutate({
      id: conversation.id,
      notes: editedNotes,
    });
  };

  const handleCancelEditNotes = () => {
    setEditedNotes(conversation.notes || '');
    setEditingNotes(false);
  };

  return (
    <div className="space-y-3 p-3 sm:p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {/* Header Card */}
      <ConversationHeader
        conversation={conversation}
        editingName={editingName}
        editedName={editedName}
        onEditName={() => setEditingName(true)}
        onSaveName={handleSaveName}
        onCancelEditName={handleCancelEditName}
        onNameChange={(value) => setEditedName(value)}
        onCopyPhone={handleCopyPhoneClick}
        onMarkAsImportant={onMarkAsImportant}
        onArchive={onArchive}
        onLinkEntity={() => setLinkDialogOpen(true)}
      />

      {/* Quick Action Buttons */}
      <QuickActions
        onCall={handleCallClick}
        onWhatsApp={handleWhatsAppClick}
        onEmail={handleEmailClick}
      />

      {/* Stats */}
      <ConversationStats messageCount={messageCount} lastMessageAt={conversation.lastMessageAt} />

      {/* Customer Info Section */}
      {loading && (
        <Card className="p-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          جاري التحميل...
        </Card>
      )}

      {error && (
        <Card className="p-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </Card>
      )}

      {!loading && customerInfo && (
        <CustomerInfoCard
          customerInfo={customerInfo}
          isOpen={customerInfoOpen}
          onOpenChange={setCustomerInfoOpen}
        />
      )}

      {/* Records Section */}
      {!loading && customerRecords && (
        <CrmRecordsCard
          customerRecords={customerRecords}
          isOpen={crmRecordsOpen}
          onOpenChange={setCrmRecordsOpen}
          phoneNumber={conversation.phoneNumber}
          customerName={conversation.customerName}
          onSendReminder={onSendReminder}
          onSendFollowup={onSendFollowup}
          isSendingReminder={isSendingReminder}
          isSendingFollowup={isSendingFollowup}
        />
      )}

      {/* Notes Section */}
      <NotesCard
        notes={conversation.notes}
        isOpen={notesOpen}
        onOpenChange={setNotesOpen}
        editingNotes={editingNotes}
        editedNotes={editedNotes}
        onEditNotes={() => setEditingNotes(true)}
        onSaveNotes={handleSaveNotes}
        onCancelEditNotes={handleCancelEditNotes}
        onNotesChange={(value) => setEditedNotes(value)}
        isSaving={updateNotesMutation.isPending}
      />

      {/* Conversation Statistics */}
      {conversationStats && (
        <ConversationStatisticsCard
          conversationStats={conversationStats}
          isOpen={statsOpen}
          onOpenChange={setStatsOpen}
        />
      )}

      {/* Pricing Information */}
      <PricingCard conversation={conversation} />

      {/* Related Items */}
      <RelatedItemsBadge conversation={conversation} entityWhatsAppStatus={entityWhatsAppStatus} />

      {/* Link Entity Dialog */}
      <LinkEntityDialog
        isOpen={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        entityType={linkEntityType}
        onEntityTypeChange={(value) => setLinkEntityType(value)}
        entitySearch={linkEntitySearch}
        onEntitySearchChange={(value) => setLinkEntitySearch(value)}
        onLink={handleLinkEntity}
      />
    </div>
  );
}
