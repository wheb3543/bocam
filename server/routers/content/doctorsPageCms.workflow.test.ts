import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const doctorsPageSource = source('client/src/pages/public/Doctors.tsx');

describe('تكامل CMS لصفحة الأطباء', () => {
  it('يقرأ SEO المنشور والنصوص التحريرية من CMS مع قيم احتياطية آمنة', () => {
    expect(doctorsPageSource).toContain("usePublicSEOSettings({ slug: 'doctors', language })");
    expect(doctorsPageSource).toContain('doctorsSEO?.title');
    expect(doctorsPageSource).toContain('doctors.title.${language}');
    expect(doctorsPageSource).toContain('doctors.description.${language}');
    expect(doctorsPageSource).toContain('doctors.badge.${language}');
    expect(doctorsPageSource).toContain('doctors.search.placeholder.${language}');
    expect(doctorsPageSource).toContain('doctors.filter.all.${language}');
    expect(doctorsPageSource).toContain('doctors.empty.title.${language}');
    expect(doctorsPageSource).toContain('doctors.booking.cta.${language}');
  });

  it('يبقي قائمة الأطباء ومعلوماتهم التشغيلية من وحدة الأطباء المتخصصة', () => {
    expect(doctorsPageSource).toContain('trpc.doctors.list.useQuery()');
    expect(doctorsPageSource).toContain('doctor.available !== \'yes\'');
    expect(doctorsPageSource).toContain('setLocation(`/doctors/${doctor.slug}`)');
  });
});
