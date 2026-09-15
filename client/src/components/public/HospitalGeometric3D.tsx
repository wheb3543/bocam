/**
 * HospitalGeometric3D — الجولة الهندسية ثلاثية الأبعاد
 * تجربة سياحية هندسية بالكامل: CSS 3D + SVG + framer-motion
 * لا صور حقيقية — تصميم هندسي نقي
 *
 * المشاهد:
 * 0 → مبنى المستشفى (إسومتري)
 * 1 → الاقتراب من المدخل (ممر منظوري)
 * 2 → قاعة الاستقبال (SVG هندسي)
 * 3 → التخصصات (خلايا سداسية)
 * 4 → الأطباء والإحصائيات
 * 5 → CTA النهائي
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Heart,
  Phone,
  Star,
  Shield,
  Stethoscope,
  Users,
  Activity,
  Clock,
  ArrowLeft,
  ChevronDown,
  Microscope,
  Baby,
  Brain,
  Eye,
  Bone,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { APP_LOGO, COMPANY_ARABIC_NAME, COMPANY_PHONE } from '@/const';

const C = {
  primary: '#00A651',
  primaryDark: '#007a3d',
  primaryLight: '#4ade80',
  blue: '#0088CC',
  bgDark: '#0a0f1a',
  windowOff: '#1a3a5c',
  windowOn: '#a5d8ff',
  wallFront: '#1c3450',
  wallSide: '#142840',
  wallTop: '#1f3f63',
  textMuted: '#8ca3be',
};

const SPECIALTIES = [
  { label: 'قلب وأوعية', color: '#f87171', bg: '#7f1d1d22', Icon: Heart },
  { label: 'مخ وأعصاب', color: '#a78bfa', bg: '#4c1d9522', Icon: Brain },
  { label: 'أطفال ونساء', color: '#f472b6', bg: '#83184322', Icon: Baby },
  { label: 'عيون وأنف', color: '#38bdf8', bg: '#0c4a6e22', Icon: Eye },
  { label: 'عظام ومفاصل', color: '#fbbf24', bg: '#78350f22', Icon: Bone },
  { label: 'مختبر ومصل', color: '#34d399', bg: '#06422922', Icon: Microscope },
  { label: 'باطنية عامة', color: '#60a5fa', bg: '#1e3a8a22', Icon: Stethoscope },
  { label: 'طوارئ وحوادث', color: '#fb923c', bg: '#7c2d1222', Icon: Activity },
];

const STATS = [
  { value: '+22', label: 'طبيب واستشاري', color: C.primary },
  { value: '+15', label: 'تخصص طبي', color: C.blue },
  { value: '+1000', label: 'مريض سعيد', color: '#f87171' },
  { value: '24/7', label: 'خدمة متواصلة', color: '#fbbf24' },
];

function IsoBuilding() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="h-full w-full"
      style={{ filter: 'drop-shadow(0 20px 60px #000c)' }}
    >
      <defs>
        <linearGradient id="ib-fg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={C.wallFront} />
          <stop offset="100%" stopColor="#111f35" />
        </linearGradient>
        <linearGradient id="ib-sg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={C.wallSide} />
          <stop offset="100%" stopColor="#0c1b2e" />
        </linearGradient>
        <linearGradient id="ib-rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={C.wallTop} />
          <stop offset="100%" stopColor="#162840" />
        </linearGradient>
        <linearGradient id="ib-wg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5d8ff" />
          <stop offset="100%" stopColor="#5bb8f5" />
        </linearGradient>
        <filter id="ib-glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="800" height="600" fill="#060d1a" />
      {[...Array(35)].map((_, i) => (
        <circle
          key={i}
          cx={40 + ((i * 197) % 720)}
          cy={15 + ((i * 131) % 180)}
          r={0.8 + (i % 3) * 0.5}
          fill="white"
          opacity={0.3 + (i % 5) * 0.1}
        />
      ))}
      <ellipse cx="400" cy="540" rx="240" ry="16" fill="#000" opacity="0.5" />
      {/* سطح */}
      <polygon
        points="200,170 400,100 600,170 400,240"
        fill="url(#ib-rg)"
        stroke="#2a4a6b"
        strokeWidth="1"
      />
      {[280, 350, 420, 490].map((x, i) => (
        <g key={i}>
          <rect x={x} y={155 + (i % 2) * 8} width="20" height="12" fill="#0f2a45" rx="2" />
          <rect x={x + 4} y={151 + (i % 2) * 8} width="12" height="4" fill="#1a3a5a" rx="1" />
        </g>
      ))}
      <line
        x1="220"
        y1="178"
        x2="380"
        y2="110"
        stroke={C.primary}
        strokeWidth="2"
        opacity="0.6"
        filter="url(#ib-glow)"
      />
      <line
        x1="420"
        y1="110"
        x2="580"
        y2="178"
        stroke={C.blue}
        strokeWidth="2"
        opacity="0.6"
        filter="url(#ib-glow)"
      />
      {/* واجهة أمامية */}
      <polygon points="200,170 200,450 400,520 400,240" fill="url(#ib-fg)" />
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2].map((col) => {
          const x = 225 + col * 55 + row * 10,
            y = 200 + row * 52 + col * 4;
          const lit = row < 3;
          return (
            <g key={`f${row}${col}`}>
              {lit && (
                <rect
                  x={x - 2}
                  y={y - 2}
                  width="30"
                  height="22"
                  fill={C.windowOn}
                  opacity="0.1"
                  rx="1"
                  filter="url(#ib-glow)"
                />
              )}
              <rect
                x={x}
                y={y}
                width="28"
                height="20"
                fill={lit ? 'url(#ib-wg)' : C.windowOff}
                rx="2"
                opacity={lit ? 0.85 : 0.55}
              />
            </g>
          );
        })
      )}
      <rect x="215" y="360" width="130" height="32" fill={C.primary} rx="4" opacity="0.9" />
      <text
        x="280"
        y="381"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        fontFamily="Cairo,sans-serif"
      >
        مستشفانا
      </text>
      <rect x="305" y="425" width="50" height="75" fill={C.blue} rx="2" opacity="0.8" />
      <rect x="306" y="426" width="22" height="73" fill="#0070aa" rx="1" opacity="0.7" />
      <ellipse
        cx="330"
        cy="424"
        rx="22"
        ry="7"
        fill={C.blue}
        opacity="0.25"
        filter="url(#ib-glow)"
      />
      {/* واجهة جانبية */}
      <polygon points="400,240 600,170 600,450 400,520" fill="url(#ib-sg)" />
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3].map((col) => {
          const x = 418 + col * 44 - row * 8,
            y = 200 + row * 50 + col * 5;
          const lit = col < 2;
          return (
            <g key={`s${row}${col}`}>
              {lit && (
                <rect
                  x={x - 1}
                  y={y - 1}
                  width="24"
                  height="17"
                  fill={C.windowOn}
                  opacity="0.1"
                  rx="1"
                />
              )}
              <rect
                x={x}
                y={y}
                width="22"
                height="15"
                fill={lit ? '#7dd3fc' : '#112840'}
                rx="1"
                opacity={lit ? 0.8 : 0.45}
              />
            </g>
          );
        })
      )}
      {[1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={400 + i * 40}
          y1={240 + i * 6}
          x2={400 + i * 40}
          y2={520 - i * 18}
          stroke="#2a4a6b"
          strokeWidth="1"
          opacity="0.5"
        />
      ))}
      <line
        x1="200"
        y1="450"
        x2="400"
        y2="520"
        stroke={C.primary}
        strokeWidth="2"
        opacity="0.7"
        filter="url(#ib-glow)"
      />
      <line
        x1="400"
        y1="520"
        x2="600"
        y2="450"
        stroke={C.blue}
        strokeWidth="2"
        opacity="0.7"
        filter="url(#ib-glow)"
      />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${265 + i * 32},510)`}>
          <circle cy="-8" r="4" fill={C.textMuted} opacity="0.7" />
          <rect x="-3" y="-4" width="6" height="10" fill={C.textMuted} rx="1" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}

function Corridor({ depth }: { depth: number }) {
  const cx = 400,
    cy = 280;
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full">
      <defs>
        <linearGradient id="wl" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#162840" />
          <stop offset="100%" stopColor="#0a1628" />
        </linearGradient>
        <linearGradient id="wr" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#162840" />
          <stop offset="100%" stopColor="#0a1628" />
        </linearGradient>
        <filter id="cg">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="800" height="560" fill="#05101e" />
      {[...Array(8)].map((_, i) => {
        const t = i / 8,
          sp = 400 * (1 - t * 0.9),
          y = cy + (280 - cy) * t + depth * 20 * t;
        return (
          <polygon
            key={`f${i}`}
            points={`${cx - sp},${y + 35} ${cx + sp},${y + 35} ${cx + sp * 0.9},${y} ${cx - sp * 0.9},${y}`}
            fill={i % 2 === 0 ? '#0d1e30' : '#0a1828'}
            stroke="#162840"
            strokeWidth="0.5"
          />
        );
      })}
      {[...Array(8)].map((_, i) => {
        const t = i / 8,
          sp = 400 * (1 - t * 0.9),
          y = cy - (cy + 50) * t - depth * 20 * t;
        return (
          <polygon
            key={`c${i}`}
            points={`${cx - sp},${y} ${cx + sp},${y} ${cx + sp * 0.9},${y - 50 * (1 - t)} ${cx - sp * 0.9},${y - 50 * (1 - t)}`}
            fill={i % 2 === 0 ? '#080f1c' : '#060c18'}
            stroke="#0f1e30"
            strokeWidth="0.5"
          />
        );
      })}
      <polygon points={`0,0 ${cx},${cy} 0,560`} fill="url(#wl)" />
      <polygon points={`800,0 ${cx},${cy} 800,560`} fill="url(#wr)" />
      {[...Array(6)].map((_, i) => {
        const t = (i + 0.5) / 6,
          lY = cy - cy * t - depth * 18 * t,
          lW = 60 * (1 - t * 0.8);
        return (
          <g key={`l${i}`}>
            <ellipse
              cx={cx}
              cy={lY}
              rx={lW}
              ry={4 * (1 - t * 0.7)}
              fill={C.primary}
              opacity="0.9"
              filter="url(#cg)"
            />
            <line
              x1={cx}
              y1={lY}
              x2={cx - 40 * (1 - t)}
              y2={lY + 120 * (1 - t)}
              stroke={C.primary}
              strokeWidth={1 - t * 0.8}
              opacity="0.12"
            />
            <line
              x1={cx}
              y1={lY}
              x2={cx + 40 * (1 - t)}
              y2={lY + 120 * (1 - t)}
              stroke={C.primary}
              strokeWidth={1 - t * 0.8}
              opacity="0.12"
            />
          </g>
        );
      })}
      {[-2, -1, 0, 1, 2].map((o, i) => (
        <g key={i}>
          <line
            x1={cx + o * 80}
            y1={0}
            x2={cx}
            y2={cy}
            stroke="#1a3050"
            strokeWidth="0.5"
            opacity="0.8"
          />
          <line
            x1={cx + o * 80}
            y1={560}
            x2={cx}
            y2={cy}
            stroke="#1a3050"
            strokeWidth="0.5"
            opacity="0.8"
          />
        </g>
      ))}
      <ellipse
        cx={cx}
        cy={cy}
        rx={30 + depth * 8}
        ry={50 + depth * 12}
        fill={C.primary}
        opacity={0.3 + depth * 0.4}
        filter="url(#cg)"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={14 + depth * 4}
        ry={24 + depth * 6}
        fill="white"
        opacity={0.08 + depth * 0.18}
      />
      <line
        x1={cx - 3}
        y1={cy}
        x2={cx - 3}
        y2={560}
        stroke={C.primary}
        strokeWidth="3.5"
        opacity="0.55"
      />
      <line
        x1={cx + 3}
        y1={cy}
        x2={cx + 3}
        y2={560}
        stroke={C.blue}
        strokeWidth="3.5"
        opacity="0.55"
      />
    </svg>
  );
}

interface Props {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
}

export default function HospitalGeometric3D({
  title,
  subtitle,
  description,
  buttonText = 'احجز موعدك الآن',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 55, damping: 20 });

  const s0 = useTransform(p, [0.0, 0.17], [0, 1]);
  const s1 = useTransform(p, [0.17, 0.33], [0, 1]);
  const s2 = useTransform(p, [0.33, 0.5], [0, 1]);
  const s3 = useTransform(p, [0.5, 0.67], [0, 1]);
  const s4 = useTransform(p, [0.67, 0.84], [0, 1]);
  const s5 = useTransform(p, [0.84, 1.0], [0, 1]);

  // ── شفافية كل مشهد (hooks على مستوى المكوّن — قواعد React Hooks)
  const op0 = useTransform(s0, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
  const op1 = useTransform(s1, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
  const op2 = useTransform(s2, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
  const op3 = useTransform(s3, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
  const op4 = useTransform(s4, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
  const op5 = useTransform(s5, [0.05, 0.3, 1, 1], [0, 1, 1, 1]);

  // ── نقاط المؤشرات
  const dS0 = useTransform(s0, [0, 0.5, 1], [0.7, 1.5, 0.7]);
  const dS1 = useTransform(s1, [0, 0.5, 1], [0.7, 1.5, 0.7]);
  const dS2 = useTransform(s2, [0, 0.5, 1], [0.7, 1.5, 0.7]);
  const dS3 = useTransform(s3, [0, 0.5, 1], [0.7, 1.5, 0.7]);
  const dS4 = useTransform(s4, [0, 0.5, 1], [0.7, 1.5, 0.7]);
  const dS5 = useTransform(s5, [0, 0.5, 1], [0.7, 1.5, 0.7]);
  const dScales = [dS0, dS1, dS2, dS3, dS4, dS5];

  const dB0 = useTransform(
    s0,
    [0, 0.5, 1],
    ['rgba(255,255,255,0.12)', 'rgba(0,166,81,0.9)', 'rgba(255,255,255,0.12)']
  );
  const dB1 = useTransform(
    s1,
    [0, 0.5, 1],
    ['rgba(255,255,255,0.12)', 'rgba(0,166,81,0.9)', 'rgba(255,255,255,0.12)']
  );
  const dB2 = useTransform(
    s2,
    [0, 0.5, 1],
    ['rgba(255,255,255,0.12)', 'rgba(0,166,81,0.9)', 'rgba(255,255,255,0.12)']
  );
  const dB3 = useTransform(
    s3,
    [0, 0.5, 1],
    ['rgba(255,255,255,0.12)', 'rgba(0,166,81,0.9)', 'rgba(255,255,255,0.12)']
  );
  const dB4 = useTransform(
    s4,
    [0, 0.5, 1],
    ['rgba(255,255,255,0.12)', 'rgba(0,166,81,0.9)', 'rgba(255,255,255,0.12)']
  );
  const dB5 = useTransform(
    s5,
    [0, 0.5, 1],
    ['rgba(255,255,255,0.12)', 'rgba(0,166,81,0.9)', 'rgba(255,255,255,0.12)']
  );
  const dBgs = [dB0, dB1, dB2, dB3, dB4, dB5];

  // ── نصوص المشهد 0
  const s0TextOp = useTransform(s0, [0.3, 0.65], [0, 1]);
  const s0ArrOp = useTransform(s0, [0, 0.3, 0.8], [0, 1, 0]);
  // مشهد 1
  const s1TextOp = useTransform(s1, [0.3, 0.7], [0, 1]);
  // مشهد 2
  const s2TitleOp = useTransform(s2, [0.2, 0.6], [0, 1]);
  const s2GridOp = useTransform(s2, [0.5, 0.85], [0, 1]);
  // مشهد 3
  const s3TitleOp = useTransform(s3, [0.1, 0.4], [0, 1]);
  const s3ecg = useTransform(s3, [0, 1], [1000, 0]);
  // مشهد 4
  const s4TitleOp = useTransform(s4, [0.1, 0.4], [0, 1]);
  const s4StatsOp = useTransform(s4, [0.35, 0.65], [0, 1]);

  const bY = useTransform(s0, [0, 1], ['60px', '0px']);
  const bSc = useTransform(s0, [0, 1], [0.85, 1]);
  const cD = useTransform(s1, [0, 1], [0, 1]);
  const cZ = useTransform(s2, [0, 1], [1, 1.3]);
  const pW = useTransform(p, [0, 1], ['0%', '100%']);

  const T = title || COMPANY_ARABIC_NAME;
  const Sub = subtitle || 'خدمات طبية متميزة بمعايير عالمية';
  const Desc = description || 'رعاية صحية متكاملة بأيدي نخبة من الأطباء والاستشاريين.';

  return (
    <div ref={ref} className="relative" style={{ height: '600vh', background: C.bgDark }}>
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        dir="rtl"
        id="main-content"
        style={{ background: C.bgDark }}
      >
        {/* شريط التقدم */}
        <div className="absolute top-0 inset-x-0 z-50 h-0.5 bg-white/5">
          <motion.div
            className="h-full"
            style={{ width: pW, background: `linear-gradient(90deg,${C.primary},${C.blue})` }}
          />
        </div>

        {/* مؤشر المشاهد */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
          {dScales.map((ds, i) => (
            <motion.div
              key={i}
              className="h-2.5 w-2.5 rounded-full border border-white/20"
              style={{ scale: ds, backgroundColor: dBgs[i] }}
            />
          ))}
        </div>

        {/* ─── مشهد 0: مبنى إسومتري ─── */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: op0 }}
        >
          <motion.div
            className="flex w-full max-w-2xl items-center justify-center"
            style={{ y: bY, scale: bSc, height: '60vh' }}
          >
            <IsoBuilding />
          </motion.div>
          <motion.div
            className="absolute bottom-20 flex flex-col items-center gap-3 text-center px-4"
            style={{ opacity: s0TextOp }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-bold text-green-400">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> رعاية صحية بمعايير دولية{' '}
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </span>
            <h1
              className="text-5xl font-black text-white sm:text-7xl"
              style={{ textShadow: '0 0 30px rgba(0,166,81,0.5)' }}
            >
              {T}
            </h1>
            <p className="text-xl font-bold" style={{ color: C.primary }}>
              {Sub}
            </p>
            <p className="max-w-xl rounded-xl bg-white/5 px-5 py-2.5 text-sm text-white/65 backdrop-blur-sm">
              {Desc}
            </p>
          </motion.div>
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
            style={{ opacity: s0ArrOp }}
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              مرر للجولة
            </span>
            <ChevronDown className="h-5 w-5 text-green-500" />
          </motion.div>
        </motion.div>

        {/* ─── مشهد 1: الاقتراب من المدخل ─── */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: op1 }}
        >
          <motion.div className="h-full w-full" style={{ scale: cZ }}>
            <Corridor depth={cD.get()} />
          </motion.div>
          <motion.div
            className="absolute bottom-20 flex flex-col items-center gap-3 px-4 text-center"
            style={{ opacity: s1TextOp }}
          >
            <div className="flex gap-3">
              {[
                { Icon: Shield, text: 'معايير دولية', color: C.primary },
                { Icon: Clock, text: '24/7 متاح', color: C.blue },
                { Icon: Award, text: 'جودة معتمدة', color: '#fbbf24' },
              ].map(({ Icon, text, color }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold backdrop-blur-sm"
                  style={{ color }}
                >
                  <Icon className="h-3.5 w-3.5" /> {text}
                </div>
              ))}
            </div>
            <h2 className="text-3xl font-black text-white sm:text-5xl">
              بوابتك <span style={{ color: C.primary }}>للصحة</span> والعافية
            </h2>
            <p className="max-w-md text-sm text-white/55">ادخل معنا في جولة داخل أقسام مستشفانا</p>
          </motion.div>
        </motion.div>

        {/* ─── مشهد 2: الاستقبال ─── */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: op2 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at center,#0f2a45 0%,${C.bgDark} 70%)` }}
          />
          <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full">
            {[...Array(10)].map((_, i) =>
              [...Array(8)].map((_, j) => (
                <rect
                  key={`t${i}${j}`}
                  x={i * 80}
                  y={280 + j * 40}
                  width="78"
                  height="38"
                  fill={i % 2 === j % 2 ? '#0d1e30' : '#0a1828'}
                  stroke="#0f2236"
                  strokeWidth="0.5"
                />
              ))
            )}
            <g transform="translate(200,200)">
              <rect
                width="400"
                height="58"
                rx="8"
                fill="#162840"
                stroke={C.primary}
                strokeWidth="1.5"
              />
              <rect y="4" width="400" height="7" rx="3" fill={C.primary} opacity="0.3" />
              {[60, 180, 300].map((x) => (
                <g key={x}>
                  <rect
                    x={x}
                    y={-58}
                    width="70"
                    height="48"
                    rx="4"
                    fill="#0a1628"
                    stroke="#1a3050"
                    strokeWidth="1"
                  />
                  <rect x={x + 4} y={-54} width="62" height="40" rx="2" fill="#0f2236" />
                  <rect
                    x={x + 8}
                    y={-50}
                    width="20"
                    height="3"
                    rx="1"
                    fill={C.primary}
                    opacity="0.7"
                  />
                  <rect
                    x={x + 8}
                    y={-44}
                    width="40"
                    height="2"
                    rx="1"
                    fill={C.textMuted}
                    opacity="0.4"
                  />
                  <line x1={x + 35} y1={-10} x2={x + 35} y2={0} stroke="#1a3050" strokeWidth="2" />
                </g>
              ))}
              {[80, 200, 320].map((x) => (
                <g key={x} transform={`translate(${x},-78)`}>
                  <circle cy="-14" r="10" fill="#1e3a5c" stroke={C.blue} strokeWidth="1" />
                  <rect
                    x="-8"
                    y="-4"
                    width="16"
                    height="20"
                    rx="3"
                    fill="#1e3a5c"
                    stroke={C.blue}
                    strokeWidth="0.5"
                  />
                </g>
              ))}
            </g>
            <line
              x1="400"
              y1="258"
              x2="400"
              y2="500"
              stroke={C.primary}
              strokeWidth="2"
              opacity="0.45"
            />
            {[50, 720].map((x) => (
              <g key={x} transform={`translate(${x},218)`}>
                <rect
                  x="-10"
                  y="30"
                  width="20"
                  height="24"
                  rx="3"
                  fill="#0a1628"
                  stroke="#1a3050"
                  strokeWidth="1"
                />
                {[0, -18, 18, -9, 9].map((dx, i) => (
                  <ellipse
                    key={i}
                    cx={dx}
                    cy={5 - i * 5}
                    rx="11"
                    ry="7"
                    fill={C.primaryDark || '#007a3d'}
                    opacity="0.8"
                  />
                ))}
              </g>
            ))}
          </svg>
          <motion.div
            className="absolute top-14 flex flex-col items-center gap-3 text-center px-4"
            style={{ opacity: s2TitleOp }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-bold text-green-400">
              <Users className="h-3.5 w-3.5" /> قسم الاستقبال والتوجيه
            </div>
            <h2 className="text-4xl font-black text-white sm:text-6xl">
              استقبالكم{' '}
              <span className="block" style={{ color: C.primary }}>
                أولويتنا
              </span>
            </h2>
          </motion.div>
          <motion.div
            className="absolute bottom-14 grid grid-cols-3 gap-3 px-8"
            style={{ opacity: s2GridOp }}
          >
            {[
              'حجز إلكتروني',
              'انتظار ذكي',
              'خدمة ترجمة',
              'توجيه تخصصي',
              'مواصلات داخلية',
              'خدمة VIP',
            ].map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-white/80 backdrop-blur-sm"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: C.primary }}
                />{' '}
                {s}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ─── مشهد 3: التخصصات سداسية ─── */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: op3 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at center,#071530 0%,${C.bgDark} 80%)` }}
          />
          <div className="relative h-[62vh] w-full max-w-3xl">
            <svg viewBox="0 0 700 480" className="h-full w-full">
              {[...Array(8)].map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 65}
                  x2="700"
                  y2={i * 65}
                  stroke="#1a3050"
                  strokeWidth="0.5"
                  opacity="0.35"
                />
              ))}
              <motion.polyline
                points="0,240 50,240 80,140 110,340 140,40 170,440 200,190 230,290 260,240 700,240"
                fill="none"
                stroke={C.primary}
                strokeWidth="2.5"
                strokeDasharray="1000"
                style={{ strokeDashoffset: s3ecg }}
                opacity="0.5"
              />
              {SPECIALTIES.map(({ label, color, bg }, i) => {
                const col = i % 4,
                  row = Math.floor(i / 4);
                const hx = 80 + col * 160 + (row % 2) * 80,
                  hy = 110 + row * 145,
                  r = 58;
                const pts = Array.from({ length: 6 }, (_, k) => {
                  const a = (Math.PI / 3) * k - Math.PI / 6;
                  return `${hx + r * Math.cos(a)},${hy + r * Math.sin(a)}`;
                }).join(' ');
                return (
                  <g key={label}>
                    <polygon
                      points={pts}
                      fill={bg}
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.95"
                    />
                    <circle cx={hx} cy={hy - 6} r={17} fill={color} opacity="0.18" />
                    <circle cx={hx} cy={hy - 6} r={11} fill={color} opacity="0.22" />
                    <text
                      x={hx}
                      y={hy + 26}
                      textAnchor="middle"
                      fill={color}
                      fontSize="10"
                      fontFamily="Cairo,sans-serif"
                      fontWeight="bold"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <motion.div
            className="absolute top-10 flex flex-col items-center gap-2 text-center"
            style={{ opacity: s3TitleOp }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400">
              <Stethoscope className="h-3.5 w-3.5" /> الأقسام والعيادات الطبية
            </div>
            <h2 className="text-4xl font-black text-white sm:text-5xl">
              أكثر من <span style={{ color: C.blue }}>15 تخصصاً</span> طبياً
            </h2>
          </motion.div>
        </motion.div>

        {/* ─── مشهد 4: الأطباء والإحصائيات ─── */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-4"
          style={{ opacity: op4 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at top,#0a2040 0%,${C.bgDark} 70%)` }}
          />
          <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 800 600">
            {[150, 250, 350, 450].map((r, i) => (
              <circle
                key={i}
                cx="400"
                cy="300"
                r={r}
                fill="none"
                stroke={i % 2 === 0 ? C.primary : C.blue}
                strokeWidth="0.8"
                strokeDasharray="10 5"
              />
            ))}
          </svg>
          <motion.div
            className="relative flex flex-col items-center gap-2 text-center"
            style={{ opacity: s4TitleOp }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
              <Users className="h-3.5 w-3.5" /> الكوادر الطبية المتخصصة
            </div>
            <h2 className="text-4xl font-black text-white sm:text-5xl">
              فريقنا <span style={{ color: C.primary }}>الطبي</span> فخرنا
            </h2>
          </motion.div>
          <motion.div
            className="relative grid grid-cols-2 gap-4 sm:grid-cols-4"
            style={{ opacity: s4StatsOp }}
          >
            {STATS.map(({ value, label, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-2xl border bg-white/5 p-6 backdrop-blur-md"
                style={{ borderColor: color + '30' }}
              >
                <svg viewBox="0 0 60 60" className="h-14 w-14">
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke={color + '20'}
                    strokeWidth="4"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeDasharray={`${Math.PI * 50 * 0.75} ${Math.PI * 50}`}
                    strokeLinecap="round"
                    transform="rotate(-90 30 30)"
                    opacity="0.85"
                  />
                </svg>
                <span className="text-3xl font-black sm:text-4xl" style={{ color }}>
                  {value}
                </span>
                <span className="text-center text-xs font-semibold text-white/60">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ─── مشهد 5: CTA ─── */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center"
          style={{ opacity: op5 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 180deg at 50% 50%,${C.bgDark} 0deg,#071e38 90deg,${C.bgDark} 180deg,#051522 270deg,${C.bgDark} 360deg)`,
            }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 600">
            <defs>
              <radialGradient id="ctaB" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={C.primary} stopOpacity="0.22" />
                <stop offset="60%" stopColor={C.blue} stopOpacity="0.05" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <ellipse cx="400" cy="300" rx="340" ry="270" fill="url(#ctaB)" />
            {[...Array(12)].map((_, i) => {
              const a = (Math.PI * 2 * i) / 12;
              return (
                <line
                  key={i}
                  x1="400"
                  y1="300"
                  x2={400 + Math.cos(a) * 400}
                  y2={300 + Math.sin(a) * 400}
                  stroke={i % 2 === 0 ? C.primary : C.blue}
                  strokeWidth="0.5"
                  opacity="0.14"
                />
              );
            })}
          </svg>
          <motion.img
            src={APP_LOGO}
            alt={COMPANY_ARABIC_NAME}
            className="relative z-10 h-20 w-auto drop-shadow-2xl sm:h-28"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{ filter: `drop-shadow(0 0 20px ${C.primary}66)` }}
          />
          <h2 className="relative z-10 text-4xl font-black text-white sm:text-6xl">
            ابدأ رحلتك{' '}
            <span className="block" style={{ color: C.primary }}>
              نحو صحة أفضل
            </span>
          </h2>
          <p className="relative z-10 max-w-lg rounded-2xl bg-white/5 px-6 py-3 text-sm text-white/70 backdrop-blur-sm">
            احجز موعدك الآن مع نخبة من الأطباء والاستشاريين. خدمة إلكترونية متاحة على مدار الساعة.
          </p>
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link href="/doctors">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-bold hover:scale-105 transition-transform"
                style={{
                  background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`,
                  boxShadow: `0 8px 24px ${C.primary}44`,
                }}
              >
                {buttonText} <ArrowLeft className="mr-2 h-5 w-5 rotate-180" />
              </Button>
            </Link>
            <a href={`tel:${COMPANY_PHONE}`}>
              <Button
                size="lg"
                variant="outline"
                className="h-14 border-2 px-8 text-base font-medium text-white hover:scale-105 transition-transform backdrop-blur-sm"
                style={{ borderColor: C.blue + '80', background: C.blue + '12' }}
              >
                <Phone className="ml-2 h-5 w-5" style={{ color: C.blue }} /> اتصل بنا:{' '}
                {COMPANY_PHONE}
              </Button>
            </a>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-xs text-white/30">
            <Shield className="h-3.5 w-3.5" />
            <span>المستشفى السعودي الألماني — صنعاء | معايير الرعاية الصحية الدولية</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
