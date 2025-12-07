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
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {/* All Button */}
      <Link
        href="/"
        className={cn(
          "group flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
          isAllActive
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
        )}
      >
        <Package className="h-4 w-4" />
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
              "group flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
              isActive
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
            )}
          >
            {category.icon ? (
              <span className="text-base">{category.icon}</span>
            ) : (
              <Package className="h-4 w-4" />
            )}
            <span>{category.name}</span>
            {category.listing_count !== null && category.listing_count > 0 && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 group-hover:bg-emerald-100 group-hover:text-emerald-700">
                {category.listing_count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
