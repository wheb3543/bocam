import 'dotenv/config';
import { getDb } from '../../server/database/db/connection';
import {
  patients,
  patientRelationships,
  appointments,
  patientResults,
  doctors,
  campaigns,
} from '../../drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  const phoneDisplay = '777001122';
  const phoneNormalized = '967777001122';
  const passwordPlain = '123456';
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  console.log(`Setting up test patient with phone ${phoneDisplay} (${phoneNormalized})...`);

  // 1. Check existing patients with this phone and clean up old test data if any
  const existing = await db.select().from(patients).where(eq(patients.phone, phoneNormalized));

  if (existing.length > 0) {
    const ids = existing.map((p) => p.id);
    console.log('Cleaning existing test records for IDs:', ids);
    await db
      .delete(patientRelationships)
      .where(inArray(patientRelationships.primaryPatientId, ids));
    await db
      .delete(patientRelationships)
      .where(inArray(patientRelationships.relatedPatientId, ids));
    await db.delete(appointments).where(inArray(appointments.patientId, ids));
    await db.delete(patientResults).where(inArray(patientResults.patientId, ids));
    await db.delete(patients).where(inArray(patients.id, ids));
  }

  // 2. Insert Primary Patient (الأب / صاحب الحساب)
  const [primaryInsert] = await db.insert(patients).values({
    fullName: 'أحمد محمد عبدالله الصنعاني',
    phone: phoneNormalized,
    address: 'صنعاء - حدة',
    age: 42,
    gender: 'male',
    email: 'ahmed.al-sanani@example.com',
    password: hashedPassword,
    isActive: true,
  });

  const primaryId = primaryInsert.insertId;
  console.log('✅ Created primary patient ID:', primaryId);

  // 3. Insert Family Member 1 (الابن)
  const [sonInsert] = await db.insert(patients).values({
    fullName: 'عمر أحمد محمد الصنعاني',
    phone: phoneNormalized,
    address: 'صنعاء - حدة',
    age: 8,
    gender: 'male',
    password: null,
    isActive: true,
  });
  const sonId = sonInsert.insertId;

  // Link as son
  await db.insert(patientRelationships).values({
    primaryPatientId: primaryId,
    relatedPatientId: sonId,
    relationship: 'son',
  });
  console.log('✅ Created family member (son) ID:', sonId);

  // 4. Insert Family Member 2 (الزوجة)
  const [wifeInsert] = await db.insert(patients).values({
    fullName: 'فاطمة علي سعيد',
    phone: phoneNormalized,
    address: 'صنعاء - حدة',
    age: 38,
    gender: 'female',
    password: null,
    isActive: true,
  });
  const wifeId = wifeInsert.insertId;

  // Link as wife
  await db.insert(patientRelationships).values({
    primaryPatientId: primaryId,
    relatedPatientId: wifeId,
    relationship: 'wife',
  });
  console.log('✅ Created family member (wife) ID:', wifeId);

  // 5. Fetch a doctor and campaign to link appointments
  const allDoctors = await db.select().from(doctors).limit(3);
  const doc1 = allDoctors[0];
  const doc2 = allDoctors[1] || allDoctors[0];

  const allCampaigns = await db.select().from(campaigns).limit(1);
  let campaignId = allCampaigns[0]?.id;
  if (!campaignId) {
    const [c] = await db.insert(campaigns).values({
      name: 'حملة الحجز العام',
      slug: 'direct-booking',
      description: 'حملة الحجوزات المباشرة',
      isActive: true,
    });
    campaignId = c.insertId;
  }

  // 6. Insert Test Appointments
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 5);

  // Primary appointment
  await db.insert(appointments).values({
    campaignId,
    patientId: primaryId,
    doctorId: doc1?.id || 1,
    departmentId: doc1?.departmentId || 1,
    fullName: 'أحمد محمد عبدالله الصنعاني',
    phone: phoneNormalized,
    gender: 'male',
    age: 42,
    appointmentDate: tomorrow,
    appointmentTime: '09:00',
    slotStartTime: '09:00',
    slotEndTime: '09:30',
    status: 'confirmed',
    patientMessage: 'كشف استشاري دوري',
  });

  // Son appointment
  await db.insert(appointments).values({
    campaignId,
    patientId: sonId,
    doctorId: doc2?.id || 1,
    departmentId: doc2?.departmentId || 1,
    fullName: 'عمر أحمد محمد الصنعاني',
    phone: phoneNormalized,
    gender: 'male',
    age: 8,
    appointmentDate: nextWeek,
    appointmentTime: '16:30',
    slotStartTime: '16:30',
    slotEndTime: '17:00',
    status: 'pending',
    patientMessage: 'متابعة أطفال وفحوصات دورية',
  });

  // 7. Insert Test Results
  // Primary lab result
  await db.insert(patientResults).values({
    patientId: primaryId,
    resultType: 'lab',
    title: 'فحص الدم الشامل (CBC) ومستوى السكر التراكمي',
    description: 'كافة المؤشرات الحيوية ضمن الحدود الطبيعية',
    resultDate: today,
    status: 'ready',
    doctorName: doc1?.name || 'د. محمد الكبسي',
  });

  // Son lab result
  await db.insert(patientResults).values({
    patientId: sonId,
    resultType: 'lab',
    title: 'فحص فيتامين د ونسبة الكالسيوم',
    description: 'مستوى فيتامين د طبيعي 32 ng/mL',
    resultDate: today,
    status: 'ready',
    doctorName: doc2?.name || 'د. إيمان الشامي',
  });

  // Wife radiology result
  await db.insert(patientResults).values({
    patientId: wifeId,
    resultType: 'radiology',
    title: 'تقرير أشعة سونار للبطن والحوض (Ultrasound)',
    description: 'فحص أشعة سليم بدون أي ملاحظات مرضية',
    resultDate: today,
    status: 'ready',
    doctorName: doc1?.name || 'د. محمد الكبسي',
  });

  console.log('\n=======================================');
  console.log('🎉 Test Account Created Successfully!');
  console.log(`Phone:    ${phoneDisplay} (أو ${phoneNormalized})`);
  console.log(`Password: ${passwordPlain}`);
  console.log(`Primary:  أحمد محمد عبدالله الصنعاني`);
  console.log(`Members:  عمر أحمد (ابن), فاطمة علي (زوجة)`);
  console.log('=======================================\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('Error creating test patient:', err);
  process.exit(1);
});
