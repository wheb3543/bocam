/**
 * بيانات الاختبار (Test Seed Data)
 * يوفر بيانات افتراضية للاختبارات
 */

import {
  generateMockPatients,
  generateMockAppointments,
  generateMockLeads,
  generateMockConversations,
  generateMockMessages,
  generateMockDoctors,
  generateMockCampaigns,
  generateMockCamps,
  generateMockOffers,
  generateMockUser,
  generateMockUsers,
} from './mocks/data';
import { setMockData } from './test-db';

// ============================================================================
// Seed Functions
// ============================================================================

/**
 * Seed بيانات المرضى
 */
export const seedPatients = (count: number = 10) => {
  const patients = generateMockPatients(count);
  setMockData('patients', patients);
  return patients;
};

/**
 * Seed بيانات المواعيد
 */
export const seedAppointments = (count: number = 10) => {
  const appointments = generateMockAppointments(count);
  setMockData('appointments', appointments);
  return appointments;
};

/**
 * Seed بيانات العملاء المحتملين
 */
export const seedLeads = (count: number = 10) => {
  const leads = generateMockLeads(count);
  setMockData('leads', leads);
  return leads;
};

/**
 * Seed بيانات المحادثات
 */
export const seedConversations = (count: number = 10) => {
  const conversations = generateMockConversations(count);
  setMockData('conversations', conversations);
  return conversations;
};

/**
 * Seed بيانات الرسائل
 */
export const seedMessages = (count: number = 10) => {
  const messages = generateMockMessages(count);
  setMockData('messages', messages);
  return messages;
};

/**
 * Seed بيانات الأطباء
 */
export const seedDoctors = (count: number = 5) => {
  const doctors = generateMockDoctors(count);
  setMockData('doctors', doctors);
  return doctors;
};

/**
 * Seed بيانات الحملات التسويقية
 */
export const seedCampaigns = (count: number = 5) => {
  const campaigns = generateMockCampaigns(count);
  setMockData('campaigns', campaigns);
  return campaigns;
};

/**
 * Seed بيانات المخيمات الطبية
 */
export const seedCamps = (count: number = 5) => {
  const camps = generateMockCamps(count);
  setMockData('camps', camps);
  return camps;
};

/**
 * Seed بيانات العروض الطبية
 */
export const seedOffers = (count: number = 5) => {
  const offers = generateMockOffers(count);
  setMockData('offers', offers);
  return offers;
};

/**
 * Seed بيانات المستخدمين
 */
export const seedUsers = (count: number = 5) => {
  const users = generateMockUsers(count);
  setMockData('users', users);
  return users;
};

/**
 * Seed بيانات الإعدادات
 */
export const seedSettings = () => {
  const settings = [
    {
      id: 1,
      key: 'clinic_name',
      value: 'مركز العلاج الطبي',
      description: 'اسم المركز الطبي',
    },
    {
      id: 2,
      key: 'clinic_phone',
      value: '967773171477',
      description: 'رقم هاتف المركز',
    },
    {
      id: 3,
      key: 'clinic_address',
      value: 'صنعاء، اليمن',
      description: 'عنوان المركز',
    },
    {
      id: 4,
      key: 'working_hours',
      value: '8:00 - 20:00',
      description: 'ساعات العمل',
    },
  ];
  setMockData('settings', settings);
  return settings;
};

// ============================================================================
// Seed All Data
// ============================================================================

/**
 * Seed جميع البيانات الافتراضية
 */
export const seedAllData = () => {
  return {
    patients: seedPatients(10),
    appointments: seedAppointments(10),
    leads: seedLeads(10),
    conversations: seedConversations(10),
    messages: seedMessages(10),
    doctors: seedDoctors(5),
    campaigns: seedCampaigns(5),
    camps: seedCamps(5),
    offers: seedOffers(5),
    users: seedUsers(5),
    settings: seedSettings(),
  };
};

/**
 * Seed بيانات خفيفة للاختبارات السريعة
 */
export const seedLightData = () => {
  return {
    patients: seedPatients(3),
    appointments: seedAppointments(3),
    leads: seedLeads(3),
    conversations: seedConversations(3),
    messages: seedMessages(3),
    doctors: seedDoctors(2),
    users: seedUsers(2),
    settings: seedSettings(),
  };
};

/**
 * Seed بيانات كاملة للاختبارات الشاملة
 */
export const seedFullData = () => {
  return {
    patients: seedPatients(50),
    appointments: seedAppointments(50),
    leads: seedLeads(50),
    conversations: seedConversations(20),
    messages: seedMessages(100),
    doctors: seedDoctors(10),
    campaigns: seedCampaigns(10),
    camps: seedCamps(10),
    offers: seedOffers(10),
    users: seedUsers(10),
    settings: seedSettings(),
  };
};

// ============================================================================
// Seed Specific Scenarios
// ============================================================================

/**
 * Seed بيانات سيناريو تسجيل الدخول
 */
export const seedAuthScenario = () => {
  const users = [
    generateMockUser({
      id: 'user_1',
      name: 'مدير النظام',
      email: 'admin@example.com',
      role: 'admin',
    }),
    generateMockUser({
      id: 'user_2',
      name: 'د. سالم',
      email: 'doctor@example.com',
      role: 'doctor',
    }),
  ];
  setMockData('users', users);
  return { users };
};

/**
 * Seed بيانات سيناريو المواعيد
 */
export const seedAppointmentScenario = () => {
  const patients = seedPatients(5);
  const doctors = seedDoctors(2);
  const appointments = generateMockAppointments(5).map((apt, i) => ({
    ...apt,
    patientId: patients[i % patients.length].id,
    doctorId: doctors[i % doctors.length].id,
  }));
  setMockData('appointments', appointments);
  return { patients, doctors, appointments };
};

/**
 * Seed بيانات سيناريو واتساب
 */
export const seedWhatsAppScenario = () => {
  const conversations = seedConversations(5);
  const messages = conversations.flatMap((conv, _i) =>
    generateMockMessages(5).map((msg) => ({
      ...msg,
      conversationId: conv.id,
    }))
  );
  setMockData('messages', messages);
  return { conversations, messages };
};

/**
 * Seed بيانات سيناريو العملاء المحتملين
 */
export const seedLeadScenario = () => {
  const leads = generateMockLeads(10).map((lead, i) => ({
    ...lead,
    status: i < 3 ? 'new' : i < 6 ? 'contacted' : i < 8 ? 'converted' : 'lost',
  }));
  setMockData('leads', leads);
  return { leads };
};
