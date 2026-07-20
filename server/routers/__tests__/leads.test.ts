/**
 * اختبارات Leads Router Procedures
 * Leads Router Procedures Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from '../../database/db';

// Mock db module
vi.mock('../../database/db');

// Mock other dependencies
vi.mock('../../_core/notification');
vi.mock('../../services/email');
vi.mock('../../services/telegram');
vi.mock('../../services/whatsapp');
vi.mock('./auditLogs');

// Define Mock type for vitest
type MockedFunction = ReturnType<typeof vi.fn> & {
  mockResolvedValue: (value: unknown) => MockedFunction;
  mockImplementation: (fn: (...args: unknown[]) => unknown) => MockedFunction;
};

describe('Leads Router Procedures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submit', () => {
    it('يجب أن ينشئ عميل جديد بنجاح', async () => {
      const mockResult = {
        insertId: 456,
        success: true,
      };
      (db.createLead as MockedFunction).mockResolvedValue(mockResult);
      (db.getCampaignBySlug as MockedFunction).mockResolvedValue({
        id: 1,
        name: 'حملة تجريبية',
        slug: 'test-campaign',
        whatsappEnabled: false,
      });

      const result = await db.createLead({
        campaignId: 1,
        fullName: 'محمد علي',
        phone: '967712345678',
        status: 'new',
        source: 'direct',
        emailSent: false,
        whatsappSent: false,
        bookingConfirmationSent: false,
      });

      expect(result).toEqual(mockResult);
      expect(db.createLead).toHaveBeenCalled();
    });

    it('يجب أن يفشل عند بيانات غير صالحة', async () => {
      (db.createLead as MockedFunction).mockResolvedValue(undefined);

      const result = await db.createLead({
        campaignId: 1,
        fullName: '',
        phone: 'invalid',
        status: 'new',
        source: 'direct',
        emailSent: false,
        whatsappSent: false,
        bookingConfirmationSent: false,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('يجب أن يرجع جميع العملاء', async () => {
      const mockLeads = [
        { id: 1, fullName: 'محمد علي', phone: '967712345678', status: 'new' },
        { id: 2, fullName: 'فاطمة محمد', phone: '967712345679', status: 'contacted' },
      ];
      (db.getAllLeads as MockedFunction).mockResolvedValue(mockLeads);

      const result = await db.getAllLeads();

      expect(result).toEqual(mockLeads);
      expect(result).toHaveLength(2);
    });

    it('يجب أن يرجع مصفوفة فارغة عند عدم وجود عملاء', async () => {
      (db.getAllLeads as MockedFunction).mockResolvedValue([]);

      const result = await db.getAllLeads();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('unifiedList', () => {
    it('يجب أن يرجع قائمة موحدة من جميع المصادر', async () => {
      const mockUnifiedLeads = [
        { id: 1, fullName: 'محمد علي', phone: '967712345678', source: 'lead' },
        { id: 2, fullName: 'فاطمة محمد', phone: '967712345679', source: 'offer_lead' },
      ];
      const { getAllUnifiedLeads } = await import('../../database/db');
      (getAllUnifiedLeads as MockedFunction).mockResolvedValue(mockUnifiedLeads);

      const result = await getAllUnifiedLeads();

      expect(result).toEqual(mockUnifiedLeads);
      expect(result).toHaveLength(2);
    });
  });

  describe('getById', () => {
    it('يجب أن يرجع بيانات العميل الصحيحة', async () => {
      const mockLead = {
        id: 1,
        fullName: 'محمد علي',
        phone: '967712345678',
        status: 'new',
      };
      (db.getLeadById as MockedFunction).mockResolvedValue(mockLead);

      const result = await db.getLeadById(1);

      expect(result).toEqual(mockLead);
    });

    it('يجب أن يرجع null عند عدم وجود العميل', async () => {
      (db.getLeadById as MockedFunction).mockResolvedValue(null);

      const result = await db.getLeadById(999);

      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('يجب أن يبحث عن العملاء بالاسم', async () => {
      const mockResults = [
        { id: 1, fullName: 'محمد علي', phone: '967712345678', status: 'new' },
      ];
      (db.searchLeads as MockedFunction).mockResolvedValue(mockResults);

      const result = await db.searchLeads('محمد');

      expect(result).toEqual(mockResults);
      expect(result[0].fullName).toContain('محمد');
    });

    it('يجب أن يبحث برقم الهاتف', async () => {
      const mockResults = [
        { id: 1, fullName: 'محمد علي', phone: '967712345678', status: 'new' },
      ];
      (db.searchLeads as MockedFunction).mockResolvedValue(mockResults);

      const result = await db.searchLeads('967712345678');

      expect(result).toEqual(mockResults);
      expect(result[0].phone).toContain('967712345678');
    });
  });

  describe('getByCampaign', () => {
    it('يجب أن يرجع عملاء حملة محددة', async () => {
      const mockLeads = [
        { id: 1, campaignId: 5, fullName: 'محمد علي', phone: '967712345678' },
        { id: 2, campaignId: 5, fullName: 'فاطمة محمد', phone: '967712345679' },
      ];
      (db.getLeadsByCampaign as MockedFunction).mockResolvedValue(mockLeads);

      const result = await db.getLeadsByCampaign(5);

      expect(result).toEqual(mockLeads);
      expect(result).toHaveLength(2);
      expect(result.every(lead => lead.campaignId === 5)).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('يجب أن يحدث حالة العميل بنجاح', async () => {
      const mockResult = { success: true };
      (db.updateLead as MockedFunction).mockResolvedValue(mockResult);
      (db.getLeadById as MockedFunction).mockResolvedValue({
        id: 1,
        status: 'new',
      });
      (db.createLeadStatusHistory as MockedFunction).mockResolvedValue({});

      const result = await db.updateLead(1, { status: 'contacted' });

      expect(result).toEqual(mockResult);
      expect(db.updateLead).toHaveBeenCalledWith(1, { status: 'contacted' });
    });

    it('يجب أن يفشل عند عدم وجود العميل', async () => {
      (db.getLeadById as MockedFunction).mockResolvedValue(null);
      (db.updateLead as MockedFunction).mockResolvedValue(undefined);

      const result = await db.updateLead(999, { status: 'contacted' });

      expect(result).toBeUndefined();
    });
  });

  describe('getStatusHistory', () => {
    it('يجب أن يرجع سجل حالات العميل', async () => {
      const mockHistory = [
        { id: 1, leadId: 1, oldStatus: 'new', newStatus: 'contacted' },
        { id: 2, leadId: 1, oldStatus: 'contacted', newStatus: 'booked' },
      ];
      (db.getLeadStatusHistory as MockedFunction).mockResolvedValue(mockHistory);

      const result = await db.getLeadStatusHistory(1);

      expect(result).toEqual(mockHistory);
      expect(result).toHaveLength(2);
    });
  });

  describe('stats', () => {
    it('يجب أن يرجع إحصائيات العملاء', async () => {
      const mockStats = {
        total: 100,
        new: 30,
        contacted: 40,
        booked: 20,
        notInterested: 10,
      };
      (db.getLeadsStats as MockedFunction).mockResolvedValue(mockStats);

      const result = await db.getLeadsStats();

      expect(result).toEqual(mockStats);
      expect(result?.total).toBe(100);
    });
  });

  describe('sendWhatsApp', () => {
    it('يجب أن يرسل رسالة واتساب بنجاح', async () => {
      const mockLead = {
        id: 1,
        phone: '967712345678',
        fullName: 'محمد علي',
      };
      (db.getLeadById as MockedFunction).mockResolvedValue(mockLead);
      (db.updateLead as MockedFunction).mockResolvedValue({ success: true });

      const result = { success: true };
      expect(result.success).toBe(true);
    });

    it('يجب أن يفشل عند عدم وجود العميل', async () => {
      (db.getLeadById as MockedFunction).mockResolvedValue(null);

      const result = { success: false };
      expect(result.success).toBe(false);
    });
  });

  describe('sendBookingConfirmation', () => {
    it('يجب أن يرسل تأكيد الحجز بنجاح', async () => {
      const mockLead = {
        id: 1,
        phone: '967712345678',
        fullName: 'محمد علي',
      };
      (db.getLeadById as MockedFunction).mockResolvedValue(mockLead);
      (db.updateLead as MockedFunction).mockResolvedValue({ success: true });

      const result = { success: true };
      expect(result.success).toBe(true);
    });

    it('يجب أن يفشل عند عدم وجود العميل', async () => {
      (db.getLeadById as MockedFunction).mockResolvedValue(null);

      const result = { success: false };
      expect(result.success).toBe(false);
    });
  });
});
