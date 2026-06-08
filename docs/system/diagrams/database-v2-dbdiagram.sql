CREATE TABLE data_sources (
  source_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  owner TEXT,
  last_synced DATE,
  notes TEXT,
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN data_sources.source_id IS 'Example S001';
COMMENT ON COLUMN data_sources.name IS 'Example Department of Business Development';
COMMENT ON COLUMN data_sources.url IS 'Example https://datawarehouse.dbd.go.th';
COMMENT ON COLUMN data_sources.owner IS 'Example DBD';
COMMENT ON COLUMN data_sources.last_synced IS 'Example 2025-09-30';
COMMENT ON COLUMN data_sources.notes IS 'Example Company registration master';

CREATE TABLE firms (
  firm_id TEXT PRIMARY KEY,
  firm_name TEXT NOT NULL,
  registration_no TEXT UNIQUE,
  year_established INTEGER,
  ownership_type TEXT,
  parent_company TEXT,
  industry_code TEXT,
  province TEXT,
  industrial_zone TEXT,
  website TEXT,
  contact_email TEXT,
  source_id TEXT REFERENCES data_sources(source_id),
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN firms.firm_id IS 'Example F001';
COMMENT ON COLUMN firms.firm_name IS 'Example AstroLink Aerospace';
COMMENT ON COLUMN firms.registration_no IS 'Example 0105561000011';
COMMENT ON COLUMN firms.year_established IS 'Example 2014';
COMMENT ON COLUMN firms.ownership_type IS 'Example Local';
COMMENT ON COLUMN firms.industry_code IS 'Example ISIC-3030';
COMMENT ON COLUMN firms.province IS 'Example Bangkok';

CREATE TABLE firm_size_finance (
  firm_id TEXT PRIMARY KEY REFERENCES firms(firm_id),
  employees_total INTEGER NOT NULL DEFAULT 0,
  engineers INTEGER NOT NULL DEFAULT 0,
  annual_revenue_mthb NUMERIC(14,2) NOT NULL DEFAULT 0,
  export_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  production_capacity TEXT,
  capital_investment_mthb NUMERIC(14,2) NOT NULL DEFAULT 0,
  gov_incentives TEXT,
  funding_access TEXT,
  offset_agreement TEXT,
  source_id TEXT REFERENCES data_sources(source_id),
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN firm_size_finance.employees_total IS 'Example 180';
COMMENT ON COLUMN firm_size_finance.annual_revenue_mthb IS 'Example 420.00';
COMMENT ON COLUMN firm_size_finance.export_percentage IS 'Example 35.00';

CREATE TABLE products_services (
  product_id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(firm_id),
  product_name TEXT NOT NULL,
  value_chain_stage TEXT NOT NULL,
  technology_intensity TEXT NOT NULL,
  main_market TEXT,
  certification TEXT,
  sia_category TEXT,
  itu_service_class TEXT,
  orbit_type TEXT,
  frequency_band TEXT,
  naics_code TEXT,
  hs_code TEXT,
  product_trl INTEGER,
  description TEXT,
  source_id TEXT REFERENCES data_sources(source_id),
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN products_services.product_id IS 'Example P001';
COMMENT ON COLUMN products_services.product_name IS 'Example Small Earth-Observation Satellite Bus';
COMMENT ON COLUMN products_services.value_chain_stage IS 'Example Upstream';
COMMENT ON COLUMN products_services.technology_intensity IS 'Example High';
COMMENT ON COLUMN products_services.product_trl IS 'Example 7';

CREATE TABLE technology_capability (
  tech_id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(firm_id),
  core_technology TEXT NOT NULL,
  trl_level INTEGER NOT NULL,
  rd_expenditure_mthb NUMERIC(14,2) NOT NULL DEFAULT 0,
  rd_personnel INTEGER NOT NULL DEFAULT 0,
  patents_count INTEGER NOT NULL DEFAULT 0,
  patent_field TEXT,
  digitalization_level INTEGER NOT NULL DEFAULT 0,
  source_id TEXT REFERENCES data_sources(source_id),
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN technology_capability.tech_id IS 'Example T001';
COMMENT ON COLUMN technology_capability.core_technology IS 'Example Satellite bus integration';
COMMENT ON COLUMN technology_capability.trl_level IS 'Example 7';

CREATE TABLE infrastructure_facility (
  facility_id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(firm_id),
  testing_lab BOOLEAN NOT NULL DEFAULT FALSE,
  simulation_tools BOOLEAN NOT NULL DEFAULT FALSE,
  manufacturing_process TEXT,
  software_capability TEXT,
  source_id TEXT REFERENCES data_sources(source_id),
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN infrastructure_facility.facility_id IS 'Example FA001';
COMMENT ON COLUMN infrastructure_facility.testing_lab IS 'Example true';

CREATE TABLE human_resource_profile (
  hr_id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(firm_id),
  technician_count INTEGER NOT NULL DEFAULT 0,
  skill_specialization TEXT,
  training_programs TEXT,
  skill_gap TEXT,
  source_id TEXT REFERENCES data_sources(source_id),
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN human_resource_profile.hr_id IS 'Example H001';
COMMENT ON COLUMN human_resource_profile.technician_count IS 'Example 55';

CREATE TABLE supply_chain_linkage (
  linkage_id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(firm_id),
  partner_firm_id TEXT NOT NULL REFERENCES firms(firm_id),
  linkage_type TEXT NOT NULL,
  dependency_level INTEGER NOT NULL DEFAULT 0,
  domestic_or_import TEXT,
  source_id TEXT REFERENCES data_sources(source_id),
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN supply_chain_linkage.linkage_id IS 'Example L001';
COMMENT ON COLUMN supply_chain_linkage.partner_firm_id IS 'Example F002';
COMMENT ON COLUMN supply_chain_linkage.linkage_type IS 'Example Supplier';

CREATE TABLE collaboration_network (
  collab_id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(firm_id),
  partner_type TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  collaboration_type TEXT NOT NULL,
  duration_years INTEGER NOT NULL DEFAULT 0,
  source_id TEXT REFERENCES data_sources(source_id),
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN collaboration_network.collab_id IS 'Example C001';
COMMENT ON COLUMN collaboration_network.partner_type IS 'Example University';
COMMENT ON COLUMN collaboration_network.partner_name IS 'Example Bangkok Aerospace University';

CREATE TABLE sustainability_esg (
  esg_id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(firm_id),
  energy_consumption_mwh NUMERIC(14,2) NOT NULL DEFAULT 0,
  renewable_energy_ratio NUMERIC(5,2) NOT NULL DEFAULT 0,
  carbon_emission_tco2 NUMERIC(14,2) NOT NULL DEFAULT 0,
  waste_management_system BOOLEAN NOT NULL DEFAULT FALSE,
  esg_certification TEXT,
  source_id TEXT REFERENCES data_sources(source_id),
  visibility_level TEXT NOT NULL DEFAULT 'internal',
  review_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN sustainability_esg.esg_id IS 'Example E001';
COMMENT ON COLUMN sustainability_esg.energy_consumption_mwh IS 'Example 1800.00';
COMMENT ON COLUMN sustainability_esg.renewable_energy_ratio IS 'Example 35.00';

CREATE TABLE vocab_terms (
  vocab_key TEXT NOT NULL,
  term TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (vocab_key, term)
);

COMMENT ON COLUMN vocab_terms.vocab_key IS 'Example ownership_types';
COMMENT ON COLUMN vocab_terms.term IS 'Example Local';

CREATE TABLE audit_log (
  audit_id TEXT PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  summary TEXT NOT NULL
);

COMMENT ON COLUMN audit_log.audit_id IS 'Example A001';
COMMENT ON COLUMN audit_log.role IS 'Example Admin';
COMMENT ON COLUMN audit_log.action IS 'Example import';

CREATE TABLE contracts (
  contract_id SERIAL PRIMARY KEY,
  firm_id TEXT REFERENCES firms(firm_id),
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

COMMENT ON COLUMN contracts.contract_id IS 'Example 1';
COMMENT ON COLUMN contracts.contract_title IS 'Example Satellite R&D MOU';
