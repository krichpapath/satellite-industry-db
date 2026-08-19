# Pre-deployment Test Plan — Role Matrix

Three roles, selected by entry URL (no accounts). Role lives in `localStorage`
(`satdb.role`) plus a `sessionStorage` entry flag; it is a **frontend prototype
and grants no database permission**.

| Role | Entry URL | Set by |
|---|---|---|
| Public | `/` (or any URL, default) | `ensurePublicEntryRole()` |
| Analyst | `/analysis` | `EntryRedirect` → `/companies` |
| Admin | `/coolAdmin` | `EntryRedirect` → `/companies` |

## Preconditions

1. `.env` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. `npm run dev`, open `http://127.0.0.1:3000`.
3. **Between roles: clear site data** (DevTools → Application → Clear storage).
   Role and the cached dataset both live in browser storage; skipping this makes
   every result a lie.
4. Baseline Supabase counts: firms 9, products_services 22, data_sources 2,
   vocab_terms 181, audit_log 66.

## How to verify a row actually reached Supabase

Do not trust the UI — it writes to `localStorage` first and shows the row either
way. Check the database directly: Supabase dashboard → Table Editor, or a REST
read with the anon key filtered to the new id. Also watch DevTools → Network for
the POST/PATCH status, and the save badge on `/admin` (Admin only).

---

## A. Public

| # | Test | Expected UI | Expected DB |
|---|---|---|---|
| P1 | Open `/` | Dashboard renders, sidebar role pill = `Public` | reads only |
| P2 | Sidebar contents | Only Dashboard, Search, Companies | — |
| P3 | Dashboard stats | Counts match Supabase (9 companies / 22 components) | — |
| P4 | `/search` | Keyword and filters return results | — |
| P5 | `/companies` | Grid lists 9 companies. **No "Add company" button** | — |
| P6 | Open a company | Profile renders; **no** Edit / Export / "You manage this company" | — |
| P7 | Contact email field | Shows "Private — visible to the company and admin" | — |
| P8 | Components tab | Cards read-only; **"Read-only" badge** where "Add component" would be | — |
| P9 | Draft components | Draft rows are **not** listed | — |
| P10 | Capabilities / Network / Sustainability tabs | Sub-tables read-only, no Add/Edit/Delete | — |
| P11 | Direct URL `/companies/new` | `Locked: requires Analyst` | no write |
| P12 | Direct URL `/companies/F005/edit` | Locked | no write |
| P13 | Direct URLs `/admin`, `/audit`, `/value-chain`, `/network`, `/gap-analysis`, `/sources`, `/taxonomy` | Each shows `Locked: requires Admin` | no write |
| P14 | After the whole pass | Supabase counts unchanged from baseline | **no writes at all** |

## B. Analyst — the role under scrutiny

| # | Test | Expected UI | Expected DB |
|---|---|---|---|
| A1 | Open `/analysis` | Brief "Opening analyst intake…", lands on `/companies`, pill = `Analyst` | — |
| A2 | Sidebar contents | Only Dashboard, Search, Companies. **No Audit, no Admin** | — |
| A3 | Role description | "Can add companies and components. Cannot edit, delete, or export." | — |
| **A4** | **Add company**: `/companies` → Add company → fill name + province → submit | Redirects to the new company profile | **new row in `firms`** with the shown `firm_id` |
| A5 | A4 with blank name | "Company name is required." alert, no submit | no write |
| A6 | A4 with a province typed but not picked from the list | Province validation alert | no write |
| A7 | Reload after A4 | Company still listed after a fresh dataset sync | row survives — proves it is not localStorage-only |
| **A8** | **Add component**: open a company → Components tab → Add component → product name + System/Module/Component + TRL → Save | Card appears in the catalog | **new row in `products_services`** |
| A9 | A8 with blank product name | "Product name is required." | no write |
| A10 | A8 with System = Unidentified | Module and Component auto-lock to Unidentified, save allowed | row with Unidentified path |
| A11 | Reload after A8 | Component still present after sync | row survives |
| A12 | Existing component cards | **No Edit / Delete buttons, no Draft/Public dropdown** — only the state badge | — |
| A13 | Company profile header | **No** Edit company, **no** Export .xlsx, **no** "You manage" chip | — |
| A14 | Direct URL `/companies/F005/edit` | `Locked: requires Admin` | no write |
| **A15** | **Direct URL `/audit`** | `Locked: requires Admin` — analyst cannot see logs | no read |
| **A16** | **Direct URL `/admin`** | `Locked: requires Admin` — no data/user management | no write |
| A17 | Direct URLs `/value-chain`, `/network`, `/gap-analysis`, `/sources`, `/taxonomy` | All locked | — |
| A18 | Capabilities / Network / Sustainability sub-tables | `Locked: requires Admin` on the editors | no write |
| A19 | Contact email on any company | Still masked as Private | — |
| A20 | Draft components of other companies | Not visible | — |

## C. Admin

| # | Test | Expected UI | Expected DB |
|---|---|---|---|
| D1 | Open `/coolAdmin` | Lands on `/companies`, pill = `Admin`, full sidebar (10 items) | — |
| D2 | Add company | Same as A4 | new `firms` row |
| D3 | Edit company → Save changes | Returns to profile with new values | `firms` row updated |
| D4 | Delete company (confirm dialog) | Company gone; linked records removed | row and children deleted |
| D5 | Add / Edit / Delete component | All three controls present and work | `products_services` insert/update/delete |
| D6 | Component Draft/Public dropdown | Switches state inline | `review_status` flips `draft` / `published` |
| D7 | Draft visibility | Admin sees drafts; stat hint reads "N drafts included" | — |
| D8 | Contact email | Real address shown as a `mailto:` link | — |
| D9 | Export .xlsx (company) | File downloads, sheets populated | — |
| D10 | `/admin` → Download full database / all components | Both .xlsx download | — |
| D11 | `/admin` → Sync now | Sync badge turns green with company count | fresh GET of all tables |
| D12 | `/admin` → Record counts | Match Supabase | — |
| D13 | `/admin` → JSON: Show current / Download / Load from file | Round-trips | — |
| D14 | `/admin` → Import JSON (confirm) | Whole local DB replaced | full dataset replace |
| D15 | `/admin` → CSV import with a bad `firm_id` | Rejected, offending IDs listed | no write |
| D16 | `/admin` → CSV import: valid rows → Preview → Commit | Rows appear in the target table | rows inserted |
| D17 | `/audit` | Entries listed; table/action/search filters work | reads `audit_log` |
| D18 | Audit after any D-test write | Matching entry exists with role `Admin` | new `audit_log` row |
| D19 | Capabilities / Network / Sustainability sub-table editors | Add/Edit/Delete all work | respective tables |
| D20 | `/value-chain`, `/network`, `/gap-analysis`, `/sources`, `/taxonomy` | All render with data | — |

## D. Cross-cutting

| # | Test | Expected |
|---|---|---|
| X1 | Load with `.env` unset | App still renders from seed; `/admin` shows "API not configured — local storage only" |
| X2 | Load with a bad anon key | Sync badge red with the reason; app still usable |
| X3 | Save while offline (DevTools → Offline) | `/admin` shows "SAVE FAILED …" and the not-saved warning |
| X4 | Two browsers, both Admin: A adds a company, then B adds one **without reloading** | A's company survives. B may hit `duplicate key value violates unique constraint "firms_pkey"` in the save banner — both browsers computed the same next id from their own cache. That is the designed outcome: a loud, recoverable error instead of B silently overwriting A. B reloads and retries to get a free id |
| X5 | Save a component as Draft, hard-reload, then save anything else | Draft survives and is still visible to Admin |
| X6 | Any write, then `/audit` as Admin | A new entry appears, and a matching row exists in Supabase `audit_log`. Audit ids are UUIDs now; only rows A001–A066 use the old `A0xx` format |
| X7 | Mobile viewport (375px) | Bottom nav and hamburger work; role pill visible |
| X8 | Deep-link a company URL in a fresh tab | Loads after sync, no lasting "Company not found" |
| X9 | `npm run build` | Succeeds |
| X10 | Vercel env vars | `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, `NEXT_PUBLIC_API_BASE_URL` removed, then **redeploy** — Next inlines `NEXT_PUBLIC_*` at build time |

## Deployment blocker: 3 tables have no way in — 2026-08-19

Found while testing D19. Not a regression; a gap in the product.

`app/companies/[firmId]/page.tsx:144` builds the detail tabs **data-driven** —
Capabilities, Network and Sustainability only appear once their tables already
have rows. The editors that would create the first row live *inside* those tabs,
so an empty table can never be filled from the company page. The only other way
in is CSV import on `/admin`, and `CSV_TARGETS` covers just 4 tables.

Live state: 7 of 11 tables are empty, which is exactly when this bites.

| Table | Single-row editor | CSV import | First row reachable? |
|---|---|---|---|
| firms | yes | yes | yes |
| products_services | yes | yes | yes |
| data_sources | yes (`/sources`) | no | yes |
| vocab_terms | yes (`/taxonomy`) | no | yes |
| technology_capability | tab hidden when empty | **yes** | yes, via CSV |
| sustainability_esg | tab hidden when empty | **yes** | yes, via CSV |
| infrastructure_facility | tab hidden when empty | no | only after a `tech` row exists |
| human_resource_profile | tab hidden when empty | no | only after a `tech` row exists |
| **supply_chain_linkage** | tab hidden when empty | no | **NO** |
| **collaboration_network** | tab hidden when empty | no | **NO** |
| **firm_size_finance** | **none anywhere** | no | **NO** |

The tab gate is per *group*, so one `technology_capability` row unlocks the
Facility and HR editors too (verified: seeding one tech row made "Add Facility"
and "Add HR profile" appear, and the Facility write reached Supabase).

`firm_size_finance` is read-only everywhere: displayed on the company page and
deleted with its firm, but no UI ever creates or edits it — which is why every
company shows "No finance record".

**Options**, cheapest first:
1. Add `linkages`, `collabs`, `size_finance` to `CSV_TARGETS` — a data-only
   change, no new UI.
2. Always show the three tabs and let them render an empty state with the Add
   button — deletes the condition at line 146-153 rather than adding anything.
3. Leave it, if these tables are meant to be populated by bulk import only.

This is a product decision, not a bug fix, so nothing was changed.

## Full role pass — 2026-08-19 (browser + database, end to end)

The browser-pane blocker was beaten: patching `requestAnimationFrame` to
`setTimeout` and navigating only by clicking anchors makes the Suspense-heavy
routes render. Every row below was driven through the real UI and then verified
in Supabase, not simulated.

### Admin

| # | Test | Result |
|---|---|---|
| D1 | `/coolAdmin`, 10-item sidebar | pass |
| D2/A4 | Add company | pass — row + audit in Supabase |
| **D3** | **Edit company → Save** | **pass — `firm_name` changed in DB, audit 67→68** |
| **D4** | **Delete company** | **pass — row gone, counts back to baseline, audit 71→72** |
| D5 | Add component | pass — `P032` in DB with Thai component name intact |
| D5 | Delete component | pass — row gone, audit logged |
| **D6** | **Draft/Public toggle** | **pass — `review_status: draft` in DB, still readable** |
| D7 | Draft visibility | pass — "1 draft included" hint |
| D9/D10 | `.xlsx` exports | pass — via `lib/xlsx.test.ts`, including all-empty child tables |
| D11 | Sync now | pass — "API configured", 10 companies |
| D12 | Record counts | pass — matched Supabase exactly (10/23/2/70 at the time) |
| D17 | `/audit` | pass — 70 rows, matches DB, filters present |
| D18 | Audit after every write | pass — all 6 writes logged with correct role |
| **D19** | **Sub-table editor** | **pass — `FA001` written to `infrastructure_facility`, delete also reached DB** |
| D20 | Other admin pages | pass — all 7 render, no error markers |
| D13-D16 | JSON / CSV import | **not run — destructive to the live database, needs your go-ahead** |
| D8 | Contact email `mailto:` | not verified — no test company had an email |

### Analyst

| # | Test | Result |
|---|---|---|
| A2 | Sidebar = Dashboard/Search/Companies only | pass |
| A4 | Add company | pass — end to end to Supabase |
| A5 | Blank name | pass — "Company name is required." |
| A6 | Invalid province | pass — reverts to `Unidentified` on blur; invalid value cannot be saved |
| A9 | Blank product name | pass — inline "Product name is required." |
| A12 | Component cards | pass — no Edit/Delete, no state dropdown |
| A13 | No Edit/Export/manage chip | pass |
| A14 | `/companies/*/edit` | pass — locked |
| **A15** | **`/audit`** | **pass — locked, and no audit data leaks into the DOM** |
| A16 | `/admin` | pass — locked |
| A20 | Other companies' drafts | pass — hidden |

### Public

| # | Test | Result |
|---|---|---|
| P2 | Sidebar = 3 items | pass |
| P3 | Counts match Supabase | pass |
| P4 | Search | pass — keyword hit + empty state |
| P6 | No Edit/Export | pass |
| P8 | "Read-only" instead of Add component | pass |
| P9 | Drafts not listed | pass |
| P13 | `/admin` direct URL | pass — "Locked: requires Admin role." |
| P7 | Contact email masking | not verified |

### Cross-cutting

| # | Test | Result |
|---|---|---|
| X6 | Audit matches Supabase | pass |
| X7 | Mobile 375px | pass — drawer works, no horizontal overflow |
| X9 | `npm run build` | pass |
| — | **Schema contract, all 11 tables** | **pass — `npm run check:schema`** |
| X1-X5, X8 | offline / bad key / concurrent ids | not run |

### Corrections to this plan

- **A9 expectation was wrong.** The component form shows an *inline* error, not
  an `alert()`. Behaviour is correct; the plan was not.
- **A6 expectation was wrong.** The province combobox restores the last valid
  label on blur rather than alerting. Free text can never be committed, so the
  outcome is safe.

## Lost-write window on edit and delete — fixed 2026-08-19

`components/firm-form.tsx` had three write paths. Only **create** awaited the
remote save before navigating:

| Path | Before | After |
|---|---|---|
| create | `await currentRemoteSave()` then `router.push` | unchanged |
| edit | `router.push` immediately | now awaits |
| delete | `router.push` immediately | now awaits |

The delete case was the worse of the two: a delete that never reached Supabase
removed the company locally while it lived on remotely, so the next sync
resurrected it.

**Verified before changing anything:** `queueSave` attaches `.catch()`, so
`apiSavePromise` always *resolves* and can never throw past `router.push`. When
Supabase is unconfigured `queueSave` returns early and `currentRemoteSave()`
returns `null`, so `await null` proceeds immediately — local-only mode does not
hang. Both properties are pinned in `lib/store.test.ts`; suite is 26/26,
typecheck and build clean, dev server recompiled with no errors.

**Expected behavioral change:** Save now stays disabled for two round trips (the
row, then its audit entry) before redirecting — roughly half a second. That is
the fix working, not a hang.

**Not verified here:** the actual form submit. The browser pane cannot drive
`/companies/[firmId]/edit` (Suspense stalls in a hidden tab), so this needs a
real click.

## Bug found during your click-through — 2026-08-19

**Symptom:** every save showed "Not saved to the database. This change exists
only in this browser. Failed to save audit_log <uuid>: Could not find the
'review_status' column of 'audit_log' in the schema cache".

**Root cause:** `rowForApi` in `lib/api.ts` seeded `{visibility_level,
review_status}` into the payload *before* filtering by the `COLUMNS` allowlist.
Ten of the eleven tables have both columns. `audit_log` has neither — it has
exactly `audit_id, ts, role, action, target_table, target_id, summary`. So every
audit write was rejected with PGRST204.

**Why it looked worse than it was:** `queueRowSave` writes the data row, *then*
the audit row. The data row succeeded every time; the audit row failed and
rejected the shared promise, which raised the banner. So the message was wrong —
the company and component **did** reach Supabase. What was actually lost was the
audit trail.

**Fix:** `rowForApi` now drives entirely off `COLUMNS`, applying a governance
default only when that table actually has the column. Nothing outside the
allowlist can reach PostgREST.

**Pinned:** three tests in `lib/api.test.ts`, one of them generic over all 11
tables ("rowForApi never emits a key outside that table's column allowlist"), so
the next table with a different column set cannot reintroduce it. Verified
end-to-end by POSTing the payload `rowForApi` actually builds to the live
`audit_log` — 201. Suite is 24/24.

**Consequence for your test data:** audit entries for everything done before this
fix were never written, so `/audit` will not show that pass. It cannot be
reconstructed.

**Cleanup done — and a correction.** The only row the click-through actually
added was `F014` "Cool Company"; it had no child rows and nothing referenced it.
Deleted, counts back to baseline 9 / 22 / 2 / 181 / 66, firms `F005`-`F013`.

An earlier note in this file claimed `P030`/`P031` were test rows and that
`P008`/`P009` had been deleted. Both wrong. `P030` "Cool Component" and `P031`
"Cooler Component" carry `created_at: 2026-07-16`, before the migration — they
are original migrated data belonging to `F013` "Test", itself a pre-existing
company from the old AWS system. And the 22-product baseline was always
`P010`-`P031`; nothing was ever deleted. Products never moved off 22 at any
point. Deleting `P030`/`P031` would have destroyed real data.

## Re-verification — 2026-08-19 (second pass)

Everything below was re-run from scratch on the live project, not carried over.

| Check | Result |
|---|---|
| `npm test` | **21/21 pass** (`lib/roles.test.ts` + `lib/api.test.ts`) |
| `npm run typecheck` | clean |
| `npm run build` | clean — 16 routes, **no `/login`, `/my-company`, `/admin/access`** |
| Account revert leftovers | grep for login/auth/users/password across `app` `components` `lib`: **none** |
| Baseline counts before | 9 / 22 / 2 / 181 / 66 |
| A4 insert firm (anon) | **201** |
| A7 read back (anon) | row returned |
| A8 insert component (anon) | **201** |
| D6 flip to draft | 204, **and the draft is still readable** |
| D18 insert audit row | **201** |
| Audit append-only | UPDATE → `[]`, DELETE → `[]`, original summary intact |
| D4 delete firm | 204, component **cascaded away** |
| Counts after cleanup | 9 / 22 / 2 / 181 / 66 — back to baseline, no residue |

Fixed this pass: `.env` still described `SUPABASE_SERVICE_ROLE_KEY` as read by
`app/api/admin/users/route.ts`, a route the revert deleted. The comment now says
unused, do not set it in Vercel.

## Run log — 2026-08-19

`database/supabase-writes.sql` is applied (anon now sees all 66 `audit_log`
rows; it saw 0 before).

**Passed at the database layer**, driven with the anon key against the live
project — the same identity and payload shape the browser sends. Test rows
`F-TEST-1` / `P-TEST-1` / `A-TEST-1` were created and removed; counts are back
to baseline (9 / 22 / 66 / 2 / 181).

| Test | Result |
|---|---|
| A4 insert firm | 201 |
| A7 read back as anon | row returned |
| A8 insert component | 201 |
| D3 update firm | 204, value changed |
| D6 flip component to draft | 204, **and still readable** — the policy change works |
| D18 insert audit row | 201 |
| audit is append-only | UPDATE and DELETE both affected 0 rows, row intact |
| D4 delete firm | 204, component cascaded away |

**Passed in the browser:** A1 (`/analysis` → `/companies`, pill `Analyst`),
A2 (sidebar is exactly Dashboard / Search / Companies), A4 button present,
A13 no Edit links, P3 9 companies loaded from Supabase, and the two you asked
about — **A15 `/audit` and A16 `/admin` both show "Locked: requires Admin
role."**

**Pinned as a permanent check:** `lib/roles.test.ts` asserts the full role
matrix. 21/21 tests pass.

**Could not run here — needs your eyes, not a defect:** the automated browser
tab is permanently `visibilityState: "hidden"`, so routes that swap out a
Suspense fallback after hydration (`/companies/new`, `/companies/[firmId]`)
sit on the loading skeleton. The server renders them correctly in under a
second. That leaves A5, A6, A9–A12, A18–A20, the whole Public and Admin
click-through, and X1–X7 for a real browser.

## Before you start: apply the write migration

Until `database/supabase-writes.sql` is run in the Supabase SQL editor, RLS
allows reads only and **every write test below will look successful in the UI
and change nothing in the database**. Verified before the fix: the anon key saw
0 of the 66 real `audit_log` rows.

After applying it, re-check X4 and X5 — they were data-loss paths under the old
whole-dataset save and should now pass.

## Standing caveats

- **Roles are a frontend guarantee, not a database one.** There is one database
  identity (the anon key) and it can do everything. `/coolAdmin` is reachable by
  anyone, and the anon key is readable in the JS bundle. Tests A15 and A16
  confirm the *UI* locks an analyst out of logs and admin, which is what was
  asked for — they are not a security boundary.
- **Draft is a workflow state, not a confidentiality boundary.** Draft
  components are readable through the API by design, otherwise they would
  vanish from the app on the next sync. The frontend hides them from Public and
  Analyst.
