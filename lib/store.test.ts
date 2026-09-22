// Run: npm test
//
// Guards the await added to firm-form's edit and delete paths. Those now block
// navigation on currentRemoteSave(). If that promise can hang or reject, every
// edit freezes on the Save button instead of redirecting -- so the two
// properties it relies on are pinned here.
//
// No DOM dependency: store.ts only needs window.localStorage + dispatchEvent,
// so a ~15-line stub covers it. Supabase is unconfigured under vitest (.env is
// not loaded), which is exactly the local-only case being tested.

import assert from "node:assert/strict";
import { test, beforeEach } from "vitest";

function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() { return map.size; },
    clear: () => map.clear()
  };
}

beforeEach(() => {
  (globalThis as Record<string, unknown>).window = {
    localStorage: fakeStorage(),
    sessionStorage: fakeStorage(),
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
});

test("local-only mode: awaiting the save resolves instead of hanging", async () => {
  const { commit, currentRemoteSave } = await import("./store");
  const { apiConfigured } = await import("./api");
  // Precondition: Supabase really is unconfigured here, or this proves nothing.
  assert.equal(apiConfigured(), false);

  commit({ action: "update", table: "firms", id: "F005", summary: "edit" }, (d) => {
    d.firms = d.firms.map((f) => (f.firm_id === "F005" ? { ...f, firm_name: "Renamed" } : f));
  });

  // The await firm-form now performs. Must settle, and fast.
  const settled = await Promise.race([
    Promise.resolve(currentRemoteSave()).then(() => "settled"),
    new Promise((r) => setTimeout(() => r("HUNG"), 1000))
  ]);
  assert.equal(settled, "settled", "currentRemoteSave() hung -- the edit form would freeze");
});

test("currentRemoteSave never rejects, so it cannot skip the redirect", async () => {
  const { currentRemoteSave } = await import("./store");
  // Rejection would throw past router.push and strand the user on the form.
  await assert.doesNotReject(async () => { await currentRemoteSave(); });
});


test("legacy separation records and new AIT records survive local save and reload", async () => {
  const { loadDb, commit } = await import("./store");
  const system = "Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)";
  window.localStorage.setItem("satdb.product-states-public.v1", "1");
  window.localStorage.setItem("satdb.v3", JSON.stringify({ products: [{
    product_id: "P-old", firm_id: "F001", product_name: "Existing ring", system,
    module: "Primary Structure(โครงสร้างหลัก)", component_name: "วงแหวนแยกตัวจากจรวด (Separation Ring)", record_state: "draft"
  }], vocab: { component_systems: [system], component_modules: [], component_names: [] } }));
  assert.equal(loadDb().products[0].module, "ระบบดีดตัวดาวเทียม");
  commit({ action: "create", table: "products", id: "P-ait", summary: "AIT regression check" }, (d) => {
    d.products.push({ product_id: "P-ait", firm_id: "F001", product_name: "Test frame",
      system: "AIT (การประกอบและทดสอบ)", module: "Mechanical Ground support Equipment",
      component_name: "Lifting frame", record_state: "draft" });
  });
  const saved = loadDb();
  assert.equal(saved.products[0].module, "ระบบดีดตัวดาวเทียม");
  assert.equal(saved.products[0].record_state, "draft");
  assert.equal(saved.products[1].component_name, "Lifting frame");
  assert.ok(saved.vocab.component_systems.includes("AIT (การประกอบและทดสอบ)"));
});
