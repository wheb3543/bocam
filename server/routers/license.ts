/**
 * License Router
 * 
 * tRPC router for license information and management.
 * Provides APIs for clients to check license status and available features.
 * 
 * @module license
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getHardwareId,
  validateLicense,
  isFeatureEnabled,
  getEnabledFeatures,
  type LicenseInfo,
} from "../_core/license";

/**
 * License router with public and protected procedures
 */
export const licenseRouter = router({
  /**
   * Get license information (public)
   * Returns current license status and hardware ID
   */
  getInfo: protectedProcedure.query((): LicenseInfo => {
    try {
      return validateLicense();
    } catch (error) {
      // If license validation fails, return error info
      return {
        hardwareId: getHardwareId(),
        expiryDate: 0,
        features: [],
        issuedAt: 0,
        version: "1.0",
        isValid: false,
        validationMessage: error instanceof Error ? error.message : "License validation failed",
      };
    }
  }),

  /**
   * Get hardware ID (public)
   * Returns the hardware ID for license generation
   */
  getHardwareId: protectedProcedure.query(() => {
    try {
      const hardwareId = getHardwareId();
      return {
        hardwareId,
        success: true,
      };
    } catch (error) {
      return {
        hardwareId: "",
        success: false,
        error: error instanceof Error ? error.message : "Failed to get hardware ID",
      };
    }
  }),

  /**
   * Check if a feature is enabled (public)
   * Checks if a specific feature is available in the current license
   */
  checkFeature: protectedProcedure
    .input(z.object({ feature: z.string() }))
    .query(({ input }) => {
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
          error: error instanceof Error ? error.message : "Feature check failed",
        };
      }
    }),

  /**
   * Get all enabled features (public)
   * Returns list of all features available in the current license
   */
  getFeatures: protectedProcedure.query(() => {
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
        error: error instanceof Error ? error.message : "Failed to get features",
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
        status: licenseInfo.isValid ? "active" : "invalid",
      };
    } catch (error) {
      return {
        hardwareId: getHardwareId(),
        expiryDate: 0,
        features: [],
        issuedAt: 0,
        version: "1.0",
        isValid: false,
        validationMessage: error instanceof Error ? error.message : "License validation failed",
        currentHardwareId: "",
        hardwareIdMatch: false,
        daysUntilExpiry: 0,
        expiryDateFormatted: "",
        issuedAtFormatted: "",
        status: "invalid",
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
        const results = input.features.map(feature => ({
          feature,
          enabled: isFeatureEnabled(feature),
        }));
        
        return {
          results,
          count: results.filter(r => r.enabled).length,
          total: results.length,
          success: true,
        };
      } catch (error) {
        return {
          results: [],
          count: 0,
          total: 0,
          success: false,
          error: error instanceof Error ? error.message : "Feature check failed",
        };
      }
    }),
});