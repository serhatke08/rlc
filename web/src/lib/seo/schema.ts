import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ReloopCycle",
    url: "https://reloopcycle.vercel.app",
    logo: "https://reloopcycle.vercel.app/logo.png",
    description: "UK's leading circular economy marketplace for giving, swapping, and reusing items",
    sameAs: [
      // Add social media links when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+44-XXX-XXX-XXXX",
      contactType: "Customer Service",
      email: "support@reloopcycle.com",
      areaServed: "GB",
      availableLanguage: "en"
    }
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ReloopCycle",
    url: "https://reloopcycle.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://reloopcycle.vercel.app/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export async function generateProductSchema(listingId: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data: listing } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      price,
      condition,
      images,
      thumbnail_url,
      created_at,
      city:cities(name),
      region:regions(name),
      country:countries(name),
      seller:profiles(username, display_name)
    `)
    .eq("id", listingId)
    .single();

  if (!listing) return null;

  const listingData = listing as any;
  const imageUrl = listingData.thumbnail_url || listingData.images?.[0];
  const price = parseFloat(listingData.price || "0");
  const isFree = price === 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listingData.title,
    description: listingData.description,
    image: imageUrl ? [imageUrl] : [],
    offers: {
      "@type": "Offer",
      price: isFree ? "0" : price.toString(),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: `https://reloopcycle.vercel.app/listing/${listingData.id}`
    },
    condition: `https://schema.org/${listingData.condition === "new" ? "NewCondition" : "UsedCondition"}`,
    category: "Second Hand Items",
    brand: {
      "@type": "Brand",
      name: "ReloopCycle"
    },
    seller: {
      "@type": "Person",
      name: listingData.seller?.display_name || listingData.seller?.username
    }
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

