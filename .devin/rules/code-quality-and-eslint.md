---
trigger: always_on
description: Enforce strict ESLint configuration, architectural design patterns, and code quality standards for BOCAM
---
# Global Quality & Engineering Standards
- Write all code explanations, architectural analysis, bug reports, and chat responses in Arabic (العربية الفصحى).
- Prioritize code performance and efficiency; always analyze and minimize Time and Space Complexity (Big O).

# Architectural Boundaries & Import Paths
- Respect the 3-tier frontend architecture: `@core/*` (foundation), `@apps/*` (portals), and `@apps/admin/modules/*` (domain modules).
- Respect backend symmetry: domain logic belongs in `server/modules/<module-id>/` and cross-cutting capabilities in `server/services/`.
- Always use configured path aliases (`@core/*`, `@apps/*`, `@shared/*`) rather than brittle, deeply nested relative paths (e.g. `../../../../`).
- When relocating or refactoring files, always maintain backwards-compatible re-export bridges marked with `@deprecated` to prevent breaking existing imports.

# Lints & Code Style (ESLint & Strict TypeScript)
- Adhere strictly to the project's ESLint configuration and architectural boundaries.
- Never bypass or disable ESLint rules (do NOT use `eslint-disable` or `any` types) unless explicitly justified and approved.
- Fix all linting errors and warnings automatically before presenting or saving code changes.

# Architecture & Design Patterns (SOLID & Clean Code)
- Adhere strictly to SOLID principles, DRY (Don't Repeat Yourself), and KISS (Keep It Simple, Stupid).
- Write highly modular, clean, and reusable code with clear separation of concerns.
- Before creating new logic, inspect the codebase to reuse existing utilities, components, and shared services.
