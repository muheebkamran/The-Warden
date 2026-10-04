"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Target, BarChart3, Settings, BookOpen, Wallet, LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { cn } from "@/lib/utils";

export default function BottomBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Today", href: "/dashboard", icon: Calendar },
    { name: "Habits", href: "/habits", icon: Target },
    { name: "Reading", href: "/reader", icon: BookOpen },
    { name: "Finance", href: "/finance", icon: Wallet },
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 w-full h-[64px] flex md:hidden bg-obsidian/95 backdrop-blur-md border-t border-border z-40 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex w-full items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 w-16 h-14 group"
            >
              {isActive && (
                <div className="absolute inset-0 top-1 bottom-1 bg-surface rounded-md -z-10 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]" />
              )}
              <Icon 
                size={22} 
                className={cn(
                  "transition-colors duration-300",
                  isActive ? "text-gold" : "text-stone group-hover:text-ivory"
                )} 
              />
              <span className={cn(
                "text-[9px] font-medium transition-colors duration-300",
                isActive ? "text-ivory" : "text-stone"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="relative flex flex-col items-center justify-center gap-1 w-16 h-14 group"
        >
          <LogOut size={22} className="text-stone group-hover:text-error transition-colors duration-300" />
          <span className="text-[9px] font-medium text-stone group-hover:text-error transition-colors duration-300">Logout</span>
        </button>
      </div>
    </nav>
  );
}
