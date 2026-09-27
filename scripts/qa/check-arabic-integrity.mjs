/**
 * Arabic Text Integrity Check
 * فحص سلامة النصوص العربية في الملفات المُولّدة
 *
 * يكشف الرموز اللاتينية غير المقصودة داخل السلاسل العربية، وهي symptom
 * تلف في التوليد يجب إصلاحه قبل إدخال المحتوى إلى قاعدة البيانات.
 *
 * الاستخدام: node scripts/qa/check-arabic-integrity.mjs <file> [startLine]
 */

import { readFileSync } from 'node:fs';

/** الكلمات اللاتينية المسموحة لأنها أسماء حقول أو روابط تقنية. */
const ALLOWED = new Set([
  'title',
  'slug',
  'category',
  'cover',
  'coverAlt',
  'publishedAt',
  'featured',
  'reviewer',
  'tags',
  'excerpt',
  'body',
  'name',
  'nameEn',
  'description',
  'color',
  'sortOrder',
  'isActive',
  'status',
  'type',
  'key',
  'section',
  'language',
  'content',
  'value',
  'title',
  'description',
  'keywords',
  'ogImage',
  'pageKey',
  'pageId',
  'POSTS',
  'CATEGORIES',
  'ar',
  'en',
  'title',
  'description',
  'ogTitle',
  'robots',
  'canonicalUrl',
  'in',
  'the',
  'not',
  'to',
  'of',
  'and',
  'or',
  'is',
  'are',
  'for',
  'with',
  'a',
  'an',
  'on',
  'at',
  'by',
  'from',
  'as',
  'it',
  'be',
  'this',
  'that',
  'we',
  'you',
  'HIV',
  'CPAP',
  'HTML',
  'SEO',
  'new',
  'Date',
  'true',
  'false',
  'diseases',
  'breathing',
  'sgh',
  'blog',
  'jpg',
  'suspicion',
  'what',
  'symptoms',
  'women',
  'apnea',
  'experience',
  'sleep',
  'snoring',
  'normal',
  'dangerous',
  'causes',
  'warning',
  'signs',
  'my',
  'with',
  'is',
  'or',
  'diabetes',
  'foot',
  'orthopedics',
  'geriatric',
  'health',
  'infectious',
  'Diabetes',
  'Foot',
  'Orthopedics',
  'Infectious',
  'Diseases',
  'Sleep',
  'Breathing',
  'Geriatric',
  'const',
  'hiv',
  'chlamydia',
  'blockquote',
  'strong',
  'em',
  'ol',
  'ul',
  'li',
  'h2',
  'h3',
  'p',
  'blogPosts',
  'blogCategories',
  'seoSettings',
  'textContent',
  'schema',
  'aed',
  'buildBlogSlug',
  'calculateReadingTime',
  'sanitizeBlogHtml',
  'and',
  'eq',
  'isNull',
  'drizzle',
  'mysql2',
]);

// Argument order: the flag comes before the file path, so filter flags out first.
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const positional = args.filter((arg) => !arg.startsWith('--'));
const file = positional[0];
const startLine = Number(positional[1] ?? 1);

if (!file) {
  console.error(
    '❌ الاستخدام: node scripts/qa/check-arabic-integrity.mjs [--strict] <file> [startLine]'
  );
  process.exit(1);
}

const lines = readFileSync(file, 'utf8').split('\n');
const issues = [];

lines.forEach((line, index) => {
  const lineNumber = index + 1;
  if (lineNumber < startLine) {
    return;
  }
  // skip imports, comments, and console/API call sites: these are code lines
  // whose Latin identifiers are legitimate, even when the message is Arabic.
  if (/^\s*(import|export|\/\*|\*|\/\/|from\b|['"]?\s*\}\s*from\b)/.test(line)) {
    return;
  }
  if (/\b(console|process|db|await)\s*[.(]/.test(line)) {
    return;
  }

  const tokens = line.match(/[A-Za-z]{3,}/g) ?? [];
  // Strict mode only inspects lines containing Arabic text, because those
  // are the lines where generation loses its encoding. Pure code lines are fine.
  const hasArabic = /[\u0600-\u06FF]/.test(line);
  for (const token of tokens) {
    if (ALLOWED.has(token) || ALLOWED.has(token.toLowerCase())) {
      continue;
    }
    if (strict && !hasArabic) {
      continue;
    }
    issues.push({ lineNumber, token, text: line.trim().slice(0, 90) });
  }

  // المحارف الصينية والكورية واليابانية لا مكان لها في المحتوى العربي إطلاقاً.
  const cjk = line.match(/[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/g);
  if (cjk) {
    issues.push({
      lineNumber,
      token: `[محارف آسيوية: ${[...new Set(cjk)].join(' ')}]`,
      text: line.trim().slice(0, 90),
    });
  }

  // خطأ بنيوي شائع بعد إصلاح يدوي: نص عربي داخل مصفوفة بلا علامات اقتباس.
  // نكتشفه بت agrícola عدم توازن الاقتباس على السطر.
  // Comments kept in English here to avoid mixed-direction source text.
  const singleQuotes = (line.match(/'/g) ?? []).length;
  if (singleQuotes % 2 !== 0 && /[\u0600-\u06FF]/.test(line) && !/['"]/.test(line.slice(0, 2))) {
    issues.push({
      lineNumber,
      token: '[اقتباس غير متوازن]',
      text: line.trim().slice(0, 90),
    });
  }
});

if (issues.length > 0) {
  console.error(`❌ رموز لاتينية غير مقصودة داخل نصوص عربية (${issues.length}):`);
  for (const issue of issues) {
    console.error(`   سطر ${issue.lineNumber}: [${issue.token}] ${issue.text}`);
  }
  process.exit(1);
}

console.log(`✅ النصوص العربية سليمة في ${file} (من السطر ${startLine}).`);
