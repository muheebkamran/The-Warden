"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Target, BarChart3, Settings, BookOpen, Wallet, LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
}

export default function Sidebar({ isOpen = true }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Today", href: "/", icon: Calendar },
    { name: "Habits", href: "/habits", icon: Target },
    { name: "Reading Room", href: "/reader", icon: BookOpen },
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const upcomingItems = [
    { name: "Finance", icon: Wallet },
  ];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-14 md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-[260px] flex-col bg-obsidian border-r border-border transition-transform duration-300 z-50 flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex flex-row gap-3 items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "text-ivory bg-elevated shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
                  : "text-stone hover:text-ivory hover:bg-surface"
              )}
            >
              <Icon 
                size={18} 
                className={cn(
                  "transition-colors duration-300",
                  isActive ? "text-gold" : "text-stone group-hover:text-ivory"
                )} 
              />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}

        <div className="mt-8 mb-4 px-3">
          <p className="text-[10px] font-semibold text-muted tracking-wider uppercase">
            Upcoming
          </p>
        </div>

        {upcomingItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="flex flex-row gap-3 items-center px-3 py-2.5 text-sm font-medium rounded-md text-muted opacity-50 pointer-events-none"
            >
              <Icon size={18} />
              <span className="flex-1">{item.name}</span>
              <span className="text-[9px] uppercase tracking-widest bg-surface px-1.5 py-0.5 rounded border border-border/50">
                Soon
              </span>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => logout()}
          className="flex w-full flex-row gap-3 items-center px-3 py-2.5 text-sm font-medium rounded-md text-stone hover:text-error hover:bg-error/10 transition-colors duration-300"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
