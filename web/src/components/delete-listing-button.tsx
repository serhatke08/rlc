'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteListingServer } from '@/app/actions/listing/delete';

interface DeleteListingButtonProps {
  listingId: string;
}

export function DeleteListingButton({ listingId }: DeleteListingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);

    try {
      // Call server action with ownership verification
      const result = await deleteListingServer(listingId);

      if (!result.ok) {
        alert(result.message || 'Error deleting listing. Please try again.');
        setShowConfirm(false);
        return;
      }

      // Success - refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative">
      {showConfirm ? (
        <div className="flex gap-1">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Confirm'
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="rounded-lg bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
          title="Delete listing"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

