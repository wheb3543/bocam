import { eq, desc, and, sql } from 'drizzle-orm';
import {
  whatsappConversations,
  whatsappMessages,
  whatsappTemplates,
  whatsappWebhookEvents,
  InsertWhatsAppConversation,
  InsertWhatsAppMessage,
  InsertWhatsAppTemplate,
  InsertWhatsappWebhookEvent,
  WhatsAppConversation,
} from '../../../drizzle/schema';
import { publish, channelForConversation } from '../../_core/pubsub';
import { getDb } from './connection';

/**
 * Normalize phone number to standard format (remove +, spaces, dashes)
 * Example: "+967 777 165 305" -> "967777165305"
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) {
    return '';
  }
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('00967')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('967') && cleaned.length >= 12) {
    // صحيح بالفعل
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '967' + cleaned.substring(1);
  } else if (cleaned.length === 9 && !cleaned.startsWith('967')) {
    cleaned = '967' + cleaned;
  }
  return cleaned;
}

// Get customer info from phone number
export async function getCustomerInfoByPhone(phone: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const { leads, appointments, offerLeads, campRegistrations } =
    await import('../../../drizzle/schema');
  const normalizedPhone = normalizePhoneNumber(phone);

  const leadResult = await db.select().from(leads).limit(1000);
  const matchedLead = leadResult.find(
    (l: { phone: string }) => normalizePhoneNumber(l.phone) === normalizedPhone
  );
  if (matchedLead) {
    return {
      type: 'lead',
      id: matchedLead.id,
      name: matchedLead.fullName,
      phone: matchedLead.phone,
      email: matchedLead.email,
      status: matchedLead.status,
      source: matchedLead.source,
      createdAt: matchedLead.createdAt,
    };
  }

  const appointmentResult = await db.select().from(appointments).limit(1000);
  const matchedAppointment = appointmentResult.find(
    (a: { phone: string }) => normalizePhoneNumber(a.phone) === normalizedPhone
  );
  if (matchedAppointment) {
    return {
      type: 'appointment',
      id: matchedAppointment.id,
      name: matchedAppointment.fullName,
      phone: matchedAppointment.phone,
      email: matchedAppointment.email,
      status: matchedAppointment.status,
      createdAt: matchedAppointment.createdAt,
    };
  }

  const offerResult = await db.select().from(offerLeads).limit(1000);
  const matchedOffer = offerResult.find(
    (o: { phone: string }) => normalizePhoneNumber(o.phone) === normalizedPhone
  );
  if (matchedOffer) {
    return {
      type: 'offer',
      id: matchedOffer.id,
      name: matchedOffer.fullName,
      phone: matchedOffer.phone,
      email: matchedOffer.email,
      status: matchedOffer.status,
      createdAt: matchedOffer.createdAt,
    };
  }

  const campResult = await db.select().from(campRegistrations).limit(1000);
  const matchedCamp = campResult.find(
    (c: { phone: string }) => normalizePhoneNumber(c.phone) === normalizedPhone
  );
  if (matchedCamp) {
    return {
      type: 'camp',
      id: matchedCamp.id,
      name: matchedCamp.fullName,
      phone: matchedCamp.phone,
      email: matchedCamp.email,
      status: matchedCamp.status,
      createdAt: matchedCamp.createdAt,
    };
  }

  return null;
}

// Get all customer records by phone number
export async function getAllCustomerRecordsByPhone(phone: string) {
  const db = await getDb();
  if (!db) {
    return { leads: [], appointments: [], offers: [], camps: [] };
  }

  const { leads, appointments, offerLeads, campRegistrations } =
    await import('../../../drizzle/schema');
  const normalizedPhone = normalizePhoneNumber(phone);

  const [leadsList, appointmentsList, offersList, campsList] = await Promise.all([
    db
      .select()
      .from(leads)
      .limit(1000)
      .then((items: Array<{ phone: string; createdAt: Date }>) =>
        items
          .filter((l) => normalizePhoneNumber(l.phone) === normalizedPhone)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ),
    db
      .select()
      .from(appointments)
      .limit(1000)
      .then((items: Array<{ phone: string; createdAt: Date }>) =>
        items
          .filter((a) => normalizePhoneNumber(a.phone) === normalizedPhone)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ),
    db
      .select()
      .from(offerLeads)
      .limit(1000)
      .then((items: Array<{ phone: string; createdAt: Date }>) =>
        items
          .filter((o) => normalizePhoneNumber(o.phone) === normalizedPhone)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ),
    db
      .select()
      .from(campRegistrations)
      .limit(1000)
      .then((items: Array<{ phone: string; createdAt: Date }>) =>
        items
          .filter((c) => normalizePhoneNumber(c.phone) === normalizedPhone)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ),
  ]);

  return {
    leads: leadsList,
    appointments: appointmentsList,
    offers: offersList,
    camps: campsList,
  };
}

export async function getAllWhatsAppConversations() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(whatsappConversations).orderBy(desc(whatsappConversations.lastMessageAt));
}

export async function getWhatsAppConversationById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(whatsappConversations)
    .where(eq(whatsappConversations.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWhatsAppConversationByPhone(
  phone: string
): Promise<WhatsAppConversation | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const normalizedPhone = normalizePhoneNumber(phone);

  const result = await db.execute(sql`
    SELECT * FROM whatsapp_conversations
    WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phoneNumber, '+', ''), ' ', ''), '-', ''), '(', ''), ')', '') = ${normalizedPhone}
    LIMIT 1
  `);

  const rows = result as unknown as WhatsAppConversation[];
  return rows?.length > 0 ? rows[0] : undefined;
}

export async function createWhatsAppConversation(conversation: InsertWhatsAppConversation) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.insert(whatsappConversations).values(conversation);
  return result;
}

export async function updateWhatsAppConversation(
  id: number,
  conversation: Partial<InsertWhatsAppConversation>
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db
    .update(whatsappConversations)
    .set(conversation)
    .where(eq(whatsappConversations.id, id));
  try {
    publish(channelForConversation(id), 'conversation_updated', { id, ...conversation });
  } catch (err) {
    console.warn('[db] failed to publish conversation update event', err);
  }
  return result;
}

export async function getWhatsAppMessagesByConversation(conversationId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db
    .select()
    .from(whatsappMessages)
    .where(eq(whatsappMessages.conversationId, conversationId))
    .orderBy(whatsappMessages.createdAt);
}

export async function getLatestInboundWhatsAppMessage(conversationId: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(whatsappMessages)
    .where(
      and(
        eq(whatsappMessages.conversationId, conversationId),
        eq(whatsappMessages.direction, 'inbound')
      )
    )
    .orderBy(desc(whatsappMessages.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWhatsAppMessageByWhatsAppId(whatsappId: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(whatsappMessages)
    .where(eq(whatsappMessages.whatsappMessageId, whatsappId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createWhatsAppMessage(message: InsertWhatsAppMessage) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.insert(whatsappMessages).values(message);
  try {
    const convId = message.conversationId;
    if (convId && message.direction === 'outbound') {
      publish(channelForConversation(convId as number), 'message_created', {
        ...message,
        id:
          ((result as unknown as Record<string, unknown>[])?.[0] as Record<string, unknown>)
            ?.insertId || null,
      });
    }
  } catch (err) {
    console.warn('[db] failed to publish whatsapp message event', err);
  }
  return result;
}

export async function updateWhatsAppMessage(id: number, message: Partial<InsertWhatsAppMessage>) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.update(whatsappMessages).set(message).where(eq(whatsappMessages.id, id));
  try {
    const updated = await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.id, id))
      .limit(1);
    const msg = updated.length > 0 ? updated[0] : null;
    if (msg) {
      publish(channelForConversation(msg.conversationId), 'message_updated', {
        id,
        ...message,
        conversationId: msg.conversationId,
      });
    }
  } catch (err) {
    console.warn('[db] failed to publish whatsapp message update event', err);
  }
  return result;
}

export async function getAllWhatsAppTemplates() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db
    .select()
    .from(whatsappTemplates)
    .where(eq(whatsappTemplates.isActive, 1))
    .orderBy(whatsappTemplates.name);
}

export async function getWhatsAppTemplateById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(whatsappTemplates)
    .where(eq(whatsappTemplates.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createWhatsAppTemplate(template: InsertWhatsAppTemplate) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.insert(whatsappTemplates).values(template);
  return result;
}

export async function updateWhatsAppTemplate(
  id: number,
  template: Partial<InsertWhatsAppTemplate>
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  return db.update(whatsappTemplates).set(template).where(eq(whatsappTemplates.id, id));
}

export async function deleteWhatsAppTemplate(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  return db.delete(whatsappTemplates).where(eq(whatsappTemplates.id, id));
}

// WhatsApp Event Logging Functions
export async function createWhatsAppWebhookEvent(event: InsertWhatsappWebhookEvent) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  return db.insert(whatsappWebhookEvents).values(event);
}

export async function searchWhatsAppConversations(searchTerm: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { like } = await import('drizzle-orm');
  return db
    .select()
    .from(whatsappConversations)
    .where(like(whatsappConversations.customerName, `%${searchTerm}%`))
    .orderBy(desc(whatsappConversations.lastMessageAt));
}

export async function getUnreadWhatsAppConversationsCount() {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(whatsappConversations)
    .where(sql`${whatsappConversations.unreadCount} > 0`);

  return Number(result[0]?.count || 0);
}
