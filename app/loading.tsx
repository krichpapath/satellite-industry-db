import { Skeleton, SkeletonCard, SkeletonStats, SkeletonBars, SkeletonHeader } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonCard padding={22} style={{ marginBottom: 20, background: "linear-gradient(120deg, var(--primary), var(--primary-strong))", border: "none" }}>
        <Skeleton w={220} h={14} style={{ marginBottom: 12, opacity: 0.4 }} />
        <Skeleton w={360} h={22} style={{ opacity: 0.4 }} />
      </SkeletonCard>
      <SkeletonStats count={4} />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <SkeletonCard>
          <Skeleton w={180} h={16} style={{ marginBottom: 16 }} />
          <SkeletonBars count={5} />
        </SkeletonCard>
        <SkeletonCard>
          <Skeleton w={140} h={16} style={{ marginBottom: 16 }} />
          <Skeleton h={220} r={10} />
        </SkeletonCard>
      </div>
      <SkeletonCard>
        <Skeleton w={200} h={16} style={{ marginBottom: 16 }} />
        <SkeletonBars count={6} />
      </SkeletonCard>
    </div>
  );
}
