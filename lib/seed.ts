import type { Database } from "./schema";
import { DEFAULT_VOCAB } from "./schema";

export const SEED: Database = {
  firms: [
    {
      firm_id: "F001",
      firm_name: "AstroLink Aerospace",
      registration_no: "0105561000011",
      year_established: 2014,
      ownership_type: "Local",
      industry_code: "ISIC-3030",
      province: "Bangkok",
      industrial_zone: "Bangchak Innovation Cluster",
      website: "https://astrolink.example.th",
      contact_email: "info@astrolink.example.th"
    },
    {
      firm_id: "F002",
      firm_name: "OrbitForge Industries",
      registration_no: "0205562000022",
      year_established: 2016,
      ownership_type: "JV",
      parent_company: "OrbitForge Holdings (SG)",
      industry_code: "ISIC-2651",
      province: "Chonburi",
      industrial_zone: "Eastern Economic Corridor",
      website: "https://orbitforge.example.th",
      contact_email: "contact@orbitforge.example.th"
    },
    {
      firm_id: "F003",
      firm_name: "SkyBridge Launch Services",
      registration_no: "0305560000033",
      year_established: 2018,
      ownership_type: "Local",
      industry_code: "ISIC-5120",
      province: "Rayong",
      industrial_zone: "Map Ta Phut",
      website: "https://skybridge.example.th"
    },
    {
      firm_id: "F004",
      firm_name: "GroundLink Networks",
      registration_no: "0405559000044",
      year_established: 2012,
      ownership_type: "Local",
      industry_code: "ISIC-6110",
      province: "Bangkok",
      industrial_zone: "True Digital Park",
      website: "https://groundlink.example.th"
    },
    {
      firm_id: "F005",
      firm_name: "ThaiSat Telecom",
      registration_no: "0505558000055",
      year_established: 2009,
      ownership_type: "Local",
      industry_code: "ISIC-6130",
      province: "Bangkok",
      website: "https://thaisat.example.th"
    },
    {
      firm_id: "F006",
      firm_name: "EarthEye Analytics",
      registration_no: "0605563000066",
      year_established: 2019,
      ownership_type: "Foreign",
      parent_company: "EarthEye Global Ltd. (UK)",
      industry_code: "ISIC-6201",
      province: "Chiang Mai",
      industrial_zone: "Chiang Mai Software Park",
      website: "https://eartheye.example.th"
    },
    {
      firm_id: "F007",
      firm_name: "NaviPath Systems",
      registration_no: "0705562000077",
      year_established: 2015,
      ownership_type: "Local",
      industry_code: "ISIC-2620",
      province: "Bangkok",
      website: "https://navipath.example.th"
    },
    {
      firm_id: "F008",
      firm_name: "ClearSky Imaging",
      registration_no: "0805564000088",
      year_established: 2020,
      ownership_type: "JV",
      parent_company: "ClearSky Geomatics (JP)",
      industry_code: "ISIC-7490",
      province: "Khon Kaen",
      industrial_zone: "Khon Kaen Smart City Hub",
      website: "https://clearsky.example.th"
    },
    {
      firm_id: "F009",
      firm_name: "Stratos Propulsion",
      registration_no: "0905561000099",
      year_established: 2017,
      ownership_type: "Local",
      industry_code: "ISIC-3030",
      province: "Pathum Thani",
      industrial_zone: "Thailand Science Park",
      website: "https://stratos.example.th"
    },
    {
      firm_id: "F010",
      firm_name: "PolarCom IoT Networks",
      registration_no: "1005563000100",
      year_established: 2021,
      ownership_type: "Foreign",
      parent_company: "PolarCom AB (SE)",
      industry_code: "ISIC-6190",
      province: "Bangkok",
      website: "https://polarcom.example.th"
    }
  ],
  size_finance: [
    { firm_id: "F001", employees_total: 180, engineers: 95, annual_revenue_mthb: 420, export_percentage: 35, production_capacity: "2 satellites/year", capital_investment_mthb: 850 },
    { firm_id: "F002", employees_total: 240, engineers: 110, annual_revenue_mthb: 680, export_percentage: 60, production_capacity: "5000 components/month", capital_investment_mthb: 1200 },
    { firm_id: "F003", employees_total: 75, engineers: 40, annual_revenue_mthb: 310, export_percentage: 20, production_capacity: "4 launches/year", capital_investment_mthb: 2400 },
    { firm_id: "F004", employees_total: 130, engineers: 70, annual_revenue_mthb: 290, export_percentage: 15, production_capacity: "12 ground stations", capital_investment_mthb: 540 },
    { firm_id: "F005", employees_total: 420, engineers: 160, annual_revenue_mthb: 3200, export_percentage: 45, production_capacity: "3 GEO satellites operated", capital_investment_mthb: 5800 },
    { firm_id: "F006", employees_total: 60, engineers: 45, annual_revenue_mthb: 95, export_percentage: 70, production_capacity: "Cloud analytics platform", capital_investment_mthb: 120 },
    { firm_id: "F007", employees_total: 95, engineers: 55, annual_revenue_mthb: 180, export_percentage: 25, production_capacity: "GNSS receivers 8k/yr", capital_investment_mthb: 230 },
    { firm_id: "F008", employees_total: 38, engineers: 22, annual_revenue_mthb: 55, export_percentage: 30, production_capacity: "Agri imagery service", capital_investment_mthb: 80 },
    { firm_id: "F009", employees_total: 52, engineers: 38, annual_revenue_mthb: 70, export_percentage: 10, production_capacity: "Propulsion prototypes", capital_investment_mthb: 320 },
    { firm_id: "F010", employees_total: 110, engineers: 65, annual_revenue_mthb: 240, export_percentage: 55, production_capacity: "IoT terminals 50k/yr", capital_investment_mthb: 410 }
  ],
  products: [
    { product_id: "P001", firm_id: "F001", component_name: "• กล้องถ่ายภาพความละเอียดสูง (Optical Telescope)", system: "1. Payload System(ระบบภารกิจ)", module: "Optical Sensor Assembly(ชุดเซนเซอร์และเลนส์)", description: "High-resolution optical payload component for Earth observation." },
    { product_id: "P002", firm_id: "F002", component_name: "• วงจรรวม RF (RFIC) ทนรังสี", system: "1. Payload System(ระบบภารกิจ)", module: "Optical Sensor Assembly(ชุดเซนเซอร์และเลนส์)", description: "Radiation-tolerant RFIC component used in satellite payload electronics." },
    { product_id: "P003", firm_id: "F003", component_name: "• หัวฉีด (Thruster Nozzle) โลหะทนความร้อนสูง", system: "7. Propulsion System(ระบบขับเคลื่อน)", module: "Thruster Assembly(ชุดหัวฉีดขับดัน)", description: "High-temperature thruster nozzle for propulsion assemblies." },
    { product_id: "P004", firm_id: "F004", component_name: "• เครื่องรับส่งสัญญาณวิทยุ (S-band หรือ UHF/VHF)", system: "5. TT&C(ระบบสื่อสารสั่งการ)", module: "Transceiver(ส่วนรับส่งวิทยุสั่งการ)", description: "Radio transceiver component for telemetry, tracking, and command." },
    { product_id: "P005", firm_id: "F005", component_name: "• เครื่องส่งสัญญาณย่าน X-band (X-band Transmitter), Ka-band, Ku-band", system: "1. Payload System(ระบบภารกิจ)", module: "High-Speed Downlink(ส่วนส่งข้อมูลความเร็วสูง)", description: "High-speed downlink transmitter component for mission data return." },
    { product_id: "P006", firm_id: "F006", component_name: "• ชิปประมวลผล FPGA/GPU เฉพาะทาง", system: "1. Payload System(ระบบภารกิจ)", module: "Payload Data Processing(ส่วนประมวลผลข้อมูลภารกิจ)", description: "Specialized processing chip for payload data handling." },
    { product_id: "P007", firm_id: "F007", component_name: "• เซนเซอร์วัดสนามแม่เหล็ก (3-Axis Magnetometer)", system: "3. ADCS(ระบบควบคุมทิศทาง)", module: "Attitude Sensors(ส่วนเซนเซอร์วัดทิศทาง)", description: "Three-axis magnetometer for attitude sensing." },
    { product_id: "P008", firm_id: "F008", component_name: "• เซนเซอร์รับภาพ CMOS/CCD", system: "1. Payload System(ระบบภารกิจ)", module: "Optical Sensor Assembly(ชุดเซนเซอร์และเลนส์)", description: "Image sensor component for optical payloads." },
    { product_id: "P009", firm_id: "F009", component_name: "• วาล์วควบคุมแรงดัน (Pressure Control Valves)", system: "7. Propulsion System(ระบบขับเคลื่อน)", module: "Propellant Management(ส่วนจัดการสารขับดัน)", description: "Pressure control valve for propellant management." },
    { product_id: "P010", firm_id: "F010", component_name: "• สายอากาศรอบทิศทาง (Omnidirectional Antennas)", system: "5. TT&C(ระบบสื่อสารสั่งการ)", module: "Antenna System(ส่วนสายอากาศสั่งการ)", description: "Omnidirectional antenna component for command links." }
  ],
  tech: [
    { tech_id: "T001", firm_id: "F001", core_technology: "Satellite bus integration", trl_level: 7, rd_expenditure_mthb: 75, rd_personnel: 28, patents_count: 6, digitalization_level: 4 },
    { tech_id: "T002", firm_id: "F002", core_technology: "RF / microwave components", trl_level: 8, rd_expenditure_mthb: 120, rd_personnel: 35, patents_count: 14, digitalization_level: 5 },
    { tech_id: "T003", firm_id: "F003", core_technology: "Launch vehicle propulsion", trl_level: 5, rd_expenditure_mthb: 95, rd_personnel: 22, patents_count: 3, digitalization_level: 3 },
    { tech_id: "T004", firm_id: "F004", core_technology: "Tracking, telemetry & command", trl_level: 8, rd_expenditure_mthb: 40, rd_personnel: 18, patents_count: 2, digitalization_level: 4 },
    { tech_id: "T005", firm_id: "F005", core_technology: "GEO satcom payload ops", trl_level: 9, rd_expenditure_mthb: 250, rd_personnel: 55, patents_count: 9, digitalization_level: 5 },
    { tech_id: "T006", firm_id: "F006", core_technology: "EO image AI/ML analytics", trl_level: 8, rd_expenditure_mthb: 35, rd_personnel: 30, patents_count: 4, digitalization_level: 5 },
    { tech_id: "T007", firm_id: "F007", core_technology: "GNSS signal processing", trl_level: 8, rd_expenditure_mthb: 28, rd_personnel: 20, patents_count: 5, digitalization_level: 4 },
    { tech_id: "T008", firm_id: "F008", core_technology: "Multispectral image processing", trl_level: 7, rd_expenditure_mthb: 12, rd_personnel: 10, patents_count: 1, digitalization_level: 4 },
    { tech_id: "T009", firm_id: "F009", core_technology: "Hybrid rocket propulsion", trl_level: 4, rd_expenditure_mthb: 45, rd_personnel: 24, patents_count: 2, digitalization_level: 3 },
    { tech_id: "T010", firm_id: "F010", core_technology: "LEO IoT NB-IoT over satellite", trl_level: 7, rd_expenditure_mthb: 60, rd_personnel: 32, patents_count: 7, digitalization_level: 5 }
  ],
  facilities: [
    { facility_id: "FA001", firm_id: "F001", testing_lab: true, simulation_tools: true, manufacturing_process: "Cleanroom ISO 8 assembly", software_capability: "Embedded flight software" },
    { facility_id: "FA002", firm_id: "F002", testing_lab: true, simulation_tools: true, manufacturing_process: "SMT, RF testing chamber", software_capability: "FPGA / DSP firmware" },
    { facility_id: "FA003", firm_id: "F003", testing_lab: true, simulation_tools: true, manufacturing_process: "Engine static test stand", software_capability: "Trajectory simulation" },
    { facility_id: "FA004", firm_id: "F004", testing_lab: false, simulation_tools: true, manufacturing_process: "Antenna integration", software_capability: "TT&C control systems" },
    { facility_id: "FA005", firm_id: "F005", testing_lab: true, simulation_tools: true, manufacturing_process: "Satellite Operations Center", software_capability: "NMS, traffic engineering" },
    { facility_id: "FA006", firm_id: "F006", testing_lab: false, simulation_tools: true, manufacturing_process: "Cloud data center co-loc", software_capability: "AI/ML pipeline, GIS" },
    { facility_id: "FA007", firm_id: "F007", testing_lab: true, simulation_tools: true, manufacturing_process: "PCB assembly, RF test", software_capability: "GNSS firmware, embedded" },
    { facility_id: "FA008", firm_id: "F008", testing_lab: false, simulation_tools: true, manufacturing_process: "Image processing rigs", software_capability: "Spectral analytics SaaS" },
    { facility_id: "FA009", firm_id: "F009", testing_lab: true, simulation_tools: true, manufacturing_process: "Propellant lab, test bunker", software_capability: "CFD, combustion modeling" },
    { facility_id: "FA010", firm_id: "F010", testing_lab: true, simulation_tools: true, manufacturing_process: "Terminal assembly", software_capability: "Modem firmware, MAC layer" }
  ],
  hr: [
    { hr_id: "H001", firm_id: "F001", technician_count: 55, skill_specialization: "AIT, structural design", training_programs: "ESA partnership program", skill_gap: "Senior systems engineers" },
    { hr_id: "H002", firm_id: "F002", technician_count: 80, skill_specialization: "RF design, microelectronics", training_programs: "IMEC short course", skill_gap: "RFIC designers" },
    { hr_id: "H003", firm_id: "F003", technician_count: 25, skill_specialization: "Propulsion, GNC", training_programs: "JAXA exchange", skill_gap: "Avionics specialists" },
    { hr_id: "H004", firm_id: "F004", technician_count: 45, skill_specialization: "Antenna, networking", training_programs: "ITU training", skill_gap: "Cybersecurity for space links" },
    { hr_id: "H005", firm_id: "F005", technician_count: 180, skill_specialization: "Satcom ops, regulatory", training_programs: "Internal academy", skill_gap: "5G NTN integration" },
    { hr_id: "H006", firm_id: "F006", technician_count: 12, skill_specialization: "ML engineers, geospatial", training_programs: "Coursera/AWS", skill_gap: "Domain experts in agri" },
    { hr_id: "H007", firm_id: "F007", technician_count: 35, skill_specialization: "GNSS, embedded SW", training_programs: "GPS world workshop", skill_gap: "Multi-frequency RTK experts" },
    { hr_id: "H008", firm_id: "F008", technician_count: 14, skill_specialization: "Remote sensing analysts", training_programs: "GISTDA training", skill_gap: "Agronomists" },
    { hr_id: "H009", firm_id: "F009", technician_count: 18, skill_specialization: "Combustion, materials", training_programs: "Tohoku Univ. internship", skill_gap: "Test engineers" },
    { hr_id: "H010", firm_id: "F010", technician_count: 40, skill_specialization: "IoT, modem firmware", training_programs: "3GPP working groups", skill_gap: "NTN protocol experts" }
  ],
  linkages: [
    { linkage_id: "L001", firm_id: "F001", partner_firm_id: "F002", linkage_type: "Supplier", dependency_level: 4, domestic_or_import: "Domestic" },
    { linkage_id: "L002", firm_id: "F001", partner_firm_id: "F009", linkage_type: "Supplier", dependency_level: 3, domestic_or_import: "Domestic" },
    { linkage_id: "L003", firm_id: "F001", partner_firm_id: "F003", linkage_type: "Buyer", dependency_level: 5, domestic_or_import: "Domestic" },
    { linkage_id: "L004", firm_id: "F003", partner_firm_id: "F004", linkage_type: "Partner", dependency_level: 4, domestic_or_import: "Domestic" },
    { linkage_id: "L005", firm_id: "F004", partner_firm_id: "F005", linkage_type: "Buyer", dependency_level: 5, domestic_or_import: "Domestic" },
    { linkage_id: "L006", firm_id: "F004", partner_firm_id: "F006", linkage_type: "Buyer", dependency_level: 3, domestic_or_import: "Domestic" },
    { linkage_id: "L007", firm_id: "F005", partner_firm_id: "F007", linkage_type: "Partner", dependency_level: 2, domestic_or_import: "Domestic" },
    { linkage_id: "L008", firm_id: "F006", partner_firm_id: "F008", linkage_type: "Partner", dependency_level: 4, domestic_or_import: "Domestic" },
    { linkage_id: "L009", firm_id: "F010", partner_firm_id: "F004", linkage_type: "Buyer", dependency_level: 4, domestic_or_import: "Domestic" },
    { linkage_id: "L010", firm_id: "F010", partner_firm_id: "F002", linkage_type: "Supplier", dependency_level: 5, domestic_or_import: "Domestic" },
    { linkage_id: "L011", firm_id: "F002", partner_firm_id: "F001", linkage_type: "Buyer", dependency_level: 3, domestic_or_import: "Domestic" },
    { linkage_id: "L012", firm_id: "F007", partner_firm_id: "F002", linkage_type: "Supplier", dependency_level: 2, domestic_or_import: "Import" }
  ],
  collabs: [
    { collab_id: "C001", firm_id: "F001", partner_type: "University", partner_name: "Bangkok Aerospace University", collaboration_type: "R&D", duration_years: 4 },
    { collab_id: "C002", firm_id: "F001", partner_type: "PRI", partner_name: "Thai Space Tech Institute", collaboration_type: "Testing", duration_years: 3 },
    { collab_id: "C003", firm_id: "F002", partner_type: "University", partner_name: "Chonburi Institute of Technology", collaboration_type: "R&D", duration_years: 5 },
    { collab_id: "C004", firm_id: "F003", partner_type: "PRI", partner_name: "Thai Space Tech Institute", collaboration_type: "R&D", duration_years: 2 },
    { collab_id: "C005", firm_id: "F004", partner_type: "Association", partner_name: "Thailand Satcom Operators Association", collaboration_type: "Training", duration_years: 6 },
    { collab_id: "C006", firm_id: "F005", partner_type: "University", partner_name: "Bangkok Aerospace University", collaboration_type: "Training", duration_years: 8 },
    { collab_id: "C007", firm_id: "F006", partner_type: "University", partner_name: "Chiang Mai Geoinformatics School", collaboration_type: "R&D", duration_years: 3 },
    { collab_id: "C008", firm_id: "F007", partner_type: "PRI", partner_name: "National Electronics Lab", collaboration_type: "R&D", duration_years: 4 },
    { collab_id: "C009", firm_id: "F008", partner_type: "University", partner_name: "Khon Kaen Agritech University", collaboration_type: "R&D", duration_years: 2 },
    { collab_id: "C010", firm_id: "F009", partner_type: "PRI", partner_name: "Thai Space Tech Institute", collaboration_type: "R&D", duration_years: 5 },
    { collab_id: "C011", firm_id: "F010", partner_type: "Association", partner_name: "ASEAN IoT Alliance", collaboration_type: "Training", duration_years: 2 }
  ],
  esg: [
    { esg_id: "E001", firm_id: "F001", energy_consumption_mwh: 1800, renewable_energy_ratio: 35, carbon_emission_tco2: 720, waste_management_system: true, esg_certification: "ISO 14001" },
    { esg_id: "E002", firm_id: "F002", energy_consumption_mwh: 3200, renewable_energy_ratio: 22, carbon_emission_tco2: 1380, waste_management_system: true, esg_certification: "ISO 14001, ISO 50001" },
    { esg_id: "E003", firm_id: "F003", energy_consumption_mwh: 950, renewable_energy_ratio: 18, carbon_emission_tco2: 540, waste_management_system: true },
    { esg_id: "E004", firm_id: "F004", energy_consumption_mwh: 1200, renewable_energy_ratio: 60, carbon_emission_tco2: 320, waste_management_system: true, esg_certification: "ISO 14001" },
    { esg_id: "E005", firm_id: "F005", energy_consumption_mwh: 5400, renewable_energy_ratio: 40, carbon_emission_tco2: 2100, waste_management_system: true, esg_certification: "ISO 14001, ESG-A" },
    { esg_id: "E006", firm_id: "F006", energy_consumption_mwh: 280, renewable_energy_ratio: 75, carbon_emission_tco2: 60, waste_management_system: true, esg_certification: "ESG-A" },
    { esg_id: "E007", firm_id: "F007", energy_consumption_mwh: 640, renewable_energy_ratio: 25, carbon_emission_tco2: 280, waste_management_system: true },
    { esg_id: "E008", firm_id: "F008", energy_consumption_mwh: 110, renewable_energy_ratio: 50, carbon_emission_tco2: 35, waste_management_system: false },
    { esg_id: "E009", firm_id: "F009", energy_consumption_mwh: 720, renewable_energy_ratio: 20, carbon_emission_tco2: 410, waste_management_system: true },
    { esg_id: "E010", firm_id: "F010", energy_consumption_mwh: 480, renewable_energy_ratio: 55, carbon_emission_tco2: 180, waste_management_system: true, esg_certification: "ISO 14001" }
  ],
  sources: [
    { source_id: "S001", name: "Department of Business Development (DBD)", url: "https://datawarehouse.dbd.go.th", owner: "DBD", last_synced: "2025-09-30", notes: "Company registration master" },
    { source_id: "S002", name: "GISTDA Industrial Survey 2024", url: "https://gistda.or.th", owner: "GISTDA", last_synced: "2025-06-15", notes: "Firm-level capability survey" },
    { source_id: "S003", name: "NSTDA Patent Registry", url: "https://patentsearch.nstda.or.th", owner: "NSTDA", last_synced: "2025-08-01", notes: "Patents & R&D personnel" },
    { source_id: "S004", name: "BOI Investment Records", url: "https://www.boi.go.th", owner: "BOI", last_synced: "2025-07-20", notes: "Incentives & CAPEX" }
  ],
  audit: [
    {
      audit_id: "A001",
      ts: "2025-09-30T08:00:00Z",
      role: "Admin",
      action: "import",
      target_table: "firms",
      target_id: "*",
      summary: "Initial seed of 10 firms imported from DBD"
    }
  ],
  vocab: DEFAULT_VOCAB
};

export function patchFirmsWithProvenance() {
  for (const f of SEED.firms) {
    if (!f.source_id) f.source_id = "S001";
    if (!f.last_updated_ts) f.last_updated_ts = "2025-09-30T08:00:00Z";
  }
  SEED.size_finance.forEach((r, i) => {
    if (i === 0) { r.gov_incentives = "BOI 8-year tax holiday"; r.funding_access = "NIA SME grant"; }
    if (i === 4) { r.gov_incentives = "BOI A1"; r.funding_access = "Public listing (SET)"; r.offset_agreement = "Defense offset 2022"; }
  });
  SEED.tech.forEach((t, i) => {
    if (i === 1) t.patent_field = "RF, microwave, antenna arrays";
    if (i === 4) t.patent_field = "Satcom modulation, payload control";
    if (i === 9) t.patent_field = "NB-IoT NTN, low-power modem";
  });

}

patchFirmsWithProvenance();
