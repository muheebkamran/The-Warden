"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Target, BarChart3, Settings, LogOut } from "lucide-react";
import { logout } from "@/app/actions";

export default function BottomBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Today", href: "/", icon: Calendar },
    { name: "Habits", href: "/habits", icon: Target },
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 w-full h-[64px] flex md:hidden bg-[var(--bg-obsidian)] border-t border-[var(--border-default)] z-40 px-2">
      <div className="flex w-full items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
                isActive
                  ? "text-[var(--text-ivory)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <Icon 
                size={20} 
                className={isActive ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]"} 
              />
              <span className="text-[10px] font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors text-[var(--text-muted)]"
        >
          <LogOut size={20} className="text-[var(--text-muted)]" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
