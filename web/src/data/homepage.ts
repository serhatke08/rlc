import {
  Baby,
  Cat,
  DollarSign,
  Gift,
  Handshake,
  Leaf,
  Layers,
  Package,
  Recycle,
  Shirt,
  ShoppingBag,
  Sparkles,
  Sprout,
  TvMinimalPlay,
} from "lucide-react";

export const HERO_STATS = [
  { label: "Active listings", value: "18.4K+" },
  { label: "Items saved", value: "3.1K tons" },
  { label: "Community members", value: "220K" },
];

export const FEATURED_CATEGORIES = [
  {
    slug: "ev-yasam",
    title: "Furniture & Home Living",
    description: "Pieces in good condition from sofas to kitchenware.",
    accent: "text-emerald-600",
    background: "from-emerald-400/15 via-emerald-500/5 to-transparent",
    icon: Sprout,
  },
  {
    slug: "elektronik",
    title: "Elektronik & Tech",
    description: "Keep devices like laptops, phones, and screens in the loop.",
    accent: "text-sky-600",
    background: "from-sky-400/20 via-sky-500/10 to-transparent",
    icon: TvMinimalPlay,
  },
  {
    slug: "bebek-cocuk",
    title: "Baby & Kids",
    description: "Toys, books, and clothes for fast-growing little ones.",
    accent: "text-rose-600",
    background: "from-rose-400/15 via-rose-500/5 to-transparent",
    icon: Baby,
  },
  {
    slug: "giyim",
    title: "Clothing & Textiles",
    description: "Give your capsule wardrobe a second life.",
    accent: "text-amber-600",
    background: "from-amber-400/15 via-amber-500/5 to-transparent",
    icon: Shirt,
  },
  {
    slug: "hobi",
    title: "Hobbies & Games",
    description: "Bikes, game consoles, and maker projects.",
    accent: "text-indigo-600",
    background: "from-indigo-400/20 via-indigo-500/10 to-transparent",
    icon: Sparkles,
  },
  {
    slug: "kargo",
    title: "Ready to Ship",
    description: "Listings packaged and ready for pickup.",
    accent: "text-zinc-600",
    background: "from-zinc-200/50 via-zinc-100 to-transparent",
    icon: Package,
  },
];

export const LANDING_PAGES = [
  { slug: "free-stuff-near-me", title: "Free Stuff Near Me", blurb: "Discover free listings based on your location." },
  { slug: "give-away-items-uk", title: "Give Away Items UK", blurb: "Share items you don't need with the UK community." },
  { slug: "swap-items-online", title: "Swap Items Online", blurb: "Find new owners with swap-friendly listings." },
  { slug: "reuse-items-platform", title: "Reuse Items Platform", blurb: "Send items to the circular economy, not the trash." },
  { slug: "zero-waste-community-uk", title: "Zero Waste Community UK", blurb: "List zero-waste focused listings." },
];

export const POPULAR_SEARCHES = [
  "free sofa london",
  "baby stroller manchester",
  "bike swap bristol",
  "office chair giveaway",
  "camping gear glasgow",
  "moving boxes brighton",
];

export const FEATURE_TAGS = [
  { icon: Leaf, title: "Circular economy", copy: "Save products from the trash, reduce your carbon footprint." },
  { icon: Recycle, title: "Community trust", copy: "Real user profiles and transparent history." },
  { icon: Sparkles, title: "SEO landing", copy: "Optimized pages for every niche search." },
];

export const LISTING_FILTERS = [
  { key: "all", label: "All", color: "bg-zinc-100 text-zinc-700", icon: Layers },
  { key: "free", label: "Free", color: "bg-emerald-100 text-emerald-800", icon: Gift },
  { key: "swap", label: "Swap", color: "bg-sky-100 text-sky-700", icon: Handshake },
  { key: "sale", label: "Sale", color: "bg-orange-100 text-orange-700", icon: DollarSign },
  { key: "need", label: "I Need", color: "bg-purple-100 text-purple-700", icon: ShoppingBag },
  { key: "adoption", label: "Adoption", color: "bg-cyan-100 text-cyan-700", icon: Cat },
];

export const UK_REGIONS = [
  { slug: "london", label: "London" },
  { slug: "manchester", label: "Manchester" },
  { slug: "bristol", label: "Bristol" },
  { slug: "edinburgh", label: "Edinburgh" },
  { slug: "glasgow", label: "Glasgow" },
  { slug: "cardiff", label: "Cardiff" },
  { slug: "birmingham", label: "Birmingham" },
  { slug: "liverpool", label: "Liverpool" },
  { slug: "leeds", label: "Leeds" },
  { slug: "brighton", label: "Brighton" },
];

