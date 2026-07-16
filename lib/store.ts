"use client";

import { useSyncExternalStore } from "react";
import type { Database, Role, AuditEntry, RecordState } from "./schema";
import { DEFAULT_VOCAB } from "./schema";
import { SEED } from "./seed";
import { apiConfigured, getDataset, saveDataset } from "./api";
import { getSessionEmail } from "./users";
import { COMPONENT_SYSTEMS, cleanComponentLabel, findComponentPath, modulesForSystem, normalizeSystem } from "./component-taxonomy";
import { sanitizeRichText } from "./rich-text";

const KEY = "satdb.v3";
const ROLE_KEY = "satdb.role";
const ROLE_ENTRY_KEY = "satdb.role-entry";
const FIRM_ENTRY_KEY = "satdb.firm-entry";
const PRODUCT_STATE_MIGRATION_KEY = "satdb.product-states-public.v1";
const LEGACY_KEYS = ["satdb.v2", "satdb.v1"];
let apiSyncPromise: Promise<ApiSyncResult> | null = null;
let apiSavePromise: Promise<void> | null = null;

export type ApiSyncResult =
  | { ok: true; count: number; tables: Record<string, number> }
  | { ok: false; reason: string };

function normalizeRecordState(value: unknown): RecordState {
  const state = String(value ?? "").toLowerCase();
  return state === "draft" ? "draft" : "public";
}

function migrateProducts(products: unknown, base: Database): Database["products"] {
  const fallbackSystem = COMPONENT_SYSTEMS[0] ?? "";
  const fallbackModule = fallbackSystem ? modulesForSystem(fallbackSystem)[0] ?? "" : "";
  const rows = Array.isArray(products) ? products : base.products;

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map((row, index) => {
      const productName = String(row.product_name ?? row.component_name ?? "").trim();
      const componentName = cleanComponentLabel(String(row.component_name ?? "").trim()) || productName;
      const path = findComponentPath(componentName);
      const system = normalizeSystem(String(row.system ?? path?.system ?? fallbackSystem).trim());
      const module = system === "Unidentified" ? "Unidentified" : String(row.module ?? path?.module ?? fallbackModule).trim();
      const normalizedComponentName = system === "Unidentified" || module === "Unidentified" ? "Unidentified" : componentName;
      const rawTrl = row.product_trl;
      const productTrl = rawTrl === "Unidentified"
        ? "Unidentified"
        : Number.isInteger(Number(rawTrl)) && Number(rawTrl) >= 1 && Number(rawTrl) <= 9
          ? Number(rawTrl)
          : undefined;

      return {
        product_id: String(row.product_id ?? `P${String(index + 1).padStart(3, "0")}`),
        firm_id: String(row.firm_id ?? ""),
        product_name: productName || normalizedComponentName || "Unspecified product",
        component_name: normalizedComponentName || "Unspecified component",
        system,
        module,
        product_trl: productTrl,
        flight_heritage: row.flight_heritage ? String(row.flight_heritage) : undefined,
        description: row.description ? sanitizeRichText(row.description) : undefined,
        record_state: normalizeRecordState(row.record_state ?? row.review_status)
      };
    });
}

function migrate(db: unknown): Database {
  const base = structuredClone(SEED);
  if (!db || typeof db !== "object") {
    return { ...base, products: migrateProducts(base.products, base) };
  }
  const d = db as Partial<Database>;
  return {
    firms: d.firms ?? base.firms,
    size_finance: d.size_finance ?? base.size_finance,
    products: migrateProducts(d.products, base),
    tech: d.tech ?? base.tech,
    facilities: d.facilities ?? base.facilities,
    hr: d.hr ?? base.hr,
    linkages: d.linkages ?? base.linkages,
    collabs: d.collabs ?? base.collabs,
    esg: d.esg ?? base.esg,
    sources: d.sources ?? base.sources,
    audit: d.audit ?? [],
    vocab: { ...DEFAULT_VOCAB, ...(d.vocab ?? {}) }
  };
}

function publishExistingProducts(db: Database): Database {
  if (typeof window === "undefined") return db;
  if (window.localStorage.getItem(PRODUCT_STATE_MIGRATION_KEY)) return db;
  const next = {
    ...db,
    products: db.products.map((product) => ({ ...product, record_state: "public" as const }))
  };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.localStorage.setItem(PRODUCT_STATE_MIGRATION_KEY, "1");
  return next;
}

function readRaw(): Database {
  if (typeof window === "undefined") return migrate(SEED);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return publishExistingProducts(migrate(JSON.parse(raw)));
    for (const k of LEGACY_KEYS) {
      const legacy = window.localStorage.getItem(k);
      if (legacy) {
        const migrated = publishExistingProducts(migrate(JSON.parse(legacy)));
        window.localStorage.setItem(KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
    return publishExistingProducts(migrate(SEED));
  } catch {
    return migrate(SEED);
  }
}

function writeRaw(db: Database) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new Event("satdb:change"));
}

function subscribe(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("satdb:change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("satdb:change", handler);
    window.removeEventListener("storage", handler);
  };
}

let cachedSnapshot: Database | null = null;
let cachedRaw: string | null = null;

function getSnapshot(): Database {
  if (typeof window === "undefined") return SEED;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw && cachedSnapshot) return cachedSnapshot;
  cachedSnapshot = readRaw();
  // readRaw can migrate and rewrite storage; cache the post-migration raw so repeat calls stay stable.
  cachedRaw = window.localStorage.getItem(KEY);
  return cachedSnapshot;
}

function getServerSnapshot(): Database {
  return SEED;
}

export function useDatabase() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function loadDb(): Database {
  return readRaw();
}

export function saveDb(next: Database) {
  writeRaw(next);
  queueRemoteSave(next);
}

export function resetDb() {
  const db = structuredClone(SEED);
  appendAudit(db, "reset", "*", "*", "Database reset to seed");
  writeRaw(db);
  queueRemoteSave(db);
}

export function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(KEY)) {
    writeRaw(apiConfigured() ? emptyRemoteDb() : structuredClone(SEED));
  }
}

function emptyRemoteDb(): Database {
  const base = structuredClone(SEED);
  return {
    ...base,
    firms: [],
    size_finance: [],
    products: [],
    tech: [],
    facilities: [],
    hr: [],
    linkages: [],
    collabs: [],
    esg: [],
    sources: [],
    audit: []
  };
}

function remoteDb(remote: Database) {
  const base = emptyRemoteDb();
  return {
    ...base,
    ...remote,
    firms: remote.firms ?? [],
    size_finance: remote.size_finance ?? [],
    products: remote.products ?? [],
    tech: remote.tech ?? [],
    facilities: remote.facilities ?? [],
    hr: remote.hr ?? [],
    linkages: remote.linkages ?? [],
    collabs: remote.collabs ?? [],
    esg: remote.esg ?? [],
    sources: remote.sources ?? [],
    audit: remote.audit ?? [],
    vocab: { ...DEFAULT_VOCAB, ...(remote.vocab ?? {}) }
  };
}

function tableCounts(db: Database): Record<string, number> {
  return {
    firms: db.firms.length,
    size_finance: db.size_finance.length,
    products: db.products.length,
    tech: db.tech.length,
    facilities: db.facilities.length,
    hr: db.hr.length,
    linkages: db.linkages.length,
    collabs: db.collabs.length,
    esg: db.esg.length,
    sources: db.sources.length,
    audit: db.audit.length
  };
}

export type SyncStatus = {
  lastSync: { ts: string; result: ApiSyncResult } | null;
  lastSave: { ts: string; ok: boolean; error?: string } | null;
  saving: boolean;
};

// ponytail: module state — resets on HMR/reload, which is fine for ephemeral status.
let syncStatus: SyncStatus = { lastSync: null, lastSave: null, saving: false };
const SERVER_SYNC_STATUS: SyncStatus = { lastSync: null, lastSave: null, saving: false };

function setSyncStatus(patch: Partial<SyncStatus>) {
  syncStatus = { ...syncStatus, ...patch };
  if (typeof window !== "undefined") window.dispatchEvent(new Event("satdb:sync"));
}

function subscribeSync(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("satdb:sync", handler);
  return () => window.removeEventListener("satdb:sync", handler);
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSync, () => syncStatus, () => SERVER_SYNC_STATUS);
}

function queueRemoteSave(db: Database) {
  if (typeof window === "undefined") return;
  if (!apiConfigured()) return;
  const snapshot = JSON.parse(JSON.stringify(db)) as Database;
  setSyncStatus({ saving: true });
  apiSavePromise = saveDataset(snapshot)
    .then(() => {
      setSyncStatus({ saving: false, lastSave: { ts: new Date().toISOString(), ok: true } });
    })
    .catch((error) => {
      console.warn("Remote dataset save failed", error);
      setSyncStatus({
        saving: false,
        lastSave: {
          ts: new Date().toISOString(),
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    });
}

export function currentRemoteSave() {
  return apiSavePromise;
}

// Window flag instead of module state so readiness survives dev HMR module reinit.
declare global {
  interface Window {
    __satdbReady?: boolean;
  }
}

function markDbReady() {
  if (window.__satdbReady) return;
  window.__satdbReady = true;
  window.dispatchEvent(new Event("satdb:change"));
}

export function useDbReady() {
  return useSyncExternalStore(subscribe, () => Boolean(window.__satdbReady), () => false);
}

export async function syncDatasetFromApi(force = false): Promise<ApiSyncResult> {
  if (typeof window === "undefined") return { ok: false, reason: "server-render" };
  if (!apiConfigured()) {
    markDbReady();
    return { ok: false, reason: "missing-api-base-url" };
  }
  if (apiSyncPromise && !force) return apiSyncPromise;

  apiSyncPromise = (async () => {
    let result: ApiSyncResult;
    try {
      const remote = remoteDb(await getDataset());
      writeRaw(remote);
      result = { ok: true, count: remote.firms.length, tables: tableCounts(remote) };
    } catch (error) {
      console.warn("Dataset API sync failed", error);
      result = {
        ok: false,
        reason: error instanceof Error ? error.message : "unknown-error"
      };
    }
    setSyncStatus({ lastSync: { ts: new Date().toISOString(), result } });
    markDbReady();
    return result;
  })();

  return apiSyncPromise;
}

export function exportJson(): string {
  return JSON.stringify(readRaw(), null, 2);
}

export function importJson(text: string): { ok: boolean; error?: string } {
  try {
    const parsed = JSON.parse(text);
    const migrated = migrate(parsed);
    appendAudit(migrated, "import", "*", "*", "Database replaced via JSON import");
    writeRaw(migrated);
    queueRemoteSave(migrated);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function nextId(prefix: string, existing: readonly Record<string, unknown>[], key: string): string {
  let maxN = 0;
  for (const row of existing) {
    const v = row[key];
    if (typeof v !== "string") continue;
    const m = v.match(/(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxN) maxN = n;
    }
  }
  return `${prefix}${String(maxN + 1).padStart(3, "0")}`;
}

function appendAudit(db: Database, action: AuditEntry["action"], table: string, id: string, summary: string, firmId?: string) {
  if (!db.audit) db.audit = [];
  db.audit.unshift({
    audit_id: nextId("A", db.audit as unknown as Record<string, unknown>[], "audit_id"),
    ts: new Date().toISOString(),
    role: getRole(),
    action,
    target_table: table,
    target_id: id,
    summary,
    firm_id: firmId,
    actor: getSessionEmail() ?? undefined
  });
  if (db.audit.length > 500) db.audit.length = 500;
}

export function commit(
  opts: { action: AuditEntry["action"]; table: string; id: string; summary: string; firmId?: string },
  mutate: (db: Database) => void
) {
  const db = readRaw();
  mutate(db);
  const now = new Date().toISOString();
  if (opts.table === "firms") {
    const firm = db.firms.find((f) => f.firm_id === opts.id);
    if (firm) firm.last_updated_ts = now;
  } else if (opts.firmId) {
    const firm = db.firms.find((f) => f.firm_id === opts.firmId);
    if (firm) firm.last_updated_ts = now;
  }
  appendAudit(db, opts.action, opts.table, opts.id, opts.summary, opts.table === "firms" ? opts.id : opts.firmId);
  writeRaw(db);
  queueRemoteSave(db);
}

export function getRole(): Role {
  if (typeof window === "undefined") return "Public";
  const v = window.localStorage.getItem(ROLE_KEY);
  if (v === "Public" || v === "Analyst" || v === "Admin") return v;
  return "Public";
}

export function setRole(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event("satdb:role"));
}

export function setEntryRole(role: Role) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ROLE_ENTRY_KEY, role);
  if (role !== "Analyst") window.sessionStorage.removeItem(FIRM_ENTRY_KEY);
  setRole(role);
}

export function getEntryFirmId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(FIRM_ENTRY_KEY);
}

export function setEntryFirmId(firmId: string | null) {
  if (typeof window === "undefined") return;
  if (firmId) window.sessionStorage.setItem(FIRM_ENTRY_KEY, firmId);
  else window.sessionStorage.removeItem(FIRM_ENTRY_KEY);
}

export function ensurePublicEntryRole() {
  if (typeof window === "undefined") return;
  if (window.sessionStorage.getItem(ROLE_ENTRY_KEY)) return;
  setRole("Public");
}

function subscribeRole(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("satdb:role", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("satdb:role", handler);
    window.removeEventListener("storage", handler);
  };
}

function getRoleSnapshot(): Role {
  return getRole();
}

function getRoleServerSnapshot(): Role {
  return "Public";
}

export function useRole(): Role {
  return useSyncExternalStore(subscribeRole, getRoleSnapshot, getRoleServerSnapshot);
}
