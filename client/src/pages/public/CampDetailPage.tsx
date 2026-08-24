/**
 * CampDetailPage - صفحة تفاصيل المخيم الطبي
 *
 * Individual camp page with details, gallery, and registration form
 */
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import SEO from '@/components/SEO';
import { getCompanyName } from '@/const';
import { trpc } from '@/lib/api/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  Phone,
  Calendar,
  Loader2,
  Heart,
  Users,
  CheckCircle2,
  Clock,
  MessageSquare,
  Tag,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from 'lucide-react';
import { getCompleteTrackingData } from '@/lib/tracking/tracking';
import {
  trackViewContent,
  trackMetaCompleteRegistration,
  updatePixelUserData,
} from '@/components/MetaPixel';
import { toast } from 'sonner';

import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';
import { usePatientStorage } from '@/hooks/data/usePatientStorage';
import { useAbandonedFormTracking } from '@/hooks/form/useAbandonedFormTracking';
import { useAuth } from '@/_core/hooks/useAuth';
import { usePublicPageContent } from '@/hooks/usePublicContent';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CampRegistration {
  id: number;
  campId: number;
  status: string;
  [key: string]: unknown;
}

type PublicPageTextContent = {
  key: string;
  content: string;
};

export default function CampDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <CampDetailContent slug={slug} />
    </div>
  );
}

function CampDetailContent({ slug }: { slug: string }) {
  const { validateYemeniPhone, processPhoneInput } = usePhoneFormat();
  const { getSavedPatientInfo, savePatientInfo } = usePatientStorage();
  const { formatDate } = useFormatDate();
  const [, setLocation] = useLocation();
  const [phoneError, setPhoneError] = useState<string>('');
  const { language } = useLanguage();
  const pageContentQuery = usePublicPageContent('camps', language) as {
    data?: { textContents: PublicPageTextContent[] };
  };
  const pageContent = pageContentQuery.data;
  const cmsText = (key: string, fallback: string) =>
    pageContent?.textContents.find((item) => item.key === key)?.content || fallback;
  const detailText = (key: string, fallback: string) =>
    cmsText(`camps.detail.${key}.${language}`, fallback);

  const copy = {
    notFoundTitle: detailText('notfound.title', 'لم يتم العثور على المخيم'),
    notFoundDescription: detailText(
      'notfound.description',
      'عذراً، لم نتمكن من العثور على المخيم المطلوب. قد يكون المخيم منتهياً أو الرابط غير صحيح.'
    ),
    notFoundButton: detailText('notfound.button', 'العودة إلى المخيمات'),
    breadcrumbHome: detailText('breadcrumb.home', 'الرئيسية'),
    breadcrumbCamps: detailText('breadcrumb.camps', 'المخيمات'),
    heroBadge: detailText('hero.badge', 'مخيم طبي خيري'),
    heroRegister: detailText('hero.register', 'سجل الآن مجاناً'),
    heroDate: detailText('hero.date', 'التاريخ'),
    heroAttendance: detailText('hero.attendance', 'معدل الحضور'),
    heroLimitedSeats: detailText('hero.limitedSeats', 'المقاعد محدودة'),
    heroLimitedSeatsDescription: detailText(
      'hero.limitedSeats.description',
      'سجل الآن قبل انتهاء الفرصة'
    ),
    freeBadge: detailText('free.badge', 'خدمات مجانية'),
    freeTitle: detailText('free.title', 'ما يشمله المخيم'),
    discountedBadge: detailText('discounted.badge', 'عروض مخفضة'),
    discountedTitle: detailText('discounted.title', 'العروض المخفضة'),
    showMore: detailText('expand.showMore', 'عرض المزيد'),
    hide: detailText('expand.hide', 'إخفاء'),
    service: detailText('expand.service', 'خدمة'),
    offer: detailText('expand.offer', 'عرض'),
    galleryTitle: detailText('gallery.title', 'معرض صور المخيم'),
    galleryImage: detailText('gallery.image', 'صورة'),
    formUrgency: detailText('form.urgency', 'المقاعد محدودة - سجل الآن!'),
    formTitle: detailText('form.title', 'سجل الآن في المخيم'),
    formDescription: detailText('form.description', 'املأ النموذج وسنتواصل معك لتأكيد التسجيل'),
    formFullName: detailText('form.fullName', 'الاسم الكامل'),
    formFullNamePlaceholder: detailText('form.fullName.placeholder', 'أدخل اسمك الكامل'),
    formPhone: detailText('form.phone', 'رقم الهاتف'),
    formPhonePlaceholder: detailText('form.phone.placeholder', 'مثال: 771234567'),
    formAge: detailText('form.age', 'العمر'),
    formAgePlaceholder: detailText('form.age.placeholder', 'أدخل عمرك'),
    formGender: detailText('form.gender', 'الجنس'),
    formGenderMale: detailText('form.gender.male', 'ذكر'),
    formGenderFemale: detailText('form.gender.female', 'أنثى'),
    formProcedures: detailText('form.procedures', 'الإجراءات المطلوبة (اختياري)'),
    formChooseProcedures: detailText('form.procedures.choose', 'اختر الإجراءات المطلوبة'),
    formSelected: detailText('form.procedures.selected', 'مختار'),
    formHideProcedures: detailText('form.procedures.hide', 'إخفاء الإجراءات'),
    formPreferredDateTime: detailText(
      'form.preferredDateTime',
      'التاريخ والوقت المناسب لك (اختياري)'
    ),
    formPreferredDateTimeDescription: detailText(
      'form.preferredDateTime.description',
      'إذا لم تختر، سيتم تحديد وقت مناسب تلقائياً'
    ),
    formDate: detailText('form.date', 'التاريخ'),
    formDatePlaceholder: detailText('form.date.placeholder', 'اختر التاريخ المناسب'),
    formTime: detailText('form.time', 'الوقت'),
    formMorning: detailText('form.time.morning', 'صباحاً'),
    formEvening: detailText('form.time.evening', 'مساءً'),
    formMessage: detailText('form.message', 'رسالة أو ملاحظة (اختياري)'),
    formMessagePlaceholder: detailText(
      'form.message.placeholder',
      'أي معلومات إضافية تودّ إضافتها...'
    ),
    formSending: detailText('form.sending', 'جاري التسجيل...'),
    formSubmit: detailText('form.submit', 'تسجيل في المخيم مجاناً'),
    trustSecure: detailText('form.trust.secure', 'تسجيل آمن'),
    trustImmediate: detailText('form.trust.immediate', 'رد فوري'),
    trustFree: detailText('form.trust.free', '100% مجاني'),
    expiredTitle: detailText('expired.title', 'المخيم منتهي'),
    expiredDescription: detailText(
      'expired.description',
      'هذا المخيم قد انتهى ولا يمكن التسجيل فيه حالياً. تابعنا للحصول على آخر التحديثات عن المخيمات القادمة.'
    ),
    expiredButton: detailText('expired.button', 'عودة إلى المخيمات'),
    contactTitle: detailText('contact.title', 'للاستفسارات والمزيد من المعلومات'),
    contactDescription: detailText('contact.description', 'اتصل بنا على الرقم المجاني'),
    contactPhone: detailText('contact.phone', '8000018'),
    contactWhatsapp: detailText('contact.whatsapp', 'واتساب'),
    contactWhatsappMessage: detailText(
      'contact.whatsapp.message',
      'مرحباً، أود الاستفسار عن المخيم الطبي'
    ),
    alertNotFound: detailText('alert.notfound', 'المخيم غير موجود'),
    alertRequired: detailText('alert.required', 'الرجاء إدخال الاسم ورقم الهاتف'),
    alertPhone: detailText('alert.phone', 'رقم الهاتف غير صحيح'),
    alertAge: detailText('alert.age', 'الرجاء إدخال العمر بشكل صحيح'),
    alertSuccess: detailText('alert.success', 'تم تسجيلك بنجاح! سنتواصل معك قريباً'),
    alertError: detailText('alert.error', 'حدث خطأ أثناء التسجيل'),
  };

  const { user } = useAuth();
  const { data: availableDates } = trpc.camps.getAvailableDates.useQuery(
    { slug },
    { enabled: !!slug && slug !== ':slug' }
  );
  const { data: camp, isLoading } = trpc.camps.getBySlug.useQuery(
    { slug },
    { enabled: !!slug && slug !== ':slug' }
  );
  // استعلام محمي - يعمل فقط للمستخدمين المسجلين لتجنب خطأ UNAUTHORIZED
  const { data: registrations } = trpc.campRegistrations.list.useQuery(undefined, {
    enabled: !!user,
  });
  const submitRegistration = trpc.campRegistrations.submit.useMutation();
  // eventId موحّد لتجنب تكرار الحدث بين Pixel وCAPI (Deduplication)
  const [regEventId] = useState(
    () => `camp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );

  const savedInfo = getSavedPatientInfo();
  const [formData, setFormData] = useState({
    fullName: savedInfo?.fullName || '',
    phone: savedInfo?.phone || '',
    email: '',
    age: '',
    gender: (savedInfo?.gender || '') as 'male' | 'female' | '',
    procedures: [] as string[],
    patientMessage: '',
    preferredDate: '',
    preferredTimeSlot: '' as 'morning' | 'evening' | '',
  });
  const [showAllFreeOffers, setShowAllFreeOffers] = useState(false);
  const [showAllDiscountedOffers, setShowAllDiscountedOffers] = useState(false);
  const [showProcedures, setShowProcedures] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // تتبع النماذج المهجورة (الفرص الضائعة)
  useAbandonedFormTracking({
    formType: 'camp',
    relatedId: camp?.id,
    relatedName: camp?.name,
    getFormData: () => ({ name: formData.fullName, phone: formData.phone }),
    submitted,
  });

  // Get available procedures from camp data
  const availableProcedures = useMemo(() => {
    if (!camp?.availableProcedures) {
      return [];
    }
    try {
      const parsed = JSON.parse(camp.availableProcedures);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return camp.availableProcedures.split('\n').filter((p: string) => p.trim());
    } catch {
      return camp.availableProcedures.split('\n').filter((p: string) => p.trim());
    }
  }, [camp]);

  // Calculate camp statistics
  const campStats = useMemo(() => {
    if (!camp || !registrations) {
      return null;
    }

    const campRegistrations = registrations.filter((r: CampRegistration) => r.campId === camp.id);
    const total = campRegistrations.length;
    const confirmed = campRegistrations.filter(
      (r: CampRegistration) =>
        r.status === 'confirmed' || r.status === 'attended' || r.status === 'completed'
    ).length;
    const attended = campRegistrations.filter(
      (r: CampRegistration) => r.status === 'attended' || r.status === 'completed'
    ).length;
    const attendanceRate = confirmed > 0 ? Math.round((attended / confirmed) * 100) : 0;

    return { total, confirmed, attended, attendanceRate };
  }, [camp, registrations]);

  // إرسال حدث ViewContent عند تحميل صفحة المخيم
  useEffect(() => {
    if (camp) {
      trackViewContent({
        content_name: camp.name || 'Medical Camp',
        content_category: 'Healthcare Camp',
        content_ids: [String(camp.id)],
        content_type: 'camp',
      });
    }
  }, [camp]);

  useEffect(() => {
    if (!isLoading && !camp) {
      toast.error(copy.alertNotFound);
      setLocation('/camps');
    }
  }, [camp, copy.alertNotFound, isLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone) {
      toast.error(copy.alertRequired);
      return;
    }

    // التحقق من رقم الهاتف اليمني
    const phoneValidation = validateYemeniPhone(formData.phone);
    if (!phoneValidation.valid) {
      setPhoneError(copy.alertPhone);
      toast.error(copy.alertPhone);
      return;
    }
    setPhoneError('');

    if (!formData.age || parseInt(formData.age) <= 0) {
      toast.error(copy.alertAge);
      return;
    }

    if (!camp) {
      return;
    }

    try {
      const trackingData = getCompleteTrackingData();

      // Advanced Matching: تحديث بيانات المستخدم في Pixel لرفع EMQ
      updatePixelUserData({ phone: formData.phone, email: formData.email || undefined }).catch(
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- Intentional no-op error handler
        () => {}
      );
      // Pixel CompleteRegistration event (جانب العميل) — يُرسَل مع eventId لتجنب التكرار مع CAPI
      trackMetaCompleteRegistration({
        content_name: 'Camp Registration',
        content_category: 'Healthcare',
        eventId: regEventId,
      });

      // حفظ بيانات المريض في localStorage بعد الإرسال الناجح
      savePatientInfo({
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender || undefined,
      });

      await submitRegistration.mutateAsync({
        campId: camp.id,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        age: parseInt(formData.age),
        gender:
          formData.gender === 'male' || formData.gender === 'female' ? formData.gender : undefined,
        procedures:
          formData.procedures.length > 0 ? JSON.stringify(formData.procedures) : undefined,
        patientMessage: formData.patientMessage || undefined,
        preferredDate: formData.preferredDate || undefined,
        preferredTimeSlot: (formData.preferredTimeSlot as 'morning' | 'evening') || undefined,
        source: trackingData.source,
        utmSource: trackingData.utmSource,
        utmMedium: trackingData.utmMedium,
        utmCampaign: trackingData.utmCampaign,
        utmTerm: trackingData.utmTerm,
        utmContent: trackingData.utmContent,
        utmPlacement: trackingData.utmPlacement,
        referrer: trackingData.referrer,
        fbclid: trackingData.fbclid,
        gclid: trackingData.gclid,
      });

      setSubmitted(true);
      toast.success(copy.alertSuccess);

      const params = new URLSearchParams({
        type: 'camp',
        name: formData.fullName,
        phone: formData.phone,
        ...(formData.email && { email: formData.email }),
        ...(camp && { camp: camp.name }),
      });

      setTimeout(() => {
        setLocation(`/thank-you?${params.toString()}`);
      }, 1500);
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message;
      void msg;
      toast.error(copy.alertError);
    }
  };

  const companyName = getCompanyName('ar');
  const seoTitle = camp ? `${camp.name} | ${companyName}` : `المخيمات الطبية | ${companyName}`;

  const seoDescription = camp
    ? `${(camp.description || camp.name).substring(0, 150)}... سجل الآن في مخيمنا الطبي المجاني. اتصل: 8000018`
    : `مخيمات طبية مجانية لخدمة المجتمع في ${companyName}`;

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="bg-white dark:bg-card border-b">
          <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
            <Skeleton className="h-4 sm:h-5 w-48 sm:w-60" />
          </div>
        </div>
        <section className="bg-gradient-to-br from-green-600 to-blue-600 py-8 sm:py-16 md:py-24">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 bg-white/20" />
                <Skeleton className="h-10 sm:h-14 w-full bg-white/20" />
                <Skeleton className="h-10 sm:h-14 w-3/4 bg-white/20" />
                <Skeleton className="h-5 sm:h-6 w-full bg-white/20" />
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <Skeleton className="h-12 sm:h-16 rounded-lg bg-white/20" />
                  <Skeleton className="h-12 sm:h-16 rounded-lg bg-white/20" />
                </div>
              </div>
              <Skeleton className="h-48 sm:h-64 md:h-80 rounded-2xl bg-white/20" />
            </div>
          </div>
        </section>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 mx-auto mb-4 sm:mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 sm:h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!camp) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{copy.notFoundTitle}</h2>
            <p className="text-muted-foreground mb-6 text-sm">{copy.notFoundDescription}</p>
            <Link href="/camps">
              <Button className="bg-green-600 hover:bg-green-700 gap-2">
                <ArrowRight className="h-4 w-4" />
                {copy.notFoundButton}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <SEO title={seoTitle} description={seoDescription} />
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-card border-b">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <Link href="/" className="hover:text-green-600 transition-colors">
              {copy.breadcrumbHome}
            </Link>
            <span>/</span>
            <Link href="/camps" className="hover:text-green-600 transition-colors">
              {copy.breadcrumbCamps}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-[200px]">
              {camp.name}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-blue-600 text-white pt-4 sm:pt-6 md:pt-8 pb-8 sm:pb-16 md:pb-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          ></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-12 items-center">
            <div>
              {/* Badge + CTA */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <img src="/assets/new-logo.png" alt="شعار المستشفى" className="h-4 w-4" />
                  <span className="text-sm font-semibold">{copy.heroBadge}</span>
                </div>
                <a href="#registration-form">
                  <Button
                    size="sm"
                    className="bg-white dark:bg-card text-green-700 hover:bg-green-50 font-bold text-sm px-4 py-2 shadow-lg"
                  >
                    {copy.heroRegister}
                  </Button>
                </a>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                {camp.name}
              </h1>

              <p className="text-xs sm:text-base md:text-lg text-white/95 leading-relaxed mb-4 sm:mb-6">
                {camp.description}
              </p>

              {/* Key Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {camp.startDate && camp.endDate && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                    <Calendar className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold">{copy.heroDate}</div>
                      <div className="text-white/90 text-xs">
                        {formatDate(camp.startDate)} - {formatDate(camp.endDate)}
                      </div>
                    </div>
                  </div>
                )}

                {campStats && campStats.total > 0 && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                    <TrendingUp className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold">{copy.heroAttendance}</div>
                      <div className="text-white/90 text-xs">{campStats.attendanceRate}%</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                  <Users className="h-5 w-5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold">{copy.heroLimitedSeats}</div>
                    <div className="text-white/90 text-xs">{copy.heroLimitedSeatsDescription}</div>
                  </div>
                </div>
              </div>
            </div>

            {camp.imageUrl && (
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img src={camp.imageUrl} alt={camp.name} className="w-full h-auto object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Free Offers Section */}
      {camp.freeOffers &&
        (() => {
          const allOffers = camp.freeOffers.split('\n').filter((offer: string) => offer.trim());
          const displayedOffers = showAllFreeOffers ? allOffers : allOffers.slice(0, 4);
          const hasMore = allOffers.length > 4;

          return (
            <section className="py-6 sm:py-10 md:py-14">
              <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-green-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-3">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-semibold text-green-700">
                      {copy.freeBadge}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-foreground">
                    {copy.freeTitle}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {displayedOffers.map((offer: string, index: number) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-card p-3 sm:p-4 rounded-xl shadow-sm border-r-4 border-green-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="bg-green-50 p-1 sm:p-1.5 rounded-lg flex-shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                        </div>
                        <p className="text-foreground text-right flex-1 text-xs sm:text-sm">
                          {offer.trim()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllFreeOffers(!showAllFreeOffers)}
                      className="gap-2 text-sm"
                    >
                      {showAllFreeOffers ? (
                        <>
                          {copy.hide} <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          {copy.showMore} ({allOffers.length - 4} {copy.service}){' '}
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </section>
          );
        })()}

      {/* Discounted Offers Section */}
      {camp.discountedOffers &&
        (() => {
          const allOffers = camp.discountedOffers
            .split('\n')
            .filter((offer: string) => offer.trim());
          const displayedOffers = showAllDiscountedOffers ? allOffers : allOffers.slice(0, 4);
          const hasMore = allOffers.length > 4;

          return (
            <section className="pb-6 sm:pb-10 md:pb-14">
              <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-3">
                    <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    <span className="text-xs sm:text-sm font-semibold text-blue-700">
                      {copy.discountedBadge}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-foreground">
                    {copy.discountedTitle}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {displayedOffers.map((offer: string, index: number) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-card p-3 sm:p-4 rounded-xl shadow-sm border-r-4 border-blue-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="bg-blue-50 p-1 sm:p-1.5 rounded-lg flex-shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <p className="text-foreground text-right flex-1 text-xs sm:text-sm">
                          {offer.trim()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllDiscountedOffers(!showAllDiscountedOffers)}
                      className="gap-2 text-sm"
                    >
                      {showAllDiscountedOffers ? (
                        <>
                          {copy.hide} <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          {copy.showMore} ({allOffers.length - 4} {copy.offer}){' '}
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </section>
          );
        })()}

      {/* Gallery Section */}
      {camp.galleryImages &&
        (() => {
          let images: string[] = [];
          try {
            const parsed = JSON.parse(camp.galleryImages);
            if (Array.isArray(parsed) && parsed.length > 0) {
              images = parsed;
            }
          } catch {
            images = camp.galleryImages.split('\n').filter((url: string) => url.trim());
          }

          if (images.length === 0) {
            return null;
          }

          return (
            <section className="pb-6 sm:pb-10 md:pb-14">
              <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
                <h2 className="text-base sm:text-xl md:text-2xl font-bold text-center text-foreground mb-4 sm:mb-6">
                  {copy.galleryTitle}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                  {images.map((imageUrl: string, index: number) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-card"
                    >
                      <img
                        src={typeof imageUrl === 'string' ? imageUrl.trim() : imageUrl}
                        alt={`${camp.name} - ${copy.galleryImage} ${index + 1}`}
                        className="w-full h-32 sm:h-40 md:h-56 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

      {/* Registration Form Section */}
      {camp.isActive && camp.endDate && new Date(camp.endDate) > new Date() && (
        <section id="registration-form" className="pb-6 sm:pb-10 md:pb-14">
          <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
            {/* Urgency Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2.5 sm:p-3 md:p-4 rounded-xl mb-3 sm:mb-4 text-center">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="font-bold text-xs sm:text-sm md:text-base">
                  {copy.formUrgency}
                </span>
              </div>
            </div>

            <Card className="shadow-sm border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <img
                    src="/assets/new-logo.png"
                    alt="شعار المستشفى"
                    className="h-6 w-6 sm:h-8 sm:w-8"
                  />
                  <div>
                    <CardTitle className="text-base sm:text-lg md:text-xl">
                      {copy.formTitle}
                    </CardTitle>
                    <CardDescription className="text-green-100 text-xs sm:text-sm">
                      {copy.formDescription}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                      {copy.formFullName} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      name="name"
                      autoComplete="name"
                      enterKeyHint="next"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={copy.formFullNamePlaceholder}
                      required
                      className="mt-1.5 h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                        {copy.formPhone} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="tel"
                          type="tel"
                          autoComplete="tel-national"
                          enterKeyHint="next"
                          value={formData.phone}
                          onChange={(e) => {
                            const processed = processPhoneInput(e.target.value);
                            setFormData({ ...formData, phone: processed });
                            if (phoneError) {
                              const v = validateYemeniPhone(processed);
                              setPhoneError(v.valid ? '' : copy.alertPhone);
                            }
                          }}
                          onBlur={() => {
                            if (formData.phone) {
                              const v = validateYemeniPhone(formData.phone);
                              setPhoneError(v.valid ? '' : copy.alertPhone);
                            }
                          }}
                          placeholder={copy.formPhonePlaceholder}
                          required
                          className={`mt-1.5 pr-10 h-11 ${phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          dir="ltr"
                          inputMode="numeric"
                        />
                      </div>
                      {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                    </div>
                    <div>
                      <Label htmlFor="age" className="text-sm font-medium text-foreground">
                        {copy.formAge} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        autoComplete="off"
                        enterKeyHint="done"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder={copy.formAgePlaceholder}
                        required
                        className="mt-1.5 h-11"
                      />
                    </div>
                  </div>

                  {/* حقل الجنس */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      {copy.formGender} <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: 'male' })}
                        className={`h-11 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.gender === 'male'
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-border bg-background text-foreground hover:border-green-400'
                        }`}
                      >
                        {copy.formGenderMale}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: 'female' })}
                        className={`h-11 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.gender === 'female'
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-border bg-background text-foreground hover:border-green-400'
                        }`}
                      >
                        {copy.formGenderFemale}
                      </button>
                    </div>
                  </div>

                  {/* Procedures Selection */}
                  {availableProcedures.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-foreground block mb-2">
                        {copy.formProcedures}
                      </Label>

                      {!showProcedures ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowProcedures(true)}
                          className="w-full py-4 text-sm border-dashed border-border hover:border-green-500 hover:bg-green-50 gap-2"
                        >
                          <Heart className="w-4 h-4" />
                          {copy.formChooseProcedures}
                          {formData.procedures.length > 0 && (
                            <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">
                              {formData.procedures.length} {copy.formSelected}
                            </span>
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {availableProcedures.map((procedure: string) => (
                              <label
                                key={procedure}
                                className={`flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer transition-all text-sm ${
                                  formData.procedures.includes(procedure)
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-border hover:border-green-300 hover:bg-muted/50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.procedures.includes(procedure)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        procedures: [...formData.procedures, procedure],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        procedures: formData.procedures.filter(
                                          (p) => p !== procedure
                                        ),
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                />
                                <span
                                  className={`text-sm ${
                                    formData.procedures.includes(procedure)
                                      ? 'text-green-700 font-medium'
                                      : 'text-foreground'
                                  }`}
                                >
                                  {procedure}
                                </span>
                              </label>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowProcedures(false)}
                            className="text-xs text-muted-foreground"
                          >
                            {copy.formHideProcedures}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* حقل اختيار التاريخ والوقت */}
                  {availableDates &&
                    availableDates.dates.length > 0 &&
                    (availableDates.morningTime || availableDates.eveningTime) && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground">
                          <Calendar className="inline h-4 w-4 ml-1" />
                          {copy.formPreferredDateTime}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {copy.formPreferredDateTimeDescription}
                        </p>
                        {/* اختيار التاريخ */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            {copy.formDate}
                          </Label>
                          <Select
                            value={formData.preferredDate}
                            onValueChange={(val) =>
                              setFormData({
                                ...formData,
                                preferredDate: val,
                                preferredTimeSlot: '',
                              })
                            }
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={copy.formDatePlaceholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableDates.dates.map((d) => (
                                <SelectItem key={d.date} value={d.date}>
                                  {new Date(d.date).toLocaleDateString('ar-YE', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* اختيار الوقت */}
                        {formData.preferredDate &&
                          (() => {
                            const selectedDay = availableDates.dates.find(
                              (d) => d.date === formData.preferredDate
                            );
                            const hasMorning =
                              selectedDay?.morningAvailable && availableDates.morningTime;
                            const hasEvening =
                              selectedDay?.eveningAvailable && availableDates.eveningTime;
                            if (!hasMorning && !hasEvening) {
                              return null;
                            }
                            return (
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  {copy.formTime}
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                  {hasMorning && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFormData({ ...formData, preferredTimeSlot: 'morning' })
                                      }
                                      className={`h-11 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                                        formData.preferredTimeSlot === 'morning'
                                          ? 'border-green-600 bg-green-50 text-green-700'
                                          : 'border-border bg-background text-foreground hover:border-green-400'
                                      }`}
                                    >
                                      <Clock className="h-4 w-4" />
                                      {copy.formMorning} {availableDates.morningTime}
                                    </button>
                                  )}
                                  {hasEvening && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFormData({ ...formData, preferredTimeSlot: 'evening' })
                                      }
                                      className={`h-11 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                                        formData.preferredTimeSlot === 'evening'
                                          ? 'border-green-600 bg-green-50 text-green-700'
                                          : 'border-border bg-background text-foreground hover:border-green-400'
                                      }`}
                                    >
                                      <Clock className="h-4 w-4" />
                                      {copy.formEvening} {availableDates.eveningTime}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                      </div>
                    )}
                  {/* حقل الرسالة الاختياري */}
                  <div>
                    <Label htmlFor="patientMessage" className="text-sm font-medium text-foreground">
                      {copy.formMessage}
                    </Label>
                    <textarea
                      id="patientMessage"
                      name="patientMessage"
                      value={formData.patientMessage}
                      onChange={(e) => setFormData({ ...formData, patientMessage: e.target.value })}
                      placeholder={copy.formMessagePlaceholder}
                      maxLength={500}
                      rows={3}
                      className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-left" dir="ltr">
                      {formData.patientMessage.length}/500
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-base py-5 font-bold mt-2"
                    disabled={submitRegistration.isPending}
                  >
                    {submitRegistration.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        {copy.formSending}
                      </>
                    ) : (
                      <>
                        <Heart className="ml-2 h-5 w-5" />
                        {copy.formSubmit}
                      </>
                    )}
                  </Button>

                  {/* Trust Elements */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span>{copy.trustSecure}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span>{copy.trustImmediate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span>{copy.trustFree}</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Expired Camp Notice */}
      {!camp.isActive && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
            <div className="bg-white dark:bg-card rounded-2xl shadow-sm p-4 sm:p-6 md:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                {copy.expiredTitle}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">{copy.expiredDescription}</p>
              <Button
                onClick={() => setLocation('/camps')}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                {copy.expiredButton}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-6 sm:py-8 md:py-10">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2">
            {copy.contactTitle}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-white/90 mb-3 sm:mb-4">
            {copy.contactDescription}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${copy.contactPhone.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center gap-2 bg-white dark:bg-card text-green-600 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-muted transition-colors shadow-lg"
            >
              <Phone className="h-4 w-4" />
              {copy.contactPhone}
            </a>
            <a
              href={`https://wa.me/9678000018?text=${encodeURIComponent(copy.contactWhatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              {copy.contactWhatsapp}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
