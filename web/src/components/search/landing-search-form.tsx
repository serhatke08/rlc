"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ListFilter, MapPin, Search } from "lucide-react";

import { FEATURED_CATEGORIES, POPULAR_SEARCHES } from "@/data/homepage";
import { cn } from "@/lib/utils";

const LOCATION_PRESETS = ["London", "Manchester", "Bristol", "Birmingham", "Glasgow", "Brighton"];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LandingSearchForm() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const { data } = useSWR<{ searches: string[] }>("/api/popular-searches", fetcher, {
    fallbackData: { searches: POPULAR_SEARCHES },
  });

  const suggestions = useMemo(() => data?.searches ?? POPULAR_SEARCHES, [data]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keywords) params.set("query", keywords);
    if (category) params.set("category", category);
    if (location) params.set("location", location);

    const query = params.toString();
    router.push(query ? `/swap-items-online?${query}` : "/swap-items-online");
  };

  return (
    <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-xl shadow-emerald-500/5">
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-[2fr,1.2fr,1.2fr,auto] md:items-end">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-600">
          Anahtar kelime
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-400" />
            <input
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="örn. 'mid-century sofa'"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-600">
          Kategori
          <div className="relative flex items-center">
            <ListFilter className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-400" />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-10 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Tümü</option>
              {FEATURED_CATEGORIES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-600">
          Konum
          <div className="relative flex items-center">
            <MapPin className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-400" />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              list="landing-locations"
              placeholder="örn. London"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
            <datalist id="landing-locations">
              {LOCATION_PRESETS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
        </label>

        <button
          type="submit"
          className="h-[56px] rounded-2xl bg-emerald-600 px-6 text-base font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/40"
        >
          İlan ara
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-zinc-500">Popüler aramalar:</span>
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 5).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setKeywords(item)}
              className={cn(
                "rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-emerald-300 hover:text-emerald-700",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

