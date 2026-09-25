/**
 * DepartmentDetailPage - صفحة تفاصيل القسم الطبي المستوحاة من نموذج SGH المرجعي.
 * تعرض صورة القسم، الوصف، الحالات والخدمات، التقنيات، الحجز، الأطباء، والأقسام المرتبطة.
 */
import { useMemo } from 'react';
import { Link, useParams } from 'wouter';
import {
  ArrowLeft,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ChevronLeft,
  CircleUserRound,
  MapPin,
  Phone,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/api/trpc';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { COMPANY_ARABIC_NAME, COMPANY_PHONE, getCompanyName } from '@/const';
import { PageProgress, FloatingButtons } from '@/apps/public/shared/components';
import { resolveDepartmentImage } from '../utils/departmentMedia';
import PageLayout from '@/components/layout/PageLayout';

const PRIMARY_GREEN = '#2eb34b';
const MEDICAL_BLUE = '#1ca8e5';

function parseList(value?: string | null): string[] {
  if (!value?.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Support old plain-text values.
  }

  return value
    .split('\n')
    .map((item) => item.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}

function DepartmentHero({
  name,
  image,
  tagline,
}: {
  name: string;
  image: string;
  tagline: string;
}) {
  return (
    <section
      className="sgh-hero-surface relative min-h-[330px] overflow-hidden bg-slate-900 sm:min-h-[461px]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08) 10%, rgba(0,0,0,.58) 100%), url(${image})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
      <div className="container relative mx-auto flex min-h-[330px] max-w-[1380px] items-end px-4 pb-10 sm:min-h-[461px] sm:pb-14">
        <div className="max-w-3xl text-white">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/80 sm:text-sm">
            <Link href="/" className="transition hover:text-white">
              الرئيسية
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <Link href="/departments" className="transition hover:text-white">
              الأقسام
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="font-medium text-white">{name}</span>
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            <Stethoscope className="h-4 w-4" />
            عيادة تخصصية
          </div>
          <h1 className="text-3xl font-bold leading-tight drop-shadow-sm sm:text-4xl lg:text-5xl">
            {name}
          </h1>
          {tagline && (
            <p className="mt-3 text-lg font-medium text-white/95 sm:text-2xl">{tagline}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-7 text-center">
      <div
        className="mb-2 inline-flex items-center gap-2 text-sm font-semibold"
        style={{ color: PRIMARY_GREEN }}
      >
        <span className="h-px w-8" style={{ backgroundColor: PRIMARY_GREEN }} />
        {eyebrow}
      </div>
      <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">{title}</h2>
      {description && (
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      )}
    </header>
  );
}

function DepartmentLoading() {
  return (
    <PageLayout
      title={`جاري التحميل - ${COMPANY_ARABIC_NAME}`}
      description="جاري تحميل تفاصيل القسم الطبي"
      useContainer
    >
      <PageProgress />
      <Skeleton className="h-[330px] w-full sm:h-[410px]" />
      <div className="container mx-auto max-w-[1380px] px-4 py-14">
        <Skeleton className="mx-auto h-9 w-64" />
        <Skeleton className="mx-auto mt-4 h-5 w-full max-w-2xl" />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} className="h-12" />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

function DepartmentNotFound() {
  return (
    <PageLayout
      title={`القسم غير موجود - ${COMPANY_ARABIC_NAME}`}
      description="القسم الطبي المطلوب غير متاح حالياً"
      useContainer
    >
      <div className="container mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
          <Building2 className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">القسم الطبي غير متاح</h1>
        <p className="mt-3 leading-7 text-slate-600">
          ربما تم تحديث رابط القسم أو إيقاف عرضه مؤقتاً.
        </p>
        <Link
          href="/departments"
          className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white"
          style={{ backgroundColor: PRIMARY_GREEN }}
        >
          العودة إلى الأقسام <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </PageLayout>
  );
}

function DepartmentContent({ slug }: { slug: string }) {
  const { openBookingModal } = useBookingModal();
  const {
    data: department,
    isLoading,
    isError,
  } = trpc.departments.getBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const { data: departments = [] } = trpc.departments.list.useQuery(undefined, {
    enabled: Boolean(department?.id),
  });

  const services = useMemo(() => parseList(department?.services), [department?.services]);
  const advancedTechniques = useMemo(
    () => parseList(department?.advancedTechniques),
    [department?.advancedTechniques]
  );
  const doctors = department?.doctors || [];
  const relatedDepartments = useMemo(
    () => departments.filter((item) => item.id !== department?.id).slice(0, 9),
    [department?.id, departments]
  );
  const image = department ? resolveDepartmentImage(department) : '';
  const fullDescription = department?.fullDescription || department?.description || '';
  const tagline = department?.tagline || 'رعاية متخصصة';
  const displayedServices =
    services.length > 0
      ? services
      : [
          'التشخيص الطبي المتخصص',
          'خطط علاج مخصصة لكل حالة',
          'متابعة طبية متخصصة ومستمرة',
          'استشارات متخصصة في عيادة القسم',
        ];
  const displayedTechniques =
    advancedTechniques.length > 0
      ? advancedTechniques
      : [
          'تشخيص طبي دقيق',
          'استخدام أحدث الأجهزة الطبية',
          'خطط علاج متخصصة',
          'متابعة مستمرة من فريق طبي متميز',
        ];

  if (isLoading) {
    return <DepartmentLoading />;
  }
  if (isError || !department) {
    return <DepartmentNotFound />;
  }

  return (
    <PageLayout
      title={`${department.name} | ${getCompanyName('ar')}`}
      description={
        department.description || `خدمات وأطباء قسم ${department.name} في ${COMPANY_ARABIC_NAME}`
      }
      keywords={`${department.name}, عيادة ${department.name}, أطباء ${department.name}, حجز موعد`}
      useContainer
    >
      <PageProgress />
      <FloatingButtons />
      <DepartmentHero name={department.name} image={image} tagline={tagline} />

      <div className="pb-20">
        <section className="bg-white py-14 sm:py-16">
          <div className="container mx-auto max-w-[1140px] px-4">
            <SectionTitle eyebrow="تعريف بالقسم" title={department.name} />
            <div className="mx-auto max-w-4xl text-center">
              {tagline && (
                <h3 className="mb-5 text-xl font-bold italic text-slate-700 sm:text-2xl">
                  {tagline}
                </h3>
              )}
              {fullDescription && (
                <p className="whitespace-pre-line text-base leading-9 text-slate-600 sm:text-lg">
                  {fullDescription}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-[#f8f8f8] py-14 sm:py-16">
          <div className="container mx-auto max-w-[1140px] px-4">
            <SectionTitle
              eyebrow="رعاية مصممة لك"
              title="علاج الحالات والخدمات"
              description="نقدم حلولاً طبية متخصصة تناسب احتياجات المريض وتهدف إلى تحقيق أفضل النتائج."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {displayedServices.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex min-h-28 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ color: PRIMARY_GREEN, backgroundColor: '#eaf8ee' }}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-16">
          <div className="container mx-auto max-w-[1140px] px-4">
            <SectionTitle
              eyebrow="أحدث الممارسات"
              title="تقنيات الرعاية المتقدمة"
              description="نوفر منهجاً طبياً حديثاً وآمناً ودقيقاً لرعاية المريض."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {displayedTechniques.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="group flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#f8f8f8] p-5 transition hover:border-[#2eb34b]/30 hover:bg-white hover:shadow-md"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition group-hover:scale-105"
                    style={{ backgroundColor: MEDICAL_BLUE }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <p className="pt-1.5 text-sm font-semibold leading-7 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8f8f8] py-14 sm:py-16">
          <div className="container mx-auto max-w-[1000px] px-4">
            <div
              className="relative overflow-hidden rounded-3xl px-6 py-10 text-center text-white shadow-lg sm:px-12 sm:py-12"
              style={{ background: 'linear-gradient(135deg, #2eb34b 0%, #1ca8e5 100%)' }}
            >
              <div className="absolute -left-12 -top-16 h-44 w-44 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 -left-8 h-52 w-52 rounded-full bg-white/10" />
              <div className="relative">
                <CalendarCheck2 className="mx-auto mb-4 h-9 w-9" />
                <h2 className="text-2xl font-bold sm:text-3xl">احجز موعدك اليوم</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
                  احجز موعدك في قسم {department.name} وتواصل مع فريق الاستقبال لاختيار الوقت
                  المناسب.
                </p>
                <button
                  type="button"
                  onClick={() => openBookingModal({ departmentId: department.id })}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-[#189b47] shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <CalendarCheck2 className="h-5 w-5" /> احجز الآن
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-16">
          <div className="container mx-auto max-w-[1200px] px-4">
            <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-sm font-semibold" style={{ color: PRIMARY_GREEN }}>
                  الكادر الطبي
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                  <span className="text-slate-500">({doctors.length})</span> أطباء في{' '}
                  {department.name}
                </h2>
              </div>
              {doctors.length > 0 && (
                <Link
                  href={`/doctors?department=${department.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ color: MEDICAL_BLUE }}
                >
                  عرض كل الأطباء <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
            </div>

            {doctors.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {doctors.slice(0, 4).map((doctor) => (
                  <article
                    key={doctor.id}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link href={`/doctors/${doctor.slug}`} className="block bg-slate-50">
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="h-56 w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-56 w-full items-center justify-center">
                          <CircleUserRound className="h-24 w-24 text-slate-300" />
                        </div>
                      )}
                    </Link>
                    <div className="p-4">
                      <Link href={`/doctors/${doctor.slug}`}>
                        <h3 className="min-h-12 font-bold leading-6 text-slate-800">
                          {doctor.name}
                        </h3>
                      </Link>
                      <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5" style={{ color: PRIMARY_GREEN }} />
                          {doctor.specialty}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" style={{ color: PRIMARY_GREEN }} />
                          القسم: {department.name}
                        </p>
                      </div>
                      <Link
                        href={`/doctors/${doctor.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                        style={{ color: PRIMARY_GREEN }}
                      >
                        عرض المزيد <ChevronLeft className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-400" />
                <h3 className="mt-3 font-bold text-slate-700">
                  لم يتم إضافة أطباء إلى هذا القسم بعد
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  يمكن حجز موعد في القسم وسيقوم فريق الاستقبال بتوجيهك للطبيب المناسب.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#f8f8f8] py-14 sm:py-16">
          <div className="container mx-auto max-w-[1380px] px-4">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: PRIMARY_GREEN }}>
                  استكشف المزيد
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                  المزيد من الأقسام
                </h2>
              </div>
              <Link
                href="/departments"
                className="inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: PRIMARY_GREEN }}
              >
                عرض المزيد <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {relatedDepartments.map((item) => (
                <Link
                  key={item.id}
                  href={`/departments/${item.slug}`}
                  className="group relative h-44 overflow-hidden rounded-2xl shadow-sm"
                >
                  <img
                    src={resolveDepartmentImage(item)}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <h3 className="absolute inset-x-4 bottom-4 flex items-center gap-2 text-base font-bold leading-6 text-white">
                    {item.name}{' '}
                    <ChevronLeft className="h-4 w-4 shrink-0 transition group-hover:-translate-x-1" />
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="border-t border-slate-100 bg-white py-8">
        <div className="container mx-auto flex max-w-[1140px] flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="text-center sm:text-right">
            <h2 className="font-bold text-slate-800">
              هل تحتاج إلى مساعدة في اختيار القسم المناسب؟
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              تواصل مع فريق الاستقبال لاختيار العيادة والتخصص المناسب.
            </p>
          </div>
          <a
            href={`tel:${COMPANY_PHONE}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:border-[#2eb34b] hover:text-[#2eb34b]"
          >
            <Phone className="h-4 w-4" /> {COMPANY_PHONE}
          </a>
        </div>
      </section>
    </PageLayout>
  );
}

export default function DepartmentDetailPage() {
  const params = useParams<{ slug?: string }>();
  return <DepartmentContent slug={params?.slug || ''} />;
}
