import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function createAdmin() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert admin user
    await connection.execute(
      'INSERT INTO users (username, password, name, email, role, isActive) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', hashedPassword, 'مدير النظام', 'admin@sgh.com', 'admin', 'yes']
    );
    
    console.log('✅ تم إنشاء مستخدم المدير بنجاح!');
    console.log('اسم المستخدم: admin');
    console.log('كلمة المرور: admin123');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ المستخدم موجود بالفعل');
    } else {
      console.error('❌ خطأ:', error);
    }
  } finally {
    await connection.end();
  }
}

createAdmin();
