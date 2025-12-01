'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, X, User } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({ currentAvatarUrl, userId, size = 'lg' }: AvatarUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete old avatar if exists
      const { data: oldFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (oldFiles && oldFiles.length > 0) {
        const oldFileNames = oldFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage
          .from('avatars')
          .remove(oldFileNames);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Refresh page
      router.refresh();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar. Please try again.');
      setPreview(currentAvatarUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    setUploading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      // Delete avatar from storage
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (files && files.length > 0) {
        const fileNames = files.map(f => `${userId}/${f.name}`);
        await supabase.storage
          .from('avatars')
          .remove(fileNames);
      }

      // Update profile
      const { error } = await (supabase
        .from('profiles') as any)
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) throw error;

      setPreview(null);
      router.refresh();
    } catch (error) {
      console.error('Error removing avatar:', error);
      alert('Error removing avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block group">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`relative ${sizeClasses[size]} overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#9c6cfe] to-[#0ad2dd] shadow-lg transition hover:opacity-90 disabled:opacity-50 cursor-pointer`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-8 w-8 text-white opacity-50" />
          </div>
        )}
        
        {/* Overlay on hover/click - Upload prompt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100 rounded-full">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <>
              {preview ? (
                <User className="h-6 w-6 text-white mb-1" />
              ) : (
                <Camera className="h-6 w-6 text-white mb-1" />
              )}
              <span className="text-[10px] font-semibold text-white text-center px-2">
                {preview ? 'Change Photo' : 'Upload Photo'}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Remove button */}
      {preview && !uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="absolute -bottom-1 -right-1 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600 z-30"
          title="Remove avatar"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}

