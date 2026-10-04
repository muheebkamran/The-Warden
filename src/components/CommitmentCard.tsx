"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { quickComplete, recordCommitment, clearRecord } from "@/app/actions";
import { ProofPhotoUpload } from "@/components/ProofPhotoUpload";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CommitmentCardProps = {
  commitment: { id: string; title: string; type: string; targetValue: number; unit: string };
  record?: { id: string; actualValue: number; status: string; note: string | null; photoUrl?: string | null } | null;
  dateStr: string;
  editable: boolean;
};

export default function CommitmentCard({ commitment, record, dateStr, editable }: CommitmentCardProps) {
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(record?.actualValue?.toString() || "");
  const [showNote, setShowNote] = useState(!!record?.note);
  const [noteValue, setNoteValue] = useState(record?.note || "");

  const handleQuickComplete = () => {
    if (!editable) return;
    startTransition(() => {
      quickComplete(commitment.id, dateStr);
    });
  };

  const handleClear = () => {
    if (!editable) return;
    startTransition(() => {
      clearRecord(commitment.id, dateStr);
    });
  };

  const handleToggleBinary = () => {
    if (!editable) return;
    if (record?.status === "complete") {
      handleClear();
    } else {
      handleQuickComplete();
    }
  };

  const handleSaveValue = () => {
    if (!editable || !inputValue) return;
    const val = Number(inputValue);
    if (isNaN(val)) return;

    const formData = new FormData();
    formData.append("commitmentId", commitment.id);
    formData.append("date", dateStr);
    formData.append("actualValue", val.toString());
    if (noteValue) formData.append("note", noteValue);

    startTransition(() => {
      recordCommitment(formData);
    });
  };

  const renderStatus = () => {
    if (!record) return <span className="text-muted">—</span>;
    switch (record.status) {
      case "missed":
        return <Badge variant="missed">MISSED</Badge>;
      case "showed_up":
        return <Badge variant="showed_up">SHOWED UP: {record.actualValue}</Badge>;
      case "complete":
        return (
          <Badge variant="complete" className="animate-check-pop">
            <Check className="w-3 h-3 mr-1 inline" />
            COMPLETE: {record.actualValue}
          </Badge>
        );
      default:
        return <span className="text-muted">—</span>;
    }
  };

  return (
    <Card className={cn(
      "flex flex-col p-5 group transition-colors duration-300",
      record?.status === "complete" ? "border-success/30 bg-success/5" : "hover:border-stone/40"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="font-medium text-sm font-sans text-ivory">
            {commitment.title}
          </span>
          <span className="text-xs text-stone mt-1.5 font-medium">
            Target: {commitment.targetValue} {commitment.unit}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">{renderStatus()}</div>

          {editable && (
            <div className="flex items-center gap-2">
              {commitment.type === "binary" ? (
                <button
                  onClick={handleToggleBinary}
                  disabled={isPending}
                  className={cn(
                    "w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-surface",
                    record?.status === "complete"
                      ? "bg-success border-success text-obsidian"
                      : "bg-surface border-border hover:border-gold hover:bg-elevated"
                  )}
                >
                  {record?.status === "complete" && <Check className="w-4 h-4" strokeWidth={3} />}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleSaveValue}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveValue()}
                    placeholder="Val"
                    className="w-20 text-center font-mono"
                    disabled={isPending}
                    min="0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleQuickComplete}
                    disabled={isPending || record?.status === "complete"}
                  >
                    Complete
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(showNote || record?.note) && (
        <div className="mt-4 w-full animate-fade-in">
          {editable ? (
            <textarea
              className="w-full bg-obsidian/50 text-ivory border border-border rounded-sm p-3 text-xs placeholder:text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300 resize-none hover:border-stone/50"
              placeholder="Add a note..."
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              onBlur={handleSaveValue}
              disabled={isPending}
              rows={2}
            />
          ) : (
            <p className="text-xs text-stone italic bg-obsidian/50 p-3 rounded-sm border border-border/50">
              {record?.note}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/30 pt-2.5">
        <div>
          {editable && !showNote && !record?.note && (
            <button
              onClick={() => setShowNote(true)}
              className="text-[11px] font-medium text-muted hover:text-gold transition-colors"
            >
              + Add note
            </button>
          )}
        </div>

        <ProofPhotoUpload
          commitmentId={commitment.id}
          date={dateStr}
          existingPhotoUrl={record?.photoUrl}
          editable={editable}
        />
      </div>
    </Card>
  );
}
