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
    <Modal open={open} onClose={onClose} title="Add New Habit">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {activeCount >= 7 && (
          <div className="bg-[#1a1d22] text-[#c99a54] border border-[#c99a54]/30 p-4 rounded-md font-mono text-xs">
            Tip: You have 7+ active habits. Keeping your list focused makes it much easier to stay consistent!
          </div>
        )}

        <div>
          <Input 
            label="Habit Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read 20 mins, Exercise, Drink Water"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] uppercase tracking-wider text-[#9a9a96]">Habit Type</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'duration' as CommitmentType, label: 'Minutes' },
              { id: 'quantity' as CommitmentType, label: 'Amount' },
              { id: 'count' as CommitmentType, label: 'Count' },
              { id: 'binary' as CommitmentType, label: 'Yes / No' },
            ].map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={type === item.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleTypeSelect(item.id)}
                className="text-xs"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {type !== 'binary' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input 
                label="Goal Number"
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              />
            </div>
            <div>
              <Input 
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. min, pages, glasses"
                required
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#292c32]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isPending || !title.trim()}>
            {isPending ? "Adding..." : "Add Habit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
