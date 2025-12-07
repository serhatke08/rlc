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
  const [regionId, setRegionId] = useState<string>('');
  const [cityId, setCityId] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [userCountryId, setUserCountryId] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string>('');
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Debug: Log when categories change
  useEffect(() => {
    console.log('📊 Categories state changed:', categories.length, categories);
  }, [categories]);

  // Debug: Log when regions change
  useEffect(() => {
    console.log('📊 Regions state changed:', regions.length, regions);
  }, [regions]);

  // Debug: Log when cities change
  useEffect(() => {
    console.log('📊 Cities state changed:', cities.length, cities);
  }, [cities]);

  // Load initial data
  useEffect(() => {
    console.log('🚀 useEffect triggered - loading initial data');
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
      console.log('📦 Loading categories...');
      
      // Try API route first (server-side, bypasses RLS issues)
      try {
        console.log('📦 Trying API route...');
        const apiResponse = await fetch('/api/categories', {
          cache: 'no-store',
        });
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (apiData && Array.isArray(apiData) && apiData.length > 0) {
            setCategories(apiData);
            console.log('✅ Categories loaded via API:', apiData.length, apiData.map((c: any) => c.name));
            setLoadingCategories(false);
            // Continue with user session loading
          } else {
            console.warn('⚠️ API returned empty array');
            throw new Error('API returned empty');
          }
        } else {
          console.warn('⚠️ API response not OK:', apiResponse.status);
          throw new Error(`API error: ${apiResponse.status}`);
        }
      } catch (apiError: any) {
        console.error('❌ API route failed, trying direct query:', apiError);
        
        // Fallback to direct Supabase query
        try {
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('product_categories')
            .select('id, name, slug, is_active')
            .limit(100);
          
          console.log('📦 Direct query result - data:', categoriesData?.length, 'error:', categoriesError);
          
          if (categoriesError) {
            console.error('❌ Direct query error:', categoriesError);
            setCategories([]);
          } else if (categoriesData && categoriesData.length > 0) {
            const activeCategories = categoriesData.filter((cat: any) => cat.is_active !== false);
            activeCategories.sort((a: any, b: any) => a.name.localeCompare(b.name));
            setCategories(activeCategories);
            console.log('✅ Categories loaded via direct query:', activeCategories.length);
          } else {
            console.warn('⚠️ No categories data returned');
            setCategories([]);
          }
        } catch (directError) {
          console.error('❌ Direct query exception:', directError);
          setCategories([]);
        }
      } finally {
        setLoadingCategories(false);
      }

      // 2. Load regions immediately (don't wait for user country)
      console.log('🌍 Loading all regions...');
      await loadAllRegions();

      // 3. Load user session and country (don't block on this)
      console.log('👤 Loading user session...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('👤 Session check - session:', session ? 'exists' : 'null', 'error:', sessionError);
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          console.error('Session error details:', JSON.stringify(sessionError, null, 2));
        } else if (session?.user) {
          console.log('✅ User session found:', session.user.id);

          // 3. Load user profile with country
          console.log('🌍 Loading user profile...');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('country_id')
            .eq('id', session.user.id)
            .single();

          console.log('🌍 Profile check - data:', profileData ? 'exists' : 'null', 'error:', profileError);
          
          if (profileError) {
            console.error('❌ Profile error:', profileError);
            console.error('Profile error details:', JSON.stringify(profileError, null, 2));
          } else if (profileData) {
            const profile = profileData as { country_id?: string } | null;
            console.log('🌍 Profile data:', profile);
            
            if (profile?.country_id) {
              console.log('✅ User country_id:', profile.country_id);
              setUserCountryId(profile.country_id);

              // 4. Load country name
              console.log('🌍 Loading country name...');
              const { data: countryData, error: countryError } = await supabase
                .from('countries')
                .select('name')
                .eq('id', profile.country_id)
                .single();

              if (countryError) {
                console.error('❌ Country name error:', countryError);
              } else if (countryData) {
                const country = countryData as { name?: string } | null;
                if (country?.name) {
                  setCountryName(country.name);
                  console.log('✅ Country name:', country.name);
                }
              }

              // 5. If user has country, filter regions by country (optional - already loaded all)
              // Regions are already loaded, but we can filter if needed
              console.log('🌍 User country_id:', profile.country_id, '- Regions already loaded');
            } else {
              console.warn('⚠️ User has no country_id in profile');
              console.warn('⚠️ Profile object:', JSON.stringify(profile, null, 2));
            }
          } else {
            console.warn('⚠️ Profile data is null');
          }
        } else {
          console.warn('⚠️ No user session found - session:', session, 'user:', session?.user);
        }
      } catch (sessionErr) {
        console.error('❌ Session loading exception:', sessionErr);
        console.error('Exception details:', JSON.stringify(sessionErr, null, 2));
      }
    } catch (error) {
      console.error('❌ Unexpected error in loadInitialData:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadAllRegions = async () => {
    setLoadingRegions(true);
    console.log('🌍 Loading all regions...');
    
    // Try API route first (load all regions)
    try {
      const apiResponse = await fetch('/api/regions', {
        cache: 'no-store',
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          const regionsData = apiData as Region[];
          setRegions(regionsData);
          console.log('✅ All regions loaded via API:', regionsData.length, regionsData.map(r => r.name));
          setLoadingRegions(false);
          return;
        } else {
          console.warn('⚠️ No regions found');
          setRegions([]);
          setLoadingRegions(false);
          return;
        }
      } else {
        throw new Error(`API error: ${apiResponse.status}`);
      }
    } catch (apiError: any) {
      console.error('❌ API route failed, trying direct query:', apiError);
      
      // Fallback to direct Supabase query
      const supabase = createSupabaseBrowserClient();
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('id, name, country_id, code')
          .order('name', { ascending: true })
          .limit(200);

        if (error) {
          console.error('❌ Regions error:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          setRegions([]);
        } else if (data && data.length > 0) {
          const regionsData = data as Region[];
          console.log('✅ All regions loaded via direct query:', regionsData.length, regionsData.map(r => r.name));
          setRegions(regionsData);
        } else {
          console.warn('⚠️ No regions found');
          setRegions([]);
        }
      } catch (directError) {
        console.error('❌ Direct query exception:', directError);
        setRegions([]);
      }
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadRegions = async (countryId: string) => {
    if (!countryId) {
      console.warn('⚠️ No countryId provided for loadRegions');
      return;
    }

    setLoadingRegions(true);
    console.log('🌍 Loading regions for countryId:', countryId);
    
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
          console.log('✅ Regions loaded via API:', regionsData.length, regionsData.map(r => r.name));
          setLoadingRegions(false);
          return;
        } else {
          console.warn('⚠️ No regions found for countryId:', countryId);
          setRegions([]);
          setLoadingRegions(false);
          return;
        }
      } else {
        throw new Error(`API error: ${apiResponse.status}`);
      }
    } catch (apiError: any) {
      console.error('❌ API route failed, trying direct query:', apiError);
      
      // Fallback to direct Supabase query
      const supabase = createSupabaseBrowserClient();
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('id, name, country_id, code')
          .eq('country_id', countryId)
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ Regions error:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          setRegions([]);
        } else if (data && data.length > 0) {
          const regionsData = data as Region[];
          console.log('✅ Regions loaded via direct query:', regionsData.length, regionsData.map(r => r.name));
          setRegions(regionsData);
        } else {
          console.warn('⚠️ No regions found for countryId:', countryId);
          setRegions([]);
        }
      } catch (directError) {
        console.error('❌ Direct query exception:', directError);
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
    console.log('📂 Loading subcategories for categoryId:', categoryId);
    
    // Try API route first
    try {
      const apiResponse = await fetch(`/api/subcategories/${categoryId}`, {
        cache: 'no-store',
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          setSubcategories(apiData);
          console.log('✅ Subcategories loaded via API:', apiData.length, apiData.map((s: any) => s.name));
          setLoadingSubcategories(false);
          return;
        } else {
          console.log('ℹ️ No subcategories found for categoryId:', categoryId);
          setSubcategories([]);
          setLoadingSubcategories(false);
          return;
        }
      } else {
        throw new Error(`API error: ${apiResponse.status}`);
      }
    } catch (apiError: any) {
      console.error('❌ API route failed, trying direct query:', apiError);
      
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
          console.error('❌ Subcategories error:', error);
          setSubcategories([]);
        } else if (data && data.length > 0) {
          console.log('✅ Subcategories loaded via direct query:', data.length);
          setSubcategories(data);
        } else {
          console.log('ℹ️ No subcategories found for categoryId:', categoryId);
          setSubcategories([]);
        }
      } catch (directError) {
        console.error('❌ Direct query exception:', directError);
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
    console.log('🏙️ Loading cities for regionId:', regionId);
    
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
          console.log('✅ Cities loaded via API:', citiesData.length, citiesData.map(c => c.name));
          // Reset city selection if current city is not in the new list
          if (cityId && !citiesData.find((c: City) => c.id === cityId)) {
            setCityId('');
          }
          setLoadingCities(false);
          return;
        } else {
          console.warn('⚠️ No cities found for regionId:', regionId);
          setCities([]);
          setCityId('');
          setLoadingCities(false);
          return;
        }
      } else {
        throw new Error(`API error: ${apiResponse.status}`);
      }
    } catch (apiError: any) {
      console.error('❌ API route failed, trying direct query:', apiError);
      
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
          console.error('❌ Cities error:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          setCities([]);
          setCityId('');
        } else if (data && data.length > 0) {
          const citiesData = data as City[];
          console.log('✅ Cities loaded via direct query:', citiesData.length, citiesData.map(c => c.name));
          setCities(citiesData);
          // Reset city selection if current city is not in the new list
          if (cityId && !data.find((c: City) => c.id === cityId)) {
            setCityId('');
          }
        } else {
          console.warn('⚠️ No cities found for regionId:', regionId);
          setCities([]);
          setCityId('');
        }
      } catch (directError) {
        console.error('❌ Direct query exception:', directError);
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

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
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
    
    // Prevent multiple submissions
    if (submitting) {
      return;
    }
    
    if (photos.length === 0) {
      alert('Please add at least one photo');
      return;
    }

    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    try {
      // Check authentication - getSession kullan
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Geçersiz token hatası varsa session'ı temizle ve login'e yönlendir
      if (sessionError) {
        console.error('Session error during submit:', sessionError);
        if (sessionError.message?.includes('Refresh Token') || sessionError.message?.includes('Invalid')) {
          await supabase.auth.signOut({ scope: 'local' });
        }
        setSubmitting(false);
        router.push('/auth/login');
        return;
      }
      
      if (!session?.user) {
        setSubmitting(false);
        router.push('/auth/login');
        return;
      }
      
      const user = session.user;

      // Upload photos to Supabase Storage
      const uploadedUrls: string[] = [];
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listings-images')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('listings-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Get region and city names
      const selectedRegion = regions.find(r => r.id === regionId);
      const selectedCity = cities.find(c => c.id === cityId);

      // Create listing
      const { data: listing, error: listingError } = await (supabase
        .from('listings') as any)
        .insert({
          title: title.trim(),
          description: description.trim(),
          seller_id: user.id,
          category_id: categoryId || null,
          subcategory_id: subcategoryId || null,
          listing_type: listingType,
          condition: condition,
          country_id: userCountryId || null, // Kullanıcının ülkesi otomatik eklenir
          region_id: regionId || null,
          city_id: cityId || null,
          city_name: selectedCity?.name || '',
          district_name: selectedRegion?.name || null,
          images: uploadedUrls,
          thumbnail_url: uploadedUrls[0],
          price: listingType === 'free' || listingType === 'exchange' || listingType === 'need' || listingType === 'ownership' ? 0 : 0, // Will be updated based on listing type
          currency: 'GBP',
          status: 'active',
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Reset state before navigation to prevent stuck button
      setSubmitting(false);
      router.push(`/listing/${listing.id}`);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      
      // Auth hatası varsa session'ı temizle ve login'e yönlendir
      if (error?.message?.includes('Refresh Token') || error?.message?.includes('Invalid') || error?.status === 401) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        setSubmitting(false);
        router.push('/auth/login');
        return;
      }
      
      alert('Error creating listing. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-3xl font-bold text-zinc-900">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg bg-zinc-100 p-4 text-xs">
            <div>Categories: {categories.length} | Loading: {loadingCategories ? 'Yes' : 'No'}</div>
            <div>Regions: {regions.length} | Loading: {loadingRegions ? 'Yes' : 'No'}</div>
            <div>Cities: {cities.length} | Loading: {loadingCities ? 'Yes' : 'No'}</div>
            <div>Subcategories: {subcategories.length} | Loading: {loadingSubcategories ? 'Yes' : 'No'}</div>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Category * {categories.length > 0 && `(${categories.length} available)`}
          </label>
          <select
            value={categoryId}
            onChange={(e) => {
              console.log('Category selected:', e.target.value);
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
        {countryName && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-900">
              Country
            </label>
            <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              {countryName}
            </div>
          </div>
        )}

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

