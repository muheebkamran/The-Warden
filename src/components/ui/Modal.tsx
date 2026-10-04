"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-[#3a3244] bg-[#131519] p-6 sm:p-8 shadow-none animate-scale-up">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#292c32]">
          {title && (
            <h2 className="font-serif text-2xl text-[#f2f0ea] tracking-tight">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="text-[#9a9a96] hover:text-[#f2f0ea] hover:bg-[#1a1d22] p-1.5 rounded-sm transition-colors focus:outline-none"
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
