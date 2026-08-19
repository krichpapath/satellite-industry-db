import type { Database, Firm, OwnershipType, RecordState } from "./schema";
import { DEFAULT_VOCAB } from "./schema";
import { COMPONENT_SYSTEMS, cleanComponentLabel, findComponentPath, modulesForSystem, normalizeSystem } from "./component-taxonomy";
import { sanitizeRichText } from "./rich-text";
import { db, supabaseConfigured } from "./supabase";

type RawRecord = Record<string, unknown>;
export type ApiTableKey = Exclude<keyof Database, "vocab">;

// Frontend dataset key -> Postgres table. Mirrors TABLES in the retired
// backend-lambda/index.mjs; PostgREST exposes these table names directly.
const TABLE_NAMES: Record<ApiTableKey, string> = {
  sources: "data_sources",
  firms: "firms",
  size_finance: "firm_size_finance",
  products: "products_services",
  tech: "technology_capability",
  facilities: "infrastructure_facility",
  hr: "human_resource_profile",
  linkages: "supply_chain_linkage",
  collabs: "collaboration_network",
  esg: "sustainability_esg",
  audit: "audit_log"
};

const DATASET_KEYS = Object.keys(TABLE_NAMES) as ApiTableKey[];

export const PRIMARY_KEY: Record<ApiTableKey, string> = {
  sources: "source_id",
  firms: "firm_id",
  size_finance: "firm_id",
  products: "product_id",
  tech: "tech_id",
  facilities: "facility_id",
  hr: "hr_id",
  linkages: "linkage_id",
  collabs: "collab_id",
  esg: "esg_id",
  audit: "audit_id"
};

// Verified against PostgREST's OpenAPI spec for the live project. This is not
// decoration: replace_dataset() feeds jsonb_populate_recordset, which silently
// ignores keys that are not columns, but a direct PostgREST write rejects the
// whole request with PGRST204. Three frontend fields have no column and were
// being dropped invisibly -- firms.last_updated_ts (the column is updated_at),
// products.record_state (mapped to review_status), audit.firm_id (no column).
export const COLUMNS: Record<ApiTableKey, readonly string[]> = {
  sources: ["source_id", "name", "url", "owner", "last_synced", "notes", "visibility_level", "review_status"],
  firms: ["firm_id", "firm_name", "registration_no", "year_established", "ownership_type", "parent_company", "industry_code", "province", "industrial_zone", "website", "contact_email", "source_id", "visibility_level", "review_status", "updated_at"],
  size_finance: ["firm_id", "employees_total", "engineers", "annual_revenue_mthb", "export_percentage", "production_capacity", "capital_investment_mthb", "gov_incentives", "funding_access", "offset_agreement", "source_id", "visibility_level", "review_status"],
  products: ["product_id", "firm_id", "product_name", "system", "module", "component_name", "product_trl", "flight_heritage", "description", "source_id", "visibility_level", "review_status"],
  tech: ["tech_id", "firm_id", "core_technology", "trl_level", "rd_expenditure_mthb", "rd_personnel", "patents_count", "patent_field", "digitalization_level", "source_id", "visibility_level", "review_status"],
  facilities: ["facility_id", "firm_id", "testing_lab", "simulation_tools", "manufacturing_process", "software_capability", "source_id", "visibility_level", "review_status"],
  hr: ["hr_id", "firm_id", "technician_count", "skill_specialization", "training_programs", "skill_gap", "source_id", "visibility_level", "review_status"],
  linkages: ["linkage_id", "firm_id", "partner_firm_id", "linkage_type", "dependency_level", "domestic_or_import", "source_id", "visibility_level", "review_status"],
  collabs: ["collab_id", "firm_id", "partner_type", "partner_name", "collaboration_type", "duration_years", "source_id", "visibility_level", "review_status"],
  esg: ["esg_id", "firm_id", "energy_consumption_mwh", "renewable_energy_ratio", "carbon_emission_tco2", "waste_management_system", "esg_certification", "source_id", "visibility_level", "review_status"],
  audit: ["audit_id", "ts", "role", "action", "target_table", "target_id", "summary"]
};

// A blank form field is "" for text and 0 for a cleared number input. Neither is
// NULL and the database rejects both:
//   source_id ""        -> no such data_sources row, violates *_source_id_fkey
//                          (the column is a nullable FK on every table)
//   year_established 0  -> fails CHECK (... BETWEEN 1800 AND 2100)
// The retired createFirm() coerced these field by field. Doing it here covers
// every table and every write path.
const BLANK_IS_NULL = new Set(["source_id", "year_established"]);

// visibility_level / review_status are NOT NULL with no frontend equivalent, so
// they default here. Row values win.
const GOVERNANCE_DEFAULTS: RawRecord = { visibility_level: "internal", review_status: "published" };

export function rowForApi(key: ApiTableKey, row: RawRecord): RawRecord {
  const shaped =
    key === "products"
      ? productForApi(row as unknown as Database["products"][number])
      : key === "firms"
        ? { ...row, updated_at: row.last_updated_ts ?? new Date().toISOString() }
        : row;

  // Drive everything off COLUMNS so nothing outside the allowlist can reach
  // PostgREST. Seeding the governance defaults ahead of this loop instead put
  // them on audit_log, which has neither column, and PGRST204 failed every
  // audit write -- so each edit saved its data row, then reported "not saved".
  const out: RawRecord = {};
  for (const column of COLUMNS[key]) {
    const value = shaped[column];
    if (value === undefined) {
      if (column in GOVERNANCE_DEFAULTS) out[column] = GOVERNANCE_DEFAULTS[column];
      continue;
    }
    out[column] = BLANK_IS_NULL.has(column) && !value ? null : value;
  }
  return out;
}

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null;
}

function toString(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toNumber(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function toBool(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const next = value.toLowerCase();
    if (next === "true" || next === "1" || next === "yes") return true;
    if (next === "false" || next === "0" || next === "no") return false;
  }
  return fallback;
}

function normalizeOwnership(value: unknown): OwnershipType {
  const next = toString(value, "Local").toLowerCase();
  if (next === "jv" || next.includes("joint")) return "JV";
  if (next.includes("foreign")) return "Foreign";
  return "Local";
}

function normalizeRecordState(value: unknown): RecordState {
  const state = toString(value).toLowerCase();
  return state === "draft" ? "draft" : "public";
}

function normalizeFirm(row: unknown): Firm | null {
  if (!isRecord(row)) return null;
  const firmId = toString(row.firm_id ?? row.id);
  const firmName = toString(row.firm_name ?? row.name);
  if (!firmId || !firmName) return null;

  return {
    firm_id: firmId,
    firm_name: firmName,
    registration_no: toString(row.registration_no),
    year_established: toNumber(row.year_established),
    ownership_type: normalizeOwnership(row.ownership_type),
    parent_company: toString(row.parent_company) || undefined,
    industry_code: toString(row.industry_code),
    province: toString(row.province),
    industrial_zone: toString(row.industrial_zone) || undefined,
    website: toString(row.website) || undefined,
    contact_email: toString(row.contact_email) || undefined,
    source_id: toString(row.source_id) || undefined,
    last_updated_ts: toString(row.updated_at ?? row.last_updated_ts ?? row.created_at) || undefined
  };
}

// vocab_terms is (vocab_key, term, sort_order) rows; the frontend wants
// {key: [term, ...]}. The Lambda did this fold server-side.
export function normalizeVocab(rows: unknown[]): Database["vocab"] {
  const out = Object.fromEntries(
    Object.entries(DEFAULT_VOCAB).map(([key, values]) => [key, [...values]])
  ) as unknown as Database["vocab"];

  const grouped = new Map<string, string[]>();
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const key = toString(row.vocab_key);
    const term = toString(row.term);
    if (!key || !term) continue;
    const terms = grouped.get(key);
    if (terms) terms.push(term);
    else grouped.set(key, [term]);
  }

  // Only override defaults for keys the DB actually has, so an empty
  // vocab_terms table leaves DEFAULT_VOCAB intact.
  for (const key of Object.keys(out) as (keyof Database["vocab"])[]) {
    const terms = grouped.get(key);
    if (terms?.length) out[key] = terms;
  }

  return out;
}

function normalizeRows<T>(rows: unknown[], normalize: (row: RawRecord) => T): T[] {
  return rows.filter(isRecord).map(normalize);
}

function normalizeFinance(row: RawRecord): Database["size_finance"][number] {
  return {
    ...row,
    firm_id: toString(row.firm_id),
    employees_total: toNumber(row.employees_total),
    engineers: toNumber(row.engineers),
    annual_revenue_mthb: toNumber(row.annual_revenue_mthb),
    export_percentage: toNumber(row.export_percentage),
    production_capacity: toString(row.production_capacity) || undefined,
    capital_investment_mthb: toNumber(row.capital_investment_mthb),
    gov_incentives: toString(row.gov_incentives) || undefined,
    funding_access: toString(row.funding_access) || undefined,
    offset_agreement: toString(row.offset_agreement) || undefined
  } as Database["size_finance"][number];
}

function normalizeProduct(row: RawRecord): Database["products"][number] {
  const productName = toString(row.product_name ?? row.component_name);
  const componentName = cleanComponentLabel(toString(row.component_name ?? row.sia_category)) || productName;
  const path = findComponentPath(componentName);
  const fallbackSystem = COMPONENT_SYSTEMS[0] ?? "";
  const fallbackModule = fallbackSystem ? modulesForSystem(fallbackSystem)[0] ?? "" : "";

  const system = normalizeSystem(toString(row.system ?? row.orbit_type ?? path?.system, fallbackSystem));
  const module = system === "Unidentified" ? "Unidentified" : toString(row.module ?? row.itu_service_class ?? path?.module, fallbackModule);
  const normalizedComponentName = system === "Unidentified" || module === "Unidentified" ? "Unidentified" : componentName;
  const rawTrl = row.product_trl;
  const productTrl = rawTrl === "Unidentified"
    ? "Unidentified"
    : Number.isInteger(Number(rawTrl)) && Number(rawTrl) >= 1 && Number(rawTrl) <= 9
      ? Number(rawTrl)
      : undefined;

  return {
    product_id: toString(row.product_id),
    firm_id: toString(row.firm_id),
    product_name: productName || normalizedComponentName || "Unspecified product",
    component_name: normalizedComponentName || "Unspecified component",
    system,
    module,
    product_trl: productTrl,
    flight_heritage: toString(row.flight_heritage) || undefined,
    description: sanitizeRichText(row.description) || undefined,
    record_state: normalizeRecordState(row.record_state ?? row.review_status)
  } as Database["products"][number];
}

function productForApi(row: Database["products"][number]): RawRecord {
  const normalized = normalizeProduct(row as unknown as RawRecord);
  const { record_state, ...columns } = normalized;
  return {
    ...columns,
    // record_state is the frontend's name for review_status; the column itself
    // does not exist. Dropped with the Lambda: value_chain_stage,
    // technology_intensity, sia_category, itu_service_class, orbit_type -- those
    // only existed to satisfy the old taxonomy validation.
    product_trl: normalized.product_trl === "Unidentified" ? null : normalized.product_trl,
    flight_heritage: normalized.flight_heritage || null,
    visibility_level: "internal",
    review_status: record_state === "draft" ? "draft" : "published"
  };
}

function normalizeTech(row: RawRecord): Database["tech"][number] {
  return {
    ...row,
    tech_id: toString(row.tech_id),
    firm_id: toString(row.firm_id),
    core_technology: toString(row.core_technology),
    trl_level: toNumber(row.trl_level),
    rd_expenditure_mthb: toNumber(row.rd_expenditure_mthb),
    rd_personnel: toNumber(row.rd_personnel),
    patents_count: toNumber(row.patents_count),
    patent_field: toString(row.patent_field) || undefined,
    digitalization_level: toNumber(row.digitalization_level)
  } as Database["tech"][number];
}

function normalizeFacility(row: RawRecord): Database["facilities"][number] {
  return {
    ...row,
    facility_id: toString(row.facility_id),
    firm_id: toString(row.firm_id),
    testing_lab: toBool(row.testing_lab),
    simulation_tools: toBool(row.simulation_tools),
    manufacturing_process: toString(row.manufacturing_process) || undefined,
    software_capability: toString(row.software_capability) || undefined
  } as Database["facilities"][number];
}

function normalizeHr(row: RawRecord): Database["hr"][number] {
  return {
    ...row,
    hr_id: toString(row.hr_id),
    firm_id: toString(row.firm_id),
    technician_count: toNumber(row.technician_count),
    skill_specialization: toString(row.skill_specialization),
    training_programs: toString(row.training_programs) || undefined,
    skill_gap: toString(row.skill_gap) || undefined
  } as Database["hr"][number];
}

function normalizeLinkage(row: RawRecord): Database["linkages"][number] {
  return {
    ...row,
    linkage_id: toString(row.linkage_id),
    firm_id: toString(row.firm_id),
    partner_firm_id: toString(row.partner_firm_id),
    linkage_type: toString(row.linkage_type, "Partner"),
    dependency_level: toNumber(row.dependency_level),
    domestic_or_import: toString(row.domestic_or_import, "Domestic")
  } as Database["linkages"][number];
}

function normalizeCollab(row: RawRecord): Database["collabs"][number] {
  return {
    ...row,
    collab_id: toString(row.collab_id),
    firm_id: toString(row.firm_id),
    partner_type: toString(row.partner_type, "University"),
    partner_name: toString(row.partner_name),
    collaboration_type: toString(row.collaboration_type, "R&D"),
    duration_years: toNumber(row.duration_years)
  } as Database["collabs"][number];
}

function normalizeEsg(row: RawRecord): Database["esg"][number] {
  return {
    ...row,
    esg_id: toString(row.esg_id),
    firm_id: toString(row.firm_id),
    energy_consumption_mwh: toNumber(row.energy_consumption_mwh),
    renewable_energy_ratio: toNumber(row.renewable_energy_ratio),
    carbon_emission_tco2: toNumber(row.carbon_emission_tco2),
    waste_management_system: toBool(row.waste_management_system),
    esg_certification: toString(row.esg_certification) || undefined
  } as Database["esg"][number];
}

type DatasetRows = Record<ApiTableKey, unknown[]>;

function normalizeDatabase(rows: DatasetRows, vocabRows: unknown[]): Database {
  const firms = rows.firms
    .map(normalizeFirm)
    .filter((firm): firm is Firm => Boolean(firm));

  return {
    firms,
    size_finance: normalizeRows(rows.size_finance, normalizeFinance),
    products: normalizeRows(rows.products, normalizeProduct),
    tech: normalizeRows(rows.tech, normalizeTech),
    facilities: normalizeRows(rows.facilities, normalizeFacility),
    hr: normalizeRows(rows.hr, normalizeHr),
    linkages: normalizeRows(rows.linkages, normalizeLinkage),
    collabs: normalizeRows(rows.collabs, normalizeCollab),
    esg: normalizeRows(rows.esg, normalizeEsg),
    sources: rows.sources as Database["sources"],
    audit: rows.audit as Database["audit"],
    vocab: normalizeVocab(vocabRows)
  };
}

export function apiConfigured() {
  return supabaseConfigured();
}

export async function getDataset(): Promise<Database> {
  const client = db();

  // Was one GET /dataset against the Lambda. PostgREST is per-table, so fan out.
  const [tableResults, vocabResult] = await Promise.all([
    Promise.all(DATASET_KEYS.map((key) => client.from(TABLE_NAMES[key]).select("*"))),
    client.from("vocab_terms").select("*").order("vocab_key").order("sort_order").order("term")
  ]);

  const rows = {} as DatasetRows;
  tableResults.forEach((result, index) => {
    const key = DATASET_KEYS[index];
    if (result.error) throw new Error(`Failed to load ${TABLE_NAMES[key]}: ${result.error.message}`);
    rows[key] = result.data ?? [];
  });
  if (vocabResult.error) throw new Error(`Failed to load vocab_terms: ${vocabResult.error.message}`);

  return normalizeDatabase(rows, vocabResult.data ?? []);
}

export function datasetPayload(database: Database): RawRecord {
  const payload: RawRecord = { vocab: database.vocab };
  for (const key of DATASET_KEYS) {
    const rows = (database[key] ?? []) as unknown[];
    payload[key] = rows.filter(isRecord).map((row) => rowForApi(key, row));
  }
  return payload;
}

export async function saveDataset(database: Database): Promise<{ ok: boolean; counts?: Record<string, number> }> {
  // Multi-table transactional swap -- PostgREST cannot express it, so it lives
  // in the replace_dataset() function (database/supabase-migration.sql).
  const { error } = await db().rpc("replace_dataset", { payload: datasetPayload(database) });
  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const key of DATASET_KEYS) counts[key] = ((database[key] ?? []) as unknown[]).length;
  return { ok: true, counts };
}

export function isDatasetKey(key: string): key is ApiTableKey {
  return key in TABLE_NAMES;
}

// vocab lives as {key: [term, ...]} in the frontend and (vocab_key, term,
// sort_order) rows here, so there is no single row to upsert. Rewriting one key
// keeps a taxonomy edit from going through the whole-dataset swap.
export async function writeVocabKey(key: string, terms: readonly string[]): Promise<void> {
  const client = db();
  const { error: deleteError } = await client.from("vocab_terms").delete().eq("vocab_key", key);
  if (deleteError) throw new Error(`Failed to clear vocab ${key}: ${deleteError.message}`);
  if (terms.length === 0) return;

  const { error } = await client
    .from("vocab_terms")
    .insert(terms.map((term, index) => ({ vocab_key: key, term, sort_order: index })));
  if (error) throw new Error(`Failed to save vocab ${key}: ${error.message}`);
}

// One changed row, one request. Replaces the old pattern of shipping the entire
// local dataset through replace_dataset() on every edit, which let a stale tab
// wipe rows it had never seen. Firm deletes cascade in the database, so the
// child tables need no extra call.
export async function writeRow(
  key: ApiTableKey,
  action: "create" | "update" | "delete",
  id: string,
  row?: RawRecord
): Promise<void> {
  const table = TABLE_NAMES[key];

  if (action === "delete") {
    const { error } = await db().from(table).delete().eq(PRIMARY_KEY[key], id);
    if (error) throw new Error(`Failed to delete ${table} ${id}: ${error.message}`);
    return;
  }

  if (!row) throw new Error(`writeRow(${key}, ${action}) needs a row.`);
  const payload = rowForApi(key, row);

  // Deliberately not upsert. Ids are generated client-side from the local cache
  // (nextId), so two browsers can both decide the next company is F014. An
  // upsert would let the second one silently overwrite the first; a plain
  // insert fails with a duplicate-key error that reaches the save banner, and
  // the next sync hands out a free id. Loud beats lossy.
  const { error } =
    action === "create"
      ? await db().from(table).insert(payload)
      : await db().from(table).update(payload).eq(PRIMARY_KEY[key], id);
  if (error) throw new Error(`Failed to save ${table} ${id}: ${error.message}`);
}
