/**
 * Status Timestamps Utility
 * دوال مساعدة لإنشاء وتحديث الطوابع الزمنية الخاصة بالحالات المختلفة
 */

/**
 * إنشاء طوابع زمنية للحالة عند إنشاء كائن جديد
 * @param status - الحالة (مثال: contacted, confirmed, attended, completed, cancelled)
 * @returns كائن يحتوي على الطابع الزمني المناسب للحالة
 */
export function createStatusTimestamps(status: string): Record<string, Date> {
  const now = new Date();
  const timestamps: Record<string, Date> = {};

  if (status === 'contacted') {
    timestamps.contactedAt = now;
  } else if (status === 'confirmed') {
    timestamps.confirmedAt = now;
  } else if (status === 'attended') {
    timestamps.attendedAt = now;
  } else if (status === 'completed') {
    timestamps.completedAt = now;
  } else if (status === 'cancelled') {
    timestamps.cancelledAt = now;
  }

  return timestamps;
}

/**
 * تحديث طوابع زمنية للحالة عند تحديث حالة كائن قائم
 * @param status - الحالة الجديدة
 * @returns كائن يحتوي على الطابع الزمني المناسب للحالة ليتم دمجه في تحديث قاعدة البيانات
 */
export function updateStatusTimestamps(status: string): Record<string, Date> {
  const now = new Date();
  const updateData: Record<string, Date> = {};

  if (status === 'contacted') {
    updateData.contactedAt = now;
  } else if (status === 'confirmed') {
    updateData.confirmedAt = now;
  } else if (status === 'attended') {
    updateData.attendedAt = now;
  } else if (status === 'completed') {
    updateData.completedAt = now;
  } else if (status === 'cancelled') {
    updateData.cancelledAt = now;
  }

  return updateData;
}
