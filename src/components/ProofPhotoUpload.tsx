"use client";

import React, { useState, useRef, useTransition } from 'react';
import { Camera, Image as ImageIcon, Loader2, X, ExternalLink } from 'lucide-react';
import { attachProofPhoto } from '@/app/actions';

interface ProofPhotoUploadProps {
  commitmentId: string;
  date: string;
  existingPhotoUrl?: string | null;
  editable?: boolean;
}

export function ProofPhotoUpload({
  commitmentId,
  date,
  existingPhotoUrl,
  editable = true,
}: ProofPhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState(existingPhotoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editable) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be under 10MB');
      return;
    }

    setErrorMessage('');
    setIsUploading(true);

    try {
      // 1. Get pre-signed URL from /api/upload
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: 'proofs',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to authorize upload');
      }

      const { uploadUrl, publicUrl } = await res.json();

      // 2. Direct upload binary to Cloudflare R2 if uploadUrl is active
      if (uploadUrl) {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        if (!uploadRes.ok) {
          throw new Error('Upload to R2 failed');
        }
      }

      // 3. Optimistic preview & save to database
      setPhotoUrl(publicUrl);
      startTransition(async () => {
        await attachProofPhoto(commitmentId, date, publicUrl);
      });
    } catch (err: any) {
      console.error('Proof photo upload failed:', err);
      setErrorMessage(err?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    if (!editable) return;
    setPhotoUrl('');
    startTransition(async () => {
      await attachProofPhoto(commitmentId, date, '');
    });
  };

  return (
    <div className="flex items-center gap-2">
      {photoUrl ? (
        <div className="flex items-center gap-1.5 bg-elevated/80 border border-border/80 px-2.5 py-1 rounded-sm text-xs">
          <button
            type="button"
            onClick={() => setPreviewModal(true)}
            className="flex items-center gap-1.5 text-stone hover:text-ivory transition-colors"
            title="View proof photo"
          >
            <ImageIcon className="w-3.5 h-3.5 text-gold" />
            <span className="font-mono text-[11px] underline">Proof Photo</span>
          </button>

          {editable && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="text-stone hover:text-error ml-1 transition-colors"
              title="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        editable && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isPending}
            className="flex items-center gap-1 text-[11px] text-stone hover:text-gold transition-colors py-1 px-2 rounded hover:bg-elevated/40"
            title="Attach proof photo (gym, book, lecture)"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 text-gold animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            <span>{isUploading ? 'Uploading...' : 'Attach Proof'}</span>
          </button>
        )
      )}

      {errorMessage && (
        <span className="text-[10px] text-error font-medium">{errorMessage}</span>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Modal image preview */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-elevated border border-border p-4 rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
              <span className="text-xs font-semibold text-ivory uppercase tracking-wider">
                Proof of Execution
              </span>
              <button
                onClick={() => setPreviewModal(false)}
                className="text-stone hover:text-ivory"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded overflow-hidden max-h-96 flex items-center justify-center bg-obsidian">
              <img
                src={photoUrl}
                alt="Habit proof"
                className="max-h-96 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
