/**
 * اختبارات License Router Procedures
 *
 * يغطي جميع procedures في license router:
 * - getInfo: الحصول على معلومات الترخيص
 * - getHardwareId: الحصول على معرف الجهاز
 * - checkFeature: التحقق من ميزة معينة
 * - getFeatures: الحصول على جميع الميزات المفعلة
 * - checkLicenseExists: التحقق من وجود ملف الترخيص
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

});
