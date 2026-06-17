/**
 * useLicense - Hook مركزي لإدارة بيانات الترخيص والميزات
 *
 * يقرأ بيانات الترخيص والميزات المفعلة من tRPC API بشكل مركزي ومكشّف (Cached)
 * يوفر دوال مساعدة سهلة للتحقق من الميزات في أي مكان بالواجهة
 *
 * @example
 * const { hasFeature, isLicenseValid, licenseInfo } = useLicense();
 *
 * if (hasFeature('whatsapp')) {
 *   // عرض ميزة WhatsApp
 * }
 */

import { useMemo } from 'react';
import { trpc } from '@/lib/api/trpc';

/**
 * معلومات الترخيص
 */
export interface LicenseInfo {
  hardwareId: string;
  expiryDate: number;
  features: string[];
  issuedAt: number;
  version: string;
  isValid: boolean;
  validationMessage?: string;
}

/**
 * خيارات useLicense Hook
 */
export interface UseLicenseOptions {
  /** إعادة التحميل التلقائي (default: false) */
  refetchInterval?: false | number;
  /** تفعيل الاستعلام (default: true) */
  enabled?: boolean;
}

/**
 * Hook مركزي لإدارة بيانات الترخيص والميزات
 *
 * @param options - خيارات التكوين
 * @returns كائن يحتوي على دوال ومعلومات الترخيص
 */
export function useLicense(options: UseLicenseOptions = {}) {
  const { refetchInterval = false, enabled = true } = options;

  // استعلام معلومات الترخيص (مع caching)
  const licenseQuery = trpc.license.getInfo.useQuery(undefined, {
    refetchInterval,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000, // 10 دقائق
  });

  // استعلام الميزات المفعلة (مع caching)
  const featuresQuery = trpc.license.getFeatures.useQuery(undefined, {
    refetchInterval,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000, // 10 دقائق
  });

  // معلومات الترخيص
  const licenseInfo: LicenseInfo | null = useMemo(() => {
    if (!licenseQuery.data) return null;
    return licenseQuery.data;
  }, [licenseQuery.data]);

  // الميزات المفعلة
  const enabledFeatures: string[] = useMemo(() => {
    if (!featuresQuery.data?.success) return [];
    return featuresQuery.data.features || [];
  }, [featuresQuery.data]);

  // حالة التحميل
  const isLoading = licenseQuery.isLoading || featuresQuery.isLoading;

  // حالة الخطأ
  const error = licenseQuery.error || featuresQuery.error;

  /**
   * التحقق من صحة الترخيص
   * @returns true إذا كان الترخيص صالح
   */
  const isLicenseValid = useMemo(() => {
    return licenseInfo?.isValid ?? false;
  }, [licenseInfo]);

  /**
   * التحقق من تفعيل ميزة محددة
   * @param feature - اسم الميزة
   * @returns true إذا كانت الميزة مفعلة
   */
  const hasFeature = useMemo(() => {
    return (feature: string): boolean => {
      // الميزة الخاصة (*) تعني جميع الميزات مفعلة
      if (enabledFeatures.includes('*')) {
        return true;
      }

      return enabledFeatures.includes(feature);
    };
  }, [enabledFeatures]);

  /**
   * التحقق من تفعيل عدة ميزات دفعة واحدة
   * @param features - قائمة أسماء الميزات
   * @returns كائن يحتوي على حالة كل ميزة
   */
  const hasFeatures = useMemo(() => {
    return (features: string[]): Record<string, boolean> => {
      return features.reduce(
        (acc, feature) => {
          acc[feature] = hasFeature(feature);
          return acc;
        },
        {} as Record<string, boolean>
      );
    };
  }, [hasFeature]);

  /**
   * الحصول على جميع الميزات المفعلة
   * @returns قائمة أسماء الميزات المفعلة
   */
  const getEnabledFeatures = useMemo(() => {
    return (): string[] => {
      return [...enabledFeatures];
    };
  }, [enabledFeatures]);

  /**
   * التحقق من انتهاء الترخيص
   * @returns true إذا كان الترخيص منتهي
   */
  const isLicenseExpired = useMemo(() => {
    if (!licenseInfo?.expiryDate) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return licenseInfo.expiryDate < currentTime;
  }, [licenseInfo]);

  /**
   * حساب الأيام المتبقية
   * @returns عدد الأيام المتبقية
   */
  const daysRemaining = useMemo(() => {
    if (!licenseInfo?.expiryDate) return 0;
    const currentTime = Math.floor(Date.now() / 1000);
    const secondsRemaining = licenseInfo.expiryDate - currentTime;
    return Math.floor(secondsRemaining / (24 * 60 * 60));
  }, [licenseInfo]);

  /**
   * إعادة تحميل بيانات الترخيص
   */
  const refetch = useMemo(() => {
    return () => {
      licenseQuery.refetch();
      featuresQuery.refetch();
    };
  }, [licenseQuery, featuresQuery]);

  return {
    // معلومات الترخيص
    licenseInfo,
    enabledFeatures,

    // دوال التحقق
    hasFeature,
    hasFeatures,
    getEnabledFeatures,
    isLicenseValid,
    isLicenseExpired,

    // معلومات إضافية
    daysRemaining,

    // حالة الاستعلام
    isLoading,
    error,

    // دوال التحكم
    refetch,
  };
}

/**
 * تعديل نوع tRPC لإضافة دعم الترخيص
 */
declare module '@trpc/react-query' {
  interface UseTRPCQueryResult {
    licenseInfo?: LicenseInfo;
  }
}
