/**
 * Doctor Helpers
 * دوال مساعدة للأطباء
 */

import type { Doctor, DoctorStats } from '../types/doctor.types';

export const calculateDoctorStats = (doctors: Doctor[] | undefined): DoctorStats => {
  if (!doctors) {
    return {
      total: 0,
      available: 0,
      unavailable: 0,
      visiting: 0,
      visitingAvailable: 0,
      visitingUnavailable: 0,
    };
  }
  const visiting = doctors.filter((d) => d.isVisiting === 'yes');
  return {
    total: doctors.length,
    available: doctors.filter((d) => d.available === 'yes').length,
    unavailable: doctors.filter((d) => d.available === 'no').length,
    visiting: visiting.length,
    visitingAvailable: visiting.filter((d) => d.available === 'yes').length,
    visitingUnavailable: visiting.filter((d) => d.available === 'no').length,
  };
};
