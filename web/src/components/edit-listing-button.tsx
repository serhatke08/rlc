'use client';

import Link from 'next/link';
import { Edit } from 'lucide-react';

interface EditListingButtonProps {
  listingId: string;
}

export function EditListingButton({ listingId }: EditListingButtonProps) {
  return (
    <Link
      href={`/edit-listing/${listingId}`}
      className="rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm transition hover:bg-white"
      onClick={(e) => e.stopPropagation()}
    >
      <Edit className="h-4 w-4 text-zinc-700" />
    </Link>
  );
}

