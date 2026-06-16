"use client";

import { useState } from "react";

const OUTLINE =
  "M 125 0 L 130 20 L 202 32 L 212 128 L 361 124 L 356 168 L 361 220 L 337 244 L 299 240 L 250 248 L 226 268 L 231 316 L 250 328 L 178 320 L 91 400 L 96 456 L 125 484 L 159 532 L 202 580 L 110 520 L 53 504 L 58 484 L 63 424 L 67 260 L 82 144 L 29 48 Z";

const COORDS: Record<string, { x: number; y: number }> = {
  Bangkok: { x: 154, y: 270 },
  Chonburi: { x: 178, y: 284 },
  Rayong: { x: 193, y: 312 },
  "Pathum Thani": { x: 154, y: 260 },
  "Chiang Mai": { x: 82, y: 68 },
  "Khon Kaen": { x: 265, y: 164 },
  Phuket: { x: 53, y: 504 },
  "Nakhon Ratchasima": { x: 231, y: 221 }
};

export function ThailandMap({
  counts,
  onSelect,
  selected
}: {
  counts: Record<string, number>;
  onSelect?: (province: string | null) => void;
  selected?: string | null;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...Object.values(counts));
  const unmapped = Object.entries(counts).filter(([province, count]) => count > 0 && !COORDS[province]);

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox="0 0 400 600"
        style={{ width: "100%", maxWidth: 360, height: "auto", display: "block", margin: "0 auto" }}
      >
        <path
          d={OUTLINE}
          fill="var(--surface-muted)"
          stroke="var(--line)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {Object.entries(COORDS).map(([prov, p]) => {
          const n = counts[prov] ?? 0;
          const r = 6 + (n / max) * 16;
          const active = selected === prov;
          const hot = hover === prov;
          return (
            <g
              key={prov}
              onMouseEnter={() => setHover(prov)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(selected === prov ? null : prov)}
              style={{ cursor: onSelect ? "pointer" : "default" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={active ? "var(--primary-strong)" : "var(--primary)"}
                fillOpacity={n === 0 ? 0.25 : active ? 0.85 : 0.6}
                stroke="#fff"
                strokeWidth={active || hot ? 3 : 1.5}
              />
              <text
                x={p.x}
                y={p.y - r - 6}
                textAnchor="middle"
                fontSize={10}
                fill="var(--ink)"
                style={{ fontWeight: active ? 600 : 500, pointerEvents: "none" }}
              >
                {prov} {n > 0 && `(${n})`}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 4 }}>
        Stylised outline Â· circle size = company count Â· click to filter
      </div>
      {unmapped.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 8 }}>
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
