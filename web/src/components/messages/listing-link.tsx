'use client';

import Image from "next/image";
import Link from "next/link";

interface ListingLinkProps {
  listingId: string;
  title: string;
  thumbnailUrl?: string | null;
  images?: string[] | null;
}

export function ListingLink({ listingId, title, thumbnailUrl, images }: ListingLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Iframe içindeyse parent window'a git, değilse normal link
    if (window.top && window.top !== window.self) {
      e.preventDefault();
      window.top.location.href = `/listing/${listingId}`;
    }
  };

  return (
    <Link 
      href={`/listing/${listingId}`}
      onClick={handleClick}
      className="flex items-center gap-2.5 hover:opacity-80 transition flex-1 min-w-0"
    >
      {/* Ürün Görseli */}
      {thumbnailUrl || images?.[0] ? (
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          <Image
            src={thumbnailUrl || images?.[0] || ''}
            alt={title}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      ) : (
        <div className="h-14 w-14 flex-shrink-0 rounded-lg border border-zinc-200 bg-zinc-100" />
      )}
      
      {/* Ürün Bilgisi */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-zinc-500">About:</p>
        <p className="text-sm font-medium text-zinc-900 line-clamp-2">{title}</p>
      </div>
    </Link>
  );
}

