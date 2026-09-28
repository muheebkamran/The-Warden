"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { quickComplete, recordCommitment, clearRecord } from "@/app/actions";
import { Check, X } from "lucide-react";

type CommitmentCardProps = {
  commitment: { id: string; title: string; type: string; targetValue: number; unit: string };
  record?: { id: string; actualValue: number; status: string; note: string | null } | null;
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
    if (!record) return <span className="text-[var(--text-muted)]">—</span>;
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
        return <span className="text-[var(--text-muted)]">—</span>;
    }
  };

  return (
    <Card className="flex flex-col p-4 mb-3 border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="font-medium text-sm font-sans text-[var(--text-ivory)]">
            {commitment.title}
          </span>
          <span className="text-xs text-[var(--text-stone)] mt-1">
            Target: {commitment.targetValue} {commitment.unit}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">{renderStatus()}</div>

          {editable && (
            <div className="flex items-center gap-2">
              {commitment.type === "binary" ? (
                <button
                  onClick={handleToggleBinary}
                  disabled={isPending}
                  className={`w-6 h-6 rounded-full border-[var(--border-default)] flex items-center justify-center transition-colors ${
                    record?.status === "complete"
                      ? "bg-[var(--status-success)] border-[var(--status-success)]"
                      : "bg-[var(--bg-elevated)]"
                  }`}
                >
                  {record?.status === "complete" && <Check className="w-4 h-4 text-white" />}
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
                    className="w-20 text-center"
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
        <div className="mt-3 w-full">
          {editable ? (
            <textarea
              className="w-full bg-[var(--bg-elevated)] text-[var(--text-ivory)] border border-[var(--border-default)] rounded-[var(--radius-sm)] p-2 text-xs"
              placeholder="Add a note..."
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              onBlur={handleSaveValue}
              disabled={isPending}
              rows={2}
            />
          ) : (
            <p className="text-xs text-[var(--text-stone)] italic bg-[var(--bg-elevated)] p-2 rounded-[var(--radius-sm)]">
              {record?.note}
            </p>
          )}
        </div>
      )}

      {editable && !showNote && !record?.note && (
        <div className="mt-2">
          <button
            onClick={() => setShowNote(true)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
          >
            + note
          </button>
        </div>
      )}
    </Card>
  );
}
