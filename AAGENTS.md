# AGENTS.md

## System: BOCAM (بُوكَام) Healthcare Platform
An integrated enterprise healthcare platform comprising 5 core functional subsystems:
- **[B] Booking & Smart Scheduling**: Smart scheduling, clinic capacity control, doctor shifts, and medical field camps.
- **[O] Omni-channel Inbox**: Unified messaging inbox aggregating WhatsApp, Facebook, Instagram, Telegram, and SMS.
- **[C] Customer Relationship & Patient Portal**: Healthcare CRM paired with a digital patient portal for medical records (EMR), lab results, and radiology reports.
- **[A] Automated CMS**: Institutional healthcare portal, published medical services, and automated educational health blog.
- **[M] Media Social & Tasks**: Social media publishing hub combined with multi-department administrative task assignment, tracking, and staff performance evaluation.

---

## Stack & Structure

### 1. Frontend (`client/src/`)
React 19 + TypeScript 5.9 + Tailwind CSS 4 in a 3-tier modular architecture:
- **Core Foundation (`@core/*`)**: UI primitives, feedback components, contexts, hooks, animations, system pages, dual PWA service workers (`sw.js` and `admin/sw-admin.js` with v3 cache & TTL security), and common utilities.
- **Functional Portals (`@apps/*`)**: 4 standalone portals: `public/`, `patient-portal/`, `doctor-portal/`, and `admin/`.
- **Admin Subsystem (`@apps/admin/modules/`)**: 10 cohesive domain modules (01 to 10) with co-located components, embedded reports, and domain settings.

### 2. Backend (`server/`)
Express + tRPC 11, Drizzle ORM (`drizzle/schema/`), MySQL/TiDB, Redis caching & BullMQ queues in a symmetrical modular architecture:
- **Core Runtime (`server/_core/`)**: Express server, tRPC engines, DatabaseGuard, Structured Logger, and Rate Limiters.
- **Autonomous Subsystems (`server/subsystems/`)**: Independent subsystems: `backup/`, `auto-update/`, and `licensing/`.
- **Domain Modules (`server/modules/`)**: 8 cohesive domain modules (01 to 10) matching the frontend admin subsystems, with co-located routers, localized domain services (e.g. notifications), and localized unit tests (`__tests__/`).
- **API Endpoints (`server/api/`)**: Categorized endpoints: `cron/`, `webhooks/`, `oauth/`, `meta/`, and `upload/`.
- **Infrastructure Layers**:
  - `server/database/`: Drizzle client, repositories, and bootstrap SQL migrations governance (`server/database/migrations/README.md`).
  - `server/integrations/`: Meta Graph API, WhatsApp Cloud API, and SSE event streaming.
  - `server/services/`: Cross-cutting caching, unified notification policy, and backwards-compatible re-export bridges.

### 3. Database Modular Schema (`drizzle/`)
- **Domain Schemas (`drizzle/schema/*.ts`)**: 10 modular domain schema files encompassing 116 validated tables.
- **Central Re-export Bridge (`drizzle/schema.ts`)**: Unified entry point guaranteeing 100% backward compatibility for all imports.
- **Official Migrations (`drizzle/migrations/`)**: Drizzle ORM migrations layer.

### 4. Centralized Scripts Directory (`scripts/`)
Organized functionally into 5 dedicated directories:
- `scripts/seed/`: Data seeding and initial mock content (`seedContentDirect.ts`, `seed-admin.ts`, etc.).
- `scripts/database/`: Database schema validation and migration runners (`check-migration-schema.mjs`, `runMigration.ts`).
- `scripts/qa/`: Quality assurance, environment checking, and documentation validators (`check-env.mjs`, `validate-documentation-registry.mjs`).
- `scripts/admin/`: Operational management and hardware licensing (`get-hardware-id.ts`).
- `scripts/release/`: Packaging, building, and deployment release tools.

### 5. Unified Testing Workspace (`testing/`)
- `testing/utils/`: Test helpers (`test-utils.tsx`, `test-db.ts`, `test-seed.ts`, `test-cleanup.ts`).
- `testing/mocks/`: Centralized test fixtures and mock handlers (`data.ts`, `handlers.ts`, `trpc.ts`).
- `testing/manual/`: Isolated manual verification tools and prototypes (`manual/test-admin.html`).

### 6. Operational Environment & Tooling
- Node `>=22.13.0` | Package manager: `pnpm` only (do NOT use npm or yarn).
- Primary Communication Language: Arabic (العربية الفصحى) for all explanations, analysis, chat messages, and summaries.
- Docs: `package.json`, [README.md](./README.md), [docs/architecture/FRONTEND_MODULAR_ARCHITECTURE.md](./docs/architecture/FRONTEND_MODULAR_ARCHITECTURE.md), [docs/architecture/SERVER_MODULAR_ARCHITECTURE.md](./docs/architecture/SERVER_MODULAR_ARCHITECTURE.md), [docs/architecture/DATABASE_MODULAR_SCHEMA.md](./docs/architecture/DATABASE_MODULAR_SCHEMA.md), [docs/COMMANDS_REFERENCE.md](./docs/COMMANDS_REFERENCE.md), [docs/DOCUMENTATION_REGISTRY.json](./docs/DOCUMENTATION_REGISTRY.json).

---

## Critical Rules & Engineering Standards

1. **Domain Context & Boundaries**: Respect module boundaries according to the target BOCAM subsystem. Never cross domain barriers without using formal domain services or shared contracts.
2. **Clean Imports & Aliases**: Use defined path aliases (`@core/*`, `@apps/*`, `@shared/*`). Never introduce deep traversing relative imports (e.g., `../../../../`).
3. **Backwards Compatibility Protocol**: When refactoring or moving services, utilities, or schemas, ALWAYS preserve backwards compatibility by providing re-export bridges marked with `@deprecated`. Never delete public API surfaces without formal deprecation cycles.
4. **Industry Best Practices**: Strictly adhere to Clean Code, SOLID, DRY, KISS, and modular design. Maintain strict TypeScript typing—strictly avoid `any` or loose type assertions.
5. **Documentation Governance**: Write self-documenting code with meaningful naming; add concise comments explaining the *why* rather than the *what*; use TSDoc/JSDoc for exported APIs. Every created or modified markdown document MUST be registered in `docs/DOCUMENTATION_REGISTRY.json` and validated via `pnpm docs:check`.
6. **Healthcare Data Privacy & Security**: Follow OWASP Top 10 standards. Enforce strict Zod schema validation on all inputs across tRPC, REST, and webhooks. Apply strict patient privacy safeguards (HIPAA-inspired): never print or expose Protected Health Information (PHI) in application logs or console output.
7. **Database Integrity**: Always manage schemas and migrations via Drizzle in `drizzle/schema/`. Never alter the database directly. Always validate schema parity using `pnpm schema:migrations:check`.
8. **Environment Integrity**: Ensure `.env` is valid (`scripts/qa/check-env.mjs`). Never hardcode secrets, tokens, or credentials.
9. **Mandatory Quality Gates**: Before concluding any task or commit, verify the relevant quality gates:
   - Type Checking: `pnpm check` (`tsc --noEmit` - MUST pass with 0 errors).
   - Schema & Migrations: `pnpm schema:migrations:check` (MUST validate 116 tables).
   - Documentation Registry: `pnpm docs:check` (MUST validate all registered records).
   - Targeted Tests: `pnpm vitest run <target-path>` (MUST achieve 100% pass rate).
10. **Strict Commit Standards (Commitlint)**: Adhere strictly to Conventional Commits. Every line in the commit message (both subject and body) MUST NOT exceed 72 characters.