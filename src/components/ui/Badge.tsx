import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: "complete" | "showed_up" | "missed" | "grace";
}

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  const variants = {
    complete: "bg-[#7fa889]/15 text-[#7fa889] border border-[#7fa889]/30",
    showed_up: "bg-[#c8a96b]/15 text-[#c8a96b] border border-[#c8a96b]/30",
    missed: "bg-[#b56b6b]/15 text-[#b56b6b] border border-[#b56b6b]/30",
    grace: "bg-[#c99a54]/15 text-[#c99a54] border border-[#c99a54]/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-xs font-mono text-[9px] font-semibold uppercase tracking-widest",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
