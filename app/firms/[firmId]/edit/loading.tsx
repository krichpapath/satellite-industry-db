import { Skeleton, SkeletonCard, SkeletonHeader } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonCard>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <Skeleton w={100} h={11} style={{ marginBottom: 6 }} />
              <Skeleton h={36} r={8} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Skeleton w={120} h={36} r={8} />
          <Skeleton w={100} h={36} r={8} />
        </div>
      </SkeletonCard>
    </div>
  );
}
