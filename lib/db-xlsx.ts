import type { Database } from "./schema";
import { provinceLabel } from "./schema";
import { richTextToPlainText } from "./rich-text";

type Cell = string | number | boolean | null | undefined;
type Sheet = {
  name: string;
  columns: { header: string; width: number }[];
  rows: Cell[][];
};

function safeText(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function cell(value: Cell): string | number {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return safeText(value);
}

function buildSheets(db: Database, nameSource: Database["firms"] = db.firms): Sheet[] {
  const firmName = (id: string) => nameSource.find((f) => f.firm_id === id)?.firm_name ?? id;

  return [
    {
      name: "Companies",
      columns: [
        { header: "Company ID", width: 12 },
        { header: "Company Name", width: 30 },
        { header: "Registration No", width: 18 },
        { header: "Year Established", width: 16 },
        { header: "Ownership", width: 12 },
        { header: "Parent Company", width: 24 },
        { header: "Industry Code", width: 14 },
        { header: "Province", width: 24 },
        { header: "Industrial Zone", width: 22 },
        { header: "Website", width: 28 },
        { header: "Contact Email", width: 28 },
        { header: "Last Updated", width: 22 }
      ],
      rows: db.firms.map((r) => [
        r.firm_id, r.firm_name, r.registration_no, r.year_established, r.ownership_type,
        r.parent_company, r.industry_code, provinceLabel(r.province), r.industrial_zone,
        r.website, r.contact_email, r.last_updated_ts
      ])
    },
    {
      name: "Size & Finance",
      columns: [
        { header: "Company ID", width: 12 },
        { header: "Company Name", width: 30 },
        { header: "Employees Total", width: 15 },
        { header: "Engineers", width: 12 },
        { header: "Annual Revenue (MTHB)", width: 20 },
        { header: "Export %", width: 10 },
        { header: "Production Capacity", width: 26 },
        { header: "Capital Investment (MTHB)", width: 22 },
        { header: "Gov Incentives", width: 26 },
        { header: "Funding Access", width: 26 },
        { header: "Offset Agreement", width: 26 }
      ],
      rows: db.size_finance.map((r) => [
        r.firm_id, firmName(r.firm_id), r.employees_total, r.engineers, r.annual_revenue_mthb,
        r.export_percentage, r.production_capacity, r.capital_investment_mthb,
        r.gov_incentives, r.funding_access, r.offset_agreement
      ])
    },
    {
      name: "Components",
      columns: [
        { header: "Component ID", width: 14 },
        { header: "Company ID", width: 12 },
        { header: "Company Name", width: 30 },
        { header: "Product Name", width: 30 },
        { header: "System", width: 30 },
        { header: "Module", width: 30 },
        { header: "Component", width: 36 },
        { header: "Product TRL", width: 12 },
        { header: "Flight Heritage", width: 28 },
        { header: "Description", width: 48 }
      ],
      rows: db.products.map((r) => [
        r.product_id, r.firm_id, firmName(r.firm_id), r.product_name, r.system, r.module,
        r.component_name, r.product_trl, r.flight_heritage, richTextToPlainText(r.description)
      ])
    },
    {
      name: "Technology",
      columns: [
        { header: "Tech ID", width: 10 },
        { header: "Company ID", width: 12 },
        { header: "Company Name", width: 30 },
        { header: "Core Technology", width: 30 },
        { header: "TRL Level", width: 10 },
        { header: "R&D Expenditure (MTHB)", width: 20 },
        { header: "R&D Personnel", width: 14 },
        { header: "Patents", width: 10 },
        { header: "Patent Field", width: 24 },
        { header: "Digitalization Level", width: 18 }
      ],
      rows: db.tech.map((r) => [
        r.tech_id, r.firm_id, firmName(r.firm_id), r.core_technology, r.trl_level,
        r.rd_expenditure_mthb, r.rd_personnel, r.patents_count, r.patent_field, r.digitalization_level
      ])
    },
    {
      name: "Facilities",
      columns: [
        { header: "Facility ID", width: 12 },
        { header: "Company ID", width: 12 },
        { header: "Company Name", width: 30 },
        { header: "Testing Lab", width: 12 },
        { header: "Simulation Tools", width: 16 },
        { header: "Manufacturing Process", width: 34 },
        { header: "Software Capability", width: 34 }
      ],
      rows: db.facilities.map((r) => [
        r.facility_id, r.firm_id, firmName(r.firm_id), r.testing_lab, r.simulation_tools,
        r.manufacturing_process, r.software_capability
      ])
    },
    {
      name: "HR",
      columns: [
        { header: "HR ID", width: 10 },
        { header: "Company ID", width: 12 },
        { header: "Company Name", width: 30 },
        { header: "Technicians", width: 12 },
        { header: "Skill Specialization", width: 34 },
        { header: "Training Programs", width: 34 },
        { header: "Skill Gap", width: 34 }
      ],
      rows: db.hr.map((r) => [
        r.hr_id, r.firm_id, firmName(r.firm_id), r.technician_count, r.skill_specialization,
        r.training_programs, r.skill_gap
      ])
    },
    {
      name: "Linkages",
      columns: [
        { header: "Linkage ID", width: 12 },
        { header: "Company ID", width: 12 },
        { header: "Company Name", width: 30 },
        { header: "Partner ID", width: 12 },
        { header: "Partner Name", width: 30 },
        { header: "Type", width: 12 },
        { header: "Dependency Level", width: 16 },
        { header: "Domestic / Import", width: 16 }
      ],
      rows: db.linkages.map((r) => [
        r.linkage_id, r.firm_id, firmName(r.firm_id), r.partner_firm_id, firmName(r.partner_firm_id),
        r.linkage_type, r.dependency_level, r.domestic_or_import
      ])
    },
    {
      name: "Collaborations",
      columns: [
        { header: "Collab ID", width: 10 },
        { header: "Company ID", width: 12 },
        { header: "Company Name", width: 30 },
        { header: "Partner Type", width: 14 },
        { header: "Partner Name", width: 32 },
        { header: "Collaboration Type", width: 18 },
        { header: "Duration (years)", width: 14 }
      ],
      rows: db.collabs.map((r) => [
        r.collab_id, r.firm_id, firmName(r.firm_id), r.partner_type, r.partner_name,
        r.collaboration_type, r.duration_years
      ])
    },
    {
      name: "ESG",
      columns: [
        { header: "ESG ID", width: 10 },
        { header: "Company ID", width: 12 },
        { header: "Company Name", width: 30 },
        { header: "Energy (MWh)", width: 14 },
        { header: "Renewable Ratio", width: 15 },
        { header: "Carbon (tCO2)", width: 14 },
        { header: "Waste Management", width: 17 },
        { header: "ESG Certification", width: 26 }
      ],
      rows: db.esg.map((r) => [
        r.esg_id, r.firm_id, firmName(r.firm_id), r.energy_consumption_mwh, r.renewable_energy_ratio,
        r.carbon_emission_tco2, r.waste_management_system, r.esg_certification
      ])
    },
    {
      name: "Sources",
      columns: [
        { header: "Source ID", width: 12 },
        { header: "Name", width: 32 },
        { header: "URL", width: 36 },
        { header: "Owner", width: 24 },
        { header: "Last Synced", width: 22 },
        { header: "Notes", width: 40 }
      ],
      rows: db.sources.map((r) => [r.source_id, r.name, r.url, r.owner, r.last_synced, r.notes])
    },
    {
      name: "Audit Log",
      columns: [
        { header: "Audit ID", width: 10 },
        { header: "Timestamp", width: 22 },
       { header: "Role", width: 10 },
        { header: "Action", width: 10 },
        { header: "Table", width: 14 },
        { header: "Target ID", width: 12 },
        { header: "Company", width: 30 },
        { header: "Summary", width: 50 }
      ],
      rows: db.audit.map((r) => [
        r.audit_id, r.ts, r.role, r.action, r.target_table, r.target_id,
        r.firm_id ? firmName(r.firm_id) : "", r.summary
      ])
    }
  ];
}

/** Same workbook layout as the full export, filtered to one company. */
export async function createFirmXlsx(db: Database, firmId: string) {
  const firm = db.firms.find((f) => f.firm_id === firmId);
  const scoped: Database = {
    ...db,
    firms: db.firms.filter((f) => f.firm_id === firmId),
    size_finance: db.size_finance.filter((r) => r.firm_id === firmId),
    products: db.products.filter((r) => r.firm_id === firmId),
    tech: db.tech.filter((r) => r.firm_id === firmId),
    facilities: db.facilities.filter((r) => r.firm_id === firmId),
    hr: db.hr.filter((r) => r.firm_id === firmId),
    linkages: db.linkages.filter((r) => r.firm_id === firmId || r.partner_firm_id === firmId),
    collabs: db.collabs.filter((r) => r.firm_id === firmId),
    esg: db.esg.filter((r) => r.firm_id === firmId),
    sources: db.sources.filter((s) => s.source_id === firm?.source_id),
    audit: db.audit.filter((a) => a.firm_id === firmId)
  };
  return writeWorkbook(buildSheets(scoped, db.firms));
}

export async function createDatabaseXlsx(db: Database) {
  return writeWorkbook(buildSheets(db));
}

async function writeWorkbook(sheets: Sheet[]) {
  const ExcelJSImport = await import("exceljs");
  const ExcelJS = ExcelJSImport.default ?? ExcelJSImport;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SatDB";
  workbook.created = new Date();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name, {
      views: [{ state: "frozen", ySplit: 1 }]
    });
    worksheet.columns = sheet.columns.map((column, index) => ({
      header: column.header,
      key: `c${index}`,
      width: column.width
    }));
    for (const row of sheet.rows) {
      worksheet.addRow(row.map(cell));
    }
    const lastCol = String.fromCharCode(64 + Math.min(sheet.columns.length, 26));
    worksheet.autoFilter = `A1:${lastCol}${Math.max(1, sheet.rows.length + 1)}`;
    worksheet.getRow(1).eachCell((headerCell) => {
      headerCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF12315F" } };
      headerCell.alignment = { vertical: "middle" };
    });
    worksheet.getRow(1).height = 24;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.alignment = { vertical: "top", wrapText: true };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
