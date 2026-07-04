---
trigger: manual
description: Enforce OWASP security standards, strict error handling, and runtime reliability
---
# Security Standards (OWASP Top 10)
- Enforce strict data validation, sanitization, and secure handling of all user inputs to prevent vulnerabilities (e.g., Injection, XSS, CSRF).
- Never hardcode API keys, tokens, secrets, or sensitive credentials; always utilize secure environment variables (.env).

# Reliability & Error Handling
- Implement robust, multi-layer error handling (try/catch blocks, error boundaries) and ensure meaningful, descriptive logging.
- Handle all potential edge cases, null, undefined, or empty states gracefully to prevent application crashes and unexpected downtime.

# Project Integrity & Constraints
- Never install, import, or introduce new external packages, libraries, or dependencies without explicit user permission.
- Ensure all UI components are fully accessible (WAI-ARIA standards) and 100% responsive across all mobile, tablet, and desktop screens.
