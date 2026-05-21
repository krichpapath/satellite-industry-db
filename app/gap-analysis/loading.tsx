import { Skeleton, SkeletonCard, SkeletonHeader } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonCard style={{ marginBottom: 16 }}>
        <Skeleton w={200} h={16} style={{ marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <Skeleton key={i} h={48} r={8} />
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <Skeleton w={220} h={16} style={{ marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} h={60} r={8} />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
