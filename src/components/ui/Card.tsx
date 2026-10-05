import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function Card({ className, children, animate = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-[#131519]/90 border border-[#3a3244] p-5 sm:p-6 shadow-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#c8a96b]/60 hover:-translate-y-2 hover:bg-[#1a1d22]",
        animate && "animate-card-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
