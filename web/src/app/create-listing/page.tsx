'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Upload, X, Loader2 } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image_url?: string | null;
  listing_count?: number | null;
  order_index?: number | null;
};

type Subcategory = {
  id: string;
  name: string;
  slug: string;
};

type Region = {
  id: string;
  name: string;
  country_id?: string;
  code?: string | null;
};

type City = {
  id: string;
  name: string;
};

type Country = {
  id: string;
  name: string;
  code: string;
  flag_emoji?: string | null;
};

const LISTING_TYPES = [
  { value: 'free', label: 'Free' },
  { value: 'exchange', label: 'Swap' },
  { value: 'sale', label: 'Sale' },
  { value: 'need', label: 'I Need' },
  { value: 'ownership', label: 'Adoption' },
];

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'used', label: 'Used' },
  { value: 'for_parts', label: 'For Parts' },
];

export default function CreateListingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<string>('');
  const [condition, setCondition] = useState<string>('used');
  const [countryId, setCountryId] = useState<string>('');
  const [regionId, setRegionId] = useState<string>('');
  const [cityId, setCityId] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      loadSubcategories(categoryId);
    } else {
      setSubcategories([]);
      setSubcategoryId('');
    }
  }, [categoryId]);

  // Load regions when country changes
  useEffect(() => {
    if (countryId) {
      loadRegions(countryId);
      // Reset region and city when country changes
      setRegionId('');
      setCityId('');
      setCities([]);
    } else {
      setRegions([]);
      setRegionId('');
      setCityId('');
      setCities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

  // Load cities when region changes
  useEffect(() => {
    if (regionId) {
      loadCities(regionId);
    } else {
      setCities([]);
      setCityId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  const loadInitialData = async () => {
    const supabase = createSupabaseBrowserClient();
    
    try {
      // 1. Load categories FIRST - try API route first (more reliable)
      setLoadingCategories(true);
      
      // Try API route first (server-side, bypasses RLS issues)
      try {
        const apiResponse = await fetch('/api/categories', {
          cache: 'no-store',
        });
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (apiData && Array.isArray(apiData) && apiData.length > 0) {
            setCategories(apiData);
            setLoadingCategories(false);
            // Continue with user session loading
          } else {
            throw new Error('API returned empty');
          }
        } else {
          throw new Error(`API error: ${apiResponse.status}`);
        }
      } catch (apiError: any) {
        // Fallback to direct Supabase query
        try {
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('product_categories')
            .select('id, name, slug, is_active')
            .limit(100);
          
          if (categoriesError) {
            setCategories([]);
          } else if (categoriesData && categoriesData.length > 0) {
            const activeCategories = categoriesData.filter((cat: any) => cat.is_active !== false);
            activeCategories.sort((a: any, b: any) => a.name.localeCompare(b.name));
            setCategories(activeCategories);
          } else {
            setCategories([]);
          }
        } catch (directError) {
          setCategories([]);
        }
      } finally {
        setLoadingCategories(false);
      }

      // 2. Load countries
      await loadCountries();

      // 3. Load user session and set default country
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // Session error - continue without user data
        } else if (session?.user) {
          // 3. Load user profile with country
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('country_id')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            // Profile error - continue without country
          } else if (profileData) {
            const profile = profileData as { country_id?: string } | null;
            
            if (profile?.country_id) {
              // Set user's country as default
              setCountryId(profile.country_id);
            }
          }
        }
      } catch (sessionErr) {
        // Session loading exception - continue without user data
      }
    } catch (error) {
      // Unexpected error in loadInitialData
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadCountries = async () => {
    setLoadingCountries(true);
    
    // Try API route first
    try {
      const apiResponse = await fetch('/api/countries', {
        cache: 'no-store',
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          const countriesData = apiData as Country[];
          setCountries(countriesData);
          setLoadingCountries(false);
          return;
        } else {
          setCountries([]);
          setLoadingCountries(false);
          return;
        }
      } else {
        throw new Error(`API error: ${apiResponse.status}`);
      }
    } catch (apiError: any) {
      // Fallback to direct Supabase query
      const supabase = createSupabaseBrowserClient();
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('id, name, code, flag_emoji')
          .order('name', { ascending: true });

        if (error) {
          setCountries([]);
        } else if (data && data.length > 0) {
          const countriesData = data as Country[];
          setCountries(countriesData);
        } else {
          setCountries([]);
        }
      } catch (directError) {
        setCountries([]);
      }
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadRegions = async (countryId: string) => {
    if (!countryId) {
      return;
    }

    setLoadingRegions(true);
    
    // Try API route first
    try {
      const apiResponse = await fetch(`/api/regions?countryId=${countryId}`, {
        cache: 'no-store',
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          const regionsData = apiData as Region[];
          setRegions(regionsData);
          setLoadingRegions(false);
          return;
        } else {
          setRegions([]);
          setLoadingRegions(false);
          return;
        }
      } else {
        throw new Error(`API error: ${apiResponse.status}`);
      }
    } catch (apiError: any) {
      // Fallback to direct Supabase query
      const supabase = createSupabaseBrowserClient();
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('id, name, country_id, code')
          .eq('country_id', countryId)
          .order('name', { ascending: true });

        if (error) {
          setRegions([]);
        } else if (data && data.length > 0) {
          const regionsData = data as Region[];
          setRegions(regionsData);
        } else {
          setRegions([]);
        }
      } catch (directError) {
        setRegions([]);
      }
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([]);
      setLoadingSubcategories(false);
      return;
    }

    setLoadingSubcategories(true);
    
    // Try API route first
    try {
      const apiResponse = await fetch(`/api/subcategories/${categoryId}`, {
        cache: 'no-store',
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          setSubcategories(apiData);
          setLoadingSubcategories(false);
          return;
        } else {
          setSubcategories([]);
          setLoadingSubcategories(false);
          return;
        }
      } else {
        throw new Error(`API error: ${apiResponse.status}`);
      }
    } catch (apiError: any) {
      // Fallback to direct Supabase query
      const supabase = createSupabaseBrowserClient();
      try {
        const { data, error } = await supabase
          .from('product_subcategories')
          .select('id, name, slug')
          .eq('category_id', categoryId)
          .eq('is_active', true)
          .order('order_index', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true });

        if (error) {
          setSubcategories([]);
        } else if (data && data.length > 0) {
          setSubcategories(data);
        } else {
          setSubcategories([]);
        }
      } catch (directError) {
        setSubcategories([]);
      }
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const loadCities = async (regionId: string) => {
    if (!regionId) {
      setCities([]);
      setCityId('');
      setLoadingCities(false);
      return;
    }

    setLoadingCities(true);
    
    // Try API route first
    try {
      const apiResponse = await fetch(`/api/cities/${regionId}`, {
        cache: 'no-store',
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          const citiesData = apiData as City[];
          setCities(citiesData);
          // Reset city selection if current city is not in the new list
          if (cityId && !citiesData.find((c: City) => c.id === cityId)) {
            setCityId('');
          }
          setLoadingCities(false);
          return;
        } else {
          setCities([]);
          setCityId('');
          setLoadingCities(false);
          return;
        }
      } else {
        throw new Error(`API error: ${apiResponse.status}`);
      }
    } catch (apiError: any) {
      // Fallback to direct Supabase query
      const supabase = createSupabaseBrowserClient();
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name')
          .eq('region_id', regionId)
          .order('is_major', { ascending: false })
          .order('name', { ascending: true });

        if (error) {
          setCities([]);
          setCityId('');
        } else if (data && data.length > 0) {
          const citiesData = data as City[];
          setCities(citiesData);
          // Reset city selection if current city is not in the new list
          if (cityId && !data.find((c: City) => c.id === cityId)) {
            setCityId('');
          }
        } else {
          setCities([]);
          setCityId('');
        }
      } catch (directError) {
        setCities([]);
        setCityId('');
      }
    } finally {
      setLoadingCities(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 10) {
      alert('Maximum 10 photos allowed');
      return;
    }

    // Filter out unsupported formats (AVIF)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    const validFiles = files.filter(file => {
      const isAllowed = allowedTypes.includes(file.type);
      if (!isAllowed) {
        alert(`File ${file.name} has unsupported format (${file.type}). Please use JPEG, PNG, GIF, or WebP format.`);
      }
      return isAllowed;
    });

    if (validFiles.length === 0) {
      return;
    }

    const newPhotos = [...photos, ...validFiles];
    setPhotos(newPhotos);

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) return;

    const newPhotos = [...photos];
    const newPreviews = [...photoPreviews];
    
    const [draggedPhoto] = newPhotos.splice(dragIndex, 1);
    const [draggedPreview] = newPreviews.splice(dragIndex, 1);
    
    newPhotos.splice(dropIndex, 0, draggedPhoto);
    newPreviews.splice(dropIndex, 0, draggedPreview);
    
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || photos.length === 0) return;

    setSubmitting(true);

    try {
      // Get names
      const selectedRegion = regions.find(r => r.id === regionId);
      const selectedCity = cities.find(c => c.id === cityId);

      // Create FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('subcategoryId', subcategoryId);
      formData.append('listingType', listingType);
      formData.append('condition', condition);
      formData.append('countryId', countryId);
      formData.append('regionId', regionId);
      formData.append('cityId', cityId);
      formData.append('cityName', selectedCity?.name || '');
      formData.append('districtName', selectedRegion?.name || '');
      
      // Add photos
      photos.forEach((photo, i) => {
        formData.append(`photo${i}`, photo);
      });

      // Send to API
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      if (data.id) {
        router.push(`/listing/${data.id}`);
      } else {
        setSubmitting(false);
      }
      
    } catch (error: any) {
      setSubmitting(false);
      alert(error?.message || 'Error creating listing');
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-3xl font-bold text-zinc-900">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Category * {categories.length > 0 && `(${categories.length} available)`}
          </label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
            }}
            required
            disabled={loadingCategories}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{loadingCategories ? 'Loading categories...' : 'Select a category'}</option>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            ) : (
              !loadingCategories && <option value="" disabled>No categories available</option>
            )}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Subcategory
          </label>
          <select
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            disabled={!categoryId || loadingSubcategories}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{loadingSubcategories ? 'Loading subcategories...' : 'Select (Optional)'}</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Listing Title */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Listing Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. iPhone 13 Pro Max 256GB"
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed information about the item..."
            required
            rows={6}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Listing Type */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Listing Type *
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {LISTING_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setListingType(type.value)}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                  listingType === type.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-emerald-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Condition *
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {CONDITIONS.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Country *
          </label>
          <select
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            required
            disabled={loadingCountries}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{loadingCountries ? 'Loading countries...' : 'Select a country'}</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.flag_emoji ? `${country.flag_emoji} ` : ''}{country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Region *
          </label>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            required
            disabled={loadingRegions}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{loadingRegions ? 'Loading regions...' : 'Select a region'}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            City *
          </label>
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            required
            disabled={!regionId || loadingCities}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{loadingCities ? 'Loading cities...' : 'Select a city'}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Photos */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Photos * (Minimum 1, maximum 10)
          </label>
          <div className="space-y-4">
            {/* Photo Preview Grid */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
                {photoPreviews.map((preview, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="relative aspect-square cursor-move"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute left-2 top-2 rounded bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button with Drag & Drop */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-emerald-400', 'bg-emerald-50');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-emerald-400', 'bg-emerald-50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-emerald-400', 'bg-emerald-50');
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                  if (photos.length + files.length > 10) {
                    alert('Maximum 10 photos allowed');
                    return;
                  }
                  const newPhotos = [...photos, ...files];
                  setPhotos(newPhotos);
                  const newPreviews = files.map(file => URL.createObjectURL(file));
                  setPhotoPreviews([...photoPreviews, ...newPreviews]);
                }
              }}
            >
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-8 text-sm font-semibold text-zinc-700 transition hover:border-emerald-400 hover:bg-emerald-50">
                <Upload className="h-5 w-5" />
                Add Photo
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={photos.length >= 10}
                />
              </label>
            </div>
            <p className="text-xs text-zinc-500">
              The first photo will be used as the main photo. You can drag and drop to reorder photos.
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#9c6cfe]/30 transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </span>
            ) : (
              'Publish Listing'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

