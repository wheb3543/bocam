import { describe, expect, it, vi } from 'vitest';
import { assertPublicationQuality } from './publicationQualityGate';

function createAuditDb() {
  const values = vi.fn().mockResolvedValue(undefined);
  return {
    insert: vi.fn().mockReturnValue({ values }),
    values,
  };
}

const imageWithoutAlt = {
  key: 'hero-image',
  url: 'https://cdn.example.test/hero.avif',
  altAr: '',
  altEn: '',
};

describe('assertPublicationQuality', () => {
  it('يرفض نشر صورة بلا نص بديل برمز PRECONDITION_FAILED', async () => {
    await expect(
      assertPublicationQuality({}, {
        entityType: 'image',
        entityId: 41,
        candidate: imageWithoutAlt,
        role: 'admin',
        userId: 7,
      })
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
  });

  it('يسمح للمدير بتجاوز خطأ الجودة عند توثيق السبب في سجل التدقيق', async () => {
    const db = createAuditDb();

    const result = await assertPublicationQuality(db, {
      entityType: 'image',
      entityId: 42,
      candidate: imageWithoutAlt,
      role: 'admin',
      userId: 8,
      overrideReason: 'الصورة مؤقتة بانتظار استلام الوصف المعتمد.',
    });

    expect(result.overridden).toBe(true);
    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(db.values).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'image',
        entityId: 42,
        userId: 8,
        reason: expect.stringContaining('تجاوز جودة النشر'),
      })
    );
  });

  it('يرفض طلب التجاوز من مستخدم ليس مديراً', async () => {
    const db = createAuditDb();

    await expect(
      assertPublicationQuality(db, {
        entityType: 'image',
        entityId: 43,
        candidate: imageWithoutAlt,
        role: 'editor',
        userId: 9,
        overrideReason: 'سبب موثق لتجاوز الفحص مؤقتاً.',
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(db.insert).not.toHaveBeenCalled();
  });
});
