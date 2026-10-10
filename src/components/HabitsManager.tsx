"use client";

import { useState, useTransition, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import CommitmentModal from "@/components/CommitmentModal";
import { updateCommitment, toggleCommitmentActive, deleteCommitment } from "@/app/actions";
import { Pencil, Trash2, Archive, ArchiveRestore, CheckSquare } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface HabitCommitment {
  id: string;
  title: string;
  targetValue: number;
  unit: string;
  type: string;
  isActive: boolean;
}

type HabitsManagerProps = {
  commitments: HabitCommitment[];
};

export default function HabitsManager({ commitments }: HabitsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<HabitCommitment | null>(null);
  const [deleteItem, setDeleteItem] = useState<HabitCommitment | null>(null);
  
  const listRef = useRef<HTMLDivElement>(null);

  const activeCommitments = commitments.filter(c => c.isActive);
  const archivedCommitments = commitments.filter(c => !c.isActive);

  useGSAP(() => {
    if (!listRef.current) return;
    const items = gsap.utils.toArray(listRef.current.querySelectorAll('.habit-row'));
    if (items.length === 0) return;
    
    gsap.fromTo(
      items,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
    );
  }, { dependencies: [activeCommitments.length, archivedCommitments.length], scope: listRef });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    
    const formData = new FormData();
    formData.append("commitmentId", editItem.id);
    formData.append("title", editItem.title);
    formData.append("targetValue", editItem.targetValue.toString());
    formData.append("unit", editItem.unit);

    startTransition(() => {
      updateCommitment(formData);
      setEditItem(null);
    });
  };

  const handleToggleActive = (id: string) => {
    startTransition(() => {
      toggleCommitmentActive(id);
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    startTransition(() => {
      deleteCommitment(deleteItem.id);
      setDeleteItem(null);
    });
  };

  const renderRow = (c: HabitCommitment) => (
    <Card key={c.id} className="habit-row flex justify-between items-center p-5 mb-3 group hover:border-[#c8a96b]/40 border-[#3a3244]">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <span className="font-sans font-medium text-sm text-[#f2f0ea]">{c.title}</span>
          <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest rounded-xs border border-[#292c32] bg-[#1a1d22] text-[#c8a96b]">
            {c.type}
          </span>
        </div>
        <div className="text-xs font-mono text-[#9a9a96]">
          Target: {c.targetValue} {c.unit}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <Button variant="ghost" size="icon" onClick={() => setEditItem(c)} disabled={isPending} aria-label="Edit commitment">
          <Pencil className="w-4 h-4 text-[#9a9a96] hover:text-[#f2f0ea]" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(c.id)} disabled={isPending} aria-label="Archive commitment">
          {c.isActive ? <Archive className="w-4 h-4 text-[#9a9a96] hover:text-[#f2f0ea]" /> : <ArchiveRestore className="w-4 h-4 text-[#9a9a96] hover:text-[#f2f0ea]" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setDeleteItem(c)} disabled={isPending} className="text-[#9a9a96] hover:text-[#b56b6b] hover:bg-[#b56b6b]/10" aria-label="Delete commitment">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto pb-20 animate-fade-in" ref={listRef}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#f2f0ea] tracking-tight">Habits Manager</h1>
          <p className="font-mono text-xs text-[#9a9a96] uppercase tracking-wider mt-1">Configure active commitment protocols</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          + Add Commitment
        </Button>
      </header>

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs font-semibold tracking-[0.2em] text-[#c8a96b] uppercase">Active Commitments</h2>
            <span className="font-mono text-[10px] text-[#9a9a96]">{activeCommitments.length} PROTOCOLS</span>
          </div>

          {activeCommitments.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No Active Protocols Configured"
              description="Your discipline fortress has no active commitments. Define a daily or weekly standard to enforce personal sovereignty."
              action={<Button variant="primary" onClick={() => setIsAddOpen(true)}>+ Add New Protocol</Button>}
              tip="Pro Tip: Choose concrete metrics like minutes, pages, or binary completion."
            />
          ) : (
            <div className="flex flex-col">
              {activeCommitments.map(renderRow)}
            </div>
          )}
        </div>

        {archivedCommitments.length > 0 && (
          <div className="opacity-75 pt-4">
            <h2 className="font-mono text-xs font-semibold tracking-[0.2em] text-[#62646a] uppercase mb-4">Archived Protocols</h2>
            <div className="flex flex-col">
              {archivedCommitments.map(renderRow)}
            </div>
          </div>
        )}
      </div>

      <CommitmentModal open={isAddOpen} onClose={() => setIsAddOpen(false)} activeCount={activeCommitments.length} />

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Commitment">
        {editItem && (
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
            <div>
              <Input 
                label="Title"
                value={editItem.title} 
                onChange={(e) => setEditItem({...editItem, title: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  label="Target Value"
                  type="number"
                  step="any"
                  value={editItem.targetValue} 
                  onChange={(e) => setEditItem({...editItem, targetValue: Number(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Input 
                  label="Unit"
                  value={editItem.unit} 
                  onChange={(e) => setEditItem({...editItem, unit: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setEditItem(null)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Commitment">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#9a9a96] leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-[#f2f0ea]">&quot;{deleteItem?.title}&quot;</strong>? All historical logs for this commitment will be purged from the ledger.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDeleteItem(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
