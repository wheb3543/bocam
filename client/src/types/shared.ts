/**
 * Shared Types - Centralized Type Definitions
 *
 * This file serves as the single source of truth for all frontend types.
 * All types are derived from the database schema (drizzle/schema.ts) to ensure
 * consistency between frontend and backend.
 *
 * STRICT GUIDELINES:
 * 1. Never use 'as any' or 'as unknown' to suppress errors
 * 2. All types must match the database schema exactly
 * 3. Always handle null/undefined safely with ?. and ??
 * 4. Use mapper functions to sanitize data before rendering
 */

import type {
  Lead as DBLead,
  Camp as DBCamp,
  CampRegistration as DBCampRegistration,
  Doctor as DBDoctor,
  Appointment as DBAppointment,
  Offer as DBOffer,
  OfferLead as DBOfferLead,
} from '@shared/types';

// ============================================================================
// ENTITY TYPES - Derived from Database Schema
// ============================================================================

/**
 * Lead - Customer registration data
 * id is always number (from database schema)
 */
export type Lead = DBLead;

/**
 * Camp - Medical camp information
 */
export type Camp = DBCamp;

/**
 * CampRegistration - Registration for medical camps
 */
export type CampRegistration = DBCampRegistration;

/**
 * Doctor - Hospital doctor information
 */
export type Doctor = DBDoctor;

/**
 * Appointment - Appointment bookings
 */
export type Appointment = DBAppointment;

/**
 * Offer - Special medical offers and promotions
 */
export type Offer = DBOffer;

/**
 * OfferLead - Customer requests for special offers
 */
export type OfferLead = DBOfferLead;

// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================

/**
 * Safe type guard to check if a value is not null or undefined
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safe type guard to check if a value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Safe type guard to check if a string can be converted to a date
 */
export function isDateString(value: unknown): value is string {
  if (typeof value !== 'string') {return false;}
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// ============================================================================
// DATA MAPPERS - Safe Data Transformation Functions
// ============================================================================

/**
 * Mapper for Lead data - sanitizes and ensures type safety
 */
export function mapLead(data: unknown): Lead | null {
  if (!data || typeof data !== 'object') {return null;}

  const lead = data as Partial<Lead>;

  // Validate required fields
  if (!isNotNull(lead.id) || typeof lead.id !== 'number') {return null;}
  if (!isNotNull(lead.campaignId) || typeof lead.campaignId !== 'number') {return null;}
  if (!isNotNull(lead.fullName) || typeof lead.fullName !== 'string') {return null;}
  if (!isNotNull(lead.phone) || typeof lead.phone !== 'string') {return null;}

  // Ensure dates are Date objects
  const createdAt = lead.createdAt
    ? typeof lead.createdAt === 'string'
      ? new Date(lead.createdAt)
      : lead.createdAt
    : new Date();

  const updatedAt = lead.updatedAt
    ? typeof lead.updatedAt === 'string'
      ? new Date(lead.updatedAt)
      : lead.updatedAt
    : new Date();

  return {
    id: lead.id,
    campaignId: lead.campaignId,
    fullName: lead.fullName,
    phone: lead.phone,
    email: lead.email ?? null,
    status: lead.status ?? 'new',
    source: lead.source ?? null,
    utmSource: lead.utmSource ?? null,
    utmMedium: lead.utmMedium ?? null,
    utmCampaign: lead.utmCampaign ?? null,
    utmTerm: lead.utmTerm ?? null,
    utmContent: lead.utmContent ?? null,
    utmPlacement: lead.utmPlacement ?? null,
    notes: lead.notes ?? null,
    emailSent: lead.emailSent ?? false,
    whatsappSent: lead.whatsappSent ?? false,
    bookingConfirmationSent: lead.bookingConfirmationSent ?? false,
    createdAt,
    updatedAt,
  };
}

/**
 * Mapper for Camp data - sanitizes and ensures type safety
 */
export function mapCamp(data: unknown): Camp | null {
  if (!data || typeof data !== 'object') {return null;}

  const camp = data as Partial<Camp>;

  // Validate required fields
  if (!isNotNull(camp.id) || typeof camp.id !== 'number') {return null;}
  if (!isNotNull(camp.name) || typeof camp.name !== 'string') {return null;}
  if (!isNotNull(camp.slug) || typeof camp.slug !== 'string') {return null;}

  // Ensure dates are Date objects
  const startDate = camp.startDate
    ? typeof camp.startDate === 'string'
      ? new Date(camp.startDate)
      : camp.startDate
    : null;

  const endDate = camp.endDate
    ? typeof camp.endDate === 'string'
      ? new Date(camp.endDate)
      : camp.endDate
    : null;

  const createdAt = camp.createdAt
    ? typeof camp.createdAt === 'string'
      ? new Date(camp.createdAt)
      : camp.createdAt
    : new Date();

  const updatedAt = camp.updatedAt
    ? typeof camp.updatedAt === 'string'
      ? new Date(camp.updatedAt)
      : camp.updatedAt
    : new Date();

  return {
    id: camp.id,
    name: camp.name,
    slug: camp.slug,
    description: camp.description ?? null,
    imageUrl: camp.imageUrl ?? null,
    startDate,
    endDate,
    isActive: camp.isActive ?? true,
    freeOffers: camp.freeOffers ?? null,
    discountedOffers: camp.discountedOffers ?? null,
    availableProcedures: camp.availableProcedures ?? null,
    galleryImages: camp.galleryImages ?? null,
    morningTime: camp.morningTime ?? null,
    eveningTime: camp.eveningTime ?? null,
    dailyCapacity: camp.dailyCapacity ?? null,
    createdAt,
    updatedAt,
  };
}

/**
 * Mapper for CampRegistration data - sanitizes and ensures type safety
 */
export function mapCampRegistration(data: unknown): CampRegistration | null {
  if (!data || typeof data !== 'object') {return null;}

  const registration = data as Partial<CampRegistration>;

  // Validate required fields
  if (!isNotNull(registration.id) || typeof registration.id !== 'number') {return null;}
  if (!isNotNull(registration.campId) || typeof registration.campId !== 'number') {return null;}
  if (!isNotNull(registration.fullName) || typeof registration.fullName !== 'string') {return null;}
  if (!isNotNull(registration.phone) || typeof registration.phone !== 'string') {return null;}

  // Ensure dates are Date objects
  const attendanceDate = registration.attendanceDate
    ? typeof registration.attendanceDate === 'string'
      ? new Date(registration.attendanceDate)
      : registration.attendanceDate
    : null;

  const contactedAt = registration.contactedAt
    ? typeof registration.contactedAt === 'string'
      ? new Date(registration.contactedAt)
      : registration.contactedAt
    : null;

  const confirmedAt = registration.confirmedAt
    ? typeof registration.confirmedAt === 'string'
      ? new Date(registration.confirmedAt)
      : registration.confirmedAt
    : null;

  const attendedAt = registration.attendedAt
    ? typeof registration.attendedAt === 'string'
      ? new Date(registration.attendedAt)
      : registration.attendedAt
    : null;

  const completedAt = registration.completedAt
    ? typeof registration.completedAt === 'string'
      ? new Date(registration.completedAt)
      : registration.completedAt
    : null;

  const cancelledAt = registration.cancelledAt
    ? typeof registration.cancelledAt === 'string'
      ? new Date(registration.cancelledAt)
      : registration.cancelledAt
    : null;

  const createdAt = registration.createdAt
    ? typeof registration.createdAt === 'string'
      ? new Date(registration.createdAt)
      : registration.createdAt
    : new Date();

  const updatedAt = registration.updatedAt
    ? typeof registration.updatedAt === 'string'
      ? new Date(registration.updatedAt)
      : registration.updatedAt
    : new Date();

  return {
    id: registration.id,
    campId: registration.campId,
    campaignId: registration.campaignId ?? null,
    fullName: registration.fullName,
    phone: registration.phone,
    email: registration.email ?? null,
    age: registration.age ?? null,
    gender: registration.gender ?? null,
    procedures: registration.procedures ?? null,
    medicalCondition: registration.medicalCondition ?? null,
    patientMessage: registration.patientMessage ?? null,
    notes: registration.notes ?? null,
    status: registration.status ?? 'pending',
    statusNotes: registration.statusNotes ?? null,
    attendanceDate,
    preferredDate: registration.preferredDate ?? null,
    preferredTimeSlot: registration.preferredTimeSlot ?? null,
    contactedAt,
    confirmedAt,
    attendedAt,
    completedAt,
    cancelledAt,
    source: registration.source ?? null,
    utmSource: registration.utmSource ?? null,
    utmMedium: registration.utmMedium ?? null,
    utmCampaign: registration.utmCampaign ?? null,
    utmTerm: registration.utmTerm ?? null,
    utmContent: registration.utmContent ?? null,
    utmPlacement: registration.utmPlacement ?? null,
    referrer: registration.referrer ?? null,
    fbclid: registration.fbclid ?? null,
    gclid: registration.gclid ?? null,
    receiptNumber: registration.receiptNumber ?? null,
    createdAt,
    updatedAt,
  };
}

/**
 * Mapper for Doctor data - sanitizes and ensures type safety
 */
export function mapDoctor(data: unknown): Doctor | null {
  if (!data || typeof data !== 'object') {return null;}

  const doctor = data as Partial<Doctor>;

  // Validate required fields
  if (!isNotNull(doctor.id) || typeof doctor.id !== 'number') {return null;}
  if (!isNotNull(doctor.name) || typeof doctor.name !== 'string') {return null;}
  if (!isNotNull(doctor.slug) || typeof doctor.slug !== 'string') {return null;}
  if (!isNotNull(doctor.specialty) || typeof doctor.specialty !== 'string') {return null;}

  // Ensure dates are Date objects
  const createdAt = doctor.createdAt
    ? typeof doctor.createdAt === 'string'
      ? new Date(doctor.createdAt)
      : doctor.createdAt
    : new Date();

  const updatedAt = doctor.updatedAt
    ? typeof doctor.updatedAt === 'string'
      ? new Date(doctor.updatedAt)
      : doctor.updatedAt
    : new Date();

  return {
    id: doctor.id,
    name: doctor.name,
    slug: doctor.slug,
    specialty: doctor.specialty,
    image: doctor.image ?? null,
    bio: doctor.bio ?? null,
    experience: doctor.experience ?? null,
    languages: doctor.languages ?? null,
    consultationFee: doctor.consultationFee ?? null,
    procedures: doctor.procedures ?? null,
    isVisiting: doctor.isVisiting ?? 'no',
    available: doctor.available ?? 'yes',
    createdAt,
    updatedAt,
  };
}

/**
 * Mapper for Appointment data - sanitizes and ensures type safety
 */
export function mapAppointment(data: unknown): Appointment | null {
  if (!data || typeof data !== 'object') {return null;}

  const appointment = data as Partial<Appointment>;

  // Validate required fields
  if (!isNotNull(appointment.id) || typeof appointment.id !== 'number') {return null;}
  if (!isNotNull(appointment.campaignId) || typeof appointment.campaignId !== 'number') {return null;}
  if (!isNotNull(appointment.doctorId) || typeof appointment.doctorId !== 'number') {return null;}
  if (!isNotNull(appointment.fullName) || typeof appointment.fullName !== 'string') {return null;}
  if (!isNotNull(appointment.phone) || typeof appointment.phone !== 'string') {return null;}

  // Ensure dates are Date objects
  const appointmentDate = appointment.appointmentDate
    ? typeof appointment.appointmentDate === 'string'
      ? new Date(appointment.appointmentDate)
      : appointment.appointmentDate
    : null;

  const contactedAt = appointment.contactedAt
    ? typeof appointment.contactedAt === 'string'
      ? new Date(appointment.contactedAt)
      : appointment.contactedAt
    : null;

  const confirmedAt = appointment.confirmedAt
    ? typeof appointment.confirmedAt === 'string'
      ? new Date(appointment.confirmedAt)
      : appointment.confirmedAt
    : null;

  const attendedAt = appointment.attendedAt
    ? typeof appointment.attendedAt === 'string'
      ? new Date(appointment.attendedAt)
      : appointment.attendedAt
    : null;

  const completedAt = appointment.completedAt
    ? typeof appointment.completedAt === 'string'
      ? new Date(appointment.completedAt)
      : appointment.completedAt
    : null;

  const cancelledAt = appointment.cancelledAt
    ? typeof appointment.cancelledAt === 'string'
      ? new Date(appointment.cancelledAt)
      : appointment.cancelledAt
    : null;

  const createdAt = appointment.createdAt
    ? typeof appointment.createdAt === 'string'
      ? new Date(appointment.createdAt)
      : appointment.createdAt
    : new Date();

  const updatedAt = appointment.updatedAt
    ? typeof appointment.updatedAt === 'string'
      ? new Date(appointment.updatedAt)
      : appointment.updatedAt
    : new Date();

  return {
    id: appointment.id,
    campaignId: appointment.campaignId,
    doctorId: appointment.doctorId,
    fullName: appointment.fullName,
    phone: appointment.phone,
    email: appointment.email ?? null,
    age: appointment.age ?? null,
    gender: appointment.gender || 'male',
    procedure: appointment.procedure ?? null,
    preferredDate: appointment.preferredDate ?? null,
    preferredTime: appointment.preferredTime ?? null,
    appointmentDate,
    patientMessage: appointment.patientMessage ?? null,
    notes: appointment.notes ?? null,
    additionalNotes: appointment.additionalNotes ?? null,
    staffNotes: appointment.staffNotes ?? null,
    status: appointment.status ?? 'pending',
    contactedAt,
    confirmedAt,
    attendedAt,
    completedAt,
    cancelledAt,
    source: appointment.source ?? null,
    utmSource: appointment.utmSource ?? null,
    utmMedium: appointment.utmMedium ?? null,
    utmCampaign: appointment.utmCampaign ?? null,
    utmTerm: appointment.utmTerm ?? null,
    utmContent: appointment.utmContent ?? null,
    utmPlacement: appointment.utmPlacement ?? null,
    referrer: appointment.referrer ?? null,
    fbclid: appointment.fbclid ?? null,
    gclid: appointment.gclid ?? null,
    receiptNumber: appointment.receiptNumber ?? null,
    createdAt,
    updatedAt,
  };
}

/**
 * Mapper for Offer data - sanitizes and ensures type safety
 */
export function mapOffer(data: unknown): Offer | null {
  if (!data || typeof data !== 'object') {return null;}

  const offer = data as Partial<Offer>;

  // Validate required fields
  if (!isNotNull(offer.id) || typeof offer.id !== 'number') {return null;}
  if (!isNotNull(offer.title) || typeof offer.title !== 'string') {return null;}
  if (!isNotNull(offer.slug) || typeof offer.slug !== 'string') {return null;}

  // Ensure dates are Date objects
  const startDate = offer.startDate
    ? typeof offer.startDate === 'string'
      ? new Date(offer.startDate)
      : offer.startDate
    : null;

  const endDate = offer.endDate
    ? typeof offer.endDate === 'string'
      ? new Date(offer.endDate)
      : offer.endDate
    : null;

  const createdAt = offer.createdAt
    ? typeof offer.createdAt === 'string'
      ? new Date(offer.createdAt)
      : offer.createdAt
    : new Date();

  const updatedAt = offer.updatedAt
    ? typeof offer.updatedAt === 'string'
      ? new Date(offer.updatedAt)
      : offer.updatedAt
    : new Date();

  return {
    id: offer.id,
    title: offer.title,
    slug: offer.slug,
    description: offer.description ?? null,
    imageUrl: offer.imageUrl ?? null,
    isActive: offer.isActive ?? true,
    startDate,
    endDate,
    createdAt,
    updatedAt,
  };
}

/**
 * Mapper for OfferLead data - sanitizes and ensures type safety
 */
export function mapOfferLead(data: unknown): OfferLead | null {
  if (!data || typeof data !== 'object') {return null;}

  const offerLead = data as Partial<OfferLead>;

  // Validate required fields
  if (!isNotNull(offerLead.id) || typeof offerLead.id !== 'number') {return null;}
  if (!isNotNull(offerLead.offerId) || typeof offerLead.offerId !== 'number') {return null;}
  if (!isNotNull(offerLead.fullName) || typeof offerLead.fullName !== 'string') {return null;}
  if (!isNotNull(offerLead.phone) || typeof offerLead.phone !== 'string') {return null;}
  if (!isNotNull(offerLead.gender) || typeof offerLead.gender !== 'string') {return null;}

  // Ensure dates are Date objects
  const contactedAt = offerLead.contactedAt
    ? typeof offerLead.contactedAt === 'string'
      ? new Date(offerLead.contactedAt)
      : offerLead.contactedAt
    : null;

  const confirmedAt = offerLead.confirmedAt
    ? typeof offerLead.confirmedAt === 'string'
      ? new Date(offerLead.confirmedAt)
      : offerLead.confirmedAt
    : null;

  const attendedAt = offerLead.attendedAt
    ? typeof offerLead.attendedAt === 'string'
      ? new Date(offerLead.attendedAt)
      : offerLead.attendedAt
    : null;

  const completedAt = offerLead.completedAt
    ? typeof offerLead.completedAt === 'string'
      ? new Date(offerLead.completedAt)
      : offerLead.completedAt
    : null;

  const cancelledAt = offerLead.cancelledAt
    ? typeof offerLead.cancelledAt === 'string'
      ? new Date(offerLead.cancelledAt)
      : offerLead.cancelledAt
    : null;

  const createdAt = offerLead.createdAt
    ? typeof offerLead.createdAt === 'string'
      ? new Date(offerLead.createdAt)
      : offerLead.createdAt
    : new Date();

  const updatedAt = offerLead.updatedAt
    ? typeof offerLead.updatedAt === 'string'
      ? new Date(offerLead.updatedAt)
      : offerLead.updatedAt
    : new Date();

  return {
    id: offerLead.id,
    offerId: offerLead.offerId,
    campaignId: offerLead.campaignId ?? null,
    fullName: offerLead.fullName,
    phone: offerLead.phone,
    email: offerLead.email ?? null,
    age: offerLead.age ?? null,
    gender: offerLead.gender,
    patientMessage: offerLead.patientMessage ?? null,
    notes: offerLead.notes ?? null,
    status: offerLead.status ?? 'pending',
    statusNotes: offerLead.statusNotes ?? null,
    contactedAt,
    confirmedAt,
    attendedAt,
    completedAt,
    cancelledAt,
    source: offerLead.source ?? null,
    utmSource: offerLead.utmSource ?? null,
    utmMedium: offerLead.utmMedium ?? null,
    utmCampaign: offerLead.utmCampaign ?? null,
    utmTerm: offerLead.utmTerm ?? null,
    utmContent: offerLead.utmContent ?? null,
    utmPlacement: offerLead.utmPlacement ?? null,
    referrer: offerLead.referrer ?? null,
    fbclid: offerLead.fbclid ?? null,
    gclid: offerLead.gclid ?? null,
    receiptNumber: offerLead.receiptNumber ?? null,
    createdAt,
    updatedAt,
  };
}

// ============================================================================
// BATCH MAPPERS - For Arrays
// ============================================================================

/**
 * Batch mapper for Lead array
 */
export function mapLeads(data: unknown[]): Lead[] {
  return data.map(mapLead).filter(isNotNull);
}

/**
 * Batch mapper for Camp array
 */
export function mapCamps(data: unknown[]): Camp[] {
  return data.map(mapCamp).filter(isNotNull);
}

/**
 * Batch mapper for CampRegistration array
 */
export function mapCampRegistrations(data: unknown[]): CampRegistration[] {
  return data.map(mapCampRegistration).filter(isNotNull);
}

/**
 * Batch mapper for Doctor array
 */
export function mapDoctors(data: unknown[]): Doctor[] {
  return data.map(mapDoctor).filter(isNotNull);
}

/**
 * Batch mapper for Appointment array
 */
export function mapAppointments(data: unknown[]): Appointment[] {
  return data.map(mapAppointment).filter(isNotNull);
}

/**
 * Batch mapper for Offer array
 */
export function mapOffers(data: unknown[]): Offer[] {
  return data.map(mapOffer).filter(isNotNull);
}

/**
 * Batch mapper for OfferLead array
 */
export function mapOfferLeads(data: unknown[]): OfferLead[] {
  return data.map(mapOfferLead).filter(isNotNull);
}
