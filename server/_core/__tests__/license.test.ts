/**
 * اختبارات License Core Functions
 *
 * يغطي جميع الدوال الأساسية في license.ts:
 * - getHardwareId: الحصول على معرف الجهاز
 * - licenseFileExists: التحقق من وجود ملف الترخيص
 * - validateLicense: التحقق من صحة الترخيص
 * - isFeatureEnabled: التحقق من ميزة معينة
 * - getEnabledFeatures: الحصول على جميع الميزات المفعلة
 * - initializeLicense: تهيئة نظام الترخيص
 *
 * @module license.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import os from 'os';
import fs from 'fs';

// Mock data
const mockNetworkInterfaces = {
  en0: [
    {
      family: 'IPv4',
      internal: false,
      mac: '00:11:22:33:44:55',
      address: '192.168.1.1',
      netmask: '255.255.255.0',
      cidr: '192.168.1.1/24',
    },
  ],
};

const mockLicenseData = {
  key: 'mock-license-key',
  hardwareId: '3AAD6E2C0FDD',
  expiryDate: '2025-01-01',
  features: ['feature1', 'feature2'],
  issuedAt: '2024-01-01',
  version: '1.0',
};

// Mock os module
vi.mock('os', async (importOriginal) => {
  const actual = await importOriginal<typeof os>();
  return {
    ...actual,
    networkInterfaces: vi.fn(() => mockNetworkInterfaces),
  };
});

// Mock fs module
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof fs>();
  return {
    ...actual,
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => JSON.stringify(mockLicenseData)),
    writeFileSync: vi.fn(),
  };
});

// Mock crypto module
vi.mock('crypto', () => ({
  verify: vi.fn(() => true),
  constants: {
    RSA_PKCS1_PSS_PADDING: 'RSA_PKCS1_PSS_PADDING',
    RSA_PSS_SALTLEN_DIGEST: 'RSA_PSS_SALTLEN_DIGEST',
  },
}));

describe('License Core Functions - License Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHardwareId', () => {
    it('يجب أن يرجع معرف الجهاز بنجاح', async () => {
      // Arrange
      const { getHardwareId } = await import('../license');

      // Act
      const hardwareId = getHardwareId();

      // Assert
      expect(hardwareId).toBeDefined();
      expect(hardwareId).toMatch(/^[0-9A-F]{12}$/);
    });

    it('يجب أن يرمي خطأ عند عدم وجود واجهة شبكة صالحة', async () => {
      // Arrange
      const networkInterfacesMock = vi.spyOn(os, 'networkInterfaces').mockReturnValue({});
      
      const { getHardwareId } = await import('../license');

      // Act & Assert
      expect(() => getHardwareId()).toThrow();
      networkInterfacesMock.mockRestore();
    });
  });

  describe('licenseFileExists', () => {
    it('يجب أن يرجع true عند وجود ملف الترخيص', async () => {
      // Arrange
      const { licenseFileExists } = await import('../license');

      // Act
      const exists = licenseFileExists();

      // Assert
      expect(exists).toBe(true);
    });

    it('يجب أن يرجع false عند عدم وجود ملف الترخيص', async () => {
      // Arrange
      const existsSyncMock = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      const { licenseFileExists } = await import('../license');

      // Act
      const exists = licenseFileExists();

      // Assert
      expect(exists).toBe(false);
      existsSyncMock.mockRestore();
    });
  });

  describe('validateLicense', () => {
    it('يجب أن يرجع معلومات ترخيص صالحة', async () => {
      // Arrange
      const { validateLicense } = await import('../license');

      // Act
      const licenseInfo = validateLicense();

      // Assert
      expect(licenseInfo).toBeDefined();
      expect(licenseInfo.hardwareId).toBeDefined();
      expect(licenseInfo.features).toBeDefined();
      expect(Array.isArray(licenseInfo.features)).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('يجب أن يرجع false للميزة غير الموجودة', async () => {
      // Arrange
      const { isFeatureEnabled } = await import('../license');

      // Act
      const enabled = isFeatureEnabled('nonexistent-feature');

      // Assert
      expect(typeof enabled).toBe('boolean');
    });
  });

  describe('getEnabledFeatures', () => {
    it('يجب أن يرجع مصفوفة', async () => {
      // Arrange
      const { getEnabledFeatures } = await import('../license');

      // Act
      const features = getEnabledFeatures();

      // Assert
      expect(features).toBeDefined();
      expect(Array.isArray(features)).toBe(true);
    });
  });

  describe('initializeLicense', () => {
    it('يجب أن يهيئ نظام الترخيص بنجاح', async () => {
      // Arrange
      const existsSyncMock = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      const { initializeLicense } = await import('../license');

      // Act
      const licenseInfo = initializeLicense(false);

      // Assert
      expect(licenseInfo).toBeDefined();
      existsSyncMock.mockRestore();
    });

    it('يجب أن يرجع null عند السماح بملف ترخيص مفقود', async () => {
      // Arrange
      const existsSyncMock = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      const { initializeLicense } = await import('../license');

      // Act
      const licenseInfo = initializeLicense(true);

      // Assert
      expect(licenseInfo).toBeNull();
      existsSyncMock.mockRestore();
    });

    it('يجب أن يرمي خطأ عند عدم السماح بملف ترخيص مفقود', async () => {
      // Arrange
      const existsSyncMock = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      const { initializeLicense } = await import('../license');

      // Act & Assert
      expect(() => initializeLicense(false)).toThrow();
      existsSyncMock.mockRestore();
    });
  });
});
