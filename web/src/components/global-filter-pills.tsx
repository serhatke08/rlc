"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LISTING_FILTERS } from "@/data/homepage";
import { cn } from "@/lib/utils";

export function GlobalFilterPills() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") || "all";

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (filter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }

    // Preserve other params like category, regionId, cityId
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {LISTING_FILTERS.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.key;
        return (
          <button
            key={filter.key}
            onClick={() => handleFilterChange(filter.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition md:gap-2 md:rounded-2xl md:px-4 md:py-2 md:text-sm",
              isActive
                ? "bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] text-white shadow-md shadow-[#9c6cfe]/30"
                : `${filter.color} border border-transparent hover:scale-105`,
            )}
          >
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

