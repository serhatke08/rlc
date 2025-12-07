'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Upload, X, Loader2 } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Subcategory = {
  id: string;
  name: string;
  slug: string;
};

type Region = {
  id: string;
  name: string;
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
  const [loading, setLoading] = useState(false);
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

  // Load cities when region changes
  useEffect(() => {
    if (regionId) {
      loadCities(regionId);
    } else {
      setCities([]);
      setCityId('');
    }
  }, [regionId]);

  const loadInitialData = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load user's country
      const { data: profile } = await supabase
        .from('profiles')
        .select('country_id')
        .eq('id', user.id)
        .single();

      const profileData = profile as any;
      if (profileData?.country_id) {
        setUserCountryId(profileData.country_id);
        await loadRegions(profileData.country_id);
      }

      // Load categories - RLS politikası USING (true) olmalı
      // is_active filtresini client-side'da yapacağız
      let { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('id, name, slug, is_active')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });

      // Eğer RLS hatası varsa, alternatif sorgu dene
      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        
        // RLS hatası olabilir - alternatif sorgu dene
        if (categoriesError.code === '42501' || categoriesError.code === 'PGRST301' || categoriesError.message?.includes('permission') || categoriesError.message?.includes('policy')) {
          console.log('🔄 RLS policy error detected, trying alternative query...');
          
          const altResult = await supabase
            .from('product_categories')
            .select('id, name, slug')
            .limit(100);
          
          if (!altResult.error && altResult.data) {
            // Client-side'da is_active filtresi yap
            const activeCategories = altResult.data.filter((cat: any) => cat.is_active !== false);
            setCategories(activeCategories);
          } else {
            throw categoriesError;
          }
        } else {
          throw categoriesError;
        }
      } else if (categoriesData) {
        // Client-side'da is_active filtresi yap
        // is_active = true veya is_active IS NULL olanları göster
        const activeCategories = categoriesData.filter((cat: any) => cat.is_active !== false);
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegions = async (countryId: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('regions')
      .select('id, name')
      .eq('country_id', countryId)
      .order('name');

    if (error) {
      console.error('Error loading regions:', error);
    } else if (data) {
      setRegions(data);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('product_subcategories')
      .select('id, name, slug')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('order_index')
      .order('name');

    if (error) {
      console.error('Error loading subcategories:', error);
    } else if (data) {
      setSubcategories(data);
    }
  };

  const loadCities = async (regionId: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('cities')
      .select('id, name')
      .eq('region_id', regionId)
      .order('is_major', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error loading cities:', error);
    } else if (data) {
      setCities(data);
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
    
    if (photos.length === 0) {
      alert('Please add at least one photo');
      return;
    }

    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

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

      router.push(`/listing/${listing.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Error creating listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-3xl font-bold text-zinc-900">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
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
            disabled={!categoryId || subcategories.length === 0}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Select (Optional)</option>
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

        {/* Region */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Region *
          </label>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            required
            disabled={!userCountryId}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Select a region</option>
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
            disabled={!regionId || cities.length === 0}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm disabled:bg-zinc-50 disabled:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Select a city</option>
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

