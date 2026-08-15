/**
 * Mock لـ tRPC Client
 * يوفر mock كامل لـ tRPC client للاستخدام في الاختبارات
 */

import React from 'react';
import { vi } from 'vitest';

// ============================================================================
// أنواع TypeScript
// ============================================================================

/**
 * Mock لـ tRPC procedure
 */
type MockProcedure<TInput = unknown, TOutput = unknown> = {
  useQuery: (input?: TInput) => {
    data: TOutput | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
  };
  useMutation: () => {
    mutate: (input: TInput) => Promise<TOutput>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    data: TOutput | undefined;
  };
  query: (input?: TInput) => Promise<TOutput>;
  mutate: (input: TInput) => Promise<TOutput>;
};

/**
 * Mock لـ tRPC router
 */
type MockRouter = {
  [key: string]: MockRouter | MockProcedure;
};

// ============================================================================
// Mock Data Store
// ============================================================================

/**
 * مخزن بيانات mock لـ tRPC
 */
const mockDataStore = {
  // بيانات mock افتراضية
  patients: [],
  appointments: [],
  leads: [],
  conversations: [],
  messages: [],
  doctors: [],
  campaigns: [],
  camps: [],
  offers: [],
  users: [],
};

/**
 * إعادة تعيين بيانات mock
 */
export const resetMockData = () => {
  mockDataStore.patients = [];
  mockDataStore.appointments = [];
  mockDataStore.leads = [];
  mockDataStore.conversations = [];
  mockDataStore.messages = [];
  mockDataStore.doctors = [];
  mockDataStore.campaigns = [];
  mockDataStore.camps = [];
  mockDataStore.offers = [];
  mockDataStore.users = [];
};

/**
 * تعيين بيانات mock
 */
export const setMockData = (key: keyof typeof mockDataStore, data: unknown[]) => {
  mockDataStore[key] = data as never[];
};

/**
 * الحصول على بيانات mock
 */
export const getMockData = (key: keyof typeof mockDataStore) => {
  return mockDataStore[key];
};

// ============================================================================
// Mock Procedures
// ============================================================================

/**
 * إنشاء mock procedure
 */
const createMockProcedure = <TInput = unknown, TOutput = unknown>(
  mockData?: TOutput[]
): MockProcedure<TInput, TOutput> => {
  return {
    useQuery: vi.fn((_input?: TInput) => ({
      data: mockData?.[0] || undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn((_input: TInput) => Promise.resolve(mockData?.[0] as TOutput)),
      isPending: false,
      isError: false,
      error: null,
      data: mockData?.[0] || undefined,
    })),
    query: vi.fn((_input?: TInput) => Promise.resolve(mockData?.[0] as TOutput)),
    mutate: vi.fn((_input: TInput) => Promise.resolve(mockData?.[0] as TOutput)),
  };
};

// ============================================================================
// Mock Router - Patients
// ============================================================================

const patientsRouter = {
  list: createMockProcedure(mockDataStore.patients),
  getById: createMockProcedure(mockDataStore.patients),
  create: createMockProcedure(mockDataStore.patients),
  update: createMockProcedure(mockDataStore.patients),
  delete: createMockProcedure(mockDataStore.patients),
  search: createMockProcedure(mockDataStore.patients),
  export: createMockProcedure(mockDataStore.patients),
};

// ============================================================================
// Mock Router - Appointments
// ============================================================================

const appointmentsRouter = {
  list: createMockProcedure(mockDataStore.appointments),
  getById: createMockProcedure(mockDataStore.appointments),
  create: createMockProcedure(mockDataStore.appointments),
  update: createMockProcedure(mockDataStore.appointments),
  delete: createMockProcedure(mockDataStore.appointments),
  updateStatus: createMockProcedure(mockDataStore.appointments),
  getStats: createMockProcedure(mockDataStore.appointments),
  export: createMockProcedure(mockDataStore.appointments),
};

// ============================================================================
// Mock Router - Leads (Customers)
// ============================================================================

const leadsRouter = {
  list: createMockProcedure(mockDataStore.leads),
  getById: createMockProcedure(mockDataStore.leads),
  create: createMockProcedure(mockDataStore.leads),
  update: createMockProcedure(mockDataStore.leads),
  delete: createMockProcedure(mockDataStore.leads),
  convert: createMockProcedure(mockDataStore.leads),
  search: createMockProcedure(mockDataStore.leads),
  export: createMockProcedure(mockDataStore.leads),
};

// ============================================================================
// Mock Router - WhatsApp
// ============================================================================

const whatsappRouter = {
  conversations: {
    list: createMockProcedure(mockDataStore.conversations),
    getById: createMockProcedure(mockDataStore.conversations),
    search: createMockProcedure(mockDataStore.conversations),
    markAsRead: createMockProcedure(mockDataStore.conversations),
  },
  messages: {
    listByConversation: createMockProcedure(mockDataStore.messages),
    send: createMockProcedure(mockDataStore.messages),
    markAsRead: createMockProcedure(mockDataStore.messages),
  },
  templates: {
    list: createMockProcedure(),
    syncFromMeta: createMockProcedure(),
    create: createMockProcedure(),
    update: createMockProcedure(),
    delete: createMockProcedure(),
  },
  unreadCount: createMockProcedure(),
};

// ============================================================================
// Mock Router - Doctors
// ============================================================================

const doctorsRouter = {
  list: createMockProcedure(mockDataStore.doctors),
  getById: createMockProcedure(mockDataStore.doctors),
  create: createMockProcedure(mockDataStore.doctors),
  update: createMockProcedure(mockDataStore.doctors),
  delete: createMockProcedure(mockDataStore.doctors),
};

// ============================================================================
// Mock Router - Campaigns
// ============================================================================

const campaignsRouter = {
  list: createMockProcedure(mockDataStore.campaigns),
  getById: createMockProcedure(mockDataStore.campaigns),
  create: createMockProcedure(mockDataStore.campaigns),
  update: createMockProcedure(mockDataStore.campaigns),
  delete: createMockProcedure(mockDataStore.campaigns),
  publish: createMockProcedure(mockDataStore.campaigns),
  getStats: createMockProcedure(mockDataStore.campaigns),
};

// ============================================================================
// Mock Router - Camps
// ============================================================================

const campsRouter = {
  list: createMockProcedure(mockDataStore.camps),
  getById: createMockProcedure(mockDataStore.camps),
  create: createMockProcedure(mockDataStore.camps),
  update: createMockProcedure(mockDataStore.camps),
  delete: createMockProcedure(mockDataStore.camps),
  register: createMockProcedure(mockDataStore.camps),
  getStats: createMockProcedure(mockDataStore.camps),
};

// ============================================================================
// Mock Router - Offers
// ============================================================================

const offersRouter = {
  list: createMockProcedure(mockDataStore.offers),
  getById: createMockProcedure(mockDataStore.offers),
  create: createMockProcedure(mockDataStore.offers),
  update: createMockProcedure(mockDataStore.offers),
  delete: createMockProcedure(mockDataStore.offers),
  assignToLead: createMockProcedure(mockDataStore.offers),
};

// ============================================================================
// Mock Router - Auth
// ============================================================================

const authRouter = {
  login: createMockProcedure(),
  logout: createMockProcedure(),
  register: createMockProcedure(),
  me: createMockProcedure(),
  refresh: createMockProcedure(),
  verifyEmail: createMockProcedure(),
  resetPassword: createMockProcedure(),
  changePassword: createMockProcedure(),
};

// ============================================================================
// Mock Router - Users
// ============================================================================

const usersRouter = {
  list: createMockProcedure(mockDataStore.users),
  getById: createMockProcedure(mockDataStore.users),
  create: createMockProcedure(mockDataStore.users),
  update: createMockProcedure(mockDataStore.users),
  delete: createMockProcedure(mockDataStore.users),
  updateRole: createMockProcedure(mockDataStore.users),
};

// ============================================================================
// Mock Router - Charts
// ============================================================================

const chartsRouter = {
  getPatientStats: createMockProcedure(),
  getAppointmentStats: createMockProcedure(),
  getLeadStats: createMockProcedure(),
  getRevenueStats: createMockProcedure(),
  getConversionStats: createMockProcedure(),
};

// ============================================================================
// Mock Router - Comments
// ============================================================================

const commentsRouter = {
  list: createMockProcedure(),
  create: createMockProcedure(),
  update: createMockProcedure(),
  delete: createMockProcedure(),
};

// ============================================================================
// Mock Router - Audit Logs
// ============================================================================

const auditLogsRouter = {
  list: createMockProcedure(),
  getById: createMockProcedure(),
  export: createMockProcedure(),
};

// ============================================================================
// Main Mock Router
// ============================================================================

const mockRouter = {
  patients: patientsRouter,
  appointments: appointmentsRouter,
  customers: leadsRouter,
  whatsapp: whatsappRouter,
  doctors: doctorsRouter,
  campaigns: campaignsRouter,
  camps: campsRouter,
  offers: offersRouter,
  auth: authRouter,
  users: usersRouter,
  charts: chartsRouter,
  comments: commentsRouter,
  auditLogs: auditLogsRouter,
};

// ============================================================================
// Mock tRPC Client
// ============================================================================

export const mockTRPCClient = {
  ...mockRouter,
};

/**
 * Mock لـ useTRPC hook
 */
export const useTRPC = vi.fn(() => mockTRPCClient);

/**
 * Mock لـ tRPC provider
 */
export const TRPCProvider = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  return React.createElement(React.Fragment, null, children);
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * تحديث mock procedure ببيانات محددة
 */
export const updateMockProcedure = (
  routerName: keyof typeof mockRouter,
  procedureName: string,
  mockData: unknown[]
) => {
  const router = mockRouter[routerName] as MockRouter;
  const procedure = router[procedureName] as MockProcedure;

  if (procedure) {
    procedure.useQuery = vi.fn(() => ({
      data: mockData[0] || undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    }));
    procedure.query = vi.fn(() => Promise.resolve(mockData[0]));
  }
};

/**
 * محاكاة خطأ في procedure
 */
export const mockProcedureError = (
  routerName: keyof typeof mockRouter,
  procedureName: string,
  error: Error
) => {
  const router = mockRouter[routerName] as MockRouter;
  const procedure = router[procedureName] as MockProcedure;

  if (procedure) {
    procedure.useQuery = vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
      refetch: vi.fn(() => Promise.resolve()),
    }));
    procedure.query = vi.fn(() => Promise.reject(error));
  }
};

/**
 * محاكاة حالة loading في procedure
 */
export const mockProcedureLoading = (
  routerName: keyof typeof mockRouter,
  procedureName: string
) => {
  const router = mockRouter[routerName] as MockRouter;
  const procedure = router[procedureName] as MockProcedure;

  if (procedure) {
    procedure.useQuery = vi.fn(() => ({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    }));
  }
};

// ============================================================================
// تصدير الافتراضي
// ============================================================================

export default mockTRPCClient;
