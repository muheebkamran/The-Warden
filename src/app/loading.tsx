import React from "react";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#0E0E10] flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#222227]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
            <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
        </div>
        <DashboardSkeleton />
      </div>
    </div>
  );
}
