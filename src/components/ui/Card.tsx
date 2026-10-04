import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function Card({ className, children, animate = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-[#131519]/90 border border-[#3a3244] p-5 sm:p-6 shadow-none transition-all duration-200",
        animate && "animate-card-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
