import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/OffersListPage.tsx'),
  'utf8'
);

describe('تكامل CMS لصفحة العروض', () => {
  it('يستدعي مفاتيح CMS لكل نصوص البطل والبحث والتبويبات والحالات والبطاقات', () => {
    expect(pageSource).toContain('offers.list.hero.title.${language}');
    expect(pageSource).toContain('offers.list.hero.description.${language}');
    expect(pageSource).toContain('offers.list.search.placeholder.${language}');
    expect(pageSource).toContain('offers.list.tab.active.${language}');
    expect(pageSource).toContain('offers.list.empty.active.title.${language}');
    expect(pageSource).toContain('offers.list.card.special.${language}');
    expect(pageSource).toContain('offers.list.card.view.details.${language}');
    expect(pageSource).toContain('offers.list.card.valid.until.${language}');
  });

  it('يبقي بيانات العرض التشغيلية مستندة إلى وحدة العروض', () => {
    expect(pageSource).toContain('trpc.offers.getAll.useQuery()');
    expect(pageSource).toContain('setLocation(`/offers/${offer.slug || offer.id}`)');
  });
});
