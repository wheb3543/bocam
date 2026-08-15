/**
 * Conversation Info Types
 * أنواع معلومات المحادثة
 */

export interface ConversationInfoProps {
  conversation: {
    id: number;
    customerName?: string | null;
    phoneNumber: string;
    lastMessageAt?: string | Date | null;
    unreadCount: number;
    leadId?: number | null;
    appointmentId?: number | null;
    offerLeadId?: number | null;
    campRegistrationId?: number | null;
    notes?: string | null;
    linkedEntityType?: string | null;
    linkedEntityId?: number | null;
    pricingModel?: string | null;
    billable?: number | null | boolean;
    pricingCategory?: string | null;
    expirationTimestamp?: string | Date | null;
  };
  messageCount?: number;
  onMarkAsImportant?: () => void;
  onArchive?: () => void;
  onConversationUpdate?: () => void;
  onSendReminder?: (
    appointmentId: number,
    phone: string,
    patientName: string,
    doctorName: string,
    appointmentTime: Date
  ) => void;
  onSendFollowup?: (
    appointmentId: number,
    phone: string,
    patientName: string,
    doctorName: string,
    department: string
  ) => void;
  entityWhatsAppStatus?: {
    status?: string | null | {};
    lastChecked?: string | Date | null;
    sentAt?: string | Date | null | {};
    messageId?: string | number | null | {};
    hasSent?: boolean;
    count?: number;
    notificationsEnabled?: boolean;
    [key: string]: unknown;
  } | undefined;
  isSendingReminder?: boolean;
  isSendingFollowup?: boolean;
}

export interface CustomerInfo {
  type: 'lead' | 'appointment' | 'offer' | 'camp';
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  createdAt: Date;
}

export interface Lead {
  id?: number;
  fullName?: string;
  phone?: string;
  status?: string;
  [key: string]: unknown;
}

export interface Appointment {
  id?: number;
  fullName?: string;
  phone?: string;
  status?: string;
  doctorName?: string;
  appointmentTime?: string | Date;
  department?: string;
  [key: string]: unknown;
}

export interface Offer {
  id?: number;
  fullName?: string;
  phone?: string;
  status?: string;
  offerTitle?: string;
  [key: string]: unknown;
}

export interface Camp {
  id?: number;
  fullName?: string;
  phone?: string;
  status?: string;
  campName?: string;
  [key: string]: unknown;
}

export interface CustomerRecords {
  leads: Lead[];
  appointments: Appointment[];
  offers: Offer[];
  camps: Camp[];
}
