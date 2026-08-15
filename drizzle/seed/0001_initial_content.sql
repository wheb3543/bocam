-- Seed Initial Content
-- إضافة المحتوى الأولي للواجهات العامة

-- Hero Section - الصفحة الرئيسية (Arabic)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('hero.title', 'ar', 'خدمات طبية متميزة بأعلى معايير الجودة', 'hero', 'title', 'yes', NOW(), NOW()),
  ('hero.subtitle', 'ar', 'خدمات طبية متميزة بأعلى معايير الجودة', 'hero', 'subtitle', 'yes', NOW(), NOW()),
  ('hero.description', 'ar', 'احجز موعدك مع أفضل الأطباء في صنعاء', 'hero', 'description', 'yes', NOW(), NOW()),
  ('hero.button.text', 'ar', 'احجز موعدك الآن', 'hero', 'button', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Hero Section - الصفحة الرئيسية (English)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('hero.title', 'en', 'Premium Medical Services with Highest Quality Standards', 'hero', 'title', 'yes', NOW(), NOW()),
  ('hero.subtitle', 'en', 'Premium Medical Services with Highest Quality Standards', 'hero', 'subtitle', 'yes', NOW(), NOW()),
  ('hero.description', 'en', 'Book your appointment with the best doctors in Sana\'a', 'hero', 'description', 'yes', NOW(), NOW()),
  ('hero.button.text', 'en', 'Book Appointment Now', 'hero', 'button', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Doctors Page - صفحة الأطباء (Arabic)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('doctors.title', 'ar', 'أطباؤنا المتميزون', 'doctors', 'title', 'yes', NOW(), NOW()),
  ('doctors.description', 'ar', 'فريق طبي متكامل من أفضل الأطباء في مختلف التخصصات', 'doctors', 'description', 'yes', NOW(), NOW()),
  ('doctors.badge', 'ar', 'أطباء متخصصون', 'doctors', 'text', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Doctors Page - صفحة الأطباء (English)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('doctors.title', 'en', 'Our Distinguished Doctors', 'doctors', 'title', 'yes', NOW(), NOW()),
  ('doctors.description', 'en', 'An integrated medical team of the best doctors in various specialties', 'doctors', 'description', 'yes', NOW(), NOW()),
  ('doctors.badge', 'en', 'Specialized Doctors', 'doctors', 'text', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Offers Page - صفحة العروض (Arabic)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('offers.title', 'ar', 'العروض الطبية', 'offers', 'title', 'yes', NOW(), NOW()),
  ('offers.description', 'ar', 'استفد من عروضنا الطبية المميزة بأسعار تنافسية وخدمات عالية الجودة', 'offers', 'description', 'yes', NOW(), NOW()),
  ('offers.badge', 'ar', 'عروض خاصة', 'offers', 'text', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Offers Page - صفحة العروض (English)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('offers.title', 'en', 'Medical Offers', 'offers', 'title', 'yes', NOW(), NOW()),
  ('offers.description', 'en', 'Benefit from our distinguished medical offers at competitive prices and high-quality services', 'offers', 'description', 'yes', NOW(), NOW()),
  ('offers.badge', 'en', 'Special Offers', 'offers', 'text', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Camps Page - صفحة المخيمات (Arabic)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('camps.title', 'ar', 'المخيمات الطبية الخيرية', 'camps', 'title', 'yes', NOW(), NOW()),
  ('camps.description', 'ar', 'مبادراتنا الإنسانية في إطار المسؤولية المجتمعية لخدمة المحتاجين', 'camps', 'description', 'yes', NOW(), NOW()),
  ('camps.badge', 'ar', 'مخيمات خيرية', 'camps', 'text', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Camps Page - صفحة المخيمات (English)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('camps.title', 'en', 'Charitable Medical Camps', 'camps', 'title', 'yes', NOW(), NOW()),
  ('camps.description', 'en', 'Our humanitarian initiatives within the framework of social responsibility to serve those in need', 'camps', 'description', 'yes', NOW(), NOW()),
  ('camps.badge', 'en', 'Charitable Camps', 'camps', 'text', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Privacy Policy - سياسة الخصوصية (Arabic)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('privacy.title', 'ar', 'سياسة الخصوصية', 'privacy', 'title', 'yes', NOW(), NOW()),
  ('privacy.badge', 'ar', 'حماية البيانات', 'privacy', 'text', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Privacy Policy - سياسة الخصوصية (English)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('privacy.title', 'en', 'Privacy Policy', 'privacy', 'title', 'yes', NOW(), NOW()),
  ('privacy.badge', 'en', 'Data Protection', 'privacy', 'text', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Thank You - صفحة الشكر (Arabic)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('thankyou.title', 'ar', 'تم التسجيل بنجاح!', 'thankyou', 'title', 'yes', NOW(), NOW()),
  ('thankyou.subtitle', 'ar', 'شكراً لك، تم استلام طلبك بنجاح', 'thankyou', 'subtitle', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();

-- Thank You - صفحة الشكر (English)
INSERT INTO textContent (key, language, content, section, type, isActive, createdAt, updatedAt)
VALUES 
  ('thankyou.title', 'en', 'Registration Successful!', 'thankyou', 'title', 'yes', NOW(), NOW()),
  ('thankyou.subtitle', 'en', 'Thank you, your request has been received successfully', 'thankyou', 'subtitle', 'yes', NOW(), NOW())
ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW();
