import "server-only";

import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";
import type {
  FeaturedListing,
  ListingCondition,
  ListingIntent,
  ListingLifecycle,
} from "@/types/listing";

type RawListing = {
  id: string;
  title: string;
  description: string;
  city_name: string;
  district_name: string | null;
  status: string | null;
  condition: ListingCondition;
  images: string[];
  thumbnail_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  slug: string | null;
  view_count: number | null;
  comment_count: number | null;
  favorite_count: number | null;
  listing_type: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  country: { name: string; code: string; flag_emoji: string | null } | null;
  region: { name: string; code: string | null } | null;
  city: { name: string; is_major: boolean } | null;
  category: { id: string; name: string; slug: string; icon: string | null } | null;
  subcategory: { id: string; name: string; slug: string } | null;
  seller: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null;
};

export async function getFeaturedListings(options?: {
  regionId?: string | null;
  cityId?: string | null;
  categoryId?: string | null;
}): Promise<FeaturedListing[]> {
  // Cache'i devre dışı bırak - her zaman fresh data çek
  const supabase = await createSupabaseServerClient();

  // Kullanıcının ülkesini al
  let userCountryId: string | null = null;
  try {
    const user = await getServerUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("country_id")
        .eq("id", user.id)
        .single();
      
      const profileData = profile as { country_id?: string } | null;
      if (profileData?.country_id) {
        userCountryId = profileData.country_id;
      }
    }
  } catch (error) {
    // Kullanıcı giriş yapmamışsa veya profil yoksa devam et
    // Don't log - this is expected for anonymous users
  }

  // Sorgu oluştur
  let query = supabase
    .from("listings")
    .select(
      `
        id,
        title,
        description,
        city_name,
        district_name,
        status,
        condition,
        images,
        thumbnail_url,
        metadata,
        created_at,
        slug,
        view_count,
        comment_count,
        favorite_count,
        price,
        listing_type,
        category_id,
        subcategory_id,
        currency,
        is_featured,
        country_id,
        region_id,
        city_id,
        country:countries(name, code, flag_emoji),
        region:regions(name, code),
        city:cities(name, is_major),
        category:product_categories(id, name, slug, icon),
        subcategory:product_subcategories(id, name, slug),
        seller:profiles(id, username, display_name, avatar_url)
      `
    )
    .eq("status", "active");

  // Kategori filtresi (en öncelikli - diğer filtrelerle birlikte çalışabilir)
  if (options?.categoryId && options.categoryId.trim() !== '' && options.categoryId !== 'null' && options.categoryId !== 'undefined') {
    query = query.eq("category_id", options.categoryId);
  }

  // Şehir filtresi
  if (options?.cityId && options.cityId.trim() !== '' && options.cityId !== 'null' && options.cityId !== 'undefined') {
    query = query.eq("city_id", options.cityId);
  }
  // Region filtresi (şehir yoksa)
  // "all" regionId = tüm ülke göster
  else if (options?.regionId && options.regionId.trim() !== '' && options.regionId !== 'null' && options.regionId !== 'undefined' && options.regionId !== 'all') {
    query = query.eq("region_id", options.regionId);
  }
  // Kullanıcının ülkesine göre filtrele (region "all" veya region/şehir yoksa)
  else if (userCountryId) {
    query = query.eq("country_id", userCountryId);
  }

  const { data, error } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Supabase listings sorgusu başarısız", error);
    return [];
  }

  if (!data || !data.length) {
    // Hata yok ama veri yok, bu normal olabilir
    return [];
  }

  // Completed transactions'da olan listing'leri filtrele
  // Given ve Received durumundaki ürünler anasayfada görünmemeli
  const listingIds = (data as any[]).map((listing) => listing.id);
  const completedListingIds: Set<string> = new Set();
  
  if (listingIds.length > 0) {
    // Sadece bu listing'ler için completed transaction kontrolü yap
    const { data: completedTransactions } = await supabase
      .from("item_transactions")
      .select("listing_id")
      .in("listing_id", listingIds)
      .eq("status", "completed");
    
    if (completedTransactions) {
      completedTransactions.forEach((t) => {
        if (t?.listing_id) {
          completedListingIds.add(t.listing_id);
        }
      });
    }
  }

  // Completed olanları filtrele
  const filteredData = data.filter(
    (listing) => !completedListingIds.has(listing.id)
  );

  const lifecycleMap: Record<string, ListingLifecycle> = {
    active: "available",
    sold: "claimed",
    pending: "pending",
  };
  
  // listing_type kolonundan veya metadata'dan okunacak veya price'a göre belirlenecek
  const getListingType = (
    listingTypeColumn: string | null,
    metadata: Record<string, unknown> | null, 
    price: string
  ): ListingIntent => {
    // Database'den mapping (Supabase'de farklı isimler kullanılıyor)
    const dbTypeMap: Record<string, ListingIntent> = {
      'free': 'give',
      'exchange': 'swap',
      'sale': 'sell',
      'need': 'need',
      'ownership': 'adoption',
    };
    
    // Önce listing_type kolonunu kontrol et
    if (listingTypeColumn) {
      const mapped = dbTypeMap[listingTypeColumn];
      if (mapped) return mapped;
      
      // Eğer mapping'de yoksa direkt kullan (eski kayıtlar için)
      if (["give", "swap", "lend", "sell", "need", "adoption"].includes(listingTypeColumn)) {
        return listingTypeColumn as ListingIntent;
      }
    }
    
    // Sonra metadata'dan kontrol et
    if (metadata?.listing_type) {
      const type = metadata.listing_type as string;
      const mapped = dbTypeMap[type];
      if (mapped) return mapped;
      
      if (["give", "swap", "lend", "sell", "need", "adoption"].includes(type)) {
        return type as ListingIntent;
      }
    }
    
    // listing_type yoksa price'a göre belirle
    if (!price || price === "0" || price === "0.00") {
      return "give"; // Ücretsiz
    }
    
    return "sell"; // Ücretli
  };

  return (filteredData as (RawListing & { price: string })[]).map<FeaturedListing>((listing) => {
    const metadata = listing.metadata ?? {};

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      city: listing.city?.name ?? listing.city_name ?? "Unknown",
      region: listing.region?.name ?? listing.district_name ?? undefined,
      country: listing.country?.name ?? undefined,
      category: listing.category?.name ?? (metadata["category"] as string) ?? "General",
      categoryId: listing.category_id ?? undefined,
      subcategoryId: listing.subcategory_id ?? undefined,
      condition: listing.condition,
      status: lifecycleMap[listing.status ?? "active"] ?? "available",
      listingType: getListingType(listing.listing_type, metadata, listing.price),
      coverImage: listing.thumbnail_url ?? listing.images?.[0] ?? null,
      tags: (metadata["tags"] as string[]) ?? [],
      createdAt: listing.created_at ?? new Date().toISOString(),
      views: listing.view_count ?? 0,
      comments: listing.comment_count ?? 0,
      favorites: listing.favorite_count ?? 0,
      metadata: listing.metadata ?? undefined,
      seller: listing.seller ? {
        id: listing.seller.id,
        username: listing.seller.username,
        display_name: listing.seller.display_name,
        avatar_url: listing.seller.avatar_url,
      } : null,
    };
  });
}

