/**
 * departmentMedia - حل الصور البصرية للأقسام الطبية
 *
 * Resolves the official SGH Hail department artwork (downloaded under
 * `client/public/sgh/departments/`) for every medical department record returned
 * by the database, using a slug-first, keyword-fallback strategy so newly added
 * departments always render a meaningful image.
 */

export interface DepartmentMediaInput {
  slug?: string | null;
  name?: string | null;
  nameEn?: string | null;
  icon?: string | null;
  image?: string | null;
}

/** خريطة مطابقة مباشرة: رابط القسم التعريفي ← الصورة الرسمية */
const DEPARTMENT_IMAGES_BY_SLUG: Record<string, string> = {
  'dermatology-and-cosmetics': '/sgh/departments/dermatology.jpg',
  'anesthesia-pain-management': '/sgh/departments/anesthesia.jpg',
  'general-surgery': '/sgh/departments/surgery.jpg',
  'internal-medicine': '/sgh/departments/internal.jpg',
  'psychiatry-behavioral-health': '/sgh/departments/psychiatry.jpg',
  'pediatrics-neonatology': '/sgh/departments/pediatrics.jpg',
  'orthopedics-trauma': '/sgh/departments/orthopedics.jpg',
  'cardiology-cardiothoracic': '/sgh/departments/cardiology.jpg',
  'obstetrics-gynecology': '/sgh/departments/obgyn.jpg',
  'emergency-department': '/sgh/departments/emergency.jpg',
  urology: '/sgh/departments/urology.jpg',
  'vascular-surgery': '/sgh/departments/vascular.jpg',
};

/** احتياطي بالكلمات المفتاحية للبحث بالعربي والإنجليزي */
const DEPARTMENT_IMAGE_KEYWORDS: Array<{ keywords: string[]; image: string }> = [
  {
    keywords: ['dermatolog', 'skin', 'cosmetic', 'جلد', 'تجميل'],
    image: '/sgh/departments/dermatology.jpg',
  },
  {
    keywords: ['anesthes', 'pain', 'تخدير', 'ألم', 'الم'],
    image: '/sgh/departments/anesthesia.jpg',
  },
  { keywords: ['surgery', 'surgical', 'جراح'], image: '/sgh/departments/surgery.jpg' },
  {
    keywords: ['vascular', 'أوعية', 'اوعية', 'شرايين', 'دوال'],
    image: '/sgh/departments/vascular.jpg',
  },
  { keywords: ['internal', 'باطن'], image: '/sgh/departments/internal.jpg' },
  {
    keywords: ['psychiatr', 'behavioral', 'mental', 'نفسي', 'سلوك'],
    image: '/sgh/departments/psychiatry.jpg',
  },
  {
    keywords: ['pediatric', 'neonat', 'child', 'أطفال', 'اطفال', 'ولادة وطفولة'],
    image: '/sgh/departments/pediatrics.jpg',
  },
  {
    keywords: ['orthoped', 'trauma', 'bone', 'عظام', 'إصاب', 'اصاب'],
    image: '/sgh/departments/orthopedics.jpg',
  },
  {
    keywords: ['cardiolog', 'cardio', 'heart', 'قلب', 'صدر'],
    image: '/sgh/departments/cardiology.jpg',
  },
  { keywords: ['gynec', 'obstetr', 'women', 'نساء', 'توليد'], image: '/sgh/departments/obgyn.jpg' },
  {
    keywords: ['emergency', 'urgent', 'accident', 'طوارئ', 'إسعاف', 'اسعاف'],
    image: '/sgh/departments/emergency.jpg',
  },
  {
    keywords: ['urolog', 'kidney', 'مسالك', 'بولية', 'كلى'],
    image: '/sgh/departments/urology.jpg',
  },
];

/** الصورة الاحتياطية الموحدة عند عدم توفر صورة مخصصة للقسم */
export const DEFAULT_DEPARTMENT_IMAGE = '/sgh/departments-banner.jpg';

/**
 * إرجاع رابط الصورة الرسمية للقسم الطبي
 */
export function resolveDepartmentImage(department: DepartmentMediaInput): string {
  // Admin-managed image always takes precedence over the bundled fallback artwork.
  const managedImage = department.image?.trim();
  if (managedImage) {
    return managedImage;
  }

  const slug = department.slug?.trim().toLowerCase();

  if (slug && DEPARTMENT_IMAGES_BY_SLUG[slug]) {
    return DEPARTMENT_IMAGES_BY_SLUG[slug];
  }

  const haystack = [department.slug, department.nameEn, department.name, department.icon]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (haystack) {
    for (const entry of DEPARTMENT_IMAGE_KEYWORDS) {
      if (entry.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
        return entry.image;
      }
    }
  }

  return DEFAULT_DEPARTMENT_IMAGE;
}
