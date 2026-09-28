"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import CommitmentModal from "@/components/CommitmentModal";
import { updateCommitment, toggleCommitmentActive, deleteCommitment } from "@/app/actions";
import { Pencil, Trash2, Archive, ArchiveRestore } from "lucide-react";

type HabitsManagerProps = {
  commitments: any[];
};

export default function HabitsManager({ commitments }: HabitsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);

  const activeCommitments = commitments.filter(c => c.isActive);
  const archivedCommitments = commitments.filter(c => !c.isActive);

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
    <Card key={c.id} className="flex justify-between items-center p-4 mb-2 bg-[var(--bg-surface)] border-[var(--border-default)]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--text-ivory)]">{c.title}</span>
          <span className="px-2 py-0.5 text-[10px] uppercase rounded border border-[var(--border-default)] text-[var(--text-stone)]">
            {c.type}
          </span>
        </div>
        <div className="text-xs text-[var(--text-stone)]">
          Target: {c.targetValue} {c.unit}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEditItem(c)} disabled={isPending}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(c.id)} disabled={isPending}>
          {c.isActive ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteItem(c)} disabled={isPending} className="text-[var(--status-error)] hover:text-red-400">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto pb-20 animate-fade-in">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          + Add Commitment
        </Button>
      </div>

      <div>
        <h2 className="text-sm font-medium text-[var(--text-stone)] mb-4">ACTIVE</h2>
        {activeCommitments.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic">No active commitments.</p>
        ) : (
          activeCommitments.map(renderRow)
        )}
      </div>

      {archivedCommitments.length > 0 && (
        <div className="opacity-75">
          <h2 className="text-sm font-medium text-[var(--text-stone)] mb-4">ARCHIVED</h2>
          {archivedCommitments.map(renderRow)}
        </div>
      )}

      <CommitmentModal open={isAddOpen} onClose={() => setIsAddOpen(false)} activeCount={activeCommitments.length} />

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Commitment">
        {editItem && (
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-[var(--text-stone)] mb-1">Title</label>
              <Input 
                value={editItem.title} 
                onChange={(e) => setEditItem({...editItem, title: e.target.value})}
                required 
              />
            </div>
            {editItem.type !== 'binary' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-[var(--text-stone)] mb-1">Target Value</label>
                  <Input 
                    type="number"
                    min="1"
                    value={editItem.targetValue} 
                    onChange={(e) => setEditItem({...editItem, targetValue: Number(e.target.value)})}
                    required 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-[var(--text-stone)] mb-1">Unit</label>
                  <Input 
                    value={editItem.unit} 
                    onChange={(e) => setEditItem({...editItem, unit: e.target.value})}
                    required 
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setEditItem(null)} disabled={isPending}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isPending}>Save</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Commitment">
        {deleteItem && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-ivory)]">
              Are you sure you want to delete <span className="font-bold">{deleteItem.title}</span>?
              <br/><br/>
              <span className="text-[var(--status-error)]">This action cannot be undone and will cascade to all daily records.</span>
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setDeleteItem(null)} disabled={isPending}>Cancel</Button>
              <Button type="button" variant="primary" onClick={handleDelete} disabled={isPending} className="bg-[var(--status-error)] text-white hover:bg-red-700">Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
