import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function Card({ className, children, animate = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-surface border border-border/60 p-5 shadow-sm transition-all duration-300",
        animate && "animate-card-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
