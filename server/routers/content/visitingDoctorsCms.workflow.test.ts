import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/VisitingDoctors.tsx'),
  'utf8'
);

describe('تكامل CMS لصفحة الأطباء الزائرين', () => {
  it('يجلب نصوص الصفحة من محتوى القسم المنشور مع قيم احتياطية', () => {
    expect(pageSource).toContain("usePublicPageContent('visiting-doctors', language)");
    expect(pageSource).toContain('visitingDoctors.title.${language}');
    expect(pageSource).toContain('visitingDoctors.search.placeholder.${language}');
    expect(pageSource).toContain('visitingDoctors.empty.search.title.${language}');
    expect(pageSource).toContain('visitingDoctors.allDoctors.cta.${language}');
    expect(pageSource).toContain('visitingDoctors.booking.cta.${language}');
  });

  it('يبقي قائمة الأطباء الزائرين مستندة إلى وحدة الأطباء ومرشح التوفر', () => {
    expect(pageSource).toContain('trpc.doctors.list.useQuery()');
    expect(pageSource).toContain("doctor.isVisiting === 'yes' && doctor.available === 'yes'");
  });
});
