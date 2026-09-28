"use client";

import React, { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { updateUserSettings, exportUserData, resetStreakAction, deleteMyData } from '@/app/actions';

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
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {/* 1. ACCOUNT */}
      <section>
        <Card className="p-6 space-y-4">
          <h2 className="text-[var(--text-ivory)] font-medium mb-4">Account Settings</h2>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="your@email.com"
            />
            
            <div className="space-y-1">
              <label className="text-xs text-[var(--text-stone)] font-medium uppercase tracking-wider">
                Timezone
              </label>
              <select 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[var(--bg-obsidian)] border border-[var(--border-default)] text-[var(--text-ivory)] text-sm rounded-[var(--radius-sm)] px-3 py-2 focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
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
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Important note: Timezone affects your midnight streak evaluation.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[var(--text-stone)]">
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
      <section>
        <Card className="p-6">
          <h2 className="text-[var(--text-ivory)] font-medium mb-2">Export My History</h2>
          <p className="text-sm text-[var(--text-stone)] mb-4">
            Download all your commitments and daily records in JSON format.
          </p>
          <Button variant="secondary" onClick={handleExport} disabled={isPending}>
            Export Data
          </Button>
        </Card>
      </section>

      {/* 4. DANGER ZONE */}
      <section>
        <Card className="p-6 border-[var(--status-error)]">
          <h2 className="text-[var(--status-error)] font-medium mb-4">Danger Zone</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[var(--text-ivory)] font-medium">Reset Streak</div>
                <div className="text-xs text-[var(--text-stone)]">Reset your current streak to 0. Longest streak is preserved.</div>
              </div>
              <Button variant="secondary" onClick={() => setResetModalOpen(true)}>Reset</Button>
            </div>
            
            <div className="w-full h-px bg-[var(--border-default)]" />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[var(--text-ivory)] font-medium">Delete All Data</div>
                <div className="text-xs text-[var(--text-stone)]">Permanently erase all commitments and history.</div>
              </div>
              <Button variant="secondary" onClick={() => setDeleteModalOpen(true)}>Delete</Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Modals */}
      <Modal open={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset Streak">
        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--text-stone)]">
            This will reset your current streak to 0. Your longest streak record will be preserved. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleResetStreak} disabled={isPending}>Confirm Reset</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete All Data">
        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--status-error)]">
            Are you sure? This will delete all commitments and records permanently.
          </p>
          <Input 
            placeholder="Type DELETE to confirm" 
            value={deleteConfirmText} 
            onChange={(e) => setDeleteConfirmText(e.target.value)} 
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
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
