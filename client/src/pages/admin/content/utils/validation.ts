/**
 * Content Validation Utilities
 * أدوات التحقق من صحة المحتوى
 *
 * يوفر دوال متقدمة للتحقق من صحة البيانات قبل الحفظ
 */

/**
 * نتيجة التحقق
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * التحقق من صحة الرابط
 */
export function validateUrl(url: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!url || url.trim() === '') {
    errors.url = 'الرابط مطلوب';
    return { isValid: false, errors };
  }

  try {
    const urlObj = new URL(url);

    // التحقق من البروتوكول المدعوم
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      errors.url = 'بروتوكول الرابط غير مدعوم';
      return { isValid: false, errors };
    }

    // التحقق من أن الرابط ليس فارغاً
    if (!urlObj.hostname && urlObj.protocol !== 'mailto:' && urlObj.protocol !== 'tel:') {
      errors.url = 'الرابط غير صالح';
      return { isValid: false, errors };
    }

    // التحقق من طول الرابط
    if (url.length > 500) {
      errors.url = 'الرابط طويل جداً (الحد الأقصى: 500 حرف)';
      return { isValid: false, errors };
    }

    return { isValid: true, errors: {} };
  } catch {
    errors.url = 'تنسيق الرابط غير صالح';
    return { isValid: false, errors };
  }
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function validateEmail(email: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!email || email.trim() === '') {
    errors.email = 'البريد الإلكتروني مطلوب';
    return { isValid: false, errors };
  }

  // نمط بسيط للتحقق من البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.email = 'البريد الإلكتروني غير صالح';
    return { isValid: false, errors };
  }

  // التحقق من طول البريد الإلكتروني
  if (email.length > 320) {
    errors.email = 'البريد الإلكتروني طويل جداً (الحد الأقصى: 320 حرف)';
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

/**
 * التحقق من صحة رقم الهاتف
 */
export function validatePhone(phone: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!phone || phone.trim() === '') {
    errors.phone = 'رقم الهاتف مطلوب';
    return { isValid: false, errors };
  }

  // إزالة المسافات والرموز
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // التحقق من أن الرقم يحتوي على أرقام فقط
  const phoneRegex = /^\+?[0-9]{10,20}$/;
  if (!phoneRegex.test(cleanPhone)) {
    errors.phone = 'رقم الهاتف غير صالح';
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

/**
 * التحقق من صحة النص
 */
export function validateText(
  text: string,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    fieldName?: string;
  } = {}
): ValidationResult {
  const { minLength = 0, maxLength = 10000, required = false, fieldName = 'النص' } = options;

  const errors: Record<string, string> = {};

  if (required && (!text || text.trim() === '')) {
    errors[fieldName] = `${fieldName} مطلوب`;
    return { isValid: false, errors };
  }

  if (text && text.length < minLength) {
    errors[fieldName] = `${fieldName} قصير جداً (الحد الأدنى: ${minLength} حرف)`;
    return { isValid: false, errors };
  }

  if (text && text.length > maxLength) {
    errors[fieldName] = `${fieldName} طويل جداً (الحد الأقصى: ${maxLength} حرف)`;
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

/**
 * التحقق من صحة المفتاح (Key)
 */
export function validateKey(key: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!key || key.trim() === '') {
    errors.key = 'المفتاح مطلوب';
    return { isValid: false, errors };
  }

  // التحقق من تنسيق المفتاح
  const keyRegex = /^[a-zA-Z0-9._-]+$/;
  if (!keyRegex.test(key)) {
    errors.key =
      'المفتاح يجب أن يحتوي على أحرف إنجليزية، أرقام، نقطة، شرطة سفلية أو شرطة عادية فقط';
    return { isValid: false, errors };
  }

  // التحقق من طول المفتاح
  if (key.length > 255) {
    errors.key = 'المفتاح طويل جداً (الحد الأقصى: 255 حرف)';
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

/**
 * التحقق من صحة رابط الصورة
 */
export function validateImageUrl(url: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!url || url.trim() === '') {
    errors.url = 'رابط الصورة مطلوب';
    return { isValid: false, errors };
  }

  try {
    const urlObj = new URL(url);

    // التحقق من البروتوكول
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      errors.url = 'رابط الصورة يجب أن يبدأ بـ http:// أو https://';
      return { isValid: false, errors };
    }

    // التحقق من امتداد الصورة
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const extension = urlObj.pathname.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) => extension.endsWith(ext));

    if (!hasValidExtension && !urlObj.pathname.includes('/')) {
      errors.url = 'رابط الصورة يجب أن ينتهي بامتداد صورة صحيح';
      return { isValid: false, errors };
    }

    return { isValid: true, errors: {} };
  } catch {
    errors.url = 'رابط الصورة غير صالح';
    return { isValid: false, errors };
  }
}

/**
 * التحقق من صحة اللون
 */
export function validateColor(color: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!color || color.trim() === '') {
    errors.color = 'اللون مطلوب';
    return { isValid: false, errors };
  }

  // التحقق من تنسيق HEX
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(color)) {
    errors.color = 'اللون يجب أن يكون بتنسيق HEX (مثال: #ffffff أو #fff)';
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

/**
 * التحقق من صحة المحتوى النصي
 */
export function validateTextContent(data: {
  key: string;
  content: string;
  language: string;
  type?: string | null;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // التحقق من المفتاح
  const keyValidation = validateKey(data.key);
  if (!keyValidation.isValid) {
    Object.assign(errors, keyValidation.errors);
  }

  // التحقق من المحتوى
  const contentValidation = validateText(data.content, {
    required: true,
    minLength: 1,
    maxLength: 10000,
    fieldName: 'المحتوى',
  });
  if (!contentValidation.isValid) {
    Object.assign(errors, contentValidation.errors);
  }

  // التحقق من اللغة
  if (!data.language || data.language.trim() === '') {
    errors.language = 'اللغة مطلوبة';
  } else if (!['ar', 'en'].includes(data.language)) {
    errors.language = 'اللغة يجب أن تكون العربية (ar) أو الإنجليزية (en)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * التحقق من صحة بيانات الصفحة
 */
export function validatePage(data: {
  name: string;
  slug: string;
  titleAr: string;
  titleEn: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // التحقق من الاسم
  const nameValidation = validateText(data.name, {
    required: true,
    minLength: 2,
    maxLength: 255,
    fieldName: 'الاسم',
  });
  if (!nameValidation.isValid) {
    Object.assign(errors, nameValidation.errors);
  }

  // التحقق من الرابط
  const slugValidation = validateText(data.slug, {
    required: true,
    minLength: 2,
    maxLength: 255,
    fieldName: 'الرابط',
  });
  if (!slugValidation.isValid) {
    Object.assign(errors, slugValidation.errors);
  }

  // التحقق من تنسيق الرابط
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(data.slug)) {
    errors.slug = 'الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة، أرقام، وشرطات عادية فقط';
  }

  // التحقق من العنوان العربي
  const titleArValidation = validateText(data.titleAr, {
    required: true,
    minLength: 2,
    maxLength: 255,
    fieldName: 'العنوان بالعربية',
  });
  if (!titleArValidation.isValid) {
    Object.assign(errors, titleArValidation.errors);
  }

  // التحقق من العنوان الإنجليزي
  const titleEnValidation = validateText(data.titleEn, {
    required: true,
    minLength: 2,
    maxLength: 255,
    fieldName: 'العنوان بالإنجليزية',
  });
  if (!titleEnValidation.isValid) {
    Object.assign(errors, titleEnValidation.errors);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * التحقق من صحة بيانات القسم
 */
export function validateSection(data: {
  name: string;
  titleAr: string;
  titleEn: string;
  type: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // التحقق من الاسم
  const nameValidation = validateText(data.name, {
    required: true,
    minLength: 2,
    maxLength: 255,
    fieldName: 'الاسم',
  });
  if (!nameValidation.isValid) {
    Object.assign(errors, nameValidation.errors);
  }

  // التحقق من العنوان العربي
  const titleArValidation = validateText(data.titleAr, {
    required: true,
    minLength: 2,
    maxLength: 255,
    fieldName: 'العنوان بالعربية',
  });
  if (!titleArValidation.isValid) {
    Object.assign(errors, titleArValidation.errors);
  }

  // التحقق من العنوان الإنجليزي
  const titleEnValidation = validateText(data.titleEn, {
    required: true,
    minLength: 2,
    maxLength: 255,
    fieldName: 'العنوان بالإنجليزية',
  });
  if (!titleEnValidation.isValid) {
    Object.assign(errors, titleEnValidation.errors);
  }

  // التحقق من نوع القسم
  const allowedTypes = [
    'slider',
    'text',
    'text-cards',
    'stats-cards',
    'image-cards',
    'image',
    'video',
    'hero',
    'cta',
    'features',
    'testimonials',
    'faq',
    'contact',
    'pricing',
    'team',
    'gallery',
    'timeline',
    'custom',
  ];
  if (!allowedTypes.includes(data.type)) {
    errors.type = 'نوع القسم غير صالح';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
