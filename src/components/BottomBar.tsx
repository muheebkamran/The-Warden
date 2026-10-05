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
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Money", href: "/finance", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 w-full h-[64px] flex md:hidden bg-[#0b0c0e]/95 backdrop-blur-xl border-t border-[#292c32] z-40 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex w-full items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 w-14 h-14 group transition-transform active:scale-95"
            >
              {isActive && (
                <div className="absolute inset-0 top-1.5 bottom-1.5 bg-[#1a1d22] border border-[#c8a96b]/30 rounded-md -z-10" />
              )}
              <Icon 
                size={18} 
                className={cn(
                  "transition-colors duration-150",
                  isActive ? "text-[#c8a96b]" : "text-[#9a9a96] group-hover:text-[#f2f0ea]"
                )} 
              />
              <span className={cn(
                "text-[8px] font-mono tracking-wider uppercase transition-colors duration-150",
                isActive ? "text-[#f2f0ea] font-medium" : "text-[#9a9a96]"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="relative flex flex-col items-center justify-center gap-1 w-14 h-14 group transition-transform active:scale-95 cursor-pointer"
          aria-label="Logout"
        >
          <LogOut size={18} className="text-[#9a9a96] group-hover:text-[#b56b6b] transition-colors duration-150" />
          <span className="text-[8px] font-mono tracking-wider uppercase text-[#9a9a96] group-hover:text-[#b56b6b] transition-colors duration-150">Log Out</span>
        </button>
      </div>
    </nav>
  );
}
