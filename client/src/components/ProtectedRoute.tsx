/**
 * ProtectedRoute - مكون لحماية الصفحات بناءً على الميزات المفعلة
 * 
 * يتحقق من أن الميزة المطلوبة مفعلة في الترخيص
 * إذا لم تكن مفعلة، يحول المستخدم إلى صفحة FeatureLockedPage
 * 
 * @example
 * <ProtectedRoute feature="whatsapp">
 *   <WhatsAppDashboard />
 * </ProtectedRoute>
 */

import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLicense } from '@/hooks/useLicense';

interface ProtectedRouteProps {
  /** اسم الميزة المطلوبة */
  feature: string;
  /** المكون أو الصفحة المحمية */
  children: ReactNode;
  /** مسار إعادة التوجيه المخصص (افتراضي: /feature-locked/:feature) */
  fallbackPath?: string;
}

export default function ProtectedRoute({
  feature,
  children,
  fallbackPath,
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { hasFeature, isLoading } = useLicense();

  useEffect(() => {
    // الانتظار حتى انتهاء التحميل
    if (isLoading) return;

    // التحقق من الميزة
    if (!hasFeature(feature)) {
      // إعادة التوجيه إلى صفحة الميزة المغلقة
      const redirectPath = fallbackPath || `/feature-locked/${feature}`;
      setLocation(redirectPath);
    }
  }, [feature, hasFeature, isLoading, setLocation, fallbackPath]);

  // حالة التحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // الميزة مفعلة - عرض العناصر
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // الميزة غير مفعلة - عرض فارغ (سيتم إعادة التوجيه تلقائياً)
  return null;
}

/**
 * نسرة مبسطة للتأكد السريع بدون إعادة توجيه
 */
export function FeatureRoute({
  feature,
  children,
  fallback = null,
}: {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasFeature, isLoading } = useLicense();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
