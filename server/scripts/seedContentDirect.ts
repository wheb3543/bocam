/**
 * Seed Initial Content - Direct Database Connection
 * سكريبت مباشر لإضافة المحتوى الأولي بدون الحاجة للسيرفر
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import mysql from 'mysql2/promise';

const initialContent = [
  // Hero Section - الصفحة الرئيسية (Arabic)
  {
    key: 'hero.title.ar',
    language: 'ar',
    content: 'خدمات طبية متميزة بأعلى معايير الجودة',
    section: 'hero',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.subtitle.ar',
    language: 'ar',
    content: 'خدمات طبية متميزة بأعلى معايير الجودة',
    section: 'hero',
    type: 'subtitle' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.description.ar',
    language: 'ar',
    content: 'احجز موعدك مع أفضل الأطباء في صنعاء',
    section: 'hero',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.button.text.ar',
    language: 'ar',
    content: 'احجز موعدك الآن',
    section: 'hero',
    type: 'button' as const,
    isActive: 'yes' as const,
  },

  // Hero Section - الصفحة الرئيسية (English)
  {
    key: 'hero.title.en',
    language: 'en',
    content: 'Premium Medical Services with Highest Quality Standards',
    section: 'hero',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.subtitle.en',
    language: 'en',
    content: 'Premium Medical Services with Highest Quality Standards',
    section: 'hero',
    type: 'subtitle' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.description.en',
    language: 'en',
    content: "Book your appointment with the best doctors in Sana'a",
    section: 'hero',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.button.text.en',
    language: 'en',
    content: 'Book Appointment Now',
    section: 'hero',
    type: 'button' as const,
    isActive: 'yes' as const,
  },

  // Doctors Page - صفحة الأطباء (Arabic)
  {
    key: 'doctors.title.ar',
    language: 'ar',
    content: 'أطباؤنا المتميزون',
    section: 'doctors',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'doctors.description.ar',
    language: 'ar',
    content: 'فريق طبي متكامل من أفضل الأطباء في مختلف التخصصات',
    section: 'doctors',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'doctors.badge.ar',
    language: 'ar',
    content: 'أطباء متخصصون',
    section: 'doctors',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Doctors Page - صفحة الأطباء (English)
  {
    key: 'doctors.title.en',
    language: 'en',
    content: 'Our Distinguished Doctors',
    section: 'doctors',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'doctors.description.en',
    language: 'en',
    content: 'An integrated medical team of the best doctors in various specialties',
    section: 'doctors',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'doctors.badge.en',
    language: 'en',
    content: 'Specialized Doctors',
    section: 'doctors',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Offers Page - صفحة العروض (Arabic)
  {
    key: 'offers.title.ar',
    language: 'ar',
    content: 'العروض الطبية',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.description.ar',
    language: 'ar',
    content: 'استفد من عروضنا الطبية المميزة بأسعار تنافسية وخدمات عالية الجودة',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.badge.ar',
    language: 'ar',
    content: 'عروض خاصة',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Offers Page - صفحة العروض (English)
  {
    key: 'offers.title.en',
    language: 'en',
    content: 'Medical Offers',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.description.en',
    language: 'en',
    content:
      'Benefit from our distinguished medical offers at competitive prices and high-quality services',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.badge.en',
    language: 'en',
    content: 'Special Offers',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Camps Page - صفحة المخيمات (Arabic)
  {
    key: 'camps.title.ar',
    language: 'ar',
    content: 'المخيمات الطبية الخيرية',
    section: 'camps',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.description.ar',
    language: 'ar',
    content: 'مبادراتنا الإنسانية في إطار المسؤولية المجتمعية لخدمة المحتاجين',
    section: 'camps',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.badge.ar',
    language: 'ar',
    content: 'مخيمات خيرية',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Camps Page - صفحة المخيمات (English)
  {
    key: 'camps.title.en',
    language: 'en',
    content: 'Charitable Medical Camps',
    section: 'camps',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.description.en',
    language: 'en',
    content:
      'Our humanitarian initiatives within the framework of social responsibility to serve those in need',
    section: 'camps',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.badge.en',
    language: 'en',
    content: 'Charitable Camps',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Privacy Policy - سياسة الخصوصية (Arabic)
  {
    key: 'privacy.title.ar',
    language: 'ar',
    content: 'سياسة الخصوصية',
    section: 'privacy',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'privacy.badge.ar',
    language: 'ar',
    content: 'حماية البيانات',
    section: 'privacy',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Privacy Policy - سياسة الخصوصية (English)
  {
    key: 'privacy.title.en',
    language: 'en',
    content: 'Privacy Policy',
    section: 'privacy',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'privacy.badge.en',
    language: 'en',
    content: 'Data Protection',
    section: 'privacy',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Thank You - صفحة الشكر (Arabic)
  {
    key: 'thankyou.title.ar',
    language: 'ar',
    content: 'تم التسجيل بنجاح!',
    section: 'thankyou',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'thankyou.subtitle.ar',
    language: 'ar',
    content: 'شكراً لك، تم استلام طلبك بنجاح',
    section: 'thankyou',
    type: 'subtitle' as const,
    isActive: 'yes' as const,
  },

  // Thank You - صفحة الشكر (English)
  {
    key: 'thankyou.title.en',
    language: 'en',
    content: 'Registration Successful!',
    section: 'thankyou',
    type: 'subtitle' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'thankyou.subtitle.en',
    language: 'en',
    content: 'Thank you, your request has been received successfully',
    section: 'thankyou',
    type: 'subtitle' as const,
    isActive: 'yes' as const,
  },

  // Stats Section - الإحصائيات (Arabic)
  {
    key: 'stats.doctors.label.ar',
    language: 'ar',
    content: 'طبيب واستشاري',
    section: 'stats',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'stats.specialties.label.ar',
    language: 'ar',
    content: 'تخصص طبي',
    section: 'stats',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'stats.patients.label.ar',
    language: 'ar',
    content: 'مريض سعيد',
    section: 'stats',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'stats.service.label.ar',
    language: 'ar',
    content: 'خدمة متواصلة',
    section: 'stats',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Stats Section - الإحصائيات (English)
  {
    key: 'stats.doctors.label.en',
    language: 'en',
    content: 'Doctors and Consultants',
    section: 'stats',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'stats.specialties.label.en',
    language: 'en',
    content: 'Medical Specialties',
    section: 'stats',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'stats.patients.label.en',
    language: 'en',
    content: 'Happy Patients',
    section: 'stats',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'stats.service.label.en',
    language: 'en',
    content: '24/7 Service',
    section: 'stats',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Services Section - الخدمات (Arabic)
  {
    key: 'services.title.ar',
    language: 'ar',
    content: 'خدماتنا الإلكترونية',
    section: 'services',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.description.ar',
    language: 'ar',
    content:
      'نوفر لك منصة إلكترونية متكاملة لحجز المواعيد مع الأطباء والاستشاريين في مختلف التخصصات، الاستفادة من العروض الطبية المميزة والخصومات الخاصة، والمشاركة في المخيمات الطبية الخيرية المجانية التي ننظمها بشكل دوري لخدمة المجتمع. تجربة حجز سهلة وسريعة في متناول يدك.',
    section: 'services',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.doctors.title.ar',
    language: 'ar',
    content: 'حجز مواعيد الأطباء',
    section: 'services',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.doctors.description.ar',
    language: 'ar',
    content: 'احجز موعدك مع أفضل الأطباء والاستشاريين في مختلف التخصصات',
    section: 'services',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.offers.title.ar',
    language: 'ar',
    content: 'العروض الطبية',
    section: 'services',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.offers.description.ar',
    language: 'ar',
    content: 'استفد من عروضنا الطبية المميزة بأسعار تنافسية وخدمات متكاملة',
    section: 'services',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.camps.title.ar',
    language: 'ar',
    content: 'المخيمات الطبية الخيرية',
    section: 'services',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.camps.description.ar',
    language: 'ar',
    content: 'خدمات طبية مجانية للمجتمع ضمن مسؤوليتنا الاجتماعية',
    section: 'services',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.explore.button.ar',
    language: 'ar',
    content: 'استكشف الآن',
    section: 'services',
    type: 'button' as const,
    isActive: 'yes' as const,
  },

  // Services Section - الخدمات (English)
  {
    key: 'services.title.en',
    language: 'en',
    content: 'Our Electronic Services',
    section: 'services',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.description.en',
    language: 'en',
    content:
      'We provide you with an integrated electronic platform for booking appointments with doctors and consultants in various specialties, benefiting from distinguished medical offers and special discounts, and participating in free charitable medical camps that we organize periodically to serve the community. An easy and fast booking experience at your fingertips.',
    section: 'services',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.doctors.title.en',
    language: 'en',
    content: 'Doctor Appointments',
    section: 'services',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.doctors.description.en',
    language: 'en',
    content: 'Book your appointment with the best doctors and consultants in various specialties',
    section: 'services',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.offers.title.en',
    language: 'en',
    content: 'Medical Offers',
    section: 'services',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.offers.description.en',
    language: 'en',
    content:
      'Benefit from our distinguished medical offers at competitive prices and integrated services',
    section: 'services',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.camps.title.en',
    language: 'en',
    content: 'Charitable Medical Camps',
    section: 'services',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.camps.description.en',
    language: 'en',
    content: 'Free medical services for the community within our social responsibility',
    section: 'services',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'services.explore.button.en',
    language: 'en',
    content: 'Explore Now',
    section: 'services',
    type: 'button' as const,
    isActive: 'yes' as const,
  },

  // About Section - عن المستشفى (Arabic)
  {
    key: 'about.title.ar',
    language: 'ar',
    content: 'عن المستشفى',
    section: 'about',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.description.ar',
    language: 'ar',
    content:
      'المستشفى هو أحد أبرز المؤسسات الصحية في اليمن، حيث نقدم خدمات طبية متميزة بمعايير عالمية. نحن ملتزمون بتوفير رعاية صحية شاملة ومتكاملة لجميع المرضى، مع نخبة من الأطباء والاستشاريين المتخصصين في مختلف التخصصات الطبية. نؤمن بأهمية المسؤولية المجتمعية، ولذلك نقيم بشكل دوري مخيمات طبية خيرية مجانية لخدمة المجتمع وتقديم الرعاية الصحية للمحتاجين.',
    section: 'about',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.global.title.ar',
    language: 'ar',
    content: 'معايير عالمية',
    section: 'about',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.global.description.ar',
    language: 'ar',
    content: 'نقدم خدمات طبية متميزة بمعايير عالمية',
    section: 'about',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.comprehensive.title.ar',
    language: 'ar',
    content: 'رعاية شاملة',
    section: 'about',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.comprehensive.description.ar',
    language: 'ar',
    content: 'رعاية صحية متكاملة لجميع المرضى',
    section: 'about',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.specialized.title.ar',
    language: 'ar',
    content: 'أطباء متخصصون',
    section: 'about',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.specialized.description.ar',
    language: 'ar',
    content: 'نخبة من الأطباء والاستشاريين المتخصصين',
    section: 'about',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.additional.text1.ar',
    language: 'ar',
    content:
      'يضم المستشفى نخبة من الأطباء والاستشاريين المتخصصين في مختلف المجالات الطبية، مع توفير أحدث التقنيات والأجهزة الطبية لضمان أفضل النتائج العلاجية.',
    section: 'about',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.additional.text2.ar',
    language: 'ar',
    content:
      'نؤمن بأهمية المسؤولية المجتمعية، ولذلك نقيم بشكل دوري مخيمات طبية خيرية مجانية لخدمة المجتمع وتقديم الرعاية الصحية للمحتاجين.',
    section: 'about',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.image.caption.ar',
    language: 'ar',
    content: 'نقدم خدمات طبية متميزة بمعايير عالمية',
    section: 'about',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // About Section - عن المستشفى (English)
  {
    key: 'about.title.en',
    language: 'en',
    content: 'About the Hospital',
    section: 'about',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.description.en',
    language: 'en',
    content:
      'The hospital is one of the most prominent health institutions in Yemen, where we provide distinguished medical services with global standards. We are committed to providing comprehensive and integrated health care for all patients, with a selection of specialized doctors and consultants in various medical specialties. We believe in the importance of social responsibility, so we periodically organize free charitable medical camps to serve the community and provide health care to those in need.',
    section: 'about',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.global.title.en',
    language: 'en',
    content: 'Global Standards',
    section: 'about',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.global.description.en',
    language: 'en',
    content: 'We provide distinguished medical services with global standards',
    section: 'about',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.comprehensive.title.en',
    language: 'en',
    content: 'Comprehensive Care',
    section: 'about',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.comprehensive.description.en',
    language: 'en',
    content: 'Comprehensive health care for all patients',
    section: 'about',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.specialized.title.en',
    language: 'en',
    content: 'Specialized Doctors',
    section: 'about',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.features.specialized.description.en',
    language: 'en',
    content: 'A selection of specialized doctors and consultants',
    section: 'about',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.additional.text1.en',
    language: 'en',
    content:
      'The hospital includes a selection of specialized doctors and consultants in various medical fields, with the provision of the latest technologies and medical devices to ensure the best therapeutic results.',
    section: 'about',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.additional.text2.en',
    language: 'en',
    content:
      'We believe in the importance of social responsibility, so we periodically organize free charitable medical camps to serve the community and provide health care to those in need.',
    section: 'about',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'about.image.caption.en',
    language: 'en',
    content: 'We provide distinguished medical services with global standards',
    section: 'about',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // CTA Section - دعوة للعمل (Arabic)
  {
    key: 'cta.title.ar',
    language: 'ar',
    content: 'جاهزون لخدمتك على مدار الساعة',
    section: 'cta',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'cta.description.ar',
    language: 'ar',
    content:
      'فريقنا الطبي المتميز من الأطباء والاستشاريين في انتظارك. احجز موعدك الآن أو اتصل بنا على الرقم المجاني للحصول على المعلومات الطبية التي تحتاجها.',
    section: 'cta',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'cta.book.button.ar',
    language: 'ar',
    content: 'احجز موعدك',
    section: 'cta',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'cta.call.button.ar',
    language: 'ar',
    content: 'اتصل بنا',
    section: 'cta',
    type: 'button' as const,
    isActive: 'yes' as const,
  },

  // CTA Section - دعوة للعمل (English)
  {
    key: 'cta.title.en',
    language: 'en',
    content: 'Ready to Serve You 24/7',
    section: 'cta',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'cta.description.en',
    language: 'en',
    content:
      'Our distinguished medical team of doctors and consultants is waiting for you. Book your appointment now or call us on the toll-free number to get the medical information you need.',
    section: 'cta',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'cta.book.button.en',
    language: 'en',
    content: 'Book Appointment',
    section: 'cta',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'cta.call.button.en',
    language: 'en',
    content: 'Call Us',
    section: 'cta',
    type: 'button' as const,
    isActive: 'yes' as const,
  },

  // Accessibility - إمكانية الوصول (Arabic)
  {
    key: 'accessibility.skip.link.ar',
    language: 'ar',
    content: 'تخطى إلى المحتوى الرئيسي',
    section: 'accessibility',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'accessibility.back.to.top.ar',
    language: 'ar',
    content: 'العودة للأعلى',
    section: 'accessibility',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'accessibility.toggle.animations.ar',
    language: 'ar',
    content: 'إيقاف الحركات',
    section: 'accessibility',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'accessibility.start.animations.ar',
    language: 'ar',
    content: 'تشغيل الحركات',
    section: 'accessibility',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Accessibility - إمكانية الوصول (English)
  {
    key: 'accessibility.skip.link.en',
    language: 'en',
    content: 'Skip to main content',
    section: 'accessibility',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'accessibility.back.to.top.en',
    language: 'en',
    content: 'Back to top',
    section: 'accessibility',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'accessibility.toggle.animations.en',
    language: 'en',
    content: 'Stop Animations',
    section: 'accessibility',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'accessibility.start.animations.en',
    language: 'en',
    content: 'Start Animations',
    section: 'accessibility',
    type: 'text' as const,
    isActive: 'yes' as const,
  },

  // Camps Page - صفحة المخيمات (Arabic)
  {
    key: 'camps.about.title.ar',
    language: 'ar',
    content: 'عن المخيمات الطبية الخيرية',
    section: 'camps',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.about.description.ar',
    language: 'ar',
    content:
      'يأتي تنظيم المخيمات الطبية الخيرية ضمن مبادراتنا في إطار المسؤولية المجتمعية، حيث نسعى لتقديم خدمات طبية عالية الجودة للمحتاجين والمستحقين بأسعار رمزية أو مجاناً. يشرف على المخيمات نخبة من أفضل الأطباء والجراحين المتخصصين، مع توفير أحدث الأجهزة والتقنيات الطبية.',
    section: 'camps',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.search.placeholder.ar',
    language: 'ar',
    content: 'ابحث عن مخيم...',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.tab.active.ar',
    language: 'ar',
    content: 'الجارية',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.tab.expired.ar',
    language: 'ar',
    content: 'المنتهية',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.empty.active.title.ar',
    language: 'ar',
    content: 'لا توجد مخيمات جارية حالياً',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.empty.active.description.ar',
    language: 'ar',
    content: 'تابعنا للحصول على آخر التحديثات عن المخيمات القادمة',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.empty.expired.title.ar',
    language: 'ar',
    content: 'لا توجد مخيمات منتهية',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.empty.expired.description.ar',
    language: 'ar',
    content: 'سيتم عرض المخيمات المنتهية هنا',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.expired.badge.ar',
    language: 'ar',
    content: 'منتهي',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.charity.badge.ar',
    language: 'ar',
    content: 'مخيم خيري',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.registrations.ar',
    language: 'ar',
    content: 'تسجيل',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.confirmed.ar',
    language: 'ar',
    content: 'مؤكد',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.attended.ar',
    language: 'ar',
    content: 'حضر',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.view.details.ar',
    language: 'ar',
    content: 'عرض التفاصيل',
    section: 'camps',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.register.ar',
    language: 'ar',
    content: 'سجّل الآن',
    section: 'camps',
    type: 'button' as const,
    isActive: 'yes' as const,
  },

  // Camps Page - صفحة المخيمات (English)
  {
    key: 'camps.about.title.en',
    language: 'en',
    content: 'About Charitable Medical Camps',
    section: 'camps',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.about.description.en',
    language: 'en',
    content:
      'The organization of charitable medical camps comes within our initiatives as part of social responsibility, where we strive to provide high-quality medical services to the needy and deserving at nominal prices or for free. The camps are supervised by a selection of the best specialized doctors and surgeons, with the provision of the latest medical equipment and technologies.',
    section: 'camps',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.search.placeholder.en',
    language: 'en',
    content: 'Search for a camp...',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.tab.active.en',
    language: 'en',
    content: 'Active',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.tab.expired.en',
    language: 'en',
    content: 'Expired',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.empty.active.title.en',
    language: 'en',
    content: 'No active camps currently',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.empty.active.description.en',
    language: 'en',
    content: 'Follow us for the latest updates on upcoming camps',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.empty.expired.title.en',
    language: 'en',
    content: 'No expired camps',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.empty.expired.description.en',
    language: 'en',
    content: 'Expired camps will be displayed here',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.expired.badge.en',
    language: 'en',
    content: 'Expired',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.charity.badge.en',
    language: 'en',
    content: 'Charity Camp',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.registrations.en',
    language: 'en',
    content: 'Registrations',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.confirmed.en',
    language: 'en',
    content: 'Confirmed',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.attended.en',
    language: 'en',
    content: 'Attended',
    section: 'camps',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.view.details.en',
    language: 'en',
    content: 'View Details',
    section: 'camps',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'camps.card.register.en',
    language: 'en',
    content: 'Register Now',
    section: 'camps',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
];

// نصوص صفحة OffersListPage
const offersListTexts = [
  // Hero Section
  {
    key: 'offers.list.hero.title.ar',
    language: 'ar',
    content: 'عروضنا الطبية المميزة',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.hero.title.en',
    language: 'en',
    content: 'Our Special Medical Offers',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.hero.description.ar',
    language: 'ar',
    content: 'استفد من عروضنا الخاصة على مختلف الخدمات الطبية بأسعار تنافسية',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.hero.description.en',
    language: 'en',
    content:
      'Take advantage of our special offers on various medical services at competitive prices',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  // Search
  {
    key: 'offers.list.search.placeholder.ar',
    language: 'ar',
    content: 'ابحث عن عرض...',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.search.placeholder.en',
    language: 'en',
    content: 'Search for an offer...',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  // Tabs
  {
    key: 'offers.list.tab.active.ar',
    language: 'ar',
    content: 'العروض الجارية',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.tab.active.en',
    language: 'en',
    content: 'Active Offers',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.tab.expired.ar',
    language: 'ar',
    content: 'المنتهية',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.tab.expired.en',
    language: 'en',
    content: 'Expired',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  // Empty States
  {
    key: 'offers.list.empty.active.title.ar',
    language: 'ar',
    content: 'لا توجد عروض جارية حالياً',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.empty.active.title.en',
    language: 'en',
    content: 'No active offers currently',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.empty.active.search.ar',
    language: 'ar',
    content: 'لم يتم العثور على عروض جارية مطابقة للبحث',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.empty.active.search.en',
    language: 'en',
    content: 'No active offers found matching your search',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.empty.expired.title.ar',
    language: 'ar',
    content: 'لا توجد عروض منتهية',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.empty.expired.title.en',
    language: 'en',
    content: 'No expired offers',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.empty.expired.search.ar',
    language: 'ar',
    content: 'لم يتم العثور على عروض منتهية مطابقة للبحث',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.empty.expired.search.en',
    language: 'en',
    content: 'No expired offers found matching your search',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  // Card Badges
  {
    key: 'offers.list.card.special.ar',
    language: 'ar',
    content: 'عرض خاص',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.card.special.en',
    language: 'en',
    content: 'Special Offer',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.card.expired.ar',
    language: 'ar',
    content: 'منتهي',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.card.expired.en',
    language: 'en',
    content: 'Expired',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  // Card Buttons
  {
    key: 'offers.list.card.view.details.ar',
    language: 'ar',
    content: 'عرض التفاصيل',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.card.view.details.en',
    language: 'en',
    content: 'View Details',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.card.request.ar',
    language: 'ar',
    content: 'اطلب العرض',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.card.request.en',
    language: 'en',
    content: 'Request Offer',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  // Date Label
  {
    key: 'offers.list.card.valid.until.ar',
    language: 'ar',
    content: 'صالح حتى',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.list.card.valid.until.en',
    language: 'en',
    content: 'Valid until',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
];

// نصوص صفحة OfferDetailPage
const offerDetailTexts = [
  // Breadcrumb
  {
    key: 'offers.detail.breadcrumb.home.ar',
    language: 'ar',
    content: 'الرئيسية',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.breadcrumb.home.en',
    language: 'en',
    content: 'Home',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.breadcrumb.offers.ar',
    language: 'ar',
    content: 'العروض',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.breadcrumb.offers.en',
    language: 'en',
    content: 'Offers',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  // Hero
  {
    key: 'offers.detail.hero.badge.ar',
    language: 'ar',
    content: 'عرض خاص محدود',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.badge.en',
    language: 'en',
    content: 'Limited Special Offer',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.book.now.ar',
    language: 'ar',
    content: 'احجز الآن',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.book.now.en',
    language: 'en',
    content: 'Book Now',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.duration.ar',
    language: 'ar',
    content: 'مدة العرض',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.duration.en',
    language: 'en',
    content: 'Offer Duration',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.until.ar',
    language: 'ar',
    content: 'حتى',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.until.en',
    language: 'en',
    content: 'Until',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.remaining.ar',
    language: 'ar',
    content: 'متبقي',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.remaining.en',
    language: 'en',
    content: 'Remaining',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.day.ar',
    language: 'ar',
    content: 'يوم',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.day.en',
    language: 'en',
    content: 'day',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.days.ar',
    language: 'ar',
    content: 'أيام',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.hero.days.en',
    language: 'en',
    content: 'days',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  // What's Included
  {
    key: 'offers.detail.included.title.ar',
    language: 'ar',
    content: 'ماذا يشمل العرض',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.title.en',
    language: 'en',
    content: "What's Included",
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.checkup.title.ar',
    language: 'ar',
    content: 'فحص شامل',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.checkup.title.en',
    language: 'en',
    content: 'Comprehensive Checkup',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.checkup.desc.ar',
    language: 'ar',
    content: 'فحص طبي كامل مع أحدث الأجهزة',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.checkup.desc.en',
    language: 'en',
    content: 'Complete medical examination with latest equipment',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.consultation.title.ar',
    language: 'ar',
    content: 'استشارة مجانية',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.consultation.title.en',
    language: 'en',
    content: 'Free Consultation',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.consultation.desc.ar',
    language: 'ar',
    content: 'استشارة طبية مع أفضل الأطباء',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.consultation.desc.en',
    language: 'en',
    content: 'Medical consultation with the best doctors',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.followup.title.ar',
    language: 'ar',
    content: 'متابعة مجانية',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.followup.title.en',
    language: 'en',
    content: 'Free Follow-up',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.followup.desc.ar',
    language: 'ar',
    content: 'متابعة لمدة شهر بعد العلاج',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.followup.desc.en',
    language: 'en',
    content: 'Follow-up for one month after treatment',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.discount.title.ar',
    language: 'ar',
    content: 'خصم حصري',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.discount.title.en',
    language: 'en',
    content: 'Exclusive Discount',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.discount.desc.ar',
    language: 'ar',
    content: 'خصم خاص على الخدمات الإضافية',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.included.discount.desc.en',
    language: 'en',
    content: 'Special discount on additional services',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  // Form
  {
    key: 'offers.detail.form.urgency.ar',
    language: 'ar',
    content: 'العرض ينتهي خلال',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.urgency.en',
    language: 'en',
    content: 'Offer ends in',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.urgency.book.now.ar',
    language: 'ar',
    content: 'احجز الآن!',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.urgency.book.now.en',
    language: 'en',
    content: 'Book Now!',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.title.ar',
    language: 'ar',
    content: 'احجز العرض الآن',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.title.en',
    language: 'en',
    content: 'Book the Offer Now',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.description.ar',
    language: 'ar',
    content: 'املأ النموذج وسنتواصل معك في أقرب وقت لتأكيد الحجز',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.description.en',
    language: 'en',
    content: 'Fill out the form and we will contact you as soon as possible to confirm the booking',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.fullname.ar',
    language: 'ar',
    content: 'الاسم الكامل',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.fullname.en',
    language: 'en',
    content: 'Full Name',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.fullname.placeholder.ar',
    language: 'ar',
    content: 'أدخل اسمك الكامل',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.fullname.placeholder.en',
    language: 'en',
    content: 'Enter your full name',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.phone.ar',
    language: 'ar',
    content: 'رقم الهاتف',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.phone.en',
    language: 'en',
    content: 'Phone Number',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.phone.placeholder.ar',
    language: 'ar',
    content: 'مثال: 771234567',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.phone.placeholder.en',
    language: 'en',
    content: 'Example: 771234567',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.email.ar',
    language: 'ar',
    content: 'البريد الإلكتروني (اختياري)',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.email.en',
    language: 'en',
    content: 'Email (Optional)',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.email.placeholder.ar',
    language: 'ar',
    content: 'example@email.com',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.email.placeholder.en',
    language: 'en',
    content: 'example@email.com',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.age.ar',
    language: 'ar',
    content: 'العمر',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.age.en',
    language: 'en',
    content: 'Age',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.age.placeholder.ar',
    language: 'ar',
    content: 'مثال: 35',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.age.placeholder.en',
    language: 'en',
    content: 'Example: 35',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.gender.ar',
    language: 'ar',
    content: 'الجنس',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.gender.en',
    language: 'en',
    content: 'Gender',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.gender.male.ar',
    language: 'ar',
    content: 'ذكر',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.gender.male.en',
    language: 'en',
    content: 'Male',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.gender.female.ar',
    language: 'ar',
    content: 'أنثى',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.gender.female.en',
    language: 'en',
    content: 'Female',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.message.ar',
    language: 'ar',
    content: 'رسالة أو ملاحظة (اختياري)',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.message.en',
    language: 'en',
    content: 'Message or Note (Optional)',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.message.placeholder.ar',
    language: 'ar',
    content: 'أي معلومات إضافية تودّ إضافتها...',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.message.placeholder.en',
    language: 'en',
    content: 'Any additional information you would like to add...',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.submit.ar',
    language: 'ar',
    content: 'احجز العرض الآن',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.submit.en',
    language: 'en',
    content: 'Book the Offer Now',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.sending.ar',
    language: 'ar',
    content: 'جاري الإرسال...',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.sending.en',
    language: 'en',
    content: 'Sending...',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.trust.secure.ar',
    language: 'ar',
    content: 'حجز آمن',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.trust.secure.en',
    language: 'en',
    content: 'Secure Booking',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.trust.immediate.ar',
    language: 'ar',
    content: 'رد فوري',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.trust.immediate.en',
    language: 'en',
    content: 'Immediate Response',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.trust.prices.ar',
    language: 'ar',
    content: 'أسعار مميزة',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.trust.prices.en',
    language: 'en',
    content: 'Best Prices',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.contact.ar',
    language: 'ar',
    content: 'أو اتصل بنا مباشرة على',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.form.contact.en',
    language: 'en',
    content: 'Or call us directly at',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  // Expired
  {
    key: 'offers.detail.expired.title.ar',
    language: 'ar',
    content: 'العرض منتهي',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.expired.title.en',
    language: 'en',
    content: 'Offer Expired',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.expired.description.ar',
    language: 'ar',
    content:
      'هذا العرض قد انتهى ولا يمكن الحجز فيه حالياً. تابعنا للحصول على آخر التحديثات عن العروض القادمة.',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.expired.description.en',
    language: 'en',
    content:
      'This offer has expired and cannot be booked at this time. Follow us for the latest updates on upcoming offers.',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.expired.button.ar',
    language: 'ar',
    content: 'تصفح العروض الأخرى',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.expired.button.en',
    language: 'en',
    content: 'Browse Other Offers',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  // Not Found
  {
    key: 'offers.detail.notfound.title.ar',
    language: 'ar',
    content: 'لم يتم العثور على العرض',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.notfound.title.en',
    language: 'en',
    content: 'Offer Not Found',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.notfound.description.ar',
    language: 'ar',
    content:
      'عذراً، لم نتمكن من العثور على العرض المطلوب. قد يكون العرض منتهياً أو الرابط غير صحيح.',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.notfound.description.en',
    language: 'en',
    content:
      'Sorry, we could not find the requested offer. The offer may have expired or the link may be incorrect.',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.notfound.button.ar',
    language: 'ar',
    content: 'تصفح العروض المتاحة',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.notfound.button.en',
    language: 'en',
    content: 'Browse Available Offers',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  // Contact Section
  {
    key: 'offers.detail.contact.title.ar',
    language: 'ar',
    content: 'هل لديك استفسار؟',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.contact.title.en',
    language: 'en',
    content: 'Do you have a question?',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.contact.description.ar',
    language: 'ar',
    content: 'تواصل معنا الآن',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.contact.description.en',
    language: 'en',
    content: 'Contact us now',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.contact.whatsapp.ar',
    language: 'ar',
    content: 'واتساب',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.contact.whatsapp.en',
    language: 'en',
    content: 'WhatsApp',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.contact.whatsapp.message.ar',
    language: 'ar',
    content: 'مرحباً، أود الاستفسار عن العرض',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.detail.contact.whatsapp.message.en',
    language: 'en',
    content: 'Hello, I would like to inquire about the offer',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
];

// نصوص صفحة OffersPage (الصفحة الرئيسية للعروض)
const offersPageTexts = [
  {
    key: 'offers.page.empty.title.ar',
    language: 'ar',
    content: 'لا توجد عروض متاحة حالياً',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.empty.title.en',
    language: 'en',
    content: 'No offers available currently',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.card.selected.ar',
    language: 'ar',
    content: 'تم الاختيار',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.card.selected.en',
    language: 'en',
    content: 'Selected',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.card.select.ar',
    language: 'ar',
    content: 'اختر هذا العرض',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.card.select.en',
    language: 'en',
    content: 'Select This Offer',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.card.valid.until.ar',
    language: 'ar',
    content: 'العرض ساري حتى',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.card.valid.until.en',
    language: 'en',
    content: 'Offer valid until',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.title.ar',
    language: 'ar',
    content: 'سجل الآن',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.title.en',
    language: 'en',
    content: 'Register Now',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.description.ar',
    language: 'ar',
    content: 'أكمل بياناتك وسنتواصل معك خلال 24 ساعة',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.description.en',
    language: 'en',
    content: 'Complete your information and we will contact you within 24 hours',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.fullname.ar',
    language: 'ar',
    content: 'الاسم الكامل',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.fullname.en',
    language: 'en',
    content: 'Full Name',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.fullname.placeholder.ar',
    language: 'ar',
    content: 'أدخل اسمك الكامل',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.fullname.placeholder.en',
    language: 'en',
    content: 'Enter your full name',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.phone.ar',
    language: 'ar',
    content: 'رقم الهاتف',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.phone.en',
    language: 'en',
    content: 'Phone Number',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.phone.placeholder.ar',
    language: 'ar',
    content: 'مثال: 771234567',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.phone.placeholder.en',
    language: 'en',
    content: 'Example: 771234567',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.email.ar',
    language: 'ar',
    content: 'البريد الإلكتروني (اختياري)',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.email.en',
    language: 'en',
    content: 'Email (Optional)',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.email.placeholder.ar',
    language: 'ar',
    content: 'example@email.com',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.email.placeholder.en',
    language: 'en',
    content: 'example@email.com',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.notes.ar',
    language: 'ar',
    content: 'ملاحظات إضافية',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.notes.en',
    language: 'en',
    content: 'Additional Notes',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.notes.placeholder.ar',
    language: 'ar',
    content: 'أي معلومات إضافية تود مشاركتها...',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.notes.placeholder.en',
    language: 'en',
    content: 'Any additional information you would like to share...',
    section: 'offers',
    type: 'text' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.submit.ar',
    language: 'ar',
    content: 'تسجيل الآن',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.submit.en',
    language: 'en',
    content: 'Register Now',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.registering.ar',
    language: 'ar',
    content: 'جاري التسجيل...',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.form.registering.en',
    language: 'en',
    content: 'Registering...',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.success.title.ar',
    language: 'ar',
    content: 'تم التسجيل بنجاح!',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.success.title.en',
    language: 'en',
    content: 'Registration Successful!',
    section: 'offers',
    type: 'title' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.success.description.ar',
    language: 'ar',
    content: 'شكراً لاهتمامك بعروضنا الطبية. سيتواصل معك فريقنا خلال 24 ساعة.',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.success.description.en',
    language: 'en',
    content:
      'Thank you for your interest in our medical offers. Our team will contact you within 24 hours.',
    section: 'offers',
    type: 'description' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.success.button.ar',
    language: 'ar',
    content: 'العودة للعروض',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
  {
    key: 'offers.page.success.button.en',
    language: 'en',
    content: 'Back to Offers',
    section: 'offers',
    type: 'button' as const,
    isActive: 'yes' as const,
  },
];

// الصور الأولية
const initialImages = [
  {
    key: 'hero.logo.ar',
    url: '/tenant-assets/logo-color.png',
    alt: 'شعار المستشفى',
    section: 'hero',
    width: 200,
    height: 200,
    format: 'png',
    size: 0,
    isActive: 'yes' as const,
  },
  {
    key: 'hero.logo.en',
    url: '/tenant-assets/logo-color.png',
    alt: 'Hospital Logo',
    section: 'hero',
    width: 200,
    height: 200,
    format: 'png',
    size: 0,
    isActive: 'yes' as const,
  },
  {
    key: 'about.hospital.ar',
    url: '/assets/images/hospital.jpg',
    alt: 'صورة المستشفى',
    section: 'about',
    width: 1200,
    height: 675,
    format: 'jpg',
    size: 0,
    isActive: 'yes' as const,
  },
  {
    key: 'about.hospital.en',
    url: '/assets/images/hospital.jpg',
    alt: 'Hospital Image',
    section: 'about',
    width: 1200,
    height: 675,
    format: 'jpg',
    size: 0,
    isActive: 'yes' as const,
  },
];

async function seedInitialContent() {
  try {
    console.warn('بدء إضافة المحتوى الأولي...');

    // قراءة DATABASE_URL من متغيرات البيئة
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ خطأ: DATABASE_URL غير موجود في متغيرات البيئة');
      process.exit(1);
    }

    console.warn('✅ تم العثور على DATABASE_URL');

    // إنشاء اتصال مباشر بقاعدة البيانات
    const connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection, { schema, mode: 'default' });

    console.warn('✅ تم الاتصال بقاعدة البيانات بنجاح');

    for (const content of initialContent) {
      // التحقق من وجود المحتوى
      const existing = await db
        .select()
        .from(schema.textContent)
        .where(
          and(
            eq(schema.textContent.key, content.key),
            eq(schema.textContent.language, content.language)
          )
        );

      if (existing.length === 0) {
        await db.insert(schema.textContent).values(content);
        console.warn(`✅ تم إضافة: ${content.key} (${content.language})`);
      } else {
        console.warn(`⏭️  موجود بالفعل: ${content.key} (${content.language})`);
      }
    }

    console.warn('✅ تم إكمال إضافة المحتوى الأولي بنجاح');

    // إضافة نصوص صفحة OffersListPage
    console.warn('بدء إضافة نصوص صفحة OffersListPage...');
    for (const content of offersListTexts) {
      const existing = await db
        .select()
        .from(schema.textContent)
        .where(
          and(
            eq(schema.textContent.key, content.key),
            eq(schema.textContent.language, content.language)
          )
        );

      if (existing.length === 0) {
        await db.insert(schema.textContent).values(content);
        console.warn(`✅ تم إضافة: ${content.key} (${content.language})`);
      } else {
        console.warn(`⏭️  موجود بالفعل: ${content.key} (${content.language})`);
      }
    }

    console.warn('✅ تم إكمال إضافة نصوص صفحة OffersListPage بنجاح');

    // إضافة نصوص صفحة OfferDetailPage
    console.warn('بدء إضافة نصوص صفحة OfferDetailPage...');
    for (const content of offerDetailTexts) {
      const existing = await db
        .select()
        .from(schema.textContent)
        .where(
          and(
            eq(schema.textContent.key, content.key),
            eq(schema.textContent.language, content.language)
          )
        );

      if (existing.length === 0) {
        await db.insert(schema.textContent).values(content);
        console.warn(`✅ تم إضافة: ${content.key} (${content.language})`);
      } else {
        console.warn(`⏭️  موجود بالفعل: ${content.key} (${content.language})`);
      }
    }

    console.warn('✅ تم إكمال إضافة نصوص صفحة OfferDetailPage بنجاح');

    // إضافة نصوص صفحة OffersPage
    console.warn('بدء إضافة نصوص صفحة OffersPage...');
    for (const content of offersPageTexts) {
      const existing = await db
        .select()
        .from(schema.textContent)
        .where(
          and(
            eq(schema.textContent.key, content.key),
            eq(schema.textContent.language, content.language)
          )
        );

      if (existing.length === 0) {
        await db.insert(schema.textContent).values(content);
        console.warn(`✅ تم إضافة: ${content.key} (${content.language})`);
      } else {
        console.warn(`⏭️  موجود بالفعل: ${content.key} (${content.language})`);
      }
    }

    console.warn('✅ تم إكمال إضافة نصوص صفحة OffersPage بنجاح');

    // إضافة الصور الأولية
    console.warn('بدء إضافة الصور الأولية...');
    for (const image of initialImages) {
      const existing = await db
        .select()
        .from(schema.images)
        .where(eq(schema.images.key, image.key));

      if (existing.length === 0) {
        await db.insert(schema.images).values(image);
        console.warn(`✅ تم إضافة الصورة: ${image.key}`);
      } else {
        console.warn(`⏭️  موجودة بالفعل: ${image.key}`);
      }
    }

    console.warn('✅ تم إكمال إضافة الصور الأولي بنجاح');

    // إغلاق الاتصال
    await connection.end();
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
