import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Package } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function FavoritesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Kullanıcının favori ilanlarını çek
  const { data: favorites } = await supabase
    .from("listing_favorites")
    .select(`
      id,
      created_at,
      listing:listings(
        id,
        title,
        description,
        price,
        currency,
        condition,
        listing_type,
        status,
        images,
        thumbnail_url,
        city_name,
        view_count,
        comment_count,
        created_at,
        country:countries(name, code, flag_emoji),
        region:regions(name, code),
        city:cities(name, is_major),
        category:product_categories(name, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Sadece aktif ilanları filtrele
  const activeFavorites = favorites?.filter(
    (fav: any) => fav.listing && fav.listing.status === "active"
  ) || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 text-rose-600" />
        <h1 className="text-2xl font-bold text-zinc-900">
          My Favorites
          <span className="ml-2 text-lg font-normal text-zinc-500">
            ({activeFavorites.length})
          </span>
        </h1>
      </div>

      {activeFavorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-4 text-sm text-zinc-600">
            You don't have any favorite items yet
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd] px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {activeFavorites.map((fav: any) => {
            const listing = fav.listing;
            if (!listing) return null;

            return (
              <Link
                key={fav.id}
                href={`/listing/${listing.id}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Ürün Görseli */}
                <div className="relative aspect-square bg-zinc-100">
                  {listing.thumbnail_url || listing.images?.[0] ? (
                    <Image
                      src={listing.thumbnail_url || listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-zinc-300" />
                    </div>
                  )}
                  {/* Favori Badge */}
                  <div className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm">
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  </div>
                </div>

                {/* Ürün Bilgileri */}
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {listing.city?.name || listing.city_name}
                  </p>
                  <p className="mt-2 text-lg font-bold text-emerald-600">
                    {listing.listing_type === 'free' || listing.price === "0" || listing.price === 0 
                      ? "Free" 
                      : listing.listing_type === 'exchange' 
                        ? "Swap" 
                        : listing.listing_type === 'need'
                          ? "I Need"
                          : listing.listing_type === 'ownership'
                            ? "Adoption"
                            : `£${listing.price}`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

