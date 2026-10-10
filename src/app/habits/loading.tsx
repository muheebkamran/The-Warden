import { AccessibleSkeletonWrapper, HabitRowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function HabitsLoading() {
  return (
    <AccessibleSkeletonWrapper announcement="Loading your habits fortress...">
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44 rounded-xl bg-[#2A2A30]" />
            <Skeleton className="h-4 w-60 rounded-md bg-[#202024]" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl bg-[#26262B]" />
        </div>

        <div className="space-y-3">
          <HabitRowSkeleton />
          <HabitRowSkeleton />
          <HabitRowSkeleton />
          <HabitRowSkeleton />
        </div>
      </div>
    </AccessibleSkeletonWrapper>
  );
}
