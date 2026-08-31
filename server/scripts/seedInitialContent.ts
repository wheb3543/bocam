/**
 * Seed Initial Content
 * سكريبت آمن لإضافة المحتوى الأولي إلى قاعدة البيانات باستخدام Drizzle ORM
 */
import { getDb } from '../database/db';
import { textContent } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

const initialContent = [
  // Hero Section - الصفحة الرئيسية (Arabic)
  {
    key: 'hero.title',
    language: 'ar',
    content: 'خدمات طبية متميزة بأعلى معايير الجودة',
    section: 'hero',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.subtitle',
    language: 'ar',
    content: 'خدمات طبية متميزة بأعلى معايير الجودة',
    section: 'hero',
    type: 'subtitle' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.description',
    language: 'ar',
    content: 'احجز موعدك مع أفضل الأطباء في صنعاء',
    section: 'hero',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.button.text',
    language: 'ar',
    content: 'احجز موعدك الآن',
    section: 'hero',
    type: 'button' as const,
    isActive: 'yes' as const,
  },

  // Hero Section - الصفحة الرئيسية (English)
  {
    key: 'hero.title',
    language: 'en',
    content: 'Premium Medical Services with Highest Quality Standards',
    section: 'hero',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.subtitle',
    language: 'en',
    content: 'Premium Medical Services with Highest Quality Standards',
    section: 'hero',
    type: 'subtitle' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.description',
    language: 'en',
    content: "Book your appointment with the best doctors in Sana'a",
    section: 'hero',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.button.text',
    language: 'en',
    content: 'Book Appointment Now',
    section: 'hero',
    type: 'button' as const,
    isActive: 'yes' as const,
  },

  // Doctors Page - صفحة الأطباء (Arabic)
  {
    key: 'doctors.title',
    language: 'ar',
    content: 'أطباؤنا المتميزون',
    section: 'doctors',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'doctors.description',
    language: 'ar',
    content: 'فريق طبي متكامل من أفضل الأطباء في مختلف التخصصات',
    section: 'doctors',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'doctors.badge',
    language: 'ar',
    content: 'أطباء متخصصون',
    section: 'doctors',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Doctors Page - صفحة الأطباء (English)
  {
    key: 'doctors.title',
    language: 'en',
    content: 'Our Distinguished Doctors',
    section: 'doctors',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'doctors.description',
    language: 'en',
    content: 'An integrated medical team of the best doctors in various specialties',
    section: 'doctors',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'doctors.badge',
    language: 'en',
    content: 'Specialized Doctors',
    section: 'doctors',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Offers Page - صفحة العروض (Arabic)
  {
    key: 'offers.title',
    language: 'ar',
    content: 'العروض الطبية',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.description',
    language: 'ar',
    content: 'استفد من عروضنا الطبية المميزة بأسعار تنافسية وخدمات عالية الجودة',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.badge',
    language: 'ar',
    content: 'عروض خاصة',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Offers Page - صفحة العروض (English)
  {
    key: 'offers.title',
    language: 'en',
    content: 'Medical Offers',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.description',
    language: 'en',
    content:
      'Benefit from our distinguished medical offers at competitive prices and high-quality services',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.badge',
    language: 'en',
    content: 'Special Offers',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Camps Page - صفحة المخيمات (Arabic)
  {
    key: 'camps.title',
    language: 'ar',
    content: 'المخيمات الطبية الخيرية',
    section: 'camps',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.description',
    language: 'ar',
    content: 'مبادراتنا الإنسانية في إطار المسؤولية المجتمعية لخدمة المحتاجين',
    section: 'camps',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.badge',
    language: 'ar',
    content: 'مخيمات خيرية',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Camps Page - صفحة المخيمات (English)
  {
    key: 'camps.title',
    language: 'en',
    content: 'Charitable Medical Camps',
    section: 'camps',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.description',
    language: 'en',
    content:
      'Our humanitarian initiatives within the framework of social responsibility to serve those in need',
    section: 'camps',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.badge',
    language: 'en',
    content: 'Charitable Camps',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Privacy Policy - سياسة الخصوصية (Arabic)
  {
    key: 'privacy.title',
    language: 'ar',
    content: 'سياسة الخصوصية',
    section: 'privacy',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'privacy.badge',
    language: 'ar',
    content: 'حماية البيانات',
    section: 'privacy',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Privacy Policy - سياسة الخصوصية (English)
  {
    key: 'privacy.title',
    language: 'en',
    content: 'Privacy Policy',
    section: 'privacy',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'privacy.badge',
    language: 'en',
    content: 'Data Protection',
    section: 'privacy',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Thank You - صفحة الشكر (Arabic)
  {
    key: 'thankyou.title',
    language: 'ar',
    content: 'تم التسجيل بنجاح!',
    section: 'thankyou',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'thankyou.subtitle',
    language: 'ar',
    content: 'شكراً لك، تم استلام طلبك بنجاح',
    section: 'thankyou',
    type: 'subtitle' as const,
    isActive: 'yes' as const,
  },

  // Thank You - صفحة الشكر (English)
  {
    key: 'thankyou.title',
    language: 'en',
    content: 'Registration Successful!',
    section: 'thankyou',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'thankyou.subtitle',
    language: 'en',
    content: 'Thank you, your request has been received successfully',
    section: 'thankyou',
    type: 'subtitle' as const,
    isActive: 'yes' as const,
  },
];

async function seedInitialContent() {
  try {
    console.warn('بدء إضافة المحتوى الأولي...');
    const db = await getDb();

    if (!db) {
      console.error('❌ فشل في الاتصال بقاعدة البيانات');
      process.exit(1);
    }

    for (const content of initialContent) {
      // التحقق من وجود المحتوى
      const existing = await db
        .select()
        .from(textContent)
        .where(and(eq(textContent.key, content.key), eq(textContent.language, content.language)));

      if (existing.length === 0) {
        await db.insert(textContent).values(content);
        console.warn(`✅ تم إضافة: ${content.key} (${content.language})`);
      } else {
        console.warn(`⏭️  موجود بالفعل: ${content.key} (${content.language})`);
      }
    }

    console.warn('✅ تم إكمال إضافة المحتوى الأولي بنجاح');
  } catch (error) {
    console.error('❌ خطأ في إضافة المحتوى الأولي:', error);
    process.exit(1);
  }
}

// تشغيل السكريبت
seedInitialContent().then(() => {
  console.warn('تم الانتهاء');
  process.exit(0);
});
