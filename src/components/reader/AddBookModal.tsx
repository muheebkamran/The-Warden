"use client";

import React, { useState, useRef } from "react";
import { Upload, BookOpen, Sparkles, X, Check, FileText } from "lucide-react";
import { addBook, extractPdfInfo } from "@/app/actions";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded?: () => void;
}

export function AddBookModal({ isOpen, onClose, onBookAdded }: AddBookModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("100");
  const [fileUrl, setFileUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processPdfFile = async (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      alert("Please upload a PDF document.");
      return;
    }

    setFile(selectedFile);
    setIsExtracting(true);

    try {
      // 1. Read file as base64 for metadata extraction
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          const base64 = res.split(",")[1] || res;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const base64Data = await base64Promise;

      // 2. Call server action using pdf-parse
      const meta = await extractPdfInfo(base64Data, selectedFile.name);

      if (meta) {
        setTitle(meta.title);
        setAuthor(meta.author !== "Unknown Author" ? meta.author : "");
        setTotalPages(meta.totalPages.toString());
        setExtractedSuccess(true);
      }

      // 3. Create object URL or pre-upload to R2
      // For immediate preview/reading, create an object URL or upload to R2
      const objectUrl = URL.createObjectURL(selectedFile);
      setFileUrl(objectUrl);

      // Attempt upload to Cloudflare R2 in background
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: selectedFile.name,
            contentType: "application/pdf",
            folder: "books",
          }),
        });

        if (res.ok) {
          const { uploadUrl, publicUrl } = await res.json();
          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/pdf" },
            body: selectedFile,
          });

          if (uploadRes.ok) {
            setFileUrl(publicUrl);
          }
        }
      } catch (uploadErr) {
        console.warn("Background R2 upload skipped; using local object URL:", uploadErr);
      }
    } catch (err) {
      console.error("Failed to parse PDF metadata:", err);
      setTitle(selectedFile.name.replace(/\.pdf$/i, ""));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPdfFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileUrl) return;

    setIsSaving(true);
    try {
      await addBook(
        title.trim(),
        author.trim() || null,
        fileUrl,
        parseInt(totalPages, 10) || 100
      );
      onBookAdded?.();
      onClose();
    } catch (err) {
      console.error("Failed to add book:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gold" />
            Add Book to Shelf (Auto-Metadata)
          </h3>
          <button onClick={onClose} className="text-stone hover:text-ivory text-xs">
            ✕
          </button>
        </div>

        {/* Drag & Drop PDF Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/80 hover:border-gold/60 bg-elevated/40 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-stone group-hover:text-gold transition-colors">
            {isExtracting ? (
              <Sparkles className="w-5 h-5 text-gold animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-ivory">
              {file ? file.name : "Drag & drop PDF book or browse"}
            </p>
            <p className="text-[10px] text-muted mt-0.5">
              {isExtracting
                ? "Extracting PDF title, author, and page count..."
                : "Automatically extracts book title, author, and total pages."}
            </p>
          </div>
        </div>

        {extractedSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Metadata detected! Review or tweak details below.</span>
          </div>
        )}

        {/* Form Details */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
              Book Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Meditations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                Author (Optional)
              </label>
              <input
                type="text"
                placeholder="Marcus Aurelius"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                Total Pages
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
              PDF URL / File Path
            </label>
            <input
              type="text"
              required
              placeholder="https://... or auto-generated upload URL"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold font-mono text-[11px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-stone hover:text-ivory"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title || !fileUrl}
              className="px-4 py-1.5 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Placing on Shelf..." : "Place on Shelf"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
