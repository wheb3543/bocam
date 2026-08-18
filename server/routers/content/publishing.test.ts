import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSocialPublishingOverview: vi.fn(),
  getSocialPublishPost: vi.fn(),
  createSocialPublishDraft: vi.fn(),
  updateSocialPublishDraft: vi.fn(),
  submitSocialPublishPostForReview: vi.fn(),
  reviewSocialPublishPost: vi.fn(),
  scheduleSocialPublishPost: vi.fn(),
  cancelSocialPublishSchedule: vi.fn(),
}));

vi.mock('../../database/db', () => mocks);

import { publishingRouter } from './publishing';

const staffContext = { user: { id: 41, role: 'staff' } } as any;
const managerContext = { user: { id: 42, role: 'manager' } } as any;
const viewerContext = { user: { id: 43, role: 'viewer' } } as any;

describe('publishingRouter', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.getSocialPublishingOverview.mockResolvedValue({ accounts: [], posts: [], totals: {} });
    mocks.createSocialPublishDraft.mockResolvedValue({ post: { id: 9, status: 'draft' } });
    mocks.reviewSocialPublishPost.mockResolvedValue({ post: { id: 9, status: 'approved' } });
    mocks.scheduleSocialPublishPost.mockResolvedValue({ post: { id: 9, status: 'scheduled' } });
  });

  it('يرفض الوصول إلى صفحة النشر للدور غير المخول', async () => {
    await expect(publishingRouter.createCaller(viewerContext).overview()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('يمرر منشئ المسودة وخيارات المنصات والوسائط إلى طبقة البيانات', async () => {
    await publishingRouter.createCaller(staffContext).createDraft({
      title: 'منشور توعوي',
      baseCaption: 'نص المنشور',
      contentType: 'image',
      platforms: ['facebook', 'instagram'],
      mediaIds: [3, 4],
      timezone: 'Asia/Aden',
    });

    expect(mocks.createSocialPublishDraft).toHaveBeenCalledWith(expect.objectContaining({
      title: 'منشور توعوي',
      createdByUserId: 41,
      platforms: ['facebook', 'instagram'],
      mediaIds: [3, 4],
    }));
  });

  it('يقصر قرار الموافقة على الدور الإشرافي ويحتفظ بمعرّف المراجع', async () => {
    await publishingRouter.createCaller(managerContext).review({ id: 9, decision: 'approved' });
    expect(mocks.reviewSocialPublishPost).toHaveBeenCalledWith(9, 42, 'approved', undefined);
  });

  it('يتحقق من وقت الجدولة عبر مخطط الإدخال قبل استدعاء طبقة البيانات', async () => {
    await publishingRouter.createCaller(managerContext).schedule({
      id: 9,
      scheduledAt: new Date('2030-06-01T10:00:00.000Z'),
      timezone: 'Asia/Aden',
    });
    expect(mocks.scheduleSocialPublishPost).toHaveBeenCalledWith(9, expect.any(Date), 'Asia/Aden');
  });
});
