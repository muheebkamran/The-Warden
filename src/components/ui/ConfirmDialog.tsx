"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Info } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  variant?: "danger" | "primary" | "warning";
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  variant = "primary",
}: ConfirmDialogProps) {
  const isDestructive = variant === "danger";

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) onCancel();
      }}
      title={title}
      maxWidth="sm"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3.5">
          {isDestructive ? (
            <div className="p-2 rounded-md bg-[#b56b6b]/10 border border-[#b56b6b]/30 text-[#b56b6b] shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
          ) : (
            <div className="p-2 rounded-md bg-[#c8a96b]/10 border border-[#c8a96b]/30 text-[#c8a96b] shrink-0 mt-0.5">
              <Info className="w-5 h-5" aria-hidden="true" />
            </div>
          )}
          <div className="text-sm text-[#9a9a96] leading-relaxed flex-1">
            {description}
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-4 border-t border-[#292c32]">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
