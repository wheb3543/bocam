/**
 * Run SQL Migrations
 * تشغيل ملفات SQL الموجودة في مجلد migrations
 */

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { readdirSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bocam',
  ssl: {
    rejectUnauthorized: false,
  },
};

async function runMigrations() {
  let connection;
  try {
    console.log('🔄 الاتصال بقاعدة البيانات...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ تم الاتصال بنجاح');

    const migrationsDir = './server/database/migrations';
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .filter(file => file !== 'add_performance_indexes.sql') // تخطي هذا الملف لأنه يستخدم صيغة غير مدعومة
      .filter(file => file !== 'fix_pages_column_order.sql') // تشغيل هذا الملف يدوياً لأنه يحتاج على إعادة ترتيب الأعمدة
      .sort();

    console.log(`📂 العثور على ${files.length} ملفات migrations (تم تخطي add_performance_indexes.sql و fix_pages_column_order.sql)`);

    for (const file of files) {
      const filePath = join(migrationsDir, file);
      console.log(`\n📄 تشغيل: ${file}`);
      
      try {
        const sql = readFileSync(filePath, 'utf8');
        
        // تقسيم SQL إلى عبارات منفصلة
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          if (statement) {
            try {
              await connection.execute(statement);
            } catch (stmtError) {
              // تجاهل أخطاء الـ indexes الموجودة بالفعل
              if (stmtError.code === 'ER_DUP_KEYNAME' || stmtError.code === 'ER_DUP_INDEX') {
                console.log(`  ⚠️  تم تخطي: الـ index موجود بالفعل`);
              } else if (stmtError.code === 'ER_TABLE_EXISTS_ERROR' || stmtError.code === 'ER_DUP_FIELDNAME') {
                console.log(`  ⚠️  تم تخطي: الجدول/الحقل موجود بالفعل`);
              } else if (stmtError.code === 'ER_KEY_COLUMN_DOES_NOT_EXITS') {
                console.log(`  ⚠️  تم تخطي: العمود غير موجود (سيتم إضافته لاحقاً)`);
              } else if (stmtError.code === 'ER_PARSE_ERROR' && statement.includes('IF NOT EXISTS')) {
                console.log(`  ⚠️  تم تخطي: صيغة IF NOT EXISTS غير مدعومة`);
              } else {
                throw stmtError;
              }
            }
          }
        }
        
        console.log(`✅ تم تنفيذ: ${file}`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  تم تخطي: ${file} (الجدول/الحقل موجود بالفعل)`);
        } else {
          console.error(`❌ خطأ في ${file}:`, error.message);
          throw error;
        }
      }
    }

    console.log('\n✅ تم تشغيل جميع الـ migrations بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تشغيل migrations:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 تم إغلاق الاتصال');
    }
  }
}

runMigrations();
