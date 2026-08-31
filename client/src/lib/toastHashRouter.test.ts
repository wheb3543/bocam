import { afterEach, describe, expect, it } from 'vitest';
import { consumeToastHash, parseToastHash } from './toastHashRouter';

describe('toastHashRouter', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('parses a toast payload from a hash route', () => {
    expect(
      parseToastHash('#/toast/success?message=تم+الحفظ&description=تم+تحديث+المحتوى&redirect=/admin/content/content')
    ).toEqual({
      kind: 'success',
      message: 'تم الحفظ',
      description: 'تم تحديث المحتوى',
      redirect: '/admin/content/content',
      autoNavigate: true,
    });
  });

  it('consumes the hash payload and clears the hash after reading it', () => {
    window.history.pushState(
      {},
      '',
      '/#/toast/error?message=فشل+الحفظ&redirect=/admin/whatsapp'
    );

    const payload = consumeToastHash();

    expect(payload).toEqual({
      kind: 'error',
      message: 'فشل الحفظ',
      redirect: '/admin/whatsapp',
      autoNavigate: true,
    });
    expect(window.location.hash).toBe('');
  });
});
