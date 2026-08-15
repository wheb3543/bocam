-- Seed Script for Homepage Data
-- سكريبت إضافة بيانات الصفحة الرئيسية إلى قاعدة البيانات

-- 1. Insert Homepage Page
-- إدراج صفحة الصفحة الرئيسية
INSERT INTO pages (name, slug, type, parentId, titleAr, titleEn, metaTitleAr, metaTitleEn, metaDescriptionAr, metaDescriptionEn, keywordsAr, keywordsEn, isActive, sortOrder) 
VALUES 
('الصفحة الرئيسية', 'home', 'main', NULL, 'الصفحة الرئيسية', 'Home Page', 'مستشفى بوكم - صنعاء | احجز موعدك الآن', 'Bocam Hospital - Sana\'a | Book Your Appointment Now', 'احجز موعدك مع أفضل الأطباء في مستشفى بوكم بصنعاء. خدمات طبية متميزة، عروض خاصة، ومخيمات صحية مجانية.', 'Book your appointment with the best doctors at Bocam Hospital in Sana\'a. Excellent medical services, special offers, and free medical camps.', 'مستشفى بوكم, صنعاء, حجز موعد, أطباء, عروض طبية, مخيمات صحية, استشارات طبية', 'Bocam Hospital, Sana\'a, book appointment, doctors, medical offers, health camps, medical consultations', 'yes', 1);

-- Get the homepage ID (assuming it will be ID 1)
SET @homepage_id = LAST_INSERT_ID();

-- 2. Insert Text Content for Homepage
-- إدراج المحتوى النصي للصفحة الرئيسية

-- Hero Section
INSERT INTO textContent (key, language, content, section, pageId, type, isActive) VALUES
('hero.title.ar', 'ar', 'مستشفى بوكم - رعايتك الصحية الأولى', 'hero', @homepage_id, 'title', 'yes'),
('hero.title.en', 'en', 'Bocam Hospital - Your First Health Care', 'hero', @homepage_id, 'title', 'yes'),
('hero.subtitle.ar', 'ar', 'خدمات طبية متميزة بأعلى معايير الجودة', 'hero', @homepage_id, 'subtitle', 'yes'),
('hero.subtitle.en', 'en', 'Excellent medical services with highest quality standards', 'hero', @homepage_id, 'subtitle', 'yes'),
('hero.description.ar', 'ar', 'احجز موعدك مع أفضل الأطباء في صنعاء', 'hero', @homepage_id, 'description', 'yes'),
('hero.description.en', 'en', 'Book your appointment with the best doctors in Sana\'a', 'hero', @homepage_id, 'description', 'yes'),
('hero.button.ar', 'ar', 'احجز موعدك الآن', 'hero', @homepage_id, 'button', 'yes'),
('hero.button.en', 'en', 'Book Your Appointment Now', 'hero', @homepage_id, 'button', 'yes');

-- Stats Section
INSERT INTO textContent (key, language, content, section, pageId, type, isActive) VALUES
('stats.doctors.label.ar', 'ar', 'طبيب واستشاري', 'stats', @homepage_id, 'text', 'yes'),
('stats.doctors.label.en', 'en', 'Doctors and Consultants', 'stats', @homepage_id, 'text', 'yes'),
('stats.specialties.label.ar', 'ar', 'تخصص طبي', 'stats', @homepage_id, 'text', 'yes'),
('stats.specialties.label.en', 'en', 'Medical Specialties', 'stats', @homepage_id, 'text', 'yes'),
('stats.patients.label.ar', 'ar', 'مريض سعيد', 'stats', @homepage_id, 'text', 'yes'),
('stats.patients.label.en', 'en', 'Happy Patients', 'stats', @homepage_id, 'text', 'yes'),
('stats.service.label.ar', 'ar', 'خدمة متواصلة', 'stats', @homepage_id, 'text', 'yes'),
('stats.service.label.en', 'en', 'Continuous Service', 'stats', @homepage_id, 'text', 'yes');

-- Services Section
INSERT INTO textContent (key, language, content, section, pageId, type, isActive) VALUES
('services.title.ar', 'ar', 'خدماتنا الإلكترونية', 'services', @homepage_id, 'title', 'yes'),
('services.title.en', 'en', 'Our Electronic Services', 'services', @homepage_id, 'title', 'yes'),
('services.description.ar', 'ar', 'نوفر لك منصة إلكترونية متكاملة لحجز المواعيد مع الأطباء والاستشاريين في مختلف التخصصات، الاستفادة من العروض الطبية المميزة والخصومات الخاصة، والمشاركة في المخيمات الطبية الخيرية المجانية التي ننظمها بشكل دوري لخدمة المجتمع. تجربة حجز سهلة وسريعة في متناول يدك.', 'services', @homepage_id, 'description', 'yes'),
('services.description.en', 'en', 'We provide you with an integrated electronic platform for booking appointments with doctors and consultants in various specialties, benefiting from special medical offers and discounts, and participating in free charitable medical camps that we organize periodically to serve the community. An easy and fast booking experience at your fingertips.', 'services', @homepage_id, 'description', 'yes'),
('services.doctors.title.ar', 'ar', 'حجز مواعيد الأطباء', 'services', @homepage_id, 'title', 'yes'),
('services.doctors.title.en', 'en', 'Doctor Appointments', 'services', @homepage_id, 'title', 'yes'),
('services.doctors.description.ar', 'ar', 'احجز موعدك مع أفضل الأطباء والاستشاريين في مختلف التخصصات', 'services', @homepage_id, 'description', 'yes'),
('services.doctors.description.en', 'en', 'Book your appointment with the best doctors and consultants in various specialties', 'services', @homepage_id, 'description', 'yes'),
('services.offers.title.ar', 'ar', 'العروض الطبية', 'services', @homepage_id, 'title', 'yes'),
('services.offers.title.en', 'en', 'Medical Offers', 'services', @homepage_id, 'title', 'yes'),
('services.offers.description.ar', 'ar', 'استفد من عروضنا الطبية المميزة بأسعار تنافسية وخدمات متكاملة', 'services', @homepage_id, 'description', 'yes'),
('services.offers.description.en', 'en', 'Benefit from our special medical offers at competitive prices with integrated services', 'services', @homepage_id, 'description', 'yes'),
('services.camps.title.ar', 'ar', 'المخيمات الطبية الخيرية', 'services', @homepage_id, 'title', 'yes'),
('services.camps.title.en', 'en', 'Charitable Medical Camps', 'services', @homepage_id, 'title', 'yes'),
('services.camps.description.ar', 'ar', 'خدمات طبية مجانية للمجتمع ضمن مسؤوليتنا الاجتماعية', 'services', @homepage_id, 'description', 'yes'),
('services.camps.description.en', 'en', 'Free medical services for the community as part of our social responsibility', 'services', @homepage_id, 'description', 'yes'),
('services.explore.button.ar', 'ar', 'استكشف الآن', 'services', @homepage_id, 'button', 'yes'),
('services.explore.button.en', 'en', 'Explore Now', 'services', @homepage_id, 'button', 'yes');

-- About Section
INSERT INTO textContent (key, language, content, section, pageId, type, isActive) VALUES
('about.title.ar', 'ar', 'عن مستشفى بوكم', 'about', @homepage_id, 'title', 'yes'),
('about.title.en', 'en', 'About Bocam Hospital', 'about', @homepage_id, 'title', 'yes'),
('about.description.ar', 'ar', 'مستشفى بوكم هو أحد أبرز المؤسسات الصحية في اليمن، حيث نقدم خدمات طبية متميزة بمعايير عالمية. نحن ملتزمون بتوفير رعاية صحية شاملة ومتكاملة لجميع المرضى، مع نخبة من الأطباء والاستشاريين المتخصصين في مختلف التخصصات الطبية. نؤمن بأهمية المسؤولية المجتمعية، ولذلك نقيم بشكل دوري مخيمات طبية خيرية مجانية لخدمة المجتمع وتقديم الرعاية الصحية للمحتاجين.', 'about', @homepage_id, 'description', 'yes'),
('about.description.en', 'en', 'Bocam Hospital is one of the most prominent health institutions in Yemen, where we provide excellent medical services with world-class standards. We are committed to providing comprehensive and integrated health care for all patients, with a team of specialized doctors and consultants in various medical specialties. We believe in the importance of social responsibility, and therefore we periodically organize free charitable medical camps to serve the community and provide health care to those in need.', 'about', @homepage_id, 'description', 'yes'),
('about.features.global.title.ar', 'ar', 'معايير عالمية', 'about', @homepage_id, 'title', 'yes'),
('about.features.global.title.en', 'en', 'World-Class Standards', 'about', @homepage_id, 'title', 'yes'),
('about.features.global.description.ar', 'ar', 'نقدم خدمات طبية متميزة بمعايير عالمية', 'about', @homepage_id, 'description', 'yes'),
('about.features.global.description.en', 'en', 'We provide excellent medical services with world-class standards', 'about', @homepage_id, 'description', 'yes'),
('about.features.comprehensive.title.ar', 'ar', 'رعاية شاملة', 'about', @homepage_id, 'title', 'yes'),
('about.features.comprehensive.title.en', 'en', 'Comprehensive Care', 'about', @homepage_id, 'title', 'yes'),
('about.features.comprehensive.description.ar', 'ar', 'رعاية صحية متكاملة لجميع المرضى', 'about', @homepage_id, 'description', 'yes'),
('about.features.comprehensive.description.en', 'en', 'Integrated health care for all patients', 'about', @homepage_id, 'description', 'yes'),
('about.features.specialized.title.ar', 'ar', 'أطباء متخصصون', 'about', @homepage_id, 'title', 'yes'),
('about.features.specialized.title.en', 'en', 'Specialized Doctors', 'about', @homepage_id, 'title', 'yes'),
('about.features.specialized.description.ar', 'ar', 'نخبة من الأطباء والاستشاريين المتخصصين', 'about', @homepage_id, 'description', 'yes'),
('about.features.specialized.description.en', 'en', 'A team of specialized doctors and consultants', 'about', @homepage_id, 'description', 'yes');

-- CTA Section
INSERT INTO textContent (key, language, content, section, pageId, type, isActive) VALUES
('cta.title.ar', 'ar', 'ابدأ رحلتك الصحية معنا', 'cta', @homepage_id, 'title', 'yes'),
('cta.title.en', 'en', 'Start Your Health Journey With Us', 'cta', @homepage_id, 'title', 'yes'),
('cta.description.ar', 'ar', 'فريقنا الطبي جاهز لتقديم أفضل الرعاية الصحية لك وعائلتك', 'cta', @homepage_id, 'description', 'yes'),
('cta.description.en', 'en', 'Our medical team is ready to provide the best health care for you and your family', 'cta', @homepage_id, 'description', 'yes'),
('cta.book.button.ar', 'ar', 'احجز موعدك', 'cta', @homepage_id, 'button', 'yes'),
('cta.book.button.en', 'en', 'Book Your Appointment', 'cta', @homepage_id, 'button', 'yes'),
('cta.call.button.ar', 'ar', 'اتصل بنا', 'cta', @homepage_id, 'button', 'yes'),
('cta.call.button.en', 'en', 'Call Us', 'cta', @homepage_id, 'button', 'yes');

-- Accessibility
INSERT INTO textContent (key, language, content, section, pageId, type, isActive) VALUES
('accessibility.skip.link.ar', 'ar', 'تخطى إلى المحتوى الرئيسي', 'accessibility', @homepage_id, 'text', 'yes'),
('accessibility.skip.link.en', 'en', 'Skip to main content', 'accessibility', @homepage_id, 'text', 'yes'),
('accessibility.back.to.top.ar', 'ar', 'العودة إلى الأعلى', 'accessibility', @homepage_id, 'text', 'yes'),
('accessibility.back.to.top.en', 'en', 'Back to top', 'accessibility', @homepage_id, 'text', 'yes'),
('accessibility.toggle.animations.ar', 'ar', 'إيقاف الحركات', 'accessibility', @homepage_id, 'text', 'yes'),
('accessibility.toggle.animations.en', 'en', 'Disable animations', 'accessibility', @homepage_id, 'text', 'yes'),
('accessibility.start.animations.ar', 'ar', 'تشغيل الحركات', 'accessibility', @homepage_id, 'text', 'yes'),
('accessibility.start.animations.en', 'en', 'Enable animations', 'accessibility', @homepage_id, 'text', 'yes');

-- 3. Note: Images should be added separately with actual URLs
-- ملاحظة: يجب إضافة الصور بشكل منفصل مع روابط فعلية
-- Example structure for images:
-- INSERT INTO images (key, url, altAr, altEn, section, pageId, width, height, format, isActive) VALUES
-- ('hero.logo.ar', 'URL_TO_LOGO', 'شعار مستشفى بوكم', 'Bocam Hospital Logo', 'hero', @homepage_id, 200, 200, 'png', 'yes'),
-- ('about.hospital.ar', 'URL_TO_HOSPITAL_IMAGE', 'صورة مستشفى بوكم', 'Bocam Hospital Image', 'about', @homepage_id, 1200, 800, 'jpg', 'yes');

SELECT 'Homepage data seeded successfully' AS status;
