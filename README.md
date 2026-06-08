# Satellite Project

Next.js App Router prototype for the Thai Satellite Industry Database data-planner workbench.

## Stack

- Next.js `16.2.6`
- React / React DOM `19.2.6`
- TypeScript `6.0.3`
- Tailwind CSS `4.3.0`

## Run

```powershell
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:3000
```

`start.cmd` runs the same dev server.

## Project Layout

- `app/` - Next.js App Router pages
- `components/` - shared UI and form components
- `lib/` - schema, seed data, API client, and browser store
- `backend-lambda/` - AWS Lambda API package and deployment zip
- `database/` - PostgreSQL schema, seed SQL, and migration notes
- `tools/` - local utility scripts, including API test seeding
- `docs/` - research documents, old prototypes, extracted document internals, and archived scratch work

## Vercel

This prototype is deployable as a standard Next.js app on Vercel. Build command:

```powershell
npm.cmd run build
```

The frontend can still run as a local prototype with browser `localStorage`, but the real shared path is AWS backed:

```text
Vercel frontend -> API Gateway HTTP API -> AWS Lambda -> Amazon RDS PostgreSQL
```

The frontend never connects to RDS directly.

To connect Vercel to API Gateway, add this Vercel Project Settings environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com/
```

On app load, the frontend fetches `GET /dataset`, normalizes the full API response into the app `Database` shape, and hydrates the browser store. Form edits update the browser store immediately and queue `PUT /dataset` to persist the full dataset to PostgreSQL. New firms also call `POST /firms` first so the basic firm creation route remains independently testable.

The API Gateway/Lambda must allow CORS from the Vercel deployment domain.

## AWS Database V2

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

- `/` - input workbench
- `/firms` - firm anchor records
- `/firms/new` - expert firm intake flow
- `/firms/[firmId]` - firm overview and domain completeness
- `/firms/[firmId]/edit` - firm edit flow
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
