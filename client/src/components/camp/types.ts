/**
 * Camp Management Types
 * أنواع إدارة المخيمات
 */

export interface Camp {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  startDate: Date | null;
  endDate: Date | null;
  discountedOffers: string | null;
  availableProcedures: string | null;
  galleryImages: string | null;
  morningTime: string | null;
  eveningTime: string | null;
  dailyCapacity: number | null;
  imageUrl: string | null;
  freeOffers: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampFormData {
  name: string;
  slug: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  discountedOffers: string;
  availableProcedures: string;
  galleryImages: string;
  morningTime: string;
  eveningTime: string;
  dailyCapacity: string;
  imageUrl: string;
  freeOffers: string;
  isActive: boolean;
}
