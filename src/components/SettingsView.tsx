"use client";

import React, { useState, useTransition, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { updateUserSettings, exportUserData, resetStreakAction, deleteMyData } from '@/app/actions';
import { cn } from '@/lib/utils';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface User {
  id: string;
  email?: string | null;
  timezone?: string | null;
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
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto pt-4 px-4 md:px-0 pb-20" ref={containerRef}>
      <header className="settings-section mb-6">
        <h1 className="font-serif text-3xl text-ivory tracking-tight">Settings</h1>
      </header>

      {/* 1. ACCOUNT */}
      <section className="settings-section">
        <Card className="p-6 md:p-8 space-y-6">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Account Configuration</h2>
          <form onSubmit={handleSaveAccount} className="space-y-6">
            <Input 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="your@email.com"
            />
            
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs text-stone font-medium">
                Timezone
              </label>
              <select 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-surface border border-border text-ivory text-sm rounded-sm px-3 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-200 hover:border-stone/50 hover:bg-elevated"
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
              <p className="text-xs text-muted mt-1 font-medium">
                Important note: Timezone affects your midnight streak evaluation.
              </p>
            </div>

            <div className="pt-4 mt-2 border-t border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <span className="text-xs text-stone font-medium">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* 3. DATA EXPORT */}
      <section className="settings-section">
        <Card className="p-6 md:p-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Export My History</h2>
          <p className="text-sm text-stone mb-5 leading-relaxed">
            Download all your commitments and daily records in JSON format for backup or external analysis.
          </p>
          <Button variant="secondary" onClick={handleExport} disabled={isPending}>
            Export Data
          </Button>
        </Card>
      </section>

      {/* 4. DANGER ZONE */}
      <section className="settings-section">
        <Card className="p-6 md:p-8 border-error/30 bg-error/5">
          <h2 className="text-sm font-semibold text-error uppercase tracking-wider mb-6">Danger Zone</h2>
          
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-ivory font-semibold mb-1">Reset Streak</div>
                <div className="text-xs text-stone/80 font-medium">Reset your current streak to 0. Longest streak is preserved.</div>
              </div>
              <Button variant="secondary" onClick={() => setResetModalOpen(true)}>Reset Streak</Button>
            </div>
            
            <div className="w-full h-px bg-border/50" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-ivory font-semibold mb-1">Delete All Data</div>
                <div className="text-xs text-stone/80 font-medium">Permanently erase all commitments and history.</div>
              </div>
              <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>Delete Data</Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Modals */}
      <Modal open={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset Streak">
        <div className="p-2 space-y-5">
          <p className="text-sm text-stone leading-relaxed">
            This will reset your current streak to 0. Your longest streak record will be preserved. This cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
            <Button variant="ghost" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleResetStreak} disabled={isPending}>Confirm Reset</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete All Data">
        <div className="p-2 space-y-5">
          <p className="text-sm text-error font-medium leading-relaxed bg-error/10 border border-error/20 p-3 rounded-sm">
            Are you sure? This will delete all commitments and records permanently. This action is irreversible.
          </p>
          <Input 
            label="Type DELETE to confirm"
            placeholder="DELETE" 
            value={deleteConfirmText} 
            onChange={(e) => setDeleteConfirmText(e.target.value)} 
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteData} 
              disabled={deleteConfirmText !== 'DELETE' || isPending}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
