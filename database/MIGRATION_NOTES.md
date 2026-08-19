# Satellite Database V2 Migration Notes

## Target

Vercel frontend -> Supabase (PostgREST + Postgres).

The API Gateway + Lambda + RDS + VPC path is retired. Supabase is the same
Postgres; PostgREST generates the CRUD API the Lambda used to hand-write, so
there is no API layer left to hide the database behind. **RLS is now the access
control** -- see `database/supabase-migration.sql`.

## Supabase Migration Runbook

Run in order. These steps do not touch the running AWS stack, so it stays live
as a rollback until the final teardown step.

### 1. Dump the live schema and data from RDS

The RDS database -- not `database/schema.sql` -- is the source of truth. That
file is **stale**: it still declares `products_services` with the old taxonomy
(`value_chain_stage`, `technology_intensity`, `sia_category`, `itu_service_class`,
`orbit_type`). The live schema is the one the Lambda applied at runtime from its
embedded `SCHEMA_SQL`, which has `system` / `module` / `component_name`.

```sh
pg_dump --no-owner --no-privileges --no-acl \
  -h <rds-endpoint> -U <user> -d <dbname> -f satellite-dump.sql
```

RDS is in a private VPC, so run this from somewhere inside the VPC path, or
temporarily allow your IP on the `satellite-rds-postgres` security group. Revoke
it afterwards.

### 2. Load into Supabase

Connection string: Supabase project settings -> Database -> Connection string.

```sh
psql "postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" \
  -f satellite-dump.sql
```

Use the direct connection (port 5432), not the pooler, for schema-changing loads.

### 3. Check review_status before enabling RLS

```sh
psql "<supabase-connection-string>" -f database/check-review-status.sql
```

`review_status` defaults to `'draft'`, and the read policy only exposes
`'published'` rows. The Lambda never filtered on it, so the app currently shows
drafts too. Any table that is mostly `'draft'` goes blank in the browser once RLS
is on. Backfill those rows rather than loosening the policy.

Step 5 does loosen it, but for `products_services` only, and for a specific
reason documented there: it is the one table the frontend marks draft, and the
draft feature cannot work if the app cannot read its own drafts back.

### 4. Apply the RPC and RLS policies

```sh
psql "<supabase-connection-string>" -f database/supabase-migration.sql
```

### 5. Open writes to the anon key

```sh
psql "<supabase-connection-string>" -f database/supabase-writes.sql
```

Account login is on hold, so the browser's only database identity is the anon
key. Step 4 left the dataset read-only, which meant no role could save anything:
every UI write succeeded locally and silently reached nothing. This step adds
anon INSERT/UPDATE/DELETE policies so the Analyst and Admin flows actually
persist.

The Public, Analyst, and Admin entry routes remain a **frontend prototype**.
They gate the UI; they grant nothing at the database level, and anyone can read
the anon key out of the deployed bundle. Re-scope these policies to
authenticated roles before any public launch.

Single-row edits no longer call `replace_dataset()` — `writeRow()` in
`lib/api.ts` writes just the changed row. The RPC is now only the whole-dataset
swap behind Admin's JSON import, CSV import, and reset.

### 6. Point the frontend at Supabase

Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from
.env.example in Vercel, then redeploy. Next inlines NEXT_PUBLIC variables at
build time, so an environment change alone does nothing. Remove
NEXT_PUBLIC_API_BASE_URL.

### 7. Tear down AWS

Only after the Supabase-backed frontend is verified: delete the Lambda, the API
Gateway HTTP API, the RDS instance (final snapshot first), the VPC config, and
both security groups. Then delete `backend-lambda/` from this repo.

## Legacy AWS Notes

Everything below describes the retired AWS stack. Kept for provenance until the
teardown in step 7 is done.

### AWS Target

Vercel frontend -> API Gateway HTTP API -> Node.js Lambda -> private Amazon RDS PostgreSQL.

The frontend must only call API Gateway. It must not connect to RDS directly.

### Schema Adaptation

The research diagram is used as the conceptual model: `firms` is the anchor and each capability/domain table links back through `firm_id`.

Changes made for the current app:

- Public IDs stay as strings (`F001`, `P001`, `T001`) because the Next.js routes and mock relationships already depend on them.
- `products_services` includes app-specific satellite taxonomy fields: SIA category, ITU service, orbit type, frequency band, NAICS, HS, product TRL, and description.
- `data_sources`, `vocab_terms`, and `audit_log` are first-class tables because the frontend already has source, taxonomy, and audit screens.
- `review_status` and `visibility_level` are included as schema hooks for company-managed draft/public visibility. No full login is implemented here.
- `contracts` is retained from the AWS prototype, but the current frontend does not populate it.

### Example Data Mapping

Source mock data: `C:\Work\Satellite Project\lib\seed.ts`.

Destination SQL: `C:\Work\Satellite Project\database\seed-example-data.sql`.

Mapped rows:

- `firms`: 10 rows
- `firm_size_finance`: 10 rows
- `products_services`: 10 rows
- `technology_capability`: 10 rows
- `infrastructure_facility`: 10 rows
- `human_resource_profile`: 10 rows
- `supply_chain_linkage`: 12 rows
- `collaboration_network`: 11 rows
- `sustainability_esg`: 10 rows
- `data_sources`: 4 rows
- `audit_log`: 1 row
- `vocab_terms`: all current dropdown terms

Skipped data:

- None from the current mock dataset.
- Contract rows are not seeded because the frontend has no contract mock data.

Normalization:

- Placeholder dash values were normalized to ASCII `-`.
- Description punctuation was normalized to ASCII where needed so SQL files stay portable in this repo.

### Safe AWS Execution Order

Do not run destructive DB commands without checking row counts first.

Safe empty-database path:

1. `GET /health`
2. `GET /admin/schema-status`
3. If `schema-status` reports old integer ID columns and all table counts are `0`, run `POST /admin/replace-empty-v2`
4. `POST /admin/init-v2`
5. Apply `database/seed-example-data.sql` only after confirming the target DB is empty or that overwriting the same public IDs is acceptable.
6. `GET /dataset`
7. Verify counts against the row list above.

If `/admin/schema-status` reports integer ID columns from the first prototype schema, do not seed yet. Confirm row counts, then replace the old empty prototype tables through `/admin/replace-empty-v2`. That route refuses to replace the schema if any known table contains rows.

The seed SQL is idempotent by public ID. It updates matching public IDs; it does not drop tables.

### Remaining Production Work

- Move `DB_PASSWORD` from Lambda environment variables to AWS Secrets Manager.
- Replace wildcard CORS with the Vercel project domain before wider testing.
- Add real authentication and role checks before handling sensitive production data.
- Decide whether financial/patent/ESG confidentiality must be row-level or field-level.
