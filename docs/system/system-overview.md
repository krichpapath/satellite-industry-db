# Satellite Database System Overview

## 1. Purpose

This document explains the current system: the data path, the roles, the
deployed services, and the checks to run before a deploy.

The system stores firm records, product/component records, capability records,
source records, controlled vocab terms, and an append-only audit log.

## 2. Architecture

```text
Browser (Next.js on Vercel) -> Supabase PostgREST -> PostgreSQL
```

The browser talks to Supabase directly with the publishable ("anon") key. There
is no application server of our own. Row-level security in PostgreSQL is the
only thing standing between a request and the data.

Superseded 2026-07-17: the previous path was
`Vercel -> API Gateway -> AWS Lambda -> Amazon RDS`. That stack is retired and
its resources are shut down. The migration record is in
`database/MIGRATION_NOTES.md`.

| Item | Value |
|---|---|
| Frontend | Next.js App Router, deployed on Vercel |
| Backend | Supabase PostgREST |
| Database | Supabase PostgreSQL (`ap-southeast-1`) |
| Client env vars | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

`NEXT_PUBLIC_*` values are inlined at build time. Changing them in Vercel has no
effect until the next build.

## 3. Data path

| Step | What happens |
|---|---|
| 1 | On load, `syncDatasetFromApi()` reads every table and folds `vocab_terms` into the app's `vocab` shape. |
| 2 | The result is written to `localStorage` and rendered from there. |
| 3 | An edit updates `localStorage` first, so the UI never blocks on the network. |
| 4 | `commit()` then writes **just the changed row** plus its audit entry (`writeRow` in `lib/api.ts`). |
| 5 | A failed write raises the red "Not saved to the database" banner in the app shell. |

The whole-dataset `replace_dataset()` RPC is only used by JSON import, CSV
import, and reset. Per-row writes replaced it because the old model let a stale
tab overwrite rows it had never seen.

## 4. Roles

Selected by entry URL. No accounts, no passwords.

| URL | Role | Can |
|---|---|---|
| any page | Public | read only |
| `/analysis` | Analyst | add companies and components |
| `/coolAdmin` | Admin | everything, including delete, export, and `/audit` |
| `/public` | Public | drop back down (testing convenience) |

The role lives in `localStorage` plus a `sessionStorage` entry flag, and is
enforced entirely in the frontend (`rolePermissions` in `lib/schema.ts`, pinned
by `lib/roles.test.ts`).

**This is not a security boundary.** There is one database identity, its key is
readable in the JS bundle, and `/coolAdmin` is reachable by anyone who types it.
Adequate for a private prototype; not for a public deployment.

## 5. Database migrations

Apply in this order:

| File | Purpose |
|---|---|
| `database/supabase-migration.sql` | schema, RLS enabled, `replace_dataset()` |
| `database/supabase-writes.sql` | anon write policies, drafts readable, audit append-only |
| `database/supabase-drop-account-policies.sql` | removes the reverted account feature's policies |

New RPCs need `NOTIFY pgrst, 'reload schema'`. Supabase preloads pg-safeupdate,
so a bare `DELETE FROM` fails with 21000 — use `WHERE TRUE`.

## 6. Pre-deploy checks

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run check:schema
npm.cmd run build
```

`check:schema` compares the `COLUMNS` allowlist in `lib/api.ts` against the live
schema. A column declared there that does not exist makes PostgREST reject every
write to that table with PGRST204 — which surfaces as a save failure at runtime,
not at build time. Run it after any schema change.

Full per-role test matrix and results: `docs/TEST_PLAN.md`.

## 7. Known gaps

| Gap | Detail |
|---|---|
| No access control | Anyone with the URL can reach `/coolAdmin` and delete records. |
| Three tables unreachable | `supply_chain_linkage`, `collaboration_network` and `firm_size_finance` have no UI path to a first row. See `docs/TEST_PLAN.md`. |
| Import untested | `/admin` JSON and CSV import are hidden behind `IMPORT_ENABLED` in `app/admin/page.tsx`. |

## 8. References

| Topic | Link |
|---|---|
| Supabase row-level security | https://supabase.com/docs/guides/database/postgres/row-level-security |
| PostgREST API | https://postgrest.org/en/stable/references/api.html |
| Supabase JS client | https://supabase.com/docs/reference/javascript |
| Next.js environment variables | https://nextjs.org/docs/app/guides/environment-variables |
