"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCommitment } from "@/app/actions";
import { CommitmentType } from "@/lib/evaluation";

type CommitmentModalProps = {
  open: boolean;
  onClose: () => void;
  activeCount: number;
};

export default function CommitmentModal({ open, onClose, activeCount }: CommitmentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CommitmentType>("duration");
  const [targetValue, setTargetValue] = useState("1");
  const [unit, setUnit] = useState("min");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("targetValue", targetValue);
    formData.append("unit", unit);

    startTransition(() => {
      createCommitment(formData);
      onClose();
      // Reset form
      setTitle("");
      setType("duration");
      setTargetValue("1");
      setUnit("min");
    });
  };

  const handleTypeSelect = (t: CommitmentType) => {
    setType(t);
    if (t === "duration") {
      setUnit("min");
    } else if (t === "binary") {
      setUnit("check");
      setTargetValue("1");
    } else {
      setUnit("");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Commitment">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {activeCount >= 7 && (
          <div className="bg-[var(--status-warning)] bg-opacity-20 text-[var(--status-warning)] p-3 rounded-[var(--radius-sm)] text-sm">
            You already have 7+ active commitments. Consider whether adding more will dilute your focus.
          </div>
        )}

        <div>
          <label className="block text-sm text-[var(--text-stone)] mb-1">Title</label>
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read Philosophy, Deep Work"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-stone)] mb-2">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {(['duration', 'quantity', 'count', 'binary'] as CommitmentType[]).map((t) => (
              <Button
                key={t}
                type="button"
                variant={type === t ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleTypeSelect(t)}
                className="capitalize text-xs"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {type !== 'binary' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-[var(--text-stone)] mb-1">Target Value</label>
              <Input 
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-[var(--text-stone)] mb-1">Unit</label>
              <Input 
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. pages, times"
                required
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isPending || !title.trim()}>
            {isPending ? "Adding..." : "Add Commitment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
