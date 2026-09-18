import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Reads source file content, transparently following re-export bridges
 * to their modular destination files.
 */
export function readSourceFile(relativePathOrAbsolute: string): string {
  const fullPath = relativePathOrAbsolute.startsWith('/')
    ? relativePathOrAbsolute
    : resolve(process.cwd(), relativePathOrAbsolute);

  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  const content = readFileSync(fullPath, 'utf8');

  // Check if this file is a re-export bridge
  if (
    content.includes('@deprecated Re-export bridge') ||
    /export\s+(?:\*|\{[^}]*\})\s+from\s+['"]@(?:apps|core)\//.test(content)
  ) {
    const bridgeMatch = content.match(
      /export\s+(?:\*|\{[^}]*\})\s+from\s+['"](@(?:apps|core)\/[^'"]+)['"]/
    );
    if (bridgeMatch) {
      const alias = bridgeMatch[1];
      const resolved = alias
        .replace(/^@apps\//, 'client/src/apps/')
        .replace(/^@core\//, 'client/src/core/');

      let target = resolve(process.cwd(), resolved);
      if (!existsSync(target)) {
        if (existsSync(`${target}.tsx`)) {
          target = `${target}.tsx`;
        } else if (existsSync(`${target}.ts`)) {
          target = `${target}.ts`;
        } else if (existsSync(resolve(target, 'index.tsx'))) {
          target = resolve(target, 'index.tsx');
        } else if (existsSync(resolve(target, 'index.ts'))) {
          target = resolve(target, 'index.ts');
        }
      }

      if (existsSync(target)) {
        return readSourceFile(target);
      }
    }
  }

  return content;
}
