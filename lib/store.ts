"use client";

import { useSyncExternalStore } from "react";
import type { Database, Role, AuditEntry } from "./schema";
import { DEFAULT_VOCAB } from "./schema";
import { SEED } from "./seed";

const KEY = "satdb.v3";
const ROLE_KEY = "satdb.role";
const LEGACY_KEYS = ["satdb.v2", "satdb.v1"];

function migrate(db: unknown): Database {
  const base = structuredClone(SEED);
  if (!db || typeof db !== "object") return base;
  const d = db as Partial<Database>;
  return {
    firms: d.firms ?? base.firms,
    size_finance: d.size_finance ?? base.size_finance,
    products: d.products ?? base.products,
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
}

export function resetDb() {
  const db = structuredClone(SEED);
  appendAudit(db, "reset", "*", "*", "Database reset to seed");
  writeRaw(db);
}

export function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(KEY)) {
    writeRaw(structuredClone(SEED));
  }
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
