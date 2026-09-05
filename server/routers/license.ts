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
import {
  checkCentralFeatureRequest,
  checkCentralLicenseRequest,
  getCentralSupportTickets,
  getCentralLicenseConfiguration,
  getPendingCentralLicenseRequest,
  requestCentralFeatureActivation,
  requestCentralLicense,
  requestCentralSupportTicket,
} from '../_core/centralLicenseRequest';

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
   * Read the local state of the centrally managed license request.
   * Kept public because it is required before an administrator can sign in.
   */
  getCentralRequestState: publicProcedure.query(() => ({
    ...getCentralLicenseConfiguration(),
    pendingRequest: getPendingCentralLicenseRequest(),
  })),

  /**
   * Create one centrally managed activation request for this local instance.
   */
  requestCentralLicense: publicProcedure
    .input(
      z.object({
        instanceName: z.string().trim().min(2).max(160),
        serverUrl: z.string().trim().url().max(500),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return { success: true, ...(await requestCentralLicense(input)) };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'تعذر إرسال طلب الترخيص المركزي',
        };
      }
    }),

  requestCentralFeatureActivation: publicProcedure
    .input(
      z.object({
        featureKey: z
          .string()
          .trim()
          .min(2)
          .max(100)
          .regex(/^[A-Za-z0-9_-]+$/),
        instanceName: z.string().trim().min(2).max(160),
        serverUrl: z.string().trim().url().max(500),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return { success: true, ...(await requestCentralFeatureActivation(input)) };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'تعذر إرسال طلب تفعيل الميزة',
        };
      }
    }),

  requestCentralSupportTicket: protectedProcedure
    .input(
      z.object({
        subject: z.string().trim().min(4).max(255),
        content: z.string().trim().min(1).max(5000),
        priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
        attachments: z
          .array(
            z.object({
              fileName: z.string().trim().min(1).max(120),
              mimeType: z.enum(['image/png', 'image/jpeg', 'application/pdf', 'text/plain']),
              dataBase64: z
                .string()
                .regex(/^[A-Za-z0-9+/]+={0,2}$/)
                .max(700_000),
            })
          )
          .max(3)
          .default([]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return { success: true, ...(await requestCentralSupportTicket(input)) };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'تعذر إرسال طلب الدعم الفني',
        };
      }
    }),

  getCentralSupportTickets: protectedProcedure.query(async () => {
    try {
      return { success: true, tickets: await getCentralSupportTickets() };
    } catch (error) {
      return {
        success: false,
        tickets: [],
        error: error instanceof Error ? error.message : 'تعذر استرجاع تذاكر الدعم الفني',
      };
    }
  }),

  /**
   * Query the decision exactly when the operator chooses to check its state.
   */
  checkCentralLicenseStatus: publicProcedure.mutation(async () => {
    try {
      return { success: true, ...(await checkCentralLicenseRequest()) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'تعذر التحقق من حالة طلب الترخيص',
      };
    }
  }),

  checkCentralFeatureStatus: publicProcedure
    .input(
      z.object({
        featureKey: z
          .string()
          .trim()
          .min(2)
          .max(100)
          .regex(/^[A-Za-z0-9_-]+$/),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return { success: true, ...(await checkCentralFeatureRequest(input.featureKey)) };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'تعذر التحقق من حالة طلب تفعيل الميزة',
        };
      }
    }),
});
