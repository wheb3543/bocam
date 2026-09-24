import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

export interface BranchOption {
  id: string;
  slug: string;
  title: string;
  url: string;
}

export const SGH_BRANCHES: BranchOption[] = [
  { id: 'all', slug: 'all', title: 'جميع الفروع', url: 'https://saudigermanhealth.com/ar' },
  { id: '6', slug: 'aseer', title: 'عسير', url: 'https://aseer.saudigermanhealth.com/ar' },
  { id: '42', slug: 'jeddah', title: 'جدة', url: 'https://jeddah.saudigermanhealth.com/ar' },
  { id: '55', slug: 'hail', title: 'حائل', url: 'https://hail.saudigermanhealth.com/ar' },
  { id: '62', slug: 'madinah', title: 'المدينة', url: 'https://madinah.saudigermanhealth.com/ar' },
  { id: '63', slug: 'riyadh', title: 'الرياض', url: 'https://riyadh.saudigermanhealth.com/ar' },
  { id: '1243', slug: 'dammam', title: 'دمام', url: 'https://dammam.saudigermanhealth.com/ar' },
  { id: '3243', slug: 'haj', title: 'حي الجامعة', url: 'https://haj.saudigermanhealth.com/ar' },
  {
    id: '3779',
    slug: 'beverlyclinics',
    title: 'عيادات بيڤرلي',
    url: 'https://beverlyclinics.saudigermanhealth.com/ar',
  },
  { id: '3781', slug: 'makkah', title: 'مكة', url: 'https://makkah.saudigermanhealth.com/ar' },
  {
    id: '4042',
    slug: 'abha',
    title: 'مجمع عيادات أبها',
    url: 'https://abha.saudigermanhealth.com/ar',
  },
  { id: '2225', slug: 'sanaa', title: 'صنعاء', url: 'http://www.sghsanaa.com/' },
  { id: '2226', slug: 'dubai', title: 'دبي', url: 'https://www.sghdubai.ae/' },
  { id: '2227', slug: 'cairo', title: 'القاهرة', url: 'https://sghcairo.com/' },
  { id: '2228', slug: 'sharjah', title: 'الشارقة', url: 'https://www.sghsharjah.com/en/' },
  { id: '2229', slug: 'ajman', title: 'عجمان', url: 'https://www.sghajman.ae/' },
];

interface SghBranchSwitcherProps {
  currentBranchId?: string;
  onBranchChange?: (branch: BranchOption) => void;
}

export default function SghBranchSwitcher({
  currentBranchId = 'all',
  onBranchChange,
}: SghBranchSwitcherProps) {
  const [selectedBranch, setSelectedBranch] = useState<BranchOption>(() => {
    return (
      SGH_BRANCHES.find((b) => b.id === currentBranchId || b.slug === currentBranchId) ||
      SGH_BRANCHES[0]
    );
  });
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (branch: BranchOption) => {
    setSelectedBranch(branch);
    setIsOpen(false);
    if (onBranchChange) {
      onBranchChange(branch);
    }

    // Broadcast custom event for other components (like map, navbar)
    window.dispatchEvent(
      new CustomEvent('sgh:branch-change', {
        detail: branch,
      })
    );
  };

  return (
    <div
      ref={containerRef}
      className="domain-switcher fixed bottom-0 right-[5%] z-50 select-none font-sans"
      dir="rtl"
    >
      {/* Floating Popover Menu opening upwards */}
      {isOpen && (
        <div
          className="absolute bottom-full mb-1.5 right-0 w-[210px] max-h-[380px] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-slate-200/90 p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-150"
          role="listbox"
          aria-label="قائمة الفروع"
        >
          {SGH_BRANCHES.map((branch) => {
            const isSelected = branch.id === selectedBranch.id;

            return (
              <button
                key={branch.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(branch)}
                className={`w-full text-right px-3 py-1.5 text-[13px] font-medium rounded-xl transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#3b82f6] text-white font-bold shadow-sm'
                    : 'text-slate-800 hover:bg-slate-100/90 hover:text-black'
                }`}
              >
                <span>{branch.title}</span>
                {isSelected && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Fixed Green Trigger Bar */}
      <div className="bg-[#015233] text-white px-3.5 py-1 rounded-t-md flex items-center gap-2 shadow-lg border-t border-x border-[#01653f]/50">
        <label className="text-[12.5px] font-bold text-white/95 whitespace-nowrap">الفرع:</label>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="bg-[#3e735a] hover:bg-[#468266] text-white text-xs font-medium px-2.5 py-1 rounded border border-white/20 flex items-center gap-2 cursor-pointer transition-colors shadow-inner"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate max-w-[110px]">{selectedBranch.title}</span>
          <span className="text-[9px] text-white/80 select-none">▼</span>
        </button>
      </div>
    </div>
  );
}
