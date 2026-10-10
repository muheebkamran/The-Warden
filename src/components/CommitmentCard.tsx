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
    if (!record) return <span className="font-mono text-xs text-[#62646a]">—</span>;
    switch (record.status) {
      case "missed":
        return <Badge variant="missed">MISSED</Badge>;
      case "showed_up":
        return <Badge variant="showed_up">SHOWED UP: {record.actualValue}</Badge>;
      case "complete":
        return (
          <Badge variant="complete" className="animate-fade-in">
            <Check className="w-3 h-3 mr-1 inline" />
            COMPLETE: {record.actualValue}
          </Badge>
        );
      default:
        return <span className="font-mono text-xs text-[#62646a]">—</span>;
    }
  };

  return (
    <Card className={cn(
      "flex flex-col p-5 group transition-all duration-200 border-[#26262B] bg-[#18181B] rounded-2xl",
      record?.status === "complete" 
        ? "border-[#00D664]/50 bg-[#00D664]/5 shadow-[0_4px_24px_rgba(0,214,100,0.08)]" 
        : "hover:border-[#FFFC00]/40 hover:bg-[#1C1C20]"
    )}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col">
          <span className="font-sans font-semibold text-sm text-white tracking-tight">
            {commitment.title}
          </span>
          <span className="font-mono text-xs text-zinc-400 mt-1 font-normal">
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
                  className={cn(
                    "w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-150 shadow-none focus:outline-none hover:scale-105 active:scale-90 cursor-pointer",
                    record?.status === "complete"
                      ? "bg-[#00D664] border-[#00D664] text-black shadow-[0_0_15px_rgba(0,214,100,0.4)]"
                      : "bg-[#0E0E10] border-[#26262B] hover:border-[#FFFC00] text-white"
                  )}
                  aria-label="Toggle commitment status"
                >
                  {record?.status === "complete" && <Check className="w-4 h-4 animate-spring-pop" strokeWidth={3} />}
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
                    className="w-20 text-center font-mono py-1.5 text-xs"
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
              className="w-full bg-[#0b0c0e] text-[#f2f0ea] border border-[#292c32] rounded-sm p-3 text-xs placeholder:text-[#62646a] focus:outline-none focus:border-[#c8a96b] focus:ring-1 focus:ring-[#c8a96b]/30 transition-all duration-150 resize-none hover:border-[#3a3244]"
              placeholder="Add a note (optional)..."
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              onBlur={handleSaveValue}
              disabled={isPending}
              rows={2}
            />
          ) : (
            <p className="text-xs font-mono text-[#9a9a96] italic bg-[#0b0c0e] p-3 rounded-sm border border-[#292c32]">
              {record?.note}
            </p>
          )}
        </div>
      )}

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#292c32]/60 pt-3">
        <div>
          {editable && !showNote && !record?.note && (
            <button
              onClick={() => setShowNote(true)}
              className="font-mono text-[11px] text-[#9a9a96] hover:text-[#c8a96b] transition-colors cursor-pointer"
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
