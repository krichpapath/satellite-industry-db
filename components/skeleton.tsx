import React from "react";

type SkeletonProps = {
  w?: number | string;
  h?: number | string;
  r?: number | string;
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ w = "100%", h = 14, r = 6, className = "", style }: SkeletonProps) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{
        width: typeof w === "number" ? `${w}px` : w,
        height: typeof h === "number" ? `${h}px` : h,
        borderRadius: typeof r === "number" ? `${r}px` : r,
        ...style
      }}
    />
  );
}

export function SkeletonCard({ children, padding = 20, style }: { children?: React.ReactNode; padding?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding,
        boxShadow: "var(--shadow)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 16, marginBottom: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i}>
          <Skeleton w={36} h={3} style={{ marginBottom: 12 }} />
          <Skeleton w="60%" h={12} style={{ marginBottom: 10 }} />
          <Skeleton w="50%" h={28} />
          <Skeleton w="40%" h={10} style={{ marginTop: 10 }} />
        </SkeletonCard>
      ))}
    </div>
  );
}

export function SkeletonHeader({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Skeleton w={260} h={28} style={{ marginBottom: 10 }} />
      {subtitle && <Skeleton w={420} h={14} />}
    </div>
  );
}

export function SkeletonRows({ count = 6, height = 44 }: { count?: number; height?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} h={height} r={10} />
      ))}
    </div>
  );
}

export function SkeletonBars({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Skeleton w={120} h={11} />
            <Skeleton w={40} h={11} />
          </div>
          <Skeleton h={8} r={999} w={`${90 - i * 12}%`} />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({
  showStats = false,
  statCount = 4,
  panels = 2,
  rows = 6
}: {
  showStats?: boolean;
  statCount?: number;
  panels?: number;
  rows?: number;
}) {
  return (
    <div>
      <SkeletonHeader />
      {showStats && <SkeletonStats count={statCount} />}
      <div style={{ display: "grid", gridTemplateColumns: panels === 1 ? "1fr" : "1fr 1fr", gap: 16 }}>
        {Array.from({ length: panels }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton w={160} h={16} style={{ marginBottom: 16 }} />
            <SkeletonRows count={rows} />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
