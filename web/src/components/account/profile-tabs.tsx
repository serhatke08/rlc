'use client';

import { useState } from 'react';
import { Package, Gift, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { EditListingButton } from '@/components/edit-listing-button';
import { DeleteListingButton } from '@/components/delete-listing-button';

interface Listing {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  images: string[] | null;
  city_name: string;
  price: string;
  listing_type: string | null;
  created_at: string;
}

interface Transaction {
  id: string;
  listing_id: string;
  created_at: string;
  listing: Listing | null;
}

interface ProfileTabsProps {
  items: Listing[];
  given: Transaction[];
  received: Transaction[];
}

export function ProfileTabs({ items, given, received }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'given' | 'received'>('items');

  const renderListingCard = (listing: Listing, showActions: boolean = false) => (
    <div
      key={listing.id}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <Link href={`/listing/${listing.id}`} className="block">
        <div className="relative aspect-square bg-zinc-100">
          {listing.thumbnail_url || listing.images?.[0] ? (
            <img
              src={listing.thumbnail_url || listing.images?.[0]}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-zinc-300" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-zinc-900 line-clamp-2">{listing.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{listing.city_name}</p>
          <p className="mt-2 text-lg font-bold text-emerald-600">
            {listing.listing_type === 'free' || listing.price === "0" || listing.price === 0
              ? "Free"
              : listing.listing_type === 'exchange'
                ? "Swap"
                : listing.listing_type === 'need'
                  ? "I Need"
                  : listing.listing_type === 'ownership'
                    ? "Adoption"
                    : `£${listing.price}`}
          </p>
        </div>
      </Link>
      {showActions && (
        <div className="absolute right-2 top-2 z-10 flex gap-2">
          <EditListingButton listingId={listing.id} />
          <DeleteListingButton listingId={listing.id} />
        </div>
      )}
    </div>
  );

  const renderEmptyState = (message: string) => (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
      <Package className="mx-auto h-12 w-12 text-zinc-400" />
      <p className="mt-4 text-sm text-zinc-600">{message}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('items')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-semibold transition border-b-2 -mb-[1px]",
            activeTab === 'items'
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Package className="h-4 w-4" />
          Items
          <span className="ml-1 text-xs font-normal text-zinc-400">({items.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('given')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-semibold transition border-b-2 -mb-[1px]",
            activeTab === 'given'
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Gift className="h-4 w-4" />
          Given
          <span className="ml-1 text-xs font-normal text-zinc-400">({given.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-semibold transition border-b-2 -mb-[1px]",
            activeTab === 'received'
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Download className="h-4 w-4" />
          Received
          <span className="ml-1 text-xs font-normal text-zinc-400">({received.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'items' && (
          <div>
            {items.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {items.map((listing) => renderListingCard(listing, true))}
              </div>
            ) : (
              renderEmptyState("You haven't shared any items yet")
            )}
          </div>
        )}

        {activeTab === 'given' && (
          <div>
            {given.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {given.map((transaction) => {
                  if (!transaction.listing) return null;
                  return renderListingCard(transaction.listing);
                })}
              </div>
            ) : (
              renderEmptyState("You haven't given any items yet")
            )}
          </div>
        )}

        {activeTab === 'received' && (
          <div>
            {received.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {received.map((transaction) => {
                  if (!transaction.listing) return null;
                  return renderListingCard(transaction.listing);
                })}
              </div>
            ) : (
              renderEmptyState("You haven't received any items yet")
            )}
          </div>
        )}
      </div>
    </div>
  );
}

