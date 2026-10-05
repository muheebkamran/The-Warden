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
    { name: "Today", href: "/dashboard", icon: Calendar },
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Money & Bills", href: "/finance", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-[260px] flex-col bg-[#0b0c0e] border-r border-[#292c32] transition-transform duration-300 z-40 flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="px-3 pb-2">
          <p className="font-mono text-[9px] font-semibold text-[#62646a] tracking-[0.2em] uppercase">
            NAVIGATION
          </p>
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex flex-row gap-3 items-center px-3.5 py-2.5 text-xs font-mono tracking-wider uppercase rounded-md transition-all duration-150 relative overflow-hidden",
                isActive
                  ? "text-[#f2f0ea] bg-[#1a1d22] border border-[#c8a96b]/40 font-medium"
                  : "text-[#9a9a96] hover:text-[#f2f0ea] hover:bg-[#131519] border border-transparent hover:border-[#292c32] hover:scale-[1.01] active:scale-[0.98]"
              )}
            >
              <Icon 
                size={16} 
                className={cn(
                  "transition-colors duration-150",
                  isActive ? "text-[#c8a96b]" : "text-[#9a9a96] group-hover:text-[#f2f0ea]"
                )} 
              />
              <span className="relative z-10 flex-1">{item.name}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#c8a96b]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#292c32]">
        <button
          onClick={() => logout()}
          className="flex w-full flex-row gap-3 items-center px-3.5 py-2.5 text-xs font-mono tracking-wider uppercase rounded-md text-[#9a9a96] hover:text-[#b56b6b] hover:bg-[#b56b6b]/10 border border-transparent hover:border-[#b56b6b]/30 transition-all duration-150 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
