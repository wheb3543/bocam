---
trigger: always_on
description: Enforce ISO/IEC 25010 software quality characteristics tailored for the BOCAM healthcare platform
---
# ISO/IEC 25010 Software Quality Standards

# 1. Functional Suitability & Clinical Correctness
- Ensure all implemented features satisfy healthcare workflow requirements without edge-case regressions.
- Validate critical workflows: smart scheduling capacity limits, doctor availability, camp registrations, and omnichannel message routing.

# 2. Maintainability & Modularity
- Enforce strict separation of concerns across the 10 domain modules (`client/src/apps/admin/modules/` and `server/modules/`).
- Database modularity: keep domain table definitions isolated within `drizzle/schema/*.ts` with the unified bridge in `drizzle/schema.ts`.
- Guarantee backwards compatibility via re-export bridges when refactoring or migrating services.
- Testability: Co-locate domain unit and integration tests within their respective `__tests__/` directories.

# 3. Portability & Reliability
- Ensure full environment portability without hardcoded hosts or credentials.
- PWA & Offline Resilience: Leverage the dual service workers (`sw.js` and `admin/sw-admin.js` v3) with TTL caching for network resilience.
- Cross-platform responsiveness across modern mobile, tablet, and desktop environments.

# 4. Performance Efficiency
- Optimize database queries with proper indexes and avoid N+1 query patterns.
- Leverage Redis for hot data caching and BullMQ for asynchronous queue processing.
- Maintain fast frontend rendering using React 19 concurrent features and Vite build optimization.
