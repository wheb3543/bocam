/**
 * Documentation Registry Maintenance
 * أداة صيانة سجل التوثيق
 *
 * تضيف ملف Markdown غير مسجّل إلى docs/DOCUMENTATION_REGISTRY.json دون فقدان
 * أي حقول قائمة، مع ترتيب السجل أبجدياً والمسارات كوحدة واحدة.
 *
 * الاستخدام:
 *   node scripts/qa/register-doc.mjs <path> [key=value ...]
 *
 * مثال:
 *   node scripts/qa/register-doc.mjs AAGENTS.md title="BOCAM guidelines" \
 *     domain=architecture document_type=guide status=canonical audience=engineering owner=platform
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REGISTRY_PATH = resolve(process.cwd(), 'docs/DOCUMENTATION_REGISTRY.json');

const [docPath, ...keyValues] = process.argv.slice(2);

if (!docPath) {
  console.error('❌ الاستخدام: node scripts/qa/register-doc.mjs <path> [key=value ...]');
  process.exit(1);
}

const ALLOWED_STATUS = new Set([
  'canonical',
  'working',
  'deprecated',
  'archived',
  'generated',
  'unclassified',
]);

/** خيارات افتراضية تُستخدم لكل حقل في سجل التوثيق. */
const DEFAULTS = {
  title: 'Untitled',
  language: 'mixed',
  domain: 'unclassified',
  document_type: 'reference',
  status: 'unclassified',
  audience: 'unclassified',
  owner: 'unassigned',
};

const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
const entries = Array.isArray(registry.entries) ? registry.entries : [];

const overrides = {};
for (const pair of keyValues) {
  const separator = pair.indexOf('=');
  if (separator === -1) {
    console.error(`❌ تنسيق غير صحيح: ${pair} (المتوقع key=value)`);
    process.exit(1);
  }
  overrides[pair.slice(0, separator)] = pair.slice(separator + 1);
}

if (!ALLOWED_STATUS.has(overrides.status ?? DEFAULTS.status)) {
  console.error(
    `❌ حالة غير صالحة: ${overrides.status}. المسموح: ${[...ALLOWED_STATUS].join(', ')}`
  );
  process.exit(1);
}

const existingIndex = entries.findIndex((entry) => entry.path === docPath);

if (existingIndex !== -1) {
  // نحدّث الحقول الممرّرة فقط مع الحفاظ على أي بيانات يدوية موجودة.
  const merged = { ...entries[existingIndex], ...DEFAULTS, ...overrides };
  entries[existingIndex] = merged;
} else {
  entries.push({
    path: docPath,
    ...DEFAULTS,
    ...overrides,
    source_code_paths: [],
    test_paths: [],
    related_documents: [],
    supersedes: null,
    last_reviewed: null,
    review_due: null,
    evidence_level: 'inventory-only',
    notes: 'Registered via scripts/qa/register-doc.mjs',
  });
}

/**
 * نزيل المسارات التي لم تعد موجودة على القرص. مستند التوجيه كان مسجلاً
 * بمسار مطبعي «AGENTS.md» بينما اسم الملف الفعلي «AAGENTS.md»، وهو ما كان
 * يُفشل بوابة docs:check.
 */
const removed = entries.filter((entry) => !existsSync(resolve(process.cwd(), entry.path)));
if (removed.length > 0) {
  for (const stale of removed) {
    console.log(`🧹 إزالة مسار غير موجود على القرص: ${stale.path}`);
  }
  for (const stale of removed) {
    const index = entries.findIndex((entry) => entry.path === stale.path);
    if (index !== -1) {
      entries.splice(index, 1);
    }
  }
}

// ندمج السجل مع الحفاظ على ترتيب JSON الأصلي للأدوات الأخرى.
const updated = {
  ...registry,
  generated_at: registry.generated_at,
  entries: [...entries].sort((a, b) => a.path.localeCompare(b.path)),
};

writeFileSync(REGISTRY_PATH, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');

console.log(`✅ تم تسجيل ${docPath} — إجمالي السجل: ${updated.entries.length} مستند.`);
