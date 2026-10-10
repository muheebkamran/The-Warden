"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  TrendingUp, 
  Wallet, 
  Settings, 
  LogOut,
  Lock
} from "lucide-react";
import { logout } from "@/app/actions";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
}

export default function Sidebar({ isOpen = true }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Habits", href: "/habits", icon: CheckSquare },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "Finance", href: "/finance", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-[270px] flex-col bg-[#141416] border-r border-[#26262B] transition-transform duration-300 z-40 flex select-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Emblem Subheader */}
      <div className="p-4 flex items-center gap-3 border-b border-[#24242A]">
        <div className="w-10 h-10 rounded-2xl bg-black border border-[#2E2E34] overflow-hidden flex items-center justify-center shadow-lg shadow-[#FFFC00]/20 select-none shrink-0">
          <img src="/logo.png" alt="The Warden" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm tracking-wide text-white leading-none">THE WARDEN</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FFFC00] mt-1 font-bold">
            DISCIPLINE &amp; CAPITAL
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 pt-4 pb-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
            Telemetry &amp; Control
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
                "group flex items-center gap-3.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 relative",
                isActive
                  ? "bg-[#1C1C20] text-[#FFFC00] border-l-[3px] border-[#FFFC00] shadow-sm font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-[#1A1A1E] active:scale-[0.98]"
              )}
            >
              <Icon 
                size={18} 
                className={cn(
                  "transition-colors duration-150 shrink-0",
                  isActive ? "text-[#FFFC00]" : "text-zinc-500 group-hover:text-white"
                )} 
              />
              <span className={cn(
                "flex-1 tracking-wide",
                isActive ? "text-white font-bold" : "font-medium"
              )}>
                {item.name}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFFC00] animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ─── Operator & Status Footer (Matching Reference Screenshots) ────── */}
      <div className="flex flex-col border-t border-[#24242A] bg-[#101012]">
        {/* Status Pill Strip */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#202024]">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 bg-[#FFFC00]/10 text-[#FFFC00] border border-[#FFFC00]/30 rounded-full font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFFC00] animate-pulse" />
            SOVEREIGN NODE
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#00D664]">
            <span>● ARMED</span>
          </div>
        </div>

        {/* Operator Profile Card */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-xs text-[#FFFC00]">
                  OP
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00D664] border-2 border-[#101012] rounded-full" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-white truncate">Sovereign Operator</span>
              <span className="font-mono text-[9px] text-[#FFFC00] font-bold uppercase tracking-wider truncate">
                Discipline Vault
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-zinc-500 hover:text-[#FF2D55] transition-colors p-1.5 rounded-lg hover:bg-zinc-800 cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
