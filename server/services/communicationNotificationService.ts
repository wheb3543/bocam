import { createNotification } from '../_core/notificationHelper';
import { getDb, getSocialInboxThreadById } from '../database/db';
import { notifyEligibleRecipients } from './notificationPolicy';

type NotificationDb = NonNullable<Awaited<ReturnType<typeof getDb>>>;
type SocialChannelType = 'message' | 'comment';

function isAssignedToAnotherUser(assignedUserId: number | null | undefined, actorUserId?: number) {
  return Boolean(assignedUserId && assignedUserId !== actorUserId);
}

export async function notifyWhatsAppInbound(
  db: NotificationDb,
  input: {
    conversationId: number;
    assignedUserId?: number | null;
    isImportant?: boolean;
  }
) {
  const base = {
    source: 'whatsapp' as const,
    type: 'message_received' as const,
    title: 'رسالة WhatsApp جديدة',
    entityType: 'whatsapp_conversation',
    entityId: input.conversationId,
    actionUrl: '/admin/whatsapp',
    actionLabel: 'فتح المحادثة',
    priority: input.isImportant ? ('high' as const) : ('medium' as const),
  };

  if (input.assignedUserId) {
    return createNotification(db, {
      ...base,
      userId: input.assignedUserId,
      message: 'وردت رسالة جديدة في محادثة مكلّف بمتابعتها.',
      data: JSON.stringify({ conversationId: input.conversationId, event: 'inbound_message' }),
    });
  }

  return notifyEligibleRecipients(db, {
    ...base,
    message: 'وردت رسالة WhatsApp جديدة تحتاج إلى متابعة.',
    data: JSON.stringify({ conversationId: input.conversationId, event: 'inbound_message' }),
  });
}

export async function notifyWhatsAppAssignment(
  db: NotificationDb,
  input: { conversationId: number; assignedUserId: number; actorUserId?: number }
) {
  if (!isAssignedToAnotherUser(input.assignedUserId, input.actorUserId)) {
    return null;
  }

  return createNotification(db, {
    userId: input.assignedUserId,
    source: 'whatsapp',
    type: 'conversation_assigned',
    title: 'تم إسناد محادثة WhatsApp إليك',
    message: 'تم تعيين محادثة جديدة ضمن قائمة المتابعة الخاصة بك.',
    data: JSON.stringify({ conversationId: input.conversationId, event: 'assignment' }),
    entityType: 'whatsapp_conversation',
    entityId: input.conversationId,
    actionUrl: '/admin/whatsapp',
    actionLabel: 'فتح المحادثة',
    priority: 'medium',
  });
}

export async function notifySocialInboxInbound(
  db: NotificationDb,
  input: { threadId: number; channelType: SocialChannelType; assignedUserId?: number | null }
) {
  const isComment = input.channelType === 'comment';
  const base = {
    source: 'social_inbox' as const,
    type: (isComment ? 'comment_received' : 'message_received') as
      'comment_received' | 'message_received',
    title: isComment ? 'تعليق اجتماعي جديد' : 'رسالة اجتماعية جديدة',
    entityType: 'social_inbox_thread',
    entityId: input.threadId,
    actionUrl: '/admin/messages',
    actionLabel: isComment ? 'فتح التعليقات' : 'فتح الرسالة',
    priority: 'medium' as const,
  };

  if (input.assignedUserId) {
    return createNotification(db, {
      ...base,
      userId: input.assignedUserId,
      message: isComment
        ? 'ورد تعليق جديد في سياق مكلّف بمتابعته.'
        : 'وردت رسالة جديدة في محادثة مكلّف بمتابعتها.',
      data: JSON.stringify({ threadId: input.threadId, event: 'inbound_item' }),
    });
  }

  return notifyEligibleRecipients(db, {
    ...base,
    message: isComment
      ? 'ورد تعليق اجتماعي جديد يحتاج إلى متابعة.'
      : 'وردت رسالة اجتماعية جديدة تحتاج إلى متابعة.',
    data: JSON.stringify({ threadId: input.threadId, event: 'inbound_item' }),
  });
}

export async function notifySocialInboxAssignment(
  db: NotificationDb,
  input: {
    threadId: number;
    channelType: SocialChannelType;
    assignedUserId: number;
    actorUserId?: number;
  }
) {
  if (!isAssignedToAnotherUser(input.assignedUserId, input.actorUserId)) {
    return null;
  }

  const isComment = input.channelType === 'comment';
  return createNotification(db, {
    userId: input.assignedUserId,
    source: 'social_inbox',
    type: isComment ? 'comment_assigned' : 'conversation_assigned',
    title: isComment ? 'تم إسناد تعليق اجتماعي إليك' : 'تم إسناد محادثة اجتماعية إليك',
    message: isComment
      ? 'تم تعيين سياق تعليق جديد ضمن قائمة المتابعة الخاصة بك.'
      : 'تم تعيين محادثة اجتماعية جديدة ضمن قائمة المتابعة الخاصة بك.',
    data: JSON.stringify({ threadId: input.threadId, event: 'assignment' }),
    entityType: 'social_inbox_thread',
    entityId: input.threadId,
    actionUrl: '/admin/messages',
    actionLabel: isComment ? 'فتح التعليقات' : 'فتح الرسالة',
    priority: 'medium',
  });
}

export async function notifyStoredSocialInboxInbound(threadId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const context = await getSocialInboxThreadById(threadId);
  if (
    !context ||
    (context.thread.channelType !== 'message' && context.thread.channelType !== 'comment')
  ) {
    return null;
  }

  return notifySocialInboxInbound(db, {
    threadId: context.thread.id,
    channelType: context.thread.channelType,
    assignedUserId: context.thread.assignedToUserId,
  });
}
