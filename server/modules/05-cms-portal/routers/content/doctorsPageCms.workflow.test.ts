import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const doctorsPageSource = source('client/src/apps/public/modules/03-medical-directory/pages/DoctorsListPage.tsx');

describe('تكامل CMS لصفحة الأطباء', () => {
  it('يقرأ SEO المنشور والنصوص التحريرية من CMS مع قيم احتياطية آمنة', () => {
    expect(doctorsPageSource).toContain("usePublicSEOSettings({ slug: 'doctors', language })");
    expect(doctorsPageSource).toContain('doctorsSEO?.title');
    expect(doctorsPageSource).toContain('doctorsSEO?.description');
    expect(doctorsPageSource).toContain('doctorsSEO?.keywords');
    // بعد تحويل الصفحة لاستخدام PageLayout، لم تعد تستخدم نمط المفاتيح المباشر
    // يتم الآن استخدام usePublicSEOSettings لجلب البيانات من CMS
    expect(doctorsPageSource).toContain('PageLayout');
    expect(doctorsPageSource).toContain('useContainer={true}');
  });

  it('يبقي قائمة الأطباء ومعلوماتهم التشغيلية من وحدة الأطباء المتخصصة', () => {
    expect(doctorsPageSource).toContain('trpc.doctors.list.useQuery()');
    expect(doctorsPageSource).toContain('doctor.available !== \'yes\'');
    expect(doctorsPageSource).toContain('setLocation(`/doctors/${doctor.slug}`)');
  });
});
