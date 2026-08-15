/**
 * Error Handler Utility
 * دالة مساعدة لمعالجة الأخطاء بشكل موحد ومتسق في جميع الخدمات (Services)
 */

interface ServiceErrorResponse {
  success: false;
  error: string;
}

/**
 * معالجة أخطاء الخدمات بشكل موحد وتسجيلها في السجلات (Logs)
 * @param error - الخطأ الفعلي
 * @param context - السياق أو اسم الخدمة/الوحدة التي حدث بها الخطأ
 * @returns كائن خطأ موحد يحتوي على success: false والرسالة المناسبة
 */
export function handleServiceError(error: unknown, context: string): ServiceErrorResponse {
  const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
  console.error(`[${context}] Error:`, error);
  return {
    success: false,
    error: errorMessage,
  };
}
