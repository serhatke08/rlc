"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        
        setCheckingAuth(false);
        
        // EN BASIT SORGU - sadece gerekli alanlar
        let { data, error: fetchError } = await supabase
          .from("product_categories")
          .select("id, name, slug, description, icon, image_url, listing_count")
          .order("order_index", { ascending: true, nullsFirst: false })
          .order("name", { ascending: true })
          .limit(100);

        // Eğer RLS hatası varsa, alternatif sorgu dene
        if (fetchError) {
          console.error("Error loading categories:", fetchError);
          console.error("Error code:", fetchError.code);
          console.error("Error message:", fetchError.message);
          
          // RLS hatası olabilir - alternatif sorgu dene
          if (fetchError.code === '42501' || fetchError.code === 'PGRST301' || fetchError.message?.includes('permission') || fetchError.message?.includes('policy')) {
            console.log("🔄 RLS policy error detected, trying alternative query...");
            
            const altResult = await supabase
              .from("product_categories")
              .select("id, name, slug, description, icon, image_url, listing_count")
              .limit(100);
            
            if (!altResult.error && altResult.data) {
              // TÜM kategorileri göster - is_active filtresi YOK
              setCategories(altResult.data);
              setLoading(false);
              return;
            }
          }
          
          setError(fetchError.message);
        } else {
          // TÜM kategorileri göster - is_active filtresi YOK
          setCategories(data || []);
        }
      } catch (err: any) {
        console.error("Error in loadCategories:", err);
        setError(err?.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (checkingAuth || loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900">Categories</h1>
          <p className="text-zinc-600">Browse items by category</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900">Categories</h1>
          <p className="text-zinc-600">Browse items by category</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700">Error loading categories: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-900">Categories</h1>
        <p className="text-zinc-600">
          Browse items by category
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/free-stuff-near-me?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                {category.icon ? (
                  <div className="text-4xl">{category.icon}</div>
                ) : category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="h-16 w-16 object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200">
                    <Package className="h-8 w-8 text-emerald-600" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <h3 className="font-semibold text-zinc-900 group-hover:text-emerald-600 transition">
                    {category.name}
                  </h3>
                  {category.listing_count !== null && category.listing_count > 0 && (
                    <p className="text-xs text-zinc-500">
                      {category.listing_count} {category.listing_count === 1 ? "item" : "items"}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-4 text-sm text-zinc-600">
            No categories available
          </p>
        </div>
      )}
    </div>
  );
}

