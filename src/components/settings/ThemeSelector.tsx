"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { THEMES, ThemeDefinition, applyTheme } from '@/lib/themeEngine';
import { saveUserTheme } from '@/app/actions';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  initialTheme?: string;
}

export function ThemeSelector({ initialTheme = 'midnight-galaxy' }: ThemeSelectorProps) {
  const [activeTheme, setActiveTheme] = useState(initialTheme);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Check localStorage on mount in case client has a more recent choice
    try {
      const stored = localStorage.getItem('warden-theme');
      if (stored && stored !== activeTheme) {
        setActiveTheme(stored);
        applyTheme(stored);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const handleSelectTheme = (theme: ThemeDefinition) => {
    setActiveTheme(theme.id);
    applyTheme(theme.id);

    startTransition(async () => {
      try {
        await saveUserTheme(theme.id);
      } catch (err) {
        console.error('Failed to persist theme:', err);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone">
          Curated aesthetics from <span className="text-gold font-medium">Theme Factory</span>.
          Changes apply instantly across all pages and charts.
        </p>
        {isPending && (
          <span className="text-[11px] text-gold animate-pulse flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Saving...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {THEMES.map((theme) => {
          const isSelected = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelectTheme(theme)}
              className={cn(
                "group relative text-left p-4 rounded-md border transition-all duration-300 flex flex-col justify-between gap-3",
                isSelected
                  ? "border-gold bg-elevated shadow-[0_0_15px_rgba(200,169,107,0.12)] ring-1 ring-gold"
                  : "border-border/60 bg-surface hover:border-stone/50 hover:bg-elevated/70"
              )}
            >
              <div className="flex items-start justify-between w-full">
                <div>
                  <div className="text-sm font-serif font-semibold text-ivory tracking-wide flex items-center gap-2">
                    {theme.name}
                    {isSelected && (
                      <span className="text-[10px] uppercase font-sans font-bold px-1.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone mt-1 line-clamp-1">
                    {theme.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-obsidian shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* 4-Color Swatch Preview Bar */}
              <div className="flex items-center gap-1.5 pt-1">
                <span
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: theme.baseColor }}
                  title="Base Background"
                />
                <span
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: theme.primaryAccent }}
                  title="Primary Accent"
                />
                <span
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: theme.secondaryAccent }}
                  title="Secondary Accent"
                />
                <span
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: theme.textColor }}
                  title="Highlight Text"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
