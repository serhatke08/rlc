import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Package, Star } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { EditListingButton } from "@/components/edit-listing-button";
import { AvatarUpload } from "@/components/avatar-upload";
import { LogoutButton } from "@/components/logout-button";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Profil bilgilerini country bilgisiyle birlikte çek
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      country:countries(
        name,
        code,
        flag_emoji
      )
    `)
    .eq("id", user.id)
    .single();

  // Kullanıcının ilanlarını çek
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });


  // Ülke bilgisini formatla
  const profileData = profile as any;
  const listingsData = (listings || []) as any[];
  const country = profileData?.country;
  const countryName = country 
    ? `${country.name} ${country.flag_emoji || ''}`.trim()
    : "Country not selected";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Profil Başlık Kartı */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {/* Üst Gradient Banner */}
        <div className="relative h-32 bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd]">
          {/* Avatar */}
          <div className="absolute bottom-0 left-6 translate-y-1/2 z-20">
            <AvatarUpload 
              currentAvatarUrl={profileData?.avatar_url} 
              userId={user.id}
              size="lg"
            />
          </div>
        </div>
        
        {/* Profil Bilgileri */}
        <div className="relative px-6 pb-6">

          {/* İsim ve Kullanıcı Adı */}
          <div className="mt-20 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                {profileData?.display_name || profileData?.username || "User"}
              </h1>
              <p className="text-base text-zinc-500">@{profileData?.username}</p>
            </div>

            {/* İstatistikler */}
            <div className="flex items-center gap-6 text-sm">
              {/* Takipçi */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900">
                  {profileData?.follower_count || 0}
                </span>
                <span className="text-zinc-500">Followers</span>
              </div>

              {/* Takip */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900">
                  {profileData?.following_count || 0}
                </span>
                <span className="text-zinc-500">Following</span>
              </div>

              {/* Güvenilirlik Puanı */}
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-zinc-900">
                  {profileData?.reputation || 0}
                </span>
                <span className="text-zinc-500">Points</span>
              </div>
            </div>

            {/* Ülke */}
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <MapPin className="h-4 w-4" />
              <span>{countryName}</span>
            </div>

            {/* Bio */}
            {profileData?.bio && (
              <p className="mt-4 text-sm text-zinc-600">{profileData.bio}</p>
            )}

            {/* Çıkış Butonu */}
            <div className="mt-6">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Paylaştığım Ürünler */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-zinc-700" />
          <h2 className="text-xl font-semibold text-zinc-900">
            My Listings
            <span className="ml-2 text-base font-normal text-zinc-500">
              ({listingsData?.length || 0})
            </span>
          </h2>
        </div>

        {/* Ürün Listesi */}
        {listingsData && listingsData.length > 0 ? (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {listingsData.map((listing: any) => (
              <div
                key={listing.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <Link href={`/listing/${listing.id}`} className="block">
                  {/* Ürün Görseli */}
                  <div className="relative aspect-square bg-zinc-100">
                    {listing.thumbnail_url || listing.images?.[0] ? (
                      <img
                        src={listing.thumbnail_url || listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-12 w-12 text-zinc-300" />
                      </div>
                    )}
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="p-4">
                    <h3 className="font-semibold text-zinc-900 line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {listing.city_name}
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
                
                {/* Butonlar - Sağ Üst Köşe */}
                <div className="absolute right-2 top-2 z-10 flex gap-2">
                  <EditListingButton listingId={listing.id} />
                  <DeleteListingButton listingId={listing.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-4 text-sm text-zinc-600">
              You haven't shared any items yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

