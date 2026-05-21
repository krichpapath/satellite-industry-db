import { PageSkeleton } from "@/components/skeleton";

export default function Loading() {
  return <PageSkeleton showStats statCount={3} panels={1} rows={8} />;
}
