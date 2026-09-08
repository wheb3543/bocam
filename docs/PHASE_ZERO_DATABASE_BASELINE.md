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
pnpm db:phase-zero
```

`pnpm db:seed:empty` inserts one metadata-derived fixture row into each table
that is still empty, respecting required columns, enum values, and foreign keys.
It is intended for local validation only and must not be run against production.
The current local run populated 107/107 tables.

The command writes the following untracked artifacts under `artifacts/phase-zero/` (or `PHASE_ZERO_OUTPUT_DIR`):

- `schema-backup-<timestamp>.sql`: schema and data backup captured before measurements.
- `orphan-counts.json`: counts for each reviewed reference field.
- `explain-baseline.json`: `EXPLAIN` plans for the reviewed workload queries.

The latest local run measured 13/13 reference checks with zero orphan records
and produced four query plans with execution times below 1 ms on the local
fixture dataset. These numbers are technical smoke-test results, not production
performance targets.

The backup and measurements must be retained in the staging evidence store, not committed to Git. Repeat the command after representative staging data is loaded and record the timestamp, dataset version, and database engine/version with the artifacts.

## Acceptance gate

- `pnpm schema:migrations:check` passes in CI.
- The frozen performance-index migration is not executed automatically.
- The staging evidence store contains a backup, orphan counts, and `EXPLAIN` baseline.
- No index or foreign-key migration is promoted until its `EXPLAIN` and orphan evidence has been reviewed.