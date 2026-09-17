/**
 * DepartmentsPage - صفحة فهرس الأقسام والعيادات الطبية
 *
 * Public directory of medical departments and specialty clinics
 * Features live search, responsive cards, direct doctor filtering, and smart booking integration.
 */

import { useState, useMemo } from 'react';
import { Link } from 'wouter';
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
  Search,
  SearchX,
  CalendarCheck2,
  Users,
  ChevronLeft,
  X,
  RefreshCw,
  Sparkle,
  Layers,
} from 'lucide-react';

import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/api/trpc';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { COMPANY_ARABIC_NAME } from '@/const';

// Medical icon mapping for dynamic icon resolution
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

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { openBookingModal } = useBookingModal();

  // Fetch active departments from tRPC
  const { data: departments, isLoading, isError, refetch } = trpc.departments.list.useQuery();

  // Filter departments by Arabic name, English name, or description
  const filteredDepartments = useMemo(() => {
    if (!departments || !Array.isArray(departments)) {
      return [];
    }
    if (!searchQuery.trim()) {
      return departments;
    }

    const query = searchQuery.trim().toLowerCase();
    return departments.filter((dept) => {
      const matchNameAr = dept.name?.toLowerCase().includes(query);
      const matchNameEn = dept.nameEn?.toLowerCase().includes(query);
      const matchDesc = dept.description?.toLowerCase().includes(query);
      return Boolean(matchNameAr || matchNameEn || matchDesc);
    });
  }, [departments, searchQuery]);

  return (
    <PageLayout
      title={`الأقسام والعيادات الطبية - ${COMPANY_ARABIC_NAME}`}
      description={`استكشف كافة العيادات والأقسام الطبية التخصصية في ${COMPANY_ARABIC_NAME}. كوادر طبية واستشارية متخصصة ومجهزة بأحدث التقنيات.`}
      keywords="أقسام طبية, عيادات تخصصية, أطباء, حجز موعد, استشارات طبية"
    >
      <div className="space-y-8 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-900 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          {/* Subtle Ambient Background Highlights */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#fff_0,transparent_50%),radial-gradient(circle_at_80%_80%,#34d399_0,transparent_50%)] pointer-events-none" />

          <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-200 text-xs sm:text-sm font-medium shadow-inner">
              <Layers className="w-4 h-4 text-emerald-300" />
              <span>الرعاية التخصصية الشاملة</span>
            </div>

            {/* Title & Slogan */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
                الأقسام والعيادات الطبية
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
                منظومة متكاملة من العيادات التخصصية بإشراف نخبة من الأطباء والاستشاريين لتقديم أرقى
                مستويات الرعاية الصحية.
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="max-w-xl mx-auto pt-2">
              <div className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-gray-900 p-1.5 ring-1 ring-black/5 dark:ring-white/10">
                <Search className="w-5 h-5 text-muted-foreground mr-3 ml-2 flex-shrink-0" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن قسم، عيادة، أو خدمة طبية..."
                  className="border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground bg-transparent h-11"
                  dir="rtl"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-xl transition-colors ml-1"
                    title="مسح البحث"
                    aria-label="مسح البحث"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Live Count Indicator */}
              {!isLoading && !isError && departments && (
                <p className="text-xs text-emerald-200/80 mt-3 font-medium">
                  {searchQuery ? (
                    <>
                      تم العثور على{' '}
                      <span className="font-bold text-white">{filteredDepartments.length}</span> قسم
                      مطابق
                    </>
                  ) : (
                    <>
                      إجمالي الأقسام النشطة:{' '}
                      <span className="font-bold text-white">{departments.length}</span> عيادة وقسم
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content Container */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4 animate-pulse"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <Skeleton className="w-16 h-6 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-2">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center max-w-md mx-auto space-y-4">
              <ShieldAlert className="w-10 h-10 text-destructive mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">تعذر تحميل الأقسام الطبية</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  حدث خطأ أثناء جلب قائمة العيادات. يرجى المحاولة مرة أخرى.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </Button>
            </div>
          )}

          {/* Empty Search Results */}
          {!isLoading && !isError && filteredDepartments.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center max-w-lg mx-auto space-y-4 my-8">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <SearchX className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">لم يتم العثور على نتائج</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {searchQuery
                    ? `لا توجد عيادات أو أقسام طبية تطابق "${searchQuery}". جرب كلمة بحث أخرى.`
                    : 'لا توجد أقسام طبية مسجلة حالياً في النظام.'}
                </p>
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="rounded-xl mt-2"
                >
                  مسح كلمة البحث
                </Button>
              )}
            </div>
          )}

          {/* Departments Grid */}
          {!isLoading && !isError && filteredDepartments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((department) => (
                <div
                  key={department.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card hover:bg-card/95 hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 overflow-hidden"
                >
                  {/* Decorative Corner Glow */}
                  <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

                  {/* Header & Department Info */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      {/* Icon */}
                      <Link href={`/departments/${department.slug}`} className="cursor-pointer">
                        <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 p-3 ring-1 ring-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <DepartmentIcon name={department.icon} className="w-7 h-7" />
                        </div>
                      </Link>

                      {/* Active Status Badge */}
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium border-0 px-2.5 py-0.5 rounded-full"
                      >
                        عيادة تخصصية
                      </Badge>
                    </div>

                    {/* Names - Link to department detail page */}
                    <Link
                      href={`/departments/${department.slug}`}
                      className="block group/title cursor-pointer"
                    >
                      <div className="space-y-1">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover/title:text-emerald-600 dark:group-hover/title:text-emerald-400 transition-colors">
                          {department.name}
                        </h2>
                        {department.nameEn && (
                          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase font-sans">
                            {department.nameEn}
                          </p>
                        )}
                      </div>
                    </Link>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed min-h-[3rem]">
                      {department.description ||
                        `يقدم قسم ${department.name} رعاية طبية شاملة بأحدث الأجهزة والتقنيات تحت إشراف نخبة من الأطباء الاستشاريين.`}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-5 mt-4 border-t border-border/60 grid grid-cols-2 gap-2.5">
                    {/* View Doctors Button */}
                    <Link
                      href={`/doctors?department=${department.id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-border bg-background hover:bg-muted text-foreground transition-colors group/btn"
                    >
                      <Users className="w-4 h-4 text-muted-foreground group-hover/btn:text-foreground" />
                      <span>الأطباء</span>
                      <ChevronLeft className="w-3.5 h-3.5 opacity-60 group-hover/btn:-translate-x-0.5 transition-transform" />
                    </Link>

                    {/* Book Appointment Button */}
                    <Button
                      type="button"
                      onClick={() => openBookingModal({ departmentId: department.id })}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all"
                    >
                      <CalendarCheck2 className="w-4 h-4" />
                      <span>احجز موعد</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
