"use client";

import React from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageOpen } from "lucide-react";

export default function DemoPage() {
  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto space-y-12">
        <div>
          <h2 className="font-serif text-3xl text-[var(--text-ivory)] mb-6 border-b border-[var(--border-default)] pb-2">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-stone)]">Primary</p>
              <Button variant="primary" size="md">Keep Word</Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-stone)]">Secondary</p>
              <Button variant="secondary" size="md">Cancel</Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-stone)]">Ghost</p>
              <Button variant="ghost" size="md">Edit</Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-stone)]">Sizes</p>
              <div className="flex items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-stone)]">Disabled</p>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-3xl text-[var(--text-ivory)] mb-6 border-b border-[var(--border-default)] pb-2">
            Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-[var(--text-ivory)] font-medium mb-2">Standard Card</h3>
              <p className="text-[var(--text-stone)] text-sm">
                This is a standard card container with no hover effects and clean padding.
              </p>
            </Card>
            <Card animate>
              <h3 className="text-[var(--text-ivory)] font-medium mb-2">Animated Card</h3>
              <p className="text-[var(--text-stone)] text-sm">
                This card has the animate prop set to true, triggering animate-card-in.
              </p>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-3xl text-[var(--text-ivory)] mb-6 border-b border-[var(--border-default)] pb-2">
            Badges
          </h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="complete">Complete</Badge>
            <Badge variant="showed_up">Showed Up</Badge>
            <Badge variant="missed">Missed</Badge>
            <Badge variant="grace">Grace</Badge>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-3xl text-[var(--text-ivory)] mb-6 border-b border-[var(--border-default)] pb-2">
            Inputs
          </h2>
          <div className="max-w-sm space-y-4">
            <Input label="Commitment Title" placeholder="e.g. Read 10 pages" />
            <Input label="Target Value" type="number" placeholder="0" />
            <Input label="Disabled Input" disabled placeholder="Cannot type here" />
          </div>
        </div>

        <div>
          <h2 className="font-serif text-3xl text-[var(--text-ivory)] mb-6 border-b border-[var(--border-default)] pb-2">
            Empty State
          </h2>
          <Card>
            <EmptyState 
              title="No Commitments Yet" 
              description="You haven't made any commitments. It's time to set your first goal and keep your word."
              icon={PackageOpen}
              action={<Button variant="primary">Create Commitment</Button>}
            />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
