export type CampStatus = 'pending' | 'contacted' | 'no_answer' | 'confirmed' | 'attended' | 'completed' | 'cancelled';
export type TimeSlot = 'morning' | 'evening' | '';
export type TimeSlotForMutation = 'morning' | 'evening';

export interface CampRegistration {
  id?: number;
  receiptNumber?: string | null;
  fullName?: string;
  phone?: string;
  campId?: number;
  campName?: string | null;
  campSlug?: string | null;
  status?: CampStatus | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  age?: number | null;
  gender?: 'male' | 'female' | null;
  email?: string | null;
  attendanceDate?: string | Date | null;
  commentCount?: number;
  taskCount?: number;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  utmPlacement?: string | null;
  referrer?: string | null;
  procedures?: string | null;
  medicalCondition?: string | null;
  notes?: string | null;
  patientMessage?: string | null;
  source?: string | null;
  doctorName?: string | null;
  department?: string | null;
  preferredDate?: string | null;
  preferredTimeSlot?: TimeSlot | null;
  fbclid?: string | null;
  gclid?: string | null;
  statusNotes?: string | null;
  contactedAt?: string | Date | null;
  confirmedAt?: string | Date | null;
  attendedAt?: string | Date | null;
  completedAt?: string | Date | null;
  cancelledAt?: string | Date | null;
  [key: string]: unknown;
}

export interface CampStatusUpdateData {
  id: number;
  status: CampStatus;
  fullName?: string;
  phone?: string;
  attendanceDate?: Date;
  preferredDate?: string;
  preferredTimeSlot?: TimeSlotForMutation;
  notes?: string;
}

export interface AvailableDate {
  date?: string;
  [key: string]: unknown;
}

export interface Camp {
  id?: number;
  name?: string;
  [key: string]: unknown;
}
