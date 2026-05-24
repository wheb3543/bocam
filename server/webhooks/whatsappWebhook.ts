/**
 * WhatsApp Webhook Handler — معالج Webhook لـ WhatsApp Cloud API
 *
 * ✅ التحقق من X-Hub-Signature-256 (وفق وثائق Meta الرسمية)
 * ✅ معالجة message_template_status_update تلقائياً
 * ✅ معالجة Opt-Out (STOP) تلقائياً
 * ✅ حفظ الرسائل الواردة في قاعدة البيانات
 * ✅ تحديث حالة القوالب تلقائياً عند تغيير Meta لها
 *
 * وفق وثائق Meta الرسمية:
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview/
 */

import crypto from "crypto";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { ENV } from "../_core/env";
import { getDb, getWhatsAppConversationByPhone, createWhatsAppConversation, createWhatsAppMessage, updateWhatsAppConversation, normalizePhoneNumber, createWhatsAppAccountAlert, createWhatsAppSecurityEvent, createWhatsAppPhoneQuality, createWhatsAppConversationQuality, createWhatsAppUserOptIn, updateWhatsAppUserOptIn, createWhatsAppTemplateQuality, logWebhookEvent } from "../db";
import { whatsappTemplates, whatsappNotifications, whatsappMessages, appointments, offerLeads, campRegistrations, camps, offers, whatsappContacts, whatsappOrders, whatsappReferrals, whatsappReactions, whatsappTransactions, whatsappConversations, whatsappTemplateQuality } from "../../drizzle/schema";
import { sendWhatsAppTextMessage } from "../whatsappCloudAPI";
import { processIncomingMessage } from "../services/whatsappAutoReply";
import { dispatchWhatsAppMessage } from "../services/whatsappMessageDispatcher";

// ─── Signature Verification ────────────────────────────────────────────────────

/**
 * التحقق من صحة توقيع Webhook وفق وثائق Meta الرسمية
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview/#validating-payloads
 *
 * يستخدم HMAC-SHA256 مع App Secret لضمان أن الطلب قادم من Meta فعلاً
 */
export function verifyWebhookSignature(req: Request): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET || process.env.JWT_SECRET;

  if (!appSecret) {
    // في بيئة التطوير: تخطي التحقق إذا لم يكن App Secret متاحاً
    if (process.env.NODE_ENV !== "production") {
      console.warn("[WhatsApp Webhook] ⚠️  META_APP_SECRET not set — skipping signature verification (dev mode)");
      return true;
    }
    console.error("[WhatsApp Webhook] ❌ META_APP_SECRET not set in production!");
    return false;
  }

  const signature = req.headers["x-hub-signature-256"] as string;
  if (!signature) {
    console.warn("[WhatsApp Webhook] ❌ Missing X-Hub-Signature-256 header");
    return false;
  }

  // الحصول على raw body للتحقق من التوقيع
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    console.warn("[WhatsApp Webhook] ⚠️  rawBody not available — ensure express.raw() middleware is applied");
    // Fallback: استخدام JSON.stringify
    const bodyStr = JSON.stringify(req.body);
    const expectedSig = "sha256=" + crypto
      .createHmac("sha256", appSecret)
      .update(bodyStr, "utf8")
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  }

  const expectedSig = "sha256=" + crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSig, "utf8")
    );
  } catch {
    return false;
  }
}

// ─── Webhook Verification (GET) ────────────────────────────────────────────────

/**
 * التحقق من Webhook Token عند تسجيل Webhook في Meta
 * وفق: GET /webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
 */
export function verifyWebhookToken(req: Request, res: Response): boolean {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode !== "subscribe") {
    console.warn("[WhatsApp Webhook] Invalid hub.mode:", mode);
    res.status(403).json({ error: "Invalid hub.mode" });
    return false;
  }

  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WEBHOOK_VERIFY_TOKEN || "sgh_crm_webhook_2024";

  if (token !== VERIFY_TOKEN) {
    console.warn("[WhatsApp Webhook] ❌ Invalid verify token");
    res.status(403).json({ error: "Invalid verify token" });
    return false;
  }

  if (!challenge) {
    console.warn("[WhatsApp Webhook] Missing hub.challenge");
    res.status(400).json({ error: "Missing challenge" });
    return false;
  }

  console.log("[WhatsApp Webhook] ✅ Webhook verified successfully");
  res.status(200).send(String(challenge));
  return true;
}

// ─── Message Handlers ──────────────────────────────────────────────────────────

/**
 * دالة مشتركة لمعالجة payload الأزرار وتحديث الحالة وإرسال رسائل تلقائية
 * تعمل مع كلا نوعي الأزرار: message.button.payload و interactive.button_reply.id
 * Format: CONFIRM_APPOINTMENT_123 أو CANCEL_CAMP_456
 */
async function handleButtonPayload(payload: string, userPhone: string): Promise<void> {
  const parts = payload.split("_");
  const action = parts[0];
  const type = parts[1];
  const id = parts[parts.length - 1];

  if (!action || !type || !id) {
    console.warn(`[WhatsApp Webhook] Invalid payload format: ${payload}`);
    return;
  }
  const bookingId = parseInt(id);
  if (isNaN(bookingId)) {
    console.warn(`[WhatsApp Webhook] Invalid booking ID in payload: ${payload}`);
    return;
  }

  const db = await getDb();
  if (!db) return;

  const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
  const now = new Date();

  if (type === "APPOINTMENT") {
    const updateData: { status: "confirmed" | "cancelled"; updatedAt: Date; confirmedAt?: Date; cancelledAt?: Date } = { status: newStatus as "confirmed" | "cancelled", updatedAt: now };
    if (newStatus === "confirmed") updateData.confirmedAt = now;
    else if (newStatus === "cancelled") updateData.cancelledAt = now;
    await db.update(appointments).set(updateData).where(eq(appointments.id, bookingId));
    console.log(`[WhatsApp Webhook] Appointment ${bookingId} updated to ${newStatus}`);

    // إرسال رسالة تلقائية
    const [appt] = await db.select().from(appointments).where(eq(appointments.id, bookingId)).limit(1);
    if (appt?.phone) {
      const triggerEvent = newStatus === "confirmed" ? "on_confirmed" : "on_cancelled";
      dispatchWhatsAppMessage({
        entityType: "appointment",
        triggerEvent,
        phone: appt.phone,
        recipientName: (appt as any).fullName || undefined,
        variables: {
          name: (appt as any).fullName || "العميل",
          date: (appt as any).appointmentDate
            ? new Date((appt as any).appointmentDate).toLocaleDateString("ar-YE") + " الساعة " + ((appt as any).appointmentTime || "")
            : "غير محدد",
          doctor: (appt as any).doctorName || "الطبيب",
          service: (appt as any).serviceName || "الخدمة",
        },
        entityId: bookingId,
      }).catch(err => console.error(`[WhatsApp Webhook] Failed to send ${triggerEvent} for appt ${bookingId}:`, err));
    }

  } else if (type === "OFFER") {
    const updateData: any = { status: newStatus, updatedAt: now };
    if (newStatus === "confirmed") updateData.confirmedAt = now;
    else if (newStatus === "cancelled") updateData.cancelledAt = now;
    await db.update(offerLeads).set(updateData).where(eq(offerLeads.id, bookingId));
    console.log(`[WhatsApp Webhook] Offer lead ${bookingId} updated to ${newStatus}`);

    // إرسال رسالة تلقائية
    const [lead] = await db.select().from(offerLeads).where(eq(offerLeads.id, bookingId)).limit(1);
    if (lead?.phone) {
      const [offer] = (lead as any).offerId
        ? await db.select({ title: offers.title }).from(offers).where(eq(offers.id, (lead as any).offerId)).limit(1)
        : [undefined];
      const triggerEvent = newStatus === "confirmed" ? "on_confirmed" : "on_cancelled";
      dispatchWhatsAppMessage({
        entityType: "offer_lead",
        triggerEvent,
        phone: lead.phone,
        recipientName: (lead as any).fullName || undefined,
        variables: {
          name: (lead as any).fullName || "العميل",
          service: offer?.title || "العرض",
        },
        entityId: bookingId,
      }).catch(err => console.error(`[WhatsApp Webhook] Failed to send ${triggerEvent} for offer ${bookingId}:`, err));
    }

  } else if (type === "CAMP") {
    const updateData: any = { status: newStatus, updatedAt: now };
    if (newStatus === "confirmed") updateData.confirmedAt = now;
    else if (newStatus === "cancelled") updateData.cancelledAt = now;
    await db.update(campRegistrations).set(updateData).where(eq(campRegistrations.id, bookingId));
    console.log(`[WhatsApp Webhook] Camp registration ${bookingId} updated to ${newStatus}`);

    // إرسال رسالة تلقائية
    const [reg] = await db.select().from(campRegistrations).where(eq(campRegistrations.id, bookingId)).limit(1);
    if (reg?.phone) {
      const [camp] = await db.select().from(camps).where(eq(camps.id, reg.campId)).limit(1);
      const triggerEvent = newStatus === "confirmed" ? "on_confirmed" : "on_cancelled";
      const dateStr = (reg as any).preferredDate
        ? String((reg as any).preferredDate)
        : (camp?.startDate ? new Date(camp.startDate).toLocaleDateString("ar-YE") : "غير محدد");
      const timeStr = (reg as any).preferredTimeSlot === "morning"
        ? `صباحاً ${(camp as any)?.morningTime || ""}`.trim()
        : (reg as any).preferredTimeSlot === "evening"
        ? `مساءً ${(camp as any)?.eveningTime || ""}`.trim()
        : "غير محدد";
      dispatchWhatsAppMessage({
        entityType: "camp_registration",
        triggerEvent,
        phone: reg.phone,
        recipientName: reg.fullName || undefined,
        variables: {
          name: reg.fullName || "المسجل",
          camp_name: camp?.name || "المخيم",
          date: dateStr,
          time: timeStr,
          location: "صنعاء - الستين الشمالي - قبل جولة الجمنه",
        },
        entityId: bookingId,
      }).catch(err => console.error(`[WhatsApp Webhook] Failed to send ${triggerEvent} for camp reg ${bookingId}:`, err));
    }
  }
}

/**
 * معالجة الرسائل الواردة وحفظها في قاعدة البيانات
 * وفق: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-example#messages
 */
async function handleIncomingMessage(message: any, metadata: any, contacts?: any[]) {
  try {
    const { from, id: messageId, timestamp, type, text, button, interactive, image, document, video, audio, location, identity, sticker, reaction, order, referral, contacts: messageContacts } = message;
    const phoneNumberId = metadata?.phone_number_id;
    const contactsList = contacts || metadata?.contacts || [];

    // ✅ التحقق 1: التحقق من وجود البيانات الأساسية
    if (!from || !messageId || !type) {
      console.error("[WhatsApp Webhook] ❌ Missing required message fields");
      console.error("[WhatsApp Webhook] from:", from, "messageId:", messageId, "type:", type);
      return;
    }

    console.log(`[WhatsApp Webhook] 📩 Incoming ${type} message from ${from} (msgId: ${messageId})`);
    console.log(`[WhatsApp Webhook] 📩 Full message object:`, JSON.stringify(message, null, 2));
    console.log(`[WhatsApp Webhook] 📩 Full metadata object:`, JSON.stringify(metadata, null, 2));

    // ── استخراج بيانات identity للتحقق من هوية المستخدم ─────────────────────
    let identityData = null;
    if (identity) {
      identityData = {
        acknowledged: identity.acknowledged,
        createdTimestamp: identity.created_timestamp ? new Date(identity.created_timestamp).toISOString() : undefined,
        hash: identity.hash,
      };
      console.log(`[WhatsApp Webhook] 🔐 Identity data:`, identityData);
    }

    // ✅ التحقق 2: استخراج اسم العميل من contacts بشكل آمن
    let customerName = undefined;
    if (contactsList && Array.isArray(contactsList) && contactsList.length > 0 && contactsList[0].profile?.name) {
      customerName = contactsList[0].profile.name;
      console.log(`[WhatsApp Webhook] 👤 Customer name extracted: ${customerName}`);
    } else {
      console.log(`[WhatsApp Webhook] ℹ️  No customer name in contacts`);
    }

    // ── 1. التحقق من Opt-Out (STOP / إلغاء الاشتراك) ──────────────────────────
    if (type === "text" && text?.body) {
      const msgLower = text.body.trim().toLowerCase();
      const optOutKeywords = ["stop", "إيقاف", "إلغاء", "unsubscribe", "لا أريد"];

      if (optOutKeywords.some((kw) => msgLower.includes(kw))) {
        console.log(`[WhatsApp Webhook] 🚫 Opt-Out received from ${from}`);
        await handleOptOut(from);
        return;
      }
    }

    // ── 2. معالجة الرد التلقائي ────────────────────────────────────────────────
    if (type === "text" && text?.body) {
      // Process auto-reply asynchronously to prevent blocking message saving
      processIncomingMessage({ phone: from, message: text.body }).catch(err => {
        console.error("[WhatsApp Webhook] Auto-reply processing failed:", err);
      });
    }

    // ── 2.5. تسجيل حالة الاشتراك (Opt-In) ─────────────────────────────────────
    // إذا أرسل المستخدم رسالة، فهذا يعني أنه مشترك (opted_in)
    try {
      await updateWhatsAppUserOptIn(from, {
        status: "opted_in",
        source: "webhook_message",
        updatedAt: new Date(),
      });
    } catch (error) {
      // إذا لم يكن السجل موجوداً، أنشئه
      try {
        await createWhatsAppUserOptIn({
          phoneNumber: from,
          optInType: "general",
          status: "opted_in",
          source: "webhook_message",
          details: JSON.stringify({ message: "User sent a message" }),
        });
      } catch (createError) {
        console.error("[WhatsApp Webhook] Error creating opt-in record:", createError);
      }
    }

    // ── 3. حفظ الرسالة في قاعدة البيانات ─────────────────────────────────────
    const db = await getDb();
    if (!db) {
      console.error("[WhatsApp Webhook] Database not available");
      return;
    }

    // Use the phone number exactly as received from WhatsApp (no normalization)
    const phoneNumber = from;
    if (!phoneNumber) {
      console.error("[WhatsApp Webhook] Invalid phone number");
      return;
    }

    // الحصول على أو إنشاء المحادثة
    console.log(`[WhatsApp Webhook] Debug: Looking for conversation with phone: ${phoneNumber}`);
    let conversation = await getWhatsAppConversationByPhone(phoneNumber);
    console.log(`[WhatsApp Webhook] Debug: Found conversation:`, conversation);
    if (!conversation) {
      let messagePreview = "رسالة جديدة";
      if (type === "text" && text?.body) {
        messagePreview = text.body.substring(0, 100);
      } else if (type === "image" && image?.caption) {
        messagePreview = image.caption.substring(0, 100);
      } else if (type === "document" && document?.filename) {
        messagePreview = document.filename;
      } else if (type === "video" && video?.caption) {
        messagePreview = video.caption.substring(0, 100);
      } else if (type === "audio") {
        messagePreview = "🎤 رسالة صوتية";
      } else if (type === "location") {
        messagePreview = "📍 موقع";
      }
      
      console.log(`[WhatsApp Webhook] Debug: Creating new conversation for phone: ${phoneNumber}`);
      const createResult = await createWhatsAppConversation({
        phoneNumber: phoneNumber, // Save phone number exactly as received
        customerName: customerName, // Save customer name if available
        lastMessage: messagePreview,
        lastMessageAt: new Date(),
        unreadCount: 1,
      });
      console.log(`[WhatsApp Webhook] Debug: createResult =`, createResult);
      
      // Get the insert ID from the result
      const insertId = (createResult as any)?.[0]?.insertId;
      console.log(`[WhatsApp Webhook] Debug: insertId =`, insertId);
      
      if (insertId) {
        conversation = {
          id: insertId,
          phoneNumber: phoneNumber,
          customerName: customerName || null,
          lastMessage: messagePreview,
          lastMessageAt: new Date(),
          unreadCount: 1,
          isImportant: 0,
          isArchived: 0,
          leadId: null,
          appointmentId: null,
          offerLeadId: null,
          campRegistrationId: null,
          assignedToUserId: null,
          notes: null,
          conversationIdMeta: null,
          originType: null,
          expirationTimestamp: null,
          pricingModel: null,
          billable: false,
          pricingCategory: null,
          totalCost: 0,
          messageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        console.log(`[WhatsApp Webhook] Debug: Created conversation with ID: ${insertId}`);
      } else {
        // Fallback: try to get the conversation by phone
        console.log(`[WhatsApp Webhook] Debug: No insertId, trying to fetch conversation by phone`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay to ensure DB commit
        conversation = await getWhatsAppConversationByPhone(phoneNumber);
      }
      console.log(`[WhatsApp Webhook] Debug: conversation after create =`, conversation);
      console.log(`[WhatsApp Webhook] ✅ Created new conversation for ${phoneNumber}`);
    } else {
      console.log(`[WhatsApp Webhook] Debug: Using existing conversation ID: ${conversation.id}`);
    }

    if (!conversation || !conversation.id) {
      console.error("[WhatsApp Webhook] Failed to create or retrieve conversation");
      return;
    }

    // تحديد نوع المحتوى
    let content = "";
    let messageType = "text";
    let metaPayload: any = null;

    if (type === "text" && text?.body) {
      content = text.body;
      messageType = "text";
      // إضافة identity data إلى metaPayload إذا وجد
      if (identityData) {
        metaPayload = { identity: identityData };
      }
    } else if (type === "image" && message.image) {
      content = message.image.caption || "📷 صورة";
      messageType = "image";
      metaPayload = {
        mediaId: message.image.id,
        mimeType: message.image.mime_type,
        sha256: message.image.sha256,
      };
    } else if (type === "document" && message.document) {
      content = `📄 ${message.document.filename || "ملف"}${message.document.caption ? `: ${message.document.caption}` : ""}`;
      messageType = "document";
      metaPayload = {
        mediaId: message.document.id,
        filename: message.document.filename,
        mimeType: message.document.mime_type,
        sha256: message.document.sha256,
      };
    } else if (type === "video" && message.video) {
      content = message.video.caption || "🎥 فيديو";
      messageType = "video";
      metaPayload = {
        mediaId: message.video.id,
        mimeType: message.video.mime_type,
        sha256: message.video.sha256,
      };
    } else if (type === "audio" && message.audio) {
      content = message.audio.voice ? "🎤 رسالة صوتية" : "🎵 ملف صوتي";
      messageType = "audio";
      metaPayload = {
        mediaId: message.audio.id,
        mimeType: message.audio.mime_type,
        sha256: message.audio.sha256,
        voice: message.audio.voice || false,
      };
    } else if (type === "location" && message.location) {
      const { latitude, longitude, name, address } = message.location;
      content = `📍 الموقع: ${latitude}, ${longitude}${name ? ` (${name})` : ""}${address ? ` - ${address}` : ""}`;
      messageType = "location";
      metaPayload = { latitude, longitude, name, address };
    } else if (type === "button" && button) {
      content = button.text || button.payload || "زر";
      messageType = "button_reply";
      const payload = button.payload;
      metaPayload = { payload, buttonText: button.text };

      // معالجة payload للأزرار (CONFIRM_ / CANCEL_)
      if (payload && (payload.startsWith('CONFIRM_') || payload.startsWith('CANCEL_'))) {
        await handleButtonPayload(payload, from);
      }
    } else if (type === "interactive" && interactive) {
      if (interactive.type === "button_reply" && interactive.button_reply) {
        const buttonId = interactive.button_reply.id;
        const buttonTitle = interactive.button_reply.title;
        content = buttonTitle;
        messageType = "button_reply";
        metaPayload = { buttonId, buttonTitle };

        // معالجة payload للأزرار
        if (buttonId && (buttonId.startsWith('CONFIRM_') || buttonId.startsWith('CANCEL_'))) {
          await handleButtonPayload(buttonId, from);
        }
      } else if (interactive.type === "list_reply" && interactive.list_reply) {
        content = interactive.list_reply.title;
        messageType = "list_reply";
        metaPayload = { listId: interactive.list_reply.id, listTitle: interactive.list_reply.title };
      }
    } else if (type === "contacts" && messageContacts) {
      // ── معالجة رسالة جهات اتصال ───────────────────────────────────────────
      content = "👥 جهات اتصال";
      messageType = "contacts";
      metaPayload = {
        contacts: messageContacts.map((contact: any) => ({
          addresses: contact.addresses,
          birthday: contact.birthday,
          emails: contact.emails,
          name: contact.name,
          org: contact.org,
          phones: contact.phones,
          urls: contact.urls,
        })),
      };
      console.log(`[WhatsApp Webhook] 📇 Received contacts message from ${from}`);
    } else if (type === "sticker" && sticker) {
      // ── معالجة رسالة ملصق ───────────────────────────────────────────────────
      content = "🎨 ملصق";
      messageType = "sticker";
      metaPayload = {
        mediaId: sticker.id,
        animated: sticker.animated || false,
        mimeType: sticker.mime_type,
        sha256: sticker.sha256,
      };
      console.log(`[WhatsApp Webhook] 🎨 Received sticker from ${from}`);
    } else if (type === "reaction" && reaction) {
      // ── معالجة رسالة رد فعل ─────────────────────────────────────────────────
      content = `رد فعل: ${reaction.emoji}`;
      messageType = "reaction";
      metaPayload = {
        emoji: reaction.emoji,
        messageId: reaction.messsage_id || reaction.message_id,
      };
      console.log(`[WhatsApp Webhook] 😊 Received reaction ${reaction.emoji} from ${from}`);
    } else if (type === "order" && order) {
      // ── معالجة رسالة طلب ───────────────────────────────────────────────────
      content = `🛒 طلب: ${order.text || "بدون نص"}`;
      messageType = "order";
      metaPayload = {
        catalogId: order.catalog_id,
        productItems: order.product_items,
        text: order.text,
      };
      console.log(`[WhatsApp Webhook] 🛒 Received order from ${from}`);
    } else if (referral) {
      // ── معالجة رسالة من إعلان ───────────────────────────────────────────────
      content = `📢 إحالة من إعلان: ${referral.headline || referral.body || ""}`;
      messageType = "referral";
      metaPayload = {
        sourceUrl: referral.source_url,
        sourceId: referral.source_id,
        sourceType: referral.source_type,
        headline: referral.headline,
        body: referral.body,
        mediaType: referral.media_type,
        imageUrl: referral.image_url,
        videoUrl: referral.video_url,
        thumbnailUrl: referral.thumbnail_url,
      };
      console.log(`[WhatsApp Webhook] 📢 Received referral from ${from}`);
    } else if (interactive?.referred_product) {
      // ── معالجة رسالة استفسار عن منتج ───────────────────────────────────────
      content = `🔍 استفسار عن منتج`;
      messageType = "product_enquiry";
      metaPayload = {
        catalogId: interactive.referred_product.catalog_id,
        productRetailerId: interactive.referred_product.product_retailer_id,
      };
      console.log(`[WhatsApp Webhook] 🔍 Received product enquiry from ${from}`);
    } else if (type === "unsupported") {
      // ── معالجة رسالة غير مدعومة (محذوفة) ───────────────────────────────────
      content = "🗑️ رسالة محذوفة أو غير مدعومة";
      messageType = "unsupported";
      metaPayload = {
        errors: message.errors,
      };
      console.log(`[WhatsApp Webhook] 🗑️ Received unsupported message from ${from}`);
    } else {
      content = "رسالة غير مدعومة";
      messageType = "unknown";
    }

    // حفظ الرسالة
    let mediaUrl = null;
    
    // تنزيل الوسائط من WhatsApp Media API
    if (metaPayload?.mediaId) {
      try {
        const accessToken = process.env.META_ACCESS_TOKEN;
        if (accessToken) {
          const mediaResponse = await fetch(`https://graph.facebook.com/v25.0/${metaPayload.mediaId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            mediaUrl = mediaData.url;
            console.log(`[WhatsApp Webhook] ✅ Downloaded media URL for ${type}: ${mediaUrl}`);
          }
        }
      } catch (error) {
        console.error(`[WhatsApp Webhook] Failed to download media for ${type}:`, error);
      }
    }

    console.log(`[WhatsApp Webhook] Debug: conversation.id = ${conversation.id}, type = ${typeof conversation.id}`);
    console.log(`[WhatsApp Webhook] Debug: Saving message to DB - content: ${content}, type: ${messageType}`);
    
    const newMessageResult = await createWhatsAppMessage({
      conversationId: conversation.id,
      direction: "inbound",
      content,
      messageType,
      status: "received",
      whatsappMessageId: messageId || null,
      sentAt: new Date(parseInt(timestamp) * 1000),
      metadata: metaPayload ? JSON.stringify(metaPayload) : null,
      mediaUrl: mediaUrl,
      // حفظ identity data
      identityAcknowledged: identityData?.acknowledged || false,
      identityHash: identityData?.hash || null,
    });
    const newMessageId = (newMessageResult as any)?.[0]?.insertId || null;
    console.log(`[WhatsApp Webhook] Debug: Message saved to DB with ID: ${newMessageId}`);

    // حفظ البيانات الإضافية في الجداول المخصصة
    if (type === "contacts" && messageContacts && newMessageId) {
      await handleContacts(messageContacts, conversation.id, newMessageId, phoneNumber);
      // 🔔 Publish SSE event for contacts received
      try {
        const { publish } = await import("../_core/pubsub");
        publish("global:whatsapp", "contacts_received", {
          conversationId: conversation.id,
          phoneNumber,
          contactsCount: messageContacts.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[WhatsApp Webhook] Error publishing contacts SSE:", error);
      }
    }
    if (type === "order" && order && newMessageId) {
      await handleOrders(order, conversation.id, newMessageId, phoneNumber);
      // 🔔 Publish SSE event for order received
      try {
        const { publish } = await import("../_core/pubsub");
        publish("global:whatsapp", "order_received", {
          conversationId: conversation.id,
          phoneNumber,
          orderText: order.text,
          catalogId: order.catalog_id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[WhatsApp Webhook] Error publishing order SSE:", error);
      }
    }
    if (referral && newMessageId) {
      await handleReferrals(referral, conversation.id, newMessageId, phoneNumber);
      // 🔔 Publish SSE event for referral received
      try {
        const { publish } = await import("../_core/pubsub");
        publish("global:whatsapp", "referral_received", {
          conversationId: conversation.id,
          phoneNumber,
          sourceType: referral.source_type,
          headline: referral.headline,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[WhatsApp Webhook] Error publishing referral SSE:", error);
      }
    }
    if (type === "reaction" && reaction && newMessageId) {
      await handleReactions(reaction, conversation.id, newMessageId, phoneNumber);
      // 🔔 Publish SSE event for reaction received
      try {
        const { publish } = await import("../_core/pubsub");
        publish("global:whatsapp", "reaction_received", {
          conversationId: conversation.id,
          phoneNumber,
          emoji: reaction.emoji,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[WhatsApp Webhook] Error publishing reaction SSE:", error);
      }
    }

    // تحديث المحادثة
    const updatedUnreadCount = (conversation.unreadCount || 0) + 1;
    await updateWhatsAppConversation(conversation.id, {
      lastMessage: content.substring(0, 100),
      lastMessageAt: new Date(),
      unreadCount: updatedUnreadCount,
    });

    // 🔔 Publish SSE events for real-time updates
    const { publish, channelForConversation, channelForUser } = await import("../_core/pubsub");
    console.log(`[WhatsApp Webhook] 🔔 Publishing SSE event to conversation ${conversation.id}`);
    console.log(`[WhatsApp Webhook] 🔔 newMessageId = ${newMessageId}`);
    console.log(`[WhatsApp Webhook] 🔔 Message content: ${content}`);
    publish(channelForConversation(conversation.id), 'new_message', {
      id: newMessageId,
      conversationId: conversation.id,
      direction: 'inbound',
      content,
      messageType,
      status: 'received',
      whatsappMessageId: messageId || null,
      sentAt: new Date().toISOString(),
    });
    console.log(`[WhatsApp Webhook] 🔔 SSE event published successfully`);

    const ownerId = parseInt(process.env.OWNER_ID || '1', 10);
    publish(channelForUser(ownerId), 'new_inbound_message', {
      conversationId: conversation.id,
      phoneNumber: phoneNumber,
      customerName: conversation.customerName,
      content: content.substring(0, 100),
      unreadCount: updatedUnreadCount,
      timestamp: new Date().toISOString(),
    });

    console.log(`[WhatsApp Webhook] ✅ Saved message to conversation ${conversation.id}`);

  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling incoming message:", error);
  }
}

/**
 * معالجة تحديثات حالة الرسائل (sent, delivered, read, failed)
 * وفق: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/components/statuses
 */
async function handleMessageStatus(status: any) {
  try {
    const { id: messageId, status: messageStatus, timestamp, recipient_id, errors, conversation, pricing } = status;

    console.log(`[WhatsApp Webhook] 📊 Message ${messageId} → ${messageStatus} (to: ${recipient_id})`);

    // ── استخراج بيانات conversation.pricing ───────────────────────────────
    let conversationData = null;
    if (conversation) {
      conversationData = {
        id: conversation.id,
        expirationTimestamp: conversation.expiration_timestamp ? new Date(parseInt(conversation.expiration_timestamp) * 1000).toISOString() : undefined,
        originType: conversation.origin?.type || undefined,
      };
      console.log(`[WhatsApp Webhook] 💬 Conversation data:`, conversationData);
    }

    let pricingData = null;
    if (pricing) {
      pricingData = {
        pricingModel: pricing.pricing_model,
        billable: pricing.billable,
        category: pricing.category,
      };
      console.log(`[WhatsApp Webhook] 💰 Pricing data:`, pricingData);
    }

    // معالجة حالة الفشل
    let errorCode = null;
    let errorTitle = null;
    if (messageStatus === "failed" && errors?.length > 0) {
      errorCode = errors[0]?.code;
      errorTitle = errors[0]?.title;
      const errorMessage = errors[0]?.message;
      console.error(`[WhatsApp Webhook] ❌ Message failed: ${errorTitle} (code: ${errorCode}) - ${errorMessage}`);

      // كود 131047: انتهت نافذة 24 ساعة — يجب إرسال قالب
      if (errorCode === 131047) {
        console.warn(`[WhatsApp Webhook] ⚠️  24-hour window expired for ${recipient_id} — template required`);
      }
    }

    // تحديث حالة الرسالة في قاعدة البيانات
    const db = await getDb();
    if (!db) {
      console.error("[WhatsApp Webhook] Database not available for status update");
      return;
    }

    // تحديث حالة الرسالة في جدول whatsappMessages
    const messageUpdate = await db
      .update(whatsappMessages)
      .set({
        status: messageStatus,
        deliveredAt: messageStatus === "delivered" ? new Date(parseInt(timestamp) * 1000) : undefined,
        readAt: messageStatus === "read" ? new Date(parseInt(timestamp) * 1000) : undefined,
        // TODO: Add failedAt timestamp when the whatsappMessages schema includes a failedAt column
        // failedAt: messageStatus === "failed" ? new Date(parseInt(timestamp) * 1000) : undefined,
      })
      .where(eq(whatsappMessages.whatsappMessageId, messageId));

    console.log(`[WhatsApp Webhook] ✅ Updated message status: ${messageId} → ${messageStatus}`);

    // تحديث حالة الإشعار في جدول whatsappNotifications
    const notificationUpdate = await db
      .update(whatsappNotifications)
      .set({
        status: messageStatus,
        errorMessage: messageStatus === "failed" && errors?.length > 0 
          ? `${errors[0]?.title}: ${errors[0]?.message}` 
          : null,
        deliveredAt: messageStatus === "delivered" ? new Date(parseInt(timestamp) * 1000) : undefined,
        readAt: messageStatus === "read" ? new Date(parseInt(timestamp) * 1000) : undefined,
      })
      .where(eq(whatsappNotifications.metaMessageId, messageId));

    console.log(`[WhatsApp Webhook] ✅ Updated notification status: ${messageId} → ${messageStatus}`);

    // حفظ conversation.pricing في جدول whatsappConversations
    if (conversationData) {
      try {
        await db
          .update(whatsappConversations)
          .set({
            conversationIdMeta: conversationData.id,
            originType: conversationData.originType,
            expirationTimestamp: conversationData.expirationTimestamp ? new Date(conversationData.expirationTimestamp) : undefined,
            pricingModel: pricingData?.pricingModel,
            billable: pricingData?.billable,
            pricingCategory: pricingData?.category,
          })
          .where(eq(whatsappConversations.phoneNumber, recipient_id));
        console.log(`[WhatsApp Webhook] ✅ Updated conversation pricing for ${recipient_id}`);
        // 🔔 Publish SSE event for conversation cost update
        try {
          const { publish } = await import("../_core/pubsub");
          publish("global:whatsapp", "conversation_cost_update", {
            phoneNumber: recipient_id,
            conversationId: conversationData.id,
            pricingModel: pricingData?.pricingModel,
            billable: pricingData?.billable,
            pricingCategory: pricingData?.category,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("[WhatsApp Webhook] Error publishing conversation cost SSE:", error);
        }
      } catch (error) {
        console.error("[WhatsApp Webhook] Error updating conversation pricing:", error);
      }
    }

    // 🔔 Publish SSE event to global channel for message status updates
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "message_status_update", {
        messageId,
        whatsappMessageId: messageId,
        status: messageStatus,
        deliveredAt: messageStatus === "delivered" ? new Date(parseInt(timestamp) * 1000).toISOString() : undefined,
        readAt: messageStatus === "read" ? new Date(parseInt(timestamp) * 1000).toISOString() : undefined,
        errorCode,
        errorTitle,
        conversation: conversationData,
        pricing: pricingData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing message status SSE:", error);
    }

  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling message status:", error);
  }
}

/**
 * معالجة تحديثات حالة القوالب تلقائياً
 * وفق: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/components/template-status-updates
 *
 * الأحداث: APPROVED, REJECTED, DISABLED, PENDING_DELETION, FLAGGED, PAUSED, REINSTATED
 */
async function handleTemplateStatusUpdate(update: any) {
  try {
    const { message_template_id, message_template_name, event, reason } = update;

    console.log(`[WhatsApp Webhook] 📋 Template "${message_template_name}" → ${event}${reason ? ` (${reason})` : ""}`);

    const db = await getDb();
    if (!db) return;

    // تحديث حالة القالب في قاعدة البيانات
    const statusMap: Record<string, string> = {
      APPROVED: "APPROVED",
      REJECTED: "REJECTED",
      DISABLED: "DISABLED",
      PAUSED: "PAUSED",
      REINSTATED: "APPROVED",
      FLAGGED: "FLAGGED",
      PENDING_DELETION: "PENDING_DELETION",
    };

    const newStatus = statusMap[event] || event;

    await db
      .update(whatsappTemplates)
      .set({
        metaStatus: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(whatsappTemplates.metaTemplateId, String(message_template_id)));

    // 🔔 Publish SSE event to global channel
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "template_status_update", {
        templateId: String(message_template_id),
        templateName: message_template_name,
        status: newStatus,
        reason,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing template status SSE:", error);
    }

    // إذا تم رفض القالب أو تعطيله، سجّل السبب
    if (event === "REJECTED" || event === "DISABLED") {
      console.error(`[WhatsApp Webhook] ⛔ Template "${message_template_name}" ${event}: ${reason || "No reason provided"}`);
    }

    if (event === "APPROVED") {
      console.log(`[WhatsApp Webhook] ✅ Template "${message_template_name}" APPROVED — ready to use`);
    }

  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling template status update:", error);
  }
}

/**
 * معالجة Opt-Out تلقائياً
 * وفق سياسة Meta: يجب احترام طلبات إلغاء الاشتراك فوراً
 */
async function handleOptOut(phone: string) {
  try {
    // إرسال رسالة تأكيد إلغاء الاشتراك
    await sendWhatsAppTextMessage(
      phone,
      "تم إلغاء اشتراكك في رسائل المستشفى السعودي الألماني. لن تتلقى رسائل ترويجية بعد الآن.\n\nللاشتراك مجدداً، أرسل كلمة: مرحبا"
    );

    // تحديث حالة الاشتراك في قاعدة البيانات
    try {
      await updateWhatsAppUserOptIn(phone, {
        status: "opted_out",
        source: "webhook_opt_out",
        updatedAt: new Date(),
      });
      console.log(`[WhatsApp Webhook] ✅ Opt-out confirmed for ${phone}`);
    } catch (error) {
      console.error("[WhatsApp Webhook] Error updating opt-out status:", error);
      // إذا لم يكن السجل موجوداً، أنشئه
      try {
        await createWhatsAppUserOptIn({
          phoneNumber: phone,
          optInType: "general",
          status: "opted_out",
          source: "webhook_opt_out",
          details: JSON.stringify({ message: "User sent STOP" }),
        });
      } catch (createError) {
        console.error("[WhatsApp Webhook] Error creating opt-out record:", createError);
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling opt-out:", error);
  }
}

/**
 * معالجة تنبيهات الحساب (account_alerts)
 * وفق: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/components/account-alerts
 */
async function handleAccountAlert(alert: any) {
  const { type: alertType, details } = alert;
  console.warn(`[WhatsApp Webhook] ⚠️  Account Alert: ${alertType}`, details);

  // حفظ التنبيه في قاعدة البيانات
  try {
    await createWhatsAppAccountAlert({
      alertType,
      details: JSON.stringify(details),
      severity: alertType === "ACCOUNT_BANNED" ? "critical" : alertType === "PHONE_NUMBER_QUALITY_UPDATED" ? "medium" : "low",
      resolved: false,
    });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error saving account alert:", error);
  }

  // 🔔 Publish SSE event to global channel
  try {
    const { publish } = await import("../_core/pubsub");
    publish("global:whatsapp", "account_alert", {
      alertType,
      severity: alertType === "ACCOUNT_BANNED" ? "critical" : alertType === "PHONE_NUMBER_QUALITY_UPDATED" ? "medium" : "low",
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error publishing account alert SSE:", error);
  }

  // تنبيهات مهمة تستدعي تدخلاً فورياً
  if (alertType === "ACCOUNT_BANNED") {
    console.error("[WhatsApp Webhook] 🚨 CRITICAL: WhatsApp Business Account BANNED!");
  } else if (alertType === "PHONE_NUMBER_QUALITY_UPDATED") {
    console.warn("[WhatsApp Webhook] 📉 Phone number quality score updated:", details);
  }
}

// ─── Helper Functions for Saving Data ─────────────────────────────────────────────

/**
 * حفظ جهات الاتصال المرسلة من المستخدمين
 */
async function handleContacts(contacts: any[], conversationId: number, messageId: number, phoneNumber: string) {
  try {
    const db = await getDb();
    if (!db) return;

    for (const contact of contacts) {
      await db.insert(whatsappContacts).values({
        messageId,
        conversationId,
        phoneNumber,
        addresses: contact.addresses ? JSON.stringify(contact.addresses) : null,
        birthday: contact.birthday || null,
        emails: contact.emails ? JSON.stringify(contact.emails) : null,
        name: contact.name ? JSON.stringify(contact.name) : null,
        org: contact.org ? JSON.stringify(contact.org) : null,
        phones: contact.phones ? JSON.stringify(contact.phones) : null,
        urls: contact.urls ? JSON.stringify(contact.urls) : null,
      });
    }
    console.log(`[WhatsApp Webhook] ✅ Saved ${contacts.length} contacts for ${phoneNumber}`);
  } catch (error) {
    console.error("[WhatsApp Webhook] Error saving contacts:", error);
  }
}

/**
 * حفظ الطلبات الواردة من واتساب
 */
async function handleOrders(order: any, conversationId: number, messageId: number, phoneNumber: string) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(whatsappOrders).values({
      messageId,
      conversationId,
      phoneNumber,
      catalogId: order.catalog_id || null,
      productItems: order.product_items ? JSON.stringify(order.product_items) : null,
      orderText: order.text || null,
    });
    console.log(`[WhatsApp Webhook] ✅ Saved order for ${phoneNumber}`);
  } catch (error) {
    console.error("[WhatsApp Webhook] Error saving order:", error);
  }
}

/**
 * حفظ الإحالات من الإعلانات
 */
async function handleReferrals(referral: any, conversationId: number, messageId: number, phoneNumber: string) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(whatsappReferrals).values({
      messageId,
      conversationId,
      phoneNumber,
      sourceUrl: referral.source_url || null,
      sourceId: referral.source_id || null,
      sourceType: referral.source_type || null,
      headline: referral.headline || null,
      body: referral.body || null,
      mediaType: referral.media_type || null,
      imageUrl: referral.image_url || null,
      videoUrl: referral.video_url || null,
      thumbnailUrl: referral.thumbnail_url || null,
    });
    console.log(`[WhatsApp Webhook] ✅ Saved referral for ${phoneNumber}`);
  } catch (error) {
    console.error("[WhatsApp Webhook] Error saving referral:", error);
  }
}

/**
 * حفظ الردود العاطفية على الرسائل
 */
async function handleReactions(reaction: any, conversationId: number, messageId: number, phoneNumber: string) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(whatsappReactions).values({
      messageId,
      conversationId,
      phoneNumber,
      emoji: reaction.emoji || null,
      reactedToMessageId: reaction.message_id || null,
    });
    console.log(`[WhatsApp Webhook] ✅ Saved reaction for ${phoneNumber}`);
  } catch (error) {
    console.error("[WhatsApp Webhook] Error saving reaction:", error);
  }
}

/**
 * معالجة تعطيل القوالب
 */
async function handleTemplateDisable(templateEvent: any) {
  try {
    const metaTemplateId = templateEvent.id || null;
    if (!metaTemplateId) {
      console.warn("[WhatsApp Webhook] No template ID in disable event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // تحديث حالة القالب إلى disabled باستخدام metaTemplateId
    await db
      .update(whatsappTemplates)
      .set({
        metaStatus: 'DISABLED',
        isActive: 0,
      })
      .where(eq(whatsappTemplates.metaTemplateId, metaTemplateId));

    console.log(`[WhatsApp Webhook] ✅ Disabled template ${metaTemplateId}`);

    // 🔔 Publish SSE event for template disable
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "template_disabled", {
        templateId: metaTemplateId,
        reason: templateEvent.reason || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing template disable SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling template disable:", error);
  }
}

/**
 * معالجة تفعيل القوالب
 */
async function handleTemplateEnable(templateEvent: any) {
  try {
    const metaTemplateId = templateEvent.id || null;
    if (!metaTemplateId) {
      console.warn("[WhatsApp Webhook] No template ID in enable event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // تحديث حالة القالب إلى enabled باستخدام metaTemplateId
    await db
      .update(whatsappTemplates)
      .set({
        metaStatus: 'APPROVED',
        isActive: 1,
      })
      .where(eq(whatsappTemplates.metaTemplateId, metaTemplateId));

    console.log(`[WhatsApp Webhook] ✅ Enabled template ${metaTemplateId}`);

    // 🔔 Publish SSE event for template enable
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "template_enabled", {
        templateId: metaTemplateId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing template enable SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling template enable:", error);
  }
}

/**
 * معالجة تحديثات اسم القالب
 */
async function handleTemplateNameUpdate(templateEvent: any) {
  try {
    const metaTemplateId = templateEvent.id || null;
    if (!metaTemplateId) {
      console.warn("[WhatsApp Webhook] No template ID in name update event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // تحديث اسم القالب
    await db
      .update(whatsappTemplates)
      .set({
        metaName: templateEvent.name || null,
      })
      .where(eq(whatsappTemplates.metaTemplateId, metaTemplateId));

    console.log(`[WhatsApp Webhook] ✅ Updated template name for ${metaTemplateId}`);

    // 🔔 Publish SSE event for template name update
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "template_name_update", {
        templateId: metaTemplateId,
        name: templateEvent.name || null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing template name update SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling template name update:", error);
  }
}

/**
 * معالجة تحديثات فئة القالب
 */
async function handleTemplateCategoryUpdate(templateEvent: any) {
  try {
    const metaTemplateId = templateEvent.id || null;
    if (!metaTemplateId) {
      console.warn("[WhatsApp Webhook] No template ID in category update event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // تحديث فئة القالب
    await db
      .update(whatsappTemplates)
      .set({
        metaCategory: templateEvent.category || null,
      })
      .where(eq(whatsappTemplates.metaTemplateId, metaTemplateId));

    console.log(`[WhatsApp Webhook] ✅ Updated template category for ${metaTemplateId}`);

    // 🔔 Publish SSE event for template category update
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "template_category_update", {
        templateId: metaTemplateId,
        category: templateEvent.category || null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing template category update SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling template category update:", error);
  }
}

/**
 * معالجة تحديثات لغة القالب
 */
async function handleTemplateLanguageUpdate(templateEvent: any) {
  try {
    const metaTemplateId = templateEvent.id || null;
    if (!metaTemplateId) {
      console.warn("[WhatsApp Webhook] No template ID in language update event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // تحديث لغة القالب
    await db
      .update(whatsappTemplates)
      .set({
        languageCode: templateEvent.language || null,
      })
      .where(eq(whatsappTemplates.metaTemplateId, metaTemplateId));

    console.log(`[WhatsApp Webhook] ✅ Updated template language for ${metaTemplateId}`);

    // 🔔 Publish SSE event for template language update
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "template_language_update", {
        templateId: metaTemplateId,
        languageCode: templateEvent.language || null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing template language update SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling template language update:", error);
  }
}

/**
 * معالجة أحداث القوالب العامة
 */
async function handleTemplateEvent(templateEvent: any) {
  try {
    const metaTemplateId = templateEvent.id || null;
    if (!metaTemplateId) {
      console.warn("[WhatsApp Webhook] No template ID in template event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // تحديث حالة القالب بناءً على نوع الحدث
    const eventType = templateEvent.event || 'unknown';
    const updateData: any = {};

    if (eventType === 'template_deleted') {
      updateData.metaStatus = 'DELETED';
      updateData.isActive = 0;
    } else if (eventType === 'template_approved') {
      updateData.metaStatus = 'APPROVED';
      updateData.isActive = 1;
    } else if (eventType === 'template_rejected') {
      updateData.metaStatus = 'REJECTED';
      updateData.isActive = 0;
    } else if (eventType === 'template_pending') {
      updateData.metaStatus = 'PENDING';
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(whatsappTemplates)
        .set(updateData)
        .where(eq(whatsappTemplates.metaTemplateId, metaTemplateId));

      console.log(`[WhatsApp Webhook] ✅ Updated template status for ${metaTemplateId} (${eventType})`);
    }

    // 🔔 Publish SSE event for template event
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "template_event", {
        templateId: metaTemplateId,
        eventType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing template event SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling template event:", error);
  }
}

/**
 * معالجة تحديثات الملف التجاري
 */
async function handleBusinessProfileUpdate(profileEvent: any) {
  try {
    const phoneNumber = profileEvent.phone_number || null;
    if (!phoneNumber) {
      console.warn("[WhatsApp Webhook] No phone number in business profile update event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // تحديث بيانات المحادثة إذا لزم الأمر
    const eventType = profileEvent.event || 'unknown';

    // 🔔 Publish SSE event for business profile update
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "business_profile_update", {
        phoneNumber,
        eventType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing business profile update SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling business profile update:", error);
  }
}

/**
 * معالجة تحديثات منتج المراسلة
 */
async function handleMessagingProductUpdate(productEvent: any) {
  try {
    const phoneNumber = productEvent.phone_number || null;
    
    const db = await getDb();
    if (!db) return;

    // تسجيل الحدث للمراجعة المستقبلية
    const eventType = productEvent.event || 'unknown';
    console.log(`[WhatsApp Webhook] 📨 Messaging product update: ${eventType} for ${phoneNumber || 'unknown'}`);

    // 🔔 Publish SSE event for messaging product update
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "messaging_product_update", {
        phoneNumber,
        eventType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing messaging product update SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling messaging product update:", error);
  }
}

/**
 * معالجة تحديثات حساب الأعمال
 */
async function handleBusinessAccountUpdate(accountEvent: any) {
  try {
    const phoneNumber = accountEvent.phone_number || null;
    if (!phoneNumber) {
      console.warn("[WhatsApp Webhook] No phone number in business account update event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // تحديث بيانات المحادثة إذا لزم الأمر
    const eventType = accountEvent.event || 'unknown';

    // 🔔 Publish SSE event for business account update
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "business_account_update", {
        phoneNumber,
        eventType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing business account update SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling business account update:", error);
  }
}

/**
 * معالجة تحديثات الحساب
 */
async function handleAccountUpdate(accountEvent: any) {
  try {
    const phoneNumber = accountEvent.phone_number || null;
    if (!phoneNumber) {
      console.warn("[WhatsApp Webhook] No phone number in account update event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // تحديث بيانات المحادثة إذا لزم الأمر
    const eventType = accountEvent.event || 'unknown';
    
    if (eventType === 'account_banned') {
      // إيقاف المحادثة إذا تم حظر الحساب
      await db
        .update(whatsappConversations)
        .set({
          isArchived: 1,
        })
        .where(eq(whatsappConversations.phoneNumber, phoneNumber));
      
      console.log(`[WhatsApp Webhook] ⚠️ Account banned for ${phoneNumber}`);
    }

    // 🔔 Publish SSE event for account update
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "account_update", {
        phoneNumber,
        eventType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing account update SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling account update:", error);
  }
}

/**
 * معالجة تحديثات مراجعة الحساب
 */
async function handleAccountReviewUpdate(reviewEvent: any) {
  try {
    const db = await getDb();
    if (!db) return;

    // 🔔 Publish SSE event for account review update
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "account_review_update", {
        phoneNumber: reviewEvent.phone_number,
        status: reviewEvent.status || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing account review SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling account review update:", error);
  }
}

/**
 * معالجة تحديثات المحادثات (بيانات التسعير)
 */
async function handleConversationUpdate(conversationEvent: any) {
  try {
    const phoneNumber = conversationEvent.phone_number || null;
    if (!phoneNumber) {
      console.warn("[WhatsApp Webhook] No phone number in conversation event");
      return;
    }

    const db = await getDb();
    if (!db) return;

    // استخراج بيانات التسعير من الحدث
    const pricingData = conversationEvent.pricing;
    const conversationData = conversationEvent.conversation;

    if (!pricingData && !conversationData) {
      console.warn("[WhatsApp Webhook] No pricing or conversation data in event");
      return;
    }

    // تحديث بيانات المحادثة
    const updateData: any = {};
    
    if (conversationData) {
      updateData.conversationIdMeta = conversationData.id;
      updateData.originType = conversationData.origin?.type;
      updateData.expirationTimestamp = conversationData.expiration_timestamp 
        ? new Date(parseInt(conversationData.expiration_timestamp) * 1000) 
        : undefined;
    }

    if (pricingData) {
      updateData.pricingModel = pricingData.pricing_model;
      updateData.billable = pricingData.billable;
      updateData.pricingCategory = pricingData.category;
    }

    await db
      .update(whatsappConversations)
      .set(updateData)
      .where(eq(whatsappConversations.phoneNumber, phoneNumber));

    console.log(`[WhatsApp Webhook] ✅ Updated conversation pricing for ${phoneNumber}`);

    // 🔔 Publish SSE event for conversation cost update
    try {
      const { publish } = await import("../_core/pubsub");
      publish("global:whatsapp", "conversation_cost_update", {
        phoneNumber,
        pricingData: pricingData || {},
        conversationData: conversationData || {},
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WhatsApp Webhook] Error publishing conversation SSE:", error);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling conversation update:", error);
  }
}

/**
 * حفظ المعاملات المالية
 */
async function handleTransactionStatus(transaction: any, conversationId: number, phoneNumber: string) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(whatsappTransactions).values({
      conversationId,
      phoneNumber,
      transactionId: transaction.transaction_id || null,
      status: transaction.status || null,
      amount: transaction.amount || null,
      currency: transaction.currency || null,
      paymentMethod: transaction.payment_method || null,
    });
    console.log(`[WhatsApp Webhook] ✅ Saved transaction for ${phoneNumber}`);
  } catch (error) {
    console.error("[WhatsApp Webhook] Error saving transaction:", error);
  }
}

// ─── Main Event Processor ──────────────────────────────────────────────────────

/**
 * معالجة أحداث Webhook الواردة من Meta
 * وفق: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview/
 * 
 * بنية Webhook الصحيحة:
 * {
 *   "object": "whatsapp_business_account",
 *   "entry": [{
 *     "changes": [{
 *       "field": "messages",
 *       "value": {
 *         "messaging_product": "whatsapp",
 *         "metadata": { "phone_number_id": "...", "display_phone_number": "..." },
 *         "contacts": [{ "profile": { "name": "..." }, "wa_id": "..." }],
 *         "messages": [{ "from": "...", "id": "...", "timestamp": "...", "type": "..." }]
 *       }
 *     }]
 *   }]
 * }
 */
export async function processWebhookEvent(body: any) {
  try {
    // ✅ التحقق 1: أن الحدث من WhatsApp Business
    if (body.object !== "whatsapp_business_account") {
      console.warn("[WhatsApp Webhook] ❌ Unexpected object type:", body.object);
      console.warn("[WhatsApp Webhook] Expected: 'whatsapp_business_account'");
      return;
    }

    const { entry } = body;
    
    // ✅ التحقق 2: وجود entry كمصفوفة
    if (!entry || !Array.isArray(entry)) {
      console.warn("[WhatsApp Webhook] ❌ Invalid webhook body — missing entry array");
      console.warn("[WhatsApp Webhook] Received body:", JSON.stringify(body, null, 2));
      return;
    }

    console.log(`[WhatsApp Webhook] 📨 Processing webhook with ${entry.length} entries`);

    for (const item of entry) {
      const { changes } = item;
      
      // ✅ التحقق 3: وجود changes كمصفوفة
      if (!changes || !Array.isArray(changes)) {
        console.warn(`[WhatsApp Webhook] ⚠️  Entry has no changes array:`, item);
        continue;
      }

      console.log(`[WhatsApp Webhook] 📨 Processing ${changes.length} changes`);

      for (const change of changes) {
        const { field, value } = change;

        if (!value) continue;

        // ✅ التحقق 4: معالجة الأخطاء على مستوى Value
        if (value.errors && Array.isArray(value.errors)) {
          console.error("[WhatsApp Webhook] ❌ System/App/Account Errors detected:");
          for (const error of value.errors) {
            console.error(`  - Code: ${error.code}, Title: ${error.title}, Message: ${error.message}`);
            // حفظ الخطأ في قاعدة البيانات
            try {
              await createWhatsAppAccountAlert({
                alertType: "WEBHOOK_ERROR",
                details: JSON.stringify({
                  errorCode: error.code,
                  errorTitle: error.title,
                  errorMessage: error.message,
                  field: field,
                  timestamp: new Date().toISOString(),
                }),
                severity: "high",
                resolved: false,
              });
            } catch (alertError) {
              console.error("[WhatsApp Webhook] Failed to save error alert:", alertError);
            }
          }
        }

        switch (field) {
          case "messages": {
            // وفقاً لتعليمات Meta: metadata يجب أن يتضمن phone_number_id و contacts
            const metadata = {
              phone_number_id: value.metadata?.phone_number_id,
              display_phone_number: value.metadata?.display_phone_number,
            };
            const contacts = value.contacts || [];

            // ── الرسائل الواردة ──────────────────────────────────────────────
            if (value.messages && Array.isArray(value.messages)) {
              for (const message of value.messages) {
                // ✅ التحقق 5: التحقق من أخطاء الرسائل الواردة
                if (message.errors && Array.isArray(message.errors)) {
                  console.error(`[WhatsApp Webhook] ❌ Incoming message errors for ${message.from}:`);
                  for (const error of message.errors) {
                    console.error(`  - Code: ${error.code}, Title: ${error.title}, Message: ${error.message}`);
                  }
                  // إذا كانت نوع الرسالة "unsupported" فلا تحاول معالجتها
                  if (message.type === "unsupported") {
                    console.warn(`[WhatsApp Webhook] ⚠️  Unsupported message type from ${message.from}`);
                    continue;
                  }
                }
                
                await handleIncomingMessage(message, metadata, contacts);
                console.log(`[WhatsApp Webhook] ✅ Message processed from ${message.from}`);
              }
            }

            // ── تحديثات حالة الرسائل ─────────────────────────────────────────
            if (value.statuses && Array.isArray(value.statuses)) {
              for (const status of value.statuses) {
                // ✅ التحقق 6: التحقق من أخطاء حالة الرسائل الصادرة
                if (status.errors && Array.isArray(status.errors)) {
                  console.error(`[WhatsApp Webhook] ❌ Outbound message status errors for ${status.id}:`);
                  for (const error of status.errors) {
                    console.error(`  - Code: ${error.code}, Title: ${error.title}, Message: ${error.message}`);
                  }
                }
                
                await handleMessageStatus(status);
              }
            }
            break;
          }

          case "message_template_status_update": {
            // ── تحديثات حالة القوالب (APPROVED, REJECTED, DISABLED...) ────────
            await handleTemplateStatusUpdate(value);
            break;
          }

          case "account_alerts": {
            // ── تنبيهات الحساب ────────────────────────────────────────────────
            if (value.account_alerts) {
              for (const alert of value.account_alerts) {
                await handleAccountAlert(alert);
              }
            }
            break;
          }

          case "phone_number_quality_update": {
            // ── تحديثات جودة رقم الهاتف ──────────────────────────────────────
            console.log("[WhatsApp Webhook] 📊 Phone number quality update:", value);
            try {
              const previousRating = value.previous_rating || null;
              await createWhatsAppPhoneQuality({
                phoneNumber: value.phone_number_id || "unknown",
                qualityScore: value.quality_score || null,
                qualityRating: value.quality_rating || "unknown",
                details: JSON.stringify(value),
              });

              // 🔔 Publish SSE event to global channel
              const { publish } = await import("../_core/pubsub");
              publish("global:whatsapp", "phone_quality_update", {
                phoneNumber: value.phone_number_id || "unknown",
                displayPhoneNumber: value.display_phone_number || null,
                currentRating: value.quality_rating || "gray",
                previousRating,
                timestamp: new Date().toISOString(),
              });
            } catch (error) {
              console.error("[WhatsApp Webhook] Error saving phone quality:", error);
            }
            break;
          }

          case "security": {
            // ── أحداث الأمان ───────────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🔒 Security event:", value);
            try {
              await createWhatsAppSecurityEvent({
                eventType: value.event_type || "security_event",
                phoneNumber: value.phone_number || null,
                details: JSON.stringify(value),
                severity: "high",
              });
            } catch (error) {
              console.error("[WhatsApp Webhook] Error saving security event:", error);
            }
            break;
          }

          case "business_profile_update": {
            // ── تحديثات الملف التجاري ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🏢 Business profile update:", value);
            await logWebhookEvent({
              eventType: "business_profile_update",
              subType: value.event || "unknown",
              phoneNumber: value.phone_number || null,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تحديث الملف التجاري
            await handleBusinessProfileUpdate(value);
            break;
          }

          case "messaging_product": {
            // ── تحديثات منتج المراسلة ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📨 Messaging product update:", value);
            await logWebhookEvent({
              eventType: "messaging_product",
              subType: value.event || "unknown",
              phoneNumber: value.phone_number || null,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تحديث منتج المراسلة
            await handleMessagingProductUpdate(value);
            break;
          }

          case "conversation": {
            // ── تحديثات المحادثات ─────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 💬 Conversation update:", value);
            await logWebhookEvent({
              eventType: "conversation",
              subType: value.event || "unknown",
              phoneNumber: value.phone_number || null,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة بيانات التسعير
            await handleConversationUpdate(value);
            break;
          }

          case "transaction_status": {
            // ── حالة معاملة طلب ───────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 💳 Transaction status update:", value);
            await logWebhookEvent({
              eventType: "transaction_status",
              subType: value.status || "unknown",
              phoneNumber: value.phone_number || null,
              rawPayload: JSON.stringify(value),
            });
            // حفظ المعاملة في جدول whatsappTransactions
            try {
              const phoneNumber = value.phone_number || null;
              if (phoneNumber) {
                const conversation = await getWhatsAppConversationByPhone(phoneNumber);
                if (conversation) {
                  await handleTransactionStatus(value, conversation.id, phoneNumber);
                  // 🔔 Publish SSE event for transaction status update
                  try {
                    const { publish } = await import("../_core/pubsub");
                    publish("global:whatsapp", "transaction_status_update", {
                      conversationId: conversation.id,
                      phoneNumber,
                      status: value.status,
                      transactionId: value.transaction_id,
                      timestamp: new Date().toISOString(),
                    });
                  } catch (error) {
                    console.error("[WhatsApp Webhook] Error publishing transaction SSE:", error);
                  }
                }
              }
            } catch (error) {
              console.error("[WhatsApp Webhook] Error saving transaction:", error);
            }
            break;
          }

          case "conversation_quality_update": {
            // ── تحديثات جودة المحادثات ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] � Conversation quality update:", value);
            try {
              await createWhatsAppConversationQuality({
                phoneNumber: value.phone_number || "unknown",
                qualityScore: value.quality_score || null,
                details: JSON.stringify(value),
              });
            } catch (error) {
              console.error("[WhatsApp Webhook] Error saving conversation quality:", error);
            }
            break;
          }

          case "opt_in_updates": {
            // ── تحديثات الاشتراك ───────────────────────────────────────────────
            console.log("[WhatsApp Webhook] ✅ Opt-in updates:", value);
            try {
              const normalizedPhone = normalizePhoneNumber(value.phone_number);
              if (value.status === "opted_in") {
                await createWhatsAppUserOptIn({
                  phoneNumber: normalizedPhone,
                  optInType: "general",
                  status: "opted_in",
                  source: value.source || "webhook",
                  details: JSON.stringify(value),
                });
              } else {
                await updateWhatsAppUserOptIn(normalizedPhone, {
                  status: "opted_out",
                  details: JSON.stringify(value),
                });
              }
            } catch (error) {
              console.error("[WhatsApp Webhook] Error saving opt-in update:", error);
            }
            break;
          }

          case "opt_out_updates": {
            // ── تحديثات إلغاء الاشتراك ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] ❌ Opt-out updates:", value);
            try {
              const normalizedPhone = normalizePhoneNumber(value.phone_number);
              await updateWhatsAppUserOptIn(normalizedPhone, {
                status: "opted_out",
                details: JSON.stringify(value),
              });
            } catch (error) {
              console.error("[WhatsApp Webhook] Error saving opt-out update:", error);
            }
            break;
          }

          case "marketing_opt_in_updates": {
            // ── تحديثات الاشتراك التسويقي ─────────────────────────────────────
            console.log("[WhatsApp Webhook] 📢 Marketing opt-in updates:", value);
            try {
              const normalizedPhone = normalizePhoneNumber(value.phone_number);
              if (value.status === "opted_in") {
                await createWhatsAppUserOptIn({
                  phoneNumber: normalizedPhone,
                  optInType: "marketing",
                  status: "opted_in",
                  source: value.source || "webhook",
                  details: JSON.stringify(value),
                });
              } else {
                await updateWhatsAppUserOptIn(normalizedPhone, {
                  optInType: "marketing",
                  status: "opted_out",
                  details: JSON.stringify(value),
                });
              }
            } catch (error) {
              console.error("[WhatsApp Webhook] Error saving marketing opt-in update:", error);
            }
            break;
          }

          case "marketing_opt_out_updates": {
            // ── تحديثات إلغاء الاشتراك التسويقي ───────────────────────────────
            console.log("[WhatsApp Webhook] � Marketing opt-out updates:", value);
            try {
              const normalizedPhone = normalizePhoneNumber(value.phone_number);
              await updateWhatsAppUserOptIn(normalizedPhone, {
                optInType: "marketing",
                status: "opted_out",
                details: JSON.stringify(value),
              });
            } catch (error) {
              console.error("[WhatsApp Webhook] Error saving marketing opt-out update:", error);
            }
            break;
          }

          case "message_template_quality_update": {
            // ── تحديثات جودة القوالب ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] � Message template quality update:", value);
            try {
              await createWhatsAppTemplateQuality({
                templateId: value.message_template_id || "unknown",
                qualityScore: value.quality_score || null,
                details: JSON.stringify(value),
              });
            } catch (error) {
              console.error("[WhatsApp Webhook] Error saving template quality:", error);
            }
            break;
          }

          case "message_template_event": {
            // ── أحداث القوالب (message_template_event) ────────────────────────
            console.log("[WhatsApp Webhook] 📄 Message template event:", value);
            await logWebhookEvent({
              eventType: "message_template_event",
              subType: value.event || "unknown",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة حدث القالب
            await handleTemplateEvent(value);
            break;
          }

          case "message_template_disable": {
            // ── تعطيل القوالب ─────────────────────────────────────────────────
            console.warn("[WhatsApp Webhook] ⚠️ Message template disabled:", value);
            await logWebhookEvent({
              eventType: "message_template_disable",
              subType: value.reason || "unknown",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تعطيل القالب
            await handleTemplateDisable(value);
            break;
          }

          case "message_template_enable": {
            // ── تفعيل القوالب ──────────────────────────────────────────────────
            console.log("[WhatsApp Webhook] ✅ Message template enabled:", value);
            await logWebhookEvent({
              eventType: "message_template_enable",
              subType: "enabled",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تفعيل القالب
            await handleTemplateEnable(value);
            break;
          }

          case "account_review_update": {
            // ── تحديثات مراجعة الحساب ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🔍 Account review update:", value);
            await logWebhookEvent({
              eventType: "account_review_update",
              subType: value.status || "unknown",
              phoneNumber: value.phone_number || null,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تحديث مراجعة الحساب
            await handleAccountReviewUpdate(value);
            break;
          }

          case "account_update": {
            // ── تحديثات الحساب ────────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 👤 Account update:", value);
            await logWebhookEvent({
              eventType: "account_update",
              subType: value.event || "unknown",
              phoneNumber: value.phone_number || null,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تحديث الحساب
            await handleAccountUpdate(value);
            break;
          }

          case "business_account_update": {
            // ── تحديثات حساب الأعمال ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🏢 Business account update:", value);
            await logWebhookEvent({
              eventType: "business_account_update",
              subType: value.event || "unknown",
              phoneNumber: value.phone_number || null,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تحديث حساب الأعمال
            await handleBusinessAccountUpdate(value);
            break;
          }

          case "message_template_name_update": {
            // ── تحديثات اسم القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📝 Message template name update:", value);
            await logWebhookEvent({
              eventType: "message_template_name_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تحديث اسم القالب
            await handleTemplateNameUpdate(value);
            break;
          }

          case "message_template_category_update": {
            // ── تحديثات فئة القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📁 Message template category update:", value);
            await logWebhookEvent({
              eventType: "message_template_category_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تحديث فئة القالب
            await handleTemplateCategoryUpdate(value);
            break;
          }

          case "message_template_language_update": {
            // ── تحديثات لغة القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🌐 Message template language update:", value);
            await logWebhookEvent({
              eventType: "message_template_language_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            // معالجة تحديث لغة القالب
            await handleTemplateLanguageUpdate(value);
            break;
          }

          case "message_template_components_update": {
            // ── تحديثات مكونات القالب ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🔧 Message template components update:", value);
            await logWebhookEvent({
              eventType: "message_template_components_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_example_update": {
            // ── تحديثات مثال القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📋 Message template example update:", value);
            await logWebhookEvent({
              eventType: "message_template_example_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_example_delete": {
            // ── حذف مثال القالب ────────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template example delete:", value);
            await logWebhookEvent({
              eventType: "message_template_example_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_example_create": {
            // ── إنشاء مثال القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template example create:", value);
            await logWebhookEvent({
              eventType: "message_template_example_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_button_update": {
            // ── تحديثات أزرار القالب ──────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🔘 Message template button update:", value);
            await logWebhookEvent({
              eventType: "message_template_button_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_button_delete": {
            // ── حذف أزرار القالب ─────────────────────────────────────────────
            console.log("[WhatsApp Webhook] ❌ Message template button delete:", value);
            await logWebhookEvent({
              eventType: "message_template_button_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_button_create": {
            // ── إنشاء أزرار القالب ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template button create:", value);
            await logWebhookEvent({
              eventType: "message_template_button_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_header_update": {
            // ── تحديثات رأس القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📰 Message template header update:", value);
            await logWebhookEvent({
              eventType: "message_template_header_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_header_delete": {
            // ── حذف رأس القالب ─────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template header delete:", value);
            await logWebhookEvent({
              eventType: "message_template_header_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_header_create": {
            // ── إنشاء رأس القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template header create:", value);
            await logWebhookEvent({
              eventType: "message_template_header_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_footer_update": {
            // ── تحديثات تذييل القالب ──────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📝 Message template footer update:", value);
            await logWebhookEvent({
              eventType: "message_template_footer_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_footer_delete": {
            // ── حذف تذييل القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template footer delete:", value);
            await logWebhookEvent({
              eventType: "message_template_footer_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_footer_create": {
            // ── إنشاء تذييل القالب ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template footer create:", value);
            await logWebhookEvent({
              eventType: "message_template_footer_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_body_update": {
            // ── تحديثات نص القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📄 Message template body update:", value);
            await logWebhookEvent({
              eventType: "message_template_body_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_body_delete": {
            // ── حذف نص القالب ────────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template body delete:", value);
            await logWebhookEvent({
              eventType: "message_template_body_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_body_create": {
            // ── إنشاء نص القالب ───────────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template body create:", value);
            await logWebhookEvent({
              eventType: "message_template_body_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_quick_reply_update": {
            // ── تحديثات الردود السريعة للقالب ───────────────────────────────────
            console.log("[WhatsApp Webhook] ⚡ Message template quick reply update:", value);
            await logWebhookEvent({
              eventType: "message_template_quick_reply_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_quick_reply_delete": {
            // ── حذف الردود السريعة للقالب ───────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template quick reply delete:", value);
            await logWebhookEvent({
              eventType: "message_template_quick_reply_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_quick_reply_create": {
            // ── إنشاء الردود السريعة للقالب ─────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template quick reply create:", value);
            await logWebhookEvent({
              eventType: "message_template_quick_reply_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_parameter_update": {
            // ── تحديثات معاملات القالب ───────────────────────────────────────
            console.log("[WhatsApp Webhook] 🔧 Message template parameter update:", value);
            await logWebhookEvent({
              eventType: "message_template_parameter_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_parameter_delete": {
            // ── حذف معاملات القالب ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template parameter delete:", value);
            await logWebhookEvent({
              eventType: "message_template_parameter_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_parameter_create": {
            // ── إنشاء معاملات القالب ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template parameter create:", value);
            await logWebhookEvent({
              eventType: "message_template_parameter_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_localization_update": {
            // ── تحديثات الترجمة المحلية للقالب ────────────────────────────────
            console.log("[WhatsApp Webhook] 🌍 Message template localization update:", value);
            await logWebhookEvent({
              eventType: "message_template_localization_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_localization_delete": {
            // ── حذف الترجمة المحلية للقالب ───────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template localization delete:", value);
            await logWebhookEvent({
              eventType: "message_template_localization_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_localization_create": {
            // ── إنشاء الترجمة المحلية للقالب ─────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template localization create:", value);
            await logWebhookEvent({
              eventType: "message_template_localization_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_analytics_update": {
            // ── تحديثات تحليلات القالب ────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📊 Message template analytics update:", value);
            await logWebhookEvent({
              eventType: "message_template_analytics_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_analytics_delete": {
            // ── حذف تحليلات القالب ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template analytics delete:", value);
            await logWebhookEvent({
              eventType: "message_template_analytics_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_analytics_create": {
            // ── إنشاء تحليلات القالب ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template analytics create:", value);
            await logWebhookEvent({
              eventType: "message_template_analytics_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_usage_update": {
            // ── تحديثات استخدام القالب ───────────────────────────────────────
            console.log("[WhatsApp Webhook] 📈 Message template usage update:", value);
            await logWebhookEvent({
              eventType: "message_template_usage_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_usage_delete": {
            // ── حذف استخدام القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template usage delete:", value);
            await logWebhookEvent({
              eventType: "message_template_usage_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_usage_create": {
            // ── إنشاء استخدام القالب ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template usage create:", value);
            await logWebhookEvent({
              eventType: "message_template_usage_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_performance_update": {
            // ── تحديثات أداء القالب ──────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📊 Message template performance update:", value);
            await logWebhookEvent({
              eventType: "message_template_performance_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_performance_delete": {
            // ── حذف أداء القالب ──────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template performance delete:", value);
            await logWebhookEvent({
              eventType: "message_template_performance_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_performance_create": {
            // ── إنشاء أداء القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template performance create:", value);
            await logWebhookEvent({
              eventType: "message_template_performance_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_audience_update": {
            // ── تحديثات جمهور القالب ─────────────────────────────────────────
            console.log("[WhatsApp Webhook] 👥 Message template audience update:", value);
            await logWebhookEvent({
              eventType: "message_template_audience_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_audience_delete": {
            // ── حذف جمهور القالب ────────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template audience delete:", value);
            await logWebhookEvent({
              eventType: "message_template_audience_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_audience_create": {
            // ── إنشاء جمهور القالب ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template audience create:", value);
            await logWebhookEvent({
              eventType: "message_template_audience_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_scheduling_update": {
            // ── تحديثات جدولة القالب ────────────────────────────────────────
            console.log("[WhatsApp Webhook] 📅 Message template scheduling update:", value);
            await logWebhookEvent({
              eventType: "message_template_scheduling_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_scheduling_delete": {
            // ── حذف جدولة القالب ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template scheduling delete:", value);
            await logWebhookEvent({
              eventType: "message_template_scheduling_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_scheduling_create": {
            // ── إنشاء جدولة القالب ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template scheduling create:", value);
            await logWebhookEvent({
              eventType: "message_template_scheduling_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_budget_update": {
            // ── تحديثات ميزانية القالب ────────────────────────────────────────
            console.log("[WhatsApp Webhook] 💰 Message template budget update:", value);
            await logWebhookEvent({
              eventType: "message_template_budget_update",
              subType: "update",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_budget_delete": {
            // ── حذف ميزانية القالب ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] 🗑️ Message template budget delete:", value);
            await logWebhookEvent({
              eventType: "message_template_budget_delete",
              subType: "delete",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          case "message_template_budget_create": {
            // ── إنشاء ميزانية القالب ───────────────────────────────────────────
            console.log("[WhatsApp Webhook] ➕ Message template budget create:", value);
            await logWebhookEvent({
              eventType: "message_template_budget_create",
              subType: "create",
              phoneNumber: undefined,
              rawPayload: JSON.stringify(value),
              handlerExists: true,
            });
            break;
          }

          default: {
            console.log(`[WhatsApp Webhook] Unhandled field: ${field}`, value);

            // ── تسجيل الحدث غير المعروف في قاعدة البيانات ──────────────────────
            // هذا يساعد في اكتشاف أحداث جديدة من Meta
            try {
              await logWebhookEvent({
                eventType: field,
                subType: value?.type || undefined,
                phoneNumber: value?.phone_number || value?.phoneNumber || undefined,
                rawPayload: JSON.stringify({ field, value, timestamp: new Date().toISOString() }),
                processed: false,
                handlerExists: false,
              });
            } catch (error) {
              console.error("[WhatsApp Webhook] Failed to log unhandled event:", error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing webhook event:", error);
  }
}

// ─── Express Handler ───────────────────────────────────────────────────────────

/**
 * Express Middleware لمعالجة Webhook
 */
export function createWhatsAppWebhookHandler() {
  return async (req: Request, res: Response) => {
    // ── GET: التحقق من Webhook Token ──────────────────────────────────────────
    if (req.method === "GET") {
      verifyWebhookToken(req, res);
      return;
    }

    // ── POST: معالجة الأحداث ──────────────────────────────────────────────────
    if (req.method === "POST") {
      // ✅ التحقق من التوقيع قبل معالجة أي حدث
      if (!verifyWebhookSignature(req)) {
        console.error("[WhatsApp Webhook] ❌ Invalid signature — request rejected");
        res.status(403).json({ error: "Invalid signature" });
        return;
      }

      try {
        const body = req.body;
        console.log(`[WhatsApp Webhook] ✅ Received verified webhook event (object: ${body.object})`);

        // معالجة الحدث بشكل غير متزامن
        processWebhookEvent(body).catch((err) => {
          console.error("[WhatsApp Webhook] Async processing error:", err);
        });

        // ✅ الرد بـ 200 فوراً (وفق متطلبات Meta: يجب الرد خلال 20 ثانية)
        res.status(200).json({ success: true });
      } catch (error) {
        console.error("[WhatsApp Webhook] Error:", error);
        // ✅ حتى في حالة الخطأ، يجب الرد بـ 200 لتجنب إعادة الإرسال من Meta
        res.status(200).json({ success: false, error: "Processing error" });
      }
    }
  };
}

export default createWhatsAppWebhookHandler;
