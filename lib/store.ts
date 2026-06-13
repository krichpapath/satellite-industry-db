"use client";

import { useSyncExternalStore } from "react";
import type { Database, Role, AuditEntry } from "./schema";
import { DEFAULT_VOCAB } from "./schema";
import { SEED } from "./seed";
import { apiConfigured, getDataset, saveDataset } from "./api";
import { COMPONENT_SYSTEMS, findComponentPath, modulesForSystem } from "./component-taxonomy";

const KEY = "satdb.v3";
const ROLE_KEY = "satdb.role";
const LEGACY_KEYS = ["satdb.v2", "satdb.v1"];
let apiSyncPromise: Promise<ApiSyncResult> | null = null;
let apiSavePromise: Promise<void> | null = null;

export type ApiSyncResult =
  | { ok: true; count: number; tables: Record<string, number> }
  | { ok: false; reason: string };

function migrateProducts(products: unknown, base: Database): Database["products"] {
  const fallbackSystem = COMPONENT_SYSTEMS[0] ?? "";
  const fallbackModule = fallbackSystem ? modulesForSystem(fallbackSystem)[0] ?? "" : "";
  const rows = Array.isArray(products) ? products : base.products;

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map((row, index) => {
      const componentName = String(row.component_name ?? row.product_name ?? "").trim();
      const path = findComponentPath(componentName);
      const system = String(row.system ?? path?.system ?? fallbackSystem).trim();
      const module = String(row.module ?? path?.module ?? fallbackModule).trim();

      return {
        product_id: String(row.product_id ?? `P${String(index + 1).padStart(3, "0")}`),
        firm_id: String(row.firm_id ?? ""),
        component_name: componentName || "Unspecified component",
        system,
        module,
        description: row.description ? String(row.description) : undefined
      };
    });
}

function migrate(db: unknown): Database {
  const base = structuredClone(SEED);
  if (!db || typeof db !== "object") return base;
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

function readRaw(): Database {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
    for (const k of LEGACY_KEYS) {
      const legacy = window.localStorage.getItem(k);
      if (legacy) {
        const migrated = migrate(JSON.parse(legacy));
        window.localStorage.setItem(KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
    return structuredClone(SEED);
  } catch {
    return structuredClone(SEED);
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
  cachedRaw = raw;
  cachedSnapshot = readRaw();
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

function queueRemoteSave(db: Database) {
  if (typeof window === "undefined") return;
  if (!apiConfigured()) return;
  const snapshot = JSON.parse(JSON.stringify(db)) as Database;
  apiSavePromise = saveDataset(snapshot)
    .then(() => undefined)
    .catch((error) => {
      console.warn("Remote dataset save failed", error);
    });
}

export function currentRemoteSave() {
  return apiSavePromise;
}

export async function syncDatasetFromApi(force = false): Promise<ApiSyncResult> {
  if (typeof window === "undefined") return { ok: false, reason: "server-render" };
  if (!apiConfigured()) return { ok: false, reason: "missing-api-base-url" };
  if (apiSyncPromise && !force) return apiSyncPromise;

  apiSyncPromise = (async () => {
    try {
      const remote = remoteDb(await getDataset());
      writeRaw(remote);
      return { ok: true, count: remote.firms.length, tables: tableCounts(remote) };
    } catch (error) {
      console.warn("Dataset API sync failed", error);
      return {
        ok: false,
        reason: error instanceof Error ? error.message : "unknown-error"
      };
    }
  })();

  return apiSyncPromise;
}

export async function syncFirmsFromApi(force = false): Promise<ApiSyncResult> {
  return syncDatasetFromApi(force);
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

function appendAudit(db: Database, action: AuditEntry["action"], table: string, id: string, summary: string) {
  if (!db.audit) db.audit = [];
  db.audit.unshift({
    audit_id: nextId("A", db.audit as unknown as Record<string, unknown>[], "audit_id"),
    ts: new Date().toISOString(),
    role: getRole(),
    action,
    target_table: table,
    target_id: id,
    summary
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
  appendAudit(db, opts.action, opts.table, opts.id, opts.summary);
  writeRaw(db);
  queueRemoteSave(db);
}

export function getRole(): Role {
  if (typeof window === "undefined") return "Admin";
  const v = window.localStorage.getItem(ROLE_KEY);
  if (v === "Public" || v === "Analyst" || v === "Admin") return v;
  return "Admin";
}

export function setRole(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event("satdb:role"));
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
  return "Admin";
}

export function useRole(): Role {
  return useSyncExternalStore(subscribeRole, getRoleSnapshot, getRoleServerSnapshot);
}
