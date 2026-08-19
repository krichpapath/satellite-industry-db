// Run: npm test
//
// Covers the two transforms that moved out of the Lambda and into the client:
// the vocab_terms row->object fold, and the dataset payload sent to
// replace_dataset(). Both are shape contracts with SQL -- if they drift, the
// RPC writes NULLs into NOT NULL columns and the failure surfaces as an opaque
// Postgres error at save time rather than here.

import assert from "node:assert/strict";
import { test } from "vitest";
import { COLUMNS, datasetPayload, normalizeVocab, rowForApi } from "./api";
import { DEFAULT_VOCAB, type Database } from "./schema";

test("normalizeVocab folds rows into {key: [term]} ordered by the query", () => {
  const key = Object.keys(DEFAULT_VOCAB)[0];
  const vocab = normalizeVocab([
    { vocab_key: key, term: "alpha", sort_order: 0 },
    { vocab_key: key, term: "beta", sort_order: 1 }
  ]);
  assert.deepEqual(vocab[key as keyof typeof vocab], ["alpha", "beta"]);
});

test("normalizeVocab keeps DEFAULT_VOCAB when the table is empty", () => {
  assert.deepEqual(normalizeVocab([]), DEFAULT_VOCAB);
});

test("normalizeVocab ignores malformed rows", () => {
  assert.deepEqual(normalizeVocab([null, { vocab_key: "", term: "x" }, { term: "no-key" }]), DEFAULT_VOCAB);
});

function emptyDb(): Database {
  return {
    firms: [], size_finance: [], products: [], tech: [], facilities: [],
    hr: [], linkages: [], collabs: [], esg: [], sources: [], audit: [],
    vocab: DEFAULT_VOCAB
  } as unknown as Database;
}

test("datasetPayload defaults the NOT NULL governance columns", () => {
  const database = emptyDb();
  database.firms = [{ firm_id: "F001", firm_name: "Test" }] as Database["firms"];

  const firms = (datasetPayload(database).firms as Record<string, unknown>[])[0];
  // replace_dataset() inserts every column explicitly, so an absent key writes
  // NULL rather than falling back to the column DEFAULT.
  assert.equal(firms.visibility_level, "internal");
  assert.equal(firms.review_status, "published");
});

test("datasetPayload lets row values win over the defaults", () => {
  const database = emptyDb();
  database.firms = [{ firm_id: "F001", firm_name: "T", review_status: "draft" }] as unknown as Database["firms"];

  const firms = (datasetPayload(database).firms as Record<string, unknown>[])[0];
  assert.equal(firms.review_status, "draft");
});

test("datasetPayload maps product record_state onto review_status and drops it", () => {
  const database = emptyDb();
  database.products = [
    { product_id: "P001", firm_id: "F001", product_name: "Draft part", record_state: "draft" },
    { product_id: "P002", firm_id: "F001", product_name: "Live part", record_state: "public" }
  ] as unknown as Database["products"];

  const products = datasetPayload(database).products as Record<string, unknown>[];
  assert.equal(products[0].review_status, "draft");
  assert.equal(products[1].review_status, "published");
  // record_state is not a column; leaving it in would be silently ignored by
  // jsonb_populate_recordset and the draft/public state would be lost.
  assert.ok(!("record_state" in products[0]));
});

test("datasetPayload drops the retired Lambda taxonomy columns", () => {
  const database = emptyDb();
  database.products = [
    { product_id: "P001", firm_id: "F001", product_name: "X", record_state: "public" }
  ] as unknown as Database["products"];

  const product = (datasetPayload(database).products as Record<string, unknown>[])[0];
  for (const dead of ["value_chain_stage", "technology_intensity", "sia_category", "itu_service_class", "orbit_type"]) {
    assert.ok(!(dead in product), `${dead} should not be sent; the column is gone`);
  }
});

// Per-row writes go straight to PostgREST, which rejects the whole request with
// PGRST204 on an unknown column. replace_dataset's jsonb_populate_recordset
// dropped these silently, so the mismatch never surfaced before.

test("rowForApi drops audit firm_id -- audit_log has no such column", () => {
  const row = rowForApi("audit", {
    audit_id: "A001", ts: "2026-01-01", role: "Analyst", action: "create",
    target_table: "products", target_id: "P001", summary: "x", firm_id: "F001"
  });
  assert.ok(!("firm_id" in row));
  assert.equal(row.audit_id, "A001");
});

test("rowForApi maps firm last_updated_ts onto the real updated_at column", () => {
  const row = rowForApi("firms", { firm_id: "F001", firm_name: "T", last_updated_ts: "2026-01-01T00:00:00Z" });
  assert.equal(row.updated_at, "2026-01-01T00:00:00Z");
  assert.ok(!("last_updated_ts" in row));
});

test("rowForApi nulls a blank source_id -- '' violates the FK to data_sources", () => {
  const row = rowForApi("firms", { firm_id: "F001", firm_name: "T", source_id: "" });
  assert.equal(row.source_id, null);
});

test("rowForApi nulls a cleared year_established -- 0 fails the 1800-2100 CHECK", () => {
  const row = rowForApi("firms", { firm_id: "F001", firm_name: "T", year_established: 0 });
  assert.equal(row.year_established, null);
});

test("rowForApi keeps real source_id and year values", () => {
  const row = rowForApi("firms", { firm_id: "F001", firm_name: "T", source_id: "S001", year_established: 2024 });
  assert.equal(row.source_id, "S001");
  assert.equal(row.year_established, 2024);
});

test("rowForApi drops any key that is not a column", () => {
  const row = rowForApi("firms", { firm_id: "F001", firm_name: "T", not_a_column: 1 });
  assert.ok(!("not_a_column" in row));
});

test("rowForApi keeps the product draft state as review_status", () => {
  const row = rowForApi("products", { product_id: "P001", firm_id: "F001", product_name: "X", record_state: "draft" });
  assert.equal(row.review_status, "draft");
  assert.ok(!("record_state" in row));
});

// The bug this pins: rowForApi used to seed {visibility_level, review_status}
// before filtering by COLUMNS, so audit_log -- which has neither column -- got
// both. PostgREST rejects the whole request with PGRST204, and because
// queueRowSave writes the data row *then* the audit row, every edit saved its
// data and then reported "Not saved to the database" to the user.
// Generic over all 11 tables so the next table with a different column set
// cannot reintroduce it.
test("rowForApi never emits a key outside that table's column allowlist", () => {
  for (const key of Object.keys(COLUMNS) as (keyof typeof COLUMNS)[]) {
    const row = rowForApi(key, { firm_id: "F001", product_name: "X", stray_key: 1 });
    for (const emitted of Object.keys(row)) {
      assert.ok(
        COLUMNS[key].includes(emitted),
        `rowForApi("${key}") emitted "${emitted}", which is not a column`
      );
    }
  }
});

test("rowForApi sends audit_log exactly its 7 real columns and nothing else", () => {
  const row = rowForApi("audit", {
    audit_id: "A1", ts: "2026-01-01", role: "Analyst", action: "create",
    target_table: "firms", target_id: "F001", summary: "x"
  });
  assert.deepEqual(Object.keys(row).sort(), [
    "action", "audit_id", "role", "summary", "target_id", "target_table", "ts"
  ]);
  assert.ok(!("visibility_level" in row));
  assert.ok(!("review_status" in row));
});

test("tables that do have the governance columns still get the defaults", () => {
  for (const key of ["firms", "products", "sources", "tech"] as const) {
    const row = rowForApi(key, { firm_id: "F001" });
    assert.equal(row.visibility_level, "internal", `${key} visibility_level`);
    assert.equal(row.review_status, "published", `${key} review_status`);
  }
});
