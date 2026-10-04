"use client";

import React, { useState, useRef } from "react";
import { Upload, Camera, Sparkles, Check, X, FileText, AlertCircle } from "lucide-react";
import { addBill, ocrBill } from "@/app/actions";

interface BillPhotoUploadProps {
  currency: string;
  onBillAdded?: () => void;
  onCancel?: () => void;
}

export function BillPhotoUpload({
  currency,
  onBillAdded,
  onCancel,
}: BillPhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Form fields
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paid, setPaid] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload an image file (JPEG, PNG, WEBP).");
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setIsScanning(true);

    try {
      // 1. Read file as base64 for Claude Vision OCR
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const base64Data = await base64Promise;
      const mediaType = selectedFile.type as "image/jpeg" | "image/png" | "image/webp";

      // 2. Call Claude Vision OCR via server action
      const ocrResult = await ocrBill(base64Data, mediaType);

      if (ocrResult) {
        setBillName(ocrResult.billName || selectedFile.name.replace(/\.[^/.]+$/, ""));
        setAmount(ocrResult.amount > 0 ? ocrResult.amount.toString() : "");
        if (ocrResult.date) {
          setDate(ocrResult.date);
        }
        setScanSuccess(true);
      }
    } catch (err) {
      console.error("Error during OCR scan:", err);
      // Fallback: use file name
      setBillName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName || !amount) return;

    setIsSaving(true);
    let uploadedPhotoUrl: string | undefined = undefined;

    try {
      // If we have an image file, upload to R2
      if (file) {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              folder: "bills",
            }),
          });

          if (res.ok) {
            const { uploadUrl, publicUrl } = await res.json();
            const uploadRes = await fetch(uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });

            if (uploadRes.ok) {
              uploadedPhotoUrl = publicUrl;
            }
          }
        } catch (uploadErr) {
          console.warn("R2 upload optional failure, saving bill without image URL:", uploadErr);
        }
      }

      await addBill({
        billName,
        amount: parseFloat(amount),
        date,
        photoUrl: uploadedPhotoUrl,
        paid,
      });

      onBillAdded?.();
    } catch (err) {
      console.error("Failed to save bill:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <h4 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
          <Camera className="w-4 h-4 text-gold" />
          Scan Bill or Invoice (Claude Vision OCR)
        </h4>
        {onCancel && (
          <button onClick={onCancel} className="text-stone hover:text-ivory text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Drag & Drop Area */}
      {!previewUrl ? (
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
            accept="image/*"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-stone group-hover:text-gold transition-colors">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-ivory">
              Drag & drop bill photo or <span className="text-gold underline">browse</span>
            </p>
            <p className="text-[10px] text-muted mt-0.5">
              Claude Vision will automatically extract vendor name, amount, and due date.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-border bg-obsidian max-h-48 flex items-center justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Bill Preview"
            className="max-h-44 object-contain rounded"
          />
          {isScanning && (
            <div className="absolute inset-0 bg-obsidian/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-gold animate-spin" />
              <span className="text-xs font-mono text-ivory animate-pulse">
                Claude Vision analyzing bill...
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreviewUrl(null);
              setScanSuccess(false);
            }}
            className="absolute top-2 right-2 p-1 rounded-full bg-obsidian/80 text-stone hover:text-ivory border border-border text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {scanSuccess && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Claude Vision successfully extracted bill details! Verify below.</span>
        </div>
      )}

      {/* Bill Details Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
              Bill / Vendor Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electric & Power Co."
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
              Total Amount ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="120.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
              Due / Invoice Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone hover:text-ivory">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
                className="rounded border-border text-gold focus:ring-0 bg-obsidian w-4 h-4"
              />
              <span>Mark as already paid</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/80">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs text-stone hover:text-ivory"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || isScanning}
            className="px-4 py-1.5 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-all duration-150 active:scale-[0.98] active:-translate-y-0.5 disabled:opacity-50"
          >
            {isSaving ? "Saving Bill..." : "Confirm & Save Bill"}
          </button>
        </div>
      </form>
    </div>
  );
}
