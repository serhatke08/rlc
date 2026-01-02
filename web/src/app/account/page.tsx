import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Package, Star } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { EditListingButton } from "@/components/edit-listing-button";
import { AvatarUpload } from "@/components/avatar-upload";
import { LogoutButton } from "@/components/logout-button";
import { ProfileTabs } from "@/components/account/profile-tabs";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Profil bilgilerini country bilgisiyle birlikte çek
  const { data: profile, error: profileError } = await supabase
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

  if (profileError) {
    console.error("Error loading profile:", profileError);
  }

  // MY ITEMS: Kullanıcının aktif ilanlarını çek
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (listingsError) {
    console.error("Error loading listings:", listingsError);
  }

  // NOT: Completed transactions filtrelemesi artık RLS (Row Level Security) policy'si ile
  // database seviyesinde yapılıyor. JavaScript tarafında ek filtreleme gerekmez.
  // RLS policy: supabasesql/44_filter_completed_transactions_rls.sql
  const filteredListings = listings || [];

  // GIVEN: Kullanıcının verdiği ürünler (item_transactions)
  // RLS policy'si nedeniyle listing'leri direkt çekemeyebiliriz, bu yüzden listing_id'leri alıp ayrı sorgu yapalım
  const { data: givenTransactions, error: givenError } = await supabase
    .from("item_transactions")
    .select(`
      id,
      listing_id,
      created_at
    `)
    .eq("seller_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (givenError) {
    console.error("Error loading given transactions:", givenError);
  }

  // Given transaction'ların listing'lerini çek
  let givenListings: any[] = [];
  if (givenTransactions && givenTransactions.length > 0) {
    const givenListingIds = (givenTransactions as Array<{ id: string; listing_id: string | null; created_at: string }>)
      .map(t => t.listing_id)
      .filter(Boolean) as string[];
    
    if (givenListingIds.length > 0) {
      const { data: listings } = await supabase
        .from("listings")
        .select("*")
        .in("id", givenListingIds);
      
      givenListings = listings || [];
    }
  }

  // RECEIVED: Kullanıcının aldığı ürünler (item_transactions)
  const { data: receivedTransactions, error: receivedError } = await supabase
    .from("item_transactions")
    .select(`
      id,
      listing_id,
      created_at
    `)
    .eq("buyer_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (receivedError) {
    console.error("Error loading received transactions:", receivedError);
  }

  // Received transaction'ların listing'lerini çek
  let receivedListings: any[] = [];
  if (receivedTransactions && receivedTransactions.length > 0) {
    const receivedListingIds = (receivedTransactions as Array<{ id: string; listing_id: string | null; created_at: string }>)
      .map(t => t.listing_id)
      .filter(Boolean) as string[];
    
    if (receivedListingIds.length > 0) {
      const { data: listings } = await supabase
        .from("listings")
        .select("*")
        .in("id", receivedListingIds);
      
      receivedListings = listings || [];
    }
  }

  // Ülke bilgisini formatla
  const listingsData = filteredListings as any[];
  
  // Given ve Received için transaction'ları listing'lerle eşleştir
  const givenData = ((givenTransactions || []) as Array<{ id: string; listing_id: string | null; created_at: string }>).map(trans => ({
    id: trans.id,
    listing_id: trans.listing_id,
    created_at: trans.created_at,
    listing: givenListings.find(l => l.id === trans.listing_id) || null
  }));
  
  const receivedData = ((receivedTransactions || []) as Array<{ id: string; listing_id: string | null; created_at: string }>).map(trans => ({
    id: trans.id,
    listing_id: trans.listing_id,
    created_at: trans.created_at,
    listing: receivedListings.find(l => l.id === trans.listing_id) || null
  }));

  // Profil yoksa veya hata varsa bilgi göster
  if (!profile) {
    if (profileError) {
      return (
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Profile Error</h2>
            <p className="text-red-700 mb-4">
              There was an error loading your profile: {profileError.message}
            </p>
            <p className="text-sm text-zinc-600">
              Please refresh the page or try again later.
            </p>
          </div>
        </div>
      );
    }
    
    // Profil yoksa ama hata da yoksa (yeni kullanıcı olabilir) - default değerlerle göster
    // Bu durumda profil oluşturulması gerekebilir ama şimdilik default gösterelim
  }

  // Profil verilerini güvenli şekilde al
  const profileData = (profile || {}) as any;
  const safeProfileData = {
    ...profileData,
    display_name: profileData?.display_name || profileData?.username || "User",
    username: profileData?.username || "user",
    follower_count: profileData?.follower_count || 0,
    following_count: profileData?.following_count || 0,
    reputation: profileData?.reputation || 0,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Profil Başlık Kartı */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {/* Üst Gradient Banner */}
        <div className="relative h-32 bg-gradient-to-r from-[#9c6cfe] via-[#6c9ffc] to-[#0ad2dd]">
          {/* Avatar */}
          <div className="absolute bottom-0 left-6 translate-y-1/2 z-20">
            <AvatarUpload 
              currentAvatarUrl={safeProfileData?.avatar_url} 
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
                {safeProfileData.display_name}
              </h1>
              <p className="text-base text-zinc-500">@{safeProfileData.username}</p>
            </div>

            {/* İstatistikler */}
            <div className="flex items-center gap-6 text-sm">
              {/* Takipçi */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900">
                  {safeProfileData.follower_count}
                </span>
                <span className="text-zinc-500">Followers</span>
              </div>

              {/* Takip */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900">
                  {safeProfileData.following_count}
                </span>
                <span className="text-zinc-500">Following</span>
              </div>

              {/* Güvenilirlik Puanı */}
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-zinc-900">
                  {safeProfileData.reputation}
                </span>
                <span className="text-zinc-500">Points</span>
              </div>
            </div>

            {/* Ülke */}
            {profileData?.country && (
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {profileData.country.name} {profileData.country.flag_emoji || ''}
                </span>
              </div>
            )}

            {/* Bio */}
            {safeProfileData.bio && (
              <p className="mt-4 text-sm text-zinc-600">{safeProfileData.bio}</p>
            )}

            {/* Çıkış Butonu */}
            <div className="mt-6">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Items, Given, Received Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-zinc-700" />
          <h2 className="text-xl font-semibold text-zinc-900">My Items</h2>
        </div>

        <ProfileTabs 
          items={listingsData}
          given={givenData}
          received={receivedData}
        />
      </div>
    </div>
  );
}

