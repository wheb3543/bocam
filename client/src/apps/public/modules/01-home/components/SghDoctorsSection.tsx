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
    <section
      id="doctors"
      className="section section-doctors w-full py-0 mb-6 select-none"
      dir="rtl"
    >
      {/* SGH Hail: .inner-section with 0E5A1199.JPG (height: 318px, background-position: right top) */}
      <div className="container max-w-[1380px] mx-auto px-[15px]">
        <div
          className="inner-section relative w-full h-[320px] sm:h-[340px] md:h-[318px] overflow-hidden bg-cover flex items-center px-4 sm:px-8 md:px-12"
          style={{
            backgroundImage: "url('/sgh/doctor-banner.jpg')",
            backgroundPosition: 'right top',
          }}
        >
          {/* Light gradient on left for small screens to ensure readability */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/30 md:hidden pointer-events-none" />

          {/* Right Column: Title + Search Box (matching .col-md-4 offset-md-7 on SGH Hail) */}
          <div className="relative z-10 w-full max-w-[398px] mr-auto md:mr-0 flex flex-col justify-center">
            <header className="section-header with-cta align-top mb-3">
              <h2 className="text-[32px] sm:text-[36px] md:text-[40px] font-bold text-white leading-tight tracking-tight drop-shadow-[0_0_14px_rgba(0,0,0,0.42)] m-0">
                أطباء متخصصون
              </h2>
            </header>

            {/* SGH Hail .search-box-cont: background rgb(13, 78, 156), width 398px */}
            <div className="search-box-cont w-full bg-[#0d4e9c] p-4 sm:p-5 shadow-lg">
              <form onSubmit={handleSearch} className="space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن طبيب أو تخصص..."
                    className="w-full bg-white text-slate-800 placeholder:text-slate-400 rounded-full py-2 sm:py-2.5 pr-4 pl-10 text-[14px] sm:text-[15px] outline-none shadow-inner font-medium transition-all focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="submit"
                    aria-label="بحث"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0d4e9c] hover:text-[#0b4080] transition-colors cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* SGH Hail .form-actions: Outline Pill Button */}
                <div className="pt-1 text-center">
                  <Link href="/doctors">
                    <span className="block w-full py-[6px] px-[22.4px] rounded-[30px] border border-white text-white text-[15px] sm:text-[16px] font-medium hover:bg-white hover:text-[#0d4e9c] transition-all duration-200 cursor-pointer text-center">
                      تصفح جميع الأطباء
                    </span>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
