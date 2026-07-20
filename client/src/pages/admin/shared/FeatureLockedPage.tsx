/**
 * FeatureLockedPage - صفحة مخصصة للميزات غير المفعلة
 *
 * تُعرض عندما يحاول المستخدم الدخول لصفحة ميزة غير مفعلة في رخصته
 * تصميم جذاب يخبره أن الميزة غير مفعلة ويرشده للتواصل مع الدعم
 *
 * @example
 * // في الـ routing:
 * <Route path="/admin/whatsapp" component={WhatsAppDashboard} />
 * <Route path="/feature-locked/:feature" component={FeatureLockedPage} />
 */

import { useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Sparkles, Phone, Home, ShieldCheck } from 'lucide-react';
import { useLicense } from '@/hooks/integrations/useLicense';
import { APP_TITLE, COMPANY_PHONE } from '@/const';

interface FeatureLockedPageProps {
  /** اسم الميزة (يُؤخذ من URL params إذا لم يتم توفيره) */
  featureName?: string;
}

/**
 * قاموس أسماء الميزات بالعربية والوصف
 */
const FEATURE_INFO: Record<string, { name: string; description: string; benefits: string[] }> = {
  whatsapp: {
    name: 'واتساب',
    description: 'نظام متكامل لإدارة المراسلة عبر واتساب بيزنس',
    benefits: [
      'إرسال رسائل جماعية و broadcasts',
      'إدارة المحادثات والعمليات',
      'تحليلات وأداء الأرقام',
      'قوالب الرسائل المُعتمدة',
      'التكامل مع أنظمة المواعيد',
    ],
  },
  reports: {
    name: 'التقارير والإحصائيات',
    description: 'نظام شامل لتقارير الأداء والتحليلات',
    benefits: [
      'تقارير الحجوزات والمواعيد',
      'تحليلات التحويل والأداء',
      'تصدير البيانات إلى Excel',
      'رسوم بيانية تفاعلية',
      'تقارير الإيرادات والأرباح',
    ],
  },
  camps: {
    name: 'إدارة المخيمات',
    description: 'نظام متكامل لإدارة المخيمات الطبية',
    benefits: [
      'إنشاء وإدارة المخيمات',
      'تسجيل المشاركين',
      'إحصائيات المشاركة',
      'طباعة التقارير والشهادات',
      'إدارة الفرق الطبية',
    ],
  },
  offers: {
    name: 'إدارة العروض',
    description: 'نظام لإدارة العروض الطبية والترويجية',
    benefits: [
      'إنشاء عروض طبية',
      'تتبع العملاء المهتمين',
      'إدارة الحملات الترويجية',
      'تحليلات أداء العروض',
      'تكامل مع إدارة المرضى',
    ],
  },
  patient_portal: {
    name: 'بوابة المرضى',
    description: 'بوابة إلكترونية للمرضى لإدارة بياناتهم',
    benefits: [
      'حجز المواعيد إلكترونياً',
      'عرض النتائج الطبية',
      'إدارة الملف الشخصي',
      'التواصل مع الطاقم الطبي',
      'تاريخ المواعيد والعلاج',
    ],
  },
  team_management: {
    name: 'إدارة الفرق',
    description: 'نظام لإدارة الفرق والموظفين',
    benefits: [
      'إدارة الصلاحيات',
      'تتبع الأداء',
      'جدول المناوبات',
      'تقارير الحضور',
      'التواصل الداخلي',
    ],
  },
  campaigns: {
    name: 'الحملات التسويقية',
    description: 'نظام لإدارة الحملات التسويقية',
    benefits: [
      'إنشاء حملات متعددة القنوات',
      'تتبع الأداء والـ ROI',
      'إدارة الميزانيات',
      'تحليلات الجمهور',
      'أتمتة الحملات',
    ],
  },
  bookings: {
    name: 'إدارة الحجوزات',
    description: 'نظام متقدم لإدارة الحجوزات',
    benefits: [
      'حجز ذكي وتلقائي',
      'إدارة الغرف والأطباء',
      'تتبع الحالة',
      'إشعارات تلقائية',
      'تكامل مع الفوترة',
    ],
  },
};

export default function FeatureLockedPage({
  featureName: propFeatureName,
}: FeatureLockedPageProps) {
  const [, setLocation] = useLocation();
  const params = useParams();
  const featureName = propFeatureName || params.feature;
  const { licenseInfo, daysRemaining } = useLicense();

  // الحصول على معلومات الميزة
  const featureInfo = featureName ? FEATURE_INFO[featureName] : null;
  const displayName = featureInfo?.name || featureName || 'هذه الميزة';
  const description = featureInfo?.description || 'ميزة متقدمة من نظام BOCAM CRM';
  const benefits = featureInfo?.benefits || [];

  // إعادة التوجيه إذا كان الترخيص صالحاً (لمنع التكرار)
  useEffect(() => {
    if (!featureName) {
      return;
    }

    // التحقق من الميزة
    const checkFeature = async () => {
      try {
        const { trpc } = await import('@/lib/api/trpc');
        const result = trpc.license.checkFeature.useQuery({ feature: featureName });

        // إذا كانت الميزة مفعلة، أعد التوجيه للصفحة الرئيسية
        if (result.data?.enabled) {
          setLocation('/admin');
        }
      } catch {
        // Silently handle feature check errors
      }
    };

    checkFeature();
  }, [featureName, setLocation]);

  const handleContactSupport = () => {
    // محاولة فتح تطبيق الهاتف
    if (COMPANY_PHONE) {
      window.location.href = `tel:${COMPANY_PHONE}`;
    } else {
      // Fallback: عرض رسالة
      // eslint-disable-next-line no-alert -- Intentional user notification
      alert('يرجى التواصل مع الدعم الفني لترقية الترخيص');
    }
  };

  const handleUpgradeRequest = () => {
    // إنشاء email مُجهز مسبقاً
    const subject = encodeURIComponent(`طلب تفعيل ميزة ${displayName} - ${APP_TITLE}`);
    const body = encodeURIComponent(
      `السلام عليكم،\n\n` +
        `أرغب في طلب تفعيل ميزة "${displayName}" في نظام ${APP_TITLE}.\n\n` +
        `معلومات الترخيص:\n` +
        `- Hardware ID: ${licenseInfo?.hardwareId || 'غير متوفر'}\n` +
        `- تاريخ الانتهاء: ${licenseInfo?.expiryDate ? new Date(licenseInfo.expiryDate * 1000).toLocaleDateString('ar-SA') : 'غير متوفر'}\n` +
        `- الأيام المتبقية: ${daysRemaining || 0}\n\n` +
        `أرجو منكم تزويدي بالإجراءات اللازمة لتفعيل هذه الميزة.\n\n` +
        `شكراً جزيلاً.`
    );
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/20 dark:via-gray-950 dark:to-orange-950/20 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-2">
        <CardHeader className="space-y-6 text-center pb-6">
          {/* أيقونة القفل مع التاج */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-lg">
                <Lock className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
                <Crown className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* العنوان والوصف */}
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ميزة {displayName} غير مفعلة
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {description}
            </CardDescription>
          </div>

          {/* معلومات الترخيص */}
          {licenseInfo && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-right">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
                  معلومات الترخيص الحالي
                </span>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <p>
                  الأيام المتبقية: <span className="font-bold">{daysRemaining} يوم</span>
                </p>
                {licenseInfo.features.length > 0 && (
                  <p>
                    الميزات المفعلة:{' '}
                    <span className="font-bold">{licenseInfo.features.join('، ')}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* فوائد الميزة */}
          {benefits.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-4 text-center flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                لماذا تحتاج هذه الميزة؟
              </h3>
              <ul className="space-y-2 text-purple-800 dark:text-purple-400">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-500 flex-shrink-0 mt-1">✦</span>
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* رسالة التوجيه */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="font-medium">لتفعيل هذه الميزة، يرجى:</p>
            <p>التواصل مع الدعم الفني لترقية الترخيص الحالي</p>
          </div>

          {/* أزرار الإجراء */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={handleUpgradeRequest}
            >
              <Sparkles className="ml-2 h-4 w-4" />
              طلب تفعيل الميزة
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                onClick={handleContactSupport}
                className="border-amber-200 hover:bg-amber-50"
              >
                <Phone className="ml-2 h-4 w-4" />
                اتصل بالدعم
              </Button>

              <Button size="lg" variant="outline" onClick={() => setLocation('/admin')}>
                <Home className="ml-2 h-4 w-4" />
                لوحة التحكم
              </Button>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              هل لديك استفسار؟{' '}
              <button
                onClick={handleContactSupport}
                className="text-amber-600 hover:text-amber-700 font-medium underline"
              >
                تواصل معنا
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
