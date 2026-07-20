/**
 * FeatureGate - مكون مغلف لحماية عناصر UI بناءً على الميزات المفعلة
 *
 * إذا كانت الميزة مفعلة، يعرض العناصر بداخله (Children)
 * إذا لم تكن مفعلة، يعرض رسالة قفل أنيقة أو زر "طلب التفعيل"
 *
 * @example
 * <FeatureGate feature="whatsapp">
 *   <WhatsAppDashboard />
 * </FeatureGate>
 *
 * @example
 * <FeatureGate feature="reports" fallback={<CustomFallback />}>
 *   <ReportsPage />
 * </FeatureGate>
 */

import { ReactNode } from 'react';
import { useLicense } from '@/hooks/integrations/useLicense';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * خيارات FeatureGate
 */
export interface FeatureGateProps {
  /** اسم الميزة المطلوبة */
  feature: string;
  /** العناصر التي سيتم عرضها إذا كانت الميزة مفعلة */
  children: ReactNode;
  /** العنصر البديل إذا لم تكن الميزة مفعلة */
  fallback?: ReactNode;
  /** نوع العرض للميزة المغلقة */
  fallbackType?: 'minimal' | 'card' | 'inline';
  /** عنوان مخصص للميزة المغلقة */
  lockedTitle?: string;
  /** وصف مخصص للميزة المغلقة */
  lockedDescription?: string;
  /** إظهار زر "طلب التفعيل" */
  showUpgradeButton?: boolean;
  /** رابط زر التفعيل */
  upgradeLink?: string;
  /** كلاسات CSS إضافية */
  className?: string;
}

/**
 * المكون الافتراضي للميزة المغلقة (نمط Card)
 */
function LockedFeatureCard({
  feature,
  title,
  description,
  showUpgradeButton,
  upgradeLink,
}: {
  feature: string;
  title?: string;
  description?: string;
  showUpgradeButton?: boolean;
  upgradeLink?: string;
}) {
  // قاموس أسماء الميزات بالعربية
  const featureNames: Record<string, string> = {
    whatsapp: 'واتساب',
    reports: 'التقارير والإحصائيات',
    camps: 'إدارة المخيمات',
    offers: 'إدارة العروض',
    patient_portal: 'بوابة المرضى',
    team_management: 'إدارة الفرق',
    campaigns: 'الحملات التسويقية',
    bookings: 'إدارة الحجوزات',
  };

  const featureName = title || featureNames[feature] || feature;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/30">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        <CardTitle className="text-xl mb-2">ميزة {featureName} غير مفعلة</CardTitle>
        <CardDescription className="text-base">
          {description ||
            `هذه الميزة غير مدرجة في باقتك الحالية. يرجى التواصل مع الدعم لترقية الترخيص.`}
        </CardDescription>
      </CardHeader>
      {showUpgradeButton && (
        <CardContent className="text-center">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => {
              if (upgradeLink) {
                window.location.href = upgradeLink;
              } else {
                // Default action: show contact info
                // eslint-disable-next-line no-alert -- Intentional user notification
                alert('يرجى التواصل مع الدعم الفني لترقية الترخيص');
              }
            }}
          >
            <Sparkles className="ml-2 h-4 w-4" />
            طلب تفعيل الميزة
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * المكون البسيط للميزة المغلقة (نمط Minimal)
 */
function LockedFeatureMinimal({ feature }: { feature: string }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border border-muted-foreground/20">
      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-muted-foreground">ميزة {feature} غير مفعلة</span>
    </div>
  );
}

/**
 * المكون المضمن للميزة المغلقة (نمط Inline)
 */
function LockedFeatureInline({
  feature,
  showUpgradeButton,
  upgradeLink,
}: {
  feature: string;
  showUpgradeButton?: boolean;
  upgradeLink?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
          <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-sm">ميزة {feature}</p>
          <p className="text-xs text-muted-foreground">غير مفعلة في الباقة الحالية</p>
        </div>
      </div>
      {showUpgradeButton && (
        <Button
          size="sm"
          variant="outline"
          className="flex-shrink-0"
          onClick={() => {
            if (upgradeLink) {
              window.location.href = upgradeLink;
            }
          }}
        >
          <Sparkles className="ml-1 h-3 w-3" />
          تفعيل
        </Button>
      )}
    </div>
  );
}

/**
 * المكون الرئيسي لـ FeatureGate
 */
export default function FeatureGate({
  feature,
  children,
  fallback,
  fallbackType = 'card',
  lockedTitle,
  lockedDescription,
  showUpgradeButton = true,
  upgradeLink,
  className,
}: FeatureGateProps) {
  const { hasFeature, isLoading } = useLicense();

  // حالة التحميل
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // الميزة مفعلة - عرض العناصر
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // الميزة غير مفعلة - عرض الفاليب المخصص إذا وجد
  if (fallback) {
    return <>{fallback}</>;
  }

  // عرض المكون الافتراضي حسب النوع
  const commonProps = {
    feature,
    showUpgradeButton,
    upgradeLink,
  };

  switch (fallbackType) {
    case 'minimal':
      return <LockedFeatureMinimal {...commonProps} />;
    case 'inline':
      return <LockedFeatureInline {...commonProps} />;
    case 'card':
    default:
      return (
        <LockedFeatureCard {...commonProps} title={lockedTitle} description={lockedDescription} />
      );
  }
}

/**
 * نسخة مبسطة للتحقق السريع من الميزة (بدون UI)
 */
export function FeatureCheck({
  feature,
  children,
  fallback = null,
}: {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasFeature } = useLicense();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
