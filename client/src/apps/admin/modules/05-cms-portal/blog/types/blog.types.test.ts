import { describe, expect, it } from 'vitest';
import {
  initialBlogCategoryFormData,
  initialBlogPostFormData,
  parseTagsInput,
  toBlogPostFormData,
  toBlogPostPayload,
  type BlogPostFormData,
} from './blog.types';

const baseForm = (): BlogPostFormData => ({ ...initialBlogPostFormData });

describe('تحليل وسوم المقال من حقل نصي', () => {
  it('يفصل الوسوم بالفواصل العربية والإنجليزية', () => {
    expect(parseTagsInput('سكري، ضغط، قلب')).toEqual(['سكري', 'ضغط', 'قلب']);
    expect(parseTagsInput('سكري, ضغط')).toEqual(['سكري', 'ضغط']);
  });

  it('يزيل الفراغات المكررة', () => {
    expect(parseTagsInput('سكري، سكري , سكري')).toEqual(['سكري']);
  });

  it('يعيد مصفوفة فارغة للحقل الفارغ', () => {
    expect(parseTagsInput('')).toEqual([]);
    expect(parseTagsInput('   ')).toEqual([]);
  });
});

describe('تحويل نموذج المقال إلى حمولة tRPC', () => {
  it('يحوّل التاريخ المجدول إلى Date', () => {
    const form = { ...baseForm(), scheduledFor: '2026-10-01' };
    const payload = toBlogPostPayload(form);
    expect(payload.scheduledFor).toBeInstanceOf(Date);
  });

  it('يحوّل التاريخ الفارغ إلى null', () => {
    expect(toBlogPostPayload(baseForm()).scheduledFor).toBeNull();
  });

  it('يتجاهل الحقول النصية الفارغة بدل إرسالها', () => {
    const payload = toBlogPostPayload({ ...baseForm(), reviewerName: '  ', metaTitle: '' });
    expect(payload.reviewerName).toBeUndefined();
    expect(payload.metaTitle).toBeUndefined();
  });

  it('يحافظ على العنوان والمحتوى الإلزاميين', () => {
    const payload = toBlogPostPayload({ ...baseForm(), title: '  عنوان  ', content: '<p>جسم</p>' });
    expect(payload.title).toBe('عنوان');
    expect(payload.content).toBe('<p>جسم</p>');
  });

  it('يحوّل الوسوم إلى مصفوفة', () => {
    expect(toBlogPostPayload({ ...baseForm(), tagsInput: 'سكري، ضغط' }).tags).toEqual([
      'سكري',
      'ضغط',
    ]);
  });

  it('يضمن أن الترتيب رقم صحيح', () => {
    expect(toBlogPostPayload({ ...baseForm(), sortOrder: Number.NaN }).sortOrder).toBe(0);
  });
});

describe('تحويل سجل المقال إلى نموذج قابل للتحرير', () => {
  it('يحوّل التاريخات إلى صيغة input[type=date]', () => {
    const form = toBlogPostFormData({
      id: 1,
      title: 'عنوان',
      content: '<p>جسم</p>',
      slug: 'slug',
      status: 'published',
      isActive: 'yes',
      isFeatured: 'no',
      sortOrder: 0,
      reviewDate: new Date('2026-03-10T00:00:00.000Z'),
      scheduledFor: new Date('2026-10-01T00:00:00.000Z'),
      publishedAt: null,
      tags: '["سكري","ضغط"]',
    } as Parameters<typeof toBlogPostFormData>[0]);

    expect(form.reviewDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(form.scheduledFor).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('يحوّل الوسوم من JSON إلى نص مفصول بفواصل', () => {
    const form = toBlogPostFormData({
      id: 1,
      title: 'عنوان',
      content: '<p>جسم</p>',
      slug: 'slug',
      status: 'draft',
      isActive: 'yes',
      isFeatured: 'no',
      sortOrder: 0,
      tags: '["سكري","ضغط"]',
    } as Parameters<typeof toBlogPostFormData>[0]);

    expect(form.tagsInput).toBe('سكري، ضغط');
  });

  it('يتحمل الوسوم التالفة دون كسر النموذج', () => {
    const form = toBlogPostFormData({
      id: 1,
      title: 'عنوان',
      content: '<p>جسم</p>',
      slug: 'slug',
      status: 'draft',
      isActive: 'yes',
      isFeatured: 'no',
      sortOrder: 0,
      tags: '{ليس JSON}',
    } as Parameters<typeof toBlogPostFormData>[0]);

    expect(form.tagsInput).toBe('{ليس JSON}');
  });

  it('يبدأ النموذج بحالة مسودة غير مميّزة', () => {
    expect(initialBlogPostFormData.status).toBe('draft');
    expect(initialBlogPostFormData.isFeatured).toBe('no');
    expect(initialBlogPostFormData.isActive).toBe('yes');
  });

  it('يبدأ نموذج التصنيف بلون الهوية الافتراضي', () => {
    expect(initialBlogCategoryFormData.color).toBe('#1ca8e5');
  });
});
