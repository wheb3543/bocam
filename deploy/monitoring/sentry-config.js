// Sentry Configuration for BOCAM CRM Platform
// This file configures Sentry for error tracking and performance monitoring

import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN || "", // Set your Sentry DSN in .env
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for sessions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Release
  release: process.env.APP_VERSION || "1.0.0",

  // Integrations
  integrations: [
    // HTTP tracing
    new Sentry.HttpIntegration({
      tracing: true,
    }),
    // Express integration
    new Tracing.Integrations.Express({
      app: require("express")(),
    }),
    // Performance monitoring
    new Tracing.Integrations.Mongo(),
  ],

  // Before send for filtering
  beforeSend(event, hint) {
    // Filter out certain errors if needed
    if (event.exception) {
      const error = hint.originalException;
      // Example: Ignore 404 errors
      if (error && error.message && error.message.includes("404")) {
        return null;
      }
    }
    return event;
  },

  // User context
  beforeSend(event) {
    // Add user context if available
    if (event.request) {
      event.tags = {
        ...event.tags,
        url: event.request.url,
        method: event.request.method,
      };
    }
    return event;
  },

  // Performance monitoring
  // Performance monitoring is enabled by default
  // You can customize it here

  // Profiling
  profilesSampleRate: 1.0, // Profiling sample rate

  // Request headers
  requestHeaders: true,
  requestPayload: true,

  // Server name
  serverName: process.env.SERVER_NAME || "bocam-crm-server",
});

// Export Sentry for use in other files
export { Sentry };

// Helper function to capture exceptions
export function captureException(error: Error, context?: any) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Helper function to capture messages
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, {
    level,
  });
}

// Helper function to set user context
export function setUserContext(user: any) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

// Helper function to clear user context
export function clearUserContext() {
  Sentry.setUser(null);
}

// Helper function to add breadcrumb
export function addBreadcrumb(category: string, message: string, level?: Sentry.SeverityLevel) {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
  });
}

// Express middleware for error tracking
export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}

// Express middleware for request tracing
export function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}

// Express middleware for tracing
export function sentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}
