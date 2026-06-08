-- Satellite Industry Database v2 example-data migration.
-- Assumes database/schema.sql or POST /admin/init-v2 has already run.
-- Idempotent: reruns update existing public IDs instead of duplicating rows.

BEGIN;

INSERT INTO data_sources (source_id, name, url, owner, last_synced, notes, review_status)
VALUES
  ('S001', 'Department of Business Development (DBD)', 'https://datawarehouse.dbd.go.th', 'DBD', '2025-09-30', 'Company registration master', 'published'),
  ('S002', 'GISTDA Industrial Survey 2024', 'https://gistda.or.th', 'GISTDA', '2025-06-15', 'Firm-level capability survey', 'published'),
  ('S003', 'NSTDA Patent Registry', 'https://patentsearch.nstda.or.th', 'NSTDA', '2025-08-01', 'Patents and R&D personnel', 'published'),
  ('S004', 'BOI Investment Records', 'https://www.boi.go.th', 'BOI', '2025-07-20', 'Incentives and CAPEX', 'published')
ON CONFLICT (source_id) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  owner = EXCLUDED.owner,
  last_synced = EXCLUDED.last_synced,
  notes = EXCLUDED.notes,
  review_status = EXCLUDED.review_status;

INSERT INTO firms (
  firm_id, firm_name, registration_no, year_established, ownership_type,
  parent_company, industry_code, province, industrial_zone, website,
  contact_email, source_id, review_status
)
VALUES
  ('F001', 'AstroLink Aerospace', '0105561000011', 2014, 'Local', NULL, 'ISIC-3030', 'Bangkok', 'Bangchak Innovation Cluster', 'https://astrolink.example.th', 'info@astrolink.example.th', 'S001', 'published'),
  ('F002', 'OrbitForge Industries', '0205562000022', 2016, 'JV', 'OrbitForge Holdings (SG)', 'ISIC-2651', 'Chonburi', 'Eastern Economic Corridor', 'https://orbitforge.example.th', 'contact@orbitforge.example.th', 'S001', 'published'),
  ('F003', 'SkyBridge Launch Services', '0305560000033', 2018, 'Local', NULL, 'ISIC-5120', 'Rayong', 'Map Ta Phut', 'https://skybridge.example.th', NULL, 'S001', 'published'),
  ('F004', 'GroundLink Networks', '0405559000044', 2012, 'Local', NULL, 'ISIC-6110', 'Bangkok', 'True Digital Park', 'https://groundlink.example.th', NULL, 'S001', 'published'),
  ('F005', 'ThaiSat Telecom', '0505558000055', 2009, 'Local', NULL, 'ISIC-6130', 'Bangkok', NULL, 'https://thaisat.example.th', NULL, 'S001', 'published'),
  ('F006', 'EarthEye Analytics', '0605563000066', 2019, 'Foreign', 'EarthEye Global Ltd. (UK)', 'ISIC-6201', 'Chiang Mai', 'Chiang Mai Software Park', 'https://eartheye.example.th', NULL, 'S001', 'published'),
  ('F007', 'NaviPath Systems', '0705562000077', 2015, 'Local', NULL, 'ISIC-2620', 'Bangkok', NULL, 'https://navipath.example.th', NULL, 'S001', 'published'),
  ('F008', 'ClearSky Imaging', '0805564000088', 2020, 'JV', 'ClearSky Geomatics (JP)', 'ISIC-7490', 'Khon Kaen', 'Khon Kaen Smart City Hub', 'https://clearsky.example.th', NULL, 'S001', 'published'),
  ('F009', 'Stratos Propulsion', '0905561000099', 2017, 'Local', NULL, 'ISIC-3030', 'Pathum Thani', 'Thailand Science Park', 'https://stratos.example.th', NULL, 'S001', 'published'),
  ('F010', 'PolarCom IoT Networks', '1005563000100', 2021, 'Foreign', 'PolarCom AB (SE)', 'ISIC-6190', 'Bangkok', NULL, 'https://polarcom.example.th', NULL, 'S001', 'published')
ON CONFLICT (firm_id) DO UPDATE SET
  firm_name = EXCLUDED.firm_name,
  registration_no = EXCLUDED.registration_no,
  year_established = EXCLUDED.year_established,
  ownership_type = EXCLUDED.ownership_type,
  parent_company = EXCLUDED.parent_company,
  industry_code = EXCLUDED.industry_code,
  province = EXCLUDED.province,
  industrial_zone = EXCLUDED.industrial_zone,
  website = EXCLUDED.website,
  contact_email = EXCLUDED.contact_email,
  source_id = EXCLUDED.source_id,
  review_status = EXCLUDED.review_status;

INSERT INTO firm_size_finance (
  firm_id, employees_total, engineers, annual_revenue_mthb, export_percentage,
  production_capacity, capital_investment_mthb, gov_incentives, funding_access,
  offset_agreement, source_id, review_status
)
VALUES
  ('F001', 180, 95, 420, 35, '2 satellites/year', 850, 'BOI 8-year tax holiday', 'NIA SME grant', NULL, 'S004', 'published'),
  ('F002', 240, 110, 680, 60, '5000 components/month', 1200, NULL, NULL, NULL, 'S004', 'published'),
  ('F003', 75, 40, 310, 20, '4 launches/year', 2400, NULL, NULL, NULL, 'S004', 'published'),
  ('F004', 130, 70, 290, 15, '12 ground stations', 540, NULL, NULL, NULL, 'S004', 'published'),
  ('F005', 420, 160, 3200, 45, '3 GEO satellites operated', 5800, 'BOI A1', 'Public listing (SET)', 'Defense offset 2022', 'S004', 'published'),
  ('F006', 60, 45, 95, 70, 'Cloud analytics platform', 120, NULL, NULL, NULL, 'S004', 'published'),
  ('F007', 95, 55, 180, 25, 'GNSS receivers 8k/yr', 230, NULL, NULL, NULL, 'S004', 'published'),
  ('F008', 38, 22, 55, 30, 'Agri imagery service', 80, NULL, NULL, NULL, 'S004', 'published'),
  ('F009', 52, 38, 70, 10, 'Propulsion prototypes', 320, NULL, NULL, NULL, 'S004', 'published'),
  ('F010', 110, 65, 240, 55, 'IoT terminals 50k/yr', 410, NULL, NULL, NULL, 'S004', 'published')
ON CONFLICT (firm_id) DO UPDATE SET
  employees_total = EXCLUDED.employees_total,
  engineers = EXCLUDED.engineers,
  annual_revenue_mthb = EXCLUDED.annual_revenue_mthb,
  export_percentage = EXCLUDED.export_percentage,
  production_capacity = EXCLUDED.production_capacity,
  capital_investment_mthb = EXCLUDED.capital_investment_mthb,
  gov_incentives = EXCLUDED.gov_incentives,
  funding_access = EXCLUDED.funding_access,
  offset_agreement = EXCLUDED.offset_agreement,
  source_id = EXCLUDED.source_id,
  review_status = EXCLUDED.review_status;

INSERT INTO products_services (
  product_id, firm_id, product_name, value_chain_stage, technology_intensity,
  main_market, certification, sia_category, itu_service_class, orbit_type,
  frequency_band, naics_code, hs_code, product_trl, description, source_id,
  review_status
)
VALUES
  ('P001', 'F001', 'Small Earth-Observation Satellite Bus', 'Upstream', 'High', 'Domestic + ASEAN', 'AS9100', 'Satellite Manufacturing', 'N/A', 'LEO', 'N/A', '336414', '8802.60', 7, 'Earth-observation small satellite platform up to 150 kg. Bus integration with payload accommodation.', 'S002', 'published'),
  ('P002', 'F002', 'Satellite RF Front-End Modules', 'Upstream', 'High', 'Export (EU/JP)', 'ISO 9001, AS9100', 'Satellite Manufacturing', 'N/A', 'N/A', 'Ku', '334220', '8525.60', 8, 'RF and microwave front-end module for satcom payload, Ku- and Ka-band variants.', 'S002', 'published'),
  ('P003', 'F003', 'Suborbital Launch Vehicle Service', 'Midstream', 'High', 'Domestic', 'ISO 9001', 'Launch Services', 'N/A', 'Sub-orbital', 'N/A', '336414', '8802.60', 5, 'Suborbital launch vehicle service for technology demo and microgravity payloads.', 'S002', 'published'),
  ('P004', 'F004', 'Ground Station as a Service', 'Midstream', 'Medium', 'Domestic + ASEAN', 'ISO 27001', 'Ground Equipment', 'FSS', 'N/A', 'Ku', '334220', '8525.60', 8, 'Ground station as a service: TT&C and data-downlink hosting for LEO/MEO/GEO operators.', 'S002', 'published'),
  ('P005', 'F005', 'GEO Satellite Capacity Lease', 'Downstream', 'Medium', 'Domestic + APAC', 'ITU compliant', 'Satellite Services', 'FSS', 'GEO', 'Ku', '517410', '-', 9, 'GEO satellite capacity lease for telecom and broadcast operators.', 'S002', 'published'),
  ('P006', 'F006', 'EO Analytics Cloud Platform', 'Downstream', 'High', 'Global', 'ISO 27001', 'Satellite Services', 'EESS', 'LEO', 'N/A', '541715', '-', 8, 'Cloud-hosted EO analytics platform: multi-sensor fusion, change detection, and AI/ML pipeline.', 'S002', 'published'),
  ('P007', 'F007', 'Precision GNSS Receiver', 'Downstream', 'Medium', 'Domestic + ASEAN', 'RoHS', 'Ground Equipment', 'RDSS', 'MEO', 'L', '334220', '8526.91', 8, 'Precision multi-constellation GNSS receiver with RTK.', 'S002', 'published'),
  ('P008', 'F008', 'Agricultural Remote Sensing Service', 'Downstream', 'Medium', 'Domestic', 'GAP', 'Satellite Services', 'EESS', 'LEO', 'N/A', '541715', '-', 7, 'Multispectral remote-sensing service for agriculture: yield prediction, irrigation, and pest mapping.', 'S002', 'published'),
  ('P009', 'F009', 'Bipropellant Thruster Prototype', 'Upstream', 'High', 'Research', '-', 'Satellite Manufacturing', 'N/A', 'N/A', 'N/A', '336414', '8803.90', 4, 'Bipropellant thruster prototype for orbit insertion and station-keeping.', 'S002', 'published'),
  ('P010', 'F010', 'LEO IoT Satellite Terminal', 'Downstream', 'High', 'Export (EU)', 'CE, FCC', 'Ground Equipment', 'MSS', 'LEO', 'L', '334220', '8517.62', 7, 'LEO satellite IoT terminal for asset tracking and remote sensing.', 'S002', 'published')
ON CONFLICT (product_id) DO UPDATE SET
  firm_id = EXCLUDED.firm_id,
  product_name = EXCLUDED.product_name,
  value_chain_stage = EXCLUDED.value_chain_stage,
  technology_intensity = EXCLUDED.technology_intensity,
  main_market = EXCLUDED.main_market,
  certification = EXCLUDED.certification,
  sia_category = EXCLUDED.sia_category,
  itu_service_class = EXCLUDED.itu_service_class,
  orbit_type = EXCLUDED.orbit_type,
  frequency_band = EXCLUDED.frequency_band,
  naics_code = EXCLUDED.naics_code,
  hs_code = EXCLUDED.hs_code,
  product_trl = EXCLUDED.product_trl,
  description = EXCLUDED.description,
  source_id = EXCLUDED.source_id,
  review_status = EXCLUDED.review_status;

INSERT INTO technology_capability (
  tech_id, firm_id, core_technology, trl_level, rd_expenditure_mthb,
  rd_personnel, patents_count, patent_field, digitalization_level, source_id,
  review_status
)
VALUES
  ('T001', 'F001', 'Satellite bus integration', 7, 75, 28, 6, NULL, 4, 'S003', 'published'),
  ('T002', 'F002', 'RF / microwave components', 8, 120, 35, 14, 'RF, microwave, antenna arrays', 5, 'S003', 'published'),
  ('T003', 'F003', 'Launch vehicle propulsion', 5, 95, 22, 3, NULL, 3, 'S003', 'published'),
  ('T004', 'F004', 'Tracking, telemetry & command', 8, 40, 18, 2, NULL, 4, 'S003', 'published'),
  ('T005', 'F005', 'GEO satcom payload ops', 9, 250, 55, 9, 'Satcom modulation, payload control', 5, 'S003', 'published'),
  ('T006', 'F006', 'EO image AI/ML analytics', 8, 35, 30, 4, NULL, 5, 'S003', 'published'),
  ('T007', 'F007', 'GNSS signal processing', 8, 28, 20, 5, NULL, 4, 'S003', 'published'),
  ('T008', 'F008', 'Multispectral image processing', 7, 12, 10, 1, NULL, 4, 'S003', 'published'),
  ('T009', 'F009', 'Hybrid rocket propulsion', 4, 45, 24, 2, NULL, 3, 'S003', 'published'),
  ('T010', 'F010', 'LEO IoT NB-IoT over satellite', 7, 60, 32, 7, 'NB-IoT NTN, low-power modem', 5, 'S003', 'published')
ON CONFLICT (tech_id) DO UPDATE SET
  firm_id = EXCLUDED.firm_id,
  core_technology = EXCLUDED.core_technology,
  trl_level = EXCLUDED.trl_level,
  rd_expenditure_mthb = EXCLUDED.rd_expenditure_mthb,
  rd_personnel = EXCLUDED.rd_personnel,
  patents_count = EXCLUDED.patents_count,
  patent_field = EXCLUDED.patent_field,
  digitalization_level = EXCLUDED.digitalization_level,
  source_id = EXCLUDED.source_id,
  review_status = EXCLUDED.review_status;

INSERT INTO infrastructure_facility (
  facility_id, firm_id, testing_lab, simulation_tools, manufacturing_process,
  software_capability, source_id, review_status
)
VALUES
  ('FA001', 'F001', TRUE, TRUE, 'Cleanroom ISO 8 assembly', 'Embedded flight software', 'S002', 'published'),
  ('FA002', 'F002', TRUE, TRUE, 'SMT, RF testing chamber', 'FPGA / DSP firmware', 'S002', 'published'),
  ('FA003', 'F003', TRUE, TRUE, 'Engine static test stand', 'Trajectory simulation', 'S002', 'published'),
  ('FA004', 'F004', FALSE, TRUE, 'Antenna integration', 'TT&C control systems', 'S002', 'published'),
  ('FA005', 'F005', TRUE, TRUE, 'Satellite Operations Center', 'NMS, traffic engineering', 'S002', 'published'),
  ('FA006', 'F006', FALSE, TRUE, 'Cloud data center co-loc', 'AI/ML pipeline, GIS', 'S002', 'published'),
  ('FA007', 'F007', TRUE, TRUE, 'PCB assembly, RF test', 'GNSS firmware, embedded', 'S002', 'published'),
  ('FA008', 'F008', FALSE, TRUE, 'Image processing rigs', 'Spectral analytics SaaS', 'S002', 'published'),
  ('FA009', 'F009', TRUE, TRUE, 'Propellant lab, test bunker', 'CFD, combustion modeling', 'S002', 'published'),
  ('FA010', 'F010', TRUE, TRUE, 'Terminal assembly', 'Modem firmware, MAC layer', 'S002', 'published')
ON CONFLICT (facility_id) DO UPDATE SET
  firm_id = EXCLUDED.firm_id,
  testing_lab = EXCLUDED.testing_lab,
  simulation_tools = EXCLUDED.simulation_tools,
  manufacturing_process = EXCLUDED.manufacturing_process,
  software_capability = EXCLUDED.software_capability,
  source_id = EXCLUDED.source_id,
  review_status = EXCLUDED.review_status;

INSERT INTO human_resource_profile (
  hr_id, firm_id, technician_count, skill_specialization, training_programs,
  skill_gap, source_id, review_status
)
VALUES
  ('H001', 'F001', 55, 'AIT, structural design', 'ESA partnership program', 'Senior systems engineers', 'S002', 'published'),
  ('H002', 'F002', 80, 'RF design, microelectronics', 'IMEC short course', 'RFIC designers', 'S002', 'published'),
  ('H003', 'F003', 25, 'Propulsion, GNC', 'JAXA exchange', 'Avionics specialists', 'S002', 'published'),
  ('H004', 'F004', 45, 'Antenna, networking', 'ITU training', 'Cybersecurity for space links', 'S002', 'published'),
  ('H005', 'F005', 180, 'Satcom ops, regulatory', 'Internal academy', '5G NTN integration', 'S002', 'published'),
  ('H006', 'F006', 12, 'ML engineers, geospatial', 'Coursera/AWS', 'Domain experts in agri', 'S002', 'published'),
  ('H007', 'F007', 35, 'GNSS, embedded SW', 'GPS world workshop', 'Multi-frequency RTK experts', 'S002', 'published'),
  ('H008', 'F008', 14, 'Remote sensing analysts', 'GISTDA training', 'Agronomists', 'S002', 'published'),
  ('H009', 'F009', 18, 'Combustion, materials', 'Tohoku Univ. internship', 'Test engineers', 'S002', 'published'),
  ('H010', 'F010', 40, 'IoT, modem firmware', '3GPP working groups', 'NTN protocol experts', 'S002', 'published')
ON CONFLICT (hr_id) DO UPDATE SET
  firm_id = EXCLUDED.firm_id,
  technician_count = EXCLUDED.technician_count,
  skill_specialization = EXCLUDED.skill_specialization,
  training_programs = EXCLUDED.training_programs,
  skill_gap = EXCLUDED.skill_gap,
  source_id = EXCLUDED.source_id,
  review_status = EXCLUDED.review_status;

INSERT INTO supply_chain_linkage (
  linkage_id, firm_id, partner_firm_id, linkage_type, dependency_level,
  domestic_or_import, source_id, review_status
)
VALUES
  ('L001', 'F001', 'F002', 'Supplier', 4, 'Domestic', 'S002', 'published'),
  ('L002', 'F001', 'F009', 'Supplier', 3, 'Domestic', 'S002', 'published'),
  ('L003', 'F001', 'F003', 'Buyer', 5, 'Domestic', 'S002', 'published'),
  ('L004', 'F003', 'F004', 'Partner', 4, 'Domestic', 'S002', 'published'),
  ('L005', 'F004', 'F005', 'Buyer', 5, 'Domestic', 'S002', 'published'),
  ('L006', 'F004', 'F006', 'Buyer', 3, 'Domestic', 'S002', 'published'),
  ('L007', 'F005', 'F007', 'Partner', 2, 'Domestic', 'S002', 'published'),
  ('L008', 'F006', 'F008', 'Partner', 4, 'Domestic', 'S002', 'published'),
  ('L009', 'F010', 'F004', 'Buyer', 4, 'Domestic', 'S002', 'published'),
  ('L010', 'F010', 'F002', 'Supplier', 5, 'Domestic', 'S002', 'published'),
  ('L011', 'F002', 'F001', 'Buyer', 3, 'Domestic', 'S002', 'published'),
  ('L012', 'F007', 'F002', 'Supplier', 2, 'Import', 'S002', 'published')
ON CONFLICT (linkage_id) DO UPDATE SET
  firm_id = EXCLUDED.firm_id,
  partner_firm_id = EXCLUDED.partner_firm_id,
  linkage_type = EXCLUDED.linkage_type,
  dependency_level = EXCLUDED.dependency_level,
  domestic_or_import = EXCLUDED.domestic_or_import,
  source_id = EXCLUDED.source_id,
  review_status = EXCLUDED.review_status;

INSERT INTO collaboration_network (
  collab_id, firm_id, partner_type, partner_name, collaboration_type,
  duration_years, source_id, review_status
)
VALUES
  ('C001', 'F001', 'University', 'Bangkok Aerospace University', 'R&D', 4, 'S002', 'published'),
  ('C002', 'F001', 'PRI', 'Thai Space Tech Institute', 'Testing', 3, 'S002', 'published'),
  ('C003', 'F002', 'University', 'Chonburi Institute of Technology', 'R&D', 5, 'S002', 'published'),
  ('C004', 'F003', 'PRI', 'Thai Space Tech Institute', 'R&D', 2, 'S002', 'published'),
  ('C005', 'F004', 'Association', 'Thailand Satcom Operators Association', 'Training', 6, 'S002', 'published'),
  ('C006', 'F005', 'University', 'Bangkok Aerospace University', 'Training', 8, 'S002', 'published'),
  ('C007', 'F006', 'University', 'Chiang Mai Geoinformatics School', 'R&D', 3, 'S002', 'published'),
  ('C008', 'F007', 'PRI', 'National Electronics Lab', 'R&D', 4, 'S002', 'published'),
  ('C009', 'F008', 'University', 'Khon Kaen Agritech University', 'R&D', 2, 'S002', 'published'),
  ('C010', 'F009', 'PRI', 'Thai Space Tech Institute', 'R&D', 5, 'S002', 'published'),
  ('C011', 'F010', 'Association', 'ASEAN IoT Alliance', 'Training', 2, 'S002', 'published')
ON CONFLICT (collab_id) DO UPDATE SET
  firm_id = EXCLUDED.firm_id,
  partner_type = EXCLUDED.partner_type,
  partner_name = EXCLUDED.partner_name,
  collaboration_type = EXCLUDED.collaboration_type,
  duration_years = EXCLUDED.duration_years,
  source_id = EXCLUDED.source_id,
  review_status = EXCLUDED.review_status;

INSERT INTO sustainability_esg (
  esg_id, firm_id, energy_consumption_mwh, renewable_energy_ratio,
  carbon_emission_tco2, waste_management_system, esg_certification,
  source_id, review_status
)
VALUES
  ('E001', 'F001', 1800, 35, 720, TRUE, 'ISO 14001', 'S002', 'published'),
  ('E002', 'F002', 3200, 22, 1380, TRUE, 'ISO 14001, ISO 50001', 'S002', 'published'),
  ('E003', 'F003', 950, 18, 540, TRUE, NULL, 'S002', 'published'),
  ('E004', 'F004', 1200, 60, 320, TRUE, 'ISO 14001', 'S002', 'published'),
  ('E005', 'F005', 5400, 40, 2100, TRUE, 'ISO 14001, ESG-A', 'S002', 'published'),
  ('E006', 'F006', 280, 75, 60, TRUE, 'ESG-A', 'S002', 'published'),
  ('E007', 'F007', 640, 25, 280, TRUE, NULL, 'S002', 'published'),
  ('E008', 'F008', 110, 50, 35, FALSE, NULL, 'S002', 'published'),
  ('E009', 'F009', 720, 20, 410, TRUE, NULL, 'S002', 'published'),
  ('E010', 'F010', 480, 55, 180, TRUE, 'ISO 14001', 'S002', 'published')
ON CONFLICT (esg_id) DO UPDATE SET
  firm_id = EXCLUDED.firm_id,
  energy_consumption_mwh = EXCLUDED.energy_consumption_mwh,
  renewable_energy_ratio = EXCLUDED.renewable_energy_ratio,
  carbon_emission_tco2 = EXCLUDED.carbon_emission_tco2,
  waste_management_system = EXCLUDED.waste_management_system,
  esg_certification = EXCLUDED.esg_certification,
  source_id = EXCLUDED.source_id,
  review_status = EXCLUDED.review_status;

INSERT INTO audit_log (audit_id, ts, role, action, target_table, target_id, summary)
VALUES ('A001', '2025-09-30T08:00:00Z', 'Admin', 'import', 'firms', '*', 'Initial seed of 10 firms imported from DBD')
ON CONFLICT (audit_id) DO UPDATE SET
  ts = EXCLUDED.ts,
  role = EXCLUDED.role,
  action = EXCLUDED.action,
  target_table = EXCLUDED.target_table,
  target_id = EXCLUDED.target_id,
  summary = EXCLUDED.summary;

WITH terms(vocab_key, term, sort_order) AS (
  VALUES
    ('ownership_types', 'Local', 0), ('ownership_types', 'Foreign', 1), ('ownership_types', 'JV', 2),
    ('value_chain_stages', 'Upstream', 0), ('value_chain_stages', 'Midstream', 1), ('value_chain_stages', 'Downstream', 2),
    ('tech_intensities', 'Low', 0), ('tech_intensities', 'Medium', 1), ('tech_intensities', 'High', 2),
    ('linkage_types', 'Supplier', 0), ('linkage_types', 'Buyer', 1), ('linkage_types', 'Partner', 2),
    ('partner_types', 'University', 0), ('partner_types', 'PRI', 1), ('partner_types', 'Association', 2),
    ('collab_types', 'R&D', 0), ('collab_types', 'Training', 1), ('collab_types', 'Testing', 2),
    ('provinces', 'Bangkok', 0), ('provinces', 'Chonburi', 1), ('provinces', 'Rayong', 2), ('provinces', 'Pathum Thani', 3),
    ('provinces', 'Chiang Mai', 4), ('provinces', 'Khon Kaen', 5), ('provinces', 'Phuket', 6), ('provinces', 'Nakhon Ratchasima', 7),
    ('industry_codes', 'ISIC-3030', 0), ('industry_codes', 'ISIC-2651', 1), ('industry_codes', 'ISIC-5120', 2),
    ('industry_codes', 'ISIC-6110', 3), ('industry_codes', 'ISIC-6130', 4), ('industry_codes', 'ISIC-6190', 5),
    ('industry_codes', 'ISIC-6201', 6), ('industry_codes', 'ISIC-2620', 7), ('industry_codes', 'ISIC-7490', 8),
    ('core_technologies', 'Satellite bus integration', 0), ('core_technologies', 'RF / microwave components', 1),
    ('core_technologies', 'Launch vehicle propulsion', 2), ('core_technologies', 'Tracking, telemetry & command', 3),
    ('core_technologies', 'GEO satcom payload ops', 4), ('core_technologies', 'EO image AI/ML analytics', 5),
    ('core_technologies', 'GNSS signal processing', 6), ('core_technologies', 'Multispectral image processing', 7),
    ('core_technologies', 'Hybrid rocket propulsion', 8), ('core_technologies', 'LEO IoT NB-IoT over satellite', 9),
    ('sia_categories', 'Satellite Manufacturing', 0), ('sia_categories', 'Launch Services', 1),
    ('sia_categories', 'Satellite Services', 2), ('sia_categories', 'Ground Equipment', 3),
    ('itu_services', 'FSS', 0), ('itu_services', 'MSS', 1), ('itu_services', 'BSS', 2), ('itu_services', 'EESS', 3),
    ('itu_services', 'RDSS', 4), ('itu_services', 'SRS', 5), ('itu_services', 'N/A', 6),
    ('orbit_types', 'LEO', 0), ('orbit_types', 'MEO', 1), ('orbit_types', 'GEO', 2), ('orbit_types', 'HEO', 3),
    ('orbit_types', 'Sub-orbital', 4), ('orbit_types', 'N/A', 5),
    ('frequency_bands', 'L', 0), ('frequency_bands', 'S', 1), ('frequency_bands', 'C', 2), ('frequency_bands', 'X', 3),
    ('frequency_bands', 'Ku', 4), ('frequency_bands', 'Ka', 5), ('frequency_bands', 'V', 6), ('frequency_bands', 'Q', 7), ('frequency_bands', 'N/A', 8),
    ('naics_codes', '334220', 0), ('naics_codes', '336414', 1), ('naics_codes', '517410', 2),
    ('naics_codes', '541330', 3), ('naics_codes', '541715', 4), ('naics_codes', '541512', 5),
    ('hs_codes', '8802.60', 0), ('hs_codes', '8803.90', 1), ('hs_codes', '8525.60', 2),
    ('hs_codes', '8526.91', 3), ('hs_codes', '8526.92', 4), ('hs_codes', '8517.62', 5)
)
INSERT INTO vocab_terms (vocab_key, term, sort_order)
SELECT vocab_key, term, sort_order FROM terms
ON CONFLICT (vocab_key, term) DO UPDATE SET sort_order = EXCLUDED.sort_order;

COMMIT;
