"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAllComponentsXlsx = createAllComponentsXlsx;
const schema_1 = require("./schema");
const rich_text_1 = require("./rich-text");
const COLUMNS = [
    { header: "Company ID", key: "companyId", width: 14 },
    { header: "Company Name", key: "companyName", width: 30 },
    { header: "Province", key: "province", width: 30 },
    { header: "Ownership", key: "ownership", width: 16 },
    { header: "Component ID", key: "componentId", width: 16 },
    { header: "Product Name", key: "productName", width: 30 },
    { header: "System", key: "system", width: 34 },
    { header: "Module", key: "module", width: 34 },
    { header: "Component", key: "component", width: 42 },
    { header: "Product TRL", key: "productTrl", width: 14 },
    { header: "Flight Heritage", key: "flightHeritage", width: 34 },
    { header: "Description", key: "description", width: 52 }
];
function safeText(value) {
    const text = value === null || value === undefined ? "" : String(value);
    return /^[=+\-@]/.test(text) ? `'${text}` : text;
}
async function createAllComponentsXlsx(db) {
    const ExcelJSImport = await import("exceljs");
    const ExcelJS = ExcelJSImport.default ?? ExcelJSImport;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SatDB";
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet("Components", {
        views: [{ state: "frozen", ySplit: 1 }]
    });
    worksheet.columns = COLUMNS.map((column) => ({ ...column }));
    const firms = new Map(db.firms.map((firm) => [firm.firm_id, firm]));
    const products = [...db.products].sort((a, b) => {
        const firmA = firms.get(a.firm_id)?.firm_name ?? "\uffff";
        const firmB = firms.get(b.firm_id)?.firm_name ?? "\uffff";
        return firmA.localeCompare(firmB) || a.product_name.localeCompare(b.product_name) || a.product_id.localeCompare(b.product_id);
    });
    for (const product of products) {
        const firm = firms.get(product.firm_id);
        worksheet.addRow({
            companyId: safeText(product.firm_id),
            companyName: safeText(firm?.firm_name),
            province: safeText(firm ? (0, schema_1.provinceLabel)(firm.province) : ""),
            ownership: safeText(firm?.ownership_type),
            componentId: safeText(product.product_id),
            productName: safeText(product.product_name),
            system: safeText(product.system),
            module: safeText(product.module),
            component: safeText(product.component_name),
            productTrl: typeof product.product_trl === "number" ? product.product_trl : safeText(product.product_trl),
            flightHeritage: safeText(product.flight_heritage),
            description: safeText((0, rich_text_1.richTextToPlainText)(product.description))
        });
    }
    worksheet.autoFilter = `A1:L${Math.max(1, products.length + 1)}`;
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF12315F" } };
        cell.alignment = { vertical: "middle" };
    });
    worksheet.getRow(1).height = 24;
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1)
            return;
        row.alignment = { vertical: "top", wrapText: true };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer);
}
