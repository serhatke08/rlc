'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userCountry, setUserCountry] = useState<{ name: string; flag_emoji: string } | null>(null);
  const [view, setView] = useState<ViewType>("country");
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // URL'den regionId ve cityId'yi oku, sayfa yüklendiğinde regionları ve şehirleri yükle
  useEffect(() => {
    const regionId = searchParams.get("regionId");
    const cityId = searchParams.get("cityId");
    
    if (regionId || cityId) {
      const loadRegionData = async () => {
        const supabase = createSupabaseBrowserClient();
        
        // Kullanıcının ülkesini al
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;
        
        const { data: profileData } = await supabase
          .from("profiles")
          .select("country_id")
          .eq("id", user.id)
          .single();
        
        if (!profileData?.country_id) return;
        
        // Ülke bilgisini al
        const { data: countryData } = await supabase
          .from("countries")
          .select("name, flag_emoji")
          .eq("id", profileData.country_id)
          .single();
        
        // Regionları yükle
        const { data: regionsData } = await supabase
          .from("regions")
          .select("*")
          .eq("country_id", profileData.country_id)
          .order("code")
          .order("name");
        
        if (regionsData) {
          // En başa "All Regions" seçeneğini ekle
          const allRegionsOption = {
            id: "all",
            name: countryData?.name || "England",
            code: null,
            country_id: profileData.country_id,
            is_all_regions: true,
          };
          
          setRegions([allRegionsOption, ...regionsData]);
          setView("regions");
        }
        
        // Eğer regionId varsa, o regionun şehirlerini yükle
        if (regionId) {
          const { data: regionData } = await supabase
            .from("regions")
            .select("*")
            .eq("id", regionId)
            .single();
          
          if (regionData) {
            setSelectedRegion(regionData);
            
            const { data: citiesData } = await supabase
              .from("cities")
              .select("*")
              .eq("region_id", regionId)
              .order("is_major", { ascending: false })
              .order("name");
            
            if (citiesData) {
              setCities(citiesData);
            }
          }
        }
      };
      
      loadRegionData();
    }
  }, [searchParams]);

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
    
    // 1. Kullanıcının ülke ID'sini al (profiles.country_id)
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
    
    // Ülke bilgisini al
    const { data: countryData } = await supabase
      .from("countries")
      .select("name, flag_emoji")
      .eq("id", profile.country_id)
      .single();
    
    // 2. regions.country_id = profiles.country_id ile eşleşen regionları çek
    const { data, error } = await supabase
      .from("regions")
      .select("*")
      .eq("country_id", profile.country_id)
      .order("code") // Kod sırasına göre (E12001, E12002, vs.)
      .order("name");
    
    if (error) {
      console.error("Regions yüklenemedi:", error);
      setLoading(false);
      return;
    }
    
    if (data) {
      // En başa "England" (tüm bölgeler) seçeneğini ekle
      const allRegionsOption = {
        id: "all",
        name: countryData?.name || "England",
        code: null,
        country_id: profile.country_id,
        is_all_regions: true, // Özel flag
      };
      
      // Önce "all" seçeneği, sonra diğer regionlar
      setRegions([allRegionsOption, ...data]);
      setView("regions");
    }
    
    // URL'den filtreleri temizle (tüm ülke gösterilecek)
    router.push("/");
    router.refresh();
    
    setLoading(false);
  };

  const handleRegionClick = async (region: any) => {
    // "All Regions" seçildiyse (tüm bölgeler)
    if (region.id === "all" || region.is_all_regions) {
      // Eğer zaten seçiliyse, seçimi kaldır
      if (selectedRegion?.id === "all") {
        setSelectedRegion(null);
        setCities([]);
        router.push("/");
        router.refresh();
        return;
      }
      
      setSelectedRegion(region);
      setCities([]); // Tüm bölgeler seçildiğinde şehir gösterme
      
      // URL'den filtreleri temizle (tüm ülke gösterilecek)
      router.push("/");
      router.refresh();
      return;
    }
    
    // Eğer aynı region tekrar seçilirse şehirleri gizle
    if (selectedRegion?.id === region.id && cities.length > 0) {
      setSelectedRegion(null);
      setCities([]);
      // URL'den regionId'yi temizle
      const params = new URLSearchParams(searchParams.toString());
      params.delete("regionId");
      params.delete("cityId");
      router.push(`/?${params.toString()}`);
      router.refresh();
      return;
    }
    
    setSelectedRegion(region);
    setLoading(true);
    
    const supabase = createSupabaseBrowserClient();
    
    // cities.region_id = regions.id ile eşleşen şehirleri çek
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
    }
    
    // URL'e regionId ekle (region seçildiğinde o regionun ürünlerini göster)
    const params = new URLSearchParams(searchParams.toString());
    params.set("regionId", region.id);
    params.delete("cityId"); // Şehir filtresini temizle
    router.push(`/?${params.toString()}`);
    router.refresh();
    
    setLoading(false);
  };

  const handleCityClick = (city: any) => {
    // URL'e cityId ekle
    const params = new URLSearchParams(searchParams.toString());
    params.set("cityId", city.id);
    params.delete("regionId"); // Region filtresini temizle (şehir daha spesifik)
    router.push(`/?${params.toString()}`);
    router.refresh();
  };

  const handleBack = () => {
    if (view === "regions") {
      setView("country");
      setRegions([]);
      setSelectedRegion(null);
      setCities([]);
    }
  };

  const handleClearFilter = () => {
    // URL'den filtreleri temizle
    router.push("/");
    router.refresh();
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

      {/* Scroll Container - Regionlar */}
      {view === "regions" && regions.length > 0 && (
      <div className="flex gap-2 overflow-x-auto pb-2 md:gap-3">
          {regions.map((region) => {
            const isSelected = selectedRegion?.id === region.id;
            const isAllRegions = region.id === "all" || region.is_all_regions;
            return (
              <button
                key={region.id}
                onClick={() => handleRegionClick(region)}
                disabled={loading}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:scale-105 disabled:opacity-50 md:rounded-2xl md:px-4 md:py-2 md:text-sm",
                  isSelected
                    ? "border-[#9c6cfe] bg-gradient-to-r from-[#f5ecff] to-[#e3fbff] text-[#5a2bbf]"
                    : isAllRegions
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200 hover:text-emerald-700"
                )}
              >
                {region.name}
              </button>
            );
          })}
        </div>
      )}

        {/* Ülke görünümü */}
        {view === "country" && (
        <div className="flex gap-2 overflow-x-auto pb-2 md:gap-3">
          <button
            onClick={handleCountryClick}
            disabled={loading}
            className="shrink-0 rounded-xl border border-[#9c6cfe] bg-gradient-to-r from-[#f5ecff] to-[#e3fbff] px-4 py-2 text-xs font-semibold text-[#5a2bbf] transition hover:scale-105 disabled:opacity-50 md:rounded-2xl md:px-6 md:py-3 md:text-sm"
          >
            {userCountry ? `${userCountry.name} ${userCountry.flag_emoji}` : "İngiltere 🇬🇧"}
          </button>
        </div>
        )}

      {/* Scroll Container - Şehirler (Regionların altında) */}
      {selectedRegion && selectedRegion.id !== "all" && !selectedRegion.is_all_regions && cities.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-500 md:text-sm">
            {selectedRegion.name} - Şehirler ({cities.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 md:gap-3">
            {cities.map((city) => {
            const isActive = searchParams.get("cityId") === city.id;
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
          </div>
        </div>
      )}

      {/* Bölge bulunamadı */}
      {view === "regions" && regions.length === 0 && !loading && (
        <p className="text-sm text-zinc-500">Bölge bulunamadı.</p>
      )}

        {/* Şehir bulunamadı */}
      {selectedRegion && cities.length === 0 && !loading && (
          <p className="text-sm text-zinc-500">Bu bölgede şehir bulunamadı.</p>
        )}
    </div>
  );
}

