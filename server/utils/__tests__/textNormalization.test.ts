import { describe, it, expect } from 'vitest';
import { normalizeArabicText } from '../textNormalization';

describe('normalizeArabicText (تطبيع النصوص العربية)', () => {
  it('يعيد نص فارغ عند تمرير قيمة فارغة أو غير معرّفة', () => {
    expect(normalizeArabicText('')).toBe('');
    expect(normalizeArabicText(null)).toBe('');
    expect(normalizeArabicText(undefined)).toBe('');
  });

  it('يوحد أشكال الألف المختلفة (أ، إ، آ، ٱ) إلى ألف مجردة (ا)', () => {
    expect(normalizeArabicText('أحمد')).toBe('احمد');
    expect(normalizeArabicText('إبراهيم')).toBe('ابراهيم');
    expect(normalizeArabicText('آدم')).toBe('ادم');
  });

  it('يوحد التاء المربوطة (ة) إلى (ه) والياء المقصورة (ى) إلى (ي)', () => {
    expect(normalizeArabicText('فاطمة')).toBe('فاطمه');
    expect(normalizeArabicText('منى')).toBe('مني');
    expect(normalizeArabicText('مستشفى')).toBe('مستشفي');
  });

  it('يزيل علامات التشكيل والتنوين والكشيدة', () => {
    expect(normalizeArabicText('مُحَمَّدٌ')).toBe('محمد');
    expect(normalizeArabicText('خـالـد')).toBe('خالد');
  });

  it('يزيل المسافات الزائدة ويضغط المسافات المتعددة', () => {
    expect(normalizeArabicText('  علي   محمد   حسن  ')).toBe('علي محمد حسن');
  });

  it('يطابق أسماء أفراد العائلة المدخلة بصيغ مختلفة لنفس الشخص', () => {
    const name1 = normalizeArabicText('أحمد علي بن عيسى');
    const name2 = normalizeArabicText('احمد علي بن عيسي');
    expect(name1).toBe(name2);

    const name3 = normalizeArabicText('فاطمة الزهراء');
    const name4 = normalizeArabicText('فاطمه الزهراء');
    expect(name3).toBe(name4);
  });
});
