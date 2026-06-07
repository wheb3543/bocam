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

async function seedAllTables() {
  console.log('🌱 جاري إضافة بيانات وهمية لجميع الجداول...');

  try {
    // ==================== USERS & ACCESS ====================
    console.log('\n👥 المستخدمين والصلاحيات...');
    
    // 1. Users
    console.log('  - users');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.execute(
      `INSERT INTO users (username, password, name, email, role, isActive, loginMethod) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE username=username`,
      ['admin', hashedPassword, 'مدير النظام', 'admin@sgh.com', 'admin', 'yes', 'manual']
    );

    const staffUsers = [
      ['ahmed', 'أحمد محمد', 'ahmed@sgh.com', 'manager'],
      ['sara', 'سارة أحمد', 'sara@sgh.com', 'staff'],
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

    // 2. Access Requests
    console.log('  - accessRequests');
    await connection.execute(
      `INSERT INTO accessRequests (name, email, phone, reason, status) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE email=email`,
      ['عمر يوسف', 'omar@email.com', '777111222', 'أريد الوصول للنظام', 'pending']
    );

    // ==================== CAMPAIGNS & LEADS ====================
    console.log('\n📢 الحملات والعملاء المحتملين...');
    
    // 3. Campaigns
    console.log('  - campaigns');
    const campaigns = [
      ['حملة شهر رمضان', 'ramadan-campaign', 'حملة خاصة بشهر رمضان المبارك', 'digital', 'active', 50000, 45000, 'YER'],
      ['حملة العناية بالبشرة', 'skincare-campaign', 'عروض خاصة للعناية بالبشرة', 'digital', 'active', 30000, 25000, 'YER'],
      ['حملة الأسنان', 'dental-campaign', 'عروض زراعة وتجميل الأسنان', 'field', 'active', 40000, 35000, 'YER'],
    ];

    for (const [name, slug, description, type, status, plannedBudget, actualBudget, currency] of campaigns) {
      await connection.execute(
        `INSERT INTO campaigns (name, slug, description, type, status, plannedBudget, actualBudget, currency, startDate, endDate, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), true) 
         ON DUPLICATE KEY UPDATE slug=slug`,
        [name, slug, description, type, status, plannedBudget, actualBudget, currency]
      );
    }

    // 4. Leads
    console.log('  - leads');
    const leads = [
      [1, 'محمد أحمد', '777123456', 'mohammed@email.com', 'new', 'facebook'],
      [1, 'علي حسن', '777234567', 'ali@email.com', 'contacted', 'instagram'],
      [2, 'فاطمة محمد', '777345678', 'fatima@email.com', 'booked', 'google'],
      [2, 'سارة علي', '777456789', 'sara@email.com', 'new', 'whatsapp'],
      [3, 'خالد أحمد', '777567890', 'khaled@email.com', 'pending', 'field'],
    ];

    for (const [campaignId, fullName, phone, email, status, source] of leads) {
      await connection.execute(
        `INSERT INTO leads (campaignId, fullName, phone, email, status, source, utmSource) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [campaignId, fullName, phone, email, status, source, source]
      );
    }

    // 5. Lead Status History
    console.log('  - leadStatusHistory');
    await connection.execute(
      `INSERT INTO leadStatusHistory (leadId, userId, oldStatus, newStatus, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [1, 1, 'new', 'contacted', 'تم الاتصال بالعميل']
    );

    // ==================== DOCTORS & APPOINTMENTS ====================
    console.log('\n👨‍⚕️ الأطباء والمواعيد...');
    
    // 6. Doctors
    console.log('  - doctors');
    const doctors = [
      ['د. أحمد العلي', 'dr-ahmed-alali', 'جراحة عامة', '10 سنوات', 'العربية, الإنجليزية', '5000', 'yes', 'yes'],
      ['د. سارة المحمدي', 'dr-sara-almahmadi', 'جلدية وتجميل', '8 سنوات', 'العربية, الإنجليزية', '6000', 'yes', 'yes'],
      ['د. خالد الصالحي', 'dr-khaled-alsalihi', 'أسنان', '12 سنة', 'العربية, الإنجليزية', '4000', 'yes', 'yes'],
      ['د. فاطمة القحطاني', 'dr-fatima-alqahtani', 'عيون', '6 سنوات', 'العربية, الإنجليزية', '5500', 'yes', 'yes'],
    ];

    for (const [name, slug, specialty, experience, languages, consultationFee, isVisiting, available] of doctors) {
      await connection.execute(
        `INSERT INTO doctors (name, slug, specialty, experience, languages, consultationFee, isVisiting, available) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE slug=slug`,
        [name, slug, specialty, experience, languages, consultationFee, isVisiting, available]
      );
    }

    // 7. Appointments
    console.log('  - appointments');
    const appointments = [
      [1, 1, 'محمد أحمد', '777123456', 'mohammed@email.com', 30, 'male', 'جراحة عامة', '2025-06-01', '10:00', 'confirmed'],
      [2, 2, 'فاطمة محمد', '777345678', 'fatima@email.com', 28, 'female', 'تجميل البشرة', '2025-06-02', '14:00', 'pending'],
      [3, 3, 'سارة علي', '777456789', 'sara@email.com', 25, 'female', 'زراعة أسنان', '2025-06-03', '09:00', 'contacted'],
      [1, 4, 'علي حسن', '777234567', 'ali@email.com', 35, 'male', 'جراحة عامة', '2025-06-04', '11:00', 'attended'],
    ];

    for (const [campaignId, doctorId, fullName, phone, email, age, gender, procedure, preferredDate, preferredTime, status] of appointments) {
      await connection.execute(
        `INSERT INTO appointments (campaignId, doctorId, fullName, phone, email, age, gender, \`procedure\`, preferredDate, preferredTime, status, source) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [campaignId, doctorId, fullName, phone, email, age, gender, procedure, preferredDate, preferredTime, status, 'web']
      );
    }

    // ==================== OFFERS & CAMPS ====================
    console.log('\n🎁 العروض والمخيمات...');
    
    // 8. Offers
    console.log('  - offers');
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

    // 9. Camps
    console.log('  - camps');
    await connection.execute(
      `INSERT INTO camps (name, slug, description, isActive, startDate, endDate, morningTime, eveningTime, dailyCapacity) 
       VALUES (?, ?, ?, true, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), ?, ?, ?) 
       ON DUPLICATE KEY UPDATE slug=slug`,
      ['مخيم الصحة الشامل', 'health-camp', 'مخيم طبي شامل للفحص المجاني', '08:00', '14:00', 50]
    );

    // 10. Offer Leads
    console.log('  - offerLeads');
    await connection.execute(
      `INSERT INTO offerLeads (offerId, campaignId, fullName, phone, email, age, gender, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 1, 'يوسف علي', '777678901', 'youssef@email.com', 32, 'male', 'pending']
    );

    // 11. Camp Registrations
    console.log('  - campRegistrations');
    await connection.execute(
      `INSERT INTO campRegistrations (campId, campaignId, fullName, phone, email, age, gender, status, preferredDate, preferredTimeSlot) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 1, 'نورة محمد', '777789012', 'noura@email.com', 27, 'female', 'pending', '2025-06-05', 'morning']
    );

    // ==================== CAMPAIGN RELATIONSHIPS ====================
    console.log('\n🔗 علاقات الحملات...');
    
    // 12. Campaign Offers
    console.log('  - campaignOffers');
    await connection.execute(
      `INSERT INTO campaignOffers (campaignId, offerId) VALUES (?, ?), (?, ?)`,
      [1, 1, 2, 2]
    );

    // 13. Campaign Camps
    console.log('  - campaignCamps');
    await connection.execute(
      `INSERT INTO campaignCamps (campaignId, campId) VALUES (?, ?)`,
      [1, 1]
    );

    // 14. Campaign Doctors
    console.log('  - campaignDoctors');
    await connection.execute(
      `INSERT INTO campaignDoctors (campaignId, doctorId) VALUES (?, ?), (?, ?), (?, ?)`,
      [1, 1, 1, 2, 2, 3]
    );

    // ==================== TEAMS & TASKS ====================
    console.log('\n👥 الفرق والمهام...');
    
    // 15. Teams
    console.log('  - teams');
    await connection.execute(
      `INSERT INTO teams (name, slug, description, leaderId, isActive) 
       VALUES (?, ?, ?, ?, true) 
       ON DUPLICATE KEY UPDATE slug=slug`,
      ['فريق التسويق', 'marketing-team', 'فريق مسؤول عن الحملات التسويقية', 2]
    );

    // 16. Team Members
    console.log('  - teamMembers');
    await connection.execute(
      `INSERT INTO teamMembers (teamId, userId, role) VALUES (?, ?, ?), (?, ?, ?)`,
      [1, 2, 'leader', 1, 3, 'member']
    );

    // 17. Projects
    console.log('  - projects');
    await connection.execute(
      `INSERT INTO projects (title, slug, description, status, priority, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE slug=slug`,
      ['مشروع رمضان', 'ramadan-project', 'إدارة حملة شهر رمضان', 'active', 'high', 2]
    );

    // 18. Tasks
    console.log('  - tasks');
    await connection.execute(
      `INSERT INTO tasks (projectId, campaignId, title, description, assignedTo, priority, status, category, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 1, 'تصميم إعلانات رمضان', 'تصميم إعلانات للحملة', 3, 'high', 'in_progress', 'design', 2]
    );

    // 19. Task Deliverables
    console.log('  - taskDeliverables');
    await connection.execute(
      `INSERT INTO taskDeliverables (taskId, userId, fileUrl, notes, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [1, 3, 'https://example.com/design.pdf', 'التصميم الأولي', 'pending']
    );

    // 20. Task Comments
    console.log('  - taskComments');
    await connection.execute(
      `INSERT INTO task_comments (taskId, userId, content) VALUES (?, ?, ?)`,
      [1, 2, 'يرجى مراجعة التصميم']
    );

    // 21. Task Attachments
    console.log('  - taskAttachments');
    await connection.execute(
      `INSERT INTO task_attachments (taskId, userId, fileName, fileUrl, fileType, attachmentType) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 3, 'reference.jpg', 'https://example.com/ref.jpg', 'image/jpeg', 'reference']
    );

    // ==================== WHATSAPP CORE ====================
    console.log('\n💬 واتساب الأساسي...');
    
    // 22. WhatsApp Conversations
    console.log('  - whatsappConversations');
    await connection.execute(
      `INSERT INTO whatsapp_conversations (phoneNumber, customerName, lastMessage, lastMessageAt, unreadCount, leadId, appointmentId) 
       VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
      ['777123456', 'محمد أحمد', 'مرحباً، أريد حجز موعد', 1, 1, 1]
    );

    // 23. WhatsApp Messages
    console.log('  - whatsappMessages');
    await connection.execute(
      `INSERT INTO whatsapp_messages (conversationId, direction, content, messageType, status, sentAt) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [1, 'inbound', 'مرحباً، أريد حجز موعد', 'text', 'received']
    );

    // 24. WhatsApp Templates
    console.log('  - whatsappTemplates');
    await connection.execute(
      `INSERT INTO whatsapp_templates (name, category, content, variables, isActive, createdBy, metaName, languageCode, metaStatus) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=name`,
      ['تأكيد الموعد', 'UTILITY', 'مرحباً {name}، تم تأكيد موعدك بتاريخ {date} الساعة {time}', '["name", "date", "time"]', 1, 1, 'appointment_confirmation', 'ar', 'APPROVED']
    );

    // 25. WhatsApp Broadcasts
    console.log('  - whatsappBroadcasts');
    await connection.execute(
      `INSERT INTO whatsapp_broadcasts (name, message, recipientCount, status, createdBy) 
       VALUES (?, ?, ?, ?, ?)`,
      ['تذكير رمضان', 'تذكير بموعدكم في المستشفى', 10, 'completed', 2]
    );

    // 26. WhatsApp Auto Replies
    console.log('  - whatsappAutoReplies');
    await connection.execute(
      `INSERT INTO whatsapp_auto_replies (name, triggerType, triggerValue, replyMessage, isActive, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['تحية تلقائية', 'first_message', '*', 'أهلاً بك! كيف يمكننا مساعدتك؟', 1, 1]
    );

    // 27. WhatsApp Analytics
    console.log('  - whatsappAnalytics');
    await connection.execute(
      `INSERT INTO whatsapp_analytics (date, messagesSent, messagesReceived, conversationsStarted, averageResponseTime, conversionRate) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['2025-05-27', 50, 30, 15, 5, 20]
    );

    // 28. Scheduled Messages
    console.log('  - scheduledMessages');
    await connection.execute(
      `INSERT INTO scheduled_messages (conversationId, phoneNumber, content, messageType, scheduledAt, status, createdBy) 
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), ?, ?)`,
      [1, '777123456', 'تذكير بموعدك غداً', 'text', 'pending', 1]
    );

    // 29. Quick Replies
    console.log('  - quickReplies');
    await connection.execute(
      `INSERT INTO quick_replies (name, content, category, isActive, createdBy) 
       VALUES (?, ?, ?, ?, ?)`,
      ['شكراً', 'شكراً لتواصلك معنا', 'thanks', 1, 1]
    );

    // 30. Saved Searches
    console.log('  - savedSearches');
    await connection.execute(
      `INSERT INTO saved_searches (userId, name, filterType, dateRange) VALUES (?, ?, ?, ?)`,
      [1, 'المحادثات غير المقروءة', 'unread', 'today']
    );

    // ==================== MESSAGE SETTINGS ====================
    console.log('\n📨 إعدادات الرسائل...');
    
    // 31. Message Settings
    console.log('  - messageSettings');
    await connection.execute(
      `INSERT INTO message_settings (messageType, displayName, category, messageContent, isEnabled, deliveryChannel, entityType, triggerEvent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE messageType=messageType`,
      ['appointment_confirmation', 'تأكيد الحجز', 'patient_journey', 'تم تأكيد موعدك بنجاح', 1, 'both', 'appointment', 'on_confirmed']
    );

    // إضافة إعداد رسالة نتائج المختبر
    await connection.execute(
      `INSERT INTO message_settings (messageType, displayName, category, messageContent, isEnabled, deliveryChannel, availableVariables, description, entityType, triggerEvent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE messageType=messageType`,
      ['lab_result_ready', 'إرسال نتيجة فحص مختبر', 'patient_journey', 'مرحباً {name}، نتائج فحصك الجديدة جاهزة.\n\n📋 نوع الفحص: {test_type}\n👨‍⚕️ الطبيب: {doctor}\n📅 التاريخ: {date}\n\nيمكنك تحميل النتيجة من الملف المرفق.', 1, 'whatsapp_api', '["name", "test_type", "doctor", "date"]', 'إرسال نتائج فحوصات المختبر عبر واتساب باستخدام قالب Meta المعتمد', 'all', 'manual']
    );

    // 32. Message Templates
    console.log('  - messageTemplates');
    await connection.execute(
      `INSERT INTO message_templates (templateName, displayName, category, languageCode, status, bodyText, variables, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE templateName=templateName`,
      ['appointment_confirmation_ar', 'تأكيد الموعد', 'UTILITY', 'ar', 'APPROVED', 'مرحباً {name}، تم تأكيد موعدك', '["name"]', 1]
    );

    // ==================== COMMENTS & FOLLOW-UPS ====================
    console.log('\n💬 التعليقات والمتابعة...');
    
    // 33. Comments
    console.log('  - comments');
    await connection.execute(
      `INSERT INTO comments (entityType, entityId, content, userId, userName) VALUES (?, ?, ?, ?, ?)`,
      ['appointment', 1, 'العميل مهتم جداً بالخدمة', 2, 'سارة أحمد']
    );

    // 34. Follow Up Tasks
    console.log('  - followUpTasks');
    await connection.execute(
      `INSERT INTO followUpTasks (entityType, entityId, title, description, status, priority, assignedToId, createdById, createdByName) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['appointment', 1, 'متابعة العميل', 'الاتصال بالعميل للتأكيد', 'pending', 'medium', 3, 2, 'سارة أحمد']
    );

    // ==================== PREFERENCES & FILTERS ====================
    console.log('\n⚙️ التفضيلات والفلاتر...');
    
    // 35. User Preferences
    console.log('  - userPreferences');
    await connection.execute(
      `INSERT INTO userPreferences (userId, preferenceKey, preferenceValue) VALUES (?, ?, ?)`,
      [1, 'appointmentVisibleColumns', '["fullName", "phone", "status", "appointmentDate"]']
    );

    // 36. Shared Column Templates
    console.log('  - sharedColumnTemplates');
    await connection.execute(
      `INSERT INTO sharedColumnTemplates (name, tableKey, columns, createdBy, createdByName) 
       VALUES (?, ?, ?, ?, ?)`,
      ['عرض الموعد القياسي', 'appointments', '["fullName", "phone", "doctor", "status"]', 1, 'مدير النظام']
    );

    // 37. Saved Filters
    console.log('  - savedFilters');
    await connection.execute(
      `INSERT INTO savedFilters (name, pageType, filterConfig, userId, isDefault) VALUES (?, ?, ?, ?, ?)`,
      ['المواعيد المؤكدة', 'appointments', '{"status": "confirmed"}', 1, true]
    );

    // 38. Audit Logs
    console.log('  - auditLogs');
    await connection.execute(
      `INSERT INTO auditLogs (entityType, entityId, action, oldValue, newValue, userId, userName) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['appointment', 1, 'status_change', 'pending', 'confirmed', 2, 'سارة أحمد']
    );

    // ==================== PATIENT PORTAL ====================
    console.log('\n🏥 بوابة المريض...');
    
    // 39. Patients
    console.log('  - patients');
    await connection.execute(
      `INSERT INTO patients (fullName, phone, address, age, gender, email, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, true) 
       ON DUPLICATE KEY UPDATE phone=phone`,
      ['محمد أحمد', '777123456', 'صنعاء', 30, 'male', 'mohammed@email.com']
    );

    // 40. Patient OTPs
    console.log('  - patientOtps');
    await connection.execute(
      `INSERT INTO patientOtps (phone, code, expiresAt, isUsed) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), ?)`,
      ['777123456', '123456', false]
    );

    // 41. Patient Results
    console.log('  - patientResults');
    await connection.execute(
      `INSERT INTO patientResults (patientId, resultType, title, description, status) VALUES (?, ?, ?, ?, ?)`,
      [1, 'lab', 'تحليل دم شامل', 'تحليل دم روتيني', 'ready']
    );

    // ==================== TRACKING & ANALYTICS ====================
    console.log('\n📊 التتبع والتحليلات...');
    
    // 42. PWA Installs
    console.log('  - pwaInstalls');
    await connection.execute(
      `INSERT INTO pwaInstalls (appType, userId, userAgent, platform, ipAddress) VALUES (?, ?, ?, ?, ?)`,
      ['public', 1, 'Mozilla/5.0...', 'iOS', '192.168.1.1']
    );

    // 43. Visit Sessions
    console.log('  - visitSessions');
    await connection.execute(
      `INSERT INTO visitSessions (sessionId, source, utmSource, landingPage, converted, conversionType) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['session123', 'facebook', 'facebook', '/appointment', true, 'appointment']
    );

    // 44. Abandoned Forms
    console.log('  - abandonedForms');
    await connection.execute(
      `INSERT INTO abandonedForms (formType, phone, name, formData, source, contacted) VALUES (?, ?, ?, ?, ?, ?)`,
      ['appointment', '777999888', 'مجهول', '{"name": "test"}', 'web', false]
    );

    // 45. Tracking Events
    console.log('  - trackingEvents');
    await connection.execute(
      `INSERT INTO trackingEvents (sessionId, eventType, page, metadata) VALUES (?, ?, ?, ?)`,
      ['session123', 'page_view', '/appointment', '{"duration": 30}']
    );

    // ==================== WHATSAPP NOTIFICATIONS ====================
    console.log('\n🔔 إشعارات واتساب...');
    
    // 46. WhatsApp Notifications
    console.log('  - whatsappNotifications');
    await connection.execute(
      `INSERT INTO whatsapp_notifications (entityType, entityId, notificationType, phone, recipientName, messageContent, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['appointment', 1, 'booking_confirmation', '777123456', 'محمد أحمد', 'تم تأكيد موعدك', 'sent']
    );

    // ==================== WHATSAPP ADVANCED ====================
    console.log('\n🚀 واتساب المتقدم...');
    
    // 47. WhatsApp Blocked Numbers
    console.log('  - whatsappBlockedNumbers');
    await connection.execute(
      `INSERT INTO whatsapp_blocked_numbers (phone, reason) VALUES (?, ?)`,
      ['777000000', 'opt-out']
    );

    // 48. WhatsApp Account Alerts
    console.log('  - whatsappAccountAlerts');
    await connection.execute(
      `INSERT INTO whatsapp_account_alerts (alertType, details, severity, resolved) VALUES (?, ?, ?, ?)`,
      ['quality_update', '{"score": 90}', 'low', true]
    );

    // 49. WhatsApp Security Events
    console.log('  - whatsappSecurityEvents');
    await connection.execute(
      `INSERT INTO whatsapp_security_events (eventType, details, severity) VALUES (?, ?, ?)`,
      ['login_attempt', '{"ip": "192.168.1.1"}', 'medium']
    );

    // 50. WhatsApp Phone Quality
    console.log('  - whatsappPhoneQuality');
    await connection.execute(
      `INSERT INTO whatsapp_phone_quality (phoneNumber, qualityScore, qualityRating) VALUES (?, ?, ?)`,
      ['777123456', 85, 'green']
    );

    // 51. WhatsApp Conversation Quality
    console.log('  - whatsappConversationQuality');
    await connection.execute(
      `INSERT INTO whatsapp_conversation_quality (phoneNumber, qualityScore) VALUES (?, ?)`,
      ['777123456', 90]
    );

    // 52. WhatsApp User Opt-ins
    console.log('  - whatsappUserOptIns');
    await connection.execute(
      `INSERT INTO whatsapp_user_opt_ins (phoneNumber, optInType, status, source) VALUES (?, ?, ?, ?)`,
      ['777123456', 'general', 'opted_in', 'web']
    );

    // 53. WhatsApp Template Quality
    console.log('  - whatsappTemplateQuality');
    await connection.execute(
      `INSERT INTO whatsapp_template_quality (templateId, qualityScore) VALUES (?, ?)`,
      ['appointment_confirmation_ar', 95]
    );

    // 54. WhatsApp Webhook Events
    console.log('  - whatsappWebhookEvents');
    await connection.execute(
      `INSERT INTO whatsapp_webhook_events (eventType, phoneNumber, rawPayload, processed) VALUES (?, ?, ?, ?)`,
      ['messages', '777123456', '{"test": "data"}', true]
    );

    // 55. WhatsApp Contacts
    console.log('  - whatsappContacts');
    await connection.execute(
      `INSERT INTO whatsapp_contacts (messageId, conversationId, phoneNumber, name) VALUES (?, ?, ?, ?)`,
      [1, 1, '777123456', '{"first_name": "محمد"}']
    );

    // 56. WhatsApp Orders
    console.log('  - whatsappOrders');
    await connection.execute(
      `INSERT INTO whatsapp_orders (messageId, conversationId, phoneNumber, status) VALUES (?, ?, ?, ?)`,
      [1, 1, '777123456', 'pending']
    );

    // 57. WhatsApp Products
    console.log('  - whatsappProducts');
    await connection.execute(
      `INSERT INTO whatsapp_products (catalogId, productRetailerId, productName, price, currency, isAvailable) 
       VALUES (?, ?, ?, ?, ?, true)`,
      ['catalog123', 'prod123', 'خدمة تجميل', 50000, 'YER']
    );

    // 58. WhatsApp Referrals
    console.log('  - whatsappReferrals');
    await connection.execute(
      `INSERT INTO whatsapp_referrals (messageId, conversationId, phoneNumber, sourceUrl) VALUES (?, ?, ?, ?)`,
      [1, 1, '777123456', 'https://facebook.com/ad123']
    );

    // 59. WhatsApp Reactions
    console.log('  - whatsappReactions');
    await connection.execute(
      `INSERT INTO whatsapp_reactions (messageId, conversationId, phoneNumber, emoji) VALUES (?, ?, ?, ?)`,
      [1, 1, '777123456', '👍']
    );

    // 60. WhatsApp Transactions
    console.log('  - whatsappTransactions');
    await connection.execute(
      `INSERT INTO whatsapp_transactions (conversationId, phoneNumber, amount, currency, status) VALUES (?, ?, ?, ?, ?)`,
      [1, '777123456', 50000, 'YER', 'completed']
    );

    // ==================== SETTINGS ====================
    console.log('\n⚙️ الإعدادات...');
    
    // 61. Settings
    console.log('  - settings');
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

    console.log('\n✅ تم إضافة البيانات الوهمية لجميع الجداول بنجاح!');
    console.log('\n📊 ملخص:');
    console.log('  - 61 جدول تمت تغذيتها بالبيانات');
    console.log('  - المستخدمين: admin / admin123');
    console.log('  - الموظفين: ahmed, sara, khalid, fatima / password123');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

seedAllTables();
