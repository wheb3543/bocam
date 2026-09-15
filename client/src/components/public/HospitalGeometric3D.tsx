import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Building2,
  Stethoscope,
  Activity,
  Heart,
  Calendar,
  PhoneCall,
  Layers,
  Maximize2,
  ChevronDown,
  Sparkles,
  Eye,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface HospitalGeometric3DProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
}

// ── بيانات الطوابق المعمارية (Architectural 3D Floors) ──
interface FloorSpec {
  id: string;
  floorCode: string;
  name: string;
  subtitle: string;
  level: string;
  color: string;
  targetProgress: number; // النسبة المئوية للتمرير
  features: string[];
  specs: { label: string; value: string }[];
  tag: string;
}

const FLOORS: FloorSpec[] = [
  {
    id: 'overview',
    floorCode: '3D',
    name: 'المجمع الطبي الذكي المتكامل',
    subtitle: 'تصميم معماري هندسي ثلاثي الأبعاد شامل (Architectural Cutaway 3D)',
    level: 'Elev. +28.0m / Full Model',
    color: '#00c853',
    targetProgress: 0.05,
    tag: 'النموذج المعماري الشامل',
    features: [
      '4 طوابق طبية مجهزة بالكامل ومترابطة رقمياً',
      'بنية تحتية ذكية بنظام إدارة المستشفيات المتكامل (BOCAM)',
      'مهبط مروحيات إسعاف جوي وحديقة استشفائية خضراء',
    ],
    specs: [
      { label: 'المساحة الكلية', value: '18,500 م²' },
      { label: 'السعة السريرية', value: '250+ سرير' },
      { label: 'غرف العمليات', value: '8 أجنحة' },
    ],
  },
  {
    id: 'ground',
    floorCode: 'GF',
    name: 'الطابق الأرضي: الاستقبال والفرز والطوارئ',
    subtitle: 'المدخل الرئيسي وكاونتر الاستقبال الرقمي ووحدة طوارئ الحالات الحرجة 24/7',
    level: 'Elev. +0.00m (Ground Level)',
    color: '#00e5ff',
    targetProgress: 0.22,
    tag: 'طوارئ & استقبال ذكي',
    features: [
      'تسجيل ذاتي عبر الأكشاك التفاعلية ونظام الباركود الذكي',
      'فرز إلكتروني فوري للحالات الحرجة بأقل من دقيقتين',
      'مدخل طوارئ مخصص ومباشر لسيارات الإسعاف وغرف الإنعاش',
    ],
    specs: [
      { label: 'زمن الاستجابة', value: '< 2 دقيقة' },
      { label: 'سعة الاستقبال', value: '50 مراجع/س' },
      { label: 'الخدمة', value: '24/7 متواصلة' },
    ],
  },
  {
    id: 'floor1',
    floorCode: 'L1',
    name: 'الطابق الأول: التشخيص والرنين والمختبرات',
    subtitle: 'مركز الأشعة المقطعية والرنين المغناطيسي والمختبرات التحليلية الرقمية',
    level: 'Elev. +4.20m (Diagnostics)',
    color: '#2979ff',
    targetProgress: 0.44,
    tag: 'الأشعة والمختبر الرقمي',
    features: [
      'جهاز رنين مغناطيسي 3-Tesla صامت بدقة تصوير فائقة',
      'أشعة مقطعية متعددة المقاطع لتقييم الشرايين والأورام',
      'مختبر روبوتي مؤتمت بالكامل مرتبط مباشرة بملف المريض الإلكتروني',
    ],
    specs: [
      { label: 'دقة الرنين', value: '3.0 Tesla' },
      { label: 'سرعة التحاليل', value: 'نتائج فورية' },
      { label: 'التشخيص بالـ AI', value: 'مفعل 99.4%' },
    ],
  },
  {
    id: 'floor2',
    floorCode: 'L2',
    name: 'الطابق الثاني: أجنحة العمليات والروبوت الجراحي',
    subtitle: 'غرف عمليات هجينة بنظام الضغط الإيجابي وأذرع جراحية روبوتية متطورة',
    level: 'Elev. +8.40m (Surgical Suites)',
    color: '#00e676',
    targetProgress: 0.65,
    tag: 'جراحة ذكية & ICU',
    features: [
      'كبسولات جراحية معقمة بتقنية التدفق الهوائي الصفيحي (Laminar Flow)',
      'منظومة جراحة روبوتية ثلاثية الأبعاد للتدخل الجراحي الدقيق',
      'وحدات عناية مركزة (ICU) متقدمة مع مراقبة حيوية عن بُعد على مدار الساعة',
    ],
    specs: [
      { label: 'نسبة التعقيم', value: '99.999%' },
      { label: 'أذرع الجراحة', value: 'Robotic 3D' },
      { label: 'سعة العناية', value: '32 سرير ICU' },
    ],
  },
  {
    id: 'floor3',
    floorCode: 'L3',
    name: 'الطابق الثالث: أجنحة التنويم الفاخرة والاستشفاء',
    subtitle: 'أجنحة إقامة فندقية متكاملة وحديقة علاجية خضراء على السطح',
    level: 'Elev. +12.60m (VIP Inpatient & Roof)',
    color: '#ff9100',
    targetProgress: 0.85,
    tag: 'أجنحة فندقية & نقاهة',
    features: [
      'أجنحة ملكية وVIP بتجهيزات فندقية 5 نجوم وخصوصية تامة',
      'شاشات تحكم ذكية بجانب السرير لخدمات التمريض والتغذية والاتصال',
      'حديقة استشفائية خضراء على السطح لدعم التعافي النفسي والجسدي',
    ],
    specs: [
      { label: 'درجة الفخامة', value: '5 نجوم VIP' },
      { label: 'مراقبة السرير', value: 'Telemetry ذكي' },
      { label: 'الحديقة', value: 'بانورامية' },
    ],
  },
];

type ViewMode = 'model' | 'lobby' | 'exterior';

export default function HospitalGeometric3D({
  title = 'المستشفى السعودي الألماني',
  subtitle = 'رعاية طبية بمستويات عالمية وهندسة رقمية متطورة',
  description = 'تجوّل ثلاثي الأبعاد داخل أحدث الصروح الطبية في اليمن، واستكشف أقسامنا التخصصية وغرف العمليات والتشخيص المتقدمة بحركة تفاعلية فائقة السلاسة.',
  buttonText = 'احجز موعدك الآن',
}: HospitalGeometric3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('model');
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);

  // ── تفاعل الماوس للإمالة ثلاثية الأبعاد (3D Viewport Mouse Tilt) ──
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 10, y: -y * 8 }); // درجات الميل
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseTilt({ x: 0, y: 0 });
  }, []);

  // ── التمرير والفيزياء (Scroll & Spring Physics) ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  // ── تحويلات الكاميرا ثلاثية الأبعاد (3ds Max Camera Transformations) ──
  // التكبير وموضع المركز عند كل طابق
  const cameraScale = useTransform(
    smoothProgress,
    [0.0, 0.15, 0.35, 0.58, 0.78, 0.95, 1.0],
    [1.0, 1.85, 2.15, 2.3, 2.05, 1.15, 1.0]
  );

  const cameraOriginX = useTransform(
    smoothProgress,
    [0.0, 0.22, 0.44, 0.65, 0.85, 1.0],
    ['50%', '42%', '76%', '34%', '48%', '50%']
  );

  const cameraOriginY = useTransform(
    smoothProgress,
    [0.0, 0.22, 0.44, 0.65, 0.85, 1.0],
    ['50%', '76%', '52%', '36%', '18%', '50%']
  );

  const cameraRotateX = useTransform(
    smoothProgress,
    [0.0, 0.22, 0.44, 0.65, 0.85, 1.0],
    [8, 4, 6, 5, 7, 8]
  );

  const cameraRotateY = useTransform(
    smoothProgress,
    [0.0, 0.22, 0.44, 0.65, 0.85, 1.0],
    [-6, -2, -8, -3, -5, -6]
  );

  // شريط تقدم النموذج المعماري (Progress Bar)
  const progressPercent = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  // شفافية البطاقات النصية لكل طابق
  const cardOpacity0 = useTransform(smoothProgress, [0.0, 0.12, 0.18], [1, 1, 0]);
  const cardOpacity1 = useTransform(smoothProgress, [0.15, 0.22, 0.33, 0.38], [0, 1, 1, 0]);
  const cardOpacity2 = useTransform(smoothProgress, [0.35, 0.44, 0.55, 0.6], [0, 1, 1, 0]);
  const cardOpacity3 = useTransform(smoothProgress, [0.57, 0.65, 0.75, 0.8], [0, 1, 1, 0]);
  const cardOpacity4 = useTransform(smoothProgress, [0.77, 0.85, 0.94, 0.97], [0, 1, 1, 0]);
  const cardOpacityCTA = useTransform(smoothProgress, [0.93, 0.98, 1.0], [0, 1, 1]);

  // تحديث مؤشر الطابق النشط بناءً على التمرير
  useEffect(() => {
    return smoothProgress.on('change', (v) => {
      if (v < 0.15) {
        setActiveFloorIndex(0);
      } else if (v < 0.35) {
        setActiveFloorIndex(1);
      } else if (v < 0.56) {
        setActiveFloorIndex(2);
      } else if (v < 0.77) {
        setActiveFloorIndex(3);
      } else if (v < 0.93) {
        setActiveFloorIndex(4);
      } else {
        setActiveFloorIndex(0);
      }
    });
  }, [smoothProgress]);

  // الانتقال السلس لنقطة معينة في التمرير عند النقر على طابق
  const scrollToFloor = (targetP: number) => {
    if (!containerRef.current) {
      return;
    }
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.scrollHeight - window.innerHeight;
    const scrollTarget = containerTop + containerHeight * targetP;
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  };

  const scrollToBooking = () => {
    const bookingElem =
      document.getElementById('booking-section') || document.getElementById('appointment-section');
    if (bookingElem) {
      bookingElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/appointments';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#02070f] text-white"
      style={{ height: '420vh' }}
      dir="rtl"
    >
      {/* ── المحطة الثابتة (Sticky Viewport Stage) ── */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* خلفية شبكية معمارية (Architectural 3D Blueprint CAD Grid) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* تدرج كوني عميق */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 45%, #071e33 0%, #030b14 60%, #010408 100%)',
            }}
          />

          {/* شبكة CAD هندسية معمارية */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 229, 255, 0.4) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 229, 255, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />

          {/* دوائر تركيز الهدف ثلاثية الأبعاد (Viewport Radar Crosshairs) */}
          <svg className="absolute inset-0 h-full w-full opacity-15" viewBox="0 0 1000 700">
            <circle
              cx="500"
              cy="350"
              r="280"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="0.8"
              strokeDasharray="6 8"
            />
            <circle
              cx="500"
              cy="350"
              r="420"
              fill="none"
              stroke="#00c853"
              strokeWidth="0.5"
              strokeDasharray="12 12"
            />
            <line
              x1="500"
              y1="50"
              x2="500"
              y2="650"
              stroke="#00e5ff"
              strokeWidth="0.4"
              strokeDasharray="4 6"
            />
            <line
              x1="100"
              y1="350"
              x2="900"
              y2="350"
              stroke="#00e5ff"
              strokeWidth="0.4"
              strokeDasharray="4 6"
            />
          </svg>
        </div>

        {/* ── شريط التحكم العلوي: أوضاع العرض المعماري (3ds Max Viewport Controls) ── */}
        <div className="absolute top-20 right-6 z-30 hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-cyan-500/25 px-3 py-1.5 rounded-xl shadow-2xl">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono pl-3 border-l border-cyan-500/20">
            <Layers className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>3ds Max • V-Ray Viewport</span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('model')}
              className={`px-3 py-1 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                viewMode === 'model'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3 h-3" />
              المجسم المعماري (Cutaway 3D)
            </button>

            <button
              onClick={() => setViewMode('lobby')}
              className={`px-3 py-1 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                viewMode === 'lobby'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Eye className="w-3 h-3" />
              البهو الداخلي (Lobby 3D)
            </button>

            <button
              onClick={() => setViewMode('exterior')}
              className={`px-3 py-1 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                viewMode === 'exterior'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              الواجهة الخارجية
            </button>
          </div>
        </div>

        {/* ── مصعد التنقل بين الطوابق المعمارية (Elevator Navigation Bar) ── */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
          <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest text-center mb-1">
            FLOOR
          </div>
          {FLOORS.map((floor, idx) => {
            const isActive = activeFloorIndex === idx;
            return (
              <button
                key={floor.id}
                onClick={() => scrollToFloor(floor.targetProgress)}
                className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                    : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
                title={floor.name}
              >
                <span className="font-mono text-xs font-bold">{floor.floorCode}</span>
                {/* اسم الطابق يظهر بالتحويم */}
                <span className="absolute right-full ml-2 mr-2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                  {floor.name}
                </span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
              </button>
            );
          })}
        </div>

        {/* ── مسرح العرض المعماري ثلاثي الأبعاد (3D Viewport Render Stage) ── */}
        <div
          className="relative w-full max-w-6xl h-[70vh] flex items-center justify-center"
          style={{ perspective: '1400px' }}
        >
          {/* مجسم المستشفى ثلاثي الأبعاد (3ds Max Architectural Cutaway) */}
          <motion.div
            className="relative w-full h-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-cyan-500/20 bg-black/40 backdrop-blur-sm"
            style={{
              scale: cameraScale,
              transformOrigin: useTransform(
                [cameraOriginX, cameraOriginY],
                ([ox, oy]) => `${ox} ${oy}`
              ),
              rotateX: cameraRotateX,
              rotateY: cameraRotateY,
            }}
            animate={{
              x: mouseTilt.x,
              y: -mouseTilt.y,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            {/* الصورة المعمارية النشطة */}
            <div className="relative w-full h-full">
              {viewMode === 'model' && (
                <img
                  src="/hospital-3d-model.jpg"
                  alt="3D Architectural Cutaway Model"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_35px_rgba(0,229,255,0.15)] transition-all duration-700"
                />
              )}

              {viewMode === 'lobby' && (
                <img
                  src="/hospital-3d-lobby.jpg"
                  alt="3D Lobby Architectural Render"
                  className="w-full h-full object-cover transition-all duration-700"
                />
              )}

              {viewMode === 'exterior' && (
                <img
                  src="/hospital-3d-exterior.jpg"
                  alt="3D Exterior Architectural Render"
                  className="w-full h-full object-cover transition-all duration-700"
                />
              )}

              {/* طبقة شعاع المسح الضوئي المعماري (Architectural Laser Scanner) */}
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none opacity-60 shadow-[0_0_12px_#00e5ff]"
                animate={{
                  top: ['10%', '90%', '10%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: 'easeInOut',
                }}
              />

              {/* نقاط العلامات التفاعلية العائمة ثلاثية الأبعاد (3D Floating Hotspots) */}
              {viewMode === 'model' && activeFloorIndex === 0 && (
                <>
                  {/* نقطة: الطابق الأرضي (الاستقبال) */}
                  <div
                    onClick={() => scrollToFloor(0.22)}
                    className="absolute cursor-pointer transition-transform hover:scale-110"
                    style={{ left: '42%', top: '75%' }}
                  >
                    <div className="relative flex items-center gap-1.5 bg-cyan-900/80 border border-cyan-400/80 px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-200 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.6)]">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      الاستقبال والطوارئ (GF)
                    </div>
                  </div>

                  {/* نقطة: الطابق الأول (الأشعة) */}
                  <div
                    onClick={() => scrollToFloor(0.44)}
                    className="absolute cursor-pointer transition-transform hover:scale-110"
                    style={{ left: '74%', top: '53%' }}
                  >
                    <div className="relative flex items-center gap-1.5 bg-blue-900/80 border border-blue-400/80 px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-200 backdrop-blur-md shadow-[0_0_15px_rgba(41,121,255,0.6)]">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                      الأشعة والرنين (L1)
                    </div>
                  </div>

                  {/* نقطة: الطابق الثاني (العمليات) */}
                  <div
                    onClick={() => scrollToFloor(0.65)}
                    className="absolute cursor-pointer transition-transform hover:scale-110"
                    style={{ left: '32%', top: '38%' }}
                  >
                    <div className="relative flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-400/80 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-200 backdrop-blur-md shadow-[0_0_15px_rgba(0,230,118,0.6)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      أجنحة العمليات والروبوت (L2)
                    </div>
                  </div>

                  {/* نقطة: الطابق الثالث (أجنحة التنويم) */}
                  <div
                    onClick={() => scrollToFloor(0.85)}
                    className="absolute cursor-pointer transition-transform hover:scale-110"
                    style={{ left: '50%', top: '22%' }}
                  >
                    <div className="relative flex items-center gap-1.5 bg-amber-900/80 border border-amber-400/80 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-200 backdrop-blur-md shadow-[0_0_15px_rgba(255,145,0,0.6)]">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      أجنحة التنويم الفاخرة (L3)
                    </div>
                  </div>
                </>
              )}

              {/* زوايا إطار التصميم الهندسي (CAD Coordinate Corners) */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

              {/* إحداثيات المشهد المعماري (CAD HUD Specs) */}
              <div className="absolute bottom-3 right-4 flex items-center gap-4 text-[10px] font-mono text-cyan-400/70 pointer-events-none">
                <span>SCALE: 1:100</span>
                <span>RENDER: 3ds Max / V-Ray</span>
                <span>FOV: 45° ISO</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── البطاقات المعمارية التفاعلية المرتبطة بالتمرير (Floor HUD Cards) ── */}
        <div className="absolute bottom-10 right-8 max-w-md w-full z-20 pointer-events-none">
          {/* بطاقة 0: المشهد الافتتاحي المعماري الشامل */}
          <motion.div
            style={{ opacity: cardOpacity0 }}
            className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                {FLOORS[0].tag}
              </span>
              <span className="text-xs font-mono text-slate-400">{FLOORS[0].level}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{title}</h1>
              <p className="text-sm text-cyan-400 font-semibold mt-0.5">{subtitle}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60">
              {FLOORS[0].specs.map((s) => (
                <div key={s.label} className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-emerald-400 font-bold text-sm">{s.value}</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={scrollToBooking}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
              >
                <Calendar className="w-3.5 h-3.5" />
                {buttonText}
              </button>
              <button
                onClick={() => scrollToFloor(0.22)}
                className="py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 transition-all flex items-center gap-1"
              >
                <span>ابدأ الجولة</span>
                <ChevronDown className="w-3 h-3 animate-bounce" />
              </button>
            </div>
          </motion.div>

          {/* بطاقة 1: الطابق الأرضي (الاستقبال والفرز) */}
          <motion.div
            style={{ opacity: cardOpacity1 }}
            className="pointer-events-auto absolute inset-0 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <Building2 className="w-3.5 h-3.5" />
                {FLOORS[1].tag}
              </span>
              <span className="text-xs font-mono text-slate-400">{FLOORS[1].level}</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{FLOORS[1].name}</h2>
              <p className="text-xs text-slate-300 mt-1">{FLOORS[1].subtitle}</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {FLOORS[1].features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60">
              {FLOORS[1].specs.map((s) => (
                <div key={s.label} className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-cyan-400 font-bold text-sm">{s.value}</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('lobby')}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-600/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold hover:bg-cyan-600/50 transition-all flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                معاينة البهو الداخلي ثلاثي الأبعاد
              </button>
              <button
                onClick={() => scrollToFloor(0.44)}
                className="py-2 px-3 rounded-xl bg-white/5 border border-slate-700 text-slate-300 text-xs hover:bg-white/10"
              >
                الطابق التالي ←
              </button>
            </div>
          </motion.div>

          {/* بطاقة 2: الطابق الأول (الأشعة والمختبرات) */}
          <motion.div
            style={{ opacity: cardOpacity2 }}
            className="pointer-events-auto absolute inset-0 bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Activity className="w-3.5 h-3.5" />
                {FLOORS[2].tag}
              </span>
              <span className="text-xs font-mono text-slate-400">{FLOORS[2].level}</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{FLOORS[2].name}</h2>
              <p className="text-xs text-slate-300 mt-1">{FLOORS[2].subtitle}</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {FLOORS[2].features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60">
              {FLOORS[2].specs.map((s) => (
                <div key={s.label} className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-blue-400 font-bold text-sm">{s.value}</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={scrollToBooking}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                حجز فحص أشعة أو رنين
              </button>
              <button
                onClick={() => scrollToFloor(0.65)}
                className="py-2 px-3 rounded-xl bg-white/5 border border-slate-700 text-slate-300 text-xs hover:bg-white/10"
              >
                غرف العمليات ←
              </button>
            </div>
          </motion.div>

          {/* بطاقة 3: الطابق الثاني (العمليات والروبوت) */}
          <motion.div
            style={{ opacity: cardOpacity3 }}
            className="pointer-events-auto absolute inset-0 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Stethoscope className="w-3.5 h-3.5" />
                {FLOORS[3].tag}
              </span>
              <span className="text-xs font-mono text-slate-400">{FLOORS[3].level}</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{FLOORS[3].name}</h2>
              <p className="text-xs text-slate-300 mt-1">{FLOORS[3].subtitle}</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {FLOORS[3].features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60">
              {FLOORS[3].specs.map((s) => (
                <div key={s.label} className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-emerald-400 font-bold text-sm">{s.value}</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={scrollToBooking}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                استشارة جراحية متخصصة
              </button>
              <button
                onClick={() => scrollToFloor(0.85)}
                className="py-2 px-3 rounded-xl bg-white/5 border border-slate-700 text-slate-300 text-xs hover:bg-white/10"
              >
                أجنحة التنويم ←
              </button>
            </div>
          </motion.div>

          {/* بطاقة 4: الطابق الثالث (أجنحة التنويم) */}
          <motion.div
            style={{ opacity: cardOpacity4 }}
            className="pointer-events-auto absolute inset-0 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Heart className="w-3.5 h-3.5" />
                {FLOORS[4].tag}
              </span>
              <span className="text-xs font-mono text-slate-400">{FLOORS[4].level}</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{FLOORS[4].name}</h2>
              <p className="text-xs text-slate-300 mt-1">{FLOORS[4].subtitle}</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {FLOORS[4].features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60">
              {FLOORS[4].specs.map((s) => (
                <div key={s.label} className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <div className="text-amber-400 font-bold text-sm">{s.value}</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={scrollToBooking}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                حجز جناح إقامة
              </button>
              <button
                onClick={() => scrollToFloor(1.0)}
                className="py-2 px-3 rounded-xl bg-white/5 border border-slate-700 text-slate-300 text-xs hover:bg-white/10"
              >
                الختام ←
              </button>
            </div>
          </motion.div>

          {/* بطاقة ختامية: الدعوة للحجز والتواصل (Grand CTA) */}
          <motion.div
            style={{ opacity: cardOpacityCTA }}
            className="pointer-events-auto absolute inset-0 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              جاهزون لخدمتكم على مدار 24 ساعة
            </div>

            <h3 className="text-2xl font-black text-white">
              ابدأ تجربتك العلاجية في <span className="text-cyan-400">{title}</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              اختر الطبيب المناسب، وحدد موعد استشارتك أو فحصك الطبي بخطوات بسيطة وفورية عبر نظامنا
              الذكي.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={scrollToBooking}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {buttonText}
              </button>

              <a
                href="tel:01-999"
                className="w-full py-3 px-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 font-bold text-xs hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                طوارئ المستشفى 24/7
              </a>
            </div>
          </motion.div>
        </div>

        {/* ── شريط مؤشر التقدم السفلي (Scroll Progress Indicator) ── */}
        <div className="absolute bottom-4 left-8 right-8 z-30 flex items-center gap-4">
          <div className="text-[11px] font-mono text-cyan-400/80 shrink-0">TOUR PROGRESS:</div>
          <div className="relative flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              style={{ width: progressPercent }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1.5">
            <span>مرّر للأسفل للتجول</span>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
