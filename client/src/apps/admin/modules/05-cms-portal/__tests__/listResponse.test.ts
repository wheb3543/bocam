import { describe, expect, it } from 'vitest';
import { getContentListData, getContentListPagination } from '../utils/listResponse';

describe('عقد قوائم إدارة المحتوى', () => {
  it('يعرض عناصر النتيجة المرحّلة بدلاً من اعتبار الكائن قائمة فارغة', () => {
    const response = {
      data: [{ id: 1, name: 'الصفحة الرئيسية' }],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    };

    expect(getContentListData(response)).toEqual([{ id: 1, name: 'الصفحة الرئيسية' }]);
    expect(getContentListPagination(response)).toEqual(response.pagination);
  });

  it('يبقي التوافق مع القوائم القديمة ويعطي حالة آمنة عند غياب البيانات', () => {
    expect(getContentListData([{ id: 1 }])).toEqual([{ id: 1 }]);
    expect(getContentListPagination([{ id: 1 }])).toBeNull();
    expect(getContentListData(undefined)).toEqual([]);
  });
});
