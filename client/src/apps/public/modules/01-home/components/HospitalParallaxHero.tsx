/**
 * HospitalParallaxHero
 *
 * قسم Hero للصفحة الرئيسية مع تأثير Parallax ثلاثي الأبعاد مدفوع بالتمرير.
 * يستخدم framer-motion (useScroll + useTransform) لإنشاء تجربة بصرية احترافية
 * تُظهر مبنى المستشفى بطبقات متحركة تعطي إحساساً بالعمق والثلاثية.
 *
 * طبقات التأثير:
 * 1. خلفية الصورة - تتحرك ببطء عند التمرير (parallax كلاسيكي)
 * 2. طبقة تدرج لوني شفافة - تنزلق بسرعة متوسطة
 * 3. طبقة نصوص + CTA - تتحرك للأعلى بشكل أسرع
 * 4. عناصر زجاجية عائمة (float cards) - تدور بزوايا مختلفة
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Calendar, Phone, Star, Shield, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { APP_LOGO, COMPANY_ARABIC_NAME, COMPANY_PHONE } from '@/const';

// صورة المستشفى السعودي الألماني (منسوخة إلى /public)
const HOSPITAL_IMAGE = '/hospital-hero.jpg';

interface HospitalParallaxHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
}

export default function HospitalParallaxHero({
  title,
  subtitle,
  description,
  buttonText = 'احجز موعدك الآن',
}: HospitalParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // تتبع التمرير داخل حاوية القسم
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // تحويلات سلسة (spring) لمنع الاهتزاز
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  // ── طبقة 1: الصورة تتحرك بـ 40% من سرعة التمرير (كلاسيك parallax)
  const imgY = useTransform(smoothProgress, [0, 1], ['0%', '40%']);
  const imgScale = useTransform(smoothProgress, [0, 1], [1, 1.08]);

  // ── طبقة 2: التدرج اللوني يتحرك عكس الصورة قليلاً
  const overlayY = useTransform(smoothProgress, [0, 1], ['0%', '15%']);
  const overlayOpacity = useTransform(smoothProgress, [0, 0.7], [0.65, 0.9]);

  // ── طبقة 3: المحتوى النصي يرتفع للأعلى بشكل أسرع
  const contentY = useTransform(smoothProgress, [0, 1], ['0%', '-20%']);
  const contentOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0]);

  // ── طبقة 4: البطاقات العائمة تتحرك بزوايا مختلفة
  const cardLeftY = useTransform(smoothProgress, [0, 1], [0, -60]);
  const cardLeftRotate = useTransform(smoothProgress, [0, 1], [-6, -2]);
  const cardRightY = useTransform(smoothProgress, [0, 1], [0, -40]);
  const cardRightRotate = useTransform(smoothProgress, [0, 1], [6, 2]);

  // تلاشي الشارة العلوية
  const badgeY = useTransform(smoothProgress, [0, 0.5], [0, -30]);
  const badgeOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0]);

  const displayTitle = title || `مرحباً في ${COMPANY_ARABIC_NAME}`;
  const displaySubtitle = subtitle || 'خدمات طبية متميزة بأعلى معايير الجودة';
  const displayDescription =
    description ||
    'نقدم رعاية صحية متكاملة بأيدي نخبة من الأطباء والاستشاريين المتخصصين. احجز موعدك الآن وانضم إلى آلاف المرضى الذين يثقون بنا.';

  return (
    <section
      ref={containerRef}
      className="relative h-[100vh] min-h-[600px] max-h-[900px] overflow-hidden"
      aria-label="قسم الترحيب الرئيسي"
    >
      {/* ══════════════════════════════════════════════════
          طبقة 1 — صورة المستشفى (parallax)
      ══════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: imgY, scale: imgScale }}
      >
        <img
          src={HOSPITAL_IMAGE}
          alt={`مبنى ${COMPANY_ARABIC_NAME} - منظر جوي`}
          className="h-[115%] w-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
      </motion.div>

      {/* ══════════════════════════════════════════════════
          طبقة 2 — تدرج لوني يُبرز الهوية المرئية
      ══════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: overlayY, opacity: overlayOpacity }}
      >
        {/* تدرج من أسفل (داكن) للأعلى (شفاف) + لون العلامة التجارية */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/50 to-transparent" />
        {/* تدرج جانبي أيمن بلون أزرق خفيف */}
        <div className="absolute inset-0 bg-gradient-to-l from-blue-900/30 via-transparent to-transparent" />
        {/* طبقة شبكة ناعمة تُعطي إحساساً احترافياً */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,.08) 60px), repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,.08) 60px)',
          }}
        />
      </motion.div>

      {/* ══════════════════════════════════════════════════
          طبقة 3 — المحتوى النصي الرئيسي
      ══════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 text-center will-change-transform"
        style={{ y: contentY, opacity: contentOpacity }}
        dir="rtl"
      >
        {/* شارة "رعاية صحية معتمدة" */}
        <motion.div style={{ y: badgeY, opacity: badgeOpacity }} className="mb-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            رعاية صحية بمعايير دولية معتمدة
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          </span>
        </motion.div>

        {/* شعار المستشفى */}
        <motion.img
          src={APP_LOGO}
          alt={COMPANY_ARABIC_NAME}
          className="mb-5 h-16 sm:h-20 w-auto object-contain drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />

        {/* العنوان الرئيسي */}
        <motion.h1
          className="mb-3 text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        >
          {displayTitle}
        </motion.h1>

        {/* العنوان الفرعي */}
        <motion.p
          className="mb-3 text-lg font-semibold text-green-200 sm:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          {displaySubtitle}
        </motion.p>

        {/* الوصف */}
        <motion.p
          className="mb-8 max-w-2xl rounded-xl bg-black/25 px-5 py-3 text-sm leading-relaxed text-white/90 backdrop-blur-sm sm:text-base"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
        >
          {displayDescription}
        </motion.p>

        {/* أزرار الدعوة للعمل */}
        <motion.div
          className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        >
          <Link href="/doctors">
            <Button
              size="lg"
              className="bg-white text-green-700 font-bold shadow-2xl hover:bg-green-50 hover:scale-105 transition-all h-13 px-8 text-base"
              aria-label={buttonText}
            >
              {buttonText}
              <ArrowLeft className="mr-2 h-5 w-5 rotate-180" aria-hidden="true" />
            </Button>
          </Link>
          <a href={`tel:${COMPANY_PHONE}`}>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/80 text-white backdrop-blur-sm hover:bg-white/15 hover:scale-105 transition-all h-13 px-8 text-base font-medium"
              aria-label={`اتصل بالمستشفى على ${COMPANY_PHONE}`}
            >
              <Phone className="ml-2 h-5 w-5" aria-hidden="true" />
              اتصل بنا: {COMPANY_PHONE}
            </Button>
          </a>
        </motion.div>

        {/* سهم التمرير للأسفل */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{ opacity: useTransform(smoothProgress, [0, 0.25], [1, 0]) }}
        >
          <div className="flex flex-col items-center gap-1 text-white/60">
            <span className="text-xs font-medium tracking-widest uppercase">مرر للأسفل</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          طبقة 4 — بطاقات زجاجية عائمة (float cards)
          تُعطي إحساس العمق الثلاثي الأبعاد
      ══════════════════════════════════════════════════ */}

      {/* بطاقة يسار: "تشفير وأمان" */}
      <motion.div
        className="absolute bottom-24 right-6 hidden sm:block will-change-transform"
        style={{ y: cardLeftY, rotate: cardLeftRotate }}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.8 }}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl shadow-2xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/20">
            <Shield className="h-5 w-5 text-green-300" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-white">خدمة متواصلة</p>
            <p className="text-[11px] text-white/60">٢٤ ساعة / ٧ أيام</p>
          </div>
        </div>
      </motion.div>

      {/* بطاقة يمين: "حجز سريع" */}
      <motion.div
        className="absolute bottom-24 left-6 hidden sm:block will-change-transform"
        style={{ y: cardRightY, rotate: cardRightRotate }}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 1.0 }}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl shadow-2xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
            <Calendar className="h-5 w-5 text-blue-300" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-white">حجز إلكتروني</p>
            <p className="text-[11px] text-white/60">مواعيد فورية متاحة</p>
          </div>
        </div>
      </motion.div>

      {/* بطاقة أعلى يمين: رقم المرضى */}
      <motion.div
        className="absolute top-24 left-6 hidden lg:block will-change-transform"
        style={{ y: useTransform(smoothProgress, [0, 1], [0, -80]) }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 1.2 }}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl shadow-2xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/20">
            <Heart className="h-5 w-5 text-pink-300" />
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-white">+١٠٠٠</p>
            <p className="text-[11px] text-white/60">مريض سعيد</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
