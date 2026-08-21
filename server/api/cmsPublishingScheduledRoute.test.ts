import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  publishDueCmsContent: vi.fn(),
}));

vi.mock('../_core/sdk', () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock('../services/content/deferredPublicationService', () => ({
  publishDueCmsContent: mocks.publishDueCmsContent,
}));

import { createCmsPublishingScheduledRouter } from './cmsPublishingScheduledRoute';

const qualitySource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/quality.ts'),
  'utf8'
);
const deferredPublicationSource = readFileSync(
  resolve(process.cwd(), 'server/services/content/deferredPublicationService.ts'),
  'utf8'
);
const pageDialogSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/dialogs/PageDialog.tsx'),
  'utf8'
);
const textDialogSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/dialogs/TextContentDialog.tsx'),
  'utf8'
);
const sectionDialogSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/dialogs/SectionDialog.tsx'),
  'utf8'
);
const imageDialogSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/dialogs/ImageUploadDialog.tsx'),
  'utf8'
);

function responseMock() {
  const response = { status: vi.fn(), json: vi.fn() };
  response.status.mockReturnValue(response);
  return response;
}

function scheduledHandler() {
  const router = createCmsPublishingScheduledRouter();
  const layer = router.stack.find((entry: any) => entry.route?.path === '/api/scheduled/cms-publish');
  return layer?.route?.stack[0]?.handle as (req: any, res: any, next: any) => Promise<void>;
}

describe('النشر المؤجل لمحتوى CMS', () => {
  it('ينفذ النشر المستحق عبر هوية مهمة Heartbeat فقط', async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: 'task_cms_001' });
    mocks.publishDueCmsContent.mockResolvedValue({ inspected: 1, published: { pages: 1 } });
    const response = responseMock();

    await scheduledHandler()({} as any, response as any, vi.fn());

    expect(mocks.publishDueCmsContent).toHaveBeenCalledWith('task_cms_001');
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: true, taskUid: 'task_cms_001' })
    );
  });

  it('يرفض الطلبات العادية ويحافظ على سلوك النشر المتكرر الآمن', async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: false });
    const response = responseMock();

    await scheduledHandler()({} as any, response as any, vi.fn());

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({ error: 'cron-only' });
    expect(deferredPublicationSource).toContain("eq(textContent.status, 'draft')");
    expect(deferredPublicationSource).toContain("set({ status: 'published' })");
    expect(deferredPublicationSource).toContain('await db.transaction');
  });

  it('يبقي فحوص الجودة المحلية مغطية الروابط والترجمة والمفاتيح', () => {
    expect(qualitySource).toContain('hasInvalidLink');
    expect(qualitySource).toContain('text-key-duplicate');
    expect(qualitySource).toContain('text-secondary-language-missing');
    expect(qualitySource).toContain('seo-secondary-language-missing');
    expect(qualitySource).toContain('section-button-link-invalid');
  });

  it('يوفر للمحرر حالة مسودة ظاهرة وخيار موعد النشر المؤجل', () => {
    expect(pageDialogSource).toContain('موعد النشر المؤجل');
    expect(pageDialogSource).toContain('type="datetime-local"');
    expect(pageDialogSource).toContain('جاري حفظ المسودة');
    expect(pageDialogSource).toContain('المسودة مجدولة للنشر');
  });

  it('يوحد أدوات الجدولة المرئية في محررات النص والقسم والصورة', () => {
    for (const source of [textDialogSource, sectionDialogSource, imageDialogSource]) {
      expect(source).toContain('موعد النشر المؤجل');
      expect(source).toContain('type="datetime-local"');
      expect(source).toContain('جاري حفظ المسودة');
    }
  });
});
