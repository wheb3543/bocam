# AGENTS.md

## Project overview

This repository is a full-stack CRM and patient operations platform built with React, TypeScript, Express, Drizzle ORM, and a MySQL/TiDB-backed data layer. The most important working areas are:

- `client/src/` — frontend application and UI
- `server/_core/` — server runtime and core bootstrapping
- `server/` — backend modules, routers, services, and scripts
- `drizzle/` — schema and migration assets
- `docs/` — project documentation and operational guides

Use the repo documentation as the source of truth for product behavior and operational details: [README.md](README.md), [docs/COMMANDS_REFERENCE.md](docs/COMMANDS_REFERENCE.md).

## Terminal workflow

Use `pnpm` for all package management and scripts. Do not replace repository commands with `npm` or `yarn` unless the task specifically requires it.

### Core commands

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Fast dev mode: `pnpm dev:fast`
- Build app: `pnpm build`
- Start production build: `pnpm start`
- Type-check: `pnpm check`
- Lint: `pnpm lint`
- Auto-fix lint issues: `pnpm lint:fix`
- Format code: `pnpm format`
- Test suite: `pnpm test`
- Watch tests: `pnpm test:watch`
- Coverage: `pnpm test:coverage`
- DB generate: `pnpm db:generate`
- DB migrate: `pnpm db:migrate`
- DB sync schema: `pnpm db:push`
- DB seed: `pnpm db:seed`

### Environment and safety conventions

- This repo expects Node.js >= 22.13.0 and uses `pnpm` as the package manager.
- The dev and start scripts run environment validation first (`scripts/check-env.mjs`), so keep `.env` configuration aligned with the app requirements before runtime commands.
- Prefer existing scripts from `package.json` over ad hoc shell commands or custom one-off scripts.
- Verify with the smallest relevant command before claiming a fix works: type-check, lint, targeted tests, or the repo test command if the change is broader.

## Architecture and development conventions

- Frontend work belongs in `client/src/` and should align with the existing React + TypeScript + Tailwind setup.
- Backend changes usually live under `server/` and should respect the current structured router/service architecture.
- Database changes should be reflected in Drizzle schema/migrations rather than being patched in place without migration planning.
- Keep changes consistent with the project’s existing patterns; prefer minimally invasive edits and avoid introducing parallel conventions.

## Suggested agent behavior

- Before writing code, read the closest existing implementation and mirror the local patterns.
- If you need to validate behavior, run the narrowest relevant command and only broaden if necessary.
- When a task involves terminal commands, prioritize the repo’s `pnpm` scripts and existing docs over improvised commands.
- If there is uncertainty around setup, refer to the docs and existing scripts instead of guessing a command.

## Useful references

- [README.md](README.md)
- [docs/COMMANDS_REFERENCE.md](docs/COMMANDS_REFERENCE.md)
- [package.json](package.json)
