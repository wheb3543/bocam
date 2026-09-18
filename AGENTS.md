# AGENTS.md

## System: BOCAM (بُوكَام) Healthcare Platform
An integrated platform comprising 5 core functional subsystems:
- **[B] Booking & Smart Scheduling**: Smart scheduling and capacity control across clinics, doctors, and medical field camps.
- **[O] Omni-channel Inbox**: Unified messaging inbox aggregating WhatsApp, Facebook, Instagram, Telegram, and SMS.
- **[C] Customer Relationship & Patient Portal**: Healthcare CRM paired with a digital patient portal for medical records (EMR), lab results, and radiology reports.
- **[A] Automated CMS**: Institutional organization portal and automated healthcare educational blog.
- **[M] Media Social & Tasks**: Social media hub combined with multi-department administrative task assignment, tracking, and staff performance evaluation.

## Stack & Structure
- **Frontend (`client/src/`)**: React 19 + TS 5.9 + Tailwind CSS 4 in a 3-tier modular architecture:
  - **Core Foundation (`@core/*`)**: UI primitives, feedback, contexts, hooks, animations, system pages, PWA, and common utilities.
  - **Functional Portals (`@apps/*`)**: 4 standalone portals: `public/`, `patient-portal/`, `doctor-portal/`, and `admin/`.
  - **Admin Subsystem (`@apps/admin/modules/`)**: 10 cohesive modules (01 to 10) with co-located components, embedded reports, and domain settings.
- **Backend (`server/`)**: Express + tRPC 11, Drizzle ORM (`drizzle/`), MySQL/TiDB, Redis caching & BullMQ queues.
- Node `>=22.13.0` | Package manager: `pnpm` only.
- Docs: `package.json`, [README.md](./README.md), [docs/architecture/FRONTEND_MODULAR_ARCHITECTURE.md](./docs/architecture/FRONTEND_MODULAR_ARCHITECTURE.md), [docs/COMMANDS_REFERENCE.md](./docs/COMMANDS_REFERENCE.md).

## Critical Rules & Engineering Standards
1. **Domain Context**: Respect module boundaries according to the target BOCAM subsystem.
2. **Industry Best Practices**: Adhere strictly to global software standards (Clean Code, SOLID, DRY, modular design, and strict TypeScript typing—strictly avoid `any`).
3. **Documentation & Comments**: Write self-documenting code with meaningful naming; add concise comments explaining the *why* (business intent and edge cases) rather than the *what*; use TSDoc/JSDoc for exported APIs, services, and complex utilities.
4. **Security & Data Integrity**: Follow OWASP best practices, strict schema validation (Zod), and privacy safeguards when dealing with healthcare/patient records.
5. **Database**: Always manage schema/migrations via Drizzle in `drizzle/`; never alter DB directly.
6. **Environment & Verification**: Ensure `.env` is valid (`scripts/check-env.mjs`); run the narrowest relevant validation command (type-check, lint, or targeted test) before finishing.