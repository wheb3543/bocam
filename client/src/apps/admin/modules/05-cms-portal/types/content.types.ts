/**
 * Content Management Types
 * تعريفات الأنواع الخاصة بنظام إدارة المحتوى
 */

/**
 * أنواع المحتوى النصي
 */
export type TextContentType =
  | 'title'
  | 'subtitle'
  | 'description'
  | 'text'
  | 'button'
  | 'link'
  | 'label'
  | 'placeholder'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

/**
 * أنواع الألوان
 */
export type ColorType = 'primary' | 'secondary' | 'accent' | 'background' | 'text' | 'border';

/**
 * أنواع الكيانات لسجل التغييرات
 */
export type EntityType = 'text' | 'image' | 'color' | 'seo';

/**
 * أنواع الإجراءات لسجل التغييرات
 */
export type AuditAction = 'create' | 'update' | 'delete';

/**
 * واجهة المحتوى النصي
 */
export interface TextContent {
  id: number;
  key: string;
  language: string;
  content: string;
  section?: string | null;
  sectionId?: number | null;
  pageId?: number | null;
  type: TextContentType | null;
  status: 'draft' | 'published' | 'archived';
  isActive: 'yes' | 'no';
  publishedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * واجهة بيانات نموذج المحتوى النصي
 */
export interface TextContentFormData {
  key: string;
  language: string;
  content: string;
  section: string;
  sectionId?: number;
  pageId?: number;
  type: string;
  status: 'draft' | 'published' | 'archived';
  isActive: 'yes' | 'no';
  publishedAt: Date | null;
  qualityOverrideReason: string;
}

/**
 * البيانات الأولية لنموذج المحتوى النصي
 */
export const initialTextContentFormData: TextContentFormData = {
  key: '',
  language: 'ar',
  content: '',
  section: '',
  sectionId: undefined,
  pageId: undefined,
  type: 'text',
  status: 'draft',
  isActive: 'yes',
  publishedAt: null,
  qualityOverrideReason: '',
};

/**
 * واجهة الصورة
 */
export interface Image {
  id: number;
  key: string;
  url: string;
  altAr?: string | null;
  altEn?: string | null;
  section?: string | null;
  sectionId?: number | null;
  pageId?: number | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  size?: number | null;
  status: 'draft' | 'published' | 'archived';
  isActive: 'yes' | 'no';
  publishedAt?: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * واجهة بيانات نموذج الصورة
 */
export interface ImageFormData {
  key: string;
  url: string;
  altAr: string;
  altEn: string;
  alt: string;
  section: string;
  sectionId?: number;
  pageId?: number;
  width: string;
  height: string;
  format: string;
  size: string;
  status: 'draft' | 'published' | 'archived';
  isActive: 'yes' | 'no';
  publishedAt: Date | null;
  qualityOverrideReason: string;
}

/**
 * البيانات الأولية لنموذج الصورة
 */
export const initialImageFormData: ImageFormData = {
  key: '',
  url: '',
  altAr: '',
  altEn: '',
  alt: '',
  section: '',
  width: '',
  height: '',
  format: '',
  size: '',
  status: 'draft',
  isActive: 'yes',
  publishedAt: null,
  qualityOverrideReason: '',
};

/**
 * واجهة نظام الألوان
 */
export interface ColorScheme {
  id: number;
  key: string;
  value: string;
  type: ColorType | null;
  shade?: string | null;
  isActive: 'yes' | 'no';
  updatedAt: Date;
  createdAt: Date;
}

/**
 * واجهة بيانات نموذج الألوان
 */
export interface ColorSchemeFormData {
  key: string;
  value: string;
  type: string;
  shade: string;
  isActive: 'yes' | 'no';
}

/**
 * البيانات الأولية لنموذج الألوان
 */
export const initialColorSchemeFormData: ColorSchemeFormData = {
  key: '',
  value: '',
  type: 'primary',
  shade: '',
  isActive: 'yes',
};

/**
 * واجهة إعدادات SEO
 */
export interface SEOSettings {
  id: number;
  pageKey: string | null;
  pageId?: number | null;
  slug?: string | null;
  language: string | null;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  structuredData?: string | null;
  isActive: 'yes' | 'no';
  status: 'draft' | 'published' | 'archived';
  publishedAt: Date | null;
  deletedAt?: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * واجهة بيانات نموذج SEO
 */
export interface SEOSettingsFormData {
  pageKey: string;
  pageId?: number;
  slug: string;
  language: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  structuredData: string;
  isActive: 'yes' | 'no';
  status: 'draft' | 'published' | 'archived';
  publishedAt: Date | null;
  qualityOverrideReason: string;
}

/**
 * البيانات الأولية لنموذج SEO
 */
export const initialSEOSettingsFormData: SEOSettingsFormData = {
  pageKey: '',
  pageId: undefined,
  slug: '',
  language: 'ar',
  title: '',
  description: '',
  keywords: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalUrl: '',
  robots: '',
  structuredData: '',
  isActive: 'yes',
  status: 'draft',
  publishedAt: null,
  qualityOverrideReason: '',
};

/**
 * واجهة سجل التغييرات
 */
export interface ContentAuditLog {
  id: number;
  entityType: EntityType;
  entityId?: number | null;
  action: AuditAction;
  oldValue?: string | null;
  newValue?: string | null;
  userId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  reason?: string | null;
  createdAt: Date;
}

/**
 * خيارات اللغات
 */
export const languageOptions = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

/**
 * خيارات أنواع المحتوى النصي
 */
export const textContentTypeOptions = [
  { value: 'title', label: 'عنوان' },
  { value: 'subtitle', label: 'عنوان فرعي' },
  { value: 'description', label: 'وصف' },
  { value: 'text', label: 'نص عادي' },
  { value: 'button', label: 'زر' },
  { value: 'link', label: 'رابط' },
  { value: 'label', label: 'تسمية' },
  { value: 'placeholder', label: 'Placeholder' },
  { value: 'error', label: 'رسالة خطأ' },
  { value: 'success', label: 'رسالة نجاح' },
  { value: 'warning', label: 'رسالة تحذير' },
  { value: 'info', label: 'رسالة معلومات' },
];

/**
 * خيارات الأقسام
 */
export const sectionOptions = [
  { value: 'hero', label: 'الرئيسية (Hero)' },
  { value: 'stats', label: 'الإحصائيات (Stats)' },
  { value: 'header', label: 'الهيدر' },
  { value: 'footer', label: 'الفوتر' },
  { value: 'about', label: 'عن المنصة' },
  { value: 'services', label: 'الخدمات' },
  { value: 'cta', label: 'دعوة للعمل (CTA)' },
  { value: 'contact', label: 'اتصل بنا' },
  { value: 'doctors', label: 'الأطباء' },
  { value: 'camps', label: 'المخيمات' },
  { value: 'offers', label: 'العروض' },
  { value: 'booking', label: 'الحجز' },
  { value: 'privacy', label: 'سياسة الخصوصية' },
  { value: 'thankyou', label: 'صفحة الشكر' },
  { value: 'accessibility', label: 'إمكانية الوصول' },
  { value: 'error', label: 'الأخطاء' },
  { value: 'notification', label: 'الإشعارات' },
];

/**
 * خيارات أنواع الألوان
 */
export const colorTypeOptions = [
  { value: 'primary', label: 'أساسي' },
  { value: 'secondary', label: 'ثانوي' },
  { value: 'accent', label: 'تمييز' },
  { value: 'background', label: 'خلفية' },
  { value: 'text', label: 'نص' },
  { value: 'border', label: 'حدود' },
];

/**
 * خيارات درجات الألوان
 */
export const colorShadeOptions = [
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '300', label: '300' },
  { value: '400', label: '400' },
  { value: '500', label: '500' },
  { value: '600', label: '600' },
  { value: '700', label: '700' },
  { value: '800', label: '800' },
  { value: '900', label: '900' },
  { value: '950', label: '950' },
];

/**
 * خيارات صيغ الصور
 */
export const imageFormatOptions = [
  { value: 'jpg', label: 'JPG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'svg', label: 'SVG' },
  { value: 'gif', label: 'GIF' },
];

/**
 * واجهة فلاتر البحث
 */
export interface ContentFilters {
  searchQuery: string;
  language: string;
  section: string;
  sectionId?: string;
  pageId?: string;
  type?: string;
  isActive?: string;
}

/**
 * البيانات الأولية للفلاتر
 */
export const initialContentFilters: ContentFilters = {
  searchQuery: '',
  language: 'all',
  section: 'all',
  type: 'all',
  isActive: 'all',
};

/**
 * واجهة نظرة عامة على المحتوى
 */
export interface ContentOverview {
  totalTextContent: number;
  totalImages: number;
  totalColorSchemes: number;
  totalSEOSettings: number;
  activeTextContent: number;
  activeImages: number;
  activeColorSchemes: number;
  activeSEOSettings: number;
}
