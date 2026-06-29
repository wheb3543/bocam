import dotenv from 'dotenv';
dotenv.config();
import { connect } from '@planetscale/database';
import * as schema from './drizzle/schema.ts';

const expectedTables = Object.keys(schema).filter(key => key.endsWith('s') && typeof schema[key] === 'object' && schema[key] !== null && 'get\[tablename\]' in schema[key]).map(key => schema[key]['get\[tablename\]']);

async function checkTables() {
  const connection = connect({
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  });

  try {
    const [rows] = await connection.execute('SHOW TABLES;');
    const existingTables = rows.map(row => Object.values(row)[0]);

    console.log('الجداول المتوقعة:', expectedTables);
    console.log('الجداول الموجودة:', existingTables);

    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    if (missingTables.length === 0) {
      console.log('✅ جميع الجداول المتوقعة موجودة في قاعدة البيانات.');
    } else {
      console.log('❌ الجداول التالية مفقودة من قاعدة البيانات:', missingTables);
    }
  } catch (error) {
    console.error('حدث خطأ أثناء التحقق من الجداول:', error);
  } finally {
    // Drizzle with PlanetScale doesn't have a direct disconnect method
    // The connection is serverless and managed automatically.
  }
}

checkTables();