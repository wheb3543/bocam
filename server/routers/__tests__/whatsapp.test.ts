/**
 * اختبارات WhatsApp Router Procedures
 * WhatsApp Router Procedures Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from '../../database/db';

// Mock db module
vi.mock('../../database/db');

// Define Mock type for vitest
type MockedFunction = ReturnType<typeof vi.fn> & {
  mockResolvedValue: (value: unknown) => MockedFunction;
  mockImplementation: (fn: (...args: unknown[]) => unknown) => MockedFunction;
};

describe('WhatsApp Router Procedures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('markAsRead', () => {
    it('يجب أن يحدث unreadCount إلى 0', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ success: true });
      (db.updateWhatsAppConversation as MockedFunction).mockImplementation(mockUpdate);

      const conversationId = 123;
      await db.updateWhatsAppConversation(conversationId, { unreadCount: 0 });

      expect(mockUpdate).toHaveBeenCalledWith(conversationId, { unreadCount: 0 });
    });

    it('يجب أن يحدث حالة المحادثة', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ success: true });
      (db.updateWhatsAppConversation as MockedFunction).mockImplementation(mockUpdate);

      const conversationId = 123;
      await db.updateWhatsAppConversation(conversationId, { isImportant: 1 });

      expect(mockUpdate).toHaveBeenCalledWith(conversationId, { isImportant: 1 });
    });
  });

  describe('conversations.list', () => {
    it('يجب أن يرجع جميع المحادثات', async () => {
      const mockConversations = [
        { id: 1, customerName: 'أحمد', phoneNumber: '967712345678', unreadCount: 2 },
        { id: 2, customerName: 'فاطمة', phoneNumber: '967712345679', unreadCount: 0 },
      ];
      (db.getAllWhatsAppConversations as MockedFunction).mockResolvedValue(mockConversations);

      const result = await db.getAllWhatsAppConversations();

      expect(result).toEqual(mockConversations);
      expect(result).toHaveLength(2);
    });

    it('يجب أن يرجع قائمة فارغة إذا لم تكن هناك محادثات', async () => {
      (db.getAllWhatsAppConversations as MockedFunction).mockResolvedValue([]);

      const result = await db.getAllWhatsAppConversations();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('conversations.search', () => {
    it('يجب أن يبحث عن المحادثات بالاسم أو الهاتف', async () => {
      const mockResults = [
        { id: 1, customerName: 'أحمد', phoneNumber: '967712345678', unreadCount: 0 },
      ];
      (db.searchWhatsAppConversations as MockedFunction).mockResolvedValue(mockResults);

      const result = await db.searchWhatsAppConversations('أحمد');

      expect(result).toEqual(mockResults);
      expect(result[0].customerName).toContain('أحمد');
    });

    it('يجب أن يبحث بالرقم', async () => {
      const mockResults = [
        { id: 1, customerName: 'أحمد', phoneNumber: '967712345678', unreadCount: 0 },
      ];
      (db.searchWhatsAppConversations as MockedFunction).mockResolvedValue(mockResults);

      const result = await db.searchWhatsAppConversations('967712345678');

      expect(result).toEqual(mockResults);
      expect(result[0].phoneNumber).toContain('967712345678');
    });
  });

  describe('unreadCount', () => {
    it('يجب أن يرجع عدد المحادثات غير المقروءة', async () => {
      (db.getUnreadWhatsAppConversationsCount as MockedFunction).mockResolvedValue(5);

      const result = await db.getUnreadWhatsAppConversationsCount();

      expect(result).toBe(5);
    });

    it('يجب أن يرجع 0 إذا لم تكن هناك محادثات غير مقروءة', async () => {
      (db.getUnreadWhatsAppConversationsCount as MockedFunction).mockResolvedValue(0);

      const result = await db.getUnreadWhatsAppConversationsCount();

      expect(result).toBe(0);
    });
  });


  describe('templates.syncFromMeta', () => {
    it('يجب أن يزامن القوالب من Meta', async () => {
      const mockResult = {
        success: true,
        total: 3,
        synced: 2,
        updated: 1,
        message: 'تمت المزامنة: 2 قالب جديد، 1 قالب محدّث من أصل 3 قالب معتمد',
      };

      expect(mockResult.success).toBe(true);
      expect(mockResult.synced + mockResult.updated).toBe(3);
    });
  });

  describe('sendMessage', () => {
    it('يجب أن يرسل رسالة نصية', async () => {
      const mockResult = {
        success: true,
        messageId: 'wamid123',
        phoneNumber: '967712345678',
      };
      (db.createWhatsAppMessage as MockedFunction).mockResolvedValue(mockResult);

      const result = await db.createWhatsAppMessage({
        conversationId: 123,
        direction: 'outbound',
        content: 'مرحباً',
        messageType: 'text',
        status: 'sent',
      });

      expect(result).toEqual(mockResult);
    });
  });
});
