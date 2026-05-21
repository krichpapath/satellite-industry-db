import { Skeleton, SkeletonCard, SkeletonHeader, SkeletonRows } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonCard style={{ marginBottom: 16 }}>
        <Skeleton h={40} r={10} style={{ marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} w={100} h={28} r={999} />
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <SkeletonRows count={7} height={48} />
      </SkeletonCard>
    </div>
  );
}
