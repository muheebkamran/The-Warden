"use client";

import { useState, useTransition, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import CommitmentModal from "@/components/CommitmentModal";
import { updateCommitment, toggleCommitmentActive, deleteCommitment } from "@/app/actions";
import { Pencil, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type HabitsManagerProps = {
  commitments: any[];
};

export default function HabitsManager({ commitments }: HabitsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  
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
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
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

  const renderRow = (c: any) => (
    <Card key={c.id} className="habit-row flex justify-between items-center p-5 mb-3 group hover:border-stone/40">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <span className="font-medium text-sm text-ivory">{c.title}</span>
          <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded border border-border/60 bg-elevated text-stone font-semibold">
            {c.type}
          </span>
        </div>
        <div className="text-xs text-stone font-medium">
          Target: {c.targetValue} {c.unit}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <Button variant="ghost" size="icon" onClick={() => setEditItem(c)} disabled={isPending}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(c.id)} disabled={isPending}>
          {c.isActive ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setDeleteItem(c)} disabled={isPending} className="text-stone hover:text-error hover:bg-error/10">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto pb-20 animate-fade-in px-4 md:px-0 pt-4" ref={listRef}>
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ivory tracking-tight">Habits Manager</h1>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          + Add Commitment
        </Button>
      </header>

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-muted uppercase mb-4">Active Commitments</h2>
          {activeCommitments.length === 0 ? (
            <p className="text-sm text-muted italic bg-surface p-4 rounded-md border border-border/50">No active commitments.</p>
          ) : (
            <div className="flex flex-col">
              {activeCommitments.map(renderRow)}
            </div>
          )}
        </div>

        {archivedCommitments.length > 0 && (
          <div className="opacity-75">
            <h2 className="text-xs font-semibold tracking-wider text-muted uppercase mb-4 mt-4">Archived</h2>
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
            {editItem.type !== 'binary' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input 
                    label="Target Value"
                    type="number"
                    min="1"
                    value={editItem.targetValue} 
                    onChange={(e) => setEditItem({...editItem, targetValue: Number(e.target.value)})}
                    required 
                  />
                </div>
                <div className="flex-1">
                  <Input 
                    label="Unit"
                    value={editItem.unit} 
                    onChange={(e) => setEditItem({...editItem, unit: e.target.value})}
                    required 
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setEditItem(null)} disabled={isPending}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isPending}>Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Commitment">
        {deleteItem && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-ivory leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gold">{deleteItem.title}</span>?
            </p>
            <div className="bg-error/10 border border-error/20 p-3 rounded-sm">
              <span className="text-xs text-error font-medium">Warning: This action cannot be undone and will cascade to all daily records.</span>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <Button type="button" variant="ghost" onClick={() => setDeleteItem(null)} disabled={isPending}>Cancel</Button>
              <Button type="button" variant="danger" onClick={handleDelete} disabled={isPending}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
