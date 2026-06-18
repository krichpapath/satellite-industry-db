"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_VOCAB = exports.PROVINCE_OPTIONS = exports.THAILAND_PROVINCES = exports.ROLES = exports.COLLAB_TYPES = exports.PARTNER_TYPES = exports.LINKAGE_TYPES = exports.OWNERSHIP_TYPES = void 0;
exports.provinceLabel = provinceLabel;
exports.provinceChoices = provinceChoices;
exports.suggestProvinceChoices = suggestProvinceChoices;
exports.roleAtLeast = roleAtLeast;
exports.rolePermissions = rolePermissions;
const component_taxonomy_1 = require("./component-taxonomy");
exports.OWNERSHIP_TYPES = ["Local", "Foreign", "JV"];
exports.LINKAGE_TYPES = ["Supplier", "Buyer", "Partner"];
exports.PARTNER_TYPES = ["University", "PRI", "Association"];
exports.COLLAB_TYPES = ["R&D", "Training", "Testing"];
exports.ROLES = ["Public", "Analyst", "Admin"];
exports.THAILAND_PROVINCES = [
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
];
exports.PROVINCE_OPTIONS = [
    "Unidentified",
    ...exports.THAILAND_PROVINCES.map(([english]) => english)
];
function provinceLabel(value) {
    const province = exports.THAILAND_PROVINCES.find(([english]) => english === value);
    return province ? `${province[0]} (${province[1]})` : value;
}
function normalizeProvinceSearch(value) {
    return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}
function provinceEditDistance(a, b) {
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
function provinceChoices(allLabel) {
    return [
        ...(allLabel ? [{ label: allLabel, value: "", search: allLabel }] : []),
        ...exports.PROVINCE_OPTIONS.map((province) => {
            const thai = exports.THAILAND_PROVINCES.find(([english]) => english === province)?.[1] ?? "";
            return {
                label: provinceLabel(province),
                value: province,
                search: `${province} ${thai}`
            };
        })
    ];
}
function suggestProvinceChoices(options, query, selectedLabel) {
    const needle = normalizeProvinceSearch(query);
    if (!needle || query === selectedLabel)
        return options;
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
exports.DEFAULT_VOCAB = {
    ownership_types: [...exports.OWNERSHIP_TYPES],
    linkage_types: [...exports.LINKAGE_TYPES],
    partner_types: [...exports.PARTNER_TYPES],
    collab_types: [...exports.COLLAB_TYPES],
    provinces: [...exports.PROVINCE_OPTIONS],
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
    component_systems: [...component_taxonomy_1.COMPONENT_SYSTEMS],
    component_modules: Array.from(new Set(component_taxonomy_1.COMPONENT_SYSTEMS.flatMap((system) => (0, component_taxonomy_1.modulesForSystem)(system)))),
    component_names: Array.from(new Set((0, component_taxonomy_1.allComponentNames)()))
};
function roleAtLeast(current, needed) {
    const rank = { Public: 0, Analyst: 1, Admin: 2 };
    return rank[current] >= rank[needed];
}
function rolePermissions(role) {
    return {
        canCreateCompany: role === "Analyst" || role === "Admin",
        canAddComponent: role === "Analyst" || role === "Admin",
        canEdit: role === "Admin",
        canDelete: role === "Admin",
        canExport: role === "Admin",
        canAdmin: role === "Admin"
    };
}
