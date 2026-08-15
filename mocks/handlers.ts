/**
 * MSW Handlers (Mock Service Worker Handlers)
 * يوفر handlers لـ MSW لـ mocking API endpoints
 */

import { http, HttpResponse } from 'msw';

// ============================================================================
// أنواع TypeScript
// ============================================================================

/**
 * Mock response
 */
interface MockResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * إنشاء response ناجح
 */
const createSuccessResponse = <T = unknown>(data: T, message?: string): MockResponse<T> => ({
  success: true,
  data,
  message,
});

/**
 * إنشاء response خطأ
 */
const createErrorResponse = (error: string, message?: string): MockResponse => ({
  success: false,
  error,
  message,
});

/**
 * محاكاة تأخير الشبكة
 */
const simulateNetworkDelay = (ms: number = 100) => {
  return new Promise((resolve) => {
    void setTimeout(resolve, ms);
  });
};

// ============================================================================
// Auth Handlers
// ============================================================================

/**
 * Handler لتسجيل الدخول
 */
export const loginHandler = http.post('/api/auth/login', async ({ request }) => {
  await simulateNetworkDelay();

  try {
    const body = (await request.json()) as { email: string; password: string };
    const { email, password } = body;

    // Mock validation
    if (email === 'admin@example.com' && password === 'password') {
      return HttpResponse.json(
        createSuccessResponse(
          {
            user: {
              id: 'user_1',
              name: 'مدير النظام',
              email: 'admin@example.com',
              role: 'admin',
            },
            token: 'mock-jwt-token',
          },
          'تم تسجيل الدخول بنجاح'
        )
      );
    }

    return HttpResponse.json(
      createErrorResponse('INVALID_CREDENTIALS', 'بيانات الدخول غير صحيحة'),
      { status: 401 }
    );
  } catch {
    return HttpResponse.json(createErrorResponse('INVALID_REQUEST', 'طلب غير صالح'), {
      status: 400,
    });
  }
});

/**
 * Handler لتسجيل الخروج
 */
export const logoutHandler = http.post('/api/auth/logout', async () => {
  await simulateNetworkDelay();

  return HttpResponse.json(createSuccessResponse(null, 'تم تسجيل الخروج بنجاح'));
});

/**
 * Handler للحصول على بيانات المستخدم الحالي
 */
export const meHandler = http.get('/api/auth/me', async () => {
  await simulateNetworkDelay();

  return HttpResponse.json(
    createSuccessResponse({
      id: 'user_1',
      name: 'مدير النظام',
      email: 'admin@example.com',
      role: 'admin',
    })
  );
});

// ============================================================================
// Patient Handlers
// ============================================================================

/**
 * Handler للحصول على قائمة المرضى
 */
export const patientsListHandler = http.get('/api/patients', async ({ request }) => {
  await simulateNetworkDelay();

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  // Mock data
  const patients = Array.from({ length: limit }, (_, i) => ({
    id: `patient_${page * limit + i + 1}`,
    fullName: `مريض ${page * limit + i + 1}`,
    phone: `96777${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: `patient${i}@example.com`,
    createdAt: new Date().toISOString(),
  }));

  return HttpResponse.json(
    createSuccessResponse({
      patients,
      total: 100,
      page,
      limit,
      totalPages: 10,
    })
  );
});

/**
 * Handler للحصول على مريض محدد
 */
export const patientByIdHandler = http.get('/api/patients/:id', async ({ params }) => {
  await simulateNetworkDelay();

  const { id } = params;

  return HttpResponse.json(
    createSuccessResponse({
      id,
      fullName: 'أحمد محمد أحمد',
      phone: '967773171477',
      email: 'ahmed@example.com',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      createdAt: new Date().toISOString(),
    })
  );
});

/**
 * Handler لإنشاء مريض جديد
 */
export const createPatientHandler = http.post('/api/patients', async ({ request }) => {
  await simulateNetworkDelay();

  try {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      createSuccessResponse(
        {
          id: `patient_${Date.now()}`,
          ...body,
          createdAt: new Date().toISOString(),
        },
        'تم إنشاء المريض بنجاح'
      ),
      { status: 201 }
    );
  } catch {
    return HttpResponse.json(createErrorResponse('INVALID_REQUEST', 'طلب غير صالح'), {
      status: 400,
    });
  }
});

/**
 * Handler لتحديث مريض
 */
export const updatePatientHandler = http.put('/api/patients/:id', async ({ params, request }) => {
  await simulateNetworkDelay();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { id } = params;

    return HttpResponse.json(
      createSuccessResponse(
        {
          id,
          ...body,
          updatedAt: new Date().toISOString(),
        },
        'تم تحديث المريض بنجاح'
      )
    );
  } catch {
    return HttpResponse.json(createErrorResponse('INVALID_REQUEST', 'طلب غير صالح'), {
      status: 400,
    });
  }
});

/**
 * Handler لحذف مريض
 */
export const deletePatientHandler = http.delete('/api/patients/:id', async ({ params }) => {
  await simulateNetworkDelay();

  const { id } = params;

  return HttpResponse.json(createSuccessResponse({ id }, 'تم حذف المريض بنجاح'));
});

// ============================================================================
// Appointment Handlers
// ============================================================================

/**
 * Handler للحصول على قائمة المواعيد
 */
export const appointmentsListHandler = http.get('/api/appointments', async ({ request }) => {
  await simulateNetworkDelay();

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  // Mock data
  const appointments = Array.from({ length: limit }, (_, i) => ({
    id: `appointment_${page * limit + i + 1}`,
    patientId: `patient_${(i % 5) + 1}`,
    fullName: `مريض ${(i % 5) + 1}`,
    phone: `96777${Math.floor(10000000 + Math.random() * 90000000)}`,
    doctorId: 'doctor_1',
    doctorName: 'د. سالم العلي',
    appointmentDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: '10:00',
    status: ['pending', 'confirmed', 'cancelled', 'attended'][i % 4],
    createdAt: new Date().toISOString(),
  }));

  return HttpResponse.json(
    createSuccessResponse({
      appointments,
      total: 100,
      page,
      limit,
      totalPages: 10,
    })
  );
});

/**
 * Handler لإنشاء موعد جديد
 */
export const createAppointmentHandler = http.post('/api/appointments', async ({ request }) => {
  await simulateNetworkDelay();

  try {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      createSuccessResponse(
        {
          id: `appointment_${Date.now()}`,
          ...body,
          createdAt: new Date().toISOString(),
        },
        'تم إنشاء الموعد بنجاح'
      ),
      { status: 201 }
    );
  } catch {
    return HttpResponse.json(createErrorResponse('INVALID_REQUEST', 'طلب غير صالح'), {
      status: 400,
    });
  }
});

/**
 * Handler لتحديث حالة الموعد
 */
export const updateAppointmentStatusHandler = http.patch(
  '/api/appointments/:id/status',
  async ({ params, request }) => {
    await simulateNetworkDelay();

    try {
      const body = (await request.json()) as Record<string, unknown>;
      const { id } = params;

      return HttpResponse.json(
        createSuccessResponse(
          {
            id,
            ...body,
            updatedAt: new Date().toISOString(),
          },
          'تم تحديث حالة الموعد بنجاح'
        )
      );
    } catch {
      return HttpResponse.json(createErrorResponse('INVALID_REQUEST', 'طلب غير صالح'), {
        status: 400,
      });
    }
  }
);

// ============================================================================
// Lead Handlers
// ============================================================================

/**
 * Handler للحصول على قائمة العملاء المحتملين
 */
export const leadsListHandler = http.get('/api/leads', async ({ request }) => {
  await simulateNetworkDelay();

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  // Mock data
  const leads = Array.from({ length: limit }, (_, i) => ({
    id: `lead_${page * limit + i + 1}`,
    fullName: `عميل محتمل ${page * limit + i + 1}`,
    phone: `96777${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: `lead${i}@example.com`,
    status: ['new', 'contacted', 'converted', 'lost'][i % 4],
    source: ['facebook', 'instagram', 'website', 'whatsapp'][i % 4],
    createdAt: new Date().toISOString(),
  }));

  return HttpResponse.json(
    createSuccessResponse({
      leads,
      total: 100,
      page,
      limit,
      totalPages: 10,
    })
  );
});

/**
 * Handler لتحويل عميل محتمل
 */
export const convertLeadHandler = http.post('/api/leads/:id/convert', async ({ params }) => {
  await simulateNetworkDelay();

  const { id } = params;

  return HttpResponse.json(
    createSuccessResponse(
      { id, status: 'converted', convertedAt: new Date().toISOString() },
      'تم تحويل العميل المحتمل بنجاح'
    )
  );
});

// ============================================================================
// WhatsApp Handlers
// ============================================================================

/**
 * Handler للحصول على قائمة المحادثات
 */
export const conversationsListHandler = http.get('/api/whatsapp/conversations', async () => {
  await simulateNetworkDelay();

  // Mock data
  const conversations = Array.from({ length: 10 }, (_, i) => ({
    id: `conversation_${i + 1}`,
    customerName: `عميل ${i + 1}`,
    phoneNumber: `96777${Math.floor(10000000 + Math.random() * 90000000)}`,
    lastMessageAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    unreadCount: i % 3,
    createdAt: new Date().toISOString(),
  }));

  return HttpResponse.json(
    createSuccessResponse({
      conversations,
      total: 10,
    })
  );
});

/**
 * Handler للحصول على رسائل محادثة
 */
export const messagesListHandler = http.get(
  '/api/whatsapp/conversations/:id/messages',
  async () => {
    await simulateNetworkDelay();

    // Mock data
    const messages = Array.from({ length: 10 }, (_, i) => ({
      id: `message_${i + 1}`,
      content: `رسالة ${i + 1}`,
      direction: i % 2 === 0 ? 'inbound' : 'outbound',
      status: 'read',
      sentAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    }));

    return HttpResponse.json(
      createSuccessResponse({
        messages,
        total: 10,
      })
    );
  }
);

/**
 * Handler لإرسال رسالة واتساب
 */
export const sendMessageHandler = http.post('/api/whatsapp/messages', async ({ request }) => {
  await simulateNetworkDelay();

  try {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      createSuccessResponse(
        {
          id: `message_${Date.now()}`,
          ...body,
          status: 'sent',
          sentAt: new Date().toISOString(),
        },
        'تم إرسال الرسالة بنجاح'
      ),
      { status: 201 }
    );
  } catch {
    return HttpResponse.json(createErrorResponse('INVALID_REQUEST', 'طلب غير صالح'), {
      status: 400,
    });
  }
});

/**
 * Handler لـ Webhook واتساب
 */
export const whatsappWebhookHandler = http.post('/api/webhooks/whatsapp', async ({ request }) => {
  await simulateNetworkDelay();

  try {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      createSuccessResponse(
        {
          webhookId: `webhook_${Date.now()}`,
          ...body,
          processedAt: new Date().toISOString(),
        },
        'تم معالجة الـ webhook بنجاح'
      ),
      { status: 200 }
    );
  } catch {
    return HttpResponse.json(createErrorResponse('INVALID_REQUEST', 'طلب غير صالح'), {
      status: 400,
    });
  }
});

// ============================================================================
// File Upload Handlers
// ============================================================================

/**
 * Handler لرفع الملفات
 */
export const uploadHandler = http.post('/api/upload', async () => {
  await simulateNetworkDelay(500); // محاكاة رفع ملف أبطأ

  return HttpResponse.json(
    createSuccessResponse(
      {
        url: 'https://example.com/uploads/mock-file.jpg',
        filename: 'mock-file.jpg',
        size: 102400,
        mimeType: 'image/jpeg',
      },
      'تم رفع الملف بنجاح'
    ),
    { status: 201 }
  );
});

// ============================================================================
// Export Handlers
// ============================================================================

/**
 * Handler لتصدير البيانات
 */
export const exportHandler = http.post('/api/export', async ({ request }) => {
  await simulateNetworkDelay(1000); // محاكاة تصدير أبطأ

  try {
    const body = (await request.json()) as { format: string };
    const { format } = body;

    return HttpResponse.json(
      createSuccessResponse(
        {
          downloadUrl: `https://example.com/exports/export.${format}`,
          filename: `export.${format}`,
          size: 102400,
        },
        'تم تصدير البيانات بنجاح'
      )
    );
  } catch {
    return HttpResponse.json(createErrorResponse('INVALID_REQUEST', 'طلب غير صالح'), {
      status: 400,
    });
  }
});

// ============================================================================
// Chart Handlers
// ============================================================================

/**
 * Handler للحصول على إحصائيات المرضى
 */
export const patientStatsHandler = http.get('/api/charts/patients', async () => {
  await simulateNetworkDelay();

  return HttpResponse.json(
    createSuccessResponse({
      total: 1000,
      newThisMonth: 50,
      active: 800,
      inactive: 200,
      growth: 10,
    })
  );
});

/**
 * Handler للحصول على إحصائيات المواعيد
 */
export const appointmentStatsHandler = http.get('/api/charts/appointments', async () => {
  await simulateNetworkDelay();

  return HttpResponse.json(
    createSuccessResponse({
      total: 500,
      confirmed: 300,
      pending: 100,
      cancelled: 50,
      attended: 400,
      attendanceRate: 80,
    })
  );
});

/**
 * Handler للحصول على إحصائيات العملاء المحتملين
 */
export const leadStatsHandler = http.get('/api/charts/leads', async () => {
  await simulateNetworkDelay();

  return HttpResponse.json(
    createSuccessResponse({
      total: 300,
      new: 100,
      contacted: 150,
      converted: 40,
      lost: 10,
      conversionRate: 13.3,
    })
  );
});

// ============================================================================
// Error Handlers
// ============================================================================

/**
 * Handler لمحاكاة أخطاء الشبكة
 */
export const networkErrorHandler = http.get('/api/error', async () => {
  await simulateNetworkDelay();

  return HttpResponse.json(createErrorResponse('NETWORK_ERROR', 'خطأ في الشبكة'), { status: 503 });
});

/**
 * Handler لمحاكاة خطأ 404
 */
export const notFoundHandler = http.get('/api/not-found', async () => {
  await simulateNetworkDelay();

  return HttpResponse.json(createErrorResponse('NOT_FOUND', 'المورد غير موجود'), { status: 404 });
});

/**
 * Handler لمحاكاة خطأ 500
 */
export const serverErrorHandler = http.get('/api/server-error', async () => {
  await simulateNetworkDelay();

  return HttpResponse.json(createErrorResponse('SERVER_ERROR', 'خطأ في الخادم'), { status: 500 });
});

// ============================================================================
// تصدير جميع الـ handlers
// ============================================================================

export const handlers = [
  // Auth handlers
  loginHandler,
  logoutHandler,
  meHandler,

  // Patient handlers
  patientsListHandler,
  patientByIdHandler,
  createPatientHandler,
  updatePatientHandler,
  deletePatientHandler,

  // Appointment handlers
  appointmentsListHandler,
  createAppointmentHandler,
  updateAppointmentStatusHandler,

  // Lead handlers
  leadsListHandler,
  convertLeadHandler,

  // WhatsApp handlers
  conversationsListHandler,
  messagesListHandler,
  sendMessageHandler,
  whatsappWebhookHandler,

  // File upload handlers
  uploadHandler,

  // Export handlers
  exportHandler,

  // Chart handlers
  patientStatsHandler,
  appointmentStatsHandler,
  leadStatsHandler,

  // Error handlers
  networkErrorHandler,
  notFoundHandler,
  serverErrorHandler,
];
