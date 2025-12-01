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
  { label: "Aktif ilan", value: "18.4K+" },
  { label: "Kurtarılan ürün", value: "3.1K ton" },
  { label: "Topluluk üyesi", value: "220K" },
];

export const FEATURED_CATEGORIES = [
  {
    slug: "ev-yasam",
    title: "Mobilya & Ev Yaşam",
    description: "Kanepeden mutfak eşyalarına kadar iyi durumdaki parçalar.",
    accent: "text-emerald-600",
    background: "from-emerald-400/15 via-emerald-500/5 to-transparent",
    icon: Sprout,
  },
  {
    slug: "elektronik",
    title: "Elektronik & Tech",
    description: "Laptop, telefon, ekran gibi cihazları döngüde tut.",
    accent: "text-sky-600",
    background: "from-sky-400/20 via-sky-500/10 to-transparent",
    icon: TvMinimalPlay,
  },
  {
    slug: "bebek-cocuk",
    title: "Bebek & Çocuk",
    description: "Hızlı büyüyen minikler için oyun, kitap ve kıyafet.",
    accent: "text-rose-600",
    background: "from-rose-400/15 via-rose-500/5 to-transparent",
    icon: Baby,
  },
  {
    slug: "giyim",
    title: "Giyim & Tekstil",
    description: "Kapsül gardırobuna ikinci bir hayat kazandır.",
    accent: "text-amber-600",
    background: "from-amber-400/15 via-amber-500/5 to-transparent",
    icon: Shirt,
  },
  {
    slug: "hobi",
    title: "Hobi & Oyun",
    description: "Bisikletler, oyun konsolları ve maker projeleri.",
    accent: "text-indigo-600",
    background: "from-indigo-400/20 via-indigo-500/10 to-transparent",
    icon: Sparkles,
  },
  {
    slug: "kargo",
    title: "Koli Hazır",
    description: "Paketlenmiş ve teslim almaya hazır ilanlar.",
    accent: "text-zinc-600",
    background: "from-zinc-200/50 via-zinc-100 to-transparent",
    icon: Package,
  },
];

export const LANDING_PAGES = [
  { slug: "free-stuff-near-me", title: "Free Stuff Near Me", blurb: "Konumuna göre ücretsiz ilanları keşfet." },
  { slug: "give-away-items-uk", title: "Give Away Items UK", blurb: "İhtiyacın olmayanları İngiltere topluluğuyla paylaş." },
  { slug: "swap-items-online", title: "Swap Items Online", blurb: "Takasa uygun ilanlarla yeni sahip bul." },
  { slug: "reuse-items-platform", title: "Reuse Items Platform", blurb: "Eşyaları çöpe değil döngüsel ekonomiye gönder." },
  { slug: "zero-waste-community-uk", title: "Zero Waste Community UK", blurb: "Sıfır atık odaklı ilanları listele." },
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
  { icon: Leaf, title: "Döngüsel ekonomi", copy: "Ürünleri çöpten kurtar, karbon ayak izini küçült." },
  { icon: Recycle, title: "Topluluk güveni", copy: "Gerçek kullanıcı profilleri ve şeffaf geçmiş." },
  { icon: Sparkles, title: "SEO landing", copy: "Her niş arama için optimize edilmiş sayfalar." },
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

