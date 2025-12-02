'use client';

import { useState } from "react";
import Image from "next/image";
import { Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListingImageGalleryProps {
  images: string[];
  thumbnailUrl?: string | null;
  title: string;
}

export function ListingImageGallery({ images, thumbnailUrl, title }: ListingImageGalleryProps) {
  // Tüm fotoğrafları birleştir (thumbnail_url varsa başa ekle, yoksa images array'ini kullan)
  const allImages = thumbnailUrl 
    ? [thumbnailUrl, ...images.filter(img => img !== thumbnailUrl)]
    : images.length > 0 
      ? images 
      : [];

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-emerald-100 via-emerald-50 to-white flex items-center justify-center">
          {/* Favorile - Sağ Üst */}
          <button className="absolute right-3 top-3 rounded-full border border-zinc-200 bg-white/90 p-2.5 shadow-md backdrop-blur-sm transition hover:border-rose-300 hover:bg-rose-50">
            <Heart className="h-5 w-5 text-zinc-600" />
          </button>
          {/* Paylaş - Sağ Alt */}
          <button className="absolute bottom-3 right-3 rounded-full border border-zinc-200 bg-white/90 p-2.5 shadow-md backdrop-blur-sm transition hover:border-zinc-300 hover:bg-zinc-50">
            <Share2 className="h-5 w-5 text-zinc-600" />
          </button>
        </div>
      </div>
    );
  }

  const currentImage = allImages[selectedIndex];
  const hasMultipleImages = allImages.length > 1;

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Ana Fotoğraf */}
      <div className="relative aspect-[4/3] bg-zinc-100 flex items-center justify-center">
        <Image
          src={currentImage}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          fill
          className="object-contain"
          priority={selectedIndex === 0}
          sizes="(max-width: 768px) 100vw, 800px"
        />
        
        {/* Navigasyon Butonları - Sadece birden fazla fotoğraf varsa */}
        {hasMultipleImages && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2 shadow-md backdrop-blur-sm transition hover:border-zinc-300 hover:bg-white"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5 text-zinc-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2 shadow-md backdrop-blur-sm transition hover:border-zinc-300 hover:bg-white"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5 text-zinc-700" />
            </button>
            
            {/* Fotoğraf Sayacı */}
            <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow-md backdrop-blur-sm">
              {selectedIndex + 1} / {allImages.length}
            </div>
          </>
        )}

        {/* Favorile - Sağ Üst */}
        <button className="absolute right-3 top-3 rounded-full border border-zinc-200 bg-white/90 p-2.5 shadow-md backdrop-blur-sm transition hover:border-rose-300 hover:bg-rose-50">
          <Heart className="h-5 w-5 text-zinc-600" />
        </button>
        
        {/* Paylaş - Sağ Alt */}
        <button className="absolute bottom-3 right-3 rounded-full border border-zinc-200 bg-white/90 p-2.5 shadow-md backdrop-blur-sm transition hover:border-zinc-300 hover:bg-zinc-50">
          <Share2 className="h-5 w-5 text-zinc-600" />
        </button>
      </div>

      {/* Thumbnail Galeri - Sadece birden fazla fotoğraf varsa */}
      {hasMultipleImages && (
        <div className="border-t border-zinc-200 bg-zinc-50 p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
                  selectedIndex === index
                    ? "border-emerald-500 ring-2 ring-emerald-200"
                    : "border-zinc-200 hover:border-zinc-300"
                )}
                aria-label={`Show photo ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

