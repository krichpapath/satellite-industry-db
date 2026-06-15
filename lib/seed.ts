import type { Database } from "./schema";
import { DEFAULT_VOCAB } from "./schema";

export const SEED: Database = {
  firms: [
    {
      firm_id: "F001",
      firm_name: "Siam Orbital Components",
      registration_no: "0105567001001",
      year_established: 2020,
      ownership_type: "Local",
      parent_company: "Siam Precision Group",
      industry_code: "ISIC-3030",
      province: "Bangkok",
      industrial_zone: "Thailand Science Park",
      website: "https://siam-orbital.example.th",
      contact_email: "components@siam-orbital.example.th",
      source_id: "S001",
      last_updated_ts: "2026-06-14T08:00:00Z"
    },
    {
      firm_id: "F002",
      firm_name: "Lanna Space Electronics",
      registration_no: "0505567002002",
      year_established: 2018,
      ownership_type: "JV",
      parent_company: "Northern Microelectronics JV",
      industry_code: "ISIC-2651",
      province: "Chiang Mai",
      industrial_zone: "Chiang Mai Software Park",
      website: "https://lanna-space.example.th",
      contact_email: "info@lanna-space.example.th",
      source_id: "S001",
      last_updated_ts: "2026-06-14T08:00:00Z"
    },
    {
      firm_id: "F003",
      firm_name: "Eastern Ground Systems",
      registration_no: "0205567003003",
      year_established: 2022,
      ownership_type: "Local",
      industry_code: "ISIC-6110",
      province: "Chonburi",
      industrial_zone: "Eastern Economic Corridor",
      website: "https://eastern-ground.example.th",
      contact_email: "ops@eastern-ground.example.th",
      source_id: "S001",
      last_updated_ts: "2026-06-14T08:00:00Z"
    }
  ],
  size_finance: [
    {
      firm_id: "F001",
      employees_total: 62,
      engineers: 34,
      annual_revenue_mthb: 86,
      export_percentage: 18,
      production_capacity: "Prototype-to-small-batch satellite mechanical and harness assemblies",
      capital_investment_mthb: 145,
      gov_incentives: "BOI machinery import duty exemption",
      funding_access: "NSTDA engineering grant"
    },
    {
      firm_id: "F002",
      employees_total: 48,
      engineers: 29,
      annual_revenue_mthb: 72,
      export_percentage: 42,
      production_capacity: "1,200 radiation-tolerant electronic modules/year",
      capital_investment_mthb: 118,
      gov_incentives: "EECi electronics prototype support",
      funding_access: "University co-development fund"
    },
    {
      firm_id: "F003",
      employees_total: 35,
      engineers: 18,
      annual_revenue_mthb: 41,
      export_percentage: 8,
      production_capacity: "Ground segment racks, RF integration, and field service teams",
      capital_investment_mthb: 64,
      funding_access: "Commercial bank credit line"
    }
  ],
  products: [
    {
      product_id: "P001",
      firm_id: "F001",
      product_name: "Deployable Solar Panel Hinge Set",
      system: "Electrical Power System (EPS)(ระบบพลังงานไฟฟ้า)",
      module: "Power Generation(ส่วนผลิตกระแสไฟ)",
      component_name: "สปริงบิดกางแผง (Torsion Springs): สร้างแรงดีดกางแผงบานพับ",
      description: "<p>Mechanical hinge and spring set for small satellite deployable solar panels.</p><ul><li>Designed for repeatable deployment tests</li><li>Supplied with inspection report and traceable material lot</li></ul>"
    },
    {
      product_id: "P002",
      firm_id: "F001",
      product_name: "Primary Structure Interface Ring",
      system: "Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)",
      module: "Primary Structure(โครงสร้างหลัก)",
      component_name: "วงแหวนแยกตัวจากจรวด (Separation Ring)",
      description: "<p>Machined aluminum interface ring for microsatellite bus integration.</p><ol><li>Customer supplies payload envelope</li><li>Company produces mechanical drawing and prototype lot</li></ol>"
    },
    {
      product_id: "P003",
      firm_id: "F002",
      product_name: "Radiation-Tolerant RF Front-End Board",
      system: "Payload System(ระบบภารกิจ)",
      module: "Optical Sensor Assembly(ชุดเซนเซอร์และเลนส์)",
      component_name: "วงจรรวม RF (RFIC) ทนรังสี",
      description: "<p>RF front-end board for payload electronics where the exact downstream payload is still being confirmed.</p>"
    },
    {
      product_id: "P004",
      firm_id: "F002",
      product_name: "OBC Watchdog Timer Module",
      system: "Command & Data Handling (C&DH)(ระบบคอมพิวเตอร์หลัก)",
      module: "On-Board Computer (OBC)(ส่วนประมวลผลหลัก)",
      component_name: "ไอซีระบบจับเวลาขัดจังหวะ (Watchdog Timer IC)",
      description: "<p>Small watchdog timing module for on-board computer reliability testing.</p>"
    },
    {
      product_id: "P005",
      firm_id: "F003",
      product_name: "S-Band Ground Test Transceiver",
      system: "TT&C(ระบบสื่อสารสั่งการ)",
      module: "Transceiver(ส่วนรับส่งวิทยุสั่งการ)",
      component_name: "เครื่องรับส่งสัญญาณวิทยุ (S-band หรือ UHF/VHF)",
      description: "<p>Ground-side S-band test transceiver used during satellite acceptance and field trials.</p>"
    },
    {
      product_id: "P006",
      firm_id: "F003",
      product_name: "Custom RF Rack Assembly",
      system: "TT&C(ระบบสื่อสารสั่งการ)",
      module: "Unidentified",
      component_name: "Unidentified",
      description: "<p>Customer-specific RF rack. System known, but module/component mapping still needs expert review.</p>"
    }
  ],
  tech: [
    {
      tech_id: "T001",
      firm_id: "F001",
      core_technology: "Space-grade mechanical design and small-batch precision manufacturing",
      trl_level: 6,
      rd_expenditure_mthb: 12,
      rd_personnel: 8,
      patents_count: 1,
      patent_field: "Deployable structures",
      digitalization_level: 3
    },
    {
      tech_id: "T002",
      firm_id: "F002",
      core_technology: "Radiation-tolerant electronics and RF module qualification",
      trl_level: 7,
      rd_expenditure_mthb: 18,
      rd_personnel: 11,
      patents_count: 2,
      patent_field: "RF front-end protection",
      digitalization_level: 4
    },
    {
      tech_id: "T003",
      firm_id: "F003",
      core_technology: "Ground segment RF integration and operations support",
      trl_level: 7,
      rd_expenditure_mthb: 6,
      rd_personnel: 5,
      patents_count: 0,
      digitalization_level: 3
    }
  ],
  facilities: [
    {
      facility_id: "FA001",
      firm_id: "F001",
      testing_lab: true,
      simulation_tools: true,
      manufacturing_process: "CNC machining, fit-check jig, vibration-prep workflow",
      software_capability: "CAD/CAM and tolerance stack analysis"
    },
    {
      facility_id: "FA002",
      firm_id: "F002",
      testing_lab: true,
      simulation_tools: true,
      manufacturing_process: "SMT assembly, RF bench test, thermal cycling access",
      software_capability: "FPGA firmware, RF test automation"
    },
    {
      facility_id: "FA003",
      firm_id: "F003",
      testing_lab: true,
      simulation_tools: false,
      manufacturing_process: "RF rack wiring, antenna feed integration, field commissioning",
      software_capability: "Ground station monitoring scripts"
    }
  ],
  hr: [
    {
      hr_id: "H001",
      firm_id: "F001",
      technician_count: 14,
      skill_specialization: "Mechanical assembly, metrology, harness routing",
      training_programs: "Internal space hardware handling program",
      skill_gap: "ECSS documentation and cleanroom process control"
    },
    {
      hr_id: "H002",
      firm_id: "F002",
      technician_count: 16,
      skill_specialization: "RF test, PCB assembly, firmware validation",
      training_programs: "University RF lab joint training",
      skill_gap: "Radiation test campaign planning"
    },
    {
      hr_id: "H003",
      firm_id: "F003",
      technician_count: 9,
      skill_specialization: "Antenna alignment, rack wiring, field operations",
      training_programs: "Supplier RF safety certification",
      skill_gap: "Satellite operations procedure writing"
    }
  ],
  linkages: [
    {
      linkage_id: "L001",
      firm_id: "F001",
      partner_firm_id: "F002",
      linkage_type: "Partner",
      dependency_level: 3,
      domestic_or_import: "Domestic"
    },
    {
      linkage_id: "L002",
      firm_id: "F003",
      partner_firm_id: "F002",
      linkage_type: "Supplier",
      dependency_level: 4,
      domestic_or_import: "Domestic"
    }
  ],
  collabs: [
    {
      collab_id: "C001",
      firm_id: "F001",
      partner_type: "University",
      partner_name: "King Mongkut Space Systems Lab",
      collaboration_type: "Testing",
      duration_years: 2
    },
    {
      collab_id: "C002",
      firm_id: "F002",
      partner_type: "PRI",
      partner_name: "Thai Microelectronics Research Center",
      collaboration_type: "R&D",
      duration_years: 3
    },
    {
      collab_id: "C003",
      firm_id: "F003",
      partner_type: "Association",
      partner_name: "Thailand Ground Segment Working Group",
      collaboration_type: "Training",
      duration_years: 1
    }
  ],
  esg: [
    {
      esg_id: "E001",
      firm_id: "F001",
      energy_consumption_mwh: 260,
      renewable_energy_ratio: 20,
      carbon_emission_tco2: 92,
      waste_management_system: true,
      esg_certification: "ISO 14001 planned"
    },
    {
      esg_id: "E002",
      firm_id: "F002",
      energy_consumption_mwh: 310,
      renewable_energy_ratio: 35,
      carbon_emission_tco2: 104,
      waste_management_system: true,
      esg_certification: "ISO 14001"
    }
  ],
  sources: [
    {
      source_id: "S001",
      name: "Prototype reviewer seed data",
      owner: "Project team",
      last_synced: "2026-06-14",
      notes: "Small clean dataset aligned with Company + Component UI."
    },
    {
      source_id: "S002",
      name: "Satellite component expert taxonomy workbook",
      owner: "Satellite domain expert",
      last_synced: "2026-06-14",
      notes: "System, Module, Component choices from the reviewed workbook."
    }
  ],
  audit: [
    {
      audit_id: "A001",
      ts: "2026-06-14T08:00:00Z",
      role: "Admin",
      action: "reset",
      target_table: "*",
      target_id: "*",
      summary: "Clean three-company seed data loaded for Company + Component review."
    }
  ],
  vocab: DEFAULT_VOCAB
};
