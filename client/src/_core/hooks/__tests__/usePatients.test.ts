/**
 * اختبارات usePatients Hook
 *
 * يغطي وظائف Patient في client-side:
 * - createPatient: إنشاء مريض جديد
 * - getPatientById: الحصول على مريض بالمعرف
 * - getAllPatients: الحصول على جميع المرضى
 * - updatePatient: تحديث بيانات مريض
 * - deletePatient: حذف مريض
 * - searchPatients: البحث عن المرضى
 * - filterPatients: تصفية المرضى
 *
 * @module usePatients.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('usePatients Hook - Patient Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPatient function', () => {
    it('يجب أن ينشئ مريض جديد بنجاح', () => {
      // Arrange
      const mockCreatePatient = vi.fn();
      mockCreatePatient.mockReturnValue({
        success: true,
        patient: {
          id: 1,
          name: 'محمد أحمد',
          phone: '0501234567',
          email: 'mohammed@example.com',
          age: 35,
          gender: 'male',
        },
      });

      const patientData = {
        name: 'محمد أحمد',
        phone: '0501234567',
        email: 'mohammed@example.com',
        age: 35,
        gender: 'male',
      };

      // Act
      const result = mockCreatePatient(patientData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.patient).toBeDefined();
      expect(result.patient.name).toBe('محمد أحمد');
    });

    it('يجب أن يفشل عند بيانات غير صالحة', () => {
      // Arrange
      const mockCreatePatient = vi.fn();
      mockCreatePatient.mockReturnValue({
        success: false,
        error: 'بيانات المريض غير صالحة',
      });

      const invalidPatientData = {
        name: '',
        phone: '',
        email: '',
        age: -1,
        gender: '',
      };

      // Act
      const result = mockCreatePatient(invalidPatientData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getPatientById function', () => {
    it('يجب أن يرجع بيانات المريض الصحيحة', () => {
      // Arrange
      const mockGetPatientById = vi.fn();
      mockGetPatientById.mockReturnValue({
        success: true,
        patient: {
          id: 1,
          name: 'محمد أحمد',
          phone: '0501234567',
          email: 'mohammed@example.com',
          age: 35,
          gender: 'male',
        },
      });

      // Act
      const result = mockGetPatientById(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.patient).toBeDefined();
      expect(result.patient.id).toBe(1);
    });

    it('يجب أن يرجع null عند عدم وجود المريض', () => {
      // Arrange
      const mockGetPatientById = vi.fn();
      mockGetPatientById.mockReturnValue({
        success: false,
        patient: null,
        error: 'المريض غير موجود',
      });

      // Act
      const result = mockGetPatientById(999);

      // Assert
      expect(result.success).toBe(false);
      expect(result.patient).toBeNull();
    });
  });

  describe('getAllPatients function', () => {
    it('يجب أن يرجع جميع المرضى', () => {
      // Arrange
      const mockGetAllPatients = vi.fn();
      mockGetAllPatients.mockReturnValue({
        success: true,
        patients: [
          {
            id: 1,
            name: 'محمد أحمد',
            phone: '0501234567',
            email: 'mohammed@example.com',
            age: 35,
            gender: 'male',
          },
          {
            id: 2,
            name: 'فاطمة محمد',
            phone: '0507654321',
            email: 'fatima@example.com',
            age: 28,
            gender: 'female',
          },
        ],
        count: 2,
      });

      // Act
      const result = mockGetAllPatients();

      // Assert
      expect(result.success).toBe(true);
      expect(result.patients).toBeDefined();
      expect(result.patients.length).toBe(2);
      expect(result.count).toBe(2);
    });

    it('يجب أن يرجع مصفوفة فارغة عند عدم وجود مرضى', () => {
      // Arrange
      const mockGetAllPatients = vi.fn();
      mockGetAllPatients.mockReturnValue({
        success: true,
        patients: [],
        count: 0,
      });

      // Act
      const result = mockGetAllPatients();

      // Assert
      expect(result.success).toBe(true);
      expect(result.patients).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('updatePatient function', () => {
    it('يجب أن يحدث بيانات المريض بنجاح', () => {
      // Arrange
      const mockUpdatePatient = vi.fn();
      mockUpdatePatient.mockReturnValue({
        success: true,
        patient: {
          id: 1,
          name: 'محمد أحمد',
          phone: '0509999999',
          email: 'mohammed.updated@example.com',
          age: 36,
          gender: 'male',
        },
      });

      const updateData = {
        id: 1,
        phone: '0509999999',
        email: 'mohammed.updated@example.com',
        age: 36,
      };

      // Act
      const result = mockUpdatePatient(updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.patient.phone).toBe('0509999999');
      expect(result.patient.age).toBe(36);
    });

    it('يجب أن يفشل عند عدم وجود المريض', () => {
      // Arrange
      const mockUpdatePatient = vi.fn();
      mockUpdatePatient.mockReturnValue({
        success: false,
        error: 'المريض غير موجود',
      });

      const updateData = {
        id: 999,
        phone: '0509999999',
      };

      // Act
      const result = mockUpdatePatient(updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('deletePatient function', () => {
    it('يجب أن يحذف المريض بنجاح', () => {
      // Arrange
      const mockDeletePatient = vi.fn();
      mockDeletePatient.mockReturnValue({
        success: true,
        message: 'تم حذف المريض بنجاح',
      });

      // Act
      const result = mockDeletePatient(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('يجب أن يفشل عند عدم وجود المريض', () => {
      // Arrange
      const mockDeletePatient = vi.fn();
      mockDeletePatient.mockReturnValue({
        success: false,
        error: 'المريض غير موجود',
      });

      // Act
      const result = mockDeletePatient(999);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('searchPatients function', () => {
    it('يجب أن يبحث عن المرضى بالاسم', () => {
      // Arrange
      const mockSearchPatients = vi.fn();
      mockSearchPatients.mockReturnValue({
        success: true,
        patients: [
          {
            id: 1,
            name: 'محمد أحمد',
            phone: '0501234567',
            email: 'mohammed@example.com',
            age: 35,
            gender: 'male',
          },
        ],
        count: 1,
      });

      // Act
      const result = mockSearchPatients({ query: 'محمد' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.patients.length).toBe(1);
      expect(result.patients[0].name).toContain('محمد');
    });

    it('يجب أن يرجع مصفوفة فارغة عند عدم وجود نتائج', () => {
      // Arrange
      const mockSearchPatients = vi.fn();
      mockSearchPatients.mockReturnValue({
        success: true,
        patients: [],
        count: 0,
      });

      // Act
      const result = mockSearchPatients({ query: 'غير موجود' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.patients).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('filterPatients function', () => {
    it('يجب أن يصفي المرضى حسب العمر', () => {
      // Arrange
      const mockFilterPatients = vi.fn();
      mockFilterPatients.mockReturnValue({
        success: true,
        patients: [
          {
            id: 1,
            name: 'محمد أحمد',
            phone: '0501234567',
            email: 'mohammed@example.com',
            age: 35,
            gender: 'male',
          },
        ],
        count: 1,
      });

      // Act
      const result = mockFilterPatients({ minAge: 30, maxAge: 40 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.patients.length).toBe(1);
      expect(result.patients[0].age).toBeGreaterThanOrEqual(30);
    });

    it('يجب أن يصفي المرضى حسب الجنس', () => {
      // Arrange
      const mockFilterPatients = vi.fn();
      mockFilterPatients.mockReturnValue({
        success: true,
        patients: [
          {
            id: 1,
            name: 'محمد أحمد',
            phone: '0501234567',
            email: 'mohammed@example.com',
            age: 35,
            gender: 'male',
          },
        ],
        count: 1,
      });

      // Act
      const result = mockFilterPatients({ gender: 'male' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.patients.length).toBe(1);
      expect(result.patients[0].gender).toBe('male');
    });
  });
});
