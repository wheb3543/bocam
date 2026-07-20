/**
 * Validation Utilities
 * دوال مساعدة للتحقق من البيانات
 */

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من صحة رقم الهاتف السعودي
 */
export function isValidSaudiPhone(phone: string): boolean {
  const phoneRegex = /^(05|5)[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * التحقق من صحة رقم الهاتف الدولي
 */
export function isValidInternationalPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * التحقق من صحة الرقم الوطني السعودي
 */
export function isValidSaudiID(id: string): boolean {
  const idRegex = /^[1-2]\d{9}$/;
  return idRegex.test(id);
}

/**
 * التحقق من صحة الرمز البريدي
 */
export function isValidPostalCode(code: string): boolean {
  const codeRegex = /^\d{5}$/;
  return codeRegex.test(code);
}

/**
 * التحقق من صحة URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * التحقق من صحة التاريخ
 */
export function isValidDate(date: string): boolean {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * التحقق من صحة العمر
 */
export function isValidAge(birthDate: string | Date, minAge = 18, maxAge = 120): boolean {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  
  return age >= minAge && age <= maxAge;
}

/**
 * التحقق من قوة كلمة المرور
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * التحقق من صحة رقم الضريبة
 */
export function isValidVATNumber(vatNumber: string): boolean {
  const vatRegex = /^\d{15}$/;
  return vatRegex.test(vatNumber);
}

/**
 * التحقق من صحة رقم الحساب البنكي (IBAN)
 */
export function isValidIBAN(iban: string): boolean {
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
  return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase());
}

/**
 * التحقق من صحة الاسم
 */
export function isValidName(name: string): boolean {
  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]{2,50}$/;
  return nameRegex.test(name);
}

/**
 * التحقق من أن القيمة في نطاق محدد
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * التحقق من أن القيمة موجودة وليست فارغة
 */
export function isNotEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {return false;}
  if (typeof value === 'string') {return value.trim().length > 0;}
  if (Array.isArray(value)) {return value.length > 0;}
  if (typeof value === 'object') {return Object.keys(value as object).length > 0;}
  return true;
}
