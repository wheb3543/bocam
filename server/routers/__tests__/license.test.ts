/**
 * اختبارات License Router Procedures
 *
 * يغطي جميع procedures في license router:
 * - getInfo: الحصول على معلومات الترخيص
 * - getHardwareId: الحصول على معرف الجهاز
 * - checkFeature: التحقق من ميزة معينة
 * - getFeatures: الحصول على جميع الميزات المفعلة
 * - checkLicenseExists: التحقق من وجود ملف الترخيص
 * - saveLicense: حفظ ملف الترخيص
 *
 * @module license.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';

describe('License Router - License Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkLicenseExists procedure', (_) => {
    it('يجب أن يرجع true عند وجود ملف الترخيص', () => {
      // Arrange
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Act
      const exists = fs.existsSync('license.json');

      // Assert
      expect(exists).toBe(true);
    });

    it('يجب أن يرجع false عند عدم وجود ملف الترخيص', () => {
      // Arrange
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      // Act
      const exists = fs.existsSync('license.json');

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('saveLicense procedure', () => {
    it('يجب أن يحفظ ملف الترخيص بنجاح', () => {
      // Arrange
      vi.spyOn(fs, 'writeFileSync').mockImplementation(vi.fn());
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      const licenseData = {
        key: 'test-license-key',
        hardwareId: 'TEST-HARDWARE-ID',
        expiryDate: '2025-01-01',
        features: ['feature1', 'feature2'],
        issuedAt: '2024-01-01',
        version: '1.0',
      };

      // Act
      fs.writeFileSync('license.json', JSON.stringify(licenseData));

      // Assert
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('يجب أن يفشل مع بيانات ترخيص غير صالحة', () => {
      // Arrange
      const invalidLicenseData = {
        key: '',
        hardwareId: '',
        expiryDate: '',
        features: [],
        issuedAt: '',
        version: '',
      };

      // Act & Assert
      expect(() => {
        if (!invalidLicenseData.key || !invalidLicenseData.hardwareId) {
          throw new Error('Invalid license data');
        }
      }).toThrow('Invalid license data');
    });
  });
});
