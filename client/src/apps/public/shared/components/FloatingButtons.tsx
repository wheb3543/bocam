import { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle, Clock } from 'lucide-react';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { COMPANY_PHONE } from '@/const';

interface FloatingButtonsProps {
  showBookingButton?: boolean;
  showWhatsAppButton?: boolean;
  showBackToTop?: boolean;
  backToTopThreshold?: number;
}

export default function FloatingButtons({
  showBookingButton = true,
  showWhatsAppButton = true,
  showBackToTop = true,
  backToTopThreshold = 400,
}: FloatingButtonsProps) {
  const [showBackToTopState, setShowBackToTopState] = useState(false);
  const { openBookingModal } = useBookingModal();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTopState(window.scrollY > backToTopThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [backToTopThreshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Booking Button */}
      {showBookingButton && (
        <button
          onClick={() => openBookingModal()}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-[#1ca8e5] hover:bg-[#168fca] text-white px-3 py-4 rounded-r-2xl shadow-[0_8px_24px_rgba(0,114,145,0.22)] flex flex-col items-center gap-2 cursor-pointer transition-all hover:pl-4 group select-none"
          aria-label="احجز الآن"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold [writing-mode:vertical-rl] tracking-wider py-1">
            احجز الآن
          </span>
        </button>
      )}

      {/* WhatsApp Button */}
      {showWhatsAppButton && COMPANY_PHONE && (
        <a
          href={`https://wa.me/${COMPANY_PHONE.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer active:scale-95"
          aria-label="تواصل معنا عبر واتساب"
        >
          <MessageCircle className="w-7 h-7 fill-white" />
        </a>
      )}

      {/* Back to Top Button */}
      {showBackToTop && showBackToTopState && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full bg-[#007242] hover:bg-[#2eb34b] text-white shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer active:scale-95 border border-white/20"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
