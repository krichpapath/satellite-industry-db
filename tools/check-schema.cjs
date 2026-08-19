// Run: npm run check:schema
//
// Compares the COLUMNS allowlist in lib/api.ts against the live PostgREST
// schema, table by table. This is the check that would have caught the
// audit_log bug before it shipped: rowForApi sent visibility_level and
// review_status to a table that has neither, PostgREST rejected the whole
// request with PGRST204, and every audit write failed silently behind a
// misleading "not saved" banner.
//
// A declared column that is not real fails every write to that table. Extra
// real columns are fine and expected -- created_at, updated_at and id are
// database-managed and deliberately not sent.
//
// Needs SUPABASE_SERVICE_ROLE_KEY: PostgREST only serves the OpenAPI spec to a
// secret key. Read-only -- it introspects the schema and writes nothing.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function readEnv() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
  );
}

// Mirrors TABLE_NAMES in lib/api.ts.
const TABLES = {
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

function declaredColumns() {
  const src = fs.readFileSync(path.join(ROOT, "lib", "api.ts"), "utf8");
  const block = src.match(/export const COLUMNS[\s\S]*?\n};/);
  if (!block) throw new Error("Could not find the COLUMNS allowlist in lib/api.ts");
  const out = {};
  for (const key of Object.keys(TABLES)) {
    const line = block[0].split("\n").find((l) => l.trim().startsWith(key + ":"));
    if (!line) throw new Error(`COLUMNS is missing the "${key}" entry`);
    out[key] = (line.match(/"[^"]+"/g) || []).map((s) => s.slice(1, -1));
  }
  return out;
}

async function main() {
  const env = { ...readEnv(), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (.env or environment).");
    process.exit(2);
  }

  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: secret, Authorization: `Bearer ${secret}`, Accept: "application/openapi+json" }
  });
  if (!res.ok) {
    console.error(`Could not read the schema: ${res.status} ${await res.text()}`);
    process.exit(2);
  }
  const spec = await res.json();
  const real = Object.fromEntries(
    Object.entries(spec.definitions || {}).map(([t, d]) => [t, Object.keys(d.properties || {})])
  );

  const declared = declaredColumns();
  let failures = 0;

  for (const [key, table] of Object.entries(TABLES)) {
    const actual = real[table];
    if (!actual) {
      failures += 1;
      console.log(`MISSING   ${table} is not exposed by PostgREST at all`);
      continue;
    }
    const bogus = declared[key].filter((c) => !actual.includes(c));
    if (bogus.length) {
      failures += 1;
      console.log(`MISMATCH  ${table} -> declared but not a real column: ${bogus.join(", ")}`);
    } else {
      console.log(`ok        ${table.padEnd(26)}${declared[key].length} declared / ${actual.length} real`);
    }
  }

  if (failures) {
    console.log(`\n${failures} table(s) would fail every write with PGRST204.`);
    process.exit(1);
  }
  console.log("\nAll declared columns exist in the live schema.");
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
