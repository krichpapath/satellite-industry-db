"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MapFirm = {
  firm_id: string;
  firm_name: string;
  province: string;
  industrial_zone?: string;
};

type Point = { x: number; y: number };
type LonLat = readonly [number, number];

const WIDTH = 420;
const HEIGHT = 680;
const PAD = 18;
const LON_MIN = 97.2;
const LON_MAX = 105.75;
const LAT_MIN = 5.55;
const LAT_MAX = 20.55;

const THAILAND_RING: LonLat[] = [
  [102.584932, 12.186595],
  [101.687158, 12.64574],
  [100.83181, 12.627085],
  [100.978467, 13.412722],
  [100.097797, 13.406856],
  [100.018733, 12.307001],
  [99.478921, 10.846367],
  [99.153772, 9.963061],
  [99.222399, 9.239255],
  [99.873832, 9.207862],
  [100.279647, 8.295153],
  [100.459274, 7.429573],
  [101.017328, 6.856869],
  [101.623079, 6.740622],
  [102.141187, 6.221636],
  [101.814282, 5.810808],
  [101.154219, 5.691384],
  [101.075516, 6.204867],
  [100.259596, 6.642825],
  [100.085757, 6.464489],
  [99.690691, 6.848213],
  [99.519642, 7.343454],
  [98.988253, 7.907993],
  [98.503786, 8.382305],
  [98.339662, 7.794512],
  [98.150009, 8.350007],
  [98.25915, 8.973923],
  [98.553551, 9.93296],
  [99.038121, 10.960546],
  [99.587286, 11.892763],
  [99.196354, 12.804748],
  [99.212012, 13.269294],
  [99.097755, 13.827503],
  [98.430819, 14.622028],
  [98.192074, 15.123703],
  [98.537376, 15.308497],
  [98.903348, 16.177824],
  [98.493761, 16.837836],
  [97.859123, 17.567946],
  [97.375896, 18.445438],
  [97.797783, 18.62708],
  [98.253724, 19.708203],
  [98.959676, 19.752981],
  [99.543309, 20.186598],
  [100.115988, 20.41785],
  [100.548881, 20.109238],
  [100.606294, 19.508344],
  [101.282015, 19.462585],
  [101.035931, 18.408928],
  [101.059548, 17.512497],
  [102.113592, 18.109102],
  [102.413005, 17.932782],
  [102.998706, 17.961695],
  [103.200192, 18.309632],
  [103.956477, 18.240954],
  [104.716947, 17.428859],
  [104.779321, 16.441865],
  [105.589039, 15.570316],
  [105.544338, 14.723934],
  [105.218777, 14.273212],
  [104.281418, 14.416743],
  [102.988422, 14.225721],
  [102.348099, 13.394247],
  [102.584932, 12.186595]
];

const PROVINCE_COORDS: Record<string, LonLat> = {
  "Amnat Charoen": [104.6258, 15.8657],
  "Ang Thong": [100.4551, 14.5896],
  Bangkok: [100.5018, 13.7563],
  "Bueng Kan": [103.6464, 18.3609],
  "Buri Ram": [103.1029, 14.993],
  Chachoengsao: [101.0779, 13.6904],
  "Chai Nat": [100.1251, 15.1852],
  Chaiyaphum: [102.0315, 15.8066],
  Chanthaburi: [102.1039, 12.6113],
  "Chiang Mai": [98.9853, 18.7883],
  "Chiang Rai": [99.8406, 19.9105],
  Chonburi: [100.9847, 13.3611],
  Chumphon: [99.18, 10.493],
  Kalasin: [103.5066, 16.4328],
  "Kamphaeng Phet": [99.522, 16.4828],
  Kanchanaburi: [99.5328, 14.0228],
  "Khon Kaen": [102.8236, 16.4322],
  Krabi: [98.9063, 8.0863],
  Lampang: [99.4909, 18.2888],
  Lamphun: [99.0087, 18.5745],
  Loei: [101.7223, 17.486],
  Lopburi: [100.6534, 14.7995],
  "Mae Hong Son": [97.9654, 19.302],
  "Maha Sarakham": [103.3026, 16.1851],
  Mukdahan: [104.7235, 16.5453],
  "Nakhon Nayok": [101.2131, 14.2069],
  "Nakhon Pathom": [100.0622, 13.8199],
  "Nakhon Phanom": [104.7696, 17.392],
  "Nakhon Ratchasima": [102.0977, 14.9799],
  "Nakhon Sawan": [100.1372, 15.7047],
  "Nakhon Si Thammarat": [99.9599, 8.4325],
  Nan: [100.773, 18.7756],
  Narathiwat: [101.8231, 6.4264],
  "Nong Bua Lam Phu": [102.426, 17.2218],
  "Nong Khai": [102.7413, 17.8783],
  Nonthaburi: [100.5144, 13.8621],
  "Pathum Thani": [100.525, 14.0208],
  Pattani: [101.2501, 6.8695],
  "Phang Nga": [98.5255, 8.4501],
  Phatthalung: [100.0779, 7.6179],
  Phayao: [99.9019, 19.1665],
  Phetchabun: [101.1606, 16.4189],
  Phetchaburi: [99.939, 13.1118],
  Phichit: [100.3488, 16.4429],
  Phitsanulok: [100.2659, 16.8211],
  "Phra Nakhon Si Ayutthaya": [100.5689, 14.3532],
  Phrae: [100.1403, 18.1446],
  Phuket: [98.3923, 7.8804],
  Prachinburi: [101.3727, 14.0509],
  "Prachuap Khiri Khan": [99.7973, 11.8124],
  Ranong: [98.6085, 9.9529],
  Ratchaburi: [99.8134, 13.5283],
  Rayong: [101.2816, 12.6814],
  "Roi Et": [103.652, 16.0538],
  "Sa Kaeo": [102.0646, 13.824],
  "Sakon Nakhon": [104.1348, 17.1546],
  "Samut Prakan": [100.5998, 13.5991],
  "Samut Sakhon": [100.2744, 13.5475],
  "Samut Songkhram": [100.0023, 13.4098],
  Saraburi: [100.9101, 14.5289],
  Satun: [100.0674, 6.6238],
  "Sing Buri": [100.3965, 14.8936],
  Sisaket: [104.322, 15.1186],
  Songkhla: [100.5951, 7.1898],
  Sukhothai: [99.8264, 17.0056],
  "Suphan Buri": [100.1177, 14.4745],
  "Surat Thani": [99.3215, 9.1382],
  Surin: [103.4937, 14.8829],
  Tak: [99.1259, 16.884],
  Trang: [99.6114, 7.5594],
  Trat: [102.5175, 12.2428],
  "Ubon Ratchathani": [104.8564, 15.2287],
  "Udon Thani": [102.7872, 17.4138],
  "Uthai Thani": [100.0246, 15.3835],
  Uttaradit: [100.0993, 17.6201],
  Yala: [101.28, 6.541],
  Yasothon: [104.1451, 15.7926]
};

const LABEL_OFFSETS: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  Bangkok: { dx: -8, dy: -13, anchor: "end" },
  Nonthaburi: { dx: -8, dy: -13, anchor: "end" },
  "Pathum Thani": { dx: 8, dy: -13, anchor: "start" },
  Chonburi: { dx: 8, dy: 15, anchor: "start" },
  "Samut Prakan": { dx: 8, dy: 15, anchor: "start" },
  Phuket: { dx: -8, dy: 15, anchor: "end" }
};

function project([lon, lat]: LonLat): Point {
  return {
    x: PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (WIDTH - PAD * 2),
    y: PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (HEIGHT - PAD * 2)
  };
}

function pointInPolygon(point: LonLat, polygon: LonLat[]) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function makePath(points: LonLat[]) {
  return points
    .map((point, index) => {
      const p = project(point);
      return `${index === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ")
    .concat(" Z");
}

const THAILAND_PATH = makePath(THAILAND_RING);

const DOTS = (() => {
  const dots: Point[] = [];
  for (let lat = LAT_MIN; lat <= LAT_MAX; lat += 0.24) {
    for (let lon = LON_MIN; lon <= LON_MAX; lon += 0.24) {
      if (pointInPolygon([lon, lat], THAILAND_RING)) dots.push(project([lon, lat]));
    }
  }
  return dots;
})();

const ZOOM_MIN = 1;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.35;
const AUTO_RESET_MS = 6000;
const PAN_KEY_STEP = 28;
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };

function plural(count: number) {
  return count === 1 ? "company" : "companies";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampPan(point: Point, zoom: number): Point {
  if (zoom <= 1) return { x: 0, y: 0 };
  return {
    x: clamp(point.x, -((WIDTH * (zoom - 1)) / 2), (WIDTH * (zoom - 1)) / 2),
    y: clamp(point.y, -((HEIGHT * (zoom - 1)) / 2), (HEIGHT * (zoom - 1)) / 2)
  };
}

export function ThailandMap({
  counts,
  firms = [],
  onSelect,
  selected
}: {
  counts: Record<string, number>;
  firms?: MapFirm[];
  onSelect?: (province: string | null) => void;
  selected?: string | null;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [lastInteraction, setLastInteraction] = useState(0);
  const [dragging, setDragging] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; startPan: Point } | null>(null);
  const draggedRef = useRef(false);
  const activeProvince = hover ?? selected ?? null;
  const activeFirms = activeProvince ? firms.filter((firm) => firm.province === activeProvince) : [];
  const litProvinces = Object.entries(PROVINCE_COORDS).filter(([province]) => (counts[province] ?? 0) > 0);
  const unmapped = Object.entries(counts).filter(([province, count]) => count > 0 && !PROVINCE_COORDS[province]);
  const mapTransform = `translate(${pan.x} ${pan.y}) translate(${CENTER.x} ${CENTER.y}) scale(${zoom}) translate(${-CENTER.x} ${-CENTER.y})`;

  useEffect(() => {
    if (zoom === 1 && pan.x === 0 && pan.y === 0) return;
    const timer = window.setTimeout(resetMap, AUTO_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [lastInteraction, pan.x, pan.y, zoom]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    shell.addEventListener("wheel", handleWheel, { passive: false });
    return () => shell.removeEventListener("wheel", handleWheel);
  }, [pan.x, pan.y, zoom]);

  function touchMap() {
    setLastInteraction(Date.now());
  }

  function resetMap() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function changeZoom(nextZoom: number, origin: Point = CENTER) {
    touchMap();
    const boundedZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(nextZoom.toFixed(2))));
    if (boundedZoom === 1) {
      resetMap();
      return;
    }
    const logicalPoint = {
      x: CENTER.x + (origin.x - pan.x - CENTER.x) / zoom,
      y: CENTER.y + (origin.y - pan.y - CENTER.y) / zoom
    };
    setZoom(boundedZoom);
    setPan(clampPan({
      x: origin.x - CENTER.x - boundedZoom * (logicalPoint.x - CENTER.x),
      y: origin.y - CENTER.y - boundedZoom * (logicalPoint.y - CENTER.y)
    }, boundedZoom));
  }

  function movePan(nextPan: Point) {
    touchMap();
    setPan(clampPan(nextPan, zoom));
  }

  function pointFromEvent(event: { clientX: number; clientY: number }) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return CENTER;
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT
    };
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();
    changeZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP), pointFromEvent(event));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      changeZoom(zoom + ZOOM_STEP);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      changeZoom(zoom - ZOOM_STEP);
    } else if (event.key === "0") {
      event.preventDefault();
      touchMap();
      resetMap();
    } else if (zoom > 1 && event.key === "ArrowLeft") {
      event.preventDefault();
      movePan({ x: pan.x + PAN_KEY_STEP, y: pan.y });
    } else if (zoom > 1 && event.key === "ArrowRight") {
      event.preventDefault();
      movePan({ x: pan.x - PAN_KEY_STEP, y: pan.y });
    } else if (zoom > 1 && event.key === "ArrowUp") {
      event.preventDefault();
      movePan({ x: pan.x, y: pan.y + PAN_KEY_STEP });
    } else if (zoom > 1 && event.key === "ArrowDown") {
      event.preventDefault();
      movePan({ x: pan.x, y: pan.y - PAN_KEY_STEP });
    }
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (zoom <= 1 || event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startPan: pan };
    draggedRef.current = false;
    setDragging(true);
    touchMap();
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const dx = ((event.clientX - drag.startX) / rect.width) * WIDTH;
    const dy = ((event.clientY - drag.startY) / rect.height) * HEIGHT;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4) draggedRef.current = true;
    movePan({ x: drag.startPan.x + dx, y: drag.startPan.y + dy });
  }

  function endDrag(event: React.PointerEvent<SVGSVGElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setDragging(false);
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        ref={shellRef}
        tabIndex={0}
        aria-label="Thailand map. Use plus and minus to zoom, scroll to zoom, arrow keys to pan when zoomed, zero to reset."
        onKeyDown={handleKeyDown}
        style={{
          position: "relative",
          overflow: "hidden",
          overscrollBehavior: "contain",
          border: "1px solid color-mix(in srgb, var(--primary) 24%, var(--line))",
          borderRadius: 12,
          background: "#071323",
          padding: 10
        }}
      >
        <div
          aria-label="Map zoom controls"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            display: "inline-flex",
            gap: 6,
            border: "1px solid rgba(148, 163, 184, 0.28)",
            borderRadius: 10,
            background: "rgba(7, 19, 35, 0.86)",
            padding: 5
          }}
        >
          {[
            { label: "Zoom in", icon: Plus, onClick: () => changeZoom(zoom + ZOOM_STEP), disabled: zoom >= ZOOM_MAX },
            { label: "Zoom out", icon: Minus, onClick: () => changeZoom(zoom - ZOOM_STEP), disabled: zoom <= ZOOM_MIN },
            {
              label: "Reset map zoom",
              icon: RotateCcw,
              onClick: () => {
                touchMap();
                resetMap();
              },
              disabled: zoom === 1 && pan.x === 0 && pan.y === 0
            }
          ].map(({ label, icon: Icon, onClick, disabled }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              onClick={onClick}
              disabled={disabled}
              style={{
                display: "grid",
                placeItems: "center",
                width: 30,
                height: 30,
                border: "1px solid rgba(226, 232, 240, 0.18)",
                borderRadius: 8,
                background: disabled ? "rgba(15, 23, 42, 0.45)" : "rgba(15, 34, 56, 0.92)",
                color: disabled ? "rgba(226, 232, 240, 0.36)" : "#dbeafe",
                cursor: disabled ? "not-allowed" : "pointer"
              }}
            >
              <Icon size={15} aria-hidden="true" />
            </button>
          ))}
        </div>
        <svg
          ref={svgRef}
          aria-label="Dotted map of Thailand with company provinces highlighted"
          role="img"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{
            width: "100%",
            height: 360,
            display: "block",
            cursor: zoom > 1 ? dragging ? "grabbing" : "grab" : "default",
            touchAction: zoom > 1 ? "none" : "auto"
          }}
        >
          <defs>
            <filter id="province-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width={WIDTH} height={HEIGHT} rx={10} fill="#071323" />
          <g transform={mapTransform} style={{ transition: dragging ? "none" : "transform 220ms var(--ease-out-quint)" }}>
            <path d={THAILAND_PATH} fill="#0c2035" stroke="rgba(191, 219, 254, 0.26)" strokeWidth={1.2} />
            {DOTS.map((dot, index) => (
              <circle key={index} cx={dot.x} cy={dot.y} r={1.45} fill="#7aa7d9" opacity={0.26} />
            ))}
            {litProvinces.map(([province, coord]) => {
              const point = project(coord);
              const count = counts[province] ?? 0;
              const active = selected === province;
              const hot = hover === province;
              const radius = active || hot ? 7 : 5.5;
              const label = LABEL_OFFSETS[province] ?? { dx: 0, dy: -14, anchor: "middle" as const };

              return (
                <g
                  key={province}
                  role={onSelect ? "button" : "img"}
                  tabIndex={onSelect ? 0 : undefined}
                  aria-label={`${province}, ${count} ${plural(count)}`}
                  onMouseEnter={() => {
                    touchMap();
                    setHover(province);
                  }}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => {
                    touchMap();
                    setHover(province);
                  }}
                  onBlur={() => setHover(null)}
                  onClick={() => {
                    if (draggedRef.current) {
                      draggedRef.current = false;
                      return;
                    }
                    touchMap();
                    onSelect?.(selected === province ? null : province);
                  }}
                  onKeyDown={(event) => {
                    if (!onSelect || (event.key !== "Enter" && event.key !== " ")) return;
                    event.preventDefault();
                    touchMap();
                    onSelect(selected === province ? null : province);
                  }}
                  style={{ cursor: onSelect ? "pointer" : "default", outline: "none" }}
                >
                  <title>{`${province}: ${count} ${plural(count)}${activeFirms.length ? ` - ${activeFirms.map((firm) => firm.firm_name).join(", ")}` : ""}`}</title>
                  <circle cx={point.x} cy={point.y} r={9} fill="transparent" />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius + 4}
                    fill={active || hot ? "rgba(250, 204, 21, 0.16)" : "rgba(96, 165, 250, 0.14)"}
                    stroke={active || hot ? "rgba(250, 204, 21, 0.5)" : "rgba(125, 211, 252, 0.35)"}
                    strokeWidth={1}
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius}
                    fill={active || hot ? "#facc15" : "#67e8f9"}
                    opacity={active || hot ? 1 : 0.9}
                    filter={active || hot ? "url(#province-glow)" : undefined}
                    stroke="#eff6ff"
                    strokeWidth={1.4}
                  />
                  {(active || hot) && (
                    <text
                      x={point.x + label.dx}
                      y={point.y + label.dy}
                      textAnchor={label.anchor}
                      fill="#eff6ff"
                      fontSize={11}
                      fontWeight={700}
                      paintOrder="stroke"
                      stroke="#071323"
                      strokeWidth={4}
                      pointerEvents="none"
                    >
                      {province}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div
        aria-live="polite"
        style={{
          minHeight: 64,
          border: "1px solid var(--line)",
          borderRadius: 10,
          background: "var(--surface-muted)",
          padding: 12
        }}
      >
        {activeProvince ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10, alignItems: "baseline" }}>
              <strong style={{ minWidth: 0, color: "var(--ink)", fontSize: 13, lineHeight: 1.35, overflowWrap: "anywhere" }}>{activeProvince}</strong>
              <span className="tabular" style={{ color: "var(--muted)", fontSize: 12, whiteSpace: "nowrap" }}>
                {counts[activeProvince] ?? 0} {plural(counts[activeProvince] ?? 0)}
              </span>
            </div>
            {activeFirms.length > 0 ? (
              <div style={{ display: "grid", gap: 5 }}>
                {activeFirms.map((firm) => (
                  <div key={firm.firm_id} style={{ color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.4, overflowWrap: "anywhere" }}>
                    <strong>{firm.firm_id}</strong> {firm.firm_name}
                    {firm.industrial_zone ? <span style={{ color: "var(--muted)" }}> - {firm.industrial_zone}</span> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Province-level position.</div>
            )}
          </div>
        ) : (
          <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.45 }}>
            Lit dots mark provinces with company records. Positions use provincial seats.
          </div>
        )}
      </div>

      {unmapped.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {unmapped.map(([province, count]) => (
            <button
              key={province}
              type="button"
              onClick={() => onSelect?.(selected === province ? null : province)}
              style={{
                minHeight: 30,
                border: "1px solid var(--line)",
                borderRadius: 999,
                background: selected === province ? "var(--primary)" : "var(--surface)",
                color: selected === province ? "#fff" : "var(--ink-soft)",
                padding: "3px 9px",
                fontSize: 11,
                cursor: onSelect ? "pointer" : "default"
              }}
            >
              {province} ({count})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
