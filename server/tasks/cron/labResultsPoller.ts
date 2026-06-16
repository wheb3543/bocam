import { getDb, getHospitalDb } from '../../database/db';
import { sql } from 'drizzle-orm';
import { generateLabResultPDF } from '../../services/labPdfGenerator';
import { uploadPdfFile } from '../../services/fileUploadService';
import { messageSettings, whatsappTemplates } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { sendWhatsAppTemplateMessage, sendWhatsAppDocumentMessage } from '../../services/whatsappCloudAPI';
import { ensureConversationAndSaveMessage } from '../../services/whatsappMessageDispatcher';
import { normalizePhoneNumber } from '../../database/db';

const MAX_RETRIES = 3;

/**
 * Validation function for lab order data
 */
function validateLabOrder(order: any): { valid: boolean; error?: string } {
  if (!order) {
    return { valid: false, error: 'Order is null or undefined' };
  }
  if (!order.ORDER_ID) {
    return { valid: false, error: 'ORDER_ID is required' };
  }
  if (!order.PATIENT_NAME || order.PATIENT_NAME.trim() === '') {
    return { valid: false, error: 'PATIENT_NAME is required' };
  }
  if (!order.PHONE_NO || order.PHONE_NO.trim() === '') {
    return { valid: false, error: 'PHONE_NO is required' };
  }
  if (!order.DOCTOR_NAME || order.DOCTOR_NAME.trim() === '') {
    return { valid: false, error: 'DOCTOR_NAME is required' };
  }
  if (!order.MAIN_TEST_NAME || order.MAIN_TEST_NAME.trim() === '') {
    return { valid: false, error: 'MAIN_TEST_NAME is required' };
  }
  if (!order.RESULT_DATE) {
    return { valid: false, error: 'RESULT_DATE is required' };
  }
  // تحقق من صحة تاريخ النتيجة
  const resultDate = new Date(order.RESULT_DATE);
  if (isNaN(resultDate.getTime())) {
    return { valid: false, error: 'RESULT_DATE is invalid' };
  }
  return { valid: true };
}

export async function pollLabResults() {
  console.log('[Lab Results Poller] Starting poll...');
  const hospitalDb = await getHospitalDb();
  if (!hospitalDb) {
    console.error('[Lab Results Poller] Hospital database not available');
    return;
  }

  const db = await getDb();
  if (!db) {
    console.error('[Lab Results Poller] Main database not available');
    return;
  }

  try {
    // سحب الطلبات من قاعدة بيانات المستشفى
    const pendingOrders = await hospitalDb.execute(
      sql`SELECT * FROM lab_orders WHERE status = 'pending' AND retry_count < ${MAX_RETRIES} LIMIT 10`
    );

    console.log(`[Lab Results Poller] Found ${pendingOrders.length} pending orders`);

    for (const order of pendingOrders) {
      // Validation قبل المعالجة
      const validation = validateLabOrder(order as any);
      if (!validation.valid) {
        console.error(`[Lab Results Poller] Invalid order ${(order as any).ORDER_ID}: ${validation.error}`);
        await hospitalDb.execute(
          sql`UPDATE lab_orders SET status = 'failed', error_message = ${validation.error} WHERE ORDER_ID = ${(order as any).ORDER_ID}`
        );
        continue;
      }

      await processOrder(order as any, hospitalDb, db);
    }
  } catch (error) {
    console.error('[Lab Results Poller] Error:', error);
  }
}

async function processOrder(order: any, hospitalDb: any, db: any) {
  const startTime = Date.now();
  try {
    // تحديث الحالة في قاعدة بيانات المستشفى
    await hospitalDb.execute(
      sql`UPDATE lab_orders SET status = 'processing' WHERE ORDER_ID = ${order.ORDER_ID}`
    );
    console.log(`[Lab Results Poller] Processing order ${order.ORDER_ID} for patient ${order.PATIENT_NAME}`);

    const pdfBuffer = await generateLabResultPDF(order.ORDER_ID);
    console.log(`[Lab Results Poller] PDF generated for order ${order.ORDER_ID} (${pdfBuffer.length} bytes)`);

    // رفع PDF إلى سيرفر الملفات والحصول على URL عام
    const filename = `lab-result-${order.ORDER_ID}-${Date.now()}.pdf`;
    const pdfUrl = await uploadPdfFile(pdfBuffer, filename);
    console.log(`[Lab Results Poller] PDF uploaded to: ${pdfUrl}`);

    const normalizedPhone = normalizePhoneNumber(order.PHONE_NO);
    if (!normalizedPhone) {
      throw new Error('Invalid phone number');
    }

    // جلب إعداد الرسالة من messageSettings
    const [setting] = await db
      .select()
      .from(messageSettings)
      .where(eq(messageSettings.messageType, 'lab_result_ready'))
      .limit(1);

    if (!setting || !setting.isEnabled) {
      throw new Error('Lab result message setting not found or disabled');
    }

    // إرسال القالب عبر messageSettings
    if (setting.whatsappTemplateId) {
      const [template] = await db
        .select()
        .from(whatsappTemplates)
        .where(eq(whatsappTemplates.id, setting.whatsappTemplateId))
        .limit(1);

      if (!template) {
        throw new Error('Template not found');
      }

      // بناء المتغيرات للقالب
      const variables = {
        name: order.PATIENT_NAME,
        test_type: order.MAIN_TEST_NAME,
        doctor: order.DOCTOR_NAME,
        date: new Date(order.RESULT_DATE).toLocaleDateString('ar-SA'),
      };

      // بناء مكونات القالب
      const components: any[] = [];

      // إضافة header component للملف (PDF) - الطريقة الرسمية من WhatsApp API
      components.push({
        type: "header",
        parameters: [
          {
            type: "document",
            document: {
              link: pdfUrl,
              filename: `نتيجة ${order.MAIN_TEST_NAME}.pdf`,
            },
          },
        ],
      });

      // إضافة body component للمتغيرات النصية
      const bodyParams: { type: "text"; text: string; parameter_name?: string }[] = [];
      try {
        const parsedVars = JSON.parse(template.variables || '[]') as string[];
        const isNumeric = parsedVars.every(v => /^\d+$/.test(v));
        if (isNumeric) {
          const vals = Object.values(variables);
          for (const v of vals) {
            bodyParams.push({ type: "text", text: String(v) });
          }
        } else {
          for (const varName of parsedVars) {
            bodyParams.push({ type: "text", text: String((variables as any)[varName] ?? ''), parameter_name: varName });
          }
        }
      } catch {
        const vals = Object.values(variables);
        for (const v of vals) {
          bodyParams.push({ type: "text", text: String(v) });
        }
      }

      if (bodyParams.length > 0) {
        components.push({ type: "body", parameters: bodyParams });
      }

      const templateNameToSend = template.metaName || template.name;
      console.log(`[Lab Results Poller] Sending template "${templateNameToSend}" to ${normalizedPhone}`);
      const templateResult = await sendWhatsAppTemplateMessage(normalizedPhone, {
        templateName: templateNameToSend,
        languageCode: template.languageCode ?? "ar",
        components,
      });

      if (!templateResult.success) {
        console.error(`[Lab Results Poller] Template send failed for order ${order.ORDER_ID}: ${templateResult.error}`);
        // Fallback: إرسال الملف كرسالة منفصلة إذا فشل القالب
        console.log(`[Lab Results Poller] Attempting fallback: sending document separately`);
        const docResult = await sendWhatsAppDocumentMessage(normalizedPhone, pdfUrl, `نتيجة ${order.MAIN_TEST_NAME}.pdf`);

        if (!docResult.success) {
          throw new Error(`Template and document both failed. Template error: ${templateResult.error}, Document error: ${docResult.error}`);
        }

        // حفظ رسالة الملف فقط في حالة الفallback
        await ensureConversationAndSaveMessage({
          phone: normalizedPhone,
          customerName: order.PATIENT_NAME,
          messageContent: `ملف: نتيجة ${order.MAIN_TEST_NAME}.pdf`,
          messageId: docResult.messageId,
          labOrderId: order.ORDER_ID,
          mediaUrl: pdfUrl,
        });

        // تحديث الحالة في قاعدة بيانات المستشفى
        await hospitalDb.execute(
          sql`UPDATE lab_orders SET status = 'sent', whatsapp_msg_id = ${docResult.messageId}, processed_at = NOW() WHERE ORDER_ID = ${order.ORDER_ID}`
        );

        const duration = Date.now() - startTime;
        console.log(`[Lab Results Poller] Order ${order.ORDER_ID} sent via fallback (document only) in ${duration}ms`);
        return;
      }

      // إنشاء/تحديث المحادثة وحفظ رسالة القالب (بما في ذلك الملف)
      await ensureConversationAndSaveMessage({
        phone: normalizedPhone,
        customerName: order.PATIENT_NAME,
        messageContent: `نتيجة فحص: ${order.MAIN_TEST_NAME}`,
        messageId: templateResult.messageId,
        labOrderId: order.ORDER_ID,
        mediaUrl: pdfUrl,
      });

      // تحديث الحالة في قاعدة بيانات المستشفى
      await hospitalDb.execute(
        sql`UPDATE lab_orders SET status = 'sent', whatsapp_msg_id = ${templateResult.messageId}, processed_at = NOW() WHERE ORDER_ID = ${order.ORDER_ID}`
      );

      const duration = Date.now() - startTime;
      console.log(`[Lab Results Poller] Order ${order.ORDER_ID} sent successfully in ${duration}ms`);
    } else {
      throw new Error('No WhatsApp template linked to message setting');
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Lab Results Poller] Error processing order ${order.ORDER_ID} after ${duration}ms:`, errorMessage);

    const newRetryCount = order.retry_count + 1;

    if (newRetryCount >= MAX_RETRIES) {
      await hospitalDb.execute(
        sql`UPDATE lab_orders SET status = 'failed', retry_count = ${newRetryCount}, error_message = ${errorMessage} WHERE ORDER_ID = ${order.ORDER_ID}`
      );
      console.error(`[Lab Results Poller] Order ${order.ORDER_ID} marked as failed after ${newRetryCount} retries`);
    } else {
      await hospitalDb.execute(
        sql`UPDATE lab_orders SET status = 'pending', retry_count = ${newRetryCount}, error_message = ${errorMessage} WHERE ORDER_ID = ${order.ORDER_ID}`
      );
      console.log(`[Lab Results Poller] Order ${order.ORDER_ID} will retry (${newRetryCount}/${MAX_RETRIES})`);
    }
  }
}
