export const SATELLITE_COMPONENT_TAXONOMY = {
  "1. Payload System(ระบบภารกิจ)": {
    "Optical Sensor Assembly(ชุดเซนเซอร์และเลนส์)": [
      "• กล้องถ่ายภาพความละเอียดสูง (Optical Telescope)",
      "• เซนเซอร์รับภาพ CMOS/CCD",
      "• แหวนสปริงพรีโหลดเลนส์ (Wave Springs): รักษาความตึงชุดเลนส์",
      "• ยางกันสะเทือนเลนส์ (Viscoelastic Dampers): ซับแรงสั่น",
      "• โอริงซีล (Low-Outgassing Viton O-Rings): กันฝุ่นเข้าเซนเซอร์",
      "• ชิปรับสัญญาณความไวสูง (LNA - Low Noise Amplifier)",
      "• ตัวกรองสัญญาณย่านความถี่แคบ (Narrowband SAW Filters)",
      "• สายอากาศย่าน UHF/VHF ขนาดเล็ก (Deployable Monopole Antennas)",
      "• วงจรรวม RF (RFIC) ทนรังสี"
    ],
    "Payload Data Processing(ส่วนประมวลผลข้อมูลภารกิจ)": [
      "• ชิปประมวลผล FPGA/GPU เฉพาะทาง",
      "• หน่วยความจำความเร็วสูง (NAND Flash Memory)",
      "• วงจรแปลงสัญญาณ (High-Speed ADC)"
    ],
    "High-Speed Downlink(ส่วนส่งข้อมูลความเร็วสูง)": [
      "• เครื่องส่งสัญญาณย่าน X-band (X-band Transmitter), Ka-band, Ku-band",
      "• เครื่องขยายสัญญาณกำลังส่งสูง (SSPA)",
      "• สายอากาศแบบกำหนดทิศทางย่าน X-band",
      "• สายนำสัญญาณความถี่สูง (RF Coaxial Cable)",
      "• เครื่องกำเนิดแสง (Laser link)"
    ],
    "Synthetic Aperture Radar (SAR)": [
      "• ชิปขยายสัญญาณกำลังสูง (GaN-based Transmit/Receive Modules: T/R Modules)",
      "• ท่อนำคลื่นความถี่วิทยุผลิตด้วย 3D Metal Printing (3D-Printed Waveguides)",
      "• สายอากาศแบบอาเรย์เฟส (AESA Antenna Tiles)",
      "• บอร์ดสลับสัญญาณความเร็วสูง (High-Speed RF Switches)",
      "• โครงสร้างตาข่ายสายอากาศคาร์บอนไฟเบอร์พับได้ (Deployable Carbon Fiber Mesh)",
      "• ท่อนำความร้อนระบายอากาศแผงเรดาร์ (Flexible Thermal Straps / Loop Heat Pipes)"
    ],
    "Hosted Payload Interface & Space-as-a-Service": [
      "• ช่องเสียบปลั๊กไฟและสัญญาณอเนกประสงค์ (Universal Payload Interface Ports)",
      "• ตัวแยกแรงดันไฟฟ้าป้องกันกระแสเกินไหลเข้าบัส (Galvanic Isolation Circuits)",
      "• สวิตช์สลับสายสัญญาณควบคุมด้วยซอฟต์แวร์ (Software-Defined Router Switches)"
    ],
    "Robotic Arm Joints & Actuators (โมดูลข้อต่อและระบบขับเคลื่อน)": [
      "• มอเตอร์ขับเคลื่อนแรงบิดสูงทนสภาวะอวกาศ (Space-Grade Frameless BLDC Motors)",
      "• ชุดเกียร์ทดรอบความแม่นยำสูงไร้ระยะฟรี (Harmonic Drive / Cycloidal Gears)",
      "• ระบบเบรกแม่เหล็กไฟฟ้าฉุกเฉินเมื่อไฟดับ (Electromagnetic Fail-Safe Brakes)",
      "• เซนเซอร์วัดมุมข้อต่อความละเอียดสูง (Absolute Rotary Encoders)",
      "• แบริ่งเซรามิกทนความร้อนสูงไม่ใช้จาระบีเหลว (Hybrid Ceramic Ball Bearings)",
      "• หัวจับยึดดาวเทียมเป้าหมาย (Capture Latch / Gripper Mechanism)",
      "• อุปกรณ์เปลี่ยนหัวเครื่องมืออัตโนมัติ (Automatic Tool Changer - ATC)",
      "• เซนเซอร์วัดแรงกดและแรงบิดตรงส่วนปลาย (Multi-Axis Force/Torque Sensors)",
      "• ขั้วต่อไฟฟ้าและสัญญาณเชื่อมต่อกับดาวเทียมเป้าหมาย (Blind-Mate Utility Connectors)",
      "• ท่อก้านแขนคาร์บอนไฟเบอร์น้ำหนักเบาความแกร่งสูง (Carbon Fiber Composite Booms)",
      "• แผ่นฟิล์มและฉนวนกันความร้อนหุ้มข้อต่อแขนกล (Custom MLI Thermal Jackets)",
      "• สายแพนำสัญญาณ/สายไฟความยืดหยุ่นสูงทนการบิดงอซ้ำๆ (High-Flex Robotic Cable Harness)",
      "• กล้องตรวจจับระยะใกล้ติดปลายแขน (Eye-in-Hand Cameras)",
      "• เครื่องฉายแสงเลเซอร์สามมิติตรวจสอบพื้นผิวเป้าหมาย (3D Laser Scanners / LiDAR)",
      "• ชิปประมวลผลคำนวณตำแหน่งพิกัดแบบ Real-time (Visual Servicing Processor Board)"
    ]
  },
  "2. Electrical Power System (EPS)(ระบบพลังงานไฟฟ้า)": {
    "Power Generation(ส่วนผลิตกระแสไฟ)": [
      "• แผงโซลาร์เซลล์ประสิทธิภาพสูง (GaAs Triple-Junction)",
      "• ไดโอดป้องกันกระแสย้อนกลับ (Blocking Diodes)",
      "• สปริงบิดกางแผง (Torsion Springs): สร้างแรงดีดกางแผงบานพับ",
      "• ยางซับแรงกระแทกบานพับ (Rubber Dampers): ซับแรงจังหวะกางสุด",
      "• ซิลิโคน RTV: ยางยึดแผ่นโซลาร์เซลล์รองรับการยืดหดจากความร้อน",
      "• กลไกล็อกแผงโซลาร์เซลล์ไว้กับตัวบัส HDRM (Hold-Down and Release Mechanism)",
      "• ตัวสลักล็อกเมื่อแผงโซลาร์เซลล์กางออกสุดแล้ว Latching Mechanism"
    ],
    "Solar Array Drive Mechanism (SADM/SADA) (ระบบหมุนแผงโซลาร์)": [
      "• มอเตอร์หมุนแกนละเอียดชนิดไม่ใช้แปรงถ่าน (Stepper / Brushless DC Space Motor)",
      "• วงแหวนสัมผัสส่งกำลังไฟฟ้าแบบหมุนต่อเนื่อง (Space-Grade Slip Rings)",
      "• สารหล่อลื่นสุญญากาศอัตราการระเหยต่ำ (Low-Outgassing Vacuum Lubricant / Braycote)",
      "• เซนเซอร์ตรวจจับตำแหน่งการหมุนมุมแผงโซลาร์ (Rotary Optical Encoders / Resolvers)",
      "• สายแพนำสัญญาณแบบยืดหยุ่นทนการพับกาง (Flexible Flat Cables - FFC)",
      "• ตลับลูกปืนเซรามิกทนสุญญากาศ (Hybrid Ceramic Bearings)"
    ],
    "PCDU(ส่วนควบคุมและแจกจ่ายไฟ)": [
      "• วงจรควบคุมการชาร์จ (MPPT Circuit)",
      "• ไอซีแปลงแรงดันไฟฟ้า (DC-DC Converters)",
      "• สวิตช์อิเล็กทรอนิกส์ (Solid-State Power Switches)",
      "• วงจรป้องกันและจำกัดกระแสไฟ (Current Limiters)"
    ],
    "Energy Storage(ชุดแบตเตอรี่)": [
      "• เซลล์แบตเตอรี่ลิเธียมไอออน (Li-ion Battery Cells)",
      "• บอร์ดบาลานซ์แรงดันแบตเตอรี่",
      "• ยางหุ้มเซลล์แบตเตอรี่ (Elastomer Sleeves): กันกระแทกและเป็นฉนวน",
      "• แผ่นยางนำความร้อน (Thermal Gap Pads): ถ่ายเทความร้อนลงฐาน"
    ]
  },
  "3. ADCS(ระบบควบคุมทิศทาง)": {
    "Attitude Sensors(ส่วนเซนเซอร์วัดทิศทาง)": [
      "• กล้องติดตามดวงดาว (Star Tracker)",
      "• เซนเซอร์วัดมุมดวงอาทิตย์ (Fine Sun Sensors)",
      "• เซนเซอร์วัดสนามแม่เหล็ก (3-Axis Magnetometer)",
      "• ไจโรสโคปความแม่นยำสูง (Fiber Optic Gyroscopes)",
      "• กล้องนำทางสองตาจับภาพสามมิติ (Stereo Navigation Cameras)"
    ],
    "Attitude Actuators(ส่วนกลไกขับเคลื่อนทิศทาง)": [
      "• มอเตอร์ขับล้อปฏิกิริยา (BLDC Motors)",
      "• มวลล้อหมุนแรงเหวี่ยง (Reaction Wheel Flywheels)",
      "• สปริงรองลูกปืนมอเตอร์ (Bearing Preload Springs)",
      "• ยางแยกการสั่นสะเทือนระดับไมโคร (Micro-vibration Isolators)",
      "• ขดลวดแม่เหล็กไฟฟ้า (Magnetorquer Coils)",
      "• ยางเรซินหุ้มขดลวด (Potting Compound): ล็อกขดลวดกันสั่นสะเทือน"
    ],
    "ADCS Controller(ส่วนประมวลผลทิศทาง)": [
      "• ไมโครคอนโทรลเลอร์ประมวลผล (ADCS MCU)",
      "• บอร์ดไดรเวอร์ควบคุมมอเตอร์ (Motor Driver Board)"
    ]
  },
  "4. Command & Data Handling (C&DH)(ระบบคอมพิวเตอร์หลัก)": {
    "On-Board Computer (OBC)(ส่วนประมวลผลหลัก)": [
      "• ชิปประมวลผลหลักทนรังสี (Radiation-Tolerant CPU)",
      "• หน่วยความจำหลักแก้ข้อผิดพลาด (SRAM with EDAC)",
      "• ไอซีระบบจับเวลาขัดจังหวะ (Watchdog Timer IC)",
      "• ชิปเก็บเฟิร์มแวร์ (EEPROM/MRAM)",
      "• High-Capacity Storage (Solid State Recorder)"
    ],
    "Internal Communication Bus(ส่วนบัสสื่อสารภายใน)": [
      "• ชิปสื่อสารบัสไลน์ (CAN Bus / SpaceWire Transceivers)",
      "• คอนเนกเตอร์เกรดอวกาศ (D-Sub / Micro-D Connectors)",
      "• สายไฟฉนวนเทฟลอน (PTFE Extruded Wire)",
      "• ขาพินบัดกรีผสมตะกั่ว (SnPb Solder)"
    ]
  },
  "5. TT&C(ระบบสื่อสารสั่งการ)": {
    "Transceiver(ส่วนรับส่งวิทยุสั่งการ)": [
      "• เครื่องรับส่งสัญญาณวิทยุ (S-band หรือ UHF/VHF)",
      "• วงจรรวมและแยกสัญญาณ (Diplexer)",
      "• วงจรถอดรหัสคำสั่ง (Hardware Command Decoder)"
    ],
    "Antenna System(ส่วนสายอากาศสั่งการ)": [
      "• สายอากาศรอบทิศทาง (Omnidirectional Antennas)",
      "• กลไกลวดตัดด้วยความร้อน (Burn-wire Mechanism)",
      "• สปริงขดผลักสายอากาศ (Compression Springs): ดีดสายอากาศให้กาง",
      "• ยางรองกลไกปลดล็อก (Release Mechanism Dampers)",
      "• บานพับสปริงบิดควบคุมความเร็วด้วยน้ำมันซิลิโคน (Viscous Damped Hinges)"
    ]
  },
  "6. Structure & Thermal Control (STCS)(ระบบโครงสร้างและอุณหภูมิ)": {
    "Primary Structure(โครงสร้างหลัก)": [
      "• โครงหลักอะลูมิเนียมเกรดอวกาศ (Al 7075) / ไทเทเนียม",
      "• วงแหวนแยกตัวจากจรวด (Separation Ring)",
      "• สปริงดันดาวเทียม (Separation Pusher Springs): ดีดดาวเทียมออกจากจรวด",
      "• โอริงหน้าสัมผัสจรวด (Interface O-Rings): กันกระแทกจุดเชื่อมต่อจรวด"
    ],
    "Electronics Packaging(การยึดแผงวงจร)": [
      "• น็อตเจาะรูระบายอากาศ (Vented Screws): ป้องกันอากาศขังในเกลียว",
      "• ขดลวดเสริมเกลียว (Helicoil Inserts)",
      "• ยางรองจุดยึด PCB (Standoff Dampers): ซับแรงสั่นไม่ให้ทำลายบอร์ด"
    ],
    "Thermal Control(ส่วนควบคุมอุณหภูมิ)": [
      "• ฉนวนกันความร้อนหลายชั้น (MLI Blankets)",
      "• แผ่นระบายความร้อน (Radiators)",
      "• จาระบีนำความร้อน (Thermal Grease)",
      "• เทปแคปตอนหน้าดำ (Black Kapton Tape)"
    ]
  },
  "7. Propulsion System(ระบบขับเคลื่อน)": {
    "Thruster Assembly(ชุดหัวฉีดขับดัน)": [
      "• หัวฉีด (Thruster Nozzle) โลหะทนความร้อนสูง",
      "• ฮีตเตอร์อุ่นสารขับดัน (Catalyst Bed Heaters)",
      "• สปริงวาล์ว (Solenoid Valve Return Springs): ดันวาล์วพ่นก๊าซให้ปิดสนิท"
    ],
    "Propellant Management(ส่วนจัดการสารขับดัน)": [
      "• ถังบรรจุแรงดัน (Titanium Propellant Tanks)",
      "• วาล์วควบคุมแรงดัน (Pressure Control Valves)",
      "• ไดอะแฟรม/ยางดันเชื้อเพลิง (Elastomeric Bladders): บีบดันเชื้อเพลิงในสภาวะไร้น้ำหนัก",
      "• โอริงซีลวาล์วและท่อ (Teflon/Viton Seals): กันสารเคมีกัดกร่อนรั่วซึม"
    ]
  }
} as const;

export type ComponentSystem = keyof typeof SATELLITE_COMPONENT_TAXONOMY;

export const COMPONENT_SYSTEMS = Object.keys(SATELLITE_COMPONENT_TAXONOMY) as ComponentSystem[];

export function modulesForSystem(system: string): string[] {
  const modules = SATELLITE_COMPONENT_TAXONOMY[system as ComponentSystem];
  return modules ? Object.keys(modules) : [];
}

export function componentsForModule(system: string, module: string): string[] {
  const modules = SATELLITE_COMPONENT_TAXONOMY[system as ComponentSystem];
  if (!modules) return [];
  return [...(modules[module as keyof typeof modules] ?? [])];
}

export function allComponentNames(): string[] {
  return COMPONENT_SYSTEMS.flatMap((system) =>
    modulesForSystem(system).flatMap((module) => componentsForModule(system, module))
  );
}

export function findComponentPath(componentName: string) {
  for (const system of COMPONENT_SYSTEMS) {
    for (const module of modulesForSystem(system)) {
      if (componentsForModule(system, module).includes(componentName)) {
        return { system, module };
      }
    }
  }
  return null;
}
