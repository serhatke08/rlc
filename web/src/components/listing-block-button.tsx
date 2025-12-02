'use client';

import { useState, useEffect } from "react";
import { Ban, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface ListingBlockButtonProps {
  sellerId: string;
  currentUserId: string | null;
  isOwner: boolean;
}

export function ListingBlockButton({ sellerId, currentUserId, isOwner }: ListingBlockButtonProps) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!currentUserId || isOwner) {
      setChecking(false);
      return;
    }

    const checkBlockStatus = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await (supabase
        .from("blocks") as any)
        .select("id")
        .eq("blocker_id", currentUserId)
        .eq("blocked_id", sellerId)
        .single();

      setIsBlocked(!!data);
      setChecking(false);
    };

    checkBlockStatus();
  }, [currentUserId, sellerId, isOwner]);

  const handleBlock = async () => {
    if (!currentUserId) {
      window.location.href = "/auth/login";
      return;
    }

    if (isOwner) {
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      if (isBlocked) {
        // Unblock
        const { error } = await (supabase
          .from("blocks") as any)
          .delete()
          .eq("blocker_id", currentUserId)
          .eq("blocked_id", sellerId);

        if (error) {
          console.error("Failed to unblock user:", error);
          alert("Failed to unblock user. Please try again.");
        } else {
          setIsBlocked(false);
        }
      } else {
        // Block
        const { error } = await (supabase
          .from("blocks") as any)
          .insert({
            blocker_id: currentUserId,
            blocked_id: sellerId
          });

        if (error) {
          console.error("Failed to block user:", error);
          alert("Failed to block user. Please try again.");
        } else {
          setIsBlocked(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isOwner || checking) {
    return null;
  }

  if (!currentUserId) {
    return null;
  }

  return (
    <button
      onClick={handleBlock}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
        isBlocked
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
      } disabled:opacity-50`}
    >
      {isBlocked ? (
        <>
          <Check className="h-4 w-4" />
          Unblock
        </>
      ) : (
        <>
          <Ban className="h-4 w-4" />
          Block
        </>
      )}
    </button>
  );
}

