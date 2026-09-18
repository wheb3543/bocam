---
trigger: always_on
description: Enforce healthcare data privacy, OWASP standards, strict schema validation, and runtime reliability
---
# Healthcare Data Privacy & Security (PHI & OWASP Top 10)
- Enforce strict data validation, sanitization, and secure handling of all user inputs to prevent vulnerabilities (Injection, XSS, CSRF, SSRF).
- Protected Health Information (PHI) Safeguards: Never print, log, or expose patient identifiers, phone numbers, medical records, or clinical notes in application logs or console output.
- Never hardcode API keys, secrets, or access tokens; strictly utilize environment variables managed via `.env` and verified via `scripts/qa/check-env.mjs`.
- Always enforce strict Zod schemas on all tRPC procedures, REST routes, and incoming webhook payloads (WhatsApp, Meta).

# Reliability & Error Handling
- Implement robust, multi-layer error handling (try/catch blocks, ErrorBoundary components in React) with structured, contextual logging.
- Handle all potential edge cases, null, undefined, and empty states gracefully to prevent crashes and unexpected downtime.
- Cache Invalidation: Ensure Redis cache keys are properly invalidated upon any entity mutation to prevent stale data or phantom booking availability.

# Project Integrity & Constraints
- Never install, import, or introduce new external packages, libraries, or dependencies without explicit user permission.
- Always use `pnpm` exclusively when managing packages.
- Ensure all UI components are fully accessible (WAI-ARIA standards) and 100% responsive across mobile, tablet, and desktop viewports.
