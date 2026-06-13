import type { Database, Firm, OwnershipType } from "./schema";
import { DEFAULT_VOCAB } from "./schema";
import { COMPONENT_SYSTEMS, findComponentPath, modulesForSystem } from "./component-taxonomy";

const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
export const API_BASE_URL = rawApiBase.replace(/\/+$/, "");

type RawRecord = Record<string, unknown>;
type ApiTableKey = Exclude<keyof Database, "vocab">;
type RowFor<K extends ApiTableKey> = Database[K] extends Array<infer Row> ? Row : never;

const TABLE_PATHS: Record<ApiTableKey, string> = {
  firms: "/firms",
  size_finance: "/size-finance",
  products: "/products",
  tech: "/tech",
  facilities: "/facilities",
  hr: "/hr",
  linkages: "/linkages",
  collabs: "/collaborations",
  esg: "/esg",
  sources: "/sources",
  audit: "/audit"
};

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

function unwrapApiPayload(value: unknown): unknown {
  if (isRecord(value) && typeof value.body === "string") {
    try {
      return JSON.parse(value.body) as unknown;
    } catch {
      return value.body;
    }
  }
  return value;
}

function extractRows(value: unknown, key: string): unknown[] {
  const payload = unwrapApiPayload(value);
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  const keyed = payload[key];
  if (Array.isArray(keyed)) return keyed;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.rows)) return payload.rows;
  return [];
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

function normalizeVocab(value: unknown): Database["vocab"] {
  const out = Object.fromEntries(
    Object.entries(DEFAULT_VOCAB).map(([key, values]) => [key, [...values]])
  ) as unknown as Database["vocab"];

  if (!isRecord(value)) return out;

  for (const key of Object.keys(out) as (keyof Database["vocab"])[]) {
    const terms = value[key];
    if (Array.isArray(terms)) out[key] = terms.map((term) => String(term));
  }

  return out;
}

function tableRows<K extends ApiTableKey>(value: unknown, key: K): Database[K] {
  const payload = unwrapApiPayload(value);
  if (!isRecord(payload)) return [] as unknown as Database[K];
  const rows = payload[key];
  return (Array.isArray(rows) ? rows : []) as Database[K];
}

function normalizeRows<T>(value: unknown, key: string, normalize: (row: RawRecord) => T): T[] {
  return extractRows(value, key)
    .filter(isRecord)
    .map(normalize);
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
  const componentName = toString(row.component_name ?? row.product_name);
  const path = findComponentPath(componentName);
  const fallbackSystem = COMPONENT_SYSTEMS[0] ?? "";
  const fallbackModule = fallbackSystem ? modulesForSystem(fallbackSystem)[0] ?? "" : "";

  return {
    product_id: toString(row.product_id),
    firm_id: toString(row.firm_id),
    component_name: componentName || "Unspecified component",
    system: toString(row.system ?? path?.system, fallbackSystem),
    module: toString(row.module ?? path?.module, fallbackModule),
    description: toString(row.description) || undefined
  } as Database["products"][number];
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

function normalizeDatabase(value: unknown): Database {
  const payload = unwrapApiPayload(value);
  const firms = extractRows(payload, "firms")
    .map(normalizeFirm)
    .filter((firm): firm is Firm => Boolean(firm));

  return {
    firms,
    size_finance: normalizeRows(payload, "size_finance", normalizeFinance),
    products: normalizeRows(payload, "products", normalizeProduct),
    tech: normalizeRows(payload, "tech", normalizeTech),
    facilities: normalizeRows(payload, "facilities", normalizeFacility),
    hr: normalizeRows(payload, "hr", normalizeHr),
    linkages: normalizeRows(payload, "linkages", normalizeLinkage),
    collabs: normalizeRows(payload, "collabs", normalizeCollab),
    esg: normalizeRows(payload, "esg", normalizeEsg),
    sources: tableRows(payload, "sources"),
    audit: tableRows(payload, "audit"),
    vocab: normalizeVocab(isRecord(payload) ? payload.vocab : undefined)
  };
}

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers
    }
  });

  if (!res.ok) {
    let message = `API request failed (${res.status})`;
    try {
      const payload: unknown = await res.json();
      if (isRecord(payload) && payload.error) message = toString(payload.error, message);
    } catch {
      // Keep status-based message when the API returns non-JSON.
    }
    throw new Error(message);
  }

  return res;
}

export function apiConfigured() {
  return Boolean(API_BASE_URL);
}

export function apiUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function getDataset(): Promise<Database> {
  const res = await apiFetch("/dataset");
  const data: unknown = await res.json();
  return normalizeDatabase(data);
}

function sanitizeDatasetForApi(db: Database): Database {
  return db;
}

export async function saveDataset(db: Database): Promise<{ ok: boolean; counts?: Record<string, number> }> {
  const res = await apiFetch("/dataset", {
    method: "PUT",
    body: JSON.stringify(sanitizeDatasetForApi(db))
  });
  const data: unknown = await res.json();
  if (isRecord(data)) {
    return {
      ok: data.ok === true,
      counts: isRecord(data.counts) ? (data.counts as Record<string, number>) : undefined
    };
  }
  return { ok: false };
}

export async function getFirms(): Promise<Firm[]> {
  const res = await apiFetch("/firms");
  const data: unknown = await res.json();
  return extractRows(data, "firms")
    .map(normalizeFirm)
    .filter((firm): firm is Firm => Boolean(firm));
}

export async function createFirm(firm: Firm): Promise<Firm> {
  const res = await apiFetch("/firms", {
    method: "POST",
    body: JSON.stringify({
      firm_id: firm.firm_id || undefined,
      firm_name: firm.firm_name,
      registration_no: firm.registration_no || null,
      year_established: firm.year_established || null,
      ownership_type: firm.ownership_type,
      parent_company: firm.parent_company || null,
      industry_code: firm.industry_code || null,
      province: firm.province || null,
      industrial_zone: firm.industrial_zone || null,
      website: firm.website || null,
      contact_email: firm.contact_email || null,
      source_id: firm.source_id || null,
      visibility_level: "internal",
      review_status: "draft"
    })
  });
  const data: unknown = await res.json();
  const normalized = normalizeFirm(unwrapApiPayload(data));
  if (!normalized) throw new Error("API returned invalid firm payload.");
  return normalized;
}

export async function updateFirm(firm: Firm): Promise<Firm> {
  const res = await apiFetch(`/firms/${encodeURIComponent(firm.firm_id)}`, {
    method: "PUT",
    body: JSON.stringify(firm)
  });
  const data: unknown = await res.json();
  const normalized = normalizeFirm(unwrapApiPayload(data));
  if (!normalized) throw new Error("API returned invalid firm payload.");
  return normalized;
}

export async function deleteFirm(firmId: string): Promise<void> {
  await apiFetch(`/firms/${encodeURIComponent(firmId)}`, { method: "DELETE" });
}

export async function createRecord<K extends ApiTableKey>(table: K, row: RowFor<K>): Promise<RowFor<K>> {
  const res = await apiFetch(TABLE_PATHS[table], {
    method: "POST",
    body: JSON.stringify(row)
  });
  return (await res.json()) as RowFor<K>;
}

export async function updateRecord<K extends ApiTableKey>(
  table: K,
  id: string,
  row: RowFor<K>
): Promise<RowFor<K>> {
  const res = await apiFetch(`${TABLE_PATHS[table]}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(row)
  });
  return (await res.json()) as RowFor<K>;
}

export async function deleteRecord<K extends ApiTableKey>(table: K, id: string): Promise<void> {
  await apiFetch(`${TABLE_PATHS[table]}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
