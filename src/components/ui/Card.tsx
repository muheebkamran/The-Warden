import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  interactive?: boolean;
}

export function Card({
  className,
  children,
  animate = false,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[#18181B] border border-[#26262B] p-5 sm:p-6 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        interactive &&
          "cursor-pointer hover:border-[#FFFC00]/40 hover:-translate-y-0.5 hover:bg-[#1F1F23] hover:shadow-lg active:translate-y-0 active:scale-[0.99]",
        animate && "animate-card-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
