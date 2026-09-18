/**
 * DepartmentDetailPage - صفحة تفاصيل القسم والعيادة الطبية
 *
 * Dedicated page for a specific medical department showing clinic overview,
 * specialized services, affiliated doctors, and direct appointment booking.
 */

import { useParams, Link, useLocation } from 'wouter';
import {
  Building2,
  Stethoscope,
  Heart,
  HeartPulse,
  Brain,
  Eye,
  Activity,
  Baby,
  Bone,
  Pill,
  Sparkles,
  Smile,
  ShieldAlert,
  Thermometer,
  Syringe,
  Microscope,
  Dna,
  UserCheck,
  CalendarCheck2,
  Users,
  ChevronLeft,
  ArrowRight,
  Sparkle,
  Layers,
  User,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/api/trpc';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { COMPANY_ARABIC_NAME } from '@/const';

// Medical icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
  heart: Heart,
  heartpulse: HeartPulse,
  cardiology: HeartPulse,
  brain: Brain,
  neurology: Brain,
  eye: Eye,
  ophthalmology: Eye,
  activity: Activity,
  baby: Baby,
  pediatrics: Baby,
  bone: Bone,
  orthopedics: Bone,
  pill: Pill,
  pharmacy: Pill,
  sparkles: Sparkles,
  sparkle: Sparkle,
  smile: Smile,
  dental: Smile,
  shield: ShieldAlert,
  emergency: ShieldAlert,
  thermometer: Thermometer,
  syringe: Syringe,
  microscope: Microscope,
  laboratory: Microscope,
  lab: Microscope,
  dna: Dna,
  genetics: Dna,
  usercheck: UserCheck,
  building: Building2,
  building2: Building2,
  clinic: Building2,
  hospital: Building2,
};

function DepartmentIcon({
  name,
  className = 'w-6 h-6',
}: {
  name?: string | null;
  className?: string;
}) {
  if (!name) {
    return <Building2 className={className} />;
  }

  const normalized = name.toLowerCase().replace(/[-_\s]/g, '');
  const IconComponent = ICON_MAP[normalized] || Building2;
  return <IconComponent className={className} />;
}

export default function DepartmentDetailPage() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug || '';
  const [, setLocation] = useLocation();
  const { openBookingModal } = useBookingModal();

  // Query department by slug
  const {
    data: department,
    isLoading: isDeptLoading,
    isError: isDeptError,
  } = trpc.departments.getBySlug.useQuery({ slug }, { enabled: Boolean(slug && slug !== ':slug') });

  // Fallback doctors query for department if not already loaded in getBySlug
  const { data: allDoctors, isLoading: isDoctorsLoading } = trpc.doctors.list.useQuery(undefined, {
    enabled: Boolean(department?.id),
  });

  // Derive department doctors
  const doctors =
    department?.doctors && department.doctors.length > 0
      ? department.doctors
      : (allDoctors || []).filter(
          (doc) => doc.departmentId === department?.id && doc.available === 'yes'
        );

  const isLoading =
    isDeptLoading || (Boolean(department?.id) && isDoctorsLoading && !department?.doctors);

  // Loading Skeleton View
  if (isLoading) {
    return (
      <PageLayout
        title={`جاري التحميل... - ${COMPANY_ARABIC_NAME}`}
        description="جاري تحميل تفاصيل القسم الطبي..."
      >
        <div className="space-y-8 pb-16">
          <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-900 py-12 md:py-16 px-4">
            <div className="container mx-auto max-w-5xl space-y-4">
              <Skeleton className="h-6 w-32 bg-white/20 rounded-full" />
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-2xl bg-white/20" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64 bg-white/20 rounded-lg" />
                  <Skeleton className="h-4 w-40 bg-white/20 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          <div className="container mx-auto max-w-5xl px-4 space-y-8">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Not Found / Error View
  if (isDeptError || !department) {
    return (
      <PageLayout
        title={`القسم غير موجود - ${COMPANY_ARABIC_NAME}`}
        description="القسم الطبي المطلوب غير موجود أو تم نقله."
      >
        <div className="container mx-auto max-w-xl py-20 px-4 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto text-muted-foreground shadow-sm">
            <Building2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">القسم الطبي غير موجود</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              عذراً، لم نتمكن من العثور على القسم أو العيادة المطلوبة. ربما تم تحديث الرابط أو إلغاء
              تفعيل القسم.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/departments">
              <Button className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                <ArrowRight className="w-4 h-4" />
                <span>العودة إلى دليل الأقسام والعيادات</span>
              </Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${department.name} - ${COMPANY_ARABIC_NAME}`}
      description={
        department.description ||
        `تعرف على خدمات وأطباء قسم ${department.name} في ${COMPANY_ARABIC_NAME}. رعاية صحية متكاملة وأحدث التجهيزات الطبية.`
      }
      keywords={`${department.name}, عيادة ${department.name}, أطباء ${department.name}, حجز موعد`}
    >
      <div className="space-y-10 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-900 text-white py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#fff_0,transparent_50%),radial-gradient(circle_at_80%_80%,#34d399_0,transparent_50%)] pointer-events-none" />

          <div className="container mx-auto max-w-5xl relative z-10 space-y-6">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-200/90 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
              <Link href="/departments" className="hover:text-white transition-colors">
                الأقسام والعيادات
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
              <span className="text-white font-medium">{department.name}</span>
            </div>

            {/* Department Identity & Hero Content */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Department Icon Box */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-white/5">
                  <DepartmentIcon
                    name={department.icon}
                    className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                      {department.name}
                    </h1>
                    <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      عيادة تخصصية
                    </Badge>
                  </div>
                  {department.nameEn && (
                    <p className="text-xs sm:text-sm text-emerald-200/80 font-medium tracking-wide uppercase font-sans">
                      {department.nameEn}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl line-clamp-2">
                    {department.description ||
                      'تقديم رعاية طبية متكاملة بأحدث المعايير الصحية العالمية.'}
                  </p>
                </div>
              </div>

              {/* Primary Call to Action Button */}
              <div className="w-full md:w-auto flex-shrink-0 flex items-center gap-3">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => openBookingModal({ departmentId: department.id })}
                  className="w-full md:w-auto gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base py-6 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <CalendarCheck2 className="w-5 h-5" />
                  <span>احجز موعد في هذا القسم</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Clinic Overview & Features Section */}
        <section className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                نبذة عن العيادة والخدمات
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {department.description ||
                  `يقدم قسم ${department.name} باقة شاملة من الخدمات التشخيصية والعلاجية المتطورة تحت إشراف نخبة من الأطباء والاستشاريين المعتمدين، باستخدام أحدث التقنيات الطبية لضمان سلامة وراحة المرضى.`}
              </p>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/50 border border-border/50 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-medium text-foreground">استشاريون معتمدون وذوو خبرة</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/50 border border-border/50 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-medium text-foreground">
                    أحدث التجهيزات والتقنيات الطبية
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/50 border border-border/50 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-medium text-foreground">
                    مواعيد مرنة وحجز إلكتروني سريع
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Department Doctors Section */}
        <section className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  أطباء واستشاريو القسم
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  الكادر الطبي المتاح لاستقبال الحالات وتقديم الاستشارات
                </p>
              </div>
            </div>

            {doctors.length > 0 && (
              <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 rounded-full">
                {doctors.length} طبيب متاح
              </Badge>
            )}
          </div>

          {/* Doctors Grid */}
          {doctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setLocation(`/doctors/${doctor.slug}`)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card hover:bg-card/95 hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 overflow-hidden cursor-pointer"
                >
                  <div className="space-y-4">
                    {/* Doctor Header (Avatar & Specialty) */}
                    <div className="flex items-center gap-4">
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          loading="lazy"
                          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100 dark:border-emerald-900 group-hover:border-emerald-400 transition-colors flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center border-2 border-emerald-100 dark:border-emerald-900 group-hover:border-emerald-400 transition-colors flex-shrink-0">
                          <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0">
                        <h3 className="text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {doctor.name}
                        </h3>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 truncate">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Doctor Info & Fee */}
                    <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                      {doctor.experience && (
                        <p className="truncate">
                          <span className="font-semibold text-foreground">الخبرة:</span>{' '}
                          {doctor.experience}
                        </p>
                      )}
                      {doctor.consultationFee && (
                        <p className="truncate">
                          <span className="font-semibold text-foreground">رسوم الكشف:</span>{' '}
                          {doctor.consultationFee}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-border/60 grid grid-cols-2 gap-2">
                    <Link
                      href={`/doctors/${doctor.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-colors"
                    >
                      <span>الملف الطبي</span>
                      <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
                    </Link>

                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingModal({
                          doctorId: doctor.id,
                          departmentId: department.id,
                        });
                      }}
                      className="gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>احجز موعد</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  لا يوجد أطباء مضافون حالياً لهذا القسم
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  يمكنك حجز موعد مباشر في هذا القسم وسيتم توجيهك للطبيب المناسب من قبل فريق
                  الاستقبال.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => openBookingModal({ departmentId: department.id })}
                className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>حجز موعد في القسم مباشرة</span>
              </Button>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
