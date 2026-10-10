"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Base shimmer element representing a single loading placeholder block.
 * Decorated with aria-hidden="true" so screen readers skip raw placeholder blocks.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-[#202024] rounded-xl overflow-hidden relative",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Accessible wrapper that announces loading status to assistive technologies
 * while shielding them from repetitive decorative skeleton nodes.
 */
export function AccessibleSkeletonWrapper({
  children,
  announcement = "Loading content...",
  className,
}: {
  children: React.ReactNode;
  announcement?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn("w-full", className)}
    >
      <span className="sr-only">{announcement}</span>
      {children}
    </div>
  );
}

/**
 * Skeleton matching the exact geometry of metric & stats cards.
 */
export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-5 sm:p-6 rounded-2xl bg-[#18181B] border border-[#26262B] flex flex-col justify-between min-h-[140px] shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded-md bg-[#26262B]" />
        <Skeleton className="h-7 w-7 rounded-lg bg-[#26262B]" />
      </div>
      <div className="space-y-2 mt-4">
        <Skeleton className="h-7 w-36 rounded-lg bg-[#2A2A30]" />
        <Skeleton className="h-3 w-48 rounded-md bg-[#202024]" />
      </div>
    </div>
  );
}

/**
 * Skeleton matching the exact geometry of a CommitmentCard / Habit item.
 */
export function HabitRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-[#18181B] border border-[#26262B] flex items-center justify-between gap-4 shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-44 rounded-md bg-[#2A2A30]" />
        <Skeleton className="h-3 w-28 rounded-md bg-[#202024]" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-20 rounded-full bg-[#202024]" />
        <Skeleton className="w-8 h-8 rounded-xl bg-[#26262B]" />
      </div>
    </div>
  );
}

/**
 * Skeleton matching table / ledger rows.
 */
export function TableRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3.5 px-4 border-b border-[#26262B]/60",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-xl bg-[#26262B]" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32 rounded-md bg-[#2A2A30]" />
          <Skeleton className="h-2.5 w-20 rounded-md bg-[#202024]" />
        </div>
      </div>
      <Skeleton className="h-4 w-16 rounded-md bg-[#26262B]" />
    </div>
  );
}

/**
 * Skeleton matching chart cards.
 */
export function ChartSkeleton({ className, height = "h-[280px]" }: { className?: string; height?: string }) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl bg-[#18181B] border border-[#26262B] flex flex-col justify-between shadow-sm",
        height,
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-36 rounded-md bg-[#26262B]" />
        <Skeleton className="h-6 w-20 rounded-full bg-[#202024]" />
      </div>
      <div className="flex-1 flex items-end gap-3 pt-6 pb-2 px-2">
        <Skeleton className="h-[45%] flex-1 rounded-t-lg bg-[#24242A]" />
        <Skeleton className="h-[70%] flex-1 rounded-t-lg bg-[#282830]" />
        <Skeleton className="h-[55%] flex-1 rounded-t-lg bg-[#24242A]" />
        <Skeleton className="h-[90%] flex-1 rounded-t-lg bg-[#2C2C36]" />
        <Skeleton className="h-[65%] flex-1 rounded-t-lg bg-[#282830]" />
        <Skeleton className="h-[80%] flex-1 rounded-t-lg bg-[#2A2A32]" />
        <Skeleton className="h-[100%] flex-1 rounded-t-lg bg-[#FFFC00]/20" />
      </div>
    </div>
  );
}

/**
 * Composite layout skeleton for the Today Dashboard screen.
 */
export function DashboardSkeleton() {
  return (
    <AccessibleSkeletonWrapper announcement="Loading your daily fortress dashboard...">
      <div className="space-y-8 animate-fade-in">
        {/* Header telemetry skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-xl bg-[#2A2A30]" />
            <Skeleton className="h-4 w-40 rounded-md bg-[#202024]" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-28 rounded-full bg-[#202024]" />
            <Skeleton className="h-9 w-36 rounded-xl bg-[#26262B]" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>

        {/* Habit commitments list skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded-md bg-[#26262B]" />
            <Skeleton className="h-4 w-16 rounded-md bg-[#202024]" />
          </div>
          <HabitRowSkeleton />
          <HabitRowSkeleton />
          <HabitRowSkeleton />
        </div>
      </div>
    </AccessibleSkeletonWrapper>
  );
}

/**
 * Composite layout skeleton for the Finance screen.
 */
export function FinanceSkeleton() {
  return (
    <AccessibleSkeletonWrapper announcement="Loading your financial fortress...">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl bg-[#2A2A30]" />
            <Skeleton className="h-4 w-64 rounded-md bg-[#202024]" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl bg-[#26262B]" />
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>

        {/* Chart & Ledger Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height="h-[340px]" />
          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#26262B] space-y-3">
            <Skeleton className="h-5 w-40 rounded-md bg-[#2A2A30] mb-4" />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        </div>
      </div>
    </AccessibleSkeletonWrapper>
  );
}

/**
 * Composite layout skeleton for the Progress screen.
 */
export function ProgressSkeleton() {
  return (
    <AccessibleSkeletonWrapper announcement="Loading consistency progress...">
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44 rounded-xl bg-[#2A2A30]" />
          <Skeleton className="h-4 w-52 rounded-md bg-[#202024]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartSkeleton height="h-[320px]" />
          <ChartSkeleton height="h-[320px]" />
        </div>

        {/* Heatmap skeleton */}
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#26262B] space-y-4">
          <Skeleton className="h-5 w-36 rounded-md bg-[#2A2A30]" />
          <Skeleton className="h-40 w-full rounded-xl bg-[#202024]" />
        </div>
      </div>
    </AccessibleSkeletonWrapper>
  );
}
