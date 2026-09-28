"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-xl animate-scale-in mx-4">
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="font-sans font-semibold text-[var(--text-ivory)] text-lg">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="text-[var(--text-stone)] hover:text-[var(--text-ivory)] transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
