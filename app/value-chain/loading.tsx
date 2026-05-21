import { Skeleton, SkeletonCard, SkeletonHeader } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonCard style={{ marginBottom: 16 }}>
        <Skeleton w={200} h={16} style={{ marginBottom: 18 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton w={120} h={13} style={{ marginBottom: 10 }} />
              <Skeleton h={120} r={10} />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <Skeleton w={180} h={16} style={{ marginBottom: 14 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} h={52} r={10} />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
