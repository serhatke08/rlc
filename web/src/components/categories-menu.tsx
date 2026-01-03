"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types/category";

interface CategoriesMenuProps {
  categories: Category[];
}

export function CategoriesMenu({ categories }: CategoriesMenuProps) {
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("categoryId");
  const isAllActive = !activeCategoryId;

  if (categories.length === 0) {
    return null;
  }

  // Kategorileri sırala: "Toys and Ornaments" veya "Hobbies & Games" 6. sıraya taşı
  const sortedCategories = [...categories];
  
  // "Toys and Ornaments" veya benzer isimli kategoriyi bul (case insensitive)
  const toysIndex = sortedCategories.findIndex(
    (cat) => cat.name.toLowerCase().includes("toy") || 
             cat.name.toLowerCase().includes("ornament") ||
             cat.name.toLowerCase().includes("hobbies") ||
             cat.name.toLowerCase().includes("games")
  );
  
  if (toysIndex !== -1 && toysIndex !== 5) {
    // 6. sıraya taşı (index 5)
    const toysCategory = sortedCategories[toysIndex];
    sortedCategories.splice(toysIndex, 1);
    sortedCategories.splice(5, 0, toysCategory);
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide md:gap-2">
      {/* All Button */}
      <Link
        href="/"
        className={cn(
          "group flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition md:gap-2 md:rounded-xl md:px-4 md:py-2 md:text-sm",
          isAllActive
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
        )}
      >
        <Package className="h-3 w-3 md:h-4 md:w-4" />
        <span>All</span>
      </Link>

      {/* Categories */}
      {sortedCategories.map((category) => {
        const isActive = activeCategoryId === category.id;

        return (
          <Link
            key={category.id}
            href={`/?categoryId=${category.id}`}
            className={cn(
              "group flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition md:gap-2 md:rounded-xl md:px-4 md:py-2 md:text-sm",
              isActive
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
            )}
          >
            {category.icon ? (
              <span className="text-xs md:text-base">{category.icon}</span>
            ) : (
              <Package className="h-3 w-3 md:h-4 md:w-4" />
            )}
            <span>{category.name}</span>
            {category.listing_count !== null && category.listing_count > 0 && (
              <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] text-zinc-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 md:px-2 md:text-xs">
                {category.listing_count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
