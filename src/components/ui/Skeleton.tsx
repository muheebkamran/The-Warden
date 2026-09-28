import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-skeleton bg-[var(--bg-elevated)] rounded-[var(--radius-sm)] ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <Skeleton className={`w-full h-32 rounded-[var(--radius-md)] ${className}`} />
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <Skeleton className={`w-full h-4 ${className}`} />
  );
}
