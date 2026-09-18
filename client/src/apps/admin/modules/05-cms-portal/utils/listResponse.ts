export type ContentPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ContentListResponse<T> = {
  data: T[];
  pagination: ContentPagination;
};

function isContentListResponse<T>(response: unknown): response is ContentListResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray((response as ContentListResponse<T>).data)
  );
}

/**
 * تقبل المصفوفات القديمة ونتائج القوائم المرحّلة الحالية أثناء انتقال CMS
 * إلى عقد بيانات موحد، وتعيد دائماً بيانات صالحة للرسم.
 */
export function getContentListData<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  return isContentListResponse<T>(response) ? response.data : [];
}

export function getContentListPagination<T>(response: unknown): ContentPagination | null {
  return isContentListResponse<T>(response) ? response.pagination : null;
}
