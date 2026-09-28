import React from "react";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && <Icon className="w-12 h-12 text-[var(--text-muted)] mb-4" />}
      <h3 className="font-serif text-2xl text-[var(--text-ivory)] mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-[var(--text-stone)] max-w-md mx-auto mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
