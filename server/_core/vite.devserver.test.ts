import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const viteServerSource = readFileSync(
  resolve(process.cwd(), 'server/_core/vite.ts'),
  'utf8'
);

describe('إعداد خادم Vite المحلي', () => {
  it('يحمّل إعداد Vite الرئيسي الذي يحدد جذر client ومسارات alias', () => {
    expect(viteServerSource).toContain("configFile: path.resolve(import.meta.dirname, '../..', 'vite.config.ts')");
    expect(viteServerSource).not.toContain('configFile: false');
  });
});
