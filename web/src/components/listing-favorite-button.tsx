'use client';

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface FavoriteButtonProps {
  listingId: string;
  currentUserId: string | null;
  isOwner: boolean;
  initialFavoriteCount?: number;
}

export function ListingFavoriteButton({ 
  listingId, 
  currentUserId, 
  isOwner,
  initialFavoriteCount = 0 
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if user has favorited this listing
  useEffect(() => {
    const checkFavorite = async () => {
      if (!currentUserId || isOwner) {
        setChecking(false);
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('listing_favorites')
          .select('id')
          .eq('listing_id', listingId)
          .eq('user_id', currentUserId)
          .single();

        if (!error && data) {
          setIsFavorited(true);
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      } finally {
        setChecking(false);
      }
    };

    checkFavorite();
  }, [listingId, currentUserId, isOwner]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      return;
    }

    if (isOwner) {
      return; // Owners can't favorite their own listings
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      console.log("Toggling favorite:", { listingId, currentUserId, isFavorited });
      
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('listing_favorites')
          .delete()
          .eq('listing_id', listingId)
          .eq('user_id', currentUserId);

        console.log("Delete favorite response:", { error });

        if (error) {
          console.error("Delete favorite error:", error);
          throw error;
        }

        setIsFavorited(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
      } else {
        // Add to favorites
        const { error } = await (supabase
          .from('listing_favorites') as any)
          .insert({
            listing_id: listingId,
            user_id: currentUserId,
          });

        console.log("Insert favorite response:", { error });

        if (error) {
          console.error("Insert favorite error:", error);
          throw error;
        }

        setIsFavorited(true);
        setFavoriteCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      alert(`Failed to update favorite: ${error?.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  if (isOwner) {
    return null; // Don't show button for owners
  }

  // If user is not logged in, show button but redirect to login on click
  if (!currentUserId) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = "/auth/login";
        }}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:scale-105 hover:border-rose-300 hover:bg-rose-50"
      >
        <Heart className="h-4 w-4" />
        <span>Add to Favorites</span>
        {favoriteCount > 0 && (
          <span className="ml-1 text-xs">({favoriteCount})</span>
        )}
      </button>
    );
  }

  if (checking) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 transition disabled:opacity-50"
      >
        <Heart className="h-4 w-4" />
        <span>Loading...</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:scale-105 disabled:opacity-50 ${
        isFavorited
          ? 'border-rose-300 bg-rose-50 text-rose-600'
          : 'border-zinc-200 bg-white text-zinc-600 hover:border-rose-300 hover:bg-rose-50'
      }`}
    >
      <Heart 
        className={`h-4 w-4 transition ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} 
      />
      <span>{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
      {favoriteCount > 0 && (
        <span className="ml-1 text-xs">({favoriteCount})</span>
      )}
    </button>
  );
}

