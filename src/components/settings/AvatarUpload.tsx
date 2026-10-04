"use client";

import React, { useState, useRef, useTransition } from 'react';
import { Camera, Loader2, User as UserIcon } from 'lucide-react';
import { updateUserAvatar } from '@/app/actions';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
}

export function AvatarUpload({ currentAvatarUrl }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be under 5MB');
      return;
    }

    setErrorMessage('');
    setIsUploading(true);

    try {
      // 1. Request pre-signed URL from our API
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: 'avatars',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get upload authorization');
      }

      const { uploadUrl, publicUrl } = await res.json();

      // 2. Upload binary directly to Cloudflare R2 if uploadUrl is active
      if (uploadUrl) {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        if (!uploadRes.ok) {
          throw new Error('Direct upload to R2 failed');
        }
      }

      // 3. Optimistic preview & save to Neon via Server Action
      setAvatarUrl(publicUrl);
      startTransition(async () => {
        await updateUserAvatar(publicUrl);
      });
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setErrorMessage(err?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative group">
        <div className="w-20 h-20 rounded-full bg-elevated border-2 border-border/80 overflow-hidden flex items-center justify-center shadow-inner">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-9 h-9 text-stone/50" />
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-obsidian/75 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-gold animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isPending}
          className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gold text-obsidian shadow-lg hover:scale-105 active:scale-95 transition-all"
          title="Upload new avatar"
        >
          <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-1">
        <div className="text-sm font-medium text-ivory">Profile Photo</div>
        <p className="text-xs text-stone">
          Upload an avatar. Powered by Cloudflare R2 object storage.
        </p>
        {errorMessage && (
          <p className="text-xs text-error font-medium">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
