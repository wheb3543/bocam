import { lazy } from 'react';

/**
 * مجمع مسارات بوابة الموقع العام (Public Portal Routes)
 */
export const HomePage = lazy(() => import('./modules/01-home/pages/HomePage'));
export const ThankYou = lazy(() => import('./modules/02-booking/pages/ThankYouPage'));
export const Doctors = lazy(() => import('./modules/03-medical-directory/pages/DoctorsListPage'));
export const DoctorDetailPage = lazy(
  () => import('./modules/03-medical-directory/pages/DoctorDetailPage')
);
export const VisitingDoctors = lazy(
  () => import('./modules/03-medical-directory/pages/VisitingDoctorsPage')
);
export const DepartmentsPage = lazy(
  () => import('./modules/03-medical-directory/pages/DepartmentsListPage')
);
export const DepartmentDetailPage = lazy(
  () => import('./modules/03-medical-directory/pages/DepartmentDetailPage')
);
export const CampsListPage = lazy(
  () => import('./modules/04-camps-and-offers/pages/CampsListPage')
);
export const CampDetailPage = lazy(
  () => import('./modules/04-camps-and-offers/pages/CampDetailPage')
);
export const OffersListPage = lazy(
  () => import('./modules/04-camps-and-offers/pages/OffersListPage')
);
export const OffersPage = lazy(() => import('./modules/04-camps-and-offers/pages/OffersPage'));
export const OfferDetailPage = lazy(
  () => import('./modules/04-camps-and-offers/pages/OfferDetailPage')
);
export const DynamicPage = lazy(
  () => import('./modules/05-content-and-legal/pages/DynamicCmsPage')
);
export const DraftPreviewPage = lazy(
  () => import('./modules/05-content-and-legal/pages/DraftPreviewPage')
);
export const PrivacyPolicyPage = lazy(
  () => import('./modules/05-content-and-legal/pages/PrivacyPolicyPage')
);
export const PrivacyPolicyChangelogPage = lazy(
  () => import('./modules/05-content-and-legal/pages/PrivacyPolicyChangelogPage')
);
