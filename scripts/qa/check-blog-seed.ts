/**
 * Blog Seed Verification
 * تحقق من محتوى المدونة في قاعدة البيانات بعد البذر
 *
 * يفحص وجود المقالات والتصنيفات، ويكشف أي XSS غير مُعقَّم في المحتوى المخزَّن.
 *
 * الاستخدام: node --env-file=.env --import tsx scripts/qa/check-blog-seed.ts
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

interface BlogPostRow {
  slug: string;
  content: string;
  readingTime: number;
  isFeatured: string;
  categoryName: string | null;
  status: string;
  isActive: string;
}

interface BlogCategoryRow {
  name: string;
  postCount: number;
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL غير موجود في متغيرات البيئة');
  process.exit(1);
}

const XSS_PATTERNS = [
  /<script/i,
  /<iframe/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /onclick\s*=/i,
  /javascript:/i,
];

async function main() {
  const connection = await mysql.createConnection(databaseUrl);

  try {
    const [posts] = (await connection.query(
      `SELECT p.slug, p.content, p.readingTime,
              p.isFeatured, p.status, p.isActive,
              c.name AS categoryName
         FROM blogPosts p
         LEFT JOIN blogCategories c ON c.id = p.categoryId
        ORDER BY p.publishedAt DESC`
    )) as [BlogPostRow[]];

    const [categories] = (await connection.query(
      `SELECT c.name, COUNT(p.id) AS postCount
         FROM blogCategories c
         LEFT JOIN blogPosts p ON p.categoryId = c.id
        GROUP BY c.id, c.name
        ORDER BY c.sortOrder ASC`
    )) as [BlogCategoryRow[]];

    console.log(`\n📂 التصنيفات (${categories.length}):`);
    for (const category of categories) {
      console.log(`   • ${category.name}: ${category.postCount} مقال`);
    }

    console.log(`\n📝 المقالات (${posts.length}):`);

    let issues = 0;
    for (const post of posts) {
      const unsafe = XSS_PATTERNS.filter((pattern) => pattern.test(post.content));
      const problems: string[] = [];

      if (unsafe.length > 0) {
        problems.push(`XSS: ${unsafe.length} نمط`);
      }
      if (post.status !== 'published') {
        problems.push(`الحالة=${post.status}`);
      }
      if (post.isActive !== 'yes') {
        problems.push('غير نشط');
      }
      if (!post.categoryName) {
        problems.push('بلا تصنيف');
      }
      if (post.content.length < 200) {
        problems.push(`المحتوى قصير (${post.content.length})`);
      }
      if (!post.readingTime || post.readingTime < 1) {
        problems.push('وقت قراءة غير صالح');
      }

      if (problems.length > 0) {
        issues += 1;
      }

      const mark = problems.length > 0 ? '❌' : '✅';
      const star = post.isFeatured === 'yes' ? '⭐' : '  ';
      console.log(
        `   ${mark}${star} ${post.slug} | ${post.categoryName ?? '-'} | ` +
          `${post.readingTime} د | ${post.content.length} حرف${problems.length > 0 ? ` | ${problems.join('، ')}` : ''}`
      );
    }

    console.log('');
    if (issues > 0) {
      console.error(`❌ ${issues} مقال يحتاج مراجعة.`);
      process.exit(1);
    }
    console.log(`✅ جميع المقالات (${posts.length}) سليمة ومُعقَّمة ومنشورة.`);
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error('❌ فشل التحقق:', error instanceof Error ? error.message : error);
  process.exit(1);
});
