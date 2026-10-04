"use client";

import React, { useState, useTransition, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { updateUserSettings, exportUserData, resetStreakAction, deleteMyData } from '@/app/actions';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { AvatarUpload } from '@/components/settings/AvatarUpload';
import { cn } from '@/lib/utils';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface User {
  id: string;
  email?: string | null;
  timezone?: string | null;
  preferredTheme?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
}

interface SettingsViewProps {
  user: User;
  streakState: StreakState | null;
}

export function SettingsView({ user, streakState }: SettingsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(user.email || '');
  const [timezone, setTimezone] = useState(user.timezone || 'UTC');

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const sections = gsap.utils.toArray(containerRef.current.querySelectorAll('.settings-section'));
    if (sections.length === 0) return;
    
    gsap.fromTo(
      sections,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
    );
  }, { scope: containerRef });

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('timezone', timezone);
    startTransition(() => {
      updateUserSettings(formData);
    });
  };

  const handleExport = () => {
    startTransition(async () => {
      const data = await exportUserData();
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'warden_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleResetStreak = () => {
    startTransition(() => {
      resetStreakAction();
      setResetModalOpen(false);
    });
  };

  const handleDeleteData = () => {
    if (deleteConfirmText === 'DELETE') {
      startTransition(() => {
        deleteMyData();
        setDeleteModalOpen(false);
        setDeleteConfirmText('');
      });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-2xl mx-auto pb-20" ref={containerRef}>
      <header className="settings-section">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#f2f0ea] tracking-tight">System Settings</h1>
        <p className="font-mono text-xs text-[#9a9a96] uppercase tracking-wider mt-1">Ledger identity &amp; atmosphere controls</p>
      </header>

      {/* 1. ACCOUNT */}
      <section className="settings-section">
        <Card className="p-6 md:p-8 space-y-6 border-[#3a3244]">
          <div className="flex items-center justify-between pb-3 border-b border-[#292c32]">
            <h2 className="font-mono text-xs font-semibold text-[#c8a96b] uppercase tracking-[0.2em]">Account Configuration</h2>
            <span className="font-mono text-[10px] text-[#9a9a96]">AUTH PROTOCOL</span>
          </div>
          
          <div className="pb-2 border-b border-[#292c32]">
            <AvatarUpload currentAvatarUrl={user.avatarUrl} />
          </div>

          <form onSubmit={handleSaveAccount} className="space-y-6">
            <Input 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="your@email.com"
            />
            
            <div className="space-y-1.5 flex flex-col">
              <label className="font-mono text-[11px] uppercase tracking-wider text-[#9a9a96]">
                Operational Timezone
              </label>
              <select 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#0b0c0e] border border-[#292c32] text-[#f2f0ea] text-sm rounded-md px-3.5 py-2.5 focus:outline-none focus:border-[#c8a96b] focus:ring-2 focus:ring-[#c8a96b]/20 transition-all duration-150 hover:border-[#3a3244]"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Denver">America/Denver</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Asia/Karachi">Asia/Karachi</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
                <option value="Pacific/Auckland">Pacific/Auckland</option>
              </select>
              <p className="font-mono text-[10px] text-[#62646a] mt-1">
                Note: Evaluates daily 70% threshold locks at local midnight.
              </p>
            </div>

            <div className="pt-4 border-t border-[#292c32] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="font-mono text-xs text-[#9a9a96]">
                Enlisted on {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* 2. APPEARANCE & THEMES */}
      <section className="settings-section">
        <Card className="p-6 md:p-8 space-y-6 border-[#3a3244]">
          <div className="pb-3 border-b border-[#292c32]">
            <h2 className="font-mono text-xs font-semibold text-[#c8a96b] uppercase tracking-[0.2em]">
              Atmosphere &amp; Palette
            </h2>
            <p className="font-mono text-xs text-[#9a9a96] mt-1">
              Select your environmental theme preset.
            </p>
          </div>
          <ThemeSelector initialTheme={user.preferredTheme || 'midnight-galaxy'} />
        </Card>
      </section>

      {/* 3. DATA EXPORT */}
      <section className="settings-section">
        <Card className="p-6 md:p-8 border-[#3a3244]">
          <div className="pb-3 border-b border-[#292c32] mb-4">
            <h2 className="font-mono text-xs font-semibold text-[#c8a96b] uppercase tracking-[0.2em]">Ledger Export</h2>
          </div>
          <p className="text-sm text-[#9a9a96] mb-6 leading-relaxed">
            Download your complete discipline history, commitments, and daily check-ins as an encrypted JSON ledger archive.
          </p>
          <Button variant="secondary" onClick={handleExport} disabled={isPending}>
            Export JSON Archive
          </Button>
        </Card>
      </section>

      {/* 4. DANGER ZONE */}
      <section className="settings-section">
        <Card className="p-6 md:p-8 border-[#b56b6b]/40 bg-[#b56b6b]/5">
          <h2 className="font-mono text-xs font-semibold text-[#b56b6b] uppercase tracking-[0.2em] mb-6">Danger Protocol</h2>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-[#f2f0ea] font-medium mb-1">Reset Streak</div>
                <div className="font-mono text-xs text-[#9a9a96]">Reset active streak counter to 0. Longest streak preserved.</div>
              </div>
              <Button variant="secondary" onClick={() => setResetModalOpen(true)}>Reset Streak</Button>
            </div>
            
            <div className="w-full h-px bg-[#b56b6b]/20" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-[#f2f0ea] font-medium mb-1">Purge Account Ledger</div>
                <div className="font-mono text-xs text-[#9a9a96]">Permanently delete all commitments, records, and history.</div>
              </div>
              <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>Purge All Data</Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Modals */}
      <Modal open={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset Streak Counter">
        <div className="space-y-5">
          <p className="text-sm text-[#9a9a96] leading-relaxed">
            This will reset your current streak to 0. Your longest streak record will be preserved. This action cannot be reversed.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#292c32]">
            <Button variant="ghost" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleResetStreak} disabled={isPending}>Confirm Reset</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Purge All Data">
        <div className="space-y-5">
          <div className="text-xs font-mono text-[#b56b6b] leading-relaxed bg-[#b56b6b]/10 border border-[#b56b6b]/30 p-3 rounded-md">
            WARNING: This permanently purges your entire ledger. All commitments and daily records will be destroyed.
          </div>
          <Input 
            label="Type DELETE to confirm"
            placeholder="DELETE" 
            value={deleteConfirmText} 
            onChange={(e) => setDeleteConfirmText(e.target.value)} 
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-[#292c32]">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteData} 
              disabled={deleteConfirmText !== 'DELETE' || isPending}
            >
              Permanently Purge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
