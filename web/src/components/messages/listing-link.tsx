'use client';

import Image from "next/image";
import Link from "next/link";
import { listingPublicPath } from "@/lib/listing-url";

interface ListingLinkProps {
  listingId: string;
  listingSlug?: string | null;
  title: string;
  thumbnailUrl?: string | null;
  images?: string[] | null;
}

export function ListingLink({ listingId, listingSlug, title, thumbnailUrl, images }: ListingLinkProps) {
  const path = listingPublicPath({ id: listingId, slug: listingSlug });
  const handleClick = (e: React.MouseEvent) => {
    // Iframe içindeyse parent window'a git, değilse normal link
    if (window.top && window.top !== window.self) {
      e.preventDefault();
      window.top.location.href = path;
    }
  };

  return (
    <Link 
      href={path}
      onClick={handleClick}
      className="flex items-center gap-2 hover:opacity-80 transition flex-1 min-w-0"
    >
      {/* Ürün Görseli - Küçük */}
      {thumbnailUrl || images?.[0] ? (
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-zinc-200 bg-zinc-100">
          <Image
            src={thumbnailUrl || images?.[0] || ''}
            alt={title}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      ) : (
        <div className="h-10 w-10 flex-shrink-0 rounded border border-zinc-200 bg-zinc-100" />
      )}
      
      {/* Ürün Bilgisi - Küçük */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-900 line-clamp-1">{title}</p>
      </div>
    </Link>
  );
}

