import assert from "node:assert/strict";
import { test } from "vitest";
import { alphaCompare, COMPONENT_SYSTEMS, modulesForSystem, componentsForModule, findComponentPath, normalizeComponentModule } from "./component-taxonomy";
import { mergeComponentVocab, DEFAULT_VOCAB } from "./schema";
import { normalizeVocab, rowForApi } from "./api";

// Yellow cells in category!A1:C151, sat_sys_mod_com_update20260914.xlsx.
const additions = [
  [
    "Electrical Power System (EPS)(ระบบพลังงานไฟฟ้า)",
    "Power Generation(ส่วนผลิตกระแสไฟ)",
    "ตัวเก็บประจุปล่อยกระแสสูงฉับพลัน (High-Current Discharge Capacitors)"
  ],
  [
    "Electrical Power System (EPS)(ระบบพลังงานไฟฟ้า)",
    "Power Generation(ส่วนผลิตกระแสไฟ)",
    "วงจรเซฟตี้ล็อกสองชั้นกันไฟกระชาก (Dual-Fault Tolerant Switches)"
  ],
  [
    "Electrical Power System (EPS)(ระบบพลังงานไฟฟ้า)",
    "PCDU(ส่วนควบคุมและแจกจ่ายไฟ)",
    "ขั้วต่อสายไฟทนกระแสสูง (High-Reliability Power Connectors)"
  ],
  [
    "Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)",
    "Primary Structure(โครงสร้างหลัก)",
    "แผงโซลาร์ Panel Aluminium Honeycomb"
  ],
  [
    "Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)",
    "Primary Structure(โครงสร้างหลัก)",
    "แผงโซลาร์ Panel CFRP Honeycomb"
  ],
  [
    "Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)",
    "Primary Structure(โครงสร้างหลัก)",
    "การทำ Anodize"
  ],
  [
    "Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)",
    "Primary Structure(โครงสร้างหลัก)",
    "การทำชิ้นงาน Bracket / Adapter / Housing / Insert : Aluminium, Titanium"
  ],
  [
    "Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)",
    "ระบบดีดตัวดาวเทียม",
    "วงแหวนแยกตัวจากจรวด (Separation Ring)"
  ],
  [
    "Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)",
    "ระบบดีดตัวดาวเทียม",
    "สปริงดันดาวเทียม (Separation Pusher Springs): ดีดดาวเทียมออกจากจรวด"
  ],
  [
    "Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)",
    "ระบบดีดตัวดาวเทียม",
    "โอริงหน้าสัมผัสจรวด (Interface O-Rings): กันกระแทกจุดเชื่อมต่อจรวด"
  ],
  [
    "AIT (การประกอบและทดสอบ)",
    "Mechanical Ground support Equipment",
    "Thermal Interface plate"
  ],
  [
    "AIT (การประกอบและทดสอบ)",
    "Mechanical Ground support Equipment",
    "Mass properties Interface Plate"
  ],
  [
    "AIT (การประกอบและทดสอบ)",
    "Mechanical Ground support Equipment",
    "Vibration Interface Plate"
  ],
  [
    "AIT (การประกอบและทดสอบ)",
    "Mechanical Ground support Equipment",
    "Lifting frame"
  ],
  [
    "AIT (การประกอบและทดสอบ)",
    "Mechanical Ground support Equipment",
    "Payload Lifting Frame"
  ],
  [
    "AIT (การประกอบและทดสอบ)",
    "Mechanical Ground support Equipment",
    "Arcrylic Protector"
  ]
] as const;

test("all 16 highlighted component paths match the workbook", () => {
  assert.equal(additions.length, 16);
  assert.equal(COMPONENT_SYSTEMS.length, 9); // Eight systems plus Unidentified.
  for (const [system, module, component] of additions) {
    assert.ok(COMPONENT_SYSTEMS.includes(system));
    assert.ok(modulesForSystem(system).includes(module));
    assert.ok(componentsForModule(system, module).includes(component));
    assert.deepEqual(findComponentPath(component), { system, module });
  }
});

test("options sort English first, then Thai dictionary order, with Unidentified last", () => {
  assert.deepEqual(["Unidentified", "ไข่", "Zulu", "กา", "แก้ว", "apple", "ขา"].sort(alphaCompare),
    ["apple", "Zulu", "กา", "แก้ว", "ขา", "ไข่", "Unidentified"]);
  assert.ok(alphaCompare("8. AIT", "1. Payload") < 0);
  assert.ok(alphaCompare("• apple", "Zulu") < 0);
  const check = (values: string[]) => {
    assert.equal(new Set(values).size, values.length);
    assert.deepEqual(values, [...values].sort(alphaCompare));
    assert.equal(values.at(-1), "Unidentified");
  };
  check(COMPONENT_SYSTEMS);
  for (const system of COMPONENT_SYSTEMS) {
    check(modulesForSystem(system));
    for (const module of modulesForSystem(system)) check(componentsForModule(system, module));
  }
});

test("only the three reassigned paths migrate, including API writes", () => {
  for (const [system, module, component] of additions.filter((p) => p[1] === "ระบบดีดตัวดาวเทียม")) {
    assert.ok(!componentsForModule(system, "Primary Structure(โครงสร้างหลัก)").includes(component));
    assert.equal(normalizeComponentModule(system, "Primary Structure(โครงสร้างหลัก)", component), module);
    assert.equal(normalizeComponentModule(system, "Custom module", component), "Custom module");
    assert.equal(normalizeComponentModule("Custom system", "Primary Structure(โครงสร้างหลัก)", component), "Primary Structure(โครงสร้างหลัก)");
    const row = rowForApi("products", { product_id: "P1", firm_id: "F1", product_name: "Existing", system,
      module: "Primary Structure(โครงสร้างหลัก)", component_name: component, record_state: "draft" });
    assert.equal(row.module, module);
    assert.equal(row.product_id, "P1");
    assert.equal(row.review_status, "draft");
  }
});

test("old local and remote vocabularies gain additions and retain custom terms", () => {
  const local = mergeComponentVocab({ component_systems: ["Custom system"], component_modules: [], component_names: [] });
  const remote = normalizeVocab([{ vocab_key: "component_systems", term: "Custom system" }]);
  for (const vocab of [local, remote]) {
    assert.ok(vocab.component_systems.includes("Custom system"));
    for (const key of ["component_systems", "component_modules", "component_names"] as const) {
      for (const value of DEFAULT_VOCAB[key]) assert.ok(vocab[key].includes(value));
    }
    assert.deepEqual(mergeComponentVocab(vocab), vocab);
  }
});
