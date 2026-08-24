import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const offerDetailSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/OfferDetailPage.tsx'),
  'utf8'
);
const campDetailSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/CampDetailPage.tsx'),
  'utf8'
);

describe('تكامل CMS لصفحات التفاصيل', () => {
  it('يبقي نصوص صفحة تفاصيل العرض قابلة للإدارة عبر مفاتيح CMS', () => {
    expect(offerDetailSource).toContain('offers.detail.hero.badge.${language}');
    expect(offerDetailSource).toContain('offers.detail.included.title.${language}');
    expect(offerDetailSource).toContain('offers.detail.form.submit.${language}');
    expect(offerDetailSource).toContain('offers.detail.contact.whatsapp.message.${language}');
    expect(offerDetailSource).toContain('trpc.offers.getBySlug.useQuery');
  });

  it('ينقل النصوص الثابتة في صفحة تفاصيل المخيم إلى محتوى الصفحة المنشور', () => {
    expect(campDetailSource).toContain("usePublicPageContent('camps', language)");
    expect(campDetailSource).toContain('camps.detail.${key}.${language}');
    expect(campDetailSource).toContain("detailText('form.submit', 'تسجيل في المخيم مجاناً')");
    expect(campDetailSource).toContain("detailText('contact.whatsapp.message', 'مرحباً، أود الاستفسار عن المخيم الطبي')");
    expect(campDetailSource).toContain('trpc.camps.getBySlug.useQuery');
    expect(campDetailSource).toContain('trpc.campRegistrations.submit.useMutation');
  });
});
