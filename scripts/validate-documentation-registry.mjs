import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registryPath = path.join(root, 'docs', 'DOCUMENTATION_REGISTRY.json');
const excluded = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}coverage${path.sep}`,
  `${path.sep}test-results${path.sep}`,
  `${path.sep}release${path.sep}dist${path.sep}`,
  `${path.sep}dist${path.sep}`,
  `${path.sep}build${path.sep}`,
  `${path.sep}.git${path.sep}`,
];

const allowedStatuses = new Set([
  'canonical',
  'working',
  'deprecated',
  'archived',
  'generated',
  'unclassified',
]);

function isExcluded(filePath) {
  return excluded.some((segment) => filePath.includes(segment));
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (isExcluded(filePath)) return [];
    if (entry.isDirectory()) return walk(filePath);
    return /\.(md|mdx)$/i.test(entry.name) ? [filePath] : [];
  });
}

function inferType(relativePath) {
  const name = path.basename(relativePath).toLowerCase();
  if (name.includes('readme')) return 'overview';
  if (name.includes('guide')) return 'guide';
  if (name.includes('policy') || name.includes('security')) return 'policy';
  if (name.includes('architecture') || name.includes('schema')) return 'architecture';
  if (name.includes('report') || name.includes('audit') || name.includes('analysis'))
    return 'report';
  if (name.includes('plan') || name.includes('roadmap') || name.includes('todo')) return 'plan';
  if (name.includes('research') || relativePath.includes('research')) return 'research';
  if (name.includes('changelog')) return 'changelog';
  if (relativePath.includes('archive')) return 'archive';
  return 'reference';
}

function inferDomain(relativePath) {
  const normalized = relativePath.toLowerCase();
  const rules = [
    ['whatsapp', 'whatsapp'],
    ['social', 'social-integrations'],
    ['meta', 'social-integrations'],
    ['content', 'cms-media'],
    ['patient', 'patients'],
    ['appointment', 'appointments'],
    ['campaign', 'campaigns-leads'],
    ['lead', 'campaigns-leads'],
    ['task', 'tasks-teams-notifications'],
    ['notification', 'tasks-teams-notifications'],
    ['performance', 'analytics-tracking'],
    ['tracking', 'analytics-tracking'],
    ['test', 'testing-quality'],
    ['coverage', 'testing-quality'],
    ['deploy', 'operations'],
    ['docker', 'operations'],
    ['maintenance', 'operations'],
    ['license', 'security-licensing'],
    ['security', 'security-licensing'],
    ['rbac', 'authentication-rbac'],
    ['auth', 'authentication-rbac'],
    ['schema', 'data'],
    ['database', 'data'],
    ['api', 'api'],
    ['architecture', 'architecture'],
    ['installation', 'getting-started'],
    ['quick', 'getting-started'],
    ['development', 'development'],
    ['contribut', 'development'],
    ['research', 'research'],
    ['implementation', 'project-management'],
    ['plan', 'project-management'],
  ];
  return rules.find(([needle]) => normalized.includes(needle))?.[1] ?? 'unclassified';
}

function inferStatus(relativePath) {
  if (relativePath.includes('archive')) return 'archived';
  if (relativePath.includes('coverage') || relativePath.includes('UNUSED_EXPORTS_AUDIT'))
    return 'generated';
  if (relativePath.includes('DOCUMENTATION_')) return 'working';
  return 'unclassified';
}

function titleFromFile(relativePath) {
  const basename = path.basename(relativePath, path.extname(relativePath));
  return basename.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const files = walk(root)
  .map((filePath) => path.relative(root, filePath).split(path.sep).join('/'))
  .sort();

const entries = files.map((relativePath) => ({
  path: relativePath,
  title: titleFromFile(relativePath),
  language: 'mixed',
  domain: inferDomain(relativePath),
  document_type: inferType(relativePath),
  status: inferStatus(relativePath),
  audience: 'unclassified',
  owner: 'unassigned',
  source_code_paths: [],
  test_paths: [],
  related_documents: [],
  supersedes: null,
  last_reviewed: null,
  review_due: null,
  evidence_level: 'inventory-only',
  notes: 'Generated baseline; domain and ownership require phase review.',
}));

if (process.argv.includes('--write')) {
  fs.writeFileSync(
    registryPath,
    `${JSON.stringify({ schema_version: 1, generated_at: new Date().toISOString(), entries }, null, 2)}\n`
  );
  console.log(
    `Wrote ${entries.length} documentation records to ${path.relative(root, registryPath)}`
  );
} else if (!fs.existsSync(registryPath)) {
  console.error(`Missing ${path.relative(root, registryPath)}. Run with --write first.`);
  process.exitCode = 1;
}

if (fs.existsSync(registryPath)) {
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const registryPaths = new Set(registry.entries.map((entry) => entry.path));
  const missing = files.filter((filePath) => !registryPaths.has(filePath));
  const invalidStatuses = registry.entries.filter((entry) => !allowedStatuses.has(entry.status));
  const invalidPaths = registry.entries.filter(
    (entry) => !fs.existsSync(path.join(root, entry.path))
  );
  if (missing.length || invalidStatuses.length || invalidPaths.length) {
    console.error(JSON.stringify({ missing, invalidStatuses, invalidPaths }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Documentation registry valid: ${registry.entries.length} records.`);
  }
}
