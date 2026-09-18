import { lazy } from 'react';

/**
 * مجمع مسارات بوابة الطبيب (Doctor Portal Routes)
 */
export const DoctorLoginPage = lazy(() => import('./auth/DoctorLoginPage'));
export const DoctorPortalLayout = lazy(() => import('./layout/DoctorPortalLayout'));
