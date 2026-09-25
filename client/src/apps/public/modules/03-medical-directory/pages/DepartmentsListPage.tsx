/**
 * DepartmentsListPage - فهرس الأقسام والعيادات الطبية
 *
 * Public directory of medical departments and specialty clinics.
 * التصميم مطابق لهوية وهيكل صفحة الأقسام في الموقع المرجعي (SGH Hail /ar/departments):
 *  1. صورة عرض مدمجة (Compact Featured Image) بعنوان الصفحة "الأقسام".
 *  2. لوحة فلترة بخلفية #f8f8f8: اختيار القسم بحسب الحرف الأول + الترتيب الأبجدي + البحث.
 *  3. بطاقات أقسام بصور رسمية، وصف مختصر، وزر "عرض المزيد" بشكل كبسولة زرقاء (SGH Blue #1ca8e5).
 *  4. ترقيم صفحات (9 عناصر في الصفحة) مطابق للموقع المرجعي.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  Activity,
  Baby,
  Bone,
  Brain,
  Building2,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Dna,
  Eye,
  Heart,
  HeartPulse,
  Microscope,
  Phone,
  Pill,
  RefreshCw,
  Search,
  SearchX,
  ShieldAlert,
  Smile,
  Sparkle,
  Sparkles,
  Stethoscope,
  Syringe,
  Thermometer,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/api/trpc';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { COMPANY_ARABIC_NAME, COMPANY_PHONE } from '@/const';
import { PageProgress, FloatingButtons } from '@/apps/public/shared/components';
import { resolveDepartmentImage } from '../utils/departmentMedia';

/** عدد الأقسام في الصفحة الواحدة (مطابق للموقع المرجعي) */
const ITEMS_PER_PAGE = 9;

/** صورة العرض المدمجة أعلى الصفحة */
const DEPARTMENTS_BANNER_IMAGE = '/sgh/departments-banner.jpg';

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
  shieldalert: ShieldAlert,
  emergency: ShieldAlert,
  thermometer: Thermometer,
  syringe: Syringe,
  microscope: Microscope,
  laboratory: Microscope,
  lab: Microscope,
  dna: Dna,
  genetics: Dna,
  usercheck: UserCheck,
  users: Users,
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

  const normalized = name.toLowerCase().replace(/[-\s]/g, '');
  const IconComponent = ICON_MAP[normalized] || Building2;
  return <IconComponent className={className} />;
}

/** الأبجدية العربية المستخدمة في فلترة الأقسام بالحرف الأول (مطابقة للموقع المرجعي) */
const ARABIC_LETTERS = [
  'ا',
  'ب',
  'ت',
  'ث',
  'ج',
  'ح',
  'خ',
  'د',
  'ذ',
  'ر',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ط',
  'ظ',
  'ع',
  'غ',
  'ف',
  'ق',
  'ك',
  'ل',
  'م',
  'ن',
  'ه',
  'و',
  'ي',
];

/** توحيد الهمزات والألف المقصورة حتى تُطابق الفلترة الحرف الأول الصحيح */
const ARABIC_LETTER_ALIASES: Record<string, string> = {
  أ: 'ا',
  إ: 'ا',
  آ: 'ا',
  ٱ: 'ا',
  ة: 'ه',
  ى: 'ي',
  ئ: 'ي',
  ؤ: 'و',
};

function normalizeArabicText(value: string): string {
  let result = '';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isDiacritic =
      (code >= 0x0610 && code <= 0x061a) ||
      (code >= 0x064b && code <= 0x065f) ||
      code === 0x0640 ||
      code === 0x0670 ||
      (code >= 0x06d6 && code <= 0x06ed);
    if (!isDiacritic) {
      result += char;
    }
  }
  return result.trim();
}

/** إرجاع الحرف الأول من اسم القسم بعد التطبيع */
function getFirstLetter(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const normalized = normalizeArabicText(value);
  if (!normalized) {
    return null;
  }
  const first = normalized[0];
  return ARABIC_LETTER_ALIASES[first] ?? first;
}

type SortOption = 'default' | 'name-asc' | 'name-desc';

const SORT_OPTIONS: ReadonlyArray<{ value: SortOption; label: string }> = [
  { value: 'default', label: 'الترتيب الإفتراضي' },
  { value: 'name-asc', label: 'ترتيب تصاعدي بالإسم' },
  { value: 'name-desc', label: 'ترتيب تنازلي بالإسم' },
];

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const { openBookingModal } = useBookingModal();

  // Fetch active departments from tRPC
  const { data: departments, isLoading, isError, refetch } = trpc.departments.list.useQuery();

  const activeDepartments = useMemo(
    () => (Array.isArray(departments) ? departments : []),
    [departments]
  );

  /** الحروف المتوفرة فعلياً في أسماء الأقسام */
  const availableLetters = useMemo(
    () =>
      new Set(
        activeDepartments
          .map((dept) => getFirstLetter(dept.name))
          .filter((letter): letter is string => Boolean(letter))
      ),
    [activeDepartments]
  );

  /** فلترة الأقسام حسب الحرف الأول وكلمة البحث */
  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeDepartments.filter((dept) => {
      if (selectedLetter && getFirstLetter(dept.name) !== selectedLetter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return Boolean(
        dept.name?.toLowerCase().includes(query) ||
        dept.nameEn?.toLowerCase().includes(query) ||
        dept.description?.toLowerCase().includes(query)
      );
    });
  }, [activeDepartments, searchQuery, selectedLetter]);

  /** الترتيب الأبجدي (أو الترتيب الإفتراضي القادم من النظام) */
  const sortedDepartments = useMemo(() => {
    if (sortBy === 'default') {
      return filteredDepartments;
    }
    const direction = sortBy === 'name-desc' ? -1 : 1;
    return [...filteredDepartments].sort(
      (a, b) => direction * String(a.name ?? '').localeCompare(String(b.name ?? ''), 'ar')
    );
  }, [filteredDepartments, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedDepartments.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedDepartments = useMemo(
    () => sortedDepartments.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE),
    [sortedDepartments, safePage]
  );

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedLetter);

  // إعادة الترقيم للصفحة الأولى عند تغيير أي فلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLetter, sortBy]);

  const handleLetterSelect = (letter: string) => {
    if (!availableLetters.has(letter)) {
      return;
    }
    setSelectedLetter((current) => (current === letter ? null : letter));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLetter(null);
    setSortBy('default');
  };

  return (
    <PageLayout
      title={`الأقسام والعيادات الطبية - ${COMPANY_ARABIC_NAME}`}
      description={`استكشف كافة الأقسام والعيادات التخصصية في ${COMPANY_ARABIC_NAME}: التخصصات الطبية، الخدمات العلاجية، والأطباء الاستشاريون مع إمكانية الحجز الإلكتروني.`}
      keywords="أقسام طبية, عيادات تخصصية, أطباء, حجز موعد, استشارات طبية"
      useContainer={false}
    >
      <PageProgress />
      <FloatingButtons />

      {/* ===== 1) صورة العرض المدمجة مع عنوان الصفحة (Compact Featured Image) ===== */}
      <section
        className="sgh-hero-surface relative w-full overflow-hidden bg-[#0f6d95] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${DEPARTMENTS_BANNER_IMAGE})` }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-l from-black/55 via-black/35 to-black/10"
          aria-hidden="true"
        />

        <div className="w-full pt-[45%] sm:pt-[32%]" aria-hidden="true" />

        <div className="absolute inset-0 flex items-center">
          <div className="relative z-10 mx-auto w-full max-w-[1380px] px-[15px]">
            <div className="max-w-full text-right text-white sm:max-w-[80%]">
              {/* مسار التنقل */}
              <nav
                className="mb-2 flex items-center gap-2 text-[0.75rem] text-white/85 sm:text-[0.85rem]"
                aria-label="مسار التنقل"
              >
                <Link href="/" className="transition-colors hover:text-white">
                  الرئيسية
                </Link>
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="font-medium text-white">الأقسام</span>
              </nav>

              <h1 className="text-[28px] font-medium leading-tight [text-shadow:0_0_10px_rgba(0,0,0,0.6)] sm:text-[40px]">
                الأقسام
              </h1>

              <p className="mt-3 max-w-[560px] text-[0.85rem] leading-relaxed text-white/95 [text-shadow:0_0_10px_rgba(0,0,0,0.6)] sm:text-[1rem]">
                نخبة من الأقسام والعيادات التخصصية بتجهيزات عالمية وفريق طبي متكامل لرعايتك ورعاية
                عائلتك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2) قسم الفهرس: الفلترة بالحرف الأول + البحث + الترتيب ===== */}
      <section className="w-full bg-white pb-16 pt-6 sm:pt-10">
        <div className="mx-auto w-full max-w-[1380px] px-[15px]">
          <div className="relative overflow-hidden rounded-none bg-[#f8f8f8] p-4 sm:rounded-2xl sm:p-6 lg:p-8">
            {/* تدرجات دائرية مميزة بهوية المستشفى */}
            <div
              className="pointer-events-none absolute -top-[50%] left-[30%] z-0 h-[200%] w-[200%] rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, rgba(226, 226, 226, 0.6) 0%, rgba(226, 226, 226, 0.2) 40%, transparent 70%)',
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* فلترة الحروف */}
              <div>
                <div className="mb-2 text-[1rem] text-[#212529] sm:text-[1.1rem]">
                  إختر القسم بحسب الحرف الأول
                </div>
                <ul className="flex flex-wrap gap-[2px]">
                  {ARABIC_LETTERS.map((letter) => {
                    const isAvailable = availableLetters.has(letter);
                    const isActive = selectedLetter === letter;

                    if (!isAvailable) {
                      return (
                        <li key={letter}>
                          <span
                            className="block min-w-[25px] cursor-not-allowed border border-[#9fcde045] bg-[#1c93bd14] px-[0.4rem] py-[0.2rem] text-center text-[0.9rem] leading-5 text-[#1c93bd3b]"
                            aria-disabled="true"
                          >
                            {letter}
                          </span>
                        </li>
                      );
                    }

                    return (
                      <li key={letter}>
                        <button
                          type="button"
                          onClick={() => handleLetterSelect(letter)}
                          aria-pressed={isActive}
                          className={`block min-w-[25px] border px-[0.4rem] py-[0.2rem] text-center text-[0.9rem] leading-5 text-[#1d93bd] transition-all duration-300 ${
                            isActive
                              ? 'rounded-[2px] border-[#1c93bd78] bg-white font-semibold'
                              : 'border-[#9fcde045] bg-[#1c93bd14] hover:rounded-[2px] hover:border-[#1c93bd78] hover:bg-white'
                          }`}
                        >
                          {letter}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* البحث والترتيب */}
              <div className="flex flex-col gap-3 md:items-end">
                <div className="flex w-full items-center gap-2 rounded-[30px] border border-[#343a40] bg-white px-3 transition-shadow focus-within:shadow-[0_0_10px_rgba(0,0,0,0.2)] md:max-w-[380px]">
                  <Search className="h-4 w-4 flex-shrink-0 text-[#565656]" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن قسم أو تخصص طبي..."
                    dir="rtl"
                    className="h-11 border-0 bg-transparent text-[0.9rem] shadow-none focus-visible:ring-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-[#565656] transition-colors hover:text-[#1ca8e5]"
                      title="مسح البحث"
                      aria-label="مسح البحث"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="relative inline-flex w-full overflow-hidden rounded-[30px] border border-[#343a40] bg-white transition-shadow hover:shadow-[0_0_10px_rgba(0,0,0,0.2)] md:max-w-[260px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="ترتيب الأقسام"
                    className="w-full cursor-pointer appearance-none bg-white py-[0.6rem] pl-[3.2rem] pr-4 text-[0.9rem] text-[#343a40] outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span
                    className="pointer-events-none absolute left-[1.2rem] top-1/2 -translate-y-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-[#5a5a5a]"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* عدد النتائج + إلغاء التصفية */}
            <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e6e6] pt-4">
              <p className="text-[0.8rem] text-[#565656]">
                {isLoading ? (
                  'جارٍ تحميل الأقسام الطبية...'
                ) : (
                  <>
                    {hasActiveFilters ? 'النتائج المطابقة: ' : 'إجمالي الأقسام المتاحة: '}
                    <span className="font-semibold text-[#1ca8e5]">
                      {sortedDepartments.length}
                    </span>{' '}
                    قسم وعيادة تخصصية
                  </>
                )}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[0.8rem] font-medium text-[#1ca8e5] transition-colors hover:text-[#0f6d95]"
                >
                  <X className="h-3.5 w-3.5" />
                  إلغاء التصفية
                </button>
              )}
            </div>
          </div>

          {/* ===== 3) حالات التحميل والخطأ وعدم وجود نتائج ===== */}
          {isLoading && (
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {[...Array(6)].map((_, idx) => (
                <li
                  key={idx}
                  className="overflow-hidden rounded-[10px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.08)] sm:rounded-[24px]"
                >
                  <Skeleton className="h-[220px] w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-9 w-full rounded-[30px]" />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {isError && (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
              <h3 className="mt-3 text-lg font-bold text-foreground">تعذر تحميل الأقسام الطبية</h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                حدث خطأ أثناء جلب قائمة الأقسام. يرجى المحاولة مرة أخرى.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mx-auto mt-4 gap-2 rounded-[30px]"
              >
                <RefreshCw className="h-4 w-4" />
                <span>إعادة المحاولة</span>
              </Button>
            </div>
          )}

          {!isLoading && !isError && sortedDepartments.length === 0 && (
            <div className="mx-auto mt-8 max-w-lg space-y-4 rounded-3xl border border-dashed border-[#d7dee3] bg-[#f8f8f8] p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-[#9aa3ab] shadow-sm">
                <SearchX className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#212529]">لم يتم العثور على نتائج</h3>
                <p className="text-xs leading-relaxed text-[#565656] sm:text-sm">
                  {hasActiveFilters
                    ? `لا توجد أقسام أو عيادات مطابقة لبحثك${
                        selectedLetter ? ` في حرف «${selectedLetter}»` : ''
                      }. جرّب كلمة بحث أخرى أو أعد ضبط التصفية.`
                    : 'لا توجد أقسام طبية مسجلة حالياً في النظام.'}
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="mt-2 rounded-[30px]"
                >
                  إلغاء التصفية وعرض كل الأقسام
                </Button>
              )}
            </div>
          )}

          {/* ===== 4) شبكة بطاقات الأقسام (مطابقة لهيكل الموقع المرجعي) ===== */}
          {!isLoading && !isError && paginatedDepartments.length > 0 && (
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {paginatedDepartments.map((department) => {
                const image = resolveDepartmentImage(department);
                const isRoundTheClock = department.slug === 'emergency-department';
                const description =
                  department.description ||
                  `يقدم قسم ${department.name} رعاية طبية شاملة بأحدث الأجهزة والتقنيات تحت إشراف نخبة من الأطباء والاستشاريين.`;

                return (
                  <li key={department.id} className="h-full">
                    <article className="group flex h-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(28,168,229,0.25)] sm:rounded-[24px]">
                      {/* صورة القسم الرسمية */}
                      <Link
                        href={`/departments/${department.slug}`}
                        aria-label={department.name ?? undefined}
                        className="relative block h-[220px] w-full border-[5px] border-[#f8f8f8] bg-[#f8f8f8] bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${image})` }}
                      >
                        <span
                          className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          aria-hidden="true"
                        />

                        {/* أيقونة القسم الطبية */}
                        <span className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1ca8e5] shadow-sm backdrop-blur-sm">
                          <DepartmentIcon name={department.icon} className="h-5 w-5" />
                        </span>

                        {/* شارة رعاية على مدار الساعة */}
                        {isRoundTheClock && (
                          <span className="absolute left-3 top-3 inline-flex items-center rounded-[30px] border border-[#2eb34b] bg-white/95 px-2.5 py-1 text-[0.7rem] font-bold text-[#2eb34b]">
                            رعاية 24/7
                          </span>
                        )}
                      </Link>

                      {/* محتوى البطاقة */}
                      <div className="flex flex-1 flex-col px-4 pt-4">
                        <h2 className="text-[1.05rem] font-semibold leading-snug text-[#212529] sm:text-[1.15rem]">
                          <Link
                            href={`/departments/${department.slug}`}
                            className="transition-colors hover:text-[#1ca8e5]"
                          >
                            {department.name}
                          </Link>
                        </h2>

                        {department.nameEn && (
                          <p className="mt-1 font-sans text-[0.7rem] font-medium uppercase tracking-wide text-[#9aa3ab]">
                            {department.nameEn}
                          </p>
                        )}

                        <p className="mt-2 line-clamp-3 text-[0.875rem] leading-relaxed text-[#565656]">
                          {description}
                        </p>

                        <Link
                          href={`/doctors?department=${department.id}`}
                          className="mt-3 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-[#2eb34b] transition-colors hover:text-[#1ca8e5]"
                        >
                          <Users className="h-3.5 w-3.5" />
                          عرض أطباء القسم
                        </Link>
                      </div>

                      {/* أزرار الإجراءات */}
                      <div className="mt-4 flex items-center gap-2 border-t border-[#f1f4f6] px-4 py-4">
                        <Link
                          href={`/departments/${department.slug}`}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[30px] border border-[#1ca8e5] bg-transparent px-4 py-[0.4rem] text-[0.8rem] font-medium text-[#1ca8e5] transition-all duration-200 hover:bg-[#1ca8e5] hover:text-white"
                        >
                          <span>عرض المزيد</span>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => openBookingModal({ departmentId: department.id })}
                          className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-[30px] bg-[#1ca8e5] px-4 py-[0.4rem] text-[0.8rem] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1896cd] hover:shadow"
                        >
                          <CalendarCheck2 className="h-3.5 w-3.5" />
                          <span>احجز موعد</span>
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}

          {/* ===== 5) ترقيم الصفحات (نمط الموقع المرجعي) ===== */}
          {!isLoading && !isError && totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-1"
              aria-label="تصفح صفحات الأقسام"
            >
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                aria-label="الصفحة السابقة"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddf0fb] bg-[#ebf6fc] text-[#212529] transition-all duration-200 hover:border-[#1ca8e5] hover:bg-[#1ca8e5] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  aria-current={page === safePage ? 'page' : undefined}
                  className={`h-10 w-10 rounded-full border text-[0.9rem] transition-all duration-200 ${
                    page === safePage
                      ? 'border-[#1ca8e5] bg-[#1ca8e5] font-semibold text-white'
                      : 'border-[#ddf0fb] bg-[#ebf6fc] text-[#212529] hover:border-[#1ca8e5] hover:bg-[#1ca8e5] hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                aria-label="الصفحة التالية"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddf0fb] bg-[#ebf6fc] text-[#212529] transition-all duration-200 hover:border-[#1ca8e5] hover:bg-[#1ca8e5] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* ===== 6) دعوة للاستفسار وحجز المواعيد ===== */}
      <section className="w-full bg-white pb-16">
        <div className="mx-auto w-full max-w-[1380px] px-[15px]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0f6d95] via-[#1ca8e5] to-[#2eb34b] px-6 py-10 text-white sm:px-12 sm:py-12">
            <div
              className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-[620px]">
                <h2 className="text-[22px] font-bold sm:text-[28px]">لم تجد القسم المناسب؟</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
                  فريق خدمة المرضى في {COMPANY_ARABIC_NAME} جاهز لمساعدتك في اختيار القسم أو
                  الاستشاري المناسب، وحجز موعدك في الوقت الذي يناسبك.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() => openBookingModal()}
                  className="rounded-[30px] bg-white px-6 py-2.5 text-sm font-semibold text-[#1ca8e5] shadow-sm transition-all hover:bg-white/90"
                >
                  <CalendarCheck2 className="h-4 w-4" />
                  احجز موعدك الآن
                </Button>

                <a
                  href={`tel:${COMPANY_PHONE}`}
                  className="inline-flex items-center gap-2 rounded-[30px] border border-white/70 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#1ca8e5]"
                >
                  <Phone className="h-4 w-4" />
                  {COMPANY_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
