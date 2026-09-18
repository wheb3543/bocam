import { useLanguage } from '@/contexts/LanguageContext';

export default function SghTopHeader() {
  const { language, setLanguage } = useLanguage();

  const socialLinks = [
    {
      name: 'facebook',
      href: 'https://www.facebook.com/SaudiGermanHealth',
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'instagram',
      href: 'https://www.instagram.com/sgh.group/',
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'linkedin',
      href: 'https://www.linkedin.com/company/saudi-german-hospitals-group',
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'twitter',
      href: 'https://www.twitter.com/sghgroup',
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'youtube',
      href: 'https://www.youtube.com/@saudigermanhealth',
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  const quickNavLinks = [
    { label: 'الصفحة الرئيسية', href: '/' },
    { label: 'بودكاست', href: '/#podcast' },
    { label: 'المدونة الطبية', href: '/#blog' },
    { label: 'خدمات الرعاية الصحية المنزلية', href: '/#home-care' },
    { label: 'أهالينا', href: '/#about' },
    { label: 'الصحية للرعاية القائمة على القيمة والنتائج', href: '/#value-care' },
    { label: 'اتصل بنا', href: '/#contact' },
    { label: 'الوظائف', href: '/careers' },
  ];

  return (
    <div className="bg-[#f8f8f8] text-[#333333] hidden xl:block select-none" dir="rtl">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-[32px]">
          {/* Quick Informational Links on Right */}
          <div className="flex items-center gap-1 font-normal text-[12.8px]">
            {quickNavLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="px-[7px] text-[#333333] hover:text-[#1ea74d] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Social Media & Language on Left */}
          <div className="flex items-center gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-2 text-[#333333]">
              {socialLinks.map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="px-1 text-[#333333] hover:text-[#1ea74d] transition-colors"
                >
                  {s.svg}
                </a>
              ))}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`text-[12.8px] transition-colors hover:text-[#1ea74d] ${language === 'en' ? 'font-bold text-[#146c36]' : 'text-[#333333]'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`text-[12px] px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  language === 'ar'
                    ? 'bg-[#d8edd9] text-[#146c36]'
                    : 'text-[#333333] hover:text-[#1ea74d]'
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
