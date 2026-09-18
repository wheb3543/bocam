---
trigger: always_on
description: Maintain high-standard documentation and enforce governance via the Documentation Registry
---
# Continuous & High-Standard Documentation
- Write all code explanations, architectural notes, bug reports, and chat responses in Arabic (العربية الفصحى).
- Document all functions, classes, methods, tRPC procedures, and APIs using industry-standard formats (TSDoc/JSDoc for TypeScript/JavaScript).
- Maintain clear, high-quality Markdown files under strict documentation standards.

# Documentation Registry Governance
- The repository maintains an automated documentation registry in `docs/DOCUMENTATION_REGISTRY.json`.
- Whenever creating, moving, or updating any markdown document:
  1. Add or update the corresponding entry in `docs/DOCUMENTATION_REGISTRY.json`.
  2. Validate the registry by running `pnpm docs:check` to ensure all entries are valid and up to date.
- CRITICAL: Whenever code logic, architecture, API contracts, or environment variables change, immediately update all affected documentation files to prevent outdated or stale docs.
