import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: "complete" | "showed_up" | "missed" | "grace";
}

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  const variants = {
    complete: "bg-success/15 text-success border border-success/30",
    showed_up: "bg-gold/15 text-gold border border-gold/30",
    missed: "bg-error/15 text-error border border-error/30",
    grace: "bg-warning/15 text-warning border border-warning/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
