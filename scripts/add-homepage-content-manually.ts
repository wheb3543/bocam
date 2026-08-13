/**
 * Manual Homepage Content Addition Script
 * سكريبت إضافة بيانات الصفحة الرئيسية يدوياً
 */

import { getDb } from '../server/database/db';
import { textContent, pages } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

async function addHomepageContent() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    const db = await getDb();

    if (!db) {
      throw new Error('فشل الاتصال بقاعدة البيانات');
    }

    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // 1. التحقق من وجود صفحة الصفحة الرئيسية
    console.log('🔄 جاري التحقق من صفحة الصفحة الرئيسية...');
    const existingPages = await db.select().from(pages).where(eq(pages.slug, 'home'));

    let homepageId: number;

    if (existingPages.length === 0) {
      console.log('📄 إنشاء صفحة الصفحة الرئيسية...');
      const insertResult = await db.insert(pages).values({
        name: 'الصفحة الرئيسية',
        slug: 'home',
        type: 'main',
        parentId: null,
        titleAr: 'الصفحة الرئيسية',
        titleEn: 'Home Page',
        metaTitleAr: 'مستشفى بوكم - صنعاء | احجز موعدك الآن',
        metaTitleEn: "Bocam Hospital - Sana'a | Book Your Appointment Now",
        metaDescriptionAr:
          'احجز موعدك مع أفضل الأطباء في مستشفى بوكم بصنعاء. خدمات طبية متميزة، عروض خاصة، ومخيمات صحية مجانية.',
        metaDescriptionEn:
          "Book your appointment with the best doctors at Bocam Hospital in Sana'a. Excellent medical services, special offers, and free medical camps.",
        keywordsAr: 'مستشفى بوكم, صنعاء, حجز موعد, أطباء, عروض طبية, مخيمات صحية, استشارات طبية',
        keywordsEn:
          "Bocam Hospital, Sana'a, book appointment, doctors, medical offers, health camps, medical consultations",
        isActive: 'yes',
        sortOrder: 1,
      });

      homepageId = insertResult[0].insertId;
      console.log('✅ تم إنشاء صفحة الصفحة الرئيسية:', homepageId);
    } else {
      homepageId = existingPages[0].id;
      console.log('✅ صفحة الصفحة الرئيسية موجودة بالفعل:', homepageId);
    }

    // 2. إضافة المحتوى النصي
    console.log('🔄 جاري إضافة المحتوى النصي...');

    const contentData = [
      // Hero Section
      {
        key: 'hero.title.ar',
        language: 'ar',
        content: 'مستشفى بوكم - رعايتك الصحية الأولى',
        section: 'hero',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'hero.title.en',
        language: 'en',
        content: 'Bocam Hospital - Your First Health Care',
        section: 'hero',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'hero.subtitle.ar',
        language: 'ar',
        content: 'خدمات طبية متميزة بأعلى معايير الجودة',
        section: 'hero',
        pageId: homepageId,
        type: 'subtitle' as const,
      },
      {
        key: 'hero.subtitle.en',
        language: 'en',
        content: 'Excellent medical services with highest quality standards',
        section: 'hero',
        pageId: homepageId,
        type: 'subtitle' as const,
      },
      {
        key: 'hero.description.ar',
        language: 'ar',
        content: 'احجز موعدك مع أفضل الأطباء في صنعاء',
        section: 'hero',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'hero.description.en',
        language: 'en',
        content: "Book your appointment with the best doctors in Sana'a",
        section: 'hero',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'hero.button.ar',
        language: 'ar',
        content: 'احجز موعدك الآن',
        section: 'hero',
        pageId: homepageId,
        type: 'button' as const,
      },
      {
        key: 'hero.button.en',
        language: 'en',
        content: 'Book Your Appointment Now',
        section: 'hero',
        pageId: homepageId,
        type: 'button' as const,
      },

      // Stats Section
      {
        key: 'stats.doctors.label.ar',
        language: 'ar',
        content: 'طبيب واستشاري',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.doctors.label.en',
        language: 'en',
        content: 'Doctors and Consultants',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.specialties.label.ar',
        language: 'ar',
        content: 'تخصص طبي',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.specialties.label.en',
        language: 'en',
        content: 'Medical Specialties',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.patients.label.ar',
        language: 'ar',
        content: 'مريض سعيد',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.patients.label.en',
        language: 'en',
        content: 'Happy Patients',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.service.label.ar',
        language: 'ar',
        content: 'خدمة متواصلة',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.service.label.en',
        language: 'en',
        content: 'Continuous Service',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },

      // Services Section
      {
        key: 'services.title.ar',
        language: 'ar',
        content: 'خدماتنا الإلكترونية',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.title.en',
        language: 'en',
        content: 'Our Electronic Services',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.doctors.title.ar',
        language: 'ar',
        content: 'حجز مواعيد الأطباء',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.doctors.title.en',
        language: 'en',
        content: 'Doctor Appointments',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.explore.button.ar',
        language: 'ar',
        content: 'استكشف الآن',
        section: 'services',
        pageId: homepageId,
        type: 'button' as const,
      },
      {
        key: 'services.explore.button.en',
        language: 'en',
        content: 'Explore Now',
        section: 'services',
        pageId: homepageId,
        type: 'button' as const,
      },

      // About Section
      {
        key: 'about.title.ar',
        language: 'ar',
        content: 'عن مستشفى بوكم',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'about.title.en',
        language: 'en',
        content: 'About Bocam Hospital',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'about.features.global.title.ar',
        language: 'ar',
        content: 'معايير عالمية',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'about.features.global.title.en',
        language: 'en',
        content: 'World-Class Standards',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },

      // CTA Section
      {
        key: 'cta.title.ar',
        language: 'ar',
        content: 'ابدأ رحلتك الصحية معنا',
        section: 'cta',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'cta.title.en',
        language: 'en',
        content: 'Start Your Health Journey With Us',
        section: 'cta',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'cta.book.button.ar',
        language: 'ar',
        content: 'احجز موعدك',
        section: 'cta',
        pageId: homepageId,
        type: 'button' as const,
      },
      {
        key: 'cta.book.button.en',
        language: 'en',
        content: 'Book Your Appointment',
        section: 'cta',
        pageId: homepageId,
        type: 'button' as const,
      },
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const item of contentData) {
      // التحقق من وجود العنصر
      const existing = await db
        .select()
        .from(textContent)
        .where(and(eq(textContent.key, item.key), eq(textContent.language, item.language)));

      if (existing.length === 0) {
        await db.insert(textContent).values(item);
        addedCount++;
        console.log(`✅ تم إضافة: ${item.key}`);
      } else {
        skippedCount++;
        console.log(`⏭️  موجود بالفعل: ${item.key}`);
      }
    }

    console.log(`\n✅ تمت العملية بنجاح:`);
    console.log(`   - تم إضافة: ${addedCount} عنصر`);
    console.log(`   - تم تخطي: ${skippedCount} عنصر (موجود بالفعل)`);
    console.log(`   - المجموع: ${contentData.length} عنصر`);

    // التحقق النهائي
    console.log('\n🔄 جاري التحقق النهائي...');
    const finalCheck = await db
      .select()
      .from(textContent)
      .where(eq(textContent.pageId, homepageId));
    console.log(`📊 إجمالي المحتوى النصي للصفحة الرئيسية: ${finalCheck.length}`);
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  }
}

addHomepageContent()
  .then(() => {
    console.log('🎉 اكتملت العملية بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشلت العملية:', error);
    process.exit(1);
  });
