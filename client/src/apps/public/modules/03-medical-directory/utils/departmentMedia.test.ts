/**
 * اختبارات departmentMedia
 * Department Media Resolver Tests
 *
 * تضمن أن كل قسم طبي يُعرض في صفحة الأقسام يحصل على صورة رسمية مناسبة،
 * مع وجود صورة احتياطية موحدة لأي قسم جديد لا توجد له صورة مخصصة.
 */

import { describe, it, expect } from 'vitest';
import { resolveDepartmentImage, DEFAULT_DEPARTMENT_IMAGE } from './departmentMedia';

describe('resolveDepartmentImage', () => {
  it('يعطي الأولوية للصورة التي يديرها المشرف من لوحة الأقسام', () => {
    expect(
      resolveDepartmentImage({
        image: '  /uploads/departments/custom-cardiology.jpg  ',
        slug: 'cardiology-cardiothoracic',
        name: 'قسم القلب',
      })
    ).toBe('/uploads/departments/custom-cardiology.jpg');

    expect(
      resolveDepartmentImage({
        image: 'https://cdn.example.com/departments/emergency.webp',
        slug: 'emergency-department',
      })
    ).toBe('https://cdn.example.com/departments/emergency.webp');
  });

  it('يعيد الصورة الرسمية للأقسام المعروفة عبر الرابط التعريفي (slug)', () => {
    expect(resolveDepartmentImage({ slug: 'dermatology-and-cosmetics' })).toBe(
      '/sgh/departments/dermatology.jpg'
    );
    expect(resolveDepartmentImage({ slug: 'cardiology-cardiothoracic' })).toBe(
      '/sgh/departments/cardiology.jpg'
    );
    expect(resolveDepartmentImage({ slug: 'emergency-department' })).toBe(
      '/sgh/departments/emergency.jpg'
    );
  });

  it('يطابق الروابط التعريفية بشكل غير حساس لحالة الأحرف والمسافات', () => {
    expect(resolveDepartmentImage({ slug: '  UROLOGY  ' })).toBe('/sgh/departments/urology.jpg');
  });

  it('يعتمد على الاسم العربي عند عدم تطابق الرابط التعريفي', () => {
    expect(resolveDepartmentImage({ slug: 'unknown-slug', name: 'قسم الطوارئ' })).toBe(
      '/sgh/departments/emergency.jpg'
    );
    expect(resolveDepartmentImage({ name: 'قسم الأوعية الدموية' })).toBe(
      '/sgh/departments/vascular.jpg'
    );
  });

  it('يعتمد على الاسم الإنجليزي أو الأيقونة كخطوة احتياطية', () => {
    expect(resolveDepartmentImage({ nameEn: 'Pediatrics & Neonatology' })).toBe(
      '/sgh/departments/pediatrics.jpg'
    );
    expect(resolveDepartmentImage({ icon: 'Stethoscope', name: 'قسم جراحي جديد' })).toBe(
      '/sgh/departments/surgery.jpg'
    );
  });

  it('يعيد الصورة الاحتياطية الموحدة عند عدم توفر أي مطابقة', () => {
    expect(resolveDepartmentImage({ slug: 'brand-new-unit', name: 'وحدة جديدة' })).toBe(
      DEFAULT_DEPARTMENT_IMAGE
    );
    expect(resolveDepartmentImage({})).toBe(DEFAULT_DEPARTMENT_IMAGE);
  });

  it('يغطي كل الأقسام الاثني عشر الواردة من الموقع المرجعي بصور رسمية', () => {
    const departments = [
      { slug: 'dermatology-and-cosmetics', name: 'الأمراض الجلدية والتجميل' },
      { slug: 'anesthesia-pain-management', name: 'التخدير وإدارة الألم' },
      { slug: 'general-surgery', name: 'الجراحة العامة والتخصصية' },
      { slug: 'internal-medicine', name: 'الطب الباطني' },
      { slug: 'psychiatry-behavioral-health', name: 'الطب النفسي والصحة السلوكية' },
      { slug: 'pediatrics-neonatology', name: 'طب الأطفال وحديثي الولادة' },
      { slug: 'orthopedics-trauma', name: 'طب العظام ورعاية الإصابات' },
      { slug: 'cardiology-cardiothoracic', name: 'طب القلب وجراحة القلب والصدر' },
      { slug: 'obstetrics-gynecology', name: 'قسم أمراض النساء والتوليد' },
      { slug: 'emergency-department', name: 'قسم الطوارئ' },
      { slug: 'urology', name: 'قسم المسالك البولية' },
      { slug: 'vascular-surgery', name: 'قسم الأوعية الدموية' },
    ];

    const images = departments.map((department) => resolveDepartmentImage(department));

    images.forEach((image) => {
      expect(image).not.toBe(DEFAULT_DEPARTMENT_IMAGE);
      expect(image.startsWith('/sgh/departments/')).toBe(true);
    });

    // يجب أن تكون الصور فريدة لكل قسم (ما عدا الصور المتشابهة بالتصميم)
    expect(new Set(images).size).toBeGreaterThanOrEqual(10);
  });
});
