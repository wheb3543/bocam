/**
 * Feature Middleware
 * 
 * tRPC middleware for feature flag validation based on license.
 * Protects API routes based on enabled features in the license.
 * 
 * Usage:
 *   .use(requireFeature('whatsapp'))
 *   .use(requireFeature(['whatsapp', 'reports']))
 * 
 * @module featureMiddleware
 */

import { TRPCError } from "@trpc/server";
import { isFeatureEnabled } from "./license";
import type { TrpcContext } from "./context";

/**
 * Feature requirement options
 */
export interface FeatureOptions {
  requireAll?: boolean; // If true, all features must be enabled (default: true)
  errorMessage?: string; // Custom error message
}

/**
 * Require a specific feature to be enabled
 * 
 * Creates middleware that checks if the specified feature(s) are enabled
 * in the current license. Throws error if feature is not enabled.
 * 
 * @param features - Single feature name or array of feature names
 * @param options - Configuration options
 * @returns tRPC middleware
 */
export const requireFeature = (
  features: string | string[],
  options: FeatureOptions = {}
) => {
  const featureArray = Array.isArray(features) ? features : [features];
  const { requireAll = true, errorMessage } = options;

  return async ({
    ctx,
    next,
  }: {
    ctx: TrpcContext;
    next: () => Promise<any>;
  }) => {
    if (requireAll) {
      // All features must be enabled
      const allEnabled = featureArray.every(feature => isFeatureEnabled(feature));
      
      if (!allEnabled) {
        const missingFeatures = featureArray.filter(f => !isFeatureEnabled(f));
        throw new TRPCError({
          code: "FORBIDDEN",
          message: errorMessage || `Feature(s) required but not enabled: ${missingFeatures.join(", ")}`,
        });
      }
    } else {
      // At least one feature must be enabled
      const anyEnabled = featureArray.some(feature => isFeatureEnabled(feature));
      
      if (!anyEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: errorMessage || `None of the required features are enabled: ${featureArray.join(", ")}`,
        });
      }
    }

    return next();
  };
};

/**
 * Require WhatsApp feature
 * Pre-configured middleware for WhatsApp feature
 */
export const requireWhatsAppFeature = () => requireFeature("whatsapp");

/**
 * Require Reports feature
 * Pre-configured middleware for Reports feature
 */
export const requireReportsFeature = () => requireFeature("reports");

/**
 * Require Patient Portal feature
 * Pre-configured middleware for Patient Portal feature
 */
export const requirePatientPortalFeature = () => requireFeature("patient_portal");

/**
 * Require Camps feature
 * Pre-configured middleware for Camps feature
 */
export const requireCampsFeature = () => requireFeature("camps");

/**
 * Require Offers feature
 * Pre-configured middleware for Offers feature
 */
export const requireOffersFeature = () => requireFeature("offers");

/**
 * Require Analytics feature
 * Pre-configured middleware for Analytics feature
 */
export const requireAnalyticsFeature = () => requireFeature("analytics");

/**
 * Require Appointments feature
 * Pre-configured middleware for Appointments feature
 */
export const requireAppointmentsFeature = () => requireFeature("appointments");

/**
 * Require All features
 * Middleware that requires all features to be enabled
 */
export const requireAllFeatures = () => requireFeature("*");

/**
 * Optional feature middleware
 * Does not throw error but adds feature status to context
 * 
 * @param features - Feature names to check
 * @returns tRPC middleware
 */
export const checkFeatures = (features: string[]) => {
  return async ({
    ctx,
    next,
  }: {
    ctx: TrpcContext;
    next: () => Promise<any>;
  }) => {
    const featureStatus = features.reduce((acc, feature) => {
      acc[feature] = isFeatureEnabled(feature);
      return acc;
    }, {} as Record<string, boolean>);

    return next({
      ctx: {
        ...ctx,
        features: featureStatus,
      },
    });
  };
};

/**
 * Admin bypass for features
 * Allows admin users to access features regardless of license
 * (Use with caution - only for development/debugging)
 * 
 * @param features - Required features
 * @param options - Configuration options
 * @returns tRPC middleware
 */
export const requireFeatureWithAdminBypass = (
  features: string | string[],
  options: FeatureOptions = {}
) => {
  const featureArray = Array.isArray(features) ? features : [features];
  const { requireAll = true, errorMessage } = options;

  return async ({
    ctx,
    next,
  }: {
    ctx: TrpcContext;
    next: () => Promise<any>;
  }) => {
    // Admin bypass
    if (ctx.user?.role === "admin") {
      return next();
    }

    if (requireAll) {
      const allEnabled = featureArray.every(feature => isFeatureEnabled(feature));
      
      if (!allEnabled) {
        const missingFeatures = featureArray.filter(f => !isFeatureEnabled(f));
        throw new TRPCError({
          code: "FORBIDDEN",
          message: errorMessage || `Feature(s) required but not enabled: ${missingFeatures.join(", ")}`,
        });
      }
    } else {
      const anyEnabled = featureArray.some(feature => isFeatureEnabled(feature));
      
      if (!anyEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: errorMessage || `None of the required features are enabled: ${featureArray.join(", ")}`,
        });
      }
    }

    return next();
  };
};