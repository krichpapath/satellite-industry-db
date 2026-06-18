import {
  COMPONENT_SYSTEMS,
  allComponentNames,
  modulesForSystem
} from "./component-taxonomy";

export type OwnershipType = "Local" | "Foreign" | "JV";
export type LinkageType = "Supplier" | "Buyer" | "Partner";
export type PartnerType = "University" | "PRI" | "Association";
export type CollabType = "R&D" | "Training" | "Testing";
export type Role = "Public" | "Analyst" | "Admin";

export interface Firm {
  firm_id: string;
  firm_name: string;
  registration_no: string;
  year_established: number;
  ownership_type: OwnershipType;
  parent_company?: string;
  industry_code: string;
  province: string;
  industrial_zone?: string;
  website?: string;
  contact_email?: string;
  source_id?: string;
  last_updated_ts?: string;
}

export interface FirmSizeFinance {
  firm_id: string;
  employees_total: number;
  engineers: number;
  annual_revenue_mthb: number;
  export_percentage: number;
  production_capacity?: string;
  capital_investment_mthb: number;
  gov_incentives?: string;
  funding_access?: string;
  offset_agreement?: string;
}

export interface ProductService {
  product_id: string;
  firm_id: string;
  product_name: string;
  component_name: string;
  system: string;
  module: string;
  product_trl?: number | "Unidentified";
  flight_heritage?: string;
  description?: string;
}

export interface TechCapability {
  tech_id: string;
  firm_id: string;
  core_technology: string;
  trl_level: number;
  rd_expenditure_mthb: number;
  rd_personnel: number;
  patents_count: number;
  patent_field?: string;
  digitalization_level: number;
}

export interface InfrastructureFacility {
  facility_id: string;
  firm_id: string;
  testing_lab: boolean;
  simulation_tools: boolean;
  manufacturing_process?: string;
  software_capability?: string;
}

export interface HRProfile {
  hr_id: string;
  firm_id: string;
  technician_count: number;
  skill_specialization: string;
  training_programs?: string;
  skill_gap?: string;
}

export interface SupplyChainLinkage {
  linkage_id: string;
  firm_id: string;
  partner_firm_id: string;
  linkage_type: LinkageType;
  dependency_level: number;
  domestic_or_import: "Domestic" | "Import";
}

export interface Collaboration {
  collab_id: string;
  firm_id: string;
  partner_type: PartnerType;
  partner_name: string;
  collaboration_type: CollabType;
  duration_years: number;
}

export interface SustainabilityESG {
  esg_id: string;
  firm_id: string;
  energy_consumption_mwh: number;
  renewable_energy_ratio: number;
  carbon_emission_tco2: number;
  waste_management_system: boolean;
  esg_certification?: string;
}

export interface DataSource {
  source_id: string;
  name: string;
  url?: string;
  owner?: string;
  last_synced?: string;
  notes?: string;
}

export interface AuditEntry {
  audit_id: string;
  ts: string;
  role: Role;
  action: "create" | "update" | "delete" | "import" | "reset" | "wipe";
  target_table: string;
  target_id: string;
  summary: string;
}

export interface Vocab {
  ownership_types: string[];
  linkage_types: string[];
  partner_types: string[];
  collab_types: string[];
  provinces: string[];
  industry_codes: string[];
  core_technologies: string[];
  component_systems: string[];
  component_modules: string[];
  component_names: string[];
}

export interface Database {
  firms: Firm[];
  size_finance: FirmSizeFinance[];
  products: ProductService[];
  tech: TechCapability[];
  facilities: InfrastructureFacility[];
  hr: HRProfile[];
  linkages: SupplyChainLinkage[];
  collabs: Collaboration[];
  esg: SustainabilityESG[];
  sources: DataSource[];
  audit: AuditEntry[];
  vocab: Vocab;
}

export const OWNERSHIP_TYPES: OwnershipType[] = ["Local", "Foreign", "JV"];
export const LINKAGE_TYPES: LinkageType[] = ["Supplier", "Buyer", "Partner"];
export const PARTNER_TYPES: PartnerType[] = ["University", "PRI", "Association"];
export const COLLAB_TYPES: CollabType[] = ["R&D", "Training", "Testing"];
export const ROLES: Role[] = ["Public", "Analyst", "Admin"];
export const THAILAND_PROVINCES = [
  ["Amnat Charoen", "อำนาจเจริญ"],
  ["Ang Thong", "อ่างทอง"],
  ["Bangkok", "กรุงเทพมหานคร"],
  ["Bueng Kan", "บึงกาฬ"],
  ["Buri Ram", "บุรีรัมย์"],
  ["Chachoengsao", "ฉะเชิงเทรา"],
  ["Chai Nat", "ชัยนาท"],
  ["Chaiyaphum", "ชัยภูมิ"],
  ["Chanthaburi", "จันทบุรี"],
  ["Chiang Mai", "เชียงใหม่"],
  ["Chiang Rai", "เชียงราย"],
  ["Chonburi", "ชลบุรี"],
  ["Chumphon", "ชุมพร"],
  ["Kalasin", "กาฬสินธุ์"],
  ["Kamphaeng Phet", "กำแพงเพชร"],
  ["Kanchanaburi", "กาญจนบุรี"],
  ["Khon Kaen", "ขอนแก่น"],
  ["Krabi", "กระบี่"],
  ["Lampang", "ลำปาง"],
  ["Lamphun", "ลำพูน"],
  ["Loei", "เลย"],
  ["Lopburi", "ลพบุรี"],
  ["Mae Hong Son", "แม่ฮ่องสอน"],
  ["Maha Sarakham", "มหาสารคาม"],
  ["Mukdahan", "มุกดาหาร"],
  ["Nakhon Nayok", "นครนายก"],
  ["Nakhon Pathom", "นครปฐม"],
  ["Nakhon Phanom", "นครพนม"],
  ["Nakhon Ratchasima", "นครราชสีมา"],
  ["Nakhon Sawan", "นครสวรรค์"],
  ["Nakhon Si Thammarat", "นครศรีธรรมราช"],
  ["Nan", "น่าน"],
  ["Narathiwat", "นราธิวาส"],
  ["Nong Bua Lam Phu", "หนองบัวลำภู"],
  ["Nong Khai", "หนองคาย"],
  ["Nonthaburi", "นนทบุรี"],
  ["Pathum Thani", "ปทุมธานี"],
  ["Pattani", "ปัตตานี"],
  ["Phang Nga", "พังงา"],
  ["Phatthalung", "พัทลุง"],
  ["Phayao", "พะเยา"],
  ["Phetchabun", "เพชรบูรณ์"],
  ["Phetchaburi", "เพชรบุรี"],
  ["Phichit", "พิจิตร"],
  ["Phitsanulok", "พิษณุโลก"],
  ["Phra Nakhon Si Ayutthaya", "พระนครศรีอยุธยา"],
  ["Phrae", "แพร่"],
  ["Phuket", "ภูเก็ต"],
  ["Prachinburi", "ปราจีนบุรี"],
  ["Prachuap Khiri Khan", "ประจวบคีรีขันธ์"],
  ["Ranong", "ระนอง"],
  ["Ratchaburi", "ราชบุรี"],
  ["Rayong", "ระยอง"],
  ["Roi Et", "ร้อยเอ็ด"],
  ["Sa Kaeo", "สระแก้ว"],
  ["Sakon Nakhon", "สกลนคร"],
  ["Samut Prakan", "สมุทรปราการ"],
  ["Samut Sakhon", "สมุทรสาคร"],
  ["Samut Songkhram", "สมุทรสงคราม"],
  ["Saraburi", "สระบุรี"],
  ["Satun", "สตูล"],
  ["Sing Buri", "สิงห์บุรี"],
  ["Sisaket", "ศรีสะเกษ"],
  ["Songkhla", "สงขลา"],
  ["Sukhothai", "สุโขทัย"],
  ["Suphan Buri", "สุพรรณบุรี"],
  ["Surat Thani", "สุราษฎร์ธานี"],
  ["Surin", "สุรินทร์"],
  ["Tak", "ตาก"],
  ["Trang", "ตรัง"],
  ["Trat", "ตราด"],
  ["Ubon Ratchathani", "อุบลราชธานี"],
  ["Udon Thani", "อุดรธานี"],
  ["Uthai Thani", "อุทัยธานี"],
  ["Uttaradit", "อุตรดิตถ์"],
  ["Yala", "ยะลา"],
  ["Yasothon", "ยโสธร"]
] as const;
export const PROVINCE_OPTIONS = [
  "Unidentified",
  ...THAILAND_PROVINCES.map(([english]) => english)
] as const;

export function provinceLabel(value: string) {
  const province = THAILAND_PROVINCES.find(([english]) => english === value);
  return province ? `${province[0]} (${province[1]})` : value;
}

export type ProvinceChoice = { label: string; value: string; search: string };

function normalizeProvinceSearch(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

function provinceEditDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

export function provinceChoices(allLabel?: string): ProvinceChoice[] {
  return [
    ...(allLabel ? [{ label: allLabel, value: "", search: allLabel }] : []),
    ...PROVINCE_OPTIONS.map((province) => {
      const thai = THAILAND_PROVINCES.find(([english]) => english === province)?.[1] ?? "";
      return {
        label: provinceLabel(province),
        value: province,
        search: `${province} ${thai}`
      };
    })
  ];
}

export function suggestProvinceChoices(options: ProvinceChoice[], query: string, selectedLabel: string) {
  const needle = normalizeProvinceSearch(query);
  if (!needle || query === selectedLabel) return options;
  // ponytail: 79 short labels, direct edit-distance scan is simpler than a search dependency.
  return [...options]
    .map((option) => {
      const search = normalizeProvinceSearch(option.search);
      const english = normalizeProvinceSearch(option.value || option.label);
      const rank = search.startsWith(needle) ? 0 : search.includes(needle) ? 1 : 2;
      return { option, rank, distance: provinceEditDistance(needle, english) };
    })
    .sort((a, b) => a.rank - b.rank || a.distance - b.distance || a.option.label.localeCompare(b.option.label))
    .slice(0, 8)
    .map(({ option }) => option);
}

export const DEFAULT_VOCAB: Vocab = {
  ownership_types: [...OWNERSHIP_TYPES],
  linkage_types: [...LINKAGE_TYPES],
  partner_types: [...PARTNER_TYPES],
  collab_types: [...COLLAB_TYPES],
  provinces: [...PROVINCE_OPTIONS],
  industry_codes: ["ISIC-3030", "ISIC-2651", "ISIC-5120", "ISIC-6110", "ISIC-6130", "ISIC-6190", "ISIC-6201", "ISIC-2620", "ISIC-7490"],
  core_technologies: [
    "Satellite bus integration",
    "RF / microwave components",
    "Launch vehicle propulsion",
    "Tracking, telemetry & command",
    "GEO satcom payload ops",
    "EO image AI/ML analytics",
    "GNSS signal processing",
    "Multispectral image processing",
    "Hybrid rocket propulsion",
    "LEO IoT NB-IoT over satellite"
  ],
  component_systems: [...COMPONENT_SYSTEMS],
  component_modules: Array.from(new Set(COMPONENT_SYSTEMS.flatMap((system) => modulesForSystem(system)))),
  component_names: Array.from(new Set(allComponentNames()))
};

export function roleAtLeast(current: Role, needed: Role): boolean {
  const rank: Record<Role, number> = { Public: 0, Analyst: 1, Admin: 2 };
  return rank[current] >= rank[needed];
}

export function rolePermissions(role: Role) {
  return {
    canCreateCompany: role === "Analyst" || role === "Admin",
    canAddComponent: role === "Analyst" || role === "Admin",
    canEdit: role === "Admin",
    canDelete: role === "Admin",
    canExport: role === "Admin",
    canAdmin: role === "Admin"
  };
}
