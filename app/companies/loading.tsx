import { Skeleton, SkeletonCard, SkeletonHeader, SkeletonRows } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Skeleton h={36} w="60%" r={8} />
        <Skeleton h={36} w={140} r={8} />
        <Skeleton h={36} w={140} r={8} />
      </div>
      <SkeletonCard>
        <SkeletonRows count={8} height={56} />
      </SkeletonCard>
    </div>
  );
}
