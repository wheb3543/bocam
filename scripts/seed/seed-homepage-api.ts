/**
 * Seed Homepage Data via API
 * سكريبت إضافة بيانات الصفحة الرئيسية عبر API
 */

const API_URL = 'http://localhost:3001';

async function seedHomepageData() {
  try {
    console.log('🔄 جاري الاتصال بالسيرفر...');

    // أولاً نحتاج للحصول على رمز المصادقة
    // سنفترض أن المستخدم مسجل دخوله بالفعل
    // أو يمكننا استخدام endpoint عام إذا كان متوفراً

    console.log('⚠️  هذا السكريبت يتطلب مصادقة صالحة');
    console.log('💡 يرجى استخدام الواجهة الرسومية بدلاً من ذلك:');
    console.log('   1. افتح المتصفح على: http://localhost:3001');
    console.log('   2. سجل الدخول إلى لوحة الإدارة');
    console.log('   3. انتقل إلى صفحة إدارة المحتوى');
    console.log('   4. اضغط على زر "إضافة بيانات الصفحة الرئيسية"');

    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  }
}

seedHomepageData();
