import { useState } from 'react';
import { Search } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function SghDoctorsSection() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/doctors?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      setLocation('/doctors');
    }
  };

  return (
    <section id="doctors" className="relative overflow-hidden select-none" dir="rtl">
      {/* SGH Hail Hero Doctor Banner - Exactly like reference site */}
      <div
        className="relative w-full h-[360px] sm:h-[420px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            'url(https://hail.saudigermanhealth.com/sites/default/files/2021-02/0E5A1199.JPG)',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/35 via-slate-900/15 to-transparent" />

        <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-10">
          <div className="max-w-xl text-right mr-auto sm:mr-8 space-y-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] tracking-tight">
              أطباء متخصصون
            </h2>

            {/* Blue Action Box Exactly matching ref_top.png / ref_full.png */}
            <form
              onSubmit={handleSearch}
              className="bg-[#0b5394] p-6 rounded-2xl shadow-2xl max-w-md space-y-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن طبيب أو تخصص..."
                  className="w-full bg-white text-slate-800 placeholder:text-slate-400 rounded-full py-2.5 pr-4 pl-10 text-xs sm:text-sm outline-none shadow-sm font-medium"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b5394]"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-1">
                <Link href="/doctors">
                  <span className="inline-block w-full py-2.5 px-6 rounded-full border-2 border-white text-white font-bold text-sm hover:bg-white hover:text-[#0b5394] transition-all cursor-pointer">
                    تصفح جميع الأطباء
                  </span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
