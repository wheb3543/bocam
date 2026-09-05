export type BrandingConfig = {
  tenantId: string;
  client: {
    nameAr: string;
    nameEn: string;
    sloganAr: string;
    sloganEn: string;
    email: string;
    phone: string;
    addressAr: string;
    addressEn: string;
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  seo: {
    siteTitle: string;
    metaDescription: string;
    logoPath: string;
    faviconPath: string;
  };
  homepage: {
    heroTitleAr: string;
    heroTitleEn: string;
    heroSubtitleAr: string;
    heroSubtitleEn: string;
  };
  contact: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
};

export const branding: BrandingConfig = {
  tenantId: 'tenant-sgh',
  client: {
    nameAr: 'المستشفى السعودي الألماني',
    nameEn: 'Saudi German Hospital',
    sloganAr: 'نرعاكم كأهالينا',
    sloganEn: 'Caring like family',
    email: 'info@sgh.ye',
    phone: '8000018',
    city: 'صنعاء',
    addressAr: 'صنعاء - اليمن',
    addressEn: "Sana'a, Yemen",
  },
  theme: {
    primary: '#0F4C81',
    secondary: '#F4C542',
    accent: '#EAF3FF',
    background: '#F8FAFC',
    text: '#1F2937',
  },
  seo: {
    siteTitle: 'المستشفى السعودي الألماني',
    metaDescription: 'منصة حجز المواعيد والخدمات الطبية للمستشفى السعودي الألماني',
    logoPath: '/tenant-assets/sgh-logo-full.png',
    faviconPath: '/tenant-assets/favicon.ico',
  },
  homepage: {
    heroTitleAr: 'احجز موعدك الآن',
    heroTitleEn: 'Book Your Appointment Now',
    heroSubtitleAr: 'خدمات طبية متميزة في بيئة آمنة ومريحة',
    heroSubtitleEn: 'Premium medical services in a safe and comfortable environment',
  },
  contact: {
    facebook: 'https://facebook.com/sgh',
    instagram: 'https://instagram.com/sgh',
    twitter: '',
    linkedin: '',
  },
};

export default branding;
