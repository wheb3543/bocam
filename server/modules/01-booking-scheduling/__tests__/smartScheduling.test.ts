/**
 * Smart Scheduling Service Unit Tests
 * اختبارات وحدة خدمة الجدولة الذكية والفترات الزمنية
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAvailableSlots,
  validateSlotAvailability,
  ensurePatientAccount,
} from '../../../services/schedulingService';
import * as databaseGuard from '../../../_core/databaseGuard';

vi.mock('../../../_core/databaseGuard');
vi.mock('../../../_core/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe('Smart Scheduling Service (خدمة الجدولة الذكية)', () => {
  let mockDb: any;
  let resultsQueue: any[];

  beforeEach(() => {
    vi.clearAllMocks();
    resultsQueue = [];

    mockDb = {
      select: vi.fn().mockImplementation(() => {
        const qb: any = {
          from: vi.fn().mockImplementation(() => qb),
          where: vi.fn().mockImplementation(() => qb),
          orderBy: vi.fn().mockImplementation(() => qb),
          limit: vi.fn().mockImplementation(() => {
            const res = resultsQueue.shift() ?? [];
            return Promise.resolve(res);
          }),
          then: (resolve: any, reject: any) => {
            const res = resultsQueue.shift() ?? [];
            return Promise.resolve(res).then(resolve, reject);
          },
        };
        return qb;
      }),
      insert: vi.fn().mockImplementation(() => ({
        values: vi.fn().mockImplementation(() => {
          const res = resultsQueue.shift() ?? [{ insertId: 1 }];
          return Promise.resolve(res);
        }),
      })),
      delete: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockImplementation(() => {
          const res = resultsQueue.shift() ?? [];
          return Promise.resolve(res);
        }),
      })),
    };

    vi.spyOn(databaseGuard, 'ensureDatabaseAvailable').mockResolvedValue(mockDb);
  });

  describe('getAvailableSlots (حساب الفترات الزمنية المتاحة)', () => {
    it('يرفض الطبيب غير المتاح للحجز (available = no)', async () => {
      // Doctor query
      resultsQueue.push([
        {
          id: 1,
          name: 'د. سامي',
          specialty: 'قلب',
          available: 'no',
          isVisiting: 'no',
        },
      ]);

      const result = await getAvailableSlots(1, '2026-10-01');
      expect(result.isWorking).toBe(false);
      expect(result.reason).toContain('غير متاح للحجوزات حالياً');
      expect(result.slots).toHaveLength(0);
    });

    it('يحجب المواعيد خارج فترة زيارة الطبيب الزائر (قبل البداية)', async () => {
      // Doctor query
      resultsQueue.push([
        {
          id: 2,
          name: 'د. خالد زائر',
          specialty: 'مخ وأعصاب',
          available: 'yes',
          isVisiting: 'yes',
          visitingStartDate: new Date('2026-10-10'),
          visitingEndDate: new Date('2026-10-20'),
        },
      ]);

      const result = await getAvailableSlots(2, '2026-10-05');
      expect(result.isWorking).toBe(false);
      expect(result.reason).toContain('قبل بداية فترة زيارة الطبيب الزائر');
    });

    it('يحجب المواعيد خارج فترة زيارة الطبيب الزائر (بعد النهاية)', async () => {
      // Doctor query
      resultsQueue.push([
        {
          id: 2,
          name: 'د. خالد زائر',
          specialty: 'مخ وأعصاب',
          available: 'yes',
          isVisiting: 'yes',
          visitingStartDate: new Date('2026-10-10'),
          visitingEndDate: new Date('2026-10-20'),
        },
      ]);

      const result = await getAvailableSlots(2, '2026-10-25');
      expect(result.isWorking).toBe(false);
      expect(result.reason).toContain('بعد انتهاء فترة زيارة الطبيب الزائر');
    });

    it('يحجب يوم الجمعة افتراضياً عند عدم وجود جدول مخصص (عطلة نهاية الأسبوع)', async () => {
      // 2026-10-16 is a Friday
      // 1. doctor
      resultsQueue.push([
        {
          id: 1,
          name: 'د. أحمد',
          specialty: 'باطنية',
          available: 'yes',
          isVisiting: 'no',
        },
      ]);
      // 2. exception
      resultsQueue.push([]);
      // 3. schedule
      resultsQueue.push([]);

      const result = await getAvailableSlots(1, '2026-10-16');
      expect(result.isWorking).toBe(false);
      expect(result.reason).toContain('عطلة نهاية الأسبوع (الجمعة)');
    });

    it('ينشئ فترات زمنية صباحية ومسائية افتراضية في الأيام العادية عند غياب جدول مخصص', async () => {
      // 2026-10-14 is a Wednesday (dayOfWeek = 3)
      // 1. doctor
      resultsQueue.push([
        {
          id: 1,
          name: 'د. أحمد',
          specialty: 'باطنية',
          available: 'yes',
          isVisiting: 'no',
        },
      ]);
      // 2. exception
      resultsQueue.push([]);
      // 3. schedule
      resultsQueue.push([]);
      // 4. activeBookings
      resultsQueue.push([]);

      const result = await getAvailableSlots(1, '2026-10-14');
      expect(result.isWorking).toBe(true);
      expect(result.slots.length).toBeGreaterThan(0);
      // Default: 09:00 to 13:00 with 30 min duration -> 8 slots
      expect(result.slots).toHaveLength(8);
      expect(result.slots[0].slotStartTime).toBe('09:00');
      expect(result.slots[0].slotEndTime).toBe('09:30');
      expect(result.slots[0].period).toBe('morning');
      expect(result.slots[0].isAvailable).toBe(true);
    });

    it('يحسب السعة المحجوزة ويعطل الفترة عند اكتمال الحجوزات', async () => {
      // 2026-10-14 is a Wednesday
      // 1. doctor
      resultsQueue.push([
        {
          id: 1,
          name: 'د. أحمد',
          specialty: 'باطنية',
          available: 'yes',
          isVisiting: 'no',
        },
      ]);
      // 2. exception
      resultsQueue.push([]);
      // 3. schedule
      resultsQueue.push([
        {
          doctorId: 1,
          dayOfWeek: 3,
          startTime: '10:00',
          endTime: '11:00',
          slotDurationMinutes: 30,
          maxCapacityPerSlot: 1,
          isActive: true,
        },
      ]);
      // 4. 1 active booking at 10:00
      resultsQueue.push([
        {
          id: 101,
          slotStartTime: '10:00',
          preferredDate: '2026-10-14',
          status: 'confirmed',
        },
      ]);

      const result = await getAvailableSlots(1, '2026-10-14');
      expect(result.isWorking).toBe(true);
      expect(result.slots).toHaveLength(2); // 10:00-10:30, 10:30-11:00

      // Slot 10:00 should be booked
      const slot1 = result.slots.find((s) => s.slotStartTime === '10:00');
      expect(slot1).toBeDefined();
      expect(slot1?.bookedCount).toBe(1);
      expect(slot1?.isAvailable).toBe(false);

      // Slot 10:30 should be available
      const slot2 = result.slots.find((s) => s.slotStartTime === '10:30');
      expect(slot2).toBeDefined();
      expect(slot2?.bookedCount).toBe(0);
      expect(slot2?.isAvailable).toBe(true);
    });
  });

  describe('validateSlotAvailability (التحقق من صحة وتوفر الفترة قبل الحفظ)', () => {
    it('يرفض وقتاً غير موجود ضمن فترات الطبيب', async () => {
      // 1. doctor
      resultsQueue.push([
        {
          id: 1,
          name: 'د. سارة',
          specialty: 'عيون',
          available: 'yes',
          isVisiting: 'no',
        },
      ]);
      // 2. exception
      resultsQueue.push([]);
      // 3. schedule
      resultsQueue.push([]);
      // 4. activeBookings
      resultsQueue.push([]);

      const validation = await validateSlotAvailability(1, '2026-10-14', '03:00');
      expect(validation.valid).toBe(false);
      expect(validation.message).toContain('خارج ساعات دوام الطبيب');
    });

    it('يقبل وقتاً متاحاً ويُرجع وقت نهاية الفترة', async () => {
      // 1. doctor
      resultsQueue.push([
        {
          id: 1,
          name: 'د. سارة',
          specialty: 'عيون',
          available: 'yes',
          isVisiting: 'no',
        },
      ]);
      // 2. exception
      resultsQueue.push([]);
      // 3. schedule
      resultsQueue.push([]);
      // 4. activeBookings
      resultsQueue.push([]);

      const validation = await validateSlotAvailability(1, '2026-10-14', '09:00');
      expect(validation.valid).toBe(true);
      expect(validation.slotEndTime).toBe('09:30');
    });
  });

  describe('ensurePatientAccount (الربط التلقائي بملف المريض)', () => {
    it('يعيد المريض المسجل مسبقاً برقم الهاتف دون إنشاء سجل مكرر', async () => {
      const existingPatient = {
        id: 42,
        phone: '967771234567',
        fullName: 'أحمد اليمني',
        isActive: true,
      };

      resultsQueue.push([existingPatient]);

      const patient = await ensurePatientAccount({
        phone: '+967 77 123 4567',
        fullName: 'أحمد اليمني',
      });

      expect(patient).toEqual(existingPatient);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('ينشئ ملف مريض جديد برقم هاتف موحد عند عدم وجوده مسبقاً', async () => {
      const newPatient = {
        id: 99,
        phone: '967711223344',
        fullName: 'مريض جديد',
        isActive: true,
      };

      // 1. Check existing -> empty
      resultsQueue.push([]);
      // 2. Insert result
      resultsQueue.push([{ insertId: 99 }]);
      // 3. Query newly created
      resultsQueue.push([newPatient]);

      const patient = await ensurePatientAccount({
        phone: '711223344',
        fullName: 'مريض جديد',
      });

      expect(patient).toEqual(newPatient);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });
});
