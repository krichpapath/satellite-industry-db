// Run: npm test
//
// The three .xlsx exports (D9, D10). The browser download itself cannot be
// driven from the test harness, but the part that can actually break is the
// workbook build -- a renamed field or an empty table throwing. These call the
// real builders against the real SEED shape and assert a non-empty workbook
// comes back.

import assert from "node:assert/strict";
import { test } from "vitest";
import ExcelJS from "exceljs";
import { createFirmXlsx, createDatabaseXlsx } from "./db-xlsx";
import { createAllComponentsXlsx } from "./component-xlsx";
import { SEED } from "./seed";
import type { Database } from "./schema";

// The builders return exceljs's writeBuffer output (a Uint8Array), which
// xlsx.load accepts at runtime but does not match its ArrayBuffer signature.
async function sheetsOf(data: unknown) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(data as ArrayBuffer);
  return wb.worksheets.map((w) => ({ name: w.name, rows: w.rowCount }));
}

test("full database export builds a workbook with sheets", async () => {
  const sheets = await sheetsOf(await createDatabaseXlsx(SEED));
  assert.ok(sheets.length > 1, `expected several sheets, got ${sheets.length}`);
  assert.ok(sheets.some((s) => s.rows > 1), "every sheet was empty");
});

test("per-company export builds a workbook", async () => {
  const firmId = SEED.firms[0].firm_id;
  const sheets = await sheetsOf(await createFirmXlsx(SEED, firmId));
  assert.ok(sheets.length >= 1, "no sheets produced");
});

test("all-components export builds a workbook", async () => {
  const sheets = await sheetsOf(await createAllComponentsXlsx(SEED));
  assert.ok(sheets.length >= 1, "no sheets produced");
});

// The live database has 7 empty tables. An export that throws on an empty
// table would fail only in production, where those tables are in fact empty.
test("exports survive a database whose child tables are all empty", async () => {
  const empty = {
    ...SEED,
    size_finance: [], products: [], tech: [], facilities: [], hr: [],
    linkages: [], collabs: [], esg: [], audit: []
  } as Database;
  await assert.doesNotReject(() => createDatabaseXlsx(empty));
  await assert.doesNotReject(() => createAllComponentsXlsx(empty));
  await assert.doesNotReject(() => createFirmXlsx(empty, empty.firms[0].firm_id));
});
