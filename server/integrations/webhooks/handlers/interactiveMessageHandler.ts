import { MetaWebhookMessagePayload, MessageHandlerContext, MessageHandlerResult } from '../types';
import { createLogger } from '../../../_core/logger';

const logger = createLogger('interactiveMessageHandler');

/**
 * معالجة الرسائل التفاعلية (أزرار، قوائم، استفسارات عن منتجات)
 *
 * @param message - payload الرسالة
 * @param context - سياق المعالجة
 * @returns نتيجة المعالجة
 */
export async function handleInteractiveMessage(
  message: MetaWebhookMessagePayload,
  context: MessageHandlerContext
): Promise<MessageHandlerResult> {
  const { button, interactive } = message;
  const { phoneNumber } = context;

  let content: string;
  let messageType: string;
  let metaPayload: Record<string, unknown> | null = null;

  // معالجة الأزرار القديمة (button)
  if (button) {
    const payload = button.payload;
    metaPayload = { payload, buttonText: button.text };

    // معالجة payload للأزرار (CONFIRM_ / CANCEL_)
    if (payload && (payload.startsWith('CONFIRM_') || payload.startsWith('CANCEL_'))) {
      await handleButtonPayload(payload, phoneNumber);
    }
    logger.info(`🔘 Received button reply from ${phoneNumber}`);

    content = button.text || button.payload || 'زر';
    messageType = 'button_reply';
  }
  // معالجة الرسائل التفاعلية الجديدة (interactive)
  else if (interactive) {
    if (interactive.type === 'button_reply' && interactive.button_reply) {
      const buttonId = interactive.button_reply.id;
      const buttonTitle = interactive.button_reply.title;
      content = buttonTitle;
      messageType = 'button_reply';
      metaPayload = { buttonId, buttonTitle };

      // معالجة payload للأزرار
      if (buttonId && (buttonId.startsWith('CONFIRM_') || buttonId.startsWith('CANCEL_'))) {
        await handleButtonPayload(buttonId, phoneNumber);
      }
      logger.info(`🔘 Received interactive button reply from ${phoneNumber}`);
    } else if (interactive.type === 'list_reply' && interactive.list_reply) {
      content = interactive.list_reply.title;
      messageType = 'list_reply';
      metaPayload = {
        listId: interactive.list_reply.id,
        listTitle: interactive.list_reply.title,
        description: interactive.list_reply.description,
      };
      logger.info(`📋 Received list reply from ${phoneNumber}`);
    } else if (interactive.referred_product) {
      // معالجة رسالة استفسار عن منتج
      content = `🔍 استفسار عن منتج`;
      messageType = 'product_enquiry';
      metaPayload = {
        catalogId: interactive.referred_product.catalog_id,
        productRetailerId: interactive.referred_product.product_retailer_id,
      };
      logger.info(`🔍 Received product enquiry from ${phoneNumber}`);
    } else {
      logger.warn(`Unknown interactive type: ${interactive.type}`);
      content = 'رسالة تفاعلية غير مدعومة';
      messageType = 'unknown';
    }
  } else {
    logger.warn('Interactive message has no button or interactive data');
    content = 'رسالة تفاعلية غير مدعومة';
    messageType = 'unknown';
  }

  return {
    content,
    messageType,
    metaPayload,
  };
}

/**
 * دالة مشتركة لمعالجة payload الأزرار وتحديث الحالة وإرسال رسائل تلقائية
 * تعمل مع كلا نوعي الأزرار: message.button.payload و interactive.button_reply.id
 * Format: CONFIRM_APPOINTMENT_123 أو CANCEL_CAMP_456
 */
async function handleButtonPayload(payload: string, _userPhone: string): Promise<void> {
  const parts = payload.split('_');
  const action = parts[0];
  const type = parts[1];
  const id = parts[parts.length - 1];

  if (!action || !type || !id) {
    logger.warn(`Invalid payload format: ${payload}`);
    return;
  }
  const bookingId = parseInt(id);
  if (isNaN(bookingId)) {
    logger.warn(`Invalid booking ID in payload: ${payload}`);
    return;
  }

  const { getDb } = await import('../../../database/db');
  const { eq } = await import('drizzle-orm');
  const { appointments, offerLeads, campRegistrations, camps, offers } =
    await import('../../../../drizzle/schema');
  const { dispatchWhatsAppMessage } = await import('../../../services/whatsappMessageDispatcher');

  const db = await getDb();
  if (!db) {
    return;
  }

  const newStatus = action === 'CONFIRM' ? 'confirmed' : 'cancelled';
  const now = new Date();

  if (type === 'APPOINTMENT') {
    const updateData: {
      status: 'confirmed' | 'cancelled';
      updatedAt: Date;
      confirmedAt?: Date;
      cancelledAt?: Date;
    } = { status: newStatus as 'confirmed' | 'cancelled', updatedAt: now };
    if (newStatus === 'confirmed') {
      updateData.confirmedAt = now;
    } else if (newStatus === 'cancelled') {
      updateData.cancelledAt = now;
    }
    await db.update(appointments).set(updateData).where(eq(appointments.id, bookingId));
    logger.info(`Appointment ${bookingId} updated to ${newStatus}`);

    // إرسال رسالة تلقائية
    const [appt] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, bookingId))
      .limit(1);
    if (appt?.phone) {
      const triggerEvent = newStatus === 'confirmed' ? 'on_confirmed' : 'on_cancelled';
      dispatchWhatsAppMessage({
        entityType: 'appointment',
        triggerEvent,
        phone: appt.phone,
        recipientName: appt.fullName || undefined,
        variables: {
          name: appt.fullName || 'العميل',
          date:
            appt.appointmentDate && appt.appointmentDate !== null
              ? new Date(appt.appointmentDate as Date).toLocaleDateString('ar-YE')
              : appt.preferredDate
                ? `${appt.preferredDate} الساعة ${appt.preferredTime || ''}`
                : 'غير محدد',
          doctor: 'الطبيب',
          service: appt.procedure || 'الخدمة',
        },
        entityId: bookingId,
      }).catch((err) => logger.error(`Failed to send ${triggerEvent} for appt ${bookingId}:`, err));
    }
  } else if (type === 'OFFER') {
    const updateData: Record<string, unknown> = { status: newStatus, updatedAt: now };
    if (newStatus === 'confirmed') {
      updateData.confirmedAt = now;
    } else if (newStatus === 'cancelled') {
      updateData.cancelledAt = now;
    }
    await db.update(offerLeads).set(updateData).where(eq(offerLeads.id, bookingId));
    logger.info(`Offer lead ${bookingId} updated to ${newStatus}`);

    // إرسال رسالة تلقائية
    const [lead] = await db.select().from(offerLeads).where(eq(offerLeads.id, bookingId)).limit(1);
    if (lead?.phone) {
      const [offer] = lead.offerId
        ? await db
            .select({ title: offers.title })
            .from(offers)
            .where(eq(offers.id, lead.offerId))
            .limit(1)
        : [undefined];
      const triggerEvent = newStatus === 'confirmed' ? 'on_confirmed' : 'on_cancelled';
      dispatchWhatsAppMessage({
        entityType: 'offer_lead',
        triggerEvent,
        phone: lead.phone,
        recipientName: lead.fullName || undefined,
        variables: {
          name: lead.fullName || 'العميل',
          service: offer?.title || 'العرض',
        },
        entityId: bookingId,
      }).catch((err) =>
        logger.error(`Failed to send ${triggerEvent} for offer ${bookingId}:`, err)
      );
    }
  } else if (type === 'CAMP') {
    const updateData: Record<string, unknown> = { status: newStatus, updatedAt: now };
    if (newStatus === 'confirmed') {
      updateData.confirmedAt = now;
    } else if (newStatus === 'cancelled') {
      updateData.cancelledAt = now;
    }
    await db.update(campRegistrations).set(updateData).where(eq(campRegistrations.id, bookingId));
    logger.info(`Camp registration ${bookingId} updated to ${newStatus}`);

    // إرسال رسالة تلقائية
    const [reg] = await db
      .select()
      .from(campRegistrations)
      .where(eq(campRegistrations.id, bookingId))
      .limit(1);
    if (reg?.phone) {
      const [camp] = await db.select().from(camps).where(eq(camps.id, reg.campId)).limit(1);
      const triggerEvent = newStatus === 'confirmed' ? 'on_confirmed' : 'on_cancelled';
      const dateStr = reg.preferredDate
        ? String(reg.preferredDate)
        : camp?.startDate
          ? new Date(camp.startDate).toLocaleDateString('ar-YE')
          : 'غير محدد';
      const timeStr =
        reg.preferredTimeSlot === 'morning'
          ? `صباحاً ${camp?.morningTime || ''}`.trim()
          : reg.preferredTimeSlot === 'evening'
            ? `مساءً ${camp?.eveningTime || ''}`.trim()
            : 'غير محدد';
      dispatchWhatsAppMessage({
        entityType: 'camp_registration',
        triggerEvent,
        phone: reg.phone,
        recipientName: reg.fullName || undefined,
        variables: {
          name: reg.fullName || 'المسجل',
          camp_name: camp?.name || 'المخيم',
          date: dateStr,
          time: timeStr,
          location: 'صنعاء - الستين الشمالي - قبل جولة الجمنه',
        },
        entityId: bookingId,
      }).catch((err) =>
        logger.error(`Failed to send ${triggerEvent} for camp reg ${bookingId}:`, err)
      );
    }
  }
}
