/**
 * Shared Types - Used by both server and client
 * Single source of truth for entity types derived from database schema
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export interface Lead {
  id: number;
  campaignId: number;
  fullName: string;
  phone: string;
  email: string | null;
  status: 'new' | 'contacted' | 'booked' | 'not_interested' | 'no_answer';
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  utmPlacement: string | null;
  notes: string | null;
  emailSent: boolean;
  whatsappSent: boolean;
  bookingConfirmationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Camp {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  freeOffers: string | null;
  discountedOffers: string | null;
  availableProcedures: string | null;
  galleryImages: string | null;
  morningTime: string | null;
  eveningTime: string | null;
  dailyCapacity: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampRegistration {
  id: number;
  campId: number;
  campaignId: number | null;
  fullName: string;
  phone: string;
  email: string | null;
  age: number | null;
  gender: 'male' | 'female' | null;
  procedures: string | null;
  medicalCondition: string | null;
  patientMessage: string | null;
  notes: string | null;
  status: 'pending' | 'completed' | 'cancelled' | 'contacted' | 'no_answer' | 'confirmed' | 'attended';
  statusNotes: string | null;
  attendanceDate: Date | null;
  preferredDate: string | null;
  preferredTimeSlot: string | null;
  contactedAt: Date | null;
  confirmedAt: Date | null;
  attendedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  utmPlacement: string | null;
  referrer: string | null;
  fbclid: string | null;
  gclid: string | null;
  receiptNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: number;
  name: string;
  slug: string;
  specialty: string;
  image: string | null;
  bio: string | null;
  experience: string | null;
  languages: string | null;
  consultationFee: string | null;
  procedures: string | null;
  isVisiting: 'yes' | 'no';
  available: 'yes' | 'no';
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: number;
  campaignId: number;
  doctorId: number;
  fullName: string;
  phone: string;
  email: string | null;
  age: number | null;
  gender: 'male' | 'female';
  procedure: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  appointmentDate: Date | null;
  additionalNotes: string | null;
  staffNotes: string | null;
  notes: string | null;
  patientMessage: string | null;
  status: 'pending' | 'contacted' | 'no_answer' | 'confirmed' | 'attended' | 'completed' | 'cancelled';
  contactedAt: Date | null;
  confirmedAt: Date | null;
  attendedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  utmPlacement: string | null;
  referrer: string | null;
  fbclid: string | null;
  gclid: string | null;
  receiptNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Extended type for API responses with JOIN data
export interface AppointmentWithDoctor extends Omit<Appointment, 'gender'> {
  doctorName?: string | null;
  doctorSpecialty?: string | null;
  gender?: 'male' | 'female' | null; // Make gender optional for API responses
}

export interface Offer {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferLead {
  id: number;
  offerId: number;
  campaignId: number | null;
  fullName: string;
  phone: string;
  email: string | null;
  age: number | null;
  gender: 'male' | 'female';
  patientMessage: string | null;
  notes: string | null;
  status: 'pending' | 'completed' | 'cancelled' | 'contacted' | 'no_answer' | 'confirmed' | 'attended';
  statusNotes: string | null;
  contactedAt: Date | null;
  confirmedAt: Date | null;
  attendedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  utmPlacement: string | null;
  referrer: string | null;
  fbclid: string | null;
  gclid: string | null;
  receiptNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientResult {
  id: number;
  patientId: number;
  resultType: 'lab' | 'radiology' | 'report';
  title: string;
  description: string | null;
  fileUrl: string | null;
  doctorName: string | null;
  resultDate: Date | null;
  status: 'pending' | 'ready' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

export type WhatsAppMessageStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'received';
export type WhatsAppMessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'template' | 'interactive' | 'contacts' | 'unknown' | 'button_reply' | 'list_reply' | 'sticker' | 'reaction' | 'order' | 'referral' | 'product_enquiry' | 'unsupported';

export type AppointmentStatus = 'pending' | 'contacted' | 'no_answer' | 'confirmed' | 'attended' | 'completed' | 'cancelled';

// WhatsApp types from Drizzle schema
export type WhatsAppDirection = 'inbound' | 'outbound';

export interface WhatsAppMessage {
  id: number;
  conversationId: number;
  direction: WhatsAppDirection;
  content: string | null;
  messageType: WhatsAppMessageType;
  mediaId: string | null;
  mediaUrl: string | null;
  status: WhatsAppMessageStatus;
  whatsappMessageId: string | null;
  sentBy: number | null;
  isAutomated: number;
  replyToMessageId: number | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  errorInfo: string | null;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppTemplate {
  id: number;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  content: string;
  variables: string | null;
  isActive: number;
  usageCount: number;
  createdBy: number;
  metaName: string | null;
  languageCode: string | null;
  metaStatus: string | null;
  metaCategory: string | null;
  metaTemplateId: string | null;
  headerText: string | null;
  footerText: string | null;
  buttons: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickReply {
  id: number;
  name: string;
  keywords: string | null;
  replyText: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsappNotification {
  id: number;
  entityType: 'appointment' | 'camp_registration' | 'offer_lead';
  entityId: number;
  notificationType: 'booking_confirmation' | 'reminder_24h' | 'reminder_1h' | 'post_visit_followup' | 'cancellation' | 'status_update' | 'custom';
  phone: string;
  recipientName: string | null;
  templateName: string | null;
  messageContent: string | null;
  variables: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  metaMessageId: string | null;
  errorMessage: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  sentBy: number | null;
  isAutomatic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extended type for API responses with JOIN data
export interface WhatsappNotificationWithDetails extends WhatsappNotification {
  doctorName?: string | null;
  appointmentTime?: Date | null;
  department?: string | null;
}

export interface WhatsappReferral {
  id: number;
  messageId: number;
  conversationId: number;
  phoneNumber: string;
  sourceUrl: string | null;
  sourceId: string | null;
  sourceType: string | null;
  headline: string | null;
  body: string | null;
  mediaType: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
}

export interface WhatsappTemplateQuality {
  id: number;
  templateId: string;
  qualityScore: number | null;
  details: string | null;
  createdAt: Date;
}

export interface WhatsAppConversation {
  id: number;
  phoneNumber: string;
  customerName: string | null;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  isImportant: number;
  isArchived: number;
  leadId: number | null;
  appointmentId: number | null;
  offerLeadId: number | null;
  campRegistrationId: number | null;
  labOrderId: number | null;
  assignedToUserId: number | null;
  notes: string | null;
  conversationIdMeta: string | null;
  originType: string | null;
  expirationTimestamp: Date | null;
  pricingModel: string | null;
  billable: boolean;
  pricingCategory: string | null;
  totalCost: number;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types for GlobalSearch with JOIN data
export interface LeadWithRegistrationType extends Lead {
  registrationType?: string;
}

export interface AppointmentWithDoctorName extends AppointmentWithDoctor {
  doctorName?: string | null;
}

export interface OfferLeadWithTitle extends OfferLead {
  offerTitle?: string | null;
}

export interface CampRegistrationWithCampName extends CampRegistration {
  campName?: string | null;
  campSlug?: string | null;
}

// Unified lead type for getAllUnifiedLeads - combines appointments, offer leads, and camp registrations
export interface UnifiedLead {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: 'completed' | 'cancelled' | 'new' | 'contacted' | 'booked' | 'not_interested' | 'no_answer' | 'pending' | 'confirmed' | 'attended';
  createdAt: Date;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  type: 'appointment' | 'offer' | 'camp';
  typeLabel: string;
  relatedId?: number | null;
  doctorId?: number | null;
  source?: string | null;
  offerId?: number | null;
  campId?: number | null;
}
