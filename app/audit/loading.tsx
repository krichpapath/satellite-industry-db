import { Skeleton, SkeletonCard, SkeletonHeader, SkeletonRows } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonCard>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <Skeleton w={120} h={32} r={8} />
          <Skeleton w={120} h={32} r={8} />
          <Skeleton w={120} h={32} r={8} />
        </div>
        <SkeletonRows count={10} height={40} />
      </SkeletonCard>
    </div>
  );
}
