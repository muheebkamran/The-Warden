import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-skeleton bg-elevated rounded-sm", className)}
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("w-full h-32 rounded-md", className)} />
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("w-full h-4", className)} />
  );
}
