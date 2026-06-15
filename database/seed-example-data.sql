-- Clean Company + Component seed data.
-- Use only after confirming the target database can be replaced.

BEGIN;

ALTER TABLE products_services
  ADD COLUMN IF NOT EXISTS system TEXT NOT NULL DEFAULT 'Unidentified',
  ADD COLUMN IF NOT EXISTS module TEXT NOT NULL DEFAULT 'Unidentified',
  ADD COLUMN IF NOT EXISTS component_name TEXT NOT NULL DEFAULT 'Unidentified';

DELETE FROM audit_log;
DELETE FROM sustainability_esg;
DELETE FROM collaboration_network;
DELETE FROM supply_chain_linkage;
DELETE FROM human_resource_profile;
DELETE FROM infrastructure_facility;
DELETE FROM technology_capability;
DELETE FROM products_services;
DELETE FROM firm_size_finance;
DELETE FROM firms;
DELETE FROM data_sources;

INSERT INTO data_sources (source_id, name, owner, last_synced, notes, review_status)
VALUES
  ('S001', 'Prototype reviewer seed data', 'Project team', '2026-06-14', 'Small clean dataset aligned with Company + Component UI.', 'published'),
  ('S002', 'Satellite component expert taxonomy workbook', 'Satellite domain expert', '2026-06-14', 'System, Module, Component choices from the reviewed workbook.', 'published');

INSERT INTO firms (
  firm_id, firm_name, registration_no, year_established, ownership_type,
  parent_company, industry_code, province, industrial_zone, website,
  contact_email, source_id, review_status
)
VALUES
  ('F001', 'Siam Orbital Components', '0105567001001', 2020, 'Local', 'Siam Precision Group', 'ISIC-3030', 'Bangkok', 'Thailand Science Park', 'https://siam-orbital.example.th', 'components@siam-orbital.example.th', 'S001', 'published'),
  ('F002', 'Lanna Space Electronics', '0505567002002', 2018, 'JV', 'Northern Microelectronics JV', 'ISIC-2651', 'Chiang Mai', 'Chiang Mai Software Park', 'https://lanna-space.example.th', 'info@lanna-space.example.th', 'S001', 'published'),
  ('F003', 'Eastern Ground Systems', '0205567003003', 2022, 'Local', NULL, 'ISIC-6110', 'Chonburi', 'Eastern Economic Corridor', 'https://eastern-ground.example.th', 'ops@eastern-ground.example.th', 'S001', 'published');

INSERT INTO firm_size_finance (
  firm_id, employees_total, engineers, annual_revenue_mthb, export_percentage,
  production_capacity, capital_investment_mthb, gov_incentives, funding_access,
  offset_agreement, source_id, review_status
)
VALUES
  ('F001', 62, 34, 86, 18, 'Prototype-to-small-batch satellite mechanical and harness assemblies', 145, 'BOI machinery import duty exemption', 'NSTDA engineering grant', NULL, 'S001', 'published'),
  ('F002', 48, 29, 72, 42, '1,200 radiation-tolerant electronic modules/year', 118, 'EECi electronics prototype support', 'University co-development fund', NULL, 'S001', 'published'),
  ('F003', 35, 18, 41, 8, 'Ground segment racks, RF integration, and field service teams', 64, NULL, 'Commercial bank credit line', NULL, 'S001', 'published');

INSERT INTO products_services (
  product_id, firm_id, product_name,
  value_chain_stage, technology_intensity, sia_category, itu_service_class, orbit_type,
  system, module, component_name, description, source_id, review_status
)
VALUES
  ('P001', 'F001', 'Deployable Solar Panel Hinge Set',
   'Upstream', 'Medium', 'สปริงบิดกางแผง (Torsion Springs): สร้างแรงดีดกางแผงบานพับ', 'Power Generation(ส่วนผลิตกระแสไฟ)', 'Electrical Power System (EPS)(ระบบพลังงานไฟฟ้า)',
   'Electrical Power System (EPS)(ระบบพลังงานไฟฟ้า)', 'Power Generation(ส่วนผลิตกระแสไฟ)', 'สปริงบิดกางแผง (Torsion Springs): สร้างแรงดีดกางแผงบานพับ',
   '<p>Mechanical hinge and spring set for small satellite deployable solar panels.</p><ul><li>Designed for repeatable deployment tests</li><li>Supplied with inspection report and traceable material lot</li></ul>', 'S002', 'published'),
  ('P002', 'F001', 'Primary Structure Interface Ring',
   'Upstream', 'Medium', 'วงแหวนแยกตัวจากจรวด (Separation Ring)', 'Primary Structure(โครงสร้างหลัก)', 'Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)',
   'Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)', 'Primary Structure(โครงสร้างหลัก)', 'วงแหวนแยกตัวจากจรวด (Separation Ring)',
   '<p>Machined aluminum interface ring for microsatellite bus integration.</p><ol><li>Customer supplies payload envelope</li><li>Company produces mechanical drawing and prototype lot</li></ol>', 'S002', 'published'),
  ('P003', 'F002', 'Radiation-Tolerant RF Front-End Board',
   'Upstream', 'Medium', 'วงจรรวม RF (RFIC) ทนรังสี', 'Optical Sensor Assembly(ชุดเซนเซอร์และเลนส์)', 'Payload System(ระบบภารกิจ)',
   'Payload System(ระบบภารกิจ)', 'Optical Sensor Assembly(ชุดเซนเซอร์และเลนส์)', 'วงจรรวม RF (RFIC) ทนรังสี',
   '<p>RF front-end board for payload electronics where the exact downstream payload is still being confirmed.</p>', 'S002', 'published'),
  ('P004', 'F002', 'OBC Watchdog Timer Module',
   'Upstream', 'Medium', 'ไอซีระบบจับเวลาขัดจังหวะ (Watchdog Timer IC)', 'On-Board Computer (OBC)(ส่วนประมวลผลหลัก)', 'Command & Data Handling (C&DH)(ระบบคอมพิวเตอร์หลัก)',
   'Command & Data Handling (C&DH)(ระบบคอมพิวเตอร์หลัก)', 'On-Board Computer (OBC)(ส่วนประมวลผลหลัก)', 'ไอซีระบบจับเวลาขัดจังหวะ (Watchdog Timer IC)',
   '<p>Small watchdog timing module for on-board computer reliability testing.</p>', 'S002', 'published'),
  ('P005', 'F003', 'S-Band Ground Test Transceiver',
   'Upstream', 'Medium', 'เครื่องรับส่งสัญญาณวิทยุ (S-band หรือ UHF/VHF)', 'Transceiver(ส่วนรับส่งวิทยุสั่งการ)', 'TT&C(ระบบสื่อสารสั่งการ)',
   'TT&C(ระบบสื่อสารสั่งการ)', 'Transceiver(ส่วนรับส่งวิทยุสั่งการ)', 'เครื่องรับส่งสัญญาณวิทยุ (S-band หรือ UHF/VHF)',
   '<p>Ground-side S-band test transceiver used during satellite acceptance and field trials.</p>', 'S002', 'published'),
  ('P006', 'F003', 'Custom RF Rack Assembly',
   'Upstream', 'Medium', 'Unidentified', 'Unidentified', 'TT&C(ระบบสื่อสารสั่งการ)',
   'TT&C(ระบบสื่อสารสั่งการ)', 'Unidentified', 'Unidentified',
   '<p>Customer-specific RF rack. System known, but module/component mapping still needs expert review.</p>', 'S002', 'published');

INSERT INTO technology_capability (
  tech_id, firm_id, core_technology, trl_level, rd_expenditure_mthb,
  rd_personnel, patents_count, patent_field, digitalization_level, source_id,
  review_status
)
VALUES
  ('T001', 'F001', 'Space-grade mechanical design and small-batch precision manufacturing', 6, 12, 8, 1, 'Deployable structures', 3, 'S001', 'published'),
  ('T002', 'F002', 'Radiation-tolerant electronics and RF module qualification', 7, 18, 11, 2, 'RF front-end protection', 4, 'S001', 'published'),
  ('T003', 'F003', 'Ground segment RF integration and operations support', 7, 6, 5, 0, NULL, 3, 'S001', 'published');

INSERT INTO infrastructure_facility (
  facility_id, firm_id, testing_lab, simulation_tools, manufacturing_process,
  software_capability, source_id, review_status
)
VALUES
  ('FA001', 'F001', TRUE, TRUE, 'CNC machining, fit-check jig, vibration-prep workflow', 'CAD/CAM and tolerance stack analysis', 'S001', 'published'),
  ('FA002', 'F002', TRUE, TRUE, 'SMT assembly, RF bench test, thermal cycling access', 'FPGA firmware, RF test automation', 'S001', 'published'),
  ('FA003', 'F003', TRUE, FALSE, 'RF rack wiring, antenna feed integration, field commissioning', 'Ground station monitoring scripts', 'S001', 'published');

INSERT INTO human_resource_profile (
  hr_id, firm_id, technician_count, skill_specialization, training_programs,
  skill_gap, source_id, review_status
)
VALUES
  ('H001', 'F001', 14, 'Mechanical assembly, metrology, harness routing', 'Internal space hardware handling program', 'ECSS documentation and cleanroom process control', 'S001', 'published'),
  ('H002', 'F002', 16, 'RF test, PCB assembly, firmware validation', 'University RF lab joint training', 'Radiation test campaign planning', 'S001', 'published'),
  ('H003', 'F003', 9, 'Antenna alignment, rack wiring, field operations', 'Supplier RF safety certification', 'Satellite operations procedure writing', 'S001', 'published');

INSERT INTO supply_chain_linkage (
  linkage_id, firm_id, partner_firm_id, linkage_type, dependency_level,
  domestic_or_import, source_id, review_status
)
VALUES
  ('L001', 'F001', 'F002', 'Partner', 3, 'Domestic', 'S001', 'published'),
  ('L002', 'F003', 'F002', 'Supplier', 4, 'Domestic', 'S001', 'published');

INSERT INTO collaboration_network (
  collab_id, firm_id, partner_type, partner_name, collaboration_type,
  duration_years, source_id, review_status
)
VALUES
  ('C001', 'F001', 'University', 'King Mongkut Space Systems Lab', 'Testing', 2, 'S001', 'published'),
  ('C002', 'F002', 'PRI', 'Thai Microelectronics Research Center', 'R&D', 3, 'S001', 'published'),
  ('C003', 'F003', 'Association', 'Thailand Ground Segment Working Group', 'Training', 1, 'S001', 'published');

INSERT INTO sustainability_esg (
  esg_id, firm_id, energy_consumption_mwh, renewable_energy_ratio,
  carbon_emission_tco2, waste_management_system, esg_certification, source_id,
  review_status
)
VALUES
  ('E001', 'F001', 260, 20, 92, TRUE, 'ISO 14001 planned', 'S001', 'published'),
  ('E002', 'F002', 310, 35, 104, TRUE, 'ISO 14001', 'S001', 'published');

INSERT INTO audit_log (audit_id, ts, role, action, target_table, target_id, summary)
VALUES
  ('A001', '2026-06-14T08:00:00Z', 'Admin', 'reset', '*', '*', 'Clean three-company seed data loaded for Company + Component review.');

COMMIT;
