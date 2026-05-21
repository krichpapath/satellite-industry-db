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

## Vercel

This prototype is deployable as a standard Next.js app on Vercel. Build command:

```powershell
npm.cmd run build
```

Prototype firm records are saved in browser `localStorage`, so no server file writes are required on Vercel. This is suitable for idea testing only; shared production records need a hosted database such as Vercel Postgres or Supabase.

## Routes

- `/` - input workbench
- `/firms` - firm anchor records
- `/firms/new` - expert firm intake flow
- `/firms/[firmId]` - firm overview and domain completeness
- `/firms/[firmId]/domains/[domain]` - per-domain input form
- `/import` - CSV / Excel staging workflow
- `/sources` - provenance register
- `/taxonomy` - controlled vocabulary management
- `/review` - governance review queue
- `/audit` - audit trail

## Product Notes

The UI follows the Phase 1 analysis in `uploads/satellite_db_phase1_analysis.md` and the field format in `Draft ideas for database development.docx`: every form is split into identity, payload, and provenance zones; source attribution is required; taxonomy fields use controlled choices; bulk imports go through staging and dry-run validation before commit.

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

Legacy static prototypes remain in the root folder for reference:

- `Government Portal.html`
- `Visual Directions.html`
- `Phase 1 Plan.html`
