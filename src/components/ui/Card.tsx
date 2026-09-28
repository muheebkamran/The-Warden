import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function Card({ className = "", children, animate = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-default)] p-5 shadow-none ${animate ? "animate-card-in" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
