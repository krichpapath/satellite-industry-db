import { Skeleton, SkeletonCard, SkeletonRows } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonCard style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <Skeleton w={64} h={64} r={12} />
          <div style={{ flex: 1 }}>
            <Skeleton w={280} h={24} style={{ marginBottom: 8 }} />
            <Skeleton w={180} h={14} />
          </div>
          <Skeleton w={100} h={34} r={8} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton w="60%" h={11} style={{ marginBottom: 6 }} />
              <Skeleton w="80%" h={16} />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton w={140} h={16} style={{ marginBottom: 14 }} />
            <SkeletonRows count={4} height={36} />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
