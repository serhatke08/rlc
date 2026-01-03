'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, X, User, Pencil, Trash2 } from 'lucide-react';
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
  const [showMenu, setShowMenu] = useState(false);

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
    let uploadTimeout: NodeJS.Timeout | null = null;

    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('You must be logged in to upload an avatar');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/avatar.${fileExt}`;

      console.log('Starting avatar upload:', { userId, fileName, fileSize: file.size });

      // Delete old avatar if exists (skip if error - not critical)
      try {
        const listPromise = supabase.storage
          .from('avatars')
          .list(userId);

        const timeoutPromise = new Promise((_, reject) => {
          uploadTimeout = setTimeout(() => reject(new Error('List operation timeout')), 5000);
        });

        const { data: oldFiles, error: listError } = await Promise.race([
          listPromise,
          timeoutPromise,
        ]) as any;

        if (uploadTimeout) clearTimeout(uploadTimeout);

        if (listError && listError.message !== 'The resource was not found') {
          console.warn('Error listing old files:', listError);
        } else if (oldFiles && oldFiles.length > 0) {
          const oldFileNames = oldFiles.map((f: any) => `${userId}/${f.name}`);
          const { error: removeError } = await supabase.storage
            .from('avatars')
            .remove(oldFileNames);
          
          if (removeError) {
            console.warn('Error removing old files:', removeError);
          }
        }
      } catch (err: any) {
        if (uploadTimeout) clearTimeout(uploadTimeout);
        console.warn('Error cleaning old avatar (non-critical):', err);
        // Continue anyway
      }

      // Upload new avatar with timeout
      console.log('Uploading to avatars bucket...');
      
      const uploadPromise = supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      const uploadTimeoutPromise = new Promise((_, reject) => {
        uploadTimeout = setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000);
      });

      const uploadResult = await Promise.race([
        uploadPromise,
        uploadTimeoutPromise,
      ]) as any;

      if (uploadTimeout) clearTimeout(uploadTimeout);

      const { data: uploadData, error: uploadError } = uploadResult;

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message || 'Unknown upload error'}`);
      }

      if (!uploadData) {
        throw new Error('Upload returned no data');
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Failed to get public URL');
      }

      console.log('Public URL:', publicUrl);

      // Update profile with the public URL
      console.log('Updating profile...');
      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      console.log('Profile updated successfully');

      // Update preview with new URL (add cache busting for preview only)
      setPreview(`${publicUrl}?t=${Date.now()}`);

      // Refresh page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error: any) {
      if (uploadTimeout) clearTimeout(uploadTimeout);
      console.error('Error uploading avatar:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Error uploading avatar: ${errorMessage}\n\nPlease check:\n1. You are logged in\n2. File size is under 5MB\n3. File is a valid image\n4. You have permission to upload\n5. Network connection is stable`);
      setPreview(currentAvatarUrl || null);
    } finally {
      if (uploadTimeout) clearTimeout(uploadTimeout);
      setUploading(false);
      console.log('Upload process finished');
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    setUploading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      // Delete avatar from storage
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('avatars')
          .list(userId);

        if (listError) {
          console.warn('Error listing files:', listError);
        } else if (files && files.length > 0) {
          const fileNames = files.map(f => `${userId}/${f.name}`);
          const { error: removeError } = await supabase.storage
            .from('avatars')
            .remove(fileNames);
          
          if (removeError) {
            console.warn('Error removing files:', removeError);
          }
        }
      } catch (err) {
        console.warn('Error deleting from storage:', err);
        // Continue to update profile anyway
      }

      // Update profile
      const { error } = await (supabase
        .from('profiles') as any)
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) {
        console.error('Profile update error:', error);
        throw new Error(`Profile update failed: ${error.message}`);
      }

      setPreview(null);
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Error removing avatar: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div className="relative group">
        <button
          type="button"
          onClick={() => !uploading && fileInputRef.current?.click()}
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
          {!uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100 rounded-full">
              {preview ? (
                <User className="h-6 w-6 text-white mb-1" />
              ) : (
                <Camera className="h-6 w-6 text-white mb-1" />
              )}
              <span className="text-[10px] font-semibold text-white text-center px-2">
                {preview ? 'Change Photo' : 'Upload Photo'}
              </span>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </button>
      </div>

      {/* Edit button - Always visible when not uploading */}
      {!uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-zinc-700 p-2 text-white shadow-lg transition hover:bg-zinc-600 z-30"
          title="Edit avatar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Menu - Delete Avatar and Change buttons */}
      {showMenu && !uploading && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
            {/* Change button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              <Camera className="h-4 w-4" />
              Change
            </button>
            
            {/* Delete button - only show if avatar exists */}
            {preview && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  handleRemove();
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Avatar
              </button>
            )}
          </div>
        </>
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

