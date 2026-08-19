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
- `database/` - Supabase migrations, schema, and migration notes
- `tools/` - local utility scripts (`check-schema.cjs`)
- `docs/` - research documents and old prototypes

## Vercel

Standard Next.js app on Vercel. Build command:

```powershell
npm.cmd run build
```

The backend is **Supabase** (PostgREST over PostgreSQL).

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

## Routes

- `/` - Public entry and dashboard
- `/analysis` - Analyst entry; selects the Analyst role and opens Companies
- `/coolAdmin` - Admin entry; selects the Admin role and opens Companies
- `/public` - resets back to the Public role (testing convenience)
- `/companies` - firm anchor records (old `/firms/*` URLs redirect here)
- `/companies/new` - expert firm intake flow
- `/companies/[firmId]` - firm overview and domain completeness
- `/companies/[firmId]/edit` - firm edit flow
- `/sources` - provenance register
- `/taxonomy` - controlled vocabulary management
- `/audit` - audit trail
- `/admin` - sync status, record counts, .xlsx and JSON exports (import hidden behind IMPORT_ENABLED)

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
