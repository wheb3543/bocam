# Database Phase Zero Baseline

This repository intentionally freezes `server/database/migrations/add_performance_indexes.sql` until the schema review is complete. The normal migration runner skips the frozen file, and CI validates executable SQL references with `pnpm schema:migrations:check`.

## Staging run

Run against a staging database that is representative of production:

```bash
DATABASE_URL='mysql://user:password@host:3306/database' pnpm db:phase-zero
```

For a local technical baseline, populate the existing fixtures first:

```bash
pnpm db:seed:all
pnpm db:seed:empty
PHASE_ZERO_TARGET_ROWS=1000 pnpm db:seed:production-like
pnpm db:phase-zero
```

`pnpm db:seed:empty` inserts one metadata-derived fixture row into each table
that is still empty, respecting required columns, enum values, and foreign keys.
It is intended for local validation only and must not be run against production.
The current local run populated 107/107 tables.

`pnpm db:seed:production-like` adds volume to the four workload tables used by
the phase-zero queries (`leads`, `appointments`, `campRegistrations`, and
`tasks`). It is local-only and can be tuned with `PHASE_ZERO_TARGET_ROWS`.

The command writes the following untracked artifacts under `artifacts/phase-zero/` (or `PHASE_ZERO_OUTPUT_DIR`):

- `schema-backup-<timestamp>.sql`: schema and data backup captured before measurements.
- `orphan-counts.json`: counts for each reviewed reference field.
- `explain-baseline.json`: `EXPLAIN` plans for the reviewed workload queries.

`pnpm db:phase-zero` warms each query and measures 30 iterations by default. Set
`PHASE_ZERO_ITERATIONS` and `PHASE_ZERO_WARMUP` to change the sample size. The
artifact includes p50, p95, p99, max duration, row count, and the EXPLAIN plan.

The latest local production-like run used a target of 1,000 rows for each
workload table and measured 30 iterations after five warmups. The resulting p95
times were 4.587 ms for leads, 2.172 ms for appointments, 2.018 ms for camp
registrations, and 2.393 ms for tasks. All 13 orphan checks were zero. These
numbers are local technical measurements, not production performance targets.

The backup and measurements must be retained in the staging evidence store, not committed to Git. Repeat the command after representative staging data is loaded and record the timestamp, dataset version, and database engine/version with the artifacts.

## Acceptance gate

- `pnpm schema:migrations:check` passes in CI.
- The frozen performance-index migration is not executed automatically.
- The staging evidence store contains a backup, orphan counts, and `EXPLAIN` baseline.
- No index or foreign-key migration is promoted until its `EXPLAIN` and orphan evidence has been reviewed.