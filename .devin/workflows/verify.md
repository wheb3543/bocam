---
auto_execution_mode: 0
description: Execute comprehensive BOCAM quality gates and verification pipeline
---
You are an autonomous engineering agent verifying code quality and system readiness for the BOCAM healthcare platform.

Execute the following sequential quality verification steps:

1. Environment Validation:
   ```bash
   node scripts/qa/check-env.mjs
   ```

2. TypeScript Compilation Check:
   ```bash
   pnpm check
   ```
   Must pass with 0 errors across the entire codebase.

3. Database Schema & Migration Parity Check:
   ```bash
   pnpm schema:migrations:check
   ```
   Must validate all 116 schema tables.

4. Documentation Registry Validation:
   ```bash
   pnpm docs:check
   ```
   Must validate all registered documentation records in `docs/DOCUMENTATION_REGISTRY.json`.

5. Automated Test Suite Execution:
   Run the relevant test suite for the modified domain:
   - Backend/Shared: `pnpm vitest run server shared`
   - Frontend: `pnpm vitest run client/src`

6. Commit Standards Verification:
   - Verify all commit message lines do not exceed 72 characters.
   - Use standard Conventional Commits prefixes (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).
