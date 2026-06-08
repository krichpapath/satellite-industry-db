const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const DEFAULT_API_BASE = "https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.argv.find((arg) => arg.startsWith("--api="))?.slice(6) || DEFAULT_API_BASE).replace(/\/+$/, "");
const DRY_RUN = process.argv.includes("--dry-run");
const PREFIX = "ts-";
const LABEL_PREFIX = "ts ";

function loadTsModule(relativePath, modules = {}) {
  const filename = path.join(process.cwd(), relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true
    }
  }).outputText;

  const module = { exports: {} };
  const localRequire = (request) => {
    if (modules[request]) return modules[request];
    throw new Error(`Unsupported require from seed loader: ${request}`);
  };
  const context = vm.createContext({
    exports: module.exports,
    module,
    require: localRequire,
    console
  });
  vm.runInContext(compiled, context, { filename });
  return module.exports;
}

const schema = loadTsModule("lib/schema.ts");
const { SEED } = loadTsModule("lib/seed.ts", { "./schema": schema });

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function prefixedId(value) {
  return value ? `${PREFIX}${value}` : value;
}

function prefixedLabel(value) {
  return value ? `${LABEL_PREFIX}${value}` : value;
}

function withSource(row, fallback = "S002") {
  return {
    ...row,
    source_id: prefixedId(row.source_id || fallback),
    visibility_level: "internal",
    review_status: "draft"
  };
}

function buildTestDataset() {
  const db = clone(SEED);

  return {
    sources: db.sources.map((row) => ({
      ...row,
      source_id: prefixedId(row.source_id),
      name: prefixedLabel(row.name),
      notes: prefixedLabel(row.notes || "Example source for prototype testing"),
      visibility_level: "internal",
      review_status: "draft"
    })),
    firms: db.firms.map((row) => ({
      ...withSource(row, "S001"),
      firm_id: prefixedId(row.firm_id),
      firm_name: prefixedLabel(row.firm_name),
      registration_no: prefixedId(row.registration_no)
    })),
    size_finance: db.size_finance.map((row) => ({
      ...withSource(row, "S004"),
      firm_id: prefixedId(row.firm_id)
    })),
    products: db.products.map((row) => ({
      ...withSource(row, "S002"),
      product_id: prefixedId(row.product_id),
      firm_id: prefixedId(row.firm_id),
      product_name: prefixedLabel(row.product_name)
    })),
    tech: db.tech.map((row) => ({
      ...withSource(row, "S003"),
      tech_id: prefixedId(row.tech_id),
      firm_id: prefixedId(row.firm_id),
      core_technology: prefixedLabel(row.core_technology)
    })),
    facilities: db.facilities.map((row) => ({
      ...withSource(row, "S002"),
      facility_id: prefixedId(row.facility_id),
      firm_id: prefixedId(row.firm_id)
    })),
    hr: db.hr.map((row) => ({
      ...withSource(row, "S002"),
      hr_id: prefixedId(row.hr_id),
      firm_id: prefixedId(row.firm_id)
    })),
    linkages: db.linkages.map((row) => ({
      ...withSource(row, "S002"),
      linkage_id: prefixedId(row.linkage_id),
      firm_id: prefixedId(row.firm_id),
      partner_firm_id: prefixedId(row.partner_firm_id)
    })),
    collabs: db.collabs.map((row) => ({
      ...withSource(row, "S002"),
      collab_id: prefixedId(row.collab_id),
      firm_id: prefixedId(row.firm_id),
      partner_name: prefixedLabel(row.partner_name)
    })),
    esg: db.esg.map((row) => ({
      ...withSource(row, "S002"),
      esg_id: prefixedId(row.esg_id),
      firm_id: prefixedId(row.firm_id)
    })),
    audit: db.audit.map((row) => ({
      ...row,
      audit_id: prefixedId(row.audit_id),
      ts: new Date().toISOString(),
      target_id: row.target_id === "*" ? "ts-*" : prefixedId(row.target_id),
      summary: prefixedLabel(row.summary)
    }))
  };
}

const routeOrder = [
  ["sources", "/sources"],
  ["firms", "/firms"],
  ["size_finance", "/size-finance"],
  ["products", "/products"],
  ["tech", "/tech"],
  ["facilities", "/facilities"],
  ["hr", "/hr"],
  ["linkages", "/linkages"],
  ["collabs", "/collaborations"],
  ["esg", "/esg"],
  ["audit", "/audit"]
];

async function request(pathname, init = {}) {
  const res = await fetch(`${API_BASE}${pathname}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers
    }
  });
  const text = await res.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Keep raw response body for diagnostics.
  }
  if (!res.ok) {
    const message = body && typeof body === "object" && body.error ? body.error : text;
    throw new Error(`${init.method || "GET"} ${pathname} failed (${res.status}): ${message}`);
  }
  return body;
}

async function main() {
  const dataset = buildTestDataset();
  const counts = Object.fromEntries(routeOrder.map(([key]) => [key, dataset[key].length]));

  console.log(`API: ${API_BASE}`);
  console.log(`Mode: ${DRY_RUN ? "dry-run" : "write"}`);
  console.log(JSON.stringify(counts, null, 2));

  if (DRY_RUN) return;

  await request("/health");

  for (const [key, route] of routeOrder) {
    for (const row of dataset[key]) {
      await request(route, {
        method: "POST",
        body: JSON.stringify(row)
      });
    }
    console.log(`Seeded ${dataset[key].length} ${key}`);
  }

  const nextDataset = await request("/dataset");
  const nextCounts = Object.fromEntries(
    Object.entries(nextDataset)
      .filter(([, value]) => Array.isArray(value))
      .map(([key, value]) => [key, value.length])
  );
  const tsFirmCount = Array.isArray(nextDataset.firms)
    ? nextDataset.firms.filter((row) => String(row.firm_id || "").startsWith(PREFIX)).length
    : 0;

  console.log("Post-seed counts:");
  console.log(JSON.stringify(nextCounts, null, 2));
  console.log(`ts firm count: ${tsFirmCount}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
