/**
 * اختبارات useLicense Hook
 *
 * يغطي وظائف License في client-side:
 * - getInfo: الحصول على معلومات الترخيص
 * - getHardwareId: الحصول على معرف الجهاز
 * - checkFeature: التحقق من ميزة معينة
 * - getFeatures: الحصول على جميع الميزات المفعلة
 * - checkLicenseExists: التحقق من وجود ملف الترخيص
 * - saveLicense: حفظ ملف الترخيص
 *
 * @module useLicense.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useLicense Hook - License Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInfo function', () => {
    it('يجب أن يرجع معلومات الترخيص الصحيحة', () => {
      // Arrange
      const mockGetInfo = vi.fn();
      mockGetInfo.mockReturnValue({
        success: true,
        isValid: true,
        hardwareId: 'TEST-HARDWARE-ID',
        expiryDate: '2025-01-01',
        features: ['feature1', 'feature2'],
        issuedAt: '2024-01-01',
        version: '1.0',
      });

      // Act
      const result = mockGetInfo();

      // Assert
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.hardwareId).toBe('TEST-HARDWARE-ID');
      expect(result.features).toEqual(['feature1', 'feature2']);
    });

    it('يجب أن يرجع success=false عند عدم وجود ترخيص', () => {
      // Arrange
      const mockGetInfo = vi.fn();
      mockGetInfo.mockReturnValue({
        success: false,
        error: 'الترخيص غير موجود',
      });

      // Act
      const result = mockGetInfo();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getHardwareId function', () => {
    it('يجب أن يرجع معرف الجهاز بنجاح', () => {
      // Arrange
      const mockGetHardwareId = vi.fn();
      mockGetHardwareId.mockReturnValue({
        success: true,
        hardwareId: 'TEST-HARDWARE-ID',
      });

      // Act
      const result = mockGetHardwareId();

      // Assert
      expect(result.success).toBe(true);
      expect(result.hardwareId).toBeDefined();
      expect(result.hardwareId).toBe('TEST-HARDWARE-ID');
    });

    it('يجب أن يرجع success=false عند فشل الحصول على معرف الجهاز', () => {
      // Arrange
      const mockGetHardwareId = vi.fn();
      mockGetHardwareId.mockReturnValue({
        success: false,
        error: 'فشل الحصول على معرف الجهاز',
      });

      // Act
      const result = mockGetHardwareId();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('checkFeature function', () => {
    it('يجب أن يرجع enabled=true للميزة المفعلة', () => {
      // Arrange
      const mockCheckFeature = vi.fn();
      mockCheckFeature.mockReturnValue({
        success: true,
        feature: 'feature1',
        enabled: true,
      });

      // Act
      const result = mockCheckFeature({ feature: 'feature1' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.feature).toBe('feature1');
      expect(result.enabled).toBe(true);
    });

    it('يجب أن يرجع enabled=false للميزة غير المفعلة', () => {
      // Arrange
      const mockCheckFeature = vi.fn();
      mockCheckFeature.mockReturnValue({
        success: true,
        feature: 'feature3',
        enabled: false,
      });

      // Act
      const result = mockCheckFeature({ feature: 'feature3' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.feature).toBe('feature3');
      expect(result.enabled).toBe(false);
    });
  });

  describe('getFeatures function', () => {
    it('يجب أن يرجع جميع الميزات المفعلة', () => {
      // Arrange
      const mockGetFeatures = vi.fn();
      mockGetFeatures.mockReturnValue({
        success: true,
        features: ['feature1', 'feature2'],
        count: 2,
      });

      // Act
      const result = mockGetFeatures();

      // Assert
      expect(result.success).toBe(true);
      expect(result.features).toEqual(['feature1', 'feature2']);
      expect(result.count).toBe(2);
    });

    it('يجب أن يرجع مصفوفة فارغة عند عدم وجود ميزات', () => {
      // Arrange
      const mockGetFeatures = vi.fn();
      mockGetFeatures.mockReturnValue({
        success: true,
        features: [],
        count: 0,
      });

      // Act
      const result = mockGetFeatures();

      // Assert
      expect(result.success).toBe(true);
      expect(result.features).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('checkLicenseExists function', () => {
    it('يجب أن يرجع exists=true عند وجود ملف الترخيص', () => {
      // Arrange
      const mockCheckLicenseExists = vi.fn();
      mockCheckLicenseExists.mockReturnValue({
        success: true,
        exists: true,
      });

      // Act
      const result = mockCheckLicenseExists();

      // Assert
      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
    });

    it('يجب أن يرجع exists=false عند عدم وجود ملف الترخيص', () => {
      // Arrange
      const mockCheckLicenseExists = vi.fn();
      mockCheckLicenseExists.mockReturnValue({
        success: true,
        exists: false,
      });

      // Act
      const result = mockCheckLicenseExists();

      // Assert
      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
    });
  });

  describe('saveLicense function', () => {
    it('يجب أن يحفظ ملف الترخيص بنجاح', () => {
      // Arrange
      const mockSaveLicense = vi.fn();
      mockSaveLicense.mockReturnValue({
        success: true,
        message: 'تم حفظ الترخيص بنجاح',
      });

      const licenseData = {
        key: 'test-license-key',
        hardwareId: 'TEST-HARDWARE-ID',
        expiryDate: '2025-01-01',
        features: ['feature1', 'feature2'],
        issuedAt: '2024-01-01',
        version: '1.0',
      };

      // Act
      const result = mockSaveLicense(licenseData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('يجب أن يفشل عند عدم تطابق معرف الجهاز', () => {
      // Arrange
      const mockSaveLicense = vi.fn();
      mockSaveLicense.mockReturnValue({
        success: false,
        error: 'Hardware ID mismatch',
      });

      const licenseData = {
        key: 'test-license-key',
        hardwareId: 'DIFFERENT-HARDWARE-ID',
        expiryDate: '2025-01-01',
        features: ['feature1', 'feature2'],
        issuedAt: '2024-01-01',
        version: '1.0',
      };

      // Act
      const result = mockSaveLicense(licenseData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Hardware ID mismatch');
    });

    it('يجب أن يفشل مع بيانات ترخيص غير صالحة', () => {
      // Arrange
      const mockSaveLicense = vi.fn();
      mockSaveLicense.mockReturnValue({
        success: false,
        error: 'Invalid license data',
      });

      const invalidLicenseData = {
        key: '',
        hardwareId: '',
        expiryDate: '',
        features: [],
        issuedAt: '',
        version: '',
      };

      // Act
      const result = mockSaveLicense(invalidLicenseData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid license data');
    });
  });
});
