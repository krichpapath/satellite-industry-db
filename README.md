# Satellite Project

Next.js App Router prototype for the Thai Satellite Industry Database data-planner workbench.

## Stack

- Next.js `16.2.6`
- React / React DOM `19.2.6`
- TypeScript `6.0.3`
- Tailwind CSS `4.3.0`

## Run

Easiest way on this PC:

```powershell
.\start.cmd
```

Open:

```text
http://127.0.0.1:3000
```

`start.cmd` uses `npm.cmd run dev` when npm is available. If npm is not on PATH, it falls back to Codex's bundled Node runtime and the installed `node_modules`.

For a fresh checkout, install dependencies once first:

```powershell
npm.cmd install
```

Then run `.\start.cmd` again. If `npm.cmd` is not available on a fresh checkout, install Node.js first.

## Project Layout

- `app/` - Next.js App Router pages
- `components/` - shared UI and form components
- `lib/` - schema, seed data, API client, and browser store
- `backend-lambda/` - AWS Lambda API package and deployment zip
- `database/` - PostgreSQL schema, seed SQL, and migration notes
- `tools/` - local utility scripts, including API test seeding
- `docs/` - research documents and old prototypes

## Vercel

Standard Next.js app on Vercel. Build command:

```powershell
npm.cmd run build
```

The backend is **Supabase** (PostgREST over PostgreSQL). The AWS path below is
retired — API Gateway, Lambda and RDS are no longer used, and
`NEXT_PUBLIC_API_BASE_URL` is not read by any code.

```text
Vercel frontend -> Supabase PostgREST -> PostgreSQL
```

Set exactly these two variables in Vercel Project Settings -> Environment
Variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Then **Redeploy**. `NEXT_PUBLIC_*` values are inlined at build time, so saving a
variable changes nothing until the next build. If they are missing the app still
renders, but every save stays in the browser and `/admin` reports
"API not configured".

Do **not** set `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Nothing server-side reads
it since the account feature was reverted, and it bypasses row-level security.

On load the frontend reads every table, normalizes the rows into the app
`Database` shape and hydrates the browser store. Each edit writes just the
changed row plus its audit entry (`writeRow` in `lib/api.ts`); the
whole-dataset `replace_dataset()` RPC is only used by JSON import, CSV import
and reset.

### Before deploying

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run check:schema
npm.cmd run build
```

`check:schema` compares the column allowlist in `lib/api.ts` against the live
database. A mismatch there fails every write to that table at runtime with a
PGRST204 error, so run it after any schema change.

Database migrations must already be applied, in this order:
`database/supabase-migration.sql`, `database/supabase-writes.sql`,
`database/supabase-drop-account-policies.sql`. See `docs/TEST_PLAN.md`.

## AWS Database V2 (RETIRED — historical reference only)

> Superseded by Supabase on 2026-07-17. **Do not run the commands below.** The
> endpoints point at the old API Gateway / Lambda / RDS stack, which is no
> longer the source of truth; anything they touch is either gone or stale. Kept
> only to document how the v2 schema was originally built. For current setup see
> **Vercel** above and `database/MIGRATION_NOTES.md`.

Reference files:

- `database/schema.sql` - empty PostgreSQL schema, constraints, indexes, and comments
- `database/seed-example-data.sql` - idempotent migration for current example/mock data
- `database/MIGRATION_NOTES.md` - mapping notes, row counts, safe execution order

Safe empty-database setup order:

```powershell
# 1. Confirm Lambda can reach RDS
Invoke-RestMethod -Method Get -Uri "https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com/health"

# 2. Check whether old prototype tables already exist
Invoke-RestMethod -Method Get -Uri "https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com/admin/schema-status"

# 3. If schema-status reports integer ID columns but all counts are 0,
#    replace the empty prototype schema with v2.
Invoke-RestMethod -Method Post -Uri "https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com/admin/replace-empty-v2"

# 4. Create v2 tables. This is also safe after replace-empty-v2.
Invoke-RestMethod -Method Post -Uri "https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com/admin/init-v2"

# 5. Apply database/seed-example-data.sql only after confirming the target DB is empty
#    or that updating the same public IDs is intended.
```

Do not run destructive database commands against AWS without checking row counts first. `/admin/replace-empty-v2` refuses to replace the schema if any known table has rows.

Current API surface:

- `GET /health`
- `GET /admin/schema-status`
- `POST /admin/replace-empty-v2`
- `POST /admin/init-v2`
- `GET /dataset`
- `PUT /dataset`
- CRUD routes for `/firms`, `/products`, `/size-finance`, `/tech`, `/facilities`, `/hr`, `/linkages`, `/collaborations`, `/esg`, `/sources`
- `GET /vocab`, `PUT /vocab`
- legacy-compatible `/contracts`

## Routes

- `/` - Public entry and dashboard
- `/analysis` - Analyst entry; selects the Analyst role and opens Companies
- `/coolAdmin` - Admin entry; selects the Admin role and opens Companies
- `/companies` - firm anchor records (old `/firms/*` URLs redirect here)
- `/companies/new` - expert firm intake flow
- `/companies/[firmId]` - firm overview and domain completeness
- `/companies/[firmId]/edit` - firm edit flow
- `/sources` - provenance register
- `/taxonomy` - controlled vocabulary management
- `/audit` - audit trail
- `/admin` - JSON backup, CSV import prototype, reset/wipe tools

## Product Notes

The UI follows the Phase 1 analysis in `docs/reference/uploads/satellite_db_phase1_analysis.md` and the field format in `docs/reference/Draft ideas for database development.docx`: firm records anchor the domain tables, source attribution is tracked, and taxonomy fields use controlled choices.

The mock input format now covers:

- `Firms`
- `Firm_Size_Finance`
- `Products_Services`
- `Technology_Capability`
- `Infrastructure_Facility`
- `Human_Resource_Profile`
- `Supply_Chain_Linkage`
- `Collaboration_Ecosystem_Network`
- `Sustainability_ESG`

Legacy static prototypes are kept under `docs/prototypes/` for reference:

- `Government Portal.html`
- `Visual Directions.html`
- `Phase 1 Plan.html`
