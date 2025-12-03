'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
};

interface CategoryFiltersProps {
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function CategoryFilters({ activeCategory, onCategoryChange }: CategoryFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('product_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading categories:', error);
    } else if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide rounded-2xl bg-white/80 p-2 shadow-sm shadow-zinc-100 md:flex-wrap md:gap-3 md:rounded-3xl md:p-3">
        <div className="h-10 w-20 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-10 w-20 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-10 w-20 animate-pulse rounded-xl bg-zinc-200" />
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide rounded-2xl bg-white/80 p-2 shadow-sm shadow-zinc-100 md:flex-wrap md:gap-3 md:rounded-3xl md:p-3">
      {/* All Categories Button */}
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition md:gap-2 md:rounded-2xl md:px-4 md:py-2 md:text-sm",
          activeCategory === null
            ? "bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] text-white shadow-md shadow-[#9c6cfe]/30"
            : "bg-zinc-100 text-zinc-700 border border-transparent hover:scale-105 hover:bg-zinc-200"
        )}
      >
        <Layers className="h-3.5 w-3.5 md:h-4 md:w-4" />
        All
      </button>

      {/* Category Buttons */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition md:gap-2 md:rounded-2xl md:px-4 md:py-2 md:text-sm",
            activeCategory === category.id
              ? "bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] text-white shadow-md shadow-[#9c6cfe]/30"
              : "bg-zinc-100 text-zinc-700 border border-transparent hover:scale-105 hover:bg-zinc-200"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

