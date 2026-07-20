/**
 * Formatting Utilities
 * دوال مساعدة للتنسيق
 */

/**
 * تنسيق الرقم بالعملة
 */
export function formatCurrency(amount: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * تنسيق الرقم مع الفواصل
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-SA').format(num);
}

/**
 * تنسيق التاريخ
 */
export function formatDate(date: Date | string, format: 'full' | 'short' | 'time' = 'full'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
    },
  }[format] as Intl.DateTimeFormatOptions;

  return new Intl.DateTimeFormat('ar-SA', options).format(dateObj);
}

/**
 * تنسيق رقم الهاتف
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{2})/, '$1 $2 $3 $4');
  }
  
  return phone;
}

/**
 * تنسيق النص المختصر
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {return text;}
  return text.slice(0, maxLength) + '...';
}

/**
 * تنسيق الحجم بالبايت
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {return '0 Bytes';}
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * تنسيق النسبة المئوية
 */
export function formatPercentage(value: number, decimals = 2): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * تنسيق المدة الزمنية
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}س ${minutes}د ${remainingSeconds}ث`;
  }
  if (minutes > 0) {
    return `${minutes}د ${remainingSeconds}ث`;
  }
  return `${remainingSeconds}ث`;
}

/**
 * تنسيق الاسم الكامل
 */
export function formatFullName(firstName: string, lastName?: string): string {
  if (!lastName) {return firstName;}
  return `${firstName} ${lastName}`;
}

/**
 * تنسيق العنوان
 */
export function formatAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ].filter(Boolean);
  
  return parts.join(', ');
}
