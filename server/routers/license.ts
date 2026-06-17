/**
 * License Router
 *
 * tRPC router for license information and management.
 * Provides APIs for clients to check license status and available features.
 *
 * @module license
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import {
  getHardwareId,
  validateLicense,
  isFeatureEnabled,
  getEnabledFeatures,
  licenseFileExists,
  type LicenseInfo,
} from '../_core/license';
import fs from 'fs';
import path from 'path';

/**
 * License router with public and protected procedures
 */
export const licenseRouter = router({
  /**
   * Get license information (public)
   * Returns current license status and hardware ID
   */
  getInfo: publicProcedure.query((): LicenseInfo => {
    try {
      return validateLicense();
    } catch (error) {
      // If license validation fails, return error info
      return {
        hardwareId: getHardwareId(),
        expiryDate: 0,
        features: [],
        issuedAt: 0,
        version: '1.0',
        isValid: false,
        validationMessage: error instanceof Error ? error.message : 'License validation failed',
      };
    }
  }),

  /**
   * Get hardware ID (public)
   * Returns the hardware ID for license generation
   */
  getHardwareId: publicProcedure.query(() => {
    try {
      const hardwareId = getHardwareId();
      return {
        hardwareId,
        success: true,
      };
    } catch (error) {
      return {
        hardwareId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get hardware ID',
      };
    }
  }),

  /**
   * Check if a feature is enabled (public)
   * Checks if a specific feature is available in the current license
   */
  checkFeature: publicProcedure.input(z.object({ feature: z.string() })).query(({ input }) => {
    try {
      const isEnabled = isFeatureEnabled(input.feature);
      return {
        feature: input.feature,
        enabled: isEnabled,
        success: true,
      };
    } catch (error) {
      return {
        feature: input.feature,
        enabled: false,
        success: false,
        error: error instanceof Error ? error.message : 'Feature check failed',
      };
    }
  }),

  /**
   * Get all enabled features (public)
   * Returns list of all features available in the current license
   */
  getFeatures: publicProcedure.query(() => {
    try {
      const features = getEnabledFeatures();
      return {
        features,
        count: features.length,
        success: true,
      };
    } catch (error) {
      return {
        features: [],
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get features',
      };
    }
  }),

  /**
   * Get license status with detailed information (protected)
   * Returns comprehensive license information for admin users
   */
  getStatus: protectedProcedure.query(() => {
    try {
      const licenseInfo = validateLicense();
      const currentHardwareId = getHardwareId();

      // Calculate days until expiry
      const currentTime = Math.floor(Date.now() / 1000);
      const daysUntilExpiry = Math.floor((licenseInfo.expiryDate - currentTime) / (24 * 60 * 60));

      return {
        ...licenseInfo,
        currentHardwareId,
        hardwareIdMatch: licenseInfo.hardwareId === currentHardwareId,
        daysUntilExpiry,
        expiryDateFormatted: new Date(licenseInfo.expiryDate * 1000).toISOString(),
        issuedAtFormatted: new Date(licenseInfo.issuedAt * 1000).toISOString(),
        status: licenseInfo.isValid ? 'active' : 'invalid',
      };
    } catch (error) {
      return {
        hardwareId: getHardwareId(),
        expiryDate: 0,
        features: [],
        issuedAt: 0,
        version: '1.0',
        isValid: false,
        validationMessage: error instanceof Error ? error.message : 'License validation failed',
        currentHardwareId: '',
        hardwareIdMatch: false,
        daysUntilExpiry: 0,
        expiryDateFormatted: '',
        issuedAtFormatted: '',
        status: 'invalid',
      };
    }
  }),

  /**
   * Check multiple features at once (protected)
   * Batch feature check for efficiency
   */
  checkFeatures: protectedProcedure
    .input(z.object({ features: z.array(z.string()) }))
    .query(({ input }) => {
      try {
        const results = input.features.map((feature) => ({
          feature,
          enabled: isFeatureEnabled(feature),
        }));

        return {
          results,
          count: results.filter((r) => r.enabled).length,
          total: results.length,
          success: true,
        };
      } catch (error) {
        return {
          results: [],
          count: 0,
          total: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Feature check failed',
        };
      }
    }),

  /**
   * Check if license file exists (public)
   * Used to determine if activation is needed
   */
  checkLicenseExists: publicProcedure.query(() => {
    try {
      const exists = licenseFileExists();
      return {
        exists,
        success: true,
      };
    } catch (error) {
      return {
        exists: false,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check license',
      };
    }
  }),

  /**
   * Save license file (public)
   * Used during activation to save the license
   */
  saveLicense: publicProcedure
    .input(
      z.object({
        key: z.string(),
        hardwareId: z.string(),
        expiryDate: z.string(),
        features: z.array(z.string()),
        issuedAt: z.string(),
        version: z.string(),
      })
    )
    .mutation(({ input }) => {
      try {
        const licensePath = path.join(process.cwd(), 'license.json');

        // Validate the license data
        if (!input.key || !input.hardwareId || !input.expiryDate || !input.features) {
          throw new Error('Invalid license data');
        }

        // Verify hardware ID matches current machine
        const currentHardwareId = getHardwareId();
        if (input.hardwareId !== currentHardwareId) {
          throw new Error(
            `Hardware ID mismatch. Expected: ${currentHardwareId}, Got: ${input.hardwareId}`
          );
        }

        // Save license file
        const licenseData = {
          key: input.key,
          hardwareId: input.hardwareId,
          expiryDate: input.expiryDate,
          features: input.features,
          issuedAt: input.issuedAt,
          version: input.version,
        };

        fs.writeFileSync(licensePath, JSON.stringify(licenseData, null, 2));

        // Validate the saved license
        const licenseInfo = validateLicense();

        return {
          success: true,
          licenseInfo,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to save license',
        };
      }
    }),
});
