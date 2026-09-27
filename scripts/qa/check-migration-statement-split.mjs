/**
 * فحص تقسيم عبارات SQLMigration كما ينفّذها مشغّل الترحيلات فعلياً.
 * أداة تحقّق محلية: node scripts/qa/check-migration-statement-split.mjs [file...]
 */
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

/**
 * ملفات الترحيل المجمّدة التي يتجاوزها المشغّل عمداً.
 * نحاكي نفس سلوك scripts/database/run-migrations.mjs حتى لا نرصد إنذارات
 * على ملفات لا تُنفَّذ أصلاً.
 */
const FROZEN_MIGRATIONS = new Set(['add_performance_indexes.sql', 'fix_pages_column_order.sql']);

/** نفس منطق التقسيم المستخدم في scripts/database/run-migrations.mjs */
function splitStatements(sql) {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));
}

const root = process.cwd();
const migrationDir = join(root, 'server/database/migrations');
const targets = process.argv.slice(2);
const files = (
  targets.length
    ? targets
    : readdirSync(migrationDir)
        .filter((f) => f.endsWith('.sql'))
        .map((f) => join(migrationDir, f))
).filter((file) => !FROZEN_MIGRATIONS.has(basename(file)));

let problems = 0;

for (const file of files) {
  const sql = readFileSync(file, 'utf8');
  const statements = splitStatements(sql);
  const bare = statements.filter(
    (s) => !/^\s*(\/\*|CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|SET)/i.test(s)
  );

  console.log(`\n=== ${file.replace(`${root}/`, '')} ===`);
  console.log(`    العبارات المنفذة: ${statements.length}`);

  statements.forEach((statement, index) => {
    const preview = statement.replace(/\s+/g, ' ').slice(0, 64);
    console.log(`    [${index}] ${preview}`);
  });

  if (bare.length > 0) {
    problems += bare.length;
    console.log(`    ⚠️  عبارات لا تبدأ بأمر SQL معروف:`);
    bare.forEach((s) => console.log(`       -> ${s.replace(/\s+/g, ' ').slice(0, 90)}`));
  }
}

if (problems > 0) {
  console.error(`\n❌ عدد العبارات المشكوك فيها: ${problems}`);
  process.exit(1);
}
console.log('\n✅ كل ملفات الترحيل تُقسَّم إلى عبارات SQL صالحة.');
