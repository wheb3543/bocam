import { lazy } from 'react';

/**
 * مجمع مسارات بوابة المريض الرقمية (Patient Portal Routes)
 */
export const PatientLoginPage = lazy(() => import('./auth/PatientLoginPage'));
export const PatientPortalLayout = lazy(() => import('./layout/PatientPortalLayout'));
export const PatientDashboardPage = lazy(() => import('./modules/dashboard/PatientDashboardPage'));
export const PatientHomePage = lazy(() => import('./modules/dashboard/PatientHomePage'));
export const PatientAppointmentsPage = lazy(
  () => import('./modules/appointments/pages/PatientAppointmentsPage')
);
export const PatientAppointmentDetailsPage = lazy(
  () => import('./modules/appointments/pages/PatientAppointmentDetailsPage')
);
export const PatientResultsPage = lazy(
  () => import('./modules/lab-results/pages/PatientResultsPage')
);
export const PatientResultDetailsPage = lazy(
  () => import('./modules/lab-results/pages/PatientResultDetailsPage')
);
export const FamilyProfilePage = lazy(() => import('./modules/family/pages/FamilyProfilePage'));
export const PatientCampsPage = lazy(() => import('./modules/camps-offers/pages/PatientCampsPage'));
export const PatientOffersPage = lazy(
  () => import('./modules/camps-offers/pages/PatientOffersPage')
);
