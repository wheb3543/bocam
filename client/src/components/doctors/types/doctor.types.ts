/**
 * Doctor Types
 * تعريفات الأنواع الخاصة بالأطباء
 */

export interface Doctor {
  id?: number;
  name?: string | null;
  slug?: string | null;
  specialty?: string | null;
  bio?: string | null;
  image?: string | null;
  languages?: string | null;
  procedures?: string | null;
  consultationFee?: string | null;
  experience?: string | null;
  available?: 'yes' | 'no' | null;
  isVisiting?: 'yes' | 'no' | null;
  status?: string | null;
  createdAt?: string | Date | null;
  [key: string]: unknown;
}

export interface DoctorFormData {
  name: string;
  slug: string;
  specialty: string;
  image: string;
  bio: string;
  experience: string;
  languages: string;
  consultationFee: string;
  procedures: string;
  isVisiting: 'yes' | 'no';
  available: 'yes' | 'no';
}

export const initialFormData: DoctorFormData = {
  name: '',
  slug: '',
  specialty: '',
  image: '',
  bio: '',
  experience: '',
  languages: '',
  consultationFee: '',
  procedures: '',
  isVisiting: 'no',
  available: 'yes',
};

export interface DoctorStats {
  total: number;
  available: number;
  unavailable: number;
  visiting: number;
  visitingAvailable: number;
  visitingUnavailable: number;
}
