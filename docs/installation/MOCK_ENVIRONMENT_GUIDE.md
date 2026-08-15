# دليل بيئة المحاكاة - BOCAM Project
# Mock Environment Guide - BOCAM Project

**الإصدار:** 1.0  
**التاريخ:** 2026-05-27  
**الحالة:** ساري المفعول - إلزامي للتطوير المحلي  
**المعايير:** Mocking Pattern, Cost Optimization, Development Safety

---

## جدول المحتويات

1. نظرة عامة
2. مبدأ Mocking Mode
3. تفعيل Mocking Mode
4. Mocking لخدمات WhatsApp
5. Mocking لخدمات SMS
6. Mocking لخدمات Email
7. Mocking لخدمات Meta Pixel
8. اختبار Mocking Mode
9. Best Practices
10. استكشاف الأخطاء

---

## 1. نظرة عامة

### 1.1 الهدف

توفير **Mocking Mode** في بيئة التطوير المحلي لمحاكاة جميع الخدمات الخارجية (WhatsApp, SMS, Email, Meta Pixel) دون استدعاء APIs حقيقية، مما يضمن:

- **توفير التكلفة:** عدم استهلاك حصص APIs المدفوعة
- **منع الأخطاء:** عدم إرسال رسائل حقيقية أثناء الاختبار
- **سرعة التطوير:** عدم انتظار استجابة APIs الخارجية
- **الاستقرار:** عمل النظام بدون اعتماد على APIs خارجية

### 1.2 الخدمات الممMocked

**الخدمات المدعومة:**
- ✅ WhatsApp Cloud API
- ✅ SMS Gateway (Twilio, etc.)
- ✅ Email Service (SendGrid, etc.)
- ✅ Meta Pixel & Conversion API
- ✅ OAuth External APIs

### 1.3 مبدأ العمل

```
┌─────────────────────────────────────────────────────────┐
│                    Mocking Mode                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Development Environment:                               │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Application │───▶│  Mock Layer  │                  │
│  └──────────────┘    └──────────────┘                  │
│                              │                           │
│                              ▼                           │
│  ┌──────────────────────────────────────────┐          │
│  │      Console Logs (Mock Responses)      │          │
│  │  ✓ WhatsApp: "Message sent successfully" │          │
│  │  ✓ SMS: "SMS sent to +1234567890"      │          │
│  │  ✓ Email: "Email sent to user@example.com" │         │
│  └──────────────────────────────────────────┘          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Production Environment:                                 │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Application │───▶│  Real APIs   │                  │
│  └──────────────┘    └──────────────┘                  │
│                              │                           │
│                              ▼                           │
│  ┌──────────────────────────────────────────┐          │
│  │          External APIs                  │          │
│  │  • Meta WhatsApp Cloud API              │          │
│  │  • SMS Gateway (Twilio, etc.)          │          │
│  │  • Email Service (SendGrid, etc.)      │          │
│  │  • Meta Pixel & Conversion API          │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. مبدأ Mocking Mode

### 2.1 تفعيل تلقائي

**القاعدة:** Mocking Mode يُفعل تلقائياً في:
- Development environment (`NODE_ENV=development`)
- Test environment (`NODE_ENV=test`)
- عندما `MOCK_MODE=true`

### 2.2 Environment Variables

**القاعدة:** استخدام متغيرات البيئة للتحكم في Mocking

```env
# Mocking Mode (default: true in development)
MOCK_MODE=true

# Mock specific services (overrides MOCK_MODE)
MOCK_WHATSAPP=true
MOCK_SMS=true
MOCK_EMAIL=true
MOCK_META_PIXEL=true

# Detailed logging (default: true in development)
MOCK_LOGGING=true
MOCK_LOG_LEVEL=debug  # debug, info, warn, error
```

### 2.3 قراءة الإعدادات

**ملف:** `server/_core/env.ts`

```typescript
export const ENV = {
  // ... existing config
  
  // Mocking Mode
  mockMode: process.env.MOCK_MODE === 'true' || 
            process.env.NODE_ENV === 'development' || 
            process.env.NODE_ENV === 'test',
  
  // Service-specific mocks
  mockWhatsApp: process.env.MOCK_WHATSAPP === 'true' || process.env.MOCK_MODE === 'true',
  mockSMS: process.env.MOCK_SMS === 'true' || process.env.MOCK_MODE === 'true',
  mockEmail: process.env.MOCK_EMAIL === 'true' || process.env.MOCK_MODE === 'true',
  mockMetaPixel: process.env.MOCK_META_PIXEL === 'true' || process.env.MOCK_MODE === 'true',
  
  // Mock logging
  mockLogging: process.env.MOCK_LOGGING === 'true' || process.env.NODE_ENV === 'development',
  mockLogLevel: process.env.MOCK_LOG_LEVEL || 'debug',
};
```

---

## 3. تفعيل Mocking Mode

### 3.1 تحديث ملف .env.example

```env
# Mocking Mode (default: true in development)
MOCK_MODE=true

# Mock specific services (overrides MOCK_MODE)
MOCK_WHATSAPP=true
MOCK_SMS=true
MOCK_EMAIL=true
MOCK_META_PIXEL=true

# Detailed logging (default: true in development)
MOCK_LOGGING=true
MOCK_LOG_LEVEL=debug
```

### 3.2 تحديث ملف .env.local (development)

```env
# Development: Mocking enabled by default
MOCK_MODE=true
MOCK_WHATSAPP=true
MOCK_SMS=true
MOCK_EMAIL=true
MOCK_META_PIXEL=true

MOCK_LOGGING=true
MOCK_LOG_LEVEL=debug
```

### 3.3 تحديث ملف .env.production (production)

```env
# Production: Mocking disabled by default
MOCK_MODE=false
MOCK_WHATSAPP=false
MOCK_SMS=false
MOCK_EMAIL=false
MOCK_META_PIXEL=false

MOCK_LOGGING=false
```

---

## 4. Mocking لخدمات WhatsApp

### 4.1 إنشاء Mock Service

**ملف:** `server/services/whatsapp/mockWhatsAppService.ts`

```typescript
/**
 * Mock WhatsApp Service for Development
 * 
 * Simulates WhatsApp Cloud API responses without making real API calls.
 * Logs all operations to console for debugging.
 */

import { ENV } from '../../_core/env';

export interface SendMessageParams {
  to: string;
  templateName?: string;
  templateParams?: string[];
  text?: string;
}

export interface SendTemplateParams {
  to: string;
  templateName: string;
  languageCode: string;
  templateParams?: string[];
}

/**
 * Mock sending a text message
 */
export async function mockSendMessage(params: SendMessageParams): Promise<void> {
  if (!ENV.mockWhatsApp || !ENV.mockLogging) return;
  
  const timestamp = new Date().toISOString();
  
  console.log('📱 [MOCK] WhatsApp Message');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Time: ${timestamp}`);
  console.log(`To: ${params.to}`);
  console.log(`Type: ${params.templateName ? 'Template' : 'Text'}`);
  
  if (params.templateName) {
    console.log(`Template: ${params.templateName}`);
    if (params.templateParams) {
      console.log(`Params: ${params.templateParams.join(', ')}`);
    }
  }
  
  if (params.text) {
    console.log(`Text: ${params.text}`);
  }
  
  console.log('Status: ✓ Sent successfully (mocked)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Mock sending a template message
 */
export async function mockSendTemplate(params: SendTemplateParams): Promise<void> {
  await mockSendMessage({
    to: params.to,
    templateName: params.templateName,
    templateParams: params.templateParams
  });
}

/**
 * Mock checking message status
 */
export async function mockGetMessageStatus(messageId: string): Promise<{
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}> {
  if (!ENV.mockWhatsApp || !ENV.mockLogging) return {
    status: 'sent',
    timestamp: new Date().toISOString()
  };
  
  const timestamp = new Date().toISOString();
  
  console.log('📱 [MOCK] WhatsApp Message Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Time: ${timestamp}`);
  console.log(`Message ID: ${messageId}`);
  console.log(`Status: sent`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    status: 'sent',
    timestamp
  };
}
```

### 4.2 دمج Mock في WhatsApp Service الحقيقي

**ملف:** `server/services/whatsapp/whatsappService.ts`

```typescript
import { ENV } from '../../_core/env';
import { mockSendMessage, mockSendTemplate, mockGetMessageStatus } from './mockWhatsAppService';

/**
 * Send WhatsApp message
 * Uses mock in development, real API in production
 */
export async function sendMessage(params: SendMessageParams): Promise<void> {
  if (ENV.mockWhatsApp) {
    await mockSendMessage(params);
    return;
  }
  
  // Real API call
  const response = await fetch('https://graph.facebook.com/v18.0/...', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ENV.whatsappAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: params.to,
      type: params.templateName ? 'template' : 'text',
      // ... real API payload
    })
  });
  
  if (!response.ok) {
    throw new Error('WhatsApp API error');
  }
}

/**
 * Send WhatsApp template message
 */
export async function sendTemplate(params: SendTemplateParams): Promise<void> {
  if (ENV.mockWhatsApp) {
    await mockSendTemplate(params);
    return;
  }
  
  // Real API call
  // ...
}
```

---

## 5. Mocking لخدمات SMS

### 5.1 إنشاء Mock Service

**ملف:** `server/services/sms/mockSMSService.ts`

```typescript
/**
 * Mock SMS Service for Development
 * 
 * Simulates SMS gateway responses without making real API calls.
 * Logs all operations to console for debugging.
 */

import { ENV } from '../../_core/env';

export interface SendSMSParams {
  to: string;
  message: string;
  sender?: string;
}

/**
 * Mock sending an SMS
 */
export async function mockSendSMS(params: SendSMSParams): Promise<void> {
  if (!ENV.mockSMS || !ENV.mockLogging) return;
  
  const timestamp = new Date().toISOString();
  
  console.log('💬 [MOCK] SMS Message');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Time: ${timestamp}`);
  console.log(`To: ${params.to}`);
  console.log(`Sender: ${params.sender || 'BOCAM'}`);
  console.log(`Message: ${params.message.substring(0, 100)}${params.message.length > 100 ? '...' : ''}`);
  console.log('Status: ✓ Sent successfully (mocked)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Mock checking SMS status
 */
export async function mockGetSMSStatus(messageId: string): Promise<{
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
}> {
  if (!ENV.mockSMS || !ENV.mockLogging) return {
    status: 'sent',
    timestamp: new Date().toISOString()
  };
  
  const timestamp = new Date().toISOString();
  
  console.log('💬 [MOCK] SMS Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Time: ${timestamp}`);
  console.log(`Message ID: ${messageId}`);
  console.log(`Status: sent`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    status: 'sent',
    timestamp
  };
}
```

### 5.2 دمج Mock في SMS Service الحقيقي

**ملف:** `server/services/sms/smsService.ts`

```typescript
import { ENV } from '../../_core/env';
import { mockSendSMS, mockGetSMSStatus } from './mockSMSService';

/**
 * Send SMS
 * Uses mock in development, real API in production
 */
export async function sendSMS(params: SendSMSParams): Promise<void> {
  if (ENV.mockSMS) {
    await mockSendSMS(params);
    return;
  }
  
  // Real API call (Twilio, etc.)
  const response = await fetch('https://api.twilio.com/...', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${ENV.smsApiKey}:${ENV.smsApiSecret}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      To: params.to,
      From: ENV.smsPhoneNumber,
      Body: params.message
    })
  });
  
  if (!response.ok) {
    throw new Error('SMS API error');
  }
}
```

---

## 6. Mocking لخدمات Email

### 6.1 إنشاء Mock Service

**ملف:** `server/services/email/mockEmailService.ts`

```typescript
/**
 * Mock Email Service for Development
 * 
 * Simulates email service responses without making real API calls.
 * Logs all operations to console for debugging.
 */

import { ENV } from '../../_core/env';

export interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  fromName?: string;
}

/**
 * Mock sending an email
 */
export async function mockSendEmail(params: SendEmailParams): Promise<void> {
  if (!ENV.mockEmail || !ENV.mockLogging) return;
  
  const timestamp = new Date().toISOString();
  
  console.log('📧 [MOCK] Email');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Time: ${timestamp}`);
  console.log(`To: ${params.to}`);
  console.log(`From: ${params.fromName || 'BOCAM'} <${params.from || 'noreply@bocam.com'}>`);
  console.log(`Subject: ${params.subject}`);
  
  if (params.text) {
    console.log(`Text: ${params.text.substring(0, 200)}${params.text.length > 200 ? '...' : ''}`);
  }
  
  if (params.html) {
    console.log(`HTML: <${params.html.substring(0, 100)}...> (length: ${params.html.length})`);
  }
  
  console.log('Status: ✓ Sent successfully (mocked)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
```

### 6.2 دمج Mock في Email Service الحقيقي

**ملف:** `server/services/email/emailService.ts`

```typescript
import { ENV } from '../../_core/env';
import { mockSendEmail } from './mockEmailService';

/**
 * Send email
 * Uses mock in development, real API in production
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (ENV.mockEmail) {
    await mockSendEmail(params);
    return;
  }
  
  // Real API call (SendGrid, etc.)
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ENV.emailApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: params.to }],
        from: { email: params.from, name: params.fromName },
        subject: params.subject
      }],
      content: [{
        type: params.html ? 'text/html' : 'text/plain',
        value: params.html || params.text
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error('Email API error');
  }
}
```

---

## 7. Mocking لخدمات Meta Pixel

### 7.1 إنشاء Mock Service

**ملف:** `server/services/meta/mockMetaService.ts`

```typescript
/**
 * Mock Meta Pixel Service for Development
 * 
 * Simulates Meta Pixel API responses without making real API calls.
 * Logs all operations to console for debugging.
 */

import { ENV } from '../../_core/env';

export interface TrackEventParams {
  eventName: string;
  eventData?: Record<string, any>;
  userId?: string;
}

/**
 * Mock tracking a Meta Pixel event
 */
export async function mockTrackEvent(params: TrackEventParams): Promise<void> {
  if (!ENV.mockMetaPixel || !ENV.mockLogging) return;
  
  const timestamp = new Date().toISOString();
  
  console.log('📊 [MOCK] Meta Pixel Event');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Time: ${timestamp}`);
  console.log(`Pixel ID: ${ENV.metaPixelId || 'MOCK_PIXEL_ID'}`);
  console.log(`Event: ${params.eventName}`);
  
  if (params.userId) {
    console.log(`User ID: ${params.userId}`);
  }
  
  if (params.eventData) {
    console.log('Event Data:');
    Object.entries(params.eventData).forEach(([key, value]) => {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    });
  }
  
  console.log('Status: ✓ Tracked successfully (mocked)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
```

### 7.2 دمج Mock في Meta Service الحقيقي

**ملف:** `server/services/meta/metaService.ts`

```typescript
import { ENV } from '../../_core/env';
import { mockTrackEvent } from './mockMetaService';

/**
 * Track Meta Pixel event
 * Uses mock in development, real API in production
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  if (ENV.mockMetaPixel) {
    await mockTrackEvent(params);
    return;
  }
  
  // Real API call
  const response = await fetch(`https://graph.facebook.com/v18.0/${ENV.metaPixelId}/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ENV.metaAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: [{
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: params.userId ? { external_id: params.userId } : {},
        custom_data: params.eventData
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error('Meta Pixel API error');
  }
}
```

---

## 8. اختبار Mocking Mode

### 8.1 اختبار تفعيل Mocking

**القاعدة:** تشغيل الاختبارات للتأكد من عمل Mocking

```bash
# تشغيل في وضع التطوير (Mocking مفعّل)
NODE_ENV=development npm dev

# التحقق من console logs
# يجب أن ترى:
# 📱 [MOCK] WhatsApp Message
# 💬 [MOCK] SMS Message
# 📧 [MOCK] Email
# 📊 [MOCK] Meta Pixel Event
```

### 8.2 اختبار تعطيل Mocking

```bash
# تشغيل مع Mocking معطّل
MOCK_MODE=false npm dev

# يجب أن تستدعي APIs حقيقية
# (تأكد من وجود valid API keys)
```

### 8.3 اختبار Mocking Service-specific

```bash
# Mock WhatsApp فقط
MOCK_WHATSAPP=true MOCK_SMS=false MOCK_EMAIL=false npm dev

# Mock SMS فقط
MOCK_WHATSAPP=false MOCK_SMS=true MOCK_EMAIL=false npm dev

# Mock Email فقط
MOCK_WHATSAPP=false MOCK_SMS=false MOCK_EMAIL=true npm dev
```

### 8.4 Unit Tests للـ Mock Services

**ملف:** `server/services/__tests__/mockServices.test.ts`

```typescript
import { mockSendMessage } from '../whatsapp/mockWhatsAppService';

describe('Mock WhatsApp Service', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should log mock message when mock mode is enabled', async () => {
    process.env.MOCK_WHATSAPP = 'true';
    
    await mockSendMessage({
      to: '+1234567890',
      text: 'Hello'
    });
    
    expect(console.log).toHaveBeenCalled();
  });
  
  it('should not log when mock mode is disabled', async () => {
    process.env.MOCK_WHATSAPP = 'false';
    
    await mockSendMessage({
      to: '+1234567890',
      text: 'Hello'
    });
    
    expect(console.log).not.toHaveBeenCalled();
  });
});
```

---

## 9. Best Practices

### 9.1 دائماً Mock في Development

**القاعدة:** Mocking Mode يجب أن يكون مفعّل دائماً في development

```typescript
// ✅ صحيح
if (ENV.mockWhatsApp) {
  await mockSendMessage(params);
} else {
  await realSendWhatsApp(params);
}

// ❌ خطأ
// عدم استخدام mock mode نهائياً
await realSendWhatsApp(params); // سيستهلك الحصة ويُرسل رسائل حقيقية
```

### 9.2 لا Mock في Production

**القاعدة:** التأكد من تعطيل Mocking في production

```typescript
// ✅ صحيح
if (process.env.NODE_ENV === 'production') {
  // دائماً استخدم APIs حقيقية في production
  await realSendWhatsApp(params);
} else {
  if (ENV.mockWhatsApp) {
    await mockSendMessage(params);
  } else {
    await realSendWhatsApp(params);
  }
}
```

### 9.3 Console Logging الواضح

**القاعدة:** استخدام emojis وتنسيق واضح للـ mock logs

```typescript
// ✅ صحيح
console.log('📱 [MOCK] WhatsApp Message');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`To: ${params.to}`);
console.log('Status: ✓ Sent successfully (mocked)');

// ❌ خطأ
console.log('Mock: sent message'); // غير واضح
```

### 9.4 Mock Response Data

**القاعدة:** mock services يجب أن ترجع بيانات واقعية

```typescript
// ✅ صحيح - بيانات واقعية
return {
  messageId: 'wamid.XXXXX',
  status: 'sent',
  timestamp: new Date().toISOString()
};

// ❌ خطأ - بيانات غير واقعية
return {
  messageId: 'mock-id-123',
  status: 'mocked'
};
```

### 9.5 Performance Mocking

**القاعدة:** mock calls يجب أن تكون سريعة

```typescript
// ✅ صحيح - immediate return
export async function mockSendMessage(params: SendMessageParams): Promise<void> {
  if (!ENV.mockLogging) return; // immediate return
  
  // ... logging
}

// ❌ خطأ - unnecessary delay
export async function mockSendMessage(params: SendMessageParams): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // unnecessary delay
  
  // ... logging
}
```

---

## 10. استكشاف الأخطاء

### 10.1 Mocking لا يعمل

**المشكلة:** Messages تُرسل حقيقياً بدلاً من mock

**الحل:**
```bash
# التحقق من environment variables
echo $MOCK_MODE
echo $MOCK_WHATSAPP

# التأكد من أنها مفعّلة
export MOCK_MODE=true
export MOCK_WHATSAPP=true

# إعادة تشغيل السيرفر
```

### 10.2 Console Logs لا تظهر

**المشكلة:** لا تظهر console logs للـ mocks

**الحل:**
```bash
# التحقق من MOCK_LOGGING
echo $MOCK_LOGGING

# تفعيله
export MOCK_LOGGING=true
export MOCK_LOG_LEVEL=debug

# إعادة تشغيل السيرفر
```

### 10.3 اختبار يفشل مع Mocking

**المشكلة:** Test يفشل لأنه يتوقع response حقيقي

**الحل:**
```typescript
// ✅ صحيح - تعديل test ليتعامل مع mock
beforeEach(() => {
  process.env.MOCK_MODE = 'true';
});

// أو استخدام spy لـ mock service
jest.spyOn(whatsappService, 'sendMessage').mockResolvedValue();
```

---

## الخاتمة

هذا الدليل يوفر نظام Mocking Mode شامل لتطوير BOCAM بأمان وفعالية. الالتزام بهذا الدليل يضمن:

- توفير التكلفة (عدم استهلاك حصص APIs)
- منع الأخطاء (عدم إرسال رسائل حقيقية أثناء الاختبار)
- سرعة التطوير (عدم انتظار APIs خارجية)
- استقرار النظام (عمل بدون APIs خارجية)

**Mocking Mode يجب أن يكون مفعّل دائماً في development والتعطيل فقط في production.**
