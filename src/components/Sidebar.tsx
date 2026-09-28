"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Target, BarChart3, Settings, BookOpen, Wallet, LogOut } from "lucide-react";
import { logout } from "@/app/actions";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Today", href: "/", icon: Calendar },
    { name: "Habits", href: "/habits", icon: Target },
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const upcomingItems = [
    { name: "Reading", icon: BookOpen },
    { name: "Finance", icon: Wallet },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] hidden md:flex flex-col bg-[var(--bg-obsidian)] border-r border-[var(--border-default)]">
      <div className="px-6 pt-8 pb-6">
        <h1 className="font-serif text-lg tracking-[0.2em] uppercase text-[var(--text-ivory)]">
          The Warden
        </h1>
        <p className="font-sans text-[10px] text-[var(--text-stone)] tracking-wider uppercase mt-1">
          Keep Your Word
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-row gap-3 items-center px-4 py-2.5 text-xs font-medium rounded-[var(--radius-sm)] transition-colors relative ${
                isActive
                  ? "text-[var(--text-ivory)] bg-[var(--bg-elevated)]"
                  : "text-[var(--text-stone)] hover:text-[var(--text-ivory)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-[var(--accent-gold)] rounded-r-full" />
              )}
              <Icon size={16} />
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8 mb-4 px-4">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">
            Upcoming
          </p>
        </div>

        {upcomingItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="flex flex-row gap-3 items-center px-4 py-2.5 text-xs font-medium rounded-[var(--radius-sm)] text-[var(--text-muted)] opacity-60 pointer-events-none"
            >
              <Icon size={16} />
              <span className="flex-1">{item.name}</span>
              <span className="text-[9px] uppercase tracking-widest bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-default)]">
                Soon
              </span>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-default)]">
        <button
          onClick={() => logout()}
          className="flex w-full flex-row gap-3 items-center px-4 py-2.5 text-xs font-medium rounded-[var(--radius-sm)] text-[var(--text-stone)] hover:text-[var(--text-ivory)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
