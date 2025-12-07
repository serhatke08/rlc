'use client';

import { useEffect } from 'react';

interface ListingViewTrackerProps {
  listingId: string;
  isOwner: boolean;
}

export function ListingViewTracker({ listingId, isOwner }: ListingViewTrackerProps) {
  useEffect(() => {
    // Only track views for non-owners
    if (isOwner) return;

    // Track view count via API route (with rate limiting)
    fetch(`/api/listings/${listingId}/view`, {
      method: 'POST',
      credentials: 'include',
    }).catch((error) => {
      // Silently fail - view count is not critical
      console.debug('View count tracking failed:', error);
    });
  }, [listingId, isOwner]);

  return null; // This component doesn't render anything
}

