import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const tokens = readSource('client/src/index.css');
const guide = readSource('docs/sgh-design-system.md');
const header = readSource('client/src/components/layout/AdminPageHeader.tsx');
const drawer = readSource('client/src/components/AllToolsDrawer.tsx');
const cookieBanner = readSource('client/src/components/CookieConsentBanner.tsx');

describe('P3 SGH design-system foundation', () => {
  it('defines semantic brand, surface, status, focus, and touch-target tokens', () => {
    expect(tokens).toContain('--color-brand: var(--brand);');
    expect(tokens).toContain('--color-status-success: var(--status-success);');
    expect(tokens).toContain('--color-status-warning: var(--status-warning);');
    expect(tokens).toContain('--touch-target-min: 2.75rem;');
    expect(tokens).toContain('.sgh-focus-ring');
    expect(tokens).toContain('.sgh-touch-target');
  });

  it('documents semantic-color and accessible interaction rules', () => {
    expect(guide).toContain('نواة نظام تصميم SGH CRM');
    expect(guide).toContain('bg-brand');
    expect(guide).toContain('44 بكسل');
  });

  it('uses semantic tokens in shared headers, navigation, and consent controls', () => {
    expect(header).toContain('bg-surface-raised');
    expect(header).toContain('text-brand');
    expect(drawer).toContain('bg-status-info-subtle');
    expect(cookieBanner).toContain('bg-brand-green');
    expect(cookieBanner).toContain('bg-status-success');
  });
});
