import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/CampsListPage.tsx'),
  'utf8'
);

describe('تكامل CMS لصفحة المخيمات', () => {
  it('يستدعي مفاتيح CMS لكل نصوص البطل والتعريف والبحث والحالات والبطاقات', () => {
    expect(pageSource).toContain('camps.title.${language}');
    expect(pageSource).toContain('camps.about.description.${language}');
    expect(pageSource).toContain('camps.search.placeholder.${language}');
    expect(pageSource).toContain('camps.empty.active.title.${language}');
    expect(pageSource).toContain('camps.card.charity.badge.${language}');
    expect(pageSource).toContain('camps.card.registrations.${language}');
    expect(pageSource).toContain('camps.card.register.${language}');
  });

  it('يبقي بيانات المخيمات والتسجيلات مستندة إلى وحداتها التشغيلية', () => {
    expect(pageSource).toContain('trpc.camps.getAll.useQuery()');
    expect(pageSource).toContain('trpc.campRegistrations.list.useQuery');
    expect(pageSource).toContain('setLocation(`/camps/${camp.slug || camp.id}`)');
  });
});
