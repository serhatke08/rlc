'use client';

import { LISTING_FILTERS } from "@/data/homepage";
import { cn } from "@/lib/utils";

interface ListingFilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function ListingFilterPills({ activeFilter, onFilterChange }: ListingFilterPillsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide rounded-xl bg-white/80 p-1.5 shadow-sm shadow-zinc-100 md:flex-wrap md:gap-3 md:rounded-3xl md:p-3">
      {LISTING_FILTERS.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.key;
        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition md:gap-2 md:rounded-2xl md:px-4 md:py-2 md:text-sm",
              isActive
                ? "bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] text-white shadow-md shadow-[#9c6cfe]/30"
                : `${filter.color} border border-transparent hover:scale-105`,
            )}
          >
            <Icon className="h-3 w-3 md:h-4 md:w-4" />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

