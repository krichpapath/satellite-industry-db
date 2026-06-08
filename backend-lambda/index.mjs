import pg from "pg";

const { Pool } = pg;

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      },
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  }
  return pool;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json"
};

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS data_sources (
    source_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT,
    owner TEXT,
    last_synced DATE,
    notes TEXT,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS firms (
    firm_id TEXT PRIMARY KEY,
    firm_name TEXT NOT NULL,
    registration_no TEXT,
    year_established INTEGER CHECK (year_established IS NULL OR year_established BETWEEN 1800 AND 2100),
    ownership_type TEXT CHECK (ownership_type IS NULL OR ownership_type IN ('Local', 'Foreign', 'JV')),
    parent_company TEXT,
    industry_code TEXT,
    province TEXT,
    industrial_zone TEXT,
    website TEXT,
    contact_email TEXT,
    source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_firms_registration_no
    ON firms (registration_no)
    WHERE NULLIF(registration_no, '') IS NOT NULL;
  CREATE INDEX IF NOT EXISTS idx_firms_name ON firms (LOWER(firm_name));
  CREATE INDEX IF NOT EXISTS idx_firms_province ON firms (province);
  CREATE INDEX IF NOT EXISTS idx_firms_source ON firms (source_id);

  CREATE TABLE IF NOT EXISTS firm_size_finance (
    firm_id TEXT PRIMARY KEY REFERENCES firms(firm_id) ON DELETE CASCADE,
    employees_total INTEGER NOT NULL DEFAULT 0 CHECK (employees_total >= 0),
    engineers INTEGER NOT NULL DEFAULT 0 CHECK (engineers >= 0),
    annual_revenue_mthb NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (annual_revenue_mthb >= 0),
    export_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (export_percentage BETWEEN 0 AND 100),
    production_capacity TEXT,
    capital_investment_mthb NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (capital_investment_mthb >= 0),
    gov_incentives TEXT,
    funding_access TEXT,
    offset_agreement TEXT,
    source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS products_services (
    product_id TEXT PRIMARY KEY,
    firm_id TEXT NOT NULL REFERENCES firms(firm_id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    value_chain_stage TEXT NOT NULL CHECK (value_chain_stage IN ('Upstream', 'Midstream', 'Downstream')),
    technology_intensity TEXT NOT NULL CHECK (technology_intensity IN ('Low', 'Medium', 'High')),
    main_market TEXT,
    certification TEXT,
    sia_category TEXT,
    itu_service_class TEXT,
    orbit_type TEXT,
    frequency_band TEXT,
    naics_code TEXT,
    hs_code TEXT,
    product_trl INTEGER CHECK (product_trl IS NULL OR product_trl BETWEEN 1 AND 9),
    description TEXT,
    source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_products_firm ON products_services (firm_id);
  CREATE INDEX IF NOT EXISTS idx_products_stage_intensity ON products_services (value_chain_stage, technology_intensity);
  CREATE INDEX IF NOT EXISTS idx_products_sia ON products_services (sia_category);

  CREATE TABLE IF NOT EXISTS technology_capability (
    tech_id TEXT PRIMARY KEY,
    firm_id TEXT NOT NULL REFERENCES firms(firm_id) ON DELETE CASCADE,
    core_technology TEXT NOT NULL,
    trl_level INTEGER NOT NULL CHECK (trl_level BETWEEN 1 AND 9),
    rd_expenditure_mthb NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (rd_expenditure_mthb >= 0),
    rd_personnel INTEGER NOT NULL DEFAULT 0 CHECK (rd_personnel >= 0),
    patents_count INTEGER NOT NULL DEFAULT 0 CHECK (patents_count >= 0),
    patent_field TEXT,
    digitalization_level INTEGER NOT NULL DEFAULT 0 CHECK (digitalization_level BETWEEN 0 AND 5),
    source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_tech_firm ON technology_capability (firm_id);
  CREATE INDEX IF NOT EXISTS idx_tech_core ON technology_capability (core_technology);
  CREATE INDEX IF NOT EXISTS idx_tech_trl ON technology_capability (trl_level);

  CREATE TABLE IF NOT EXISTS infrastructure_facility (
    facility_id TEXT PRIMARY KEY,
    firm_id TEXT NOT NULL REFERENCES firms(firm_id) ON DELETE CASCADE,
    testing_lab BOOLEAN NOT NULL DEFAULT FALSE,
    simulation_tools BOOLEAN NOT NULL DEFAULT FALSE,
    manufacturing_process TEXT,
    software_capability TEXT,
    source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_facilities_firm ON infrastructure_facility (firm_id);

  CREATE TABLE IF NOT EXISTS human_resource_profile (
    hr_id TEXT PRIMARY KEY,
    firm_id TEXT NOT NULL REFERENCES firms(firm_id) ON DELETE CASCADE,
    technician_count INTEGER NOT NULL DEFAULT 0 CHECK (technician_count >= 0),
    skill_specialization TEXT,
    training_programs TEXT,
    skill_gap TEXT,
    source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_hr_firm ON human_resource_profile (firm_id);

  CREATE TABLE IF NOT EXISTS supply_chain_linkage (
    linkage_id TEXT PRIMARY KEY,
    firm_id TEXT NOT NULL REFERENCES firms(firm_id) ON DELETE CASCADE,
    partner_firm_id TEXT NOT NULL REFERENCES firms(firm_id) ON DELETE CASCADE,
    linkage_type TEXT NOT NULL CHECK (linkage_type IN ('Supplier', 'Buyer', 'Partner')),
    dependency_level INTEGER NOT NULL DEFAULT 0 CHECK (dependency_level BETWEEN 0 AND 5),
    domestic_or_import TEXT CHECK (domestic_or_import IS NULL OR domestic_or_import IN ('Domestic', 'Import')),
    source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (firm_id <> partner_firm_id)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_linkage_unique
    ON supply_chain_linkage (firm_id, partner_firm_id, linkage_type);
  CREATE INDEX IF NOT EXISTS idx_linkage_firm ON supply_chain_linkage (firm_id);
  CREATE INDEX IF NOT EXISTS idx_linkage_partner ON supply_chain_linkage (partner_firm_id);

  CREATE TABLE IF NOT EXISTS collaboration_network (
    collab_id TEXT PRIMARY KEY,
    firm_id TEXT NOT NULL REFERENCES firms(firm_id) ON DELETE CASCADE,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('University', 'PRI', 'Association')),
    partner_name TEXT NOT NULL,
    collaboration_type TEXT NOT NULL CHECK (collaboration_type IN ('R&D', 'Training', 'Testing')),
    duration_years INTEGER NOT NULL DEFAULT 0 CHECK (duration_years >= 0),
    source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_collabs_firm ON collaboration_network (firm_id);
  CREATE INDEX IF NOT EXISTS idx_collabs_partner_type ON collaboration_network (partner_type);

  CREATE TABLE IF NOT EXISTS sustainability_esg (
    esg_id TEXT PRIMARY KEY,
    firm_id TEXT NOT NULL REFERENCES firms(firm_id) ON DELETE CASCADE,
    energy_consumption_mwh NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (energy_consumption_mwh >= 0),
    renewable_energy_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (renewable_energy_ratio BETWEEN 0 AND 100),
    carbon_emission_tco2 NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (carbon_emission_tco2 >= 0),
    waste_management_system BOOLEAN NOT NULL DEFAULT FALSE,
    esg_certification TEXT,
    source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
    visibility_level TEXT NOT NULL DEFAULT 'internal'
      CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
    review_status TEXT NOT NULL DEFAULT 'draft'
      CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_esg_firm ON sustainability_esg (firm_id);

  CREATE TABLE IF NOT EXISTS vocab_terms (
    vocab_key TEXT NOT NULL,
    term TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (vocab_key, term)
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    audit_id TEXT PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    role TEXT NOT NULL CHECK (role IN ('Public', 'Analyst', 'Admin')),
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'import', 'reset', 'wipe')),
    target_table TEXT NOT NULL,
    target_id TEXT NOT NULL,
    summary TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log (ts DESC);
  CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_log (target_table, target_id);

  CREATE TABLE IF NOT EXISTS contracts (
    contract_id SERIAL PRIMARY KEY,
    firm_id TEXT REFERENCES firms(firm_id) ON DELETE CASCADE,
    contract_title TEXT NOT NULL,
    contract_type TEXT,
    contract_status TEXT,
    start_date DATE,
    end_date DATE,
    confidentiality_level TEXT DEFAULT 'confidential',
    file_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trg_sources_updated_at ON data_sources;
  CREATE TRIGGER trg_sources_updated_at
    BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  DROP TRIGGER IF EXISTS trg_firms_updated_at ON firms;
  CREATE TRIGGER trg_firms_updated_at
    BEFORE UPDATE ON firms
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  DROP TRIGGER IF EXISTS trg_finance_updated_at ON firm_size_finance;
  CREATE TRIGGER trg_finance_updated_at
    BEFORE UPDATE ON firm_size_finance
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  DROP TRIGGER IF EXISTS trg_products_updated_at ON products_services;
  CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products_services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  DROP TRIGGER IF EXISTS trg_tech_updated_at ON technology_capability;
  CREATE TRIGGER trg_tech_updated_at
    BEFORE UPDATE ON technology_capability
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  DROP TRIGGER IF EXISTS trg_facilities_updated_at ON infrastructure_facility;
  CREATE TRIGGER trg_facilities_updated_at
    BEFORE UPDATE ON infrastructure_facility
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  DROP TRIGGER IF EXISTS trg_hr_updated_at ON human_resource_profile;
  CREATE TRIGGER trg_hr_updated_at
    BEFORE UPDATE ON human_resource_profile
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  DROP TRIGGER IF EXISTS trg_linkage_updated_at ON supply_chain_linkage;
  CREATE TRIGGER trg_linkage_updated_at
    BEFORE UPDATE ON supply_chain_linkage
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  DROP TRIGGER IF EXISTS trg_collabs_updated_at ON collaboration_network;
  CREATE TRIGGER trg_collabs_updated_at
    BEFORE UPDATE ON collaboration_network
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  DROP TRIGGER IF EXISTS trg_esg_updated_at ON sustainability_esg;
  CREATE TRIGGER trg_esg_updated_at
    BEFORE UPDATE ON sustainability_esg
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
`;

const TABLES = {
  sources: {
    table: "data_sources",
    id: "source_id",
    prefix: "S",
    columns: ["source_id", "name", "url", "owner", "last_synced", "notes", "visibility_level", "review_status"]
  },
  firms: {
    table: "firms",
    id: "firm_id",
    prefix: "F",
    columns: [
      "firm_id",
      "firm_name",
      "registration_no",
      "year_established",
      "ownership_type",
      "parent_company",
      "industry_code",
      "province",
      "industrial_zone",
      "website",
      "contact_email",
      "source_id",
      "visibility_level",
      "review_status"
    ],
    required: ["firm_name"]
  },
  size_finance: {
    table: "firm_size_finance",
    id: "firm_id",
    prefix: "F",
    columns: [
      "firm_id",
      "employees_total",
      "engineers",
      "annual_revenue_mthb",
      "export_percentage",
      "production_capacity",
      "capital_investment_mthb",
      "gov_incentives",
      "funding_access",
      "offset_agreement",
      "source_id",
      "visibility_level",
      "review_status"
    ],
    required: ["firm_id"]
  },
  products: {
    table: "products_services",
    id: "product_id",
    prefix: "P",
    columns: [
      "product_id",
      "firm_id",
      "product_name",
      "value_chain_stage",
      "technology_intensity",
      "main_market",
      "certification",
      "sia_category",
      "itu_service_class",
      "orbit_type",
      "frequency_band",
      "naics_code",
      "hs_code",
      "product_trl",
      "description",
      "source_id",
      "visibility_level",
      "review_status"
    ],
    required: ["firm_id", "product_name", "value_chain_stage", "technology_intensity"]
  },
  tech: {
    table: "technology_capability",
    id: "tech_id",
    prefix: "T",
    columns: [
      "tech_id",
      "firm_id",
      "core_technology",
      "trl_level",
      "rd_expenditure_mthb",
      "rd_personnel",
      "patents_count",
      "patent_field",
      "digitalization_level",
      "source_id",
      "visibility_level",
      "review_status"
    ],
    required: ["firm_id", "core_technology", "trl_level"]
  },
  facilities: {
    table: "infrastructure_facility",
    id: "facility_id",
    prefix: "FA",
    columns: [
      "facility_id",
      "firm_id",
      "testing_lab",
      "simulation_tools",
      "manufacturing_process",
      "software_capability",
      "source_id",
      "visibility_level",
      "review_status"
    ],
    required: ["firm_id"]
  },
  hr: {
    table: "human_resource_profile",
    id: "hr_id",
    prefix: "H",
    columns: [
      "hr_id",
      "firm_id",
      "technician_count",
      "skill_specialization",
      "training_programs",
      "skill_gap",
      "source_id",
      "visibility_level",
      "review_status"
    ],
    required: ["firm_id"]
  },
  linkages: {
    table: "supply_chain_linkage",
    id: "linkage_id",
    prefix: "L",
    columns: [
      "linkage_id",
      "firm_id",
      "partner_firm_id",
      "linkage_type",
      "dependency_level",
      "domestic_or_import",
      "source_id",
      "visibility_level",
      "review_status"
    ],
    required: ["firm_id", "partner_firm_id", "linkage_type"]
  },
  collabs: {
    table: "collaboration_network",
    id: "collab_id",
    prefix: "C",
    columns: [
      "collab_id",
      "firm_id",
      "partner_type",
      "partner_name",
      "collaboration_type",
      "duration_years",
      "source_id",
      "visibility_level",
      "review_status"
    ],
    required: ["firm_id", "partner_type", "partner_name", "collaboration_type"]
  },
  esg: {
    table: "sustainability_esg",
    id: "esg_id",
    prefix: "E",
    columns: [
      "esg_id",
      "firm_id",
      "energy_consumption_mwh",
      "renewable_energy_ratio",
      "carbon_emission_tco2",
      "waste_management_system",
      "esg_certification",
      "source_id",
      "visibility_level",
      "review_status"
    ],
    required: ["firm_id"]
  },
  audit: {
    table: "audit_log",
    id: "audit_id",
    prefix: "A",
    columns: ["audit_id", "ts", "role", "action", "target_table", "target_id", "summary"],
    required: ["role", "action", "target_table", "target_id", "summary"]
  }
};

const RESOURCE_TO_KEY = {
  firms: "firms",
  "size-finance": "size_finance",
  size_finance: "size_finance",
  products: "products",
  tech: "tech",
  facilities: "facilities",
  hr: "hr",
  linkages: "linkages",
  collaborations: "collabs",
  collabs: "collabs",
  esg: "esg",
  sources: "sources",
  audit: "audit"
};

const DATASET_KEYS = [
  "sources",
  "firms",
  "size_finance",
  "products",
  "tech",
  "facilities",
  "hr",
  "linkages",
  "collabs",
  "esg",
  "audit"
];

const DELETE_ORDER = [
  "audit",
  "esg",
  "collabs",
  "linkages",
  "hr",
  "facilities",
  "tech",
  "products",
  "size_finance",
  "firms",
  "sources"
];

const RESET_TABLES = [
  "contracts",
  "sustainability_esg",
  "collaboration_network",
  "supply_chain_linkage",
  "human_resource_profile",
  "infrastructure_facility",
  "technology_capability",
  "products_services",
  "firm_size_finance",
  "audit_log",
  "vocab_terms",
  "firms",
  "data_sources"
];

function response(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
}

function getPath(event) {
  return event.rawPath || event.path || event.requestContext?.http?.path || "/";
}

function getMethod(event) {
  return event.requestContext?.http?.method || event.httpMethod || "GET";
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanValue(column, value) {
  if (value === undefined || value === "") return null;
  if (column === "visibility_level") return value || "internal";
  if (column === "review_status") return value || "draft";
  return value;
}

function assertRequired(config, row) {
  for (const key of config.required || []) {
    if (row[key] === undefined || row[key] === null || row[key] === "") {
      const err = new Error(`${key} is required`);
      err.statusCode = 400;
      throw err;
    }
  }
}

async function initTables(clientOrPool = getPool()) {
  await assertSchemaCompatible(clientOrPool);
  await clientOrPool.query(SCHEMA_SQL);
}

async function schemaStatus(clientOrPool = getPool()) {
  const expectedTextIds = [
    ["firms", "firm_id"],
    ["products_services", "product_id"],
    ["technology_capability", "tech_id"],
    ["infrastructure_facility", "facility_id"],
    ["human_resource_profile", "hr_id"],
    ["supply_chain_linkage", "linkage_id"],
    ["collaboration_network", "collab_id"],
    ["sustainability_esg", "esg_id"],
    ["data_sources", "source_id"],
    ["audit_log", "audit_id"]
  ];

  const result = await clientOrPool.query(
    `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (table_name, column_name) IN (${expectedTextIds.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")})
    ORDER BY table_name, column_name
    `,
    expectedTextIds.flat()
  );

  const columns = result.rows;
  const incompatible = columns.filter((row) => row.data_type !== "text");
  const counts = {};
  for (const table of RESET_TABLES) {
    const exists = await clientOrPool.query("SELECT to_regclass($1) AS name", [`public.${table}`]);
    if (!exists.rows[0].name) continue;
    const count = await clientOrPool.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
    counts[table] = count.rows[0].n;
  }

  return {
    ok: incompatible.length === 0,
    columns,
    incompatible,
    counts
  };
}

async function assertSchemaCompatible(clientOrPool = getPool()) {
  const status = await schemaStatus(clientOrPool);
  if (!status.ok) {
    const details = status.incompatible
      .map((row) => `${row.table_name}.${row.column_name} is ${row.data_type}`)
      .join("; ");
    const error = new Error(
      `Existing prototype schema is not v2-compatible: ${details}. Confirm row counts before replacing it.`
    );
    error.statusCode = 409;
    throw error;
  }
}

async function replaceEmptyPrototypeSchema() {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const status = await schemaStatus(client);
    const nonEmpty = Object.entries(status.counts).filter(([, count]) => Number(count) > 0);

    if (nonEmpty.length > 0) {
      const error = new Error(
        `Refusing to replace schema because existing tables contain data: ${nonEmpty
          .map(([table, count]) => `${table}=${count}`)
          .join(", ")}`
      );
      error.statusCode = 409;
      error.counts = status.counts;
      throw error;
    }

    await client.query(`DROP TABLE IF EXISTS ${RESET_TABLES.join(", ")} CASCADE`);
    await client.query("DROP FUNCTION IF EXISTS set_updated_at() CASCADE");
    await initTables(client);
    const nextStatus = await schemaStatus(client);
    await client.query("COMMIT");
    return nextStatus;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function nextPublicId(client, config) {
  const result = await client.query(`SELECT ${config.id} AS id FROM ${config.table} WHERE ${config.id} LIKE $1`, [
    `${config.prefix}%`
  ]);
  let max = 0;
  for (const row of result.rows) {
    const match = String(row.id || "").match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${config.prefix}${String(max + 1).padStart(3, "0")}`;
}

function buildUpsert(config, cols) {
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const updates = cols
    .filter((col) => col !== config.id)
    .map((col) => `${col} = EXCLUDED.${col}`)
    .join(", ");
  const conflict = updates ? `DO UPDATE SET ${updates}` : "DO NOTHING";
  return `
    INSERT INTO ${config.table} (${cols.join(", ")})
    VALUES (${placeholders})
    ON CONFLICT (${config.id}) ${conflict}
    RETURNING *
  `;
}

function prepareRow(key, row, sourceIds = null) {
  const config = TABLES[key];
  const out = {};
  for (const col of config.columns) {
    if (row[col] !== undefined) out[col] = cleanValue(col, row[col]);
  }
  if (key === "firms" && row.last_updated_ts && !out.updated_at) {
    out.updated_at = row.last_updated_ts;
  }
  if (out.source_id && sourceIds && !sourceIds.has(out.source_id)) {
    out.source_id = null;
  }
  return out;
}

async function upsertRow(client, key, input, sourceIds = null) {
  const config = TABLES[key];
  const row = prepareRow(key, input, sourceIds);
  if (!row[config.id]) row[config.id] = await nextPublicId(client, config);
  assertRequired(config, row);

  const cols = config.columns.filter((col) => row[col] !== undefined);
  const result = await client.query(buildUpsert(config, cols), cols.map((col) => row[col]));
  return result.rows[0];
}

async function deleteRow(client, key, id) {
  const config = TABLES[key];
  const result = await client.query(
    `DELETE FROM ${config.table} WHERE ${config.id} = $1 RETURNING *`,
    [id]
  );
  if (result.rowCount === 0) {
    const err = new Error("Record not found");
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
}

async function listRows(clientOrPool, key) {
  const config = TABLES[key];
  const order = key === "audit" ? "ts DESC" : `${config.id} ASC`;
  const result = await clientOrPool.query(`SELECT * FROM ${config.table} ORDER BY ${order} LIMIT 5000`);
  return result.rows;
}

function rowsFromDataset(data, key) {
  const rows = isObject(data) ? data[key] : [];
  return Array.isArray(rows) ? rows : [];
}

async function getVocab(clientOrPool) {
  const result = await clientOrPool.query(
    "SELECT vocab_key, term FROM vocab_terms ORDER BY vocab_key ASC, sort_order ASC, term ASC"
  );
  const vocab = {};
  for (const row of result.rows) {
    if (!vocab[row.vocab_key]) vocab[row.vocab_key] = [];
    vocab[row.vocab_key].push(row.term);
  }
  return vocab;
}

async function replaceVocab(client, vocab) {
  if (!isObject(vocab)) return;
  for (const [key, terms] of Object.entries(vocab)) {
    if (!Array.isArray(terms)) continue;
    let sort = 0;
    for (const term of terms) {
      if (!term) continue;
      await client.query(
        `
        INSERT INTO vocab_terms (vocab_key, term, sort_order)
        VALUES ($1, $2, $3)
        ON CONFLICT (vocab_key, term)
        DO UPDATE SET sort_order = EXCLUDED.sort_order
        `,
        [key, String(term), sort++]
      );
    }
  }
}

async function getDataset(clientOrPool = getPool()) {
  const dataset = {};
  for (const key of DATASET_KEYS) {
    dataset[key] = await listRows(clientOrPool, key);
  }
  dataset.vocab = await getVocab(clientOrPool);
  return dataset;
}

function datasetCounts(dataset) {
  const counts = {};
  for (const key of DATASET_KEYS) {
    counts[key] = Array.isArray(dataset[key]) ? dataset[key].length : 0;
  }
  counts.vocab_terms = Object.values(dataset.vocab || {}).reduce(
    (sum, terms) => sum + (Array.isArray(terms) ? terms.length : 0),
    0
  );
  return counts;
}

async function replaceDataset(data) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await initTables(client);

    for (const key of DELETE_ORDER) {
      await client.query(`DELETE FROM ${TABLES[key].table}`);
    }
    await client.query("DELETE FROM vocab_terms");

    for (const row of rowsFromDataset(data, "sources")) {
      await upsertRow(client, "sources", row);
    }

    const sourceIds = new Set(rowsFromDataset(data, "sources").map((row) => row.source_id).filter(Boolean));
    for (const key of ["firms", "size_finance", "products", "tech", "facilities", "hr", "linkages", "collabs", "esg", "audit"]) {
      for (const row of rowsFromDataset(data, key)) {
        await upsertRow(client, key, row, sourceIds);
      }
    }
    await replaceVocab(client, data.vocab);

    const dataset = await getDataset(client);
    await client.query("COMMIT");
    return dataset;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function handleContracts(method, path, body) {
  if (method === "GET" && path === "/contracts") {
    const result = await getPool().query(
      `
      SELECT c.*, f.firm_name
      FROM contracts c
      LEFT JOIN firms f ON c.firm_id = f.firm_id
      ORDER BY c.contract_id DESC
      LIMIT 100
      `
    );
    return response(200, result.rows);
  }

  if (method === "POST" && path === "/contracts") {
    if (!body.firm_id || !body.contract_title) {
      return response(400, {
        ok: false,
        error: "firm_id and contract_title are required"
      });
    }

    const result = await getPool().query(
      `
      INSERT INTO contracts (
        firm_id,
        contract_title,
        contract_type,
        contract_status,
        start_date,
        end_date,
        confidentiality_level,
        file_reference
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        body.firm_id,
        body.contract_title,
        body.contract_type || null,
        body.contract_status || null,
        body.start_date || null,
        body.end_date || null,
        body.confidentiality_level || "confidential",
        body.file_reference || null
      ]
    );

    return response(201, result.rows[0]);
  }

  return null;
}

function routeParts(path) {
  return path.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
}

export const handler = async (event) => {
  const method = getMethod(event);
  const path = getPath(event);
  const body = parseBody(event);

  if (method === "OPTIONS") {
    return response(200, { ok: true });
  }

  try {
    if (method === "GET" && path === "/health") {
      const result = await getPool().query("SELECT NOW() AS db_time");
      return response(200, {
        ok: true,
        message: "API and database connection are working",
        db_time: result.rows[0].db_time
      });
    }

    if (method === "GET" && path === "/admin/schema-status") {
      return response(200, await schemaStatus());
    }

    if (method === "POST" && path === "/admin/replace-empty-v2") {
      const status = await replaceEmptyPrototypeSchema();
      return response(200, {
        ok: true,
        message: "Empty prototype schema replaced with satellite database v2 schema",
        status
      });
    }

    if (method === "POST" && (path === "/admin/init" || path === "/admin/init-v2")) {
      await initTables();
      return response(200, {
        ok: true,
        message: "Satellite database v2 tables created"
      });
    }

    if (method === "GET" && path === "/dataset") {
      await initTables();
      const dataset = await getDataset();
      return response(200, dataset);
    }

    if ((method === "PUT" || method === "POST") && path === "/dataset") {
      const dataset = await replaceDataset(body);
      return response(200, {
        ok: true,
        counts: datasetCounts(dataset),
        dataset
      });
    }

    if (path === "/vocab" && method === "GET") {
      await initTables();
      return response(200, await getVocab(getPool()));
    }

    if (path === "/vocab" && method === "PUT") {
      const client = await getPool().connect();
      try {
        await client.query("BEGIN");
        await initTables(client);
        await client.query("DELETE FROM vocab_terms");
        await replaceVocab(client, body);
        await client.query("COMMIT");
        return response(200, { ok: true, vocab: await getVocab(getPool()) });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    const contractResponse = await handleContracts(method, path, body);
    if (contractResponse) return contractResponse;

    const parts = routeParts(path);
    const resource = parts[0];
    const key = RESOURCE_TO_KEY[resource];

    if (key && parts.length === 1 && method === "GET") {
      await initTables();
      return response(200, await listRows(getPool(), key));
    }

    if (key && parts.length === 1 && method === "POST") {
      await initTables();
      const client = await getPool().connect();
      try {
        const row = await upsertRow(client, key, body);
        return response(201, row);
      } finally {
        client.release();
      }
    }

    if (key && parts.length === 2 && method === "GET") {
      await initTables();
      const config = TABLES[key];
      const result = await getPool().query(`SELECT * FROM ${config.table} WHERE ${config.id} = $1`, [parts[1]]);
      if (result.rowCount === 0) return response(404, { ok: false, error: "Record not found" });
      return response(200, result.rows[0]);
    }

    if (key && parts.length === 2 && method === "PUT") {
      await initTables();
      const client = await getPool().connect();
      try {
        const config = TABLES[key];
        const row = await upsertRow(client, key, { ...body, [config.id]: parts[1] });
        return response(200, row);
      } finally {
        client.release();
      }
    }

    if (key && parts.length === 2 && method === "DELETE") {
      await initTables();
      const client = await getPool().connect();
      try {
        const row = await deleteRow(client, key, parts[1]);
        return response(200, { ok: true, deleted: row });
      } finally {
        client.release();
      }
    }

    return response(404, {
      ok: false,
      error: "Route not found",
      method,
      path
    });
  } catch (error) {
    console.error(error);
    return response(error.statusCode || 500, {
      ok: false,
      error: error.message
    });
  }
};
