/**
 * Conversation Info Utilities
 * أدوات معلومات المحادثة
 */

import { toast } from 'sonner';
import { getCompanyName } from '@/const';

/**
 * نسخ رقم الهاتف إلى الحافظة
 */
export function handleCopyPhone(phoneNumber: string) {
  navigator.clipboard.writeText(phoneNumber);
  toast.success('تم نسخ رقم الهاتف');
}

/**
 * إجراء مكالمة
 */
export function handleCall(phoneNumber: string) {
  window.location.href = `tel:${phoneNumber}`;
}

/**
 * فتح واتساب
 */
export function handleWhatsApp(phoneNumber: string) {
  const companyName = getCompanyName('ar');
  const message = encodeURIComponent(`مرحباً! هذه رسالة من ${companyName}`);
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
}

/**
 * إرسال بريد إلكتروني
 */
export function handleEmail(email?: string) {
  if (!email) {
    toast.error('لا يوجد بريد إلكتروني');
    return;
  }
  window.location.href = `mailto:${email}`;
}

/**
 * الحصول على لون شارة الحالة
 */
export function getStatusBadgeColor(status: string): string {
  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    booked: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    not_interested: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * الحصول على تسمية النوع
 */
export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    lead: 'عميل محتمل',
    appointment: 'موعد طبي',
    offer: 'عرض طبي',
    camp: 'تسجيل مخيم',
  };
  return labels[type] || type;
}
