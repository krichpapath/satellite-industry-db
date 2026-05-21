import { Skeleton, SkeletonCard, SkeletonHeader, SkeletonRows } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <SkeletonCard>
          <Skeleton w={160} h={16} style={{ marginBottom: 16 }} />
          <Skeleton h={480} r={10} />
        </SkeletonCard>
        <SkeletonCard>
          <Skeleton w={140} h={16} style={{ marginBottom: 16 }} />
          <SkeletonRows count={6} height={40} />
        </SkeletonCard>
      </div>
    </div>
  );
}
