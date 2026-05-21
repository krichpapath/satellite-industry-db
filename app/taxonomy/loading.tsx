import { Skeleton, SkeletonCard, SkeletonHeader } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton w={160} h={16} style={{ marginBottom: 14 }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Array.from({ length: 8 }).map((_, j) => (
                <Skeleton key={j} w={70 + (j % 3) * 20} h={26} r={999} />
              ))}
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
