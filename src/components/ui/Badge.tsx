import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: "complete" | "showed_up" | "missed" | "grace";
}

export function Badge({ variant, className = "", children, ...props }: BadgeProps) {
  const variants = {
    complete: "bg-[var(--status-success)]/15 text-[var(--status-success)]",
    showed_up: "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]",
    missed: "bg-[var(--status-error)]/15 text-[var(--status-error)]",
    grace: "bg-[var(--status-warning)]/15 text-[var(--status-warning)]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
