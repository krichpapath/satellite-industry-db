-- Satellite Industry Database v2 reference schema.
-- Target: Amazon RDS PostgreSQL behind API Gateway + Lambda.
-- This file is safe to rerun for table/index creation. It does not seed fake data.

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

COMMENT ON TABLE data_sources IS 'Governance/provenance registry for source attribution.';

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

COMMENT ON TABLE firms IS 'Anchor table for satellite industry organizations.';
COMMENT ON COLUMN firms.firm_id IS 'Public stable ID used by the frontend, e.g. F001.';

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

COMMENT ON TABLE firm_size_finance IS 'Current size, revenue, capacity, investment, and incentive profile per firm.';

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
  flight_heritage TEXT,
  description TEXT,
  source_id TEXT REFERENCES data_sources(source_id) ON DELETE SET NULL,
  visibility_level TEXT NOT NULL DEFAULT 'internal'
    CHECK (visibility_level IN ('public', 'internal', 'confidential', 'restricted')),
  review_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (review_status IN ('draft', 'pending_review', 'published', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE products_services IS 'Product/service portfolio and value-chain classification.';

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

COMMENT ON TABLE technology_capability IS 'Firm technology, TRL, R&D, patent, and digitalization capability rows.';

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

COMMENT ON TABLE supply_chain_linkage IS 'Directed firm-to-firm supply chain and ecosystem edges.';

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

COMMENT ON TABLE vocab_terms IS 'Controlled vocabulary terms backing frontend dropdowns.';

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

-- Retained from the AWS prototype. The current frontend does not consume it yet.
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
CREATE TRIGGER trg_sources_updated_at BEFORE UPDATE ON data_sources
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_firms_updated_at ON firms;
CREATE TRIGGER trg_firms_updated_at BEFORE UPDATE ON firms
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_finance_updated_at ON firm_size_finance;
CREATE TRIGGER trg_finance_updated_at BEFORE UPDATE ON firm_size_finance
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products_services;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products_services
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_tech_updated_at ON technology_capability;
CREATE TRIGGER trg_tech_updated_at BEFORE UPDATE ON technology_capability
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_facilities_updated_at ON infrastructure_facility;
CREATE TRIGGER trg_facilities_updated_at BEFORE UPDATE ON infrastructure_facility
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_hr_updated_at ON human_resource_profile;
CREATE TRIGGER trg_hr_updated_at BEFORE UPDATE ON human_resource_profile
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_linkage_updated_at ON supply_chain_linkage;
CREATE TRIGGER trg_linkage_updated_at BEFORE UPDATE ON supply_chain_linkage
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_collabs_updated_at ON collaboration_network;
CREATE TRIGGER trg_collabs_updated_at BEFORE UPDATE ON collaboration_network
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_esg_updated_at ON sustainability_esg;
CREATE TRIGGER trg_esg_updated_at BEFORE UPDATE ON sustainability_esg
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
