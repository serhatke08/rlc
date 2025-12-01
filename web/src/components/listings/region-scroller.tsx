'use client';

import { useState, useEffect } from "react";
import { ChevronLeft, Grid3x3, Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface RegionScrollerProps {
  activeRegion: string | null;
  onRegionChange: (region: string | null) => void;
  viewMode?: 'grid' | 'gallery';
  onViewModeChange?: (mode: 'grid' | 'gallery') => void;
}

type ViewType = "country" | "regions" | "cities";

export function RegionScroller({ activeRegion, onRegionChange, viewMode = 'gallery', onViewModeChange }: RegionScrollerProps) {
  const [userCountry, setUserCountry] = useState<{ name: string; flag_emoji: string } | null>(null);
  const [view, setView] = useState<ViewType>("country");
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Kullanıcının ülkesini countries tablosundan çek
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select(`
            country_id,
            country:countries(name, code, flag_emoji)
          `)
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            const profileData = data as any;
            if (profileData?.country) {
              setUserCountry({
                name: profileData.country.name,
                flag_emoji: profileData.country.flag_emoji || ""
              });
            }
          });
      }
    });
  }, []);

  const handleCountryClick = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    
    // Kullanıcının ülkesine göre regionları çek
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      console.error("Kullanıcı bulunamadı");
      setLoading(false);
      return;
    }
    const { data: profileData } = await supabase
      .from("profiles")
      .select("country_id")
      .eq("id", user.id)
      .single();
    
    const profile = profileData as any;
    if (!profile?.country_id) {
      console.error("Kullanıcı ülkesi bulunamadı");
      setLoading(false);
      return;
    }
    
    // Tüm regionları çek
    const { data, error } = await supabase
      .from("regions")
      .select("*")
      .eq("country_id", profile.country_id)
      .order("name");
    
    if (error) {
      console.error("Regions yüklenemedi:", error);
      setLoading(false);
      return;
    }
    
    if (data) {
      console.log("Regions yüklendi:", data.length, "adet");
      setRegions(data);
      setView("regions");
    }
    
    setLoading(false);
  };

  const handleRegionClick = async (region: any) => {
    setSelectedRegion(region);
    setLoading(true);
    
    const supabase = createSupabaseBrowserClient();
    
    // Regiondaki şehirleri çek
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("region_id", region.id)
      .order("is_major", { ascending: false })
      .order("name");
    
    if (error) {
      console.error("Şehirler yüklenemedi:", error);
      setLoading(false);
      return;
    }
    
    if (data) {
      console.log(`${region.name} şehirleri yüklendi:`, data.length, "adet");
      setCities(data);
      setView("cities");
    }
    
    setLoading(false);
  };

  const handleCityClick = (city: any) => {
    onRegionChange(city.name);
  };

  const handleBack = () => {
    if (view === "cities") {
      setView("regions");
      setSelectedRegion(null);
      setCities([]);
    } else if (view === "regions") {
      setView("country");
      setRegions([]);
    }
  };

  const handleClearFilter = () => {
    onRegionChange(null);
  };

  return (
    <div className="space-y-2">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view !== "country" && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-xs font-medium text-zinc-500 transition hover:text-zinc-900 md:text-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Geri
            </button>
          )}
          <p className="text-xs font-semibold text-zinc-500 md:text-sm">
            {view === "country" && "Ülkem"}
            {view === "regions" && `Bölgeler (${regions.length})`}
            {view === "cities" && `${selectedRegion?.name} - Şehirler (${cities.length})`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Icons - Her zaman göster */}
          {onViewModeChange && (
            <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5 md:gap-1 md:p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  "rounded p-1 transition md:p-1.5",
                  viewMode === 'grid'
                    ? "bg-emerald-100 text-emerald-600"
                    : "text-zinc-500 hover:bg-zinc-100"
                )}
                title="Grid View"
              >
                <Grid3x3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('gallery')}
                className={cn(
                  "rounded p-1 transition md:p-1.5",
                  viewMode === 'gallery'
                    ? "bg-emerald-100 text-emerald-600"
                    : "text-zinc-500 hover:bg-zinc-100"
                )}
                title="Gallery View"
              >
                <ImageIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
            </div>
          )}
          
          {activeRegion && (
            <button
              onClick={handleClearFilter}
              className="text-[10px] font-medium text-emerald-600 transition hover:text-emerald-700 md:text-xs"
            >
              Filtreyi Temizle
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-xs text-zinc-500">Yükleniyor...</p>
      )}

      {/* Scroll Container */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:gap-3">
        {/* Ülke görünümü */}
        {view === "country" && (
          <button
            onClick={handleCountryClick}
            disabled={loading}
            className="shrink-0 rounded-xl border border-[#9c6cfe] bg-gradient-to-r from-[#f5ecff] to-[#e3fbff] px-4 py-2 text-xs font-semibold text-[#5a2bbf] transition hover:scale-105 disabled:opacity-50 md:rounded-2xl md:px-6 md:py-3 md:text-sm"
          >
            {userCountry ? `${userCountry.name} ${userCountry.flag_emoji}` : "İngiltere 🇬🇧"}
          </button>
        )}

        {/* Bölgeler görünümü */}
        {view === "regions" && regions.length > 0 &&
          regions.map((region) => (
            <button
              key={region.id}
              onClick={() => handleRegionClick(region)}
              disabled={loading}
              className="shrink-0 whitespace-nowrap rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:scale-105 hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50 md:rounded-2xl md:px-4 md:py-2 md:text-sm"
            >
              {region.name}
            </button>
          ))}

        {/* Bölge bulunamadı */}
        {view === "regions" && regions.length === 0 && !loading && (
          <p className="text-sm text-zinc-500">Bölge bulunamadı.</p>
        )}

        {/* Şehirler görünümü */}
        {view === "cities" && cities.length > 0 &&
          cities.map((city) => {
            const isActive = activeRegion === city.name;
            return (
              <button
                key={city.id}
                onClick={() => handleCityClick(city)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:scale-105 md:rounded-2xl md:px-4 md:py-2 md:text-sm",
                  isActive
                    ? "border-[#9c6cfe] bg-gradient-to-r from-[#f5ecff] to-[#e3fbff] text-[#5a2bbf]"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200 hover:text-emerald-700",
                )}
              >
                {city.name}
              </button>
            );
          })}

        {/* Şehir bulunamadı */}
        {view === "cities" && cities.length === 0 && !loading && (
          <p className="text-sm text-zinc-500">Bu bölgede şehir bulunamadı.</p>
        )}
      </div>
    </div>
  );
}

