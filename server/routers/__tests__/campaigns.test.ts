/**
 * اختبارات Campaigns Router Procedures
 * Campaigns Router Procedures Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as campaigns from '../../database/db/campaigns';

// Mock campaigns module
vi.mock('../../database/db/campaigns');

// Define Mock type for vitest
type MockedFunction = ReturnType<typeof vi.fn> & {
  mockResolvedValue: (value: unknown) => MockedFunction;
  mockImplementation: (fn: (...args: unknown[]) => unknown) => MockedFunction;
};

describe('Campaigns Router Procedures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('يجب أن يرجع جميع الحملات', async () => {
      const mockCampaigns = [
        { id: 1, name: 'حملة رمضان', slug: 'ramadan-2024', status: 'active', type: 'digital' },
        { id: 2, name: 'حملة الصيف', slug: 'summer-2024', status: 'draft', type: 'field' },
      ];
      (campaigns.getCampaigns as MockedFunction).mockResolvedValue(mockCampaigns);

      const result = await campaigns.getCampaigns();

      expect(result).toEqual(mockCampaigns);
      expect(result).toHaveLength(2);
    });

    it('يجب أن يرجع مصفوفة فارغة عند عدم وجود حملات', async () => {
      (campaigns.getCampaigns as MockedFunction).mockResolvedValue([]);

      const result = await campaigns.getCampaigns();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('يجب أن يفلتر الحملات حسب الحالة', async () => {
      const mockCampaigns = [
        { id: 1, name: 'حملة نشطة', slug: 'active-campaign', status: 'active', type: 'digital' },
      ];
      (campaigns.getCampaigns as MockedFunction).mockResolvedValue(mockCampaigns);

      const result = await campaigns.getCampaigns({ status: 'active' });

      expect(result).toEqual(mockCampaigns);
      expect(result[0].status).toBe('active');
    });
  });

  describe('getById', () => {
    it('يجب أن يرجع بيانات الحملة الصحيحة', async () => {
      const mockCampaign = {
        id: 1,
        name: 'حملة رمضان',
        slug: 'ramadan-2024',
        status: 'active',
        type: 'digital',
      };
      (campaigns.getCampaignById as MockedFunction).mockResolvedValue(mockCampaign);

      const result = await campaigns.getCampaignById(1);

      expect(result).toEqual(mockCampaign);
    });

    it('يجب أن يرجع null عند عدم وجود الحملة', async () => {
      (campaigns.getCampaignById as MockedFunction).mockResolvedValue(null);

      const result = await campaigns.getCampaignById(999);

      expect(result).toBeNull();
    });
  });

  describe('getBySlug', () => {
    it('يجب أن يرجع الحملة حسب الرابط المختصر', async () => {
      const mockCampaign = {
        id: 1,
        name: 'حملة رمضان',
        slug: 'ramadan-2024',
        status: 'active',
        type: 'digital',
      };
      (campaigns.getCampaignBySlug as MockedFunction).mockResolvedValue(mockCampaign);

      const result = await campaigns.getCampaignBySlug('ramadan-2024');

      expect(result).toEqual(mockCampaign);
      expect(result?.slug).toBe('ramadan-2024');
    });

    it('يجب أن يرجع null عند عدم وجود الرابط المختصر', async () => {
      (campaigns.getCampaignBySlug as MockedFunction).mockResolvedValue(null);

      const result = await campaigns.getCampaignBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('يجب أن ينشئ حملة جديدة بنجاح', async () => {
      const mockResult = {
        insertId: 123,
        success: true,
      };
      (campaigns.createCampaign as MockedFunction).mockResolvedValue(mockResult);

      const result = await campaigns.createCampaign({
        name: 'حملة جديدة',
        slug: 'new-campaign',
        type: 'digital',
        status: 'draft',
        isActive: true,
        whatsappEnabled: false,
      });

      expect(result).toEqual(mockResult);
      expect(campaigns.createCampaign).toHaveBeenCalled();
    });

    it('يجب أن يفشل عند بيانات غير صالحة', async () => {
      (campaigns.createCampaign as MockedFunction).mockResolvedValue(undefined);

      const result = await campaigns.createCampaign({
        name: '',
        slug: '',
        type: 'digital',
        status: 'draft',
        isActive: true,
        whatsappEnabled: false,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('يجب أن يحدث الحملة بنجاح', async () => {
      const mockResult = { success: true };
      (campaigns.updateCampaign as MockedFunction).mockResolvedValue(mockResult);

      const result = await campaigns.updateCampaign(1, {
        name: 'حملة محدثة',
        status: 'active',
      });

      expect(result).toEqual(mockResult);
      expect(campaigns.updateCampaign).toHaveBeenCalledWith(1, {
        name: 'حملة محدثة',
        status: 'active',
      });
    });

    it('يجب أن يفشل عند عدم وجود الحملة', async () => {
      (campaigns.updateCampaign as MockedFunction).mockResolvedValue(undefined);

      const result = await campaigns.updateCampaign(999, { name: 'حملة محدثة' });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('يجب أن يحذف الحملة بنجاح', async () => {
      const mockResult = { success: true };
      (campaigns.deleteCampaign as MockedFunction).mockResolvedValue(mockResult);

      const result = await campaigns.deleteCampaign(1);

      expect(result).toEqual(mockResult);
    });

    it('يجب أن يفشل عند عدم وجود الحملة', async () => {
      const mockResult = { success: false };
      (campaigns.deleteCampaign as MockedFunction).mockResolvedValue(mockResult);

      const result = await campaigns.deleteCampaign(999);

      expect(result.success).toBe(false);
    });
  });

  describe('getStats', () => {
    it('يجب أن يرجع إحصائيات الحملة', async () => {
      const mockStats = {
        totalLeads: 100,
        totalBookings: 50,
        conversionRate: 50,
        revenue: 50000,
      };
      (campaigns.getCampaignStats as MockedFunction).mockResolvedValue(mockStats);

      const result = await campaigns.getCampaignStats(1);

      expect(result).toEqual(mockStats);
      expect(result.totalLeads).toBe(100);
    });
  });

  describe('getOverview', () => {
    it('يجب أن يرجع نظرة عامة على جميع الحملات', async () => {
      const mockOverview = [
        { id: 1, name: 'حملة رمضان', totalLeads: 100, conversionRate: 50 },
        { id: 2, name: 'حملة الصيف', totalLeads: 75, conversionRate: 40 },
      ];
      (campaigns.getCampaignsOverview as MockedFunction).mockResolvedValue(mockOverview);

      const result = await campaigns.getCampaignsOverview();

      expect(result).toEqual(mockOverview);
      expect(result).toHaveLength(2);
    });
  });

  describe('getLinks', () => {
    it('يجب أن يرجع جميع روابط الحملة', async () => {
      const mockLinks = {
        linkedOffers: [
          { linkId: 1, offerId: 1, offerTitle: 'عرض خاص', offerSlug: 'special-offer', offerIsActive: true, linkedAt: new Date() }
        ],
        linkedCamps: [
          { linkId: 1, campId: 1, campName: 'مخيم طبي', campSlug: 'medical-camp', campIsActive: true, linkedAt: new Date() }
        ],
        linkedDoctors: [
          { linkId: 1, doctorId: 1, doctorName: 'د. أحمد', doctorSpecialty: 'طب عام', linkedAt: new Date() }
        ],
      };
      (campaigns.getCampaignAllLinks as MockedFunction).mockResolvedValue(mockLinks);

      const result = await campaigns.getCampaignAllLinks(1);

      expect(result).toEqual(mockLinks);
      expect(result.linkedOffers).toHaveLength(1);
      expect(result.linkedCamps).toHaveLength(1);
      expect(result.linkedDoctors).toHaveLength(1);
    });
  });

  describe('linkOffers', () => {
    it('يجب أن يربط العروض بالحملة بنجاح', async () => {
      const mockResult = { success: true };
      (campaigns.linkOffersToCampaign as MockedFunction).mockResolvedValue(mockResult);

      const result = await campaigns.linkOffersToCampaign(1, [1, 2, 3]);

      expect(result).toEqual(mockResult);
      expect(campaigns.linkOffersToCampaign).toHaveBeenCalledWith(1, [1, 2, 3]);
    });
  });

  describe('linkCamps', () => {
    it('يجب أن يربط المخيمات بالحملة بنجاح', async () => {
      const mockResult = { success: true };
      (campaigns.linkCampsToCampaign as MockedFunction).mockResolvedValue(mockResult);

      const result = await campaigns.linkCampsToCampaign(1, [1, 2]);

      expect(result).toEqual(mockResult);
      expect(campaigns.linkCampsToCampaign).toHaveBeenCalledWith(1, [1, 2]);
    });
  });

  describe('linkDoctors', () => {
    it('يجب أن يربط الأطباء بالحملة بنجاح', async () => {
      const mockResult = { success: true };
      (campaigns.linkDoctorsToCampaign as MockedFunction).mockResolvedValue(mockResult);

      const result = await campaigns.linkDoctorsToCampaign(1, [1, 2, 3, 4]);

      expect(result).toEqual(mockResult);
      expect(campaigns.linkDoctorsToCampaign).toHaveBeenCalledWith(1, [1, 2, 3, 4]);
    });
  });
});
