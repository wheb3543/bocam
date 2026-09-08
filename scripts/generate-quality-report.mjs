import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'PROJECT_QUALITY_CURRENT.md');
const excludedDirectories = new Set(['node_modules', 'coverage', 'dist', '.git']);
const sourceRoots = [
  'client/src',
  'server',
  'shared',
  'drizzle',
  'e2e',
  'scripts',
  'tools',
  'types',
];
const codeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (excludedDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function countLines(filePath) {
  return fs.readFileSync(filePath, 'utf8').split('\n').length;
}

function countTests(files) {
  return files.reduce((count, filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    return count + (source.match(/\b(?:it|test)\s*\(/g) ?? []).length;
  }, 0);
}

function collectMetrics() {
  const allFiles = walk(root).filter(
    (filePath) => !filePath.startsWith(path.join(root, 'test-results')) && filePath !== outputPath
  );
  const sourceFiles = sourceRoots.flatMap((sourceRoot) => walk(path.join(root, sourceRoot)));
  const codeFiles = sourceFiles.filter((filePath) => codeExtensions.has(path.extname(filePath)));
  const testFiles = codeFiles.filter((filePath) => /\.(test|spec)\.[^.]+$/.test(filePath));
  const markdownFiles = allFiles.filter((filePath) => path.extname(filePath) === '.md');
  const schemaSource = fs.readFileSync(path.join(root, 'drizzle/schema.ts'), 'utf8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const linesByRoot = Object.fromEntries(
    sourceRoots.map((sourceRoot) => [
      sourceRoot,
      walk(path.join(root, sourceRoot))
        .filter(
          (filePath) =>
            codeExtensions.has(path.extname(filePath)) || path.extname(filePath) === '.css'
        )
        .reduce((sum, filePath) => sum + countLines(filePath), 0),
    ])
  );

  return {
    generatedAt: new Date().toISOString(),
    files: allFiles.length,
    codeFiles: codeFiles.length,
    markdownFiles: markdownFiles.length,
    testFiles: testFiles.length,
    testCases: countTests(testFiles),
    tables: (
      schemaSource.match(/export const [A-Za-z0-9_]+(?:\s*:\s*[^=]+)?\s*=\s*mysqlTable/g) ?? []
    ).length,
    migrations: walk(path.join(root, 'drizzle')).filter(
      (filePath) => path.extname(filePath) === '.sql'
    ).length,
    dependencies: Object.keys(packageJson.dependencies ?? {}).length,
    devDependencies: Object.keys(packageJson.devDependencies ?? {}).length,
    scripts: Object.keys(packageJson.scripts ?? {}).length,
    linesByRoot,
  };
}

function render(metrics) {
  const totalLines = Object.values(metrics.linesByRoot).reduce((sum, value) => sum + value, 0);
  return `# مؤشرات جودة المشروع الحالية

> هذا الملف مولد آليًا بواسطة \`pnpm quality:report\`. لا تعدّل الأرقام يدويًا؛ شغّل المولد بعد تغييرات المصدر.

**آخر توليد:** ${metrics.generatedAt}

| المؤشر | القيمة |
|---|---:|
| إجمالي الملفات المقاسة | ${metrics.files} |
| ملفات TypeScript/JavaScript | ${metrics.codeFiles} |
| ملفات Markdown | ${metrics.markdownFiles} |
| ملفات الاختبارات | ${metrics.testFiles} |
| حالات الاختبار المعلنة | ${metrics.testCases} |
| جداول Drizzle | ${metrics.tables} |
| ملفات SQL للترحيل | ${metrics.migrations} |
| dependencies | ${metrics.dependencies} |
| devDependencies | ${metrics.devDependencies} |
| scripts | ${metrics.scripts} |
| مجموع أسطر مناطق المصدر | ${totalLines} |

## الأسطر حسب المنطقة

| المنطقة | الأسطر |
|---|---:|
${Object.entries(metrics.linesByRoot)
  .map(([name, lines]) => `| \`${name}\` | ${lines} |`)
  .join('\n')}

## بوابة الجودة

القيم التشغيلية التالية يجب أن تكون خضراء في CI:

- pnpm check
- pnpm lint
- pnpm test


المؤشرات الوظيفية والتقييمات التحليلية موثقة في [PROJECT_STATISTICAL_ANALYSIS_2026-09.md](PROJECT_STATISTICAL_ANALYSIS_2026-09.md).
`;
}

const metrics = collectMetrics();
const rendered = render(metrics);
const checkOnly = process.argv.includes('--check');

if (checkOnly) {
  if (
    !fs.existsSync(outputPath) ||
    fs
      .readFileSync(outputPath, 'utf8')
      .replace(/\*\*آخر توليد:\*\* .+\n/, '**آخر توليد:** CURRENT\n') !==
      rendered.replace(/\*\*آخر توليد:\*\* .+\n/, '**آخر توليد:** CURRENT\n')
  ) {
    console.error(`Quality report is stale: ${path.relative(root, outputPath)}`);
    process.exit(1);
  }
} else {
  fs.writeFileSync(outputPath, rendered);
  console.log(`Generated ${path.relative(root, outputPath)}`);
}
