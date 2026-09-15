/**
 * HospitalCinematicTour
 *
 * تجربة السياحة السينمائية الداخلية للمستشفى
 * ════════════════════════════════════════════
 *
 * كيف تعمل:
 * - الحاوية الكلية ارتفاعها 600vh (6 مشاهد × 100vh تمرير لكل مشهد)
 * - داخلها حاوية "sticky" ثابتة بارتفاع 100vh تبقى على الشاشة طوال فترة التمرير
 * - نتابع تقدم التمرير (0→1) ونُحوّله إلى مشهد نشط (0-5)
 * - كل مشهد يتلاشى داخلاً وخارجاً بحركة 3D
 *
 * المشاهد الستة:
 * 0 → الجو العلوي   : طائرة مسيّرة تنزل نحو المبنى
 * 1 → الواجهة        : الاقتراب من المدخل الرئيسي
 * 2 → الاستقبال      : الدخول وقاعة الانتظار
 * 3 → العيادات       : جولة في التخصصات الطبية
 * 4 → فريق الأطباء  : الكوادر والإحصائيات
 * 5 → الحجز          : دعوة نهائية لحجز موعد
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Heart,
  Phone,
  Calendar,
  Star,
  Shield,
  Stethoscope,
  Users,
  Activity,
  Clock,
  Award,
  ArrowLeft,
  ChevronDown,
  Microscope,
  Baby,
  Brain,
  Eye,
  Bone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { APP_LOGO, COMPANY_ARABIC_NAME, COMPANY_PHONE } from '@/const';

// ── صور المشاهد
const IMG_AERIAL = '/hospital-hero.jpg'; // منظر جوي
const IMG_ENTRANCE = '/hospital-entrance.jpg'; // الواجهة الأمامية

// ── التخصصات الطبية
const SPECIALTIES = [
  { Icon: Heart, label: 'قلب وأوعية', color: '#ef4444' },
  { Icon: Brain, label: 'مخ وأعصاب', color: '#8b5cf6' },
  { Icon: Baby, label: 'أطفال ونساء', color: '#ec4899' },
  { Icon: Eye, label: 'عيون وأنف', color: '#06b6d4' },
  { Icon: Bone, label: 'عظام ومفاصل', color: '#f59e0b' },
  { Icon: Microscope, label: 'مختبر ومصل', color: '#10b981' },
  { Icon: Stethoscope, label: 'باطنية عامة', color: '#3b82f6' },
  { Icon: Activity, label: 'طوارئ وحوادث', color: '#f97316' },
];

// ── إحصائيات المستشفى
const STATS = [
  { value: '22+', label: 'طبيب واستشاري', Icon: Users, color: '#10b981' },
  { value: '15+', label: 'تخصص طبي', Icon: Activity, color: '#3b82f6' },
  { value: '1000+', label: 'مريض سعيد', Icon: Heart, color: '#ef4444' },
  { value: '24/7', label: 'خدمة متواصلة', Icon: Clock, color: '#f59e0b' },
];

// ── مساعد: قيمة مقطوعة بين [0, 1] (غير مستخدمة مباشرة لكن تُحفظ للتوسعة المستقبلية)
const _clamp = (v: number) => Math.max(0, Math.min(1, v));

// نُصدّر المتغير لمنع تحذير unused
export { _clamp };

// ══════════════════════════════════════════════════
// المكون الرئيسي
// ══════════════════════════════════════════════════
interface HospitalCinematicTourProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
}

export default function HospitalCinematicTour({
  title,
  subtitle,
  description,
  buttonText = 'احجز موعدك الآن',
}: HospitalCinematicTourProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const TOTAL_SCENES = 6;

  // ── تتبع تقدم التمرير بداخل الحاوية كاملاً
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // ── تمهيد الحركة
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 18 });

  // ── إحداثيات المشهد النشط (0 → TOTAL_SCENES)
  const sceneProgress = useTransform(smoothProgress, [0, 1], [0, TOTAL_SCENES]);

  // ── تأثيرات عامة للخلفية (محجوزة للتوسعة المستقبلية)
  const _bgScale = useTransform(smoothProgress, [0, 1], [1, 1.15]);
  const _bgBrightness = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0.5, 1, 1, 0.6]);

  // ── تأثيرات المشهد 0 (جوي): zoom-in
  const aerialScale = useTransform(smoothProgress, [0, 0.17], [1.3, 1.0]);
  const aerialY = useTransform(smoothProgress, [0, 0.17], ['5%', '0%']);

  // ── تأثيرات المشهد 1 (واجهة): push-in camera
  const entranceScale = useTransform(smoothProgress, [0.17, 0.33], [1, 1.2]);
  const entranceY = useTransform(smoothProgress, [0.17, 0.33], ['0%', '-5%']);

  // ── شريط التقدم
  const progressWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  // ── تحويلات مؤشرات النقاط — محسوبة مسبقاً خارج map (قواعد React Hooks)
  const dotScale0 = useTransform(sceneProgress, [-0.3, 0, 0.3], [0.7, 1.4, 0.7]);
  const dotScale1 = useTransform(sceneProgress, [0.7, 1, 1.3], [0.7, 1.4, 0.7]);
  const dotScale2 = useTransform(sceneProgress, [1.7, 2, 2.3], [0.7, 1.4, 0.7]);
  const dotScale3 = useTransform(sceneProgress, [2.7, 3, 3.3], [0.7, 1.4, 0.7]);
  const dotScale4 = useTransform(sceneProgress, [3.7, 4, 4.3], [0.7, 1.4, 0.7]);
  const dotScale5 = useTransform(sceneProgress, [4.7, 5, 5.3], [0.7, 1.4, 0.7]);

  const dotBg0 = useTransform(
    sceneProgress,
    [-0.3, 0, 0.3],
    ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)']
  );
  const dotBg1 = useTransform(
    sceneProgress,
    [0.7, 1, 1.3],
    ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)']
  );
  const dotBg2 = useTransform(
    sceneProgress,
    [1.7, 2, 2.3],
    ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)']
  );
  const dotBg3 = useTransform(
    sceneProgress,
    [2.7, 3, 3.3],
    ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)']
  );
  const dotBg4 = useTransform(
    sceneProgress,
    [3.7, 4, 4.3],
    ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)']
  );
  const dotBg5 = useTransform(
    sceneProgress,
    [4.7, 5, 5.3],
    ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)']
  );

  const dotScales = [dotScale0, dotScale1, dotScale2, dotScale3, dotScale4, dotScale5];
  const dotBgs = [dotBg0, dotBg1, dotBg2, dotBg3, dotBg4, dotBg5];

  const displayTitle = title || `مرحباً في ${COMPANY_ARABIC_NAME}`;
  const displaySubtitle = subtitle || 'خدمات طبية متميزة بأعلى معايير الجودة';
  const displayDescription =
    description || 'رعاية صحية متكاملة بأيدي نخبة من الأطباء والاستشاريين المتخصصين.';

  return (
    /*
     * الحاوية الكلية: 600vh = 6 مشاهد × 100vh
     * يجب أن تكون overflow-visible حتى تعمل sticky
     */
    <div ref={containerRef} className="relative" style={{ height: `${TOTAL_SCENES * 100}vh` }}>
      {/* ══════════════════════════════════════════
          الحاوية الثابتة على الشاشة (sticky)
      ══════════════════════════════════════════ */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        dir="rtl"
        id="main-content"
        aria-label="جولة سينمائية داخل المستشفى"
      >
        {/* شريط التقدم العلوي */}
        <div className="absolute top-0 inset-x-0 z-50 h-1 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-l from-green-400 to-blue-500"
            style={{ width: progressWidth }}
          />
        </div>

        {/* ── مؤشر المشهد الحالي (نقاط) */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5">
          {dotScales.map((dotScale, i) => (
            <motion.div
              key={i}
              className="h-2.5 w-2.5 rounded-full border border-white/40 bg-white/20 backdrop-blur-sm"
              style={{
                scale: dotScale,
                backgroundColor: dotBgs[i],
              }}
            />
          ))}
        </div>

        {/* ════════════════════════════════════════════════
            طبقة 1 — صورة المشهد الجوي (0→1)
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: useTransform(smoothProgress, [0, 0.12, 0.28, 0.35], [1, 1, 1, 0]),
            scale: aerialScale,
            y: aerialY,
          }}
        >
          <img
            src={IMG_AERIAL}
            alt="منظر جوي للمستشفى"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          {/* تدرج المشهد الجوي */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        </motion.div>

        {/* ════════════════════════════════════════════════
            طبقة 2 — صورة الواجهة الأمامية (1→2)
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: useTransform(smoothProgress, [0.28, 0.35, 0.48, 0.55], [0, 1, 1, 0]),
            scale: entranceScale,
            y: entranceY,
          }}
        >
          <img
            src={IMG_ENTRANCE}
            alt="واجهة المستشفى الأمامية"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        </motion.div>

        {/* ════════════════════════════════════════════════
            طبقة 3 — مشهد الاستقبال: خلفية لونية + CSS 3D (2→3)
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: useTransform(smoothProgress, [0.48, 0.55, 0.65, 0.7], [0, 1, 1, 0]),
          }}
        >
          {/* خلفية الاستقبال: تدرج أخضر-أبيض مع شبكة معمارية */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-teal-900" />
          {/* خطوط معمارية */}
          <div className="absolute inset-0 overflow-hidden" style={{ perspective: '800px' }}>
            {/* سقف منظور */}
            <div
              className="absolute inset-x-0 top-0 h-[60%] origin-top"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
                transform: 'rotateX(20deg)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            />
            {/* أرضية مرآة */}
            <div
              className="absolute inset-x-0 bottom-0 h-[45%] origin-bottom"
              style={{
                background: 'linear-gradient(0deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                transform: 'rotateX(-15deg)',
              }}
            />
            {/* أعمدة جانبية يمين */}
            {[0, 1, 2].map((i) => (
              <div
                key={`col-r-${i}`}
                className="absolute top-0 bottom-0 w-px"
                style={{
                  right: `${15 + i * 12}%`,
                  background:
                    'linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)',
                  transform: `perspective(600px) rotateY(${-5 - i * 3}deg)`,
                }}
              />
            ))}
            {/* أعمدة جانبية يسار */}
            {[0, 1, 2].map((i) => (
              <div
                key={`col-l-${i}`}
                className="absolute top-0 bottom-0 w-px"
                style={{
                  left: `${15 + i * 12}%`,
                  background:
                    'linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)',
                  transform: `perspective(600px) rotateY(${5 + i * 3}deg)`,
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </motion.div>

        {/* ════════════════════════════════════════════════
            طبقة 4 — مشهد التخصصات: شبكة العيادات (3→4)
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]),
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950" />
          {/* نبضة حية في الخلفية */}
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
          >
            <polyline
              points="0,400 100,400 150,200 200,600 250,100 300,700 350,300 400,500 450,400 1200,400"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>

        {/* ════════════════════════════════════════════════
            طبقة 5 — مشهد الأطباء والإحصائيات (4→5)
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: useTransform(smoothProgress, [0.8, 0.85, 0.93, 0.97], [0, 1, 1, 0]),
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-green-950" />
          {/* نجوم خلفية */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.8 + 0.2,
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </motion.div>

        {/* ════════════════════════════════════════════════
            طبقة 6 — المشهد النهائي CTA (5→)
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: useTransform(smoothProgress, [0.93, 0.97, 1], [0, 1, 1]),
          }}
        >
          {/* خلفية مزدوجة: صورة جوية مع تدرج قوي */}
          <img
            src={IMG_ENTRANCE}
            alt="ختام الجولة"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-900/70 to-black/40" />
        </motion.div>

        {/* ════════════════════════════════════════════════
            محتوى المشهد 0 — الجو العلوي
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{
            opacity: useTransform(smoothProgress, [0, 0.05, 0.22, 0.3], [0, 1, 1, 0]),
            y: useTransform(smoothProgress, [0, 0.3], ['0%', '-8%']),
          }}
        >
          {/* شارة */}
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              رعاية صحية بمعايير دولية معتمدة
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            </span>
          </motion.div>

          <motion.img
            src={APP_LOGO}
            alt={COMPANY_ARABIC_NAME}
            className="mb-6 h-20 w-auto drop-shadow-2xl sm:h-28"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
          />

          <motion.h1
            className="mb-3 text-4xl font-black leading-tight text-white drop-shadow-2xl sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            {displayTitle}
          </motion.h1>

          <motion.p
            className="mb-3 text-xl font-semibold text-green-200 sm:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
          >
            {displaySubtitle}
          </motion.p>

          <motion.p
            className="mb-8 max-w-2xl rounded-2xl bg-black/30 px-6 py-3 text-sm text-white/90 backdrop-blur-sm sm:text-base"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
          >
            {displayDescription}
          </motion.p>

          {/* سهم التمرير */}
          <motion.div
            className="flex flex-col items-center gap-2 text-white/60"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <span className="text-xs font-semibold tracking-[0.2em] uppercase">
              مرر للأسفل للجولة
            </span>
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            محتوى المشهد 1 — الواجهة الأمامية
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-24 text-center"
          style={{
            opacity: useTransform(smoothProgress, [0.3, 0.38, 0.5, 0.56], [0, 1, 1, 0]),
            y: useTransform(smoothProgress, [0.3, 0.56], ['10%', '-5%']),
          }}
        >
          <motion.div className="mb-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
              طوارئ متاحة الآن
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              24/7 خدمة متواصلة
            </span>
          </motion.div>

          <h2 className="mb-4 text-4xl font-black text-white drop-shadow-2xl sm:text-6xl">
            الواجهة الأمامية
            <span className="block bg-gradient-to-l from-green-300 to-teal-300 bg-clip-text text-transparent">
              بوابتك للصحة والعافية
            </span>
          </h2>
          <p className="max-w-xl text-base text-white/80 sm:text-lg">
            يستقبلك المستشفى السعودي الألماني بصنعاء بفريق طبي محترف وبيئة طبية مجهزة بأحدث التقنيات
            الطبية.
          </p>

          {/* بطاقات زجاجية صغيرة */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              { Icon: Shield, text: 'معايير دولية' },
              { Icon: Award, text: 'جودة معتمدة' },
              { Icon: Heart, text: 'رعاية إنسانية' },
            ].map(({ Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md"
              >
                <Icon className="h-4 w-4 text-green-300" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            محتوى المشهد 2 — الاستقبال
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{
            opacity: useTransform(smoothProgress, [0.56, 0.62, 0.68, 0.72], [0, 1, 1, 0]),
            scale: useTransform(smoothProgress, [0.56, 0.72], [0.95, 1.0]),
          }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/15 px-4 py-1.5 text-sm font-semibold text-green-300 backdrop-blur-sm">
            <Users className="h-4 w-4" />
            قسم الاستقبال والتوجيه
          </div>

          <h2 className="mb-4 text-4xl font-black text-white drop-shadow-2xl sm:text-5xl md:text-6xl">
            استقبالكم
            <span className="block bg-gradient-to-l from-green-300 to-emerald-300 bg-clip-text text-transparent">
              أولويتنا الأولى
            </span>
          </h2>

          <p className="mb-8 max-w-2xl text-base text-white/80 sm:text-lg">
            فريق استقبال متخصص يرحّب بكم ويوجهكم إلى الخدمة المناسبة. نظام حجز إلكتروني حديث يختصر
            وقتكم ويحترم خصوصيتكم.
          </p>

          {/* نقاط الخدمة */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              'حجز إلكتروني',
              'استقبال فوري',
              'نظام انتظار ذكي',
              'ترجمة طبية',
              'مواصلات داخلية',
              'خدمة VIP',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm text-white backdrop-blur-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            محتوى المشهد 3 — التخصصات الطبية
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{
            opacity: useTransform(smoothProgress, [0.7, 0.74, 0.82, 0.86], [0, 1, 1, 0]),
          }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-4 py-1.5 text-sm font-semibold text-blue-300 backdrop-blur-sm">
            <Stethoscope className="h-4 w-4" />
            العيادات والأقسام الطبية
          </div>

          <h2 className="mb-6 text-3xl font-black text-white drop-shadow-2xl sm:text-5xl">
            أكثر من
            <span className="bg-gradient-to-l from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              {' '}
              15 تخصصاً{' '}
            </span>
            طبياً متكاملاً
          </h2>

          {/* شبكة التخصصات */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:gap-3">
            {SPECIALTIES.map(({ Icon, label, color }, i) => (
              <motion.div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/8 p-3 backdrop-blur-md sm:p-4"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12"
                  style={{ backgroundColor: color + '25' }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
                </div>
                <span className="text-[11px] font-semibold text-white/80 sm:text-xs">{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            محتوى المشهد 4 — الأطباء والإحصائيات
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{
            opacity: useTransform(smoothProgress, [0.84, 0.88, 0.95, 0.98], [0, 1, 1, 0]),
          }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-sm font-semibold text-emerald-300 backdrop-blur-sm">
            <Users className="h-4 w-4" />
            كوادر طبية متخصصة
          </div>

          <h2 className="mb-8 text-3xl font-black text-white drop-shadow-2xl sm:text-5xl">
            فريقنا الطبي
            <span className="block bg-gradient-to-l from-emerald-300 to-green-300 bg-clip-text text-transparent">
              فخرنا وضمانكم
            </span>
          </h2>

          {/* إحصائيات */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map(({ value, label, Icon, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-md"
              >
                <div
                  className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: color + '20' }}
                >
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <span className="text-3xl font-black sm:text-4xl" style={{ color }}>
                  {value}
                </span>
                <span className="text-xs font-semibold text-white/70 sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            محتوى المشهد 5 — CTA نهائي
        ════════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{
            opacity: useTransform(smoothProgress, [0.97, 1], [0, 1]),
            scale: useTransform(smoothProgress, [0.97, 1], [0.96, 1]),
          }}
        >
          <motion.img
            src={APP_LOGO}
            alt={COMPANY_ARABIC_NAME}
            className="mb-6 h-20 w-auto drop-shadow-2xl sm:h-24"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />

          <h2 className="mb-4 text-4xl font-black text-white drop-shadow-2xl sm:text-6xl">
            ابدأ رحلتك
            <span className="block bg-gradient-to-l from-green-300 to-teal-300 bg-clip-text text-transparent">
              نحو صحة أفضل
            </span>
          </h2>

          <p className="mb-8 max-w-xl rounded-2xl bg-black/30 px-6 py-3 text-sm text-white/90 backdrop-blur-sm sm:text-base">
            احجز موعدك الآن مع نخبة من الأطباء والاستشاريين المتخصصين. خدمة عبر الإنترنت متاحة على
            مدار الساعة.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link href="/doctors">
              <Button
                size="lg"
                className="bg-white text-green-700 font-bold shadow-2xl shadow-green-900/50 hover:bg-green-50 hover:scale-105 transition-all h-14 px-8 text-base"
              >
                {buttonText}
                <ArrowLeft className="mr-2 h-5 w-5 rotate-180" />
              </Button>
            </Link>
            <a href={`tel:${COMPANY_PHONE}`}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/80 text-white backdrop-blur-sm hover:bg-white/15 hover:scale-105 transition-all h-14 px-8 text-base font-medium"
              >
                <Phone className="ml-2 h-5 w-5" />
                اتصل بنا: {COMPANY_PHONE}
              </Button>
            </a>
          </div>

          {/* ختم رسمي */}
          <div className="mt-10 flex items-center gap-2 text-xs text-white/40">
            <Shield className="h-3.5 w-3.5" />
            <span>مستشفى السعودي الألماني — صنعاء | معايير الرعاية الصحية الدولية</span>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            رقم المشهد الحالي (للتطوير — يمكن إزالته)
            ════════════════════════════════════════════ */}
        {/* تسمية رقم المشهد للـ a11y */}
        <motion.div
          className="absolute bottom-6 right-4 hidden text-xs font-mono text-white/20 sm:block"
          style={{ opacity: useTransform(smoothProgress, [0.95, 1], [1, 0]) }}
        >
          <Calendar className="inline h-3 w-3" /> مرر للأعلى للعودة للقائمة
        </motion.div>
      </div>
    </div>
  );
}
