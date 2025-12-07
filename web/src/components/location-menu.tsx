"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Loader2 } from "lucide-react";
import type { Country, Region, City } from "@/lib/types/location";
import { fetchRegionsByCountry, fetchCitiesByRegion } from "@/lib/queries/location-client";

interface LocationMenuProps {
  initialCountry: Country | null;
  initialRegions?: Region[];
  selectedRegion?: Region | null;
  selectedCity?: City | null;
}

export function LocationMenu({ 
  initialCountry, 
  initialRegions = [],
  selectedRegion: selectedRegionProp = null,
  selectedCity: selectedCityProp = null
}: LocationMenuProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(selectedRegionProp?.id || null);
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // URL'den regionId/cityId oku
  const urlRegionId = searchParams.get("regionId");
  const urlCityId = searchParams.get("cityId");

  // Load regions if not provided initially
  useEffect(() => {
    if (initialCountry && initialRegions.length === 0) {
      const loadRegions = async () => {
        const fetchedRegions = await fetchRegionsByCountry(initialCountry.id);
        setRegions(fetchedRegions);
      };
      loadRegions();
    }
  }, [initialCountry, initialRegions]);

  // URL'den regionId geldiğinde cities'i yükle
  useEffect(() => {
    if (urlRegionId && urlRegionId !== selectedRegionId) {
      setSelectedRegionId(urlRegionId);
      const loadCities = async () => {
        setLoadingCities(true);
        try {
          const fetchedCities = await fetchCitiesByRegion(urlRegionId);
          setCities(fetchedCities || []);
        } catch (error) {
          console.error("Error loading cities:", error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      };
      loadCities();
    }
  }, [urlRegionId, selectedRegionId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle country selection - Tüm filtreleri temizle, tüm ülke göster
  const handleCountrySelect = () => {
    setIsOpen(false);
    
    // URL'den regionId/cityId temizle
    const params = new URLSearchParams(searchParams.toString());
    params.delete("regionId");
    params.delete("cityId");
    router.push(`/?${params.toString()}`);
  };

  // Handle region selection - URL'ye yönlendir
  const handleRegionSelect = async (regionId: string) => {
    // Toggle: if same region clicked, close it and clear filter
    if (selectedRegionId === regionId) {
      setSelectedRegionId(null);
      setCities([]);
      setLoadingCities(false);
      
      // URL'den regionId'yi kaldır
      const params = new URLSearchParams(searchParams.toString());
      params.delete("regionId");
      params.delete("cityId");
      router.push(`/?${params.toString()}`);
      return;
    }

    // Set selected region and start loading
    setSelectedRegionId(regionId);
    setLoadingCities(true);
    setCities([]);

    try {
      const fetchedCities = await fetchCitiesByRegion(regionId);
      setCities(fetchedCities || []);
    } catch (error: any) {
      console.error("Error loading cities:", error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }

    // URL'ye regionId ekle ve cityId'yi kaldır
    const params = new URLSearchParams(searchParams.toString());
    params.set("regionId", regionId);
    params.delete("cityId");
    router.push(`/?${params.toString()}`);
  };

  // Handle city selection - URL'ye yönlendir
  const handleCitySelect = (cityId: string, regionId: string) => {
    setIsOpen(false);
    
    // URL'ye cityId ekle (regionId zaten var)
    const params = new URLSearchParams(searchParams.toString());
    params.set("cityId", cityId);
    params.set("regionId", regionId);
    router.push(`/?${params.toString()}`);
  };

  // Buton metnini belirle
  const getButtonText = () => {
    if (selectedCityProp) {
      return selectedCityProp.name;
    }
    if (selectedRegionProp) {
      return selectedRegionProp.name;
    }
    return initialCountry?.name || "Select location";
  };

  if (!initialCountry) {
    return null;
  }

  const isCountrySelected = !urlRegionId && !urlCityId;

  return (
    <div className="relative" ref={menuRef}>
      {/* Location Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
        aria-label="Select location"
        aria-expanded={isOpen}
      >
        <MapPin className="h-4 w-4" />
        <span className="flex items-center gap-1">
          {initialCountry.flag_emoji && <span>{initialCountry.flag_emoji}</span>}
          <span>{getButtonText()}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/50">
          <div className="max-h-[500px] overflow-y-auto p-2">
            <div className="space-y-1">
              {/* Country Button - Direkt seçim, açılmıyor */}
              <button
                type="button"
                onClick={handleCountrySelect}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  isCountrySelected
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  {initialCountry.flag_emoji && <span>{initialCountry.flag_emoji}</span>}
                  <span>{initialCountry.name}</span>
                </span>
              </button>

              {/* Regions List */}
              {regions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-zinc-500">
                  No regions found
                </div>
              ) : (
                regions.map((region) => {
                  const isRegionSelected = selectedRegionId === region.id || selectedRegionProp?.id === region.id;
                  
                  return (
                    <div key={region.id} className="space-y-1">
                      {/* Region Button */}
                      <button
                        type="button"
                        onClick={() => handleRegionSelect(region.id)}
                        className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                          isRegionSelected
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "hover:bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{region.name}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isRegionSelected ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Cities List (shown when region is selected) */}
                      {isRegionSelected && (
                        <div className="ml-4 space-y-1 border-l-2 border-emerald-200 pl-2">
                          {loadingCities ? (
                            <div className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Loading cities...</span>
                            </div>
                          ) : cities.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-zinc-500">
                              No cities found
                            </div>
                          ) : (
                            cities.map((city) => {
                              const isCitySelected = selectedCityProp?.id === city.id || urlCityId === city.id;
                              
                              return (
                                <button
                                  key={city.id}
                                  type="button"
                                  onClick={() => handleCitySelect(city.id, region.id)}
                                  className={`w-full rounded-lg px-4 py-2 text-left text-sm transition ${
                                    isCitySelected
                                      ? "bg-emerald-50 text-emerald-700 font-medium"
                                      : "text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{city.name}</span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
