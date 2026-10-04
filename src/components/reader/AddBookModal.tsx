"use client";

import React, { useState, useRef } from "react";
import { Upload, BookOpen, Check, X, FileText } from "lucide-react";
import { addBook, extractPdfInfo } from "@/app/actions";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded?: () => void;
}

export function AddBookModal({ isOpen, onClose, onBookAdded }: AddBookModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Extracted confirmation state
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState<number>(100);
  const [metadataDetected, setMetadataDetected] = useState(false);
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFileUrl(null);
    setTitle("");
    setAuthor("");
    setTotalPages(100);
    setMetadataDetected(false);
    setIsExtracting(false);
    setIsSaving(false);
  };

  const processFile = async (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      alert("Please upload a PDF document.");
      return;
    }

    setFileName(selectedFile.name);
    setIsExtracting(true);

    try {
      // 1. Read base64 for metadata extraction
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

      // 2. Extract metadata via server action
      const meta = await extractPdfInfo(base64Data, selectedFile.name);

      if (meta && meta.title && meta.title !== "Untitled Book") {
        setTitle(meta.title);
        setAuthor(meta.author !== "Unknown Author" ? meta.author : "");
        setTotalPages(meta.totalPages || 100);
        setMetadataDetected(true);
      } else {
        const fallbackName = selectedFile.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
        setTitle(fallbackName);
        setTotalPages(meta?.totalPages || 100);
        setMetadataDetected(false);
      }

      // 3. Create persistent R2 upload or local fallback URL
      let uploadedUrl = URL.createObjectURL(selectedFile);
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
            uploadedUrl = publicUrl;
          }
        }
      } catch (uploadErr) {
        console.warn("R2 upload fallback to object URL:", uploadErr);
      }

      setFileUrl(uploadedUrl);
    } catch (err) {
      console.error("Error processing PDF:", err);
      setTitle(selectedFile.name.replace(/\.pdf$/i, ""));
      setFileUrl(URL.createObjectURL(selectedFile));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) return;

    setIsSaving(true);
    try {
      const finalTitle = title.trim() || fileName.replace(/\.pdf$/i, "") || "Untitled Volume";
      await addBook(finalTitle, author.trim() || null, fileUrl, totalPages);
      onBookAdded?.();
      handleReset();
      onClose();
    } catch (err) {
      console.error("Failed to add book to shelf:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-xs transition-opacity duration-300">
      <div className="w-full max-w-md bg-obsidian border border-border rounded-lg p-6 shadow-2xl space-y-5 transition-transform duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gold" />
            <h3 className="text-sm font-serif font-bold text-ivory tracking-wide">
              Add Book to Shelf
            </h3>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-stone hover:text-ivory transition-colors duration-150 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase 1: Drag-Drop Zone Only */}
        {!fileUrl && !isExtracting && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed transition-all duration-200 cursor-pointer p-8 rounded-lg text-center flex flex-col items-center justify-center gap-3 ${
              isDragOver
                ? "border-gold bg-elevated scale-[1.01]"
                : "border-border bg-obsidian hover:bg-surface/50 hover:border-stone"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-stone transition-transform duration-200 group-hover:scale-105">
              <Upload className="w-5 h-5 text-gold" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-ivory">
                Drop your PDF book here or <span className="text-gold underline">browse</span>
              </p>
              <p className="text-[11px] text-muted">
                Title, author, and page count will be detected automatically
              </p>
            </div>
          </div>
        )}

        {/* Phase 2: Skeleton Loader while Extracting Metadata */}
        {isExtracting && (
          <div className="p-6 border border-border rounded-lg bg-surface/40 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-elevated animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 bg-elevated rounded w-3/4 animate-pulse" />
                <div className="h-2.5 bg-elevated/70 rounded w-1/2 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="h-3 bg-elevated/50 rounded w-full animate-pulse" />
              <div className="h-3 bg-elevated/50 rounded w-2/3 animate-pulse" />
            </div>
            <p className="text-[11px] font-mono text-muted text-center pt-1">
              Analyzing digital parchment & metadata...
            </p>
          </div>
        )}

        {/* Phase 3: Confirmation Card (Staggered Fields + Optional Edit) */}
        {fileUrl && !isExtracting && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="p-4 rounded-lg bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold shrink-0" />
                  <span className="text-xs font-semibold text-ivory">
                    {metadataDetected ? "Metadata Detected" : "Book Details"}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated border border-border/60 text-stone">
                  {totalPages} pages
                </span>
              </div>

              {/* Title field (editable) */}
              <div className="space-y-1 animate-in fade-in" style={{ animationDelay: "60ms" }}>
                <label className="text-[11px] uppercase tracking-wider text-muted block">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter title if needed"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-obsidian border border-border rounded text-xs text-ivory focus:outline-none focus:border-gold focus:shadow-[0_0_0_2px_rgba(234,179,8,0.15)] transition-all duration-200"
                />
              </div>

              {/* Author field (editable) */}
              <div className="space-y-1 animate-in fade-in" style={{ animationDelay: "120ms" }}>
                <label className="text-[11px] uppercase tracking-wider text-muted block">
                  Author (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Aurelius"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-1.5 bg-obsidian border border-border rounded text-xs text-ivory focus:outline-none focus:border-gold focus:shadow-[0_0_0_2px_rgba(234,179,8,0.15)] transition-all duration-200"
                />
              </div>

              {!metadataDetected && (
                <p className="text-[10px] text-stone italic pt-1">
                  Title was inferred from filename — refine above if desired.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs text-stone hover:text-ivory transition-colors duration-150"
              >
                Choose Another
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gold text-obsidian text-xs font-semibold rounded hover:bg-gold/90 transition-all duration-150 active:scale-[0.98] active:-translate-y-0.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? "Placing on Shelf..." : "Confirm & Add"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
