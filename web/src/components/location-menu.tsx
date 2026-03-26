"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Loader2 } from "lucide-react";
import type { Country, Region, City } from "@/lib/types/location";
import { fetchRegionsByCountry, fetchCitiesByRegion, fetchUkNationCountries } from "@/lib/queries/location-client";

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
  const [expandedRegionId, setExpandedRegionId] = useState<string | null>(selectedRegionProp?.id || null);
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [ukNationCountries, setUkNationCountries] = useState<Country[]>([]);
  const [ukNationRegions, setUkNationRegions] = useState<Region[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const isUkCountry =
    (initialCountry?.code || "").toUpperCase() === "GB" ||
    (initialCountry?.name || "").toLowerCase() === "england" ||
    (initialCountry?.name || "").toLowerCase().includes("united kingdom");

  const ukNationCodes = new Set(["SCT", "WLS", "NIR"]);
  const ukNationNames = new Set(["scotland", "wales", "northern ireland"]);

  useEffect(() => {
    if (!isUkCountry) return;

    const loadUkNations = async () => {
      const countries = await fetchUkNationCountries();
      const filtered = countries.filter((c) => {
        const code = (c.code || "").toUpperCase();
        const name = (c.name || "").toLowerCase();

        if (code === "ENG" || name === "england") return false;
        if (code === "GB" || name.includes("united kingdom")) return false;

        return (
          code === "SCT" ||
          code === "WLS" ||
          code === "NIR" ||
          name === "scotland" ||
          name === "wales" ||
          name === "northern ireland"
        );
      });

      setUkNationCountries(filtered);

      // Fetch real regions for Scotland/Wales/Northern Ireland so cities load correctly.
      try {
        const fetched = await Promise.all(
          filtered.map(async (nation) => {
            if (!nation.id) return [];
            return fetchRegionsByCountry(nation.id);
          }),
        );
        const merged = fetched.flat();

        // Deduplicate by region id
        const deduped = Array.from(new Map(merged.map((r) => [r.id, r])).values());
        setUkNationRegions(deduped);
      } catch (e) {
        console.error("Error loading UK nation regions:", e);
        setUkNationRegions([]);
      }
    };

    loadUkNations();
  }, [isUkCountry]);

  const displayRegions = isUkCountry
    ? Array.from(new Map([...regions, ...ukNationRegions].map((r) => [r.id, r])).values())
    : regions;

  const displayCountryName = isUkCountry ? "United Kingdom" : (initialCountry?.name || "Select location");

  // URL'den regionId/cityId oku
  const urlRegionId = searchParams.get("regionId");
  const urlCityId = searchParams.get("cityId");
  const urlCountryId = searchParams.get("countryId");

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
      setExpandedRegionId(urlRegionId);
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
    params.delete("countryId");
    router.push(`/?${params.toString()}`);
    setExpandedRegionId(null);
    setSelectedRegionId(null);
    setCities([]);
    setLoadingCities(false);
  };

  const handleCountryAsRegionSelect = (countryId: string) => {
    setIsOpen(false);
    setSelectedRegionId(null);
    setExpandedRegionId(null);
    setCities([]);
    setLoadingCities(false);

    const params = new URLSearchParams(searchParams.toString());
    params.set("countryId", countryId);
    params.delete("regionId");
    params.delete("cityId");
    router.push(`/?${params.toString()}`);
  };

  // Handle region selection - Sayfa yenilemeden URL'i güncelle
  const handleRegionSelect = async (regionId: string) => {
    // Always expand immediately on click (accordion behavior)
    setExpandedRegionId(regionId);

    // Toggle: if same region clicked, close it and clear filter
    if (expandedRegionId === regionId) {
      setSelectedRegionId(null);
      setExpandedRegionId(null);
      setCities([]);
      setLoadingCities(false);
      return;
    }

    // Set selected region and start loading
    setSelectedRegionId(regionId);
    setExpandedRegionId(regionId);
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
  };

  // Handle city selection - URL'ye yönlendir
  const handleCitySelect = (cityId: string, regionId: string) => {
    setIsOpen(false);
    
    // URL'ye cityId ekle (regionId zaten var)
    const params = new URLSearchParams(searchParams.toString());
    params.set("cityId", cityId);
    params.set("regionId", regionId);
    params.delete("countryId");
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
    return displayCountryName;
  };

  if (!initialCountry) {
    return null;
  }

  const isCountrySelected = !urlRegionId && !urlCityId && !urlCountryId;

  return (
    <div className="relative" ref={menuRef}>
      {/* Location Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-medium text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 md:gap-2 md:rounded-xl md:px-4 md:py-2 md:text-sm"
        aria-label="Select location"
        aria-expanded={isOpen}
      >
        <MapPin className="h-3 w-3 md:h-4 md:w-4" />
        <span className="flex items-center gap-0.5 md:gap-1">
          {initialCountry.flag_emoji && <span className="text-xs md:text-base">{initialCountry.flag_emoji}</span>}
          <span>{getButtonText()}</span>
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform md:h-4 md:w-4 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/50 md:w-80 md:rounded-2xl">
          <div className="max-h-[400px] overflow-y-auto p-1.5 md:max-h-[500px] md:p-2">
            <div className="space-y-0.5 md:space-y-1">
              {/* Country Button - Direkt seçim, açılmıyor */}
              <button
                type="button"
                onClick={handleCountrySelect}
                className={`w-full rounded-lg px-2 py-2 text-left text-[10px] font-medium transition md:rounded-xl md:px-4 md:py-3 md:text-sm ${
                  isCountrySelected
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <span className="flex items-center gap-1 md:gap-2">
                  {initialCountry.flag_emoji && <span className="text-xs md:text-base">{initialCountry.flag_emoji}</span>}
                  <span>{displayCountryName}</span>
                </span>
              </button>

              {/* Regions List */}
              {displayRegions.length === 0 ? (
                <div className="px-2 py-2 text-[10px] text-zinc-500 md:px-4 md:py-3 md:text-sm">
                  No regions found
                </div>
              ) : (
                displayRegions.map((region) => {
                  const isVirtualCountryRegion = region.id.startsWith("country::");
                  const virtualCountryId = isVirtualCountryRegion ? region.id.replace("country::", "") : null;
                  const isRegionExpanded = expandedRegionId === region.id;
                  
                  return (
                    <div key={region.id} className="space-y-0.5 md:space-y-1">
                      {/* Region Button */}
                      <button
                        type="button"
                        onClick={() =>
                          isVirtualCountryRegion && virtualCountryId
                            ? handleCountryAsRegionSelect(virtualCountryId)
                            : handleRegionSelect(region.id)
                        }
                        className={`w-full rounded-lg px-2 py-2 text-left text-[10px] font-medium transition md:rounded-xl md:px-4 md:py-3 md:text-sm ${
                          isRegionExpanded
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "hover:bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{region.name}</span>
                          {!isVirtualCountryRegion && (
                            <ChevronDown
                              className={`h-3 w-3 transition-transform md:h-4 md:w-4 ${
                                isRegionExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </div>
                      </button>

                      {/* Cities List (shown when region is selected) */}
                      {isRegionExpanded && !isVirtualCountryRegion && (
                        <div className="ml-2 space-y-0.5 border-l-2 border-emerald-200 pl-1.5 md:ml-4 md:space-y-1 md:pl-2">
                          {loadingCities ? (
                            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-zinc-500 md:gap-2 md:px-4 md:py-2 md:text-sm">
                              <Loader2 className="h-3 w-3 animate-spin md:h-4 md:w-4" />
                              <span>Loading cities...</span>
                            </div>
                          ) : cities.length === 0 ? (
                            <div className="px-2 py-1.5 text-[10px] text-zinc-500 md:px-4 md:py-2 md:text-sm">
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
                                  className={`w-full rounded-md px-2 py-1.5 text-left text-[10px] transition md:rounded-lg md:px-4 md:py-2 md:text-sm ${
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
