import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const navbarSource = readSource('client/src/components/layout/Navbar.tsx');
const footerSource = readSource('client/src/components/layout/Footer.tsx');
const homePageSource = readSource('client/src/pages/public/HomePage.tsx');
const cookieBannerSource = readSource('client/src/components/CookieConsentBanner.tsx');

describe('P2 public interface refinement', () => {
  it('keeps public booking and contact calls-to-action as semantic, touch-friendly links', () => {
    expect(homePageSource).toContain('asChild');
    expect(homePageSource).toContain('min-h-[620px]');
    expect(homePageSource).toContain('focus-visible:ring-offset-green-700');
    expect(homePageSource).toContain('href={`tel:${COMPANY_PHONE}`}');
  });

  it('uses accessible public navigation and footer targets that preserve SGH identity', () => {
    expect(navbarSource).toContain('min-h-11 min-w-11');
    expect(navbarSource).toContain('min-h-11 items-center');
    expect(navbarSource).toContain('COMPANY_ARABIC_NAME');
    expect(footerSource).toContain('min-h-11 items-center');
    expect(footerSource).toContain('bg-green-900');
  });

  it('provides a mobile-friendly cookie-preference dialog with explicit controls', () => {
    expect(cookieBannerSource).toContain('aria-controls="cookie-preferences-details"');
    expect(cookieBannerSource).toContain('id="cookie-preferences-details"');
    expect(cookieBannerSource).toContain('min-h-11 flex-1');
    expect(cookieBannerSource).toContain('h-11 w-12');
    expect(cookieBannerSource).toContain('safe-area-inset-bottom');
  });
});
