import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import { users } from './drizzle/schema';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

async function createAdmin() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL غير محدد في متغيرات البيئة');
    process.exit(1);
  }

  console.log('🔗 جاري الاتصال بقاعدة البيانات...');
  const db = drizzle(DATABASE_URL);
  
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
