#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rawArgs = process.argv.slice(2);
if (rawArgs.length === 0) {
  console.error('Usage: node generate_alter_suggestions.cjs <report.json>');
  process.exit(1);
}
const reportPath = rawArgs[0];
if (!fs.existsSync(reportPath)) {
  console.error('Report not found:', reportPath);
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const db = process.env.DB || 'bocam_db';

function typeFromExpected(e) {
  const t = e.expectedType || 'text';
  if (t.startsWith('varchar')) return t;
  if (t === 'int') return 'int';
  if (t === 'text') return 'text';
  if (t === 'timestamp') return 'timestamp NULL';
  if (t === 'tinyint(1)') return 'tinyint(1)';
  if (t.startsWith('decimal')) return t;
  if (t === 'enum') return 'varchar(100)';
  return 'text';
}

const lines = [];
lines.push('-- ALTER suggestions generated from schema-compare report');
lines.push('-- Review carefully before applying to production. These statements add missing columns as NULLABLE where safe and only comment on type/null mismatches for manual review.');
lines.push('SET foreign_key_checks = 0;');
lines.push('USE `'+db+'`;');

for (const table of Object.keys(report.tables)) {
  const t = report.tables[table];
  if (t.missingCols && t.missingCols.length) {
    for (const c of t.missingCols) {
      // try to find expected type in diffs or leave as text
      const candidate = (t.diffs || []).find(d => d.column === c);
      const expected = candidate ? candidate.expected : null;
      const sqlType = expected ? typeFromExpected(expected) : 'text';
      lines.push(`-- Add missing column ${table}.${c}`);
      lines.push(`ALTER TABLE \`${table}\` ADD COLUMN \`${c}\` ${sqlType} NULL;`);
    }
  }
  if (t.diffs && t.diffs.length) {
    for (const d of t.diffs) {
      // only produce comments for diffs; don't auto-change types
      lines.push(`-- Column difference detected for ${table}.${d.column}`);
      lines.push(`-- expected: ${d.expected.expectedType} ${d.expected.notNull ? 'NOT NULL' : 'NULL'}; actual: ${d.actual.columnType} ${d.actual.isNullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      // propose a MODIFY line commented out for manual review
      const propType = typeFromExpected(d.expected).replace(/\s+NULL$/,'');
      lines.push(`-- Suggested (review before applying): ALTER TABLE \`${table}\` MODIFY COLUMN \`${d.column}\` ${propType} ${d.expected.notNull ? 'NOT NULL' : 'NULL'};`);
    }
  }
  if (t.extraCols && t.extraCols.length) {
    for (const c of t.extraCols) {
      lines.push(`-- Extra column in DB not present in schema.ts: ${table}.${c} — consider if this should be removed or added to schema.ts`);
    }
  }
}

lines.push('SET foreign_key_checks = 1;');

const out = lines.join('\n');
const outPath = path.join('backups', 'alter-suggestions-' + path.basename(reportPath).replace(/[^0-9A-Za-z_.-]/g,'_') + '.sql');
fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote', outPath);
