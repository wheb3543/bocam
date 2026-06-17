import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function createAdmin() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL غير محدد في متغيرات البيئة');
    process.exit(1);
  }

  // Parse connection string to extract components
  const url = new URL(DATABASE_URL);
  const host = url.hostname;
  const port = url.port || '3306';
  const user = url.username;
  const password = url.password;
  const database = url.pathname.slice(1); // Remove leading slash

  console.log('🔗 جاري الاتصال بقاعدة البيانات...');
  const connection = mysql.createPool({
    host,
    port: parseInt(port),
    user,
    password,
    database,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  const db = drizzle(connection);

  try {
    // Check if admin already exists
    const existingUsers = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);

    if (existingUsers.length > 0) {
      console.log('⚠️ المستخدم admin موجود بالفعل');
      console.log('بيانات المستخدم:');
      console.log('  - اسم المستخدم:', existingUsers[0].username);
      console.log('  - الاسم:', existingUsers[0].name);
      console.log('  - البريد الإلكتروني:', existingUsers[0].email);
      console.log('  - الدور:', existingUsers[0].role);
      console.log('  - الحالة:', existingUsers[0].isActive);
      return;
    }

    // Hash password
    console.log('🔐 جاري تشفير كلمة المرور...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert admin user
    console.log('📝 جاري إنشاء مستخدم المدير...');
    await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      name: 'مدير النظام',
      email: 'admin@sgh.com',
      role: 'admin',
      isActive: 'yes',
      loginMethod: 'manual',
    });

    console.log('✅ تم إنشاء مستخدم المدير بنجاح!');
    console.log('📋 بيانات الدخول:');
    console.log('  - اسم المستخدم: admin');
    console.log('  - كلمة المرور: admin123');
    console.log('  - البريد الإلكتروني: admin@sgh.com');
    console.log('  - الدور: admin');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ المستخدم موجود بالفعل');
    }
  }
}

createAdmin();
