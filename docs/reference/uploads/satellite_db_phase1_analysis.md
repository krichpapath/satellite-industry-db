# Thai Satellite Industry Database — Phase 1 Analysis
**Scope:** Database design & Data Input subsystem only
**Primary user:** Satellite Industry Expert / Data Planner
**Source of truth:** `Inception_report.docx` (Thai). Sibling documents used only for orientation, not for requirements.

---

## 0. One-paragraph project summary

The Inception Report (§"บทนำ") defines a **central national database for Thailand's satellite industry** whose job is to ingest currently fragmented data — held across government agencies, private firms, and research institutes — and re-publish it as a standardized, governed, queryable record set that can support policy analysis, technology roadmapping, investment promotion, and ecosystem mapping. The system has three pillars (**Database System**, **User Interface**, **Data Visualization**) and three architectural tiers (**Presentation / Application / Data**, §"สถาปัตยกรรมระบบฐานข้อมูล"). The schema is anchored on **Firm-Level Information**, with six additional data domains attached via relational keys (§"ขอบเขตและประเภทข้อมูลในระบบฐานข้อมูล"). This phase delivers **only** the Data Layer schema and the **Data Management Interface** (§"5. ระบบจัดการข้อมูล") — the data planner's workbench. Public dashboards, search UX, value-chain network views, and ecosystem analysis screens are explicitly deferred.

---

## 1. Six analysis questions

### Q1 — What is this about?
A national-scale **relational database + data management interface** for the Thai satellite industry that consolidates organization, technology, value-chain, HR, supply-chain, investment, and ESG data into one trusted source (§"บทนำ"; §"อุตสาหกรรมดาวเทียมและความสำคัญของระบบฐานข้อมูล"). The report frames the database not as a directory of company names, but as a **strategic data system** linking firm records to industry structure and ecosystem indicators (§"ขอบเขตและประเภทข้อมูลในระบบฐานข้อมูล"). Phase 1 builds the spine — the schema and the planner's input tooling — that everything else hangs off.

### Q2 — What is the goal?
Per §"บทนำ" and §"ประโยชน์ที่คาดว่าจะได้รับ":

- **Aggregate** scattered data into one repository with a *unified view* (Data Integration, §"1. Data Integration").
- **Standardize** organization names, technology categories, industry codes, and geospatial formats so cross-source records become comparable (§"3. Data Standardization").
- **Govern** the data: ownership, access control, quality checks, auditability (§"4. Data Governance").
- **Enable** downstream analytics: Technology Roadmapping, Technology Gap Analysis, Industrial Gap Analysis, value-chain mapping, investment promotion, and international cooperation visibility (§"ประโยชน์ที่คาดว่าจะได้รับ").

**Phase-1-specific goal:** produce a **traceable, dedup'd, version-controlled corpus** of firm records and their seven domains of attached data, so downstream UIs (deferred) can be built on a stable substrate.

### Q3 — What is the requirement?
Five design principles are explicitly named in §"แนวคิดและหลักการการออกแบบระบบฐานข้อมูล". Each translates to a concrete engineering obligation:

| Principle (source) | Phase-1 engineering obligation |
|---|---|
| **Data Integration** (Lenzerini, 2002) | Schema must reconcile records arriving from multiple sources; needs a `source_id` on every row and a strategy for merging duplicates. |
| **Data Transformation / ETL** (Kimball & Caserta, 2004) | Need a **staging area** separate from production tables; import → validate → transform → load workflow, not direct writes from CSV. |
| **Data Standardization** (Batini et al., 2009) | Reference/taxonomy tables for controlled vocab (org type, value-chain segment, TRL, ISIC, ESG). Forms must use dropdowns sourced from these, not free text. |
| **Data Governance** (Otto, 2011) | Each record carries owner, source, confidence, valid period. Edits go through audit. Roles control who can write/approve (§"5. ระบบจัดการข้อมูล", citing Sandhu & Samarati, 1996). |
| **Scalability** (Silberschatz et al., 2002) | RDBMS with normalized schema; Application Layer mediates all DB access (§"สถาปัตยกรรมระบบฐานข้อมูล"); design hooks for future API ingestion even though Phase 1 is manual/CSV. |

**Architectural requirement** (§"สถาปัตยกรรมระบบฐานข้อมูล"): three tiers. *Validation logic lives in the Application Layer, not the database and not the form.* Forms can do inline UX-level checks, but authoritative validation (referential integrity, source attribution, role checks) must be enforced server-side before the Data Layer is touched.

### Q4 — Which data types are needed?
Per §"ขอบเขตและประเภทข้อมูลในระบบฐานข้อมูล", **seven domains**, all linked through Firm-Level Information as the relational anchor (the report makes this explicit at the end of the section):

1. **Firm-Level Information** *(anchor)* — name, business registration number, founded year, ownership structure, location, contact info, industry type.
2. **Industrial Structure & Value Chain** — segment (**Upstream / Midstream / Downstream**), product or service type, technology level of the product, quality certifications, target markets.
3. **Technology & Innovation** — core technologies developed, patent count, R&D investment, R&D headcount, **Technology Readiness Level (TRL)**, R&D infrastructure (labs, test equipment, software / embedded systems capability).
4. **Human Resource & Skill** — workforce composition (engineers, researchers, technicians), specialized skills, training participation, skill gaps.
5. **Supply Chain & Ecosystem Mapping** — firm-to-firm relationships: parts manufacturers, technology providers, raw material suppliers, customers, strategic partners.
6. **Investment & Financial Indicators** — technology investment, access to funding, government incentives received, revenue, export share.
7. **Sustainability & ESG Indicators** — energy use, GHG emissions, renewable energy share, waste management, environmental certifications (ISO 14001, ESG standards).

**[INFERRED]** Two domains are required by the report's principles but not enumerated as data categories:

- **Source / Provenance table** — required by Data Governance (§"4. Data Governance") to record where each datum came from (gov registry, BOI, NRIIS, research report, manual entry, scraped).
- **Reference / Taxonomy tables** — required by Data Standardization (§"3. Data Standardization") to back controlled-vocab dropdowns (TRL 1–9, value-chain segments, ISIC codes, ESG framework names).

### Q5 — What are the limitations?

**Stated in the Inception Report:**
- Data is currently scattered across government, private sector, and research institutions, making consolidation difficult (§"อุตสาหกรรมดาวเทียมและความสำคัญของระบบฐานข้อมูล").
- Source data has inconsistent formats, structures, and units of measurement (§"2. Data Transformation").
- Inconsistencies in organization names, technology categories, and industry taxonomies across sources (§"3. Data Standardization").
- Risk of inaccurate or non-traceable data without explicit governance hooks (§"4. Data Governance").
- System must absorb future growth in data volume and user count (§"5. Scalability").

**[INFERRED] practical risks for the input phase** (called out because the report is silent but the developer will hit them on day one):
- **Controlled-vocab drift** — if planners can type free-text into "industry segment" or "TRL," the standardization principle collapses within weeks.
- **Duplicate firms across registries** — the same juristic entity appears under slightly different names in BOI, DBD, NRIIS exports. Need fuzzy matching + a merge tool.
- **Bilingual content** — official Thai sources use Thai company names; international references use English. Every name-bearing field needs `_th` and `_en` variants.
- **Missing TRL** — most Thai firms have never self-classified to TRL. Field must be nullable + carry a confidence indicator.
- **ESG self-reporting bias** — ESG and emissions data, when present, is self-reported. Confidence / source attribution is essential.
- **Patent and financial data confidentiality** — firms will not always disclose. Records must tolerate nulls without invalidating the row; downstream UIs must respect non-disclosure flags.
- **Phase-1 ingestion is manual / CSV only** — no live API integration; planners are the bottleneck. Bulk-import UX quality directly determines throughput.

### Q6 — Required features (Phase 1, data-planner-facing)

Derived strictly from §"5. ระบบจัดการข้อมูล", §"4. Data Governance", and §"การออกแบบโครงสร้างฐานข้อมูล", plus principle-driven inferences:

| # | Feature | Source |
|---|---|---|
| F1 | Role-based authentication & authorization (planner / reviewer / admin) | §"5. ระบบจัดการข้อมูล" + Sandhu & Samarati |
| F2 | Form-driven CRUD for each of the 7 data domains | §"5. ระบบจัดการข้อมูล" |
| F3 | Inline + server-side validation (format, range, referential integrity) | §"แนวคิดและหลักการ" (Data Quality) |
| F4 | Reference/taxonomy admin (TRL, value-chain segments, ISIC, ESG) | §"3. Data Standardization" **[INFERRED screen]** |
| F5 | Source attribution required on every record | §"4. Data Governance" |
| F6 | Bulk CSV/Excel upload with staging area + dry-run + error report | §"2. Data Transformation" (ETL) **[INFERRED UX]** |
| F7 | Duplicate detection & merge tool (juristic-ID exact + name fuzzy) | §"1. Data Integration" **[INFERRED]** |
| F8 | Audit trail (created_by, updated_by, valid_from, valid_to, change history) | §"4. Data Governance" |
| F9 | Bilingual field support (Thai + English) on all name-bearing fields | **[INFERRED]** — required by Thai context |
| F10 | Approval queue (planner submits, reviewer approves) | **[INFERRED]** — implied by Access Control + governance |

---

## 2. Data Planner — user flow mapping

Eight core flows. Each is described as **trigger → screens → validations → DB writes**, with explicit deferral of any UI not relevant to Phase 1.

### Flow 1 — Onboard a new firm *(the anchor flow)*
- **Trigger:** Planner gets a new firm from a BOI list / news / referral.
- **Screens:** New Firm form → fields for `juristic_id` (13-digit), `name_th`, `name_en`, founded_year, ownership type, HQ address, contact, industry_type (dropdown).
- **Validation:** Mandatory juristic_id with regex `^\d{13}$`. On blur, server checks for duplicate juristic_id and runs fuzzy match on names → if hit, surface candidates and offer "link to existing" instead of creating new.
- **DB writes:** `INSERT INTO firm (...)` + `INSERT INTO firm_source` mapping which source supplied this record + `INSERT INTO audit_log`.
- **Status:** record starts in `draft` or `pending_review` per F10.

### Flow 2 — Attach value-chain position
- **Trigger:** Firm record exists; planner has confirmed the segment.
- **Screens:** On firm detail page, "Value Chain" tab → select segment (`Upstream | Midstream | Downstream`), then sub-activity, product/service descriptor, tech level, certifications (multi-select from reference table), target markets (multi-select).
- **Validation:** Segment is mandatory; sub-activity dropdown is *dependent* on segment selection; certifications must come from the reference table — no free text.
- **DB writes:** `INSERT INTO firm_valuechain (firm_id, segment_id, …)` — note this is **many-to-one** because a firm can occupy more than one segment (e.g., a downstream service provider that also builds ground equipment).

### Flow 3 — Record technology profile
- **Trigger:** Tech disclosure available (patent listing, R&D report, interview notes).
- **Screens:** "Technology" tab → core technologies (multi-select), patent count, R&D spend (THB), R&D headcount, TRL (1–9 dropdown), R&D infrastructure checklist (labs, test equipment, embedded systems).
- **Validation:** Patent count ≥ 0; R&D spend numeric; TRL nullable but if filled must be 1–9; each technology entry must carry a `source_id`.
- **DB writes:** `INSERT INTO firm_technology` rows (one per technology) + scalar fields onto `firm_tech_profile` (1-to-1 with firm, with `valid_from` / `valid_to` for versioning).

### Flow 4 — Map HR & skill data
- **Trigger:** HR data received from firm survey or labor statistics extract.
- **Screens:** "Human Resource" tab → counts per role (engineers, researchers, technicians, other), skill checklist, training programs participated, identified skill gaps (free text capped + tagged).
- **Validation:** Counts are non-negative integers; skill checklist sourced from reference table; gap entries auto-tagged with `valid_from` (the reporting year).
- **DB writes:** `INSERT INTO firm_hr_snapshot` — **time-series**: a firm has many snapshots over years; do not overwrite the prior year.

### Flow 5 — Link supply-chain relationships *(firm-to-firm edges)*
- **Trigger:** Planner has identified a supplier or customer relationship.
- **Screens:** "Supply Chain" tab → "Add relationship" → pick **target firm** via autocomplete (searches existing firm table; if not found, prompt to onboard first via Flow 1), select relationship type (`supplier | customer | partner | tech_provider | raw_material`), add description, source attribution.
- **Validation:** Both firms must already exist in the table (no orphan edges); relationship type from reference table; no self-loop (`firm_id ≠ target_firm_id`); duplicate edge check.
- **DB writes:** `INSERT INTO firm_relationship (firm_id, target_firm_id, relationship_type_id, …)` — this is the **junction table** that will power the deferred Value Chain network visualization. Schema must be **directed**; the same pair can have edges in both directions with different types.

### Flow 6 — Capture investment & ESG indicators
- **Trigger:** Annual financial filings or ESG disclosures available.
- **Screens:** Two tabs.
  - **Investment:** revenue (THB), export share %, government incentive flags (BOI promoted? Year? Category?), funding rounds.
  - **ESG:** energy use, GHG emissions, renewable %, waste management, certifications (ISO 14001, others, multi-select from reference).
- **Validation:** Percentages 0–100; numeric fields ≥ 0; each indicator carries `reporting_year`; confidence flag (`reported | estimated | derived`) is **required** to satisfy ESG self-reporting risk.
- **DB writes:** `INSERT INTO firm_financial_snapshot` and `INSERT INTO firm_esg_snapshot`, both time-series.

### Flow 7 — Bulk import (CSV / Excel)
- **Trigger:** Planner has a sheet from BOI / DBD / NRIIS / GISTDA.
- **Screens:**
  1. **Template selection** — pick which domain (firm, valuechain, technology, …) the file targets. Download template if needed.
  2. **Upload** → file lands in staging.
  3. **Validate** dry-run — system runs the same server-side validations as the forms; produces an **error report** with row numbers and reason codes (`MISSING_JURISTIC_ID`, `INVALID_TRL`, `DUPLICATE_DETECTED`, `UNKNOWN_SEGMENT_CODE`, etc.).
  4. **Review staging** — planner can edit cells in the staging view, mark which duplicates merge vs create.
  5. **Commit** — only clean rows promote from staging to production; rejected rows remain in staging for re-work or discard.
- **Validation:** All Flow-1-through-6 rules apply per row; additionally, file-level checks (encoding UTF-8 for Thai, expected column headers).
- **DB writes:** `INSERT INTO staging_*` first; on commit, `INSERT INTO firm / firm_*` and `INSERT INTO import_batch` recording who imported, when, source file, success/failure counts.
- **Why staging is non-negotiable:** Kimball-style ETL is named in §"2. Data Transformation". Direct CSV→production writes violate the principle.

### Flow 8 — Edit / correct / version an existing record
- **Trigger:** Planner discovers wrong data or receives an update.
- **Screens:** Same form as creation, pre-populated. Edits go via a diff view showing "current vs proposed."
- **Validation:** All creation-time rules. Edit must include a `change_reason` (free text, mandatory).
- **DB writes:** Time-series tables (HR, financial, ESG) get a *new row* with new `valid_from`; the prior row gets `valid_to` stamped. Scalar fields on `firm` get updated **in place** but the change is mirrored to `audit_log` with before/after values.

### Flow 9 — Approval queue *(governance flow)* **[INFERRED]**
- **Trigger:** Reviewer logs in and opens "Pending Review."
- **Screens:** List of pending records grouped by domain; click into a record to see proposed changes (diff) and the planner's `change_reason`; Approve / Reject / Request Changes.
- **Validation:** Reviewer cannot approve their own submissions; rejection requires a comment.
- **DB writes:** On approve, record `status` flips from `pending_review` to `published`; on reject, flips to `draft` with reviewer comment attached.

> **Deferred (not in Phase 1):** Industry Dashboard (§"1. Dashboard"), Search & Query Interface (§"2. ระบบค้นหา"), Organization Profile public view (§"3. ส่วนรายละเอียดข้อมูลองค์กร"), Value Chain & Ecosystem Analysis visualization (§"4. ระบบวิเคราะห์ห่วงโซ่อุตสาหกรรมและเครือข่าย"). The schema must **support** them but Phase 1 ships no consumer UI.

---

## 3. Entity-Relationship outline *(text form, Firm as central node)*

```
                                       ┌────────────────────────┐
                                       │     source             │  (gov registry, BOI,
                                       │ id (PK)                │   NRIIS, GISTDA,
                                       │ name                   │   research report,
                                       │ type                   │   manual entry, API)
                                       │ url / contact          │
                                       └────────────┬───────────┘
                                                    │ source_id (FK)
                                                    │ — on EVERY record below
                ┌───────────────────────────────────┼────────────────────────────────────┐
                │                                   │                                    │
                ▼                                   ▼                                    ▼
        ┌─────────────────────────────────────────────────────────────────────────────────────┐
        │                                       FIRM                                          │
        │  firm_id (PK, surrogate)                                                            │
        │  juristic_id  (UNIQUE, 13-digit, natural key — Thai business registration number)   │
        │  name_th, name_en                                                                   │
        │  founded_year                                                                       │
        │  ownership_type_id (FK → ref_ownership_type)                                        │
        │  industry_type_id (FK → ref_industry_type)                                          │
        │  address_th, address_en, lat, lon                                                   │
        │  phone, email, website                                                              │
        │  status  (draft | pending_review | published | retired)                             │
        │  created_by, created_at, updated_by, updated_at                                     │
        │  valid_from, valid_to                                                               │
        └──┬────────┬────────┬────────┬────────┬────────┬────────┬─────────────────────┬─────┘
           │        │        │        │        │        │        │                     │
           │ 1:N    │ 1:N    │ 1:N    │ 1:N    │ 1:N    │ 1:N    │ 1:N (self via       │ 1:N
           │        │        │        │        │        │        │       junction)     │
           ▼        ▼        ▼        ▼        ▼        ▼        ▼                     ▼
   firm_valuechain firm_tech_profile firm_technology firm_hr_snapshot firm_relationship firm_financial_snapshot firm_esg_snapshot audit_log
        │              │                   │
        │              │                   │
        ▼              ▼                   ▼
  ref_valuechain  ref_trl (1-9)     ref_technology
  ref_segment                       ref_certification
                                    ref_esg_standard
                                    ref_isic
```

### Table cheat-sheet

| Table | Type | Purpose |
|---|---|---|
| `firm` | core | Anchor entity. One row per juristic firm. |
| `firm_valuechain` | M:N to ref | Firm-to-segment, multi-row allowed (firm may span Upstream + Downstream). |
| `firm_tech_profile` | 1:1 (versioned) | Scalar tech indicators per period: R&D spend, R&D HC, TRL, patent count. |
| `firm_technology` | 1:N | One row per technology a firm develops. |
| `firm_hr_snapshot` | time-series | Annual HR composition. |
| `firm_relationship` | self-junction | Directed firm-to-firm edges; powers deferred network view. |
| `firm_financial_snapshot` | time-series | Revenue, export share, government incentives. |
| `firm_esg_snapshot` | time-series | Energy, GHG, renewable %, waste, certifications. |
| `source` | governance | Provenance entries; every row in every domain references one. |
| `audit_log` | governance | Before/after for every write, with actor + reason. |
| `import_batch` | ETL | One row per CSV import; rolls up success/failure counts. |
| `staging_*` | ETL | Mirror of each production table; CSV lands here first. |
| `ref_*` | taxonomy | Controlled vocabulary tables for all dropdowns. |
| `user` / `role` / `user_role` | auth | RBAC per Sandhu & Samarati. |

### Identifier strategy
- **Surrogate PK:** integer `firm_id` (or UUID) on every table — never expose to user.
- **Natural key:** `juristic_id` (Thai 13-digit) with `UNIQUE` constraint. *This is the merge key for duplicates.*
- **Business-friendly slug:** `name_en` lower-snake for URLs (not for joins).

### Versioning
- **Scalar firm fields** (name, address, contact) — overwrite in place, mirror to `audit_log`.
- **All time-series tables** (`*_snapshot`) — new row per reporting period; never overwrite. Use `(firm_id, reporting_year)` as composite unique.
- **Tech profile** — versioned with `valid_from` / `valid_to`; queries filter by current period.

---

## 4. Input subsystem — detailed requirements

### 4.1 Form structure (per entity)
Each form has three zones: **identity** (the unique key fields, required), **payload** (the domain fields, mostly optional), and **provenance** (source + confidence + reporting period, *required*). The provenance zone is the same on every form — build it once as a shared component.

### 4.2 Inline validation rules
- **Format:** regex on `juristic_id`, email, phone; UTF-8 enforced on Thai fields.
- **Range:** TRL ∈ [1,9]; percentages ∈ [0,100]; years ∈ [1900, current_year]; counts ≥ 0.
- **Referential integrity:** every FK selector pulls from `ref_*`; no free text where a taxonomy exists.
- **Cross-field:** `valid_to ≥ valid_from`; `reporting_year ≤ current_year`; relationship `firm_id ≠ target_firm_id`.
- **Server-side reruns of all of the above** before commit — §"สถาปัตยกรรมระบบฐานข้อมูล" places validation in the Application Layer.

### 4.3 Source attribution
Per §"4. Data Governance," every datum needs provenance. Implementation:
- Form-level: each save asks "Source?" with a typeahead against `source` table (or "Add new source").
- Record-level: `source_id` column on each `firm_*` table.
- Reporting: a planner can later filter "show me all rows sourced from BOI" — needed for downstream quality audits.

### 4.4 Bulk-upload template format
- **One file per domain** (firm, valuechain, technology, …). Mixing domains in one sheet is rejected.
- **First row:** column headers matching template exactly (locale-independent, English snake_case).
- **Reserved columns:** `_row_status` (auto-filled by the validator), `_error_codes` (auto-filled).
- **Encoding:** UTF-8 with BOM (Excel-friendly).
- **Error report UX:** downloadable CSV with original rows + `_row_status` + `_error_codes` so the planner can fix and re-upload.

### 4.5 Access control matrix *(§"5. ระบบจัดการข้อมูล" + Sandhu & Samarati, 1996)*

| Action | Planner | Reviewer | Admin |
|---|---|---|---|
| Read all records | ✓ | ✓ | ✓ |
| Create draft | ✓ | ✓ | ✓ |
| Submit for review | ✓ | ✓ | ✓ |
| Approve / reject submission | — | ✓ | ✓ |
| Edit published record (creates new pending) | ✓ | ✓ | ✓ |
| Bulk import | ✓ | ✓ | ✓ |
| Manage reference tables (taxonomy) | — | — | ✓ |
| Manage users & roles | — | — | ✓ |
| Merge duplicates | — | ✓ | ✓ |
| Hard delete | — | — | ✓ *(audit-logged)* |

> **[INFERRED]** Reviewer cannot approve their own submissions — separation of duties.

---

## 5. Limitations and risks (consolidated)

**Stated in the report:**
1. Data is scattered across many agencies (§"อุตสาหกรรมดาวเทียมและความสำคัญ").
2. Source formats, structures, and units differ (§"2. Data Transformation").
3. Organization names and taxonomies are inconsistent across sources (§"3. Data Standardization").
4. Without governance, data accuracy and traceability suffer (§"4. Data Governance").
5. Future-scale loads will hit naive designs (§"5. Scalability").

**[INFERRED] — practical risks for Phase 1:**
6. Controlled-vocab drift if forms allow free text where a taxonomy exists.
7. Duplicate firms from BOI / DBD / NRIIS exports under different name spellings.
8. Bilingual Thai/English content; sort order, search, and display must respect both.
9. Sparse TRL — most firms unclassified; field must be nullable with confidence indicator.
10. ESG self-reporting bias — record confidence (`reported | estimated | derived`) on every ESG entry.
11. Confidentiality — patent and financial fields will sometimes be withheld; downstream UIs (deferred) must honor non-disclosure flags.
12. No live API ingest in Phase 1 — throughput depends entirely on planner+CSV. Bulk-import UX quality is a hard dependency.

---

## 6. MUST-HAVE vs LATER feature checklist

### MUST-HAVE (Phase 1 — ship blockers)

| ID | Feature | Supports flow |
|---|---|---|
| M1 | Schema: `firm` + 7 domain tables + `source` + `audit_log` + `ref_*` + `user/role` | All |
| M2 | RBAC with planner / reviewer / admin | All; F1, F9 |
| M3 | CRUD forms for `firm` (Flow 1) | Flow 1 |
| M4 | CRUD forms for the 6 attached domains (Flows 2–6) | Flows 2–6 |
| M5 | Inline + server-side validation | All |
| M6 | Source attribution on every record (Provenance component) | All |
| M7 | Duplicate detection on `juristic_id` + name fuzzy match, with "link to existing" | Flow 1, Flow 7 |
| M8 | Bilingual fields (`name_th`/`name_en`, `address_th`/`address_en`) | Flows 1–6 |
| M9 | Bulk CSV/Excel import → staging → dry-run → commit pipeline | Flow 7 |
| M10 | Error report download from bulk import | Flow 7 |
| M11 | Audit log with before/after + change_reason | Flow 8 |
| M12 | Versioning: scalar fields in place + audit; time-series fields as snapshots | Flow 8 |
| M13 | Approval queue (submit / approve / reject / request changes) | Flow 9 |
| M14 | Reference/taxonomy admin screens (admin-only) | F4 |
| M15 | Self-relationship junction table for supply-chain edges | Flow 5 |

### LATER / NICE-TO-HAVE

| ID | Feature | Why deferred |
|---|---|---|
| L1 | Public Industry Dashboard | §"1. Dashboard" — not data-planner UX |
| L2 | Search & Query Interface for end users | §"2. ระบบค้นหา" — consumer UI |
| L3 | Organization Profile public view | §"3. ส่วนรายละเอียด" — consumer UI |
| L4 | Value Chain & Ecosystem network visualization | §"4. ระบบวิเคราะห์ฯ" — consumer UI |
| L5 | Live API ingestion from BOI / NRIIS | Phase 1 is manual / CSV |
| L6 | Automated data-cleaning rules (regex auto-fix on import) | Manual fix in staging is fine for Phase 1 |
| L7 | Workflow templates (e.g., "annual ESG refresh" wizards) | Optimization once volume is known |
| L8 | Notifications & assignment routing in approval queue | Email + in-app banner is enough |
| L9 | Field-level access control (hide financials from some reviewers) | Coarse RBAC sufficient for Phase 1 |
| L10 | Audit-log diff visualization tools | Plain JSON snapshot is enough until volume requires UX |

---

## 7. Open questions for the developer (max 5, each unblocks a real decision)

1. **Value-chain sub-segmentation taxonomy** — §"ขอบเขตและประเภทข้อมูล" enumerates only Upstream / Midstream / Downstream. Before building the dependent dropdown in Flow 2, we need the authoritative sub-segment list (e.g., for Upstream: payload manufacturing, bus manufacturing, AIT services, propulsion, structural components). Is there a project-side document defining this, or do we adopt SIA's segmentation, OECD's, or define our own with the steering committee?

2. **Primary natural key for firm dedup** — the report references "หมายเลขจดทะเบียนธุรกิจ" (business registration number). Confirming this means **Thailand's 13-digit juristic person number** (DBD), not BOI promotion certificate ID nor NRIIS organization ID. This decides the `UNIQUE` constraint and the merge logic. Confirm or specify the alternative.

3. **Approval workflow depth** — §"5. ระบบจัดการข้อมูล" implies role-restricted writes but doesn't specify whether published records require a second-pair-of-eyes review or just admin authorization. Is the Flow-9 planner→reviewer pipeline required for Phase 1, or can we ship single-role write and add the queue in a Phase 1.5?

4. **Confidentiality tiers per field** — some financial, patent, and ESG fields may be confidential. Do we need a per-field `access_level` column now (so downstream UIs can hide them later), or is it acceptable to mark entire records as confidential at the row level? This affects whether we add columns to every `firm_*` table now or later.

5. **Priority source agencies for bulk-import templates** — Flow 7 templates must match agency export formats. Which agencies must Phase 1 support out of the box: BOI promotion data, DBD juristic registry, NRIIS researcher / project data, GISTDA satellite operator list, others? Their CSV column sets differ and templates must be designed against real exports, not guesses.

---

*Prepared for the lead developer. All claims are grounded in `Inception_report.docx`; section names cited in Thai as they appear in the source. Items not stated in the report are tagged `[INFERRED]` and justified.*
