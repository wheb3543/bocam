import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coveragePath = path.join(root, 'coverage', 'coverage-final.json');
const baselinePath = path.join(root, 'docs', 'COVERAGE_BASELINE.json');
const reportPath = path.join(root, 'docs', 'COVERAGE_BASELINE.md');

const criticalPatterns = [
  ['License', /server\/(_core\/license|_core\/license\.ts)/],
  ['Role permissions', /server\/services\/rolePermissionService\.ts$/],
  ['Authentication and authorization', /server\/_core\/(auth|featureMiddleware)\.ts$/],
  ['CMS routers', /server\/routers\/content\/.*\.ts$/],
  ['Admin dashboard', /client\/src\/pages\/admin\/AdminDashboard\.tsx$/],
  ['Patient portal', /client\/src\/pages\/patient-portal\/.*\.(ts|tsx)$/],
];

function loadCoverage() {
  if (!fs.existsSync(coveragePath)) {
    throw new Error('coverage/coverage-final.json not found. Run pnpm test:coverage first.');
  }
  return JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
}

function emptyMetrics() {
  return { files: 0, statements: 0, branches: 0, functions: 0, lines: 0 };
}

function addMetricCounts(target, file) {
  for (const [key, counts] of [
    ['statements', file.s],
    ['branches', file.b],
    ['functions', file.f],
    ['lines', file.s],
  ]) {
    const values = Object.values(counts ?? {});
    target[`${key}Total`] = (target[`${key}Total`] ?? 0) + values.length;
    target[`${key}Covered`] =
      (target[`${key}Covered`] ?? 0) + values.filter((count) => count > 0).length;
  }
}

function finalizeMetrics(metrics) {
  for (const key of ['statements', 'branches', 'functions', 'lines']) {
    const total = metrics[`${key}Total`] ?? 0;
    const covered = metrics[`${key}Covered`] ?? 0;
    metrics[key] = total === 0 ? 100 : Number(((covered / total) * 100).toFixed(2));
    delete metrics[`${key}Total`];
    delete metrics[`${key}Covered`];
  }
  return metrics;
}

function collectMetrics() {
  const coverage = loadCoverage();
  const entries = Object.entries(coverage).map(([filePath, file]) => [
    filePath.replace(`${root}${path.sep}`, '').replaceAll(path.sep, '/'),
    file,
  ]);
  const groups = {
    overall: entries,
    client: entries.filter(([filePath]) => filePath.startsWith('client/')),
    server: entries.filter(([filePath]) => filePath.startsWith('server/')),
    critical: [],
  };

  for (const [name, pattern] of criticalPatterns) {
    const files = entries.filter(([filePath]) => pattern.test(filePath));
    groups.critical.push({ name, files });
  }

  const summarize = (files) => {
    const metrics = { ...emptyMetrics(), files: files.length };
    for (const [, file] of files) addMetricCounts(metrics, file);
    return finalizeMetrics(metrics);
  };

  return {
    generatedAt: new Date().toISOString(),
    source: 'coverage/coverage-final.json',
    overall: summarize(groups.overall),
    client: summarize(groups.client),
    server: summarize(groups.server),
    critical: groups.critical.map(({ name, files }) => ({
      name,
      ...summarize(files),
      paths: files.map(([filePath]) => filePath),
    })),
  };
}

function renderReport(metrics) {
  return `# Coverage Baseline

> تم توليد هذا الملف بواسطة \`pnpm coverage:baseline\` من \`coverage/coverage-final.json\`.

**آخر قياس:** ${metrics.generatedAt}

## التغطية العامة

| النطاق | Statements | Branches | Functions | Lines | الملفات |
|---|---:|---:|---:|---:|---:|
| المشروع | ${metrics.overall.statements.toFixed(2)}% | ${metrics.overall.branches.toFixed(2)}% | ${metrics.overall.functions.toFixed(2)}% | ${metrics.overall.lines.toFixed(2)}% | ${metrics.overall.files} |
| client | ${metrics.client.statements.toFixed(2)}% | ${metrics.client.branches.toFixed(2)}% | ${metrics.client.functions.toFixed(2)}% | ${metrics.client.lines.toFixed(2)}% | ${metrics.client.files} |
| server | ${metrics.server.statements.toFixed(2)}% | ${metrics.server.branches.toFixed(2)}% | ${metrics.server.functions.toFixed(2)}% | ${metrics.server.lines.toFixed(2)}% | ${metrics.server.files} |

## المسارات الحرجة

| المسار | Statements | Branches | Functions | Lines | الملفات |
|---|---:|---:|---:|---:|---:|
${metrics.critical.map((group) => `| ${group.name} | ${group.statements.toFixed(2)}% | ${group.branches.toFixed(2)}% | ${group.functions.toFixed(2)}% | ${group.lines.toFixed(2)}% | ${group.files} |`).join('\n')}

تشمل المسارات الحرجة الترخيص، المصادقة والصلاحيات، RBAC، CMS، لوحة الإدارة، وبوابة المريض. يستخدم CI ملف JSON للمقارنة، ويوقف الدمج إذا انخفضت أي نسبة دون تحديث baseline بمراجعة مقصودة.
`;
}

const metrics = collectMetrics();
const mode = process.argv[2] ?? 'baseline';

if (mode === 'check') {
  if (!fs.existsSync(baselinePath)) throw new Error(`Missing ${baselinePath}`);
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const scopes = ['overall', 'client', 'server'];
  const failures = [];
  for (const scope of scopes) {
    for (const metric of ['statements', 'branches', 'functions', 'lines']) {
      if (metrics[scope][metric] < baseline[scope][metric]) {
        failures.push(`${scope}.${metric}: ${metrics[scope][metric]} < ${baseline[scope][metric]}`);
      }
    }
  }
  for (const current of metrics.critical) {
    const previous = baseline.critical.find((group) => group.name === current.name);
    if (!previous) continue;
    for (const metric of ['statements', 'branches', 'functions', 'lines']) {
      if (current[metric] < previous[metric]) {
        failures.push(
          `critical.${current.name}.${metric}: ${current[metric]} < ${previous[metric]}`
        );
      }
    }
  }
  if (failures.length > 0) {
    console.error('Coverage is below the committed baseline:\n' + failures.join('\n'));
    process.exit(1);
  }
  console.log('Coverage meets or exceeds the committed baseline.');
} else {
  fs.writeFileSync(baselinePath, `${JSON.stringify(metrics, null, 2)}\n`);
  fs.writeFileSync(reportPath, renderReport(metrics));
  console.log(
    `Generated ${path.relative(root, baselinePath)} and ${path.relative(root, reportPath)}`
  );
}
