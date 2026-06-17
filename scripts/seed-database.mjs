import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

// Parse connection string
const url = new URL(DATABASE_URL);
const host = url.hostname;
const port = url.port || '3306';
const user = url.username;
const password = url.password;
const database = url.pathname.slice(1);

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

async function seedDatabase() {
  console.log('🌱 جاري إضافة بيانات وهمية...');

  try {
    // 1. Create Admin User
    console.log('📝 إنشاء مستخدم المدير...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.execute(
      `INSERT INTO users (username, password, name, email, role, isActive, loginMethod) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE username=username`,
      ['admin', hashedPassword, 'مدير النظام', 'admin@sgh.com', 'admin', 'yes', 'manual']
    );

    // 2. Create Staff Users
    console.log('👥 إنشاء مستخدمي الموظفين...');
    const staffUsers = [
      ['ahmed', 'أحمد محمد', 'ahmed@sgh.com', 'staff'],
      ['sara', 'سارة أحمد', 'sara@sgh.com', 'manager'],
      ['khalid', 'خالد علي', 'khalid@sgh.com', 'staff'],
      ['fatima', 'فاطمة حسن', 'fatima@sgh.com', 'viewer'],
    ];

    for (const [username, name, email, role] of staffUsers) {
      const staffPassword = await bcrypt.hash('password123', 10);
      await connection.execute(
        `INSERT INTO users (username, password, name, email, role, isActive, loginMethod) 
         VALUES (?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE username=username`,
        [username, staffPassword, name, email, role, 'yes', 'manual']
      );
    }

    // 3. Create Campaigns
    console.log('📢 إنشاء الحملات التسويقية...');
    const campaigns = [
      [
        'حملة شهر رمضان',
        'ramadan-campaign',
        'حملة خاصة بشهر رمضان المبارك',
        'digital',
        'active',
        50000,
        45000,
        'YER',
      ],
      [
        'حملة العناية بالبشرة',
        'skincare-campaign',
        'عروض خاصة للعناية بالبشرة',
        'digital',
        'active',
        30000,
        25000,
        'YER',
      ],
      [
        'حملة الأسنان',
        'dental-campaign',
        'عروض زراعة وتجميل الأسنان',
        'field',
        'active',
        40000,
        35000,
        'YER',
      ],
    ];

    for (const [
      name,
      slug,
      description,
      type,
      status,
      plannedBudget,
      actualBudget,
      currency,
    ] of campaigns) {
      await connection.execute(
        `INSERT INTO campaigns (name, slug, description, type, status, plannedBudget, actualBudget, currency, startDate, endDate, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), true) 
         ON DUPLICATE KEY UPDATE slug=slug`,
        [name, slug, description, type, status, plannedBudget, actualBudget, currency]
      );
    }

    // 4. Create Doctors
    console.log('👨‍⚕️ إنشاء الأطباء...');
    const doctors = [
      [
        'د. أحمد العلي',
        'dr-ahmed-alali',
        'جراحة عامة',
        '10 سنوات',
        'العربية, الإنجليزية',
        '5000',
        'yes',
        'yes',
      ],
      [
        'د. سارة المحمدي',
        'dr-sara-almahmadi',
        'جلدية وتجميل',
        '8 سنوات',
        'العربية, الإنجليزية',
        '6000',
        'yes',
        'yes',
      ],
      [
        'د. خالد الصالحي',
        'dr-khaled-alsalihi',
        'أسنان',
        '12 سنة',
        'العربية, الإنجليزية',
        '4000',
        'yes',
        'yes',
      ],
      [
        'د. فاطمة القحطاني',
        'dr-fatima-alqahtani',
        'عيون',
        '6 سنوات',
        'العربية, الإنجليزية',
        '5500',
        'yes',
        'yes',
      ],
    ];

    for (const [
      name,
      slug,
      specialty,
      experience,
      languages,
      consultationFee,
      isVisiting,
      available,
    ] of doctors) {
      await connection.execute(
        `INSERT INTO doctors (name, slug, specialty, experience, languages, consultationFee, isVisiting, available) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE slug=slug`,
        [name, slug, specialty, experience, languages, consultationFee, isVisiting, available]
      );
    }

    // 5. Create Offers
    console.log('🎁 إنشاء العروض...');
    const offers = [
      ['خصم 50% على عمليات التجميل', 'beauty-50-off', 'خصم خاص على جميع عمليات التجميل'],
      ['فحص مجاني للأسنان', 'free-dental-checkup', 'فحص مجاني مع كل عملية زراعة'],
      ['حزمة العناية بالبشرة', 'skincare-package', 'حزمة شاملة للعناية بالبشرة بسعر مخفض'],
    ];

    for (const [title, slug, description] of offers) {
      await connection.execute(
        `INSERT INTO offers (title, slug, description, isActive, startDate, endDate) 
         VALUES (?, ?, ?, true, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY)) 
         ON DUPLICATE KEY UPDATE slug=slug`,
        [title, slug, description]
      );
    }

    // 6. Create Leads
    console.log('📋 إنشاء العملاء المحتملين...');
    const leads = [
      ['محمد أحمد', '777123456', 'mohammed@email.com', 1, 'new', 'facebook'],
      ['علي حسن', '777234567', 'ali@email.com', 1, 'contacted', 'instagram'],
      ['فاطمة محمد', '777345678', 'fatima@email.com', 2, 'booked', 'google'],
      ['سارة علي', '777456789', 'sara@email.com', 2, 'new', 'whatsapp'],
      ['خالد أحمد', '777567890', 'khaled@email.com', 3, 'pending', 'field'],
    ];

    for (const [fullName, phone, email, campaignId, status, source] of leads) {
      await connection.execute(
        `INSERT INTO leads (campaignId, fullName, phone, email, status, source, utmSource) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [campaignId, fullName, phone, email, status, source, source]
      );
    }

    // 7. Create Appointments
    console.log('📅 إنشاء المواعيد...');
    const appointments = [
      [
        1,
        1,
        'محمد أحمد',
        '777123456',
        'mohammed@email.com',
        30,
        'male',
        'جراحة عامة',
        '2025-06-01',
        '10:00',
        'confirmed',
      ],
      [
        2,
        2,
        'فاطمة محمد',
        '777345678',
        'fatima@email.com',
        28,
        'female',
        'تجميل البشرة',
        '2025-06-02',
        '14:00',
        'pending',
      ],
      [
        3,
        3,
        'سارة علي',
        '777456789',
        'sara@email.com',
        25,
        'female',
        'زراعة أسنان',
        '2025-06-03',
        '09:00',
        'contacted',
      ],
      [
        1,
        4,
        'علي حسن',
        '777234567',
        'ali@email.com',
        35,
        'male',
        'جراحة عامة',
        '2025-06-04',
        '11:00',
        'attended',
      ],
    ];

    for (const [
      campaignId,
      doctorId,
      fullName,
      phone,
      email,
      age,
      gender,
      procedure,
      preferredDate,
      preferredTime,
      status,
    ] of appointments) {
      await connection.execute(
        `INSERT INTO appointments (campaignId, doctorId, fullName, phone, email, age, gender, \`procedure\`, preferredDate, preferredTime, status, source) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          campaignId,
          doctorId,
          fullName,
          phone,
          email,
          age,
          gender,
          procedure,
          preferredDate,
          preferredTime,
          status,
          'web',
        ]
      );
    }

    // 8. Create Settings
    console.log('⚙️ إنشاء الإعدادات...');
    const settings = [
      ['site_name', 'مستشفى SGH', 'اسم الموقع'],
      ['site_description', 'مستشفى SGH للرعاية الصحية', 'وصف الموقع'],
      ['contact_phone', '777000000', 'رقم الاتصال'],
      ['contact_email', 'info@sgh.com', 'البريد الإلكتروني للاتصال'],
      ['whatsapp_number', '777000000', 'رقم الواتساب'],
    ];

    for (const [key, value, description] of settings) {
      await connection.execute(
        `INSERT INTO settings (\`key\`, value, description) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE \`key\`=\`key\``,
        [key, value, description]
      );
    }

    console.log('✅ تم إضافة البيانات الوهمية بنجاح!');
    console.log('\n📋 بيانات الدخول:');
    console.log('  - اسم المستخدم: admin');
    console.log('  - كلمة المرور: admin123');
    console.log('\n👥 مستخدمي الموظفين:');
    console.log('  - ahmed / password123');
    console.log('  - sara / password123');
    console.log('  - khalid / password123');
    console.log('  - fatima / password123');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDatabase();
