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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {activeCount >= 7 && (
          <div className="bg-[#1a1d22] text-[#c99a54] border border-[#c99a54]/30 p-4 rounded-md font-mono text-xs">
            [FOCUS ADVISORY] You have 7+ active protocols. Adding more risks dilution.
          </div>
        )}

        <div>
          <Input 
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read Philosophy, Deep Work"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] uppercase tracking-wider text-[#9a9a96]">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {(['duration', 'quantity', 'count', 'binary'] as CommitmentType[]).map((t) => (
              <Button
                key={t}
                type="button"
                variant={type === t ? 'primary' : 'secondary'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input 
                label="Target Value"
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
                placeholder="e.g. min, pages"
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
            {isPending ? "Adding..." : "Add Commitment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
