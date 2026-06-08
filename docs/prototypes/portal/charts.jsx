// portal/charts.jsx
// Pure-SVG chart primitives for the Government Portal direction.
// No deps. All components accept `color` (hex) so per-domain coloring is easy.

const DOMAIN = {
  firm:    { color: '#0c2c5e', tint: '#e5ebf4', name: 'Firm',           th: 'องค์กร' },
  vc:      { color: '#4338ca', tint: '#e8e7fa', name: 'Value Chain',    th: 'ห่วงโซ่คุณค่า' },
  tech:    { color: '#0d9488', tint: '#d6f0ec', name: 'Technology',     th: 'เทคโนโลยี' },
  hr:      { color: '#b45309', tint: '#fbe9d2', name: 'Human Resources', th: 'ทรัพยากรบุคคล' },
  sc:      { color: '#7c3aed', tint: '#ece1fb', name: 'Supply Chain',   th: 'ห่วงโซ่อุปทาน' },
  inv:     { color: '#15803d', tint: '#d8efdf', name: 'Investment',     th: 'การลงทุน' },
  esg:     { color: '#65a30d', tint: '#e5f1d2', name: 'ESG',            th: 'ESG' },
};

// ----------------------------------------------------------------------------
// CompletenessRing — donut with center % label
// ----------------------------------------------------------------------------
function CompletenessRing({ pct, color = '#0c2c5e', size = 64, thickness = 7, label }) {
  const r = size / 2 - thickness / 2 - 1;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#eaeef5" strokeWidth={thickness} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={thickness}
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontFamily="Sarabun, sans-serif" fontWeight="600" fontSize={size * 0.28} fill="#0f1729">
        {pct}%
      </text>
      {label && (
        <text x={size / 2} y={size / 2 + size * 0.22} textAnchor="middle"
          fontFamily="Sarabun, sans-serif" fontSize={size * 0.13} fill="#5b6b80">
          {label}
        </text>
      )}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// SparkLine — small line with area fill, optional points
// ----------------------------------------------------------------------------
function SparkLine({ data, w = 120, h = 36, color = '#0c2c5e', filled = true, dots = false }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pad = 3;
  const span = max - min || 1;
  const x = (i) => pad + (i / (data.length - 1)) * (w - 2 * pad);
  const y = (v) => h - pad - ((v - min) / span) * (h - 2 * pad);
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const areaPts = `${pad},${h - pad} ${pts} ${w - pad},${h - pad}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {filled && <polygon points={areaPts} fill={color} opacity="0.12" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {dots && data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="2" fill={color} />
      ))}
      {/* end-point emphasis */}
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="2.5"
        fill="#fff" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// ----------------------------------------------------------------------------
// SparkBars — small bar chart with last-bar emphasis
// ----------------------------------------------------------------------------
function SparkBars({ data, w = 120, h = 36, color = '#0c2c5e', emphasizeLast = true }) {
  const max = Math.max(...data) || 1;
  const pad = 2;
  const bw = (w - 2 * pad) / data.length - 2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 2 * pad);
        const isLast = emphasizeLast && i === data.length - 1;
        return (
          <rect key={i}
            x={pad + i * (bw + 2)}
            y={h - pad - bh}
            width={bw} height={bh}
            fill={color} opacity={isLast ? 1 : 0.35} />
        );
      })}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// HorizontalBars — labeled horizontal bars with values
// ----------------------------------------------------------------------------
function HorizontalBars({ data, w = 480, color = '#0c2c5e', maxVal, rowH = 28, valueFmt }) {
  const max = maxVal || Math.max(...data.map(d => d.value));
  const labelW = 140;
  const valueW = 60;
  const barW = w - labelW - valueW - 16;
  const h = data.length * rowH + 8;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.map((d, i) => {
        const y = i * rowH + 4;
        const bw = (d.value / max) * barW;
        return (
          <g key={i}>
            <text x={labelW - 8} y={y + rowH / 2 + 4} textAnchor="end"
              fontFamily="Sarabun, sans-serif" fontSize="12" fill="#0f1729">
              {d.label}
            </text>
            <rect x={labelW} y={y + 6} width={barW} height={rowH - 12} fill="#eaeef5" />
            <rect x={labelW} y={y + 6} width={bw} height={rowH - 12} fill={d.color || color} />
            <text x={labelW + bw + 6} y={y + rowH / 2 + 4}
              fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#0f1729"
              fontWeight="500">
              {valueFmt ? valueFmt(d.value) : d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// TRL Bars — 9 vertical bars, banded by readiness
// ----------------------------------------------------------------------------
function TrlBars({ data, w = 380, h = 130 }) {
  // data: array of 9 numbers (count of technologies at each TRL)
  const pad = { t: 14, r: 6, b: 24, l: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...data, 3);
  const bw = innerW / 9 - 4;
  // band colors: 1-3 red-ish, 4-6 amber, 7-9 green
  const bandColor = (trl) =>
    trl <= 3 ? '#dc2626' : trl <= 6 ? '#d97706' : '#15803d';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* baseline */}
      <line x1={pad.l} x2={w - pad.r} y1={h - pad.b} y2={h - pad.b}
        stroke="#cbd2db" strokeWidth="1" />
      {/* readiness band labels */}
      <text x={pad.l + (innerW / 9) * 1.5} y={pad.t - 2} textAnchor="middle"
        fontFamily="Sarabun, sans-serif" fontSize="9" fill="#dc2626"
        letterSpacing="0.08em">RESEARCH</text>
      <text x={pad.l + (innerW / 9) * 4.5} y={pad.t - 2} textAnchor="middle"
        fontFamily="Sarabun, sans-serif" fontSize="9" fill="#d97706"
        letterSpacing="0.08em">DEVELOPMENT</text>
      <text x={pad.l + (innerW / 9) * 7.5} y={pad.t - 2} textAnchor="middle"
        fontFamily="Sarabun, sans-serif" fontSize="9" fill="#15803d"
        letterSpacing="0.08em">DEPLOYMENT</text>
      {data.map((v, i) => {
        const trl = i + 1;
        const bh = (v / max) * innerH;
        const x = pad.l + i * (innerW / 9) + 2;
        return (
          <g key={i}>
            <rect x={x} y={h - pad.b - bh} width={bw} height={bh || 1}
              fill={bandColor(trl)} opacity={v > 0 ? 1 : 0.2} />
            {v > 0 && (
              <text x={x + bw / 2} y={h - pad.b - bh - 4} textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace" fontSize="10"
                fill="#0f1729" fontWeight="500">{v}</text>
            )}
            <text x={x + bw / 2} y={h - pad.b + 14} textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace" fontSize="10"
              fill="#5b6b80">{trl}</text>
          </g>
        );
      })}
      <text x={pad.l - 6} y={h - pad.b + 14} textAnchor="end"
        fontFamily="Sarabun, sans-serif" fontSize="9" fill="#5b6b80"
        letterSpacing="0.08em">TRL</text>
    </svg>
  );
}

// ----------------------------------------------------------------------------
// StackedBar — single horizontal stacked bar
// ----------------------------------------------------------------------------
function StackedBar({ segments, w = 440, h = 22 }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {segments.map((s, i) => {
        const sw = (s.value / total) * w;
        const x = acc;
        acc += sw;
        return (
          <g key={i}>
            <rect x={x} y={0} width={sw} height={h} fill={s.color} />
            {sw > 24 && (
              <text x={x + 6} y={h / 2 + 4} fontFamily="IBM Plex Mono, monospace"
                fontSize="10" fill="#fff" fontWeight="500">
                {s.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// ComboChart — grouped bars + overlay line (e.g. revenue bars + export-share line)
// ----------------------------------------------------------------------------
function ComboChart({ years, bars, line, w = 460, h = 200, barColor = '#15803d', lineColor = '#0c2c5e' }) {
  const pad = { t: 18, r: 38, b: 24, l: 38 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxBar = Math.max(...bars) * 1.1;
  const maxLine = Math.max(...line) * 1.2;
  const bw = innerW / years.length - 10;
  const xc = (i) => pad.l + (i + 0.5) * (innerW / years.length);
  const yBar = (v) => h - pad.b - (v / maxBar) * innerH;
  const yLine = (v) => h - pad.b - (v / maxLine) * innerH;
  const linePts = line.map((v, i) => `${xc(i)},${yLine(v)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* gridlines */}
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i}
          x1={pad.l} x2={w - pad.r}
          y1={h - pad.b - t * innerH} y2={h - pad.b - t * innerH}
          stroke="#eaeef5" strokeWidth="1" />
      ))}
      {/* bars */}
      {bars.map((v, i) => (
        <g key={i}>
          <rect x={xc(i) - bw / 2} y={yBar(v)} width={bw} height={(v / maxBar) * innerH}
            fill={barColor} opacity="0.85" />
          <text x={xc(i)} y={h - pad.b + 14} textAnchor="middle"
            fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#5b6b80">
            {years[i]}
          </text>
        </g>
      ))}
      {/* line */}
      <polyline points={linePts} fill="none" stroke={lineColor} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />
      {line.map((v, i) => (
        <circle key={i} cx={xc(i)} cy={yLine(v)} r="3"
          fill="#fff" stroke={lineColor} strokeWidth="2" />
      ))}
      {/* left axis label */}
      <text x={pad.l - 4} y={pad.t - 4} textAnchor="end"
        fontFamily="Sarabun, sans-serif" fontSize="9" fill={barColor}
        letterSpacing="0.06em" fontWeight="600">REV ฿M</text>
      {/* right axis label */}
      <text x={w - pad.r + 4} y={pad.t - 4} textAnchor="start"
        fontFamily="Sarabun, sans-serif" fontSize="9" fill={lineColor}
        letterSpacing="0.06em" fontWeight="600">EXPORT %</text>
      {/* right-axis line values at top */}
      <text x={w - pad.r + 4} y={yLine(line[line.length - 1]) + 3}
        fontFamily="IBM Plex Mono, monospace" fontSize="10" fill={lineColor}
        fontWeight="600">{line[line.length - 1]}%</text>
    </svg>
  );
}

// ----------------------------------------------------------------------------
// RadarMini — small 5-axis radar (ESG dimensions)
// ----------------------------------------------------------------------------
function RadarMini({ axes, values, size = 200, color = '#65a30d' }) {
  // values: array of 0..100, same length as axes
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 28;
  const n = axes.length;
  const angle = (i) => -Math.PI / 2 + (i / n) * 2 * Math.PI;
  const pt = (v, i) => {
    const rr = (v / 100) * r;
    return [cx + rr * Math.cos(angle(i)), cy + rr * Math.sin(angle(i))];
  };
  const ring = (frac) => axes.map((_, i) => {
    const [x, y] = pt(frac * 100, i);
    return `${x},${y}`;
  }).join(' ');
  const polyPts = values.map((v, i) => pt(v, i).join(',')).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <polygon key={i} points={ring(f)}
          fill="none" stroke="#dde3ec" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(100, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#dde3ec" strokeWidth="1" />;
      })}
      <polygon points={polyPts} fill={color} fillOpacity="0.22"
        stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = pt(v, i);
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
      {axes.map((label, i) => {
        const [x, y] = pt(118, i);
        return (
          <text key={i} x={x} y={y + 3} textAnchor="middle"
            fontFamily="Sarabun, sans-serif" fontSize="10"
            fill="#0f1729" fontWeight="500">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// DonutBreakdown — donut with center stat + side legend
// ----------------------------------------------------------------------------
function DonutBreakdown({ segments, size = 130, thickness = 22, centerLabel, centerSub }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - thickness / 2 - 1;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="#eaeef5" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const portion = s.value / total;
        const dash = portion * c;
        const dashArr = `${dash} ${c - dash}`;
        const rot = (offset / c) * 360 - 90;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness}
            strokeDasharray={dashArr}
            transform={`rotate(${rot} ${cx} ${cy})`} />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
        fontFamily="Sarabun, sans-serif" fontWeight="700" fontSize="22"
        fill="#0f1729">{centerLabel}</text>
      {centerSub && (
        <text x={cx} y={cy + 16} textAnchor="middle"
          fontFamily="Sarabun, sans-serif" fontSize="10"
          letterSpacing="0.08em" fill="#5b6b80">{centerSub}</text>
      )}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// ThailandMap — simplified outline + HQ + supply-chain dots
// (Hand-drawn outline path of Thailand silhouette, not geographically exact.)
// ----------------------------------------------------------------------------
function ThailandMap({ w = 240, h = 340, points }) {
  // points: [{x: 0..100, y: 0..100, kind: 'hq' | 'sup' | 'cust' | 'partner', label?}]
  const outline =
    "M120 14 C 132 10, 144 18, 146 36 C 148 60, 138 76, 136 96 " +
    "C 134 112, 144 124, 152 140 C 162 158, 178 168, 186 184 " +
    "C 196 204, 202 222, 198 244 C 192 264, 178 268, 168 254 " +
    "C 160 240, 158 220, 144 218 C 130 218, 122 232, 124 252 " +
    "C 126 274, 132 296, 124 312 C 116 326, 100 320, 96 304 " +
    "C 92 286, 100 268, 92 252 C 82 234, 64 240, 56 222 " +
    "C 50 200, 64 184, 58 162 C 50 138, 40 122, 44 100 " +
    "C 48 78, 64 70, 78 56 C 92 42, 102 28, 120 14 Z";
  const kindStyle = {
    hq:      { fill: '#0c2c5e', r: 7, ring: 14 },
    sup:     { fill: '#7c3aed', r: 4 },
    cust:    { fill: '#0d9488', r: 4 },
    partner: { fill: '#b45309', r: 4 },
  };
  return (
    <svg width={w} height={h} viewBox="0 0 240 340">
      <defs>
        <pattern id="dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="#cbd2db" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="240" height="340" fill="url(#dots)" />
      <path d={outline} fill="#f1f4f9" stroke="#0c2c5e" strokeWidth="1.4" strokeLinejoin="round" />
      {points && points.map((p, i) => {
        const s = kindStyle[p.kind] || kindStyle.sup;
        const cx = p.x * 2.4;
        const cy = p.y * 3.4;
        return (
          <g key={i}>
            {s.ring && (
              <circle cx={cx} cy={cy} r={s.ring}
                fill={s.fill} fillOpacity="0.15"
                stroke={s.fill} strokeWidth="1" strokeOpacity="0.5" />
            )}
            <circle cx={cx} cy={cy} r={s.r} fill={s.fill}
              stroke="#fff" strokeWidth="1.5" />
            {p.label && (
              <text x={cx + 10} y={cy + 4}
                fontFamily="Sarabun, sans-serif" fontSize="10"
                fill="#0f1729" fontWeight="600">{p.label}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// Timeline — vertical timeline with colored dots
// ----------------------------------------------------------------------------
function Timeline({ events, w = 320 }) {
  // events: [{date, body, domain, user}]
  const rowH = 56;
  const h = events.length * rowH + 12;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1={28} x2={28} y1={6} y2={h - 6}
        stroke="#dde3ec" strokeWidth="2" strokeDasharray="2 3" />
      {events.map((e, i) => {
        const y = i * rowH + 18;
        const dom = DOMAIN[e.domain] || DOMAIN.firm;
        return (
          <g key={i}>
            <circle cx={28} cy={y} r="6" fill={dom.color} stroke="#fff" strokeWidth="2" />
            <text x={48} y={y - 2}
              fontFamily="Sarabun, sans-serif" fontWeight="600" fontSize="11"
              fill={dom.color}
              letterSpacing="0.06em">{dom.name.toUpperCase()}</text>
            <text x={48} y={y + 14}
              fontFamily="Sarabun, sans-serif" fontSize="12.5"
              fill="#0f1729">{e.body}</text>
            <text x={48} y={y + 30}
              fontFamily="IBM Plex Mono, monospace" fontSize="10"
              fill="#5b6b80" letterSpacing="0.04em">
              {e.date} · {e.user}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// DomainPill — small colored pill with name
// ----------------------------------------------------------------------------
function DomainPill({ domain, size = 'sm' }) {
  const d = DOMAIN[domain] || DOMAIN.firm;
  const padY = size === 'lg' ? 4 : 2;
  const padX = size === 'lg' ? 10 : 8;
  const fs = size === 'lg' ? 12 : 10.5;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: `${padY}px ${padX}px`,
      background: d.tint, color: d.color,
      fontFamily: 'Sarabun, sans-serif',
      fontWeight: 600, fontSize: fs,
      letterSpacing: '0.04em',
      borderRadius: 2,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: d.color,
      }}></span>
      {d.name}
    </span>
  );
}

window.DOMAIN = DOMAIN;
window.CompletenessRing = CompletenessRing;
window.SparkLine = SparkLine;
window.SparkBars = SparkBars;
window.HorizontalBars = HorizontalBars;
window.TrlBars = TrlBars;
window.StackedBar = StackedBar;
window.ComboChart = ComboChart;
window.RadarMini = RadarMini;
window.DonutBreakdown = DonutBreakdown;
window.ThailandMap = ThailandMap;
window.Timeline = Timeline;
window.DomainPill = DomainPill;
