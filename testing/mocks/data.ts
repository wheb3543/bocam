/**
 * مولدات بيانات Mock (Mock Data Generators)
 * يوفر دوال لتوليد بيانات mock للاستخدام في الاختبارات
 */

// ============================================================================
// أنواع TypeScript
// ============================================================================

/**
 * بيانات مريض mock
 */
export interface MockPatient {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
  city?: string;
  nationalId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * بيانات موعد mock
 */
export interface MockAppointment {
  id: string;
  patientId: string;
  fullName: string;
  phone: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'no_show';
  source: 'facebook' | 'instagram' | 'website' | 'whatsapp' | 'referral';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * بيانات عميل محتمل (lead) mock
 */
export interface MockLead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  source: 'facebook' | 'instagram' | 'website' | 'whatsapp' | 'referral';
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * بيانات محادثة واتساب mock
 */
export interface MockConversation {
  id: string;
  customerName: string;
  phoneNumber: string;
  lastMessageAt: string;
  unreadCount: number;
  leadId?: string;
  appointmentId?: string;
  offerLeadId?: string;
  campRegistrationId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * بيانات رسالة واتساب mock
 */
export interface MockMessage {
  id: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
  createdAt: string;
}

/**
 * بيانات طبيب mock
 */
export interface MockDoctor {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  specialization: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * بيانات حملة تسويقية mock
 */
export interface MockCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * بيانات مخيم طبي mock
 */
export interface MockCamp {
  id: string;
  name: string;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * بيانات عرض طبي mock
 */
export interface MockOffer {
  id: string;
  title: string;
  description?: string;
  discount: number;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'expired' | 'draft';
  createdAt: string;
  updatedAt: string;
}

/**
 * بيانات مستخدم mock
 */
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'staff' | 'manager';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// دوال توليد البيانات
// ============================================================================

/**
 * توليد بيانات مريض mock
 */
export const generateMockPatient = (overrides: Partial<MockPatient> = {}): MockPatient => {
  const id = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    fullName: 'أحمد محمد أحمد',
    phone: '967773171477',
    email: 'ahmed@example.com',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    address: 'صنعاء، اليمن',
    city: 'صنعاء',
    nationalId: '123456789',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة مرضى mock
 */
export const generateMockPatients = (count: number = 10): MockPatient[] => {
  return Array.from({ length: count }, (_, i) =>
    generateMockPatient({
      id: `patient_${i + 1}`,
      fullName: `مريض ${i + 1}`,
      phone: `96777${Math.floor(10000000 + Math.random() * 90000000)}`,
    })
  );
};

/**
 * توليد بيانات موعد mock
 */
export const generateMockAppointment = (
  overrides: Partial<MockAppointment> = {}
): MockAppointment => {
  const id = `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    id,
    patientId: 'patient_1',
    fullName: 'أحمد محمد أحمد',
    phone: '967773171477',
    doctorId: 'doctor_1',
    doctorName: 'د. سالم العلي',
    appointmentDate: tomorrow.split('T')[0],
    appointmentTime: '10:00',
    status: 'pending',
    source: 'facebook',
    notes: 'موعد طبي روتيني',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة مواعيد mock
 */
export const generateMockAppointments = (count: number = 10): MockAppointment[] => {
  const statuses: MockAppointment['status'][] = [
    'pending',
    'confirmed',
    'cancelled',
    'attended',
    'no_show',
  ];
  const sources: MockAppointment['source'][] = [
    'facebook',
    'instagram',
    'website',
    'whatsapp',
    'referral',
  ];

  return Array.from({ length: count }, (_, i) =>
    generateMockAppointment({
      id: `appointment_${i + 1}`,
      patientId: `patient_${(i % 5) + 1}`,
      fullName: `مريض ${(i % 5) + 1}`,
      status: statuses[i % statuses.length],
      source: sources[i % sources.length],
      appointmentDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  );
};

/**
 * توليد بيانات عميل محتمل mock
 */
export const generateMockLead = (overrides: Partial<MockLead> = {}): MockLead => {
  const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    fullName: 'سارة علي محمد',
    phone: '967771234567',
    email: 'sara@example.com',
    status: 'new',
    source: 'instagram',
    notes: 'مهتمة بخدمات العلاج الطبيعي',
    assignedTo: 'user_1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة عملاء محتملين mock
 */
export const generateMockLeads = (count: number = 10): MockLead[] => {
  const statuses: MockLead['status'][] = ['new', 'contacted', 'converted', 'lost'];
  const sources: MockLead['source'][] = [
    'facebook',
    'instagram',
    'website',
    'whatsapp',
    'referral',
  ];

  return Array.from({ length: count }, (_, i) =>
    generateMockLead({
      id: `lead_${i + 1}`,
      fullName: `عميل محتمل ${i + 1}`,
      phone: `96777${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: statuses[i % statuses.length],
      source: sources[i % sources.length],
    })
  );
};

/**
 * توليد بيانات محادثة واتساب mock
 */
export const generateMockConversation = (
  overrides: Partial<MockConversation> = {}
): MockConversation => {
  const id = `conversation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    customerName: 'محمد علي',
    phoneNumber: '967779876543',
    lastMessageAt: now,
    unreadCount: 2,
    leadId: 'lead_1',
    appointmentId: 'appointment_1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة محادثات واتساب mock
 */
export const generateMockConversations = (count: number = 10): MockConversation[] => {
  return Array.from({ length: count }, (_, i) =>
    generateMockConversation({
      id: `conversation_${i + 1}`,
      customerName: `عميل ${i + 1}`,
      phoneNumber: `96777${Math.floor(10000000 + Math.random() * 90000000)}`,
      unreadCount: i % 3,
    })
  );
};

/**
 * توليد بيانات رسالة واتساب mock
 */
export const generateMockMessage = (overrides: Partial<MockMessage> = {}): MockMessage => {
  const id = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    conversationId: 'conversation_1',
    content: 'مرحباً، أود حجز موعد طبي',
    direction: 'inbound',
    status: 'read',
    sentAt: now,
    createdAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة رسائل واتساب mock
 */
export const generateMockMessages = (count: number = 10): MockMessage[] => {
  const directions: MockMessage['direction'][] = ['inbound', 'outbound'];
  const statuses: MockMessage['status'][] = ['sent', 'delivered', 'read', 'failed'];

  return Array.from({ length: count }, (_, i) =>
    generateMockMessage({
      id: `message_${i + 1}`,
      conversationId: `conversation_${(i % 3) + 1}`,
      content: `رسالة ${i + 1}`,
      direction: directions[i % directions.length],
      status: statuses[i % statuses.length],
    })
  );
};

/**
 * توليد بيانات طبيب mock
 */
export const generateMockDoctor = (overrides: Partial<MockDoctor> = {}): MockDoctor => {
  const id = `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    fullName: 'د. سالم العلي',
    phone: '967777777777',
    email: 'doctor@example.com',
    specialization: 'طب عام',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة أطباء mock
 */
export const generateMockDoctors = (count: number = 5): MockDoctor[] => {
  const specializations = ['طب عام', 'طب أسنان', 'علاج طبيعي', 'جلدية', 'عيون'];

  return Array.from({ length: count }, (_, i) =>
    generateMockDoctor({
      id: `doctor_${i + 1}`,
      fullName: `د. طبيب ${i + 1}`,
      specialization: specializations[i % specializations.length],
    })
  );
};

/**
 * توليد بيانات حملة تسويقية mock
 */
export const generateMockCampaign = (overrides: Partial<MockCampaign> = {}): MockCampaign => {
  const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    name: 'حملة شهر رمضان',
    description: 'حملة تسويقية لشهر رمضان',
    status: 'active',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 10000,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة حملات تسويقية mock
 */
export const generateMockCampaigns = (count: number = 5): MockCampaign[] => {
  const statuses: MockCampaign['status'][] = ['draft', 'active', 'paused', 'completed'];

  return Array.from({ length: count }, (_, i) =>
    generateMockCampaign({
      id: `campaign_${i + 1}`,
      name: `حملة ${i + 1}`,
      status: statuses[i % statuses.length],
    })
  );
};

/**
 * توليد بيانات مخيم طبي mock
 */
export const generateMockCamp = (overrides: Partial<MockCamp> = {}): MockCamp => {
  const id = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    id,
    name: 'مخيم طبي صنعاء',
    description: 'مخيم طبي مجاني في صنعاء',
    location: 'صنعاء، اليمن',
    startDate,
    endDate,
    capacity: 100,
    status: 'upcoming',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة مخيمات طبية mock
 */
export const generateMockCamps = (count: number = 5): MockCamp[] => {
  const statuses: MockCamp['status'][] = ['upcoming', 'ongoing', 'completed', 'cancelled'];

  return Array.from({ length: count }, (_, i) =>
    generateMockCamp({
      id: `camp_${i + 1}`,
      name: `مخيم ${i + 1}`,
      status: statuses[i % statuses.length],
    })
  );
};

/**
 * توليد بيانات عرض طبي mock
 */
export const generateMockOffer = (overrides: Partial<MockOffer> = {}): MockOffer => {
  const id = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  const validFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    id,
    title: 'خصم 20% على الفحوصات الطبية',
    description: 'خصم خاص على جميع الفحوصات الطبية',
    discount: 20,
    validFrom,
    validUntil,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة عروض طبية mock
 */
export const generateMockOffers = (count: number = 5): MockOffer[] => {
  const statuses: MockOffer['status'][] = ['active', 'expired', 'draft'];

  return Array.from({ length: count }, (_, i) =>
    generateMockOffer({
      id: `offer_${i + 1}`,
      title: `عرض ${i + 1}`,
      status: statuses[i % statuses.length],
    })
  );
};

/**
 * توليد بيانات مستخدم mock
 */
export const generateMockUser = (overrides: Partial<MockUser> = {}): MockUser => {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    name: 'مدير النظام',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * توليد قائمة مستخدمين mock
 */
export const generateMockUsers = (count: number = 5): MockUser[] => {
  const roles: MockUser['role'][] = ['admin', 'doctor', 'staff', 'manager'];

  return Array.from({ length: count }, (_, i) =>
    generateMockUser({
      id: `user_${i + 1}`,
      name: `مستخدم ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: roles[i % roles.length],
    })
  );
};

// ============================================================================
// دوال مساعدة
// ============================================================================

/**
 * توليد رقم هاتف عشوائي يمني
 */
export const generateYemeniPhone = (): string => {
  const prefix = '96777';
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${number}`;
};

/**
 * توليد تاريخ ISO عشوائي
 */
export const generateRandomDate = (daysBack: number = 30, daysForward: number = 30): string => {
  const now = Date.now();
  const min = now - daysBack * 24 * 60 * 60 * 1000;
  const max = now + daysForward * 24 * 60 * 60 * 1000;
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Date(random).toISOString();
};

/**
 * توليد اسم عشوائي عربي
 */
export const generateArabicName = (): string => {
  const firstNames = ['أحمد', 'محمد', 'علي', 'سارة', 'فاطمة', 'خالد', 'منى', 'عمر', 'يوسف', 'ريم'];
  const lastNames = ['محمد', 'علي', 'أحمد', 'الحسن', 'الحسين', 'العلي', 'القحطاني', 'الصنعاني'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

/**
 * توليد بريد إلكتروني عشوائي
 */
export const generateRandomEmail = (name?: string): string => {
  const username =
    name?.replace(/\s/g, '.').toLowerCase() || `user${Math.floor(Math.random() * 10000)}`;
  const domains = ['example.com', 'test.com', 'mock.com', 'demo.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
};
