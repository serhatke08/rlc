-- ============================================
-- SAHİBİNDEN/LETGO TARZI PLATFORM - SQL ŞEMA
-- ============================================
-- Bu dosya yeni platform için tüm tabloları oluşturur
-- Supabase'de yeni projede çalıştırılmalıdır

-- ============================================
-- 1. ŞEHİR VE İLÇE TABLOLARI
-- ============================================

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plate_code INTEGER UNIQUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, slug)
);

-- ============================================
-- 2. ÜRÜN KATEGORİLERİ
-- ============================================

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL, -- Hiyerarşik yapı
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  listing_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  listing_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- ============================================
-- 3. İLANLAR TABLOSU (ANA TABLO)
-- ============================================

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Temel Bilgiler
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Kategori
  category_id UUID REFERENCES product_categories(id),
  subcategory_id UUID REFERENCES product_subcategories(id),
  
  -- Fiyat ve Durum
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'used', 'for_parts')),
  is_negotiable BOOLEAN DEFAULT TRUE, -- Pazarlık yapılabilir mi?
  
  -- Konum
  city_id UUID REFERENCES cities(id),
  district_id UUID REFERENCES districts(id),
  city_name TEXT NOT NULL, -- Hızlı arama için (denormalize)
  district_name TEXT,
  neighborhood TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Görseller (Supabase Storage URL'leri)
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], -- En az 1 fotoğraf zorunlu olacak (frontend'de kontrol)
  thumbnail_url TEXT, -- İlk fotoğraf thumbnail olarak
  
  -- Durum
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deleted', 'expired', 'pending')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  
  -- İstatistikler
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Tarihler
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- İlan süresi (30 gün)
  sold_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ, -- Premium ilan bitiş tarihi
  
  -- SEO
  slug TEXT UNIQUE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB -- Ek bilgiler (marka, model, vb.)
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON listings(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured, featured_until) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_premium ON listings(is_premium) WHERE is_premium = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_slug ON listings(slug);

-- Full-text search için
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING GIN (
  to_tsvector('turkish', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- ============================================
-- 4. İLAN YORUMLARI
-- ============================================

CREATE TABLE IF NOT EXISTS listing_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES listing_comments(id) ON DELETE CASCADE, -- Yanıt için
  is_approved BOOLEAN DEFAULT TRUE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_listing ON listing_comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON listing_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON listing_comments(parent_id);

-- ============================================
-- 5. İLAN FAVORİLERİ
-- ============================================

CREATE TABLE IF NOT EXISTS listing_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON listing_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON listing_favorites(listing_id);

-- ============================================
-- 6. İLAN GÖRÜNTÜLEMELERİ
-- ============================================

CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL olabilir (anonim)
  ip_address INET,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_views_listing ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_views_user ON listing_views(user_id);
CREATE INDEX IF NOT EXISTS idx_views_viewed_at ON listing_views(viewed_at DESC);

-- ============================================
-- 7. İLAN ŞİKAYETLERİ
-- ============================================

CREATE TABLE IF NOT EXISTS listing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_listing ON listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON listing_reports(status);

-- ============================================
-- 8. ARAMA GEÇMİŞİ
-- ============================================

CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  search_query TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::JSONB, -- {category, price_min, price_max, city, condition}
  result_count INTEGER,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_searched_at ON search_history(searched_at DESC);

-- ============================================
-- 9. TRIGGER'LAR
-- ============================================

-- Updated_at trigger fonksiyonu (eğer yoksa)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Listings updated_at trigger
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Product categories updated_at trigger
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Product subcategories updated_at trigger
CREATE TRIGGER update_product_subcategories_updated_at
  BEFORE UPDATE ON product_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Listing comments updated_at trigger
CREATE TRIGGER update_listing_comments_updated_at
  BEFORE UPDATE ON listing_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. COUNTER TRIGGER'LAR
-- ============================================

-- Listing favorite_count trigger
CREATE OR REPLACE FUNCTION update_listing_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET favorite_count = favorite_count + 1 WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET favorite_count = favorite_count - 1 WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_favorite_count
  AFTER INSERT OR DELETE ON listing_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_favorite_count();

-- Listing comment_count trigger
CREATE OR REPLACE FUNCTION update_listing_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET comment_count = comment_count + 1 WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET comment_count = comment_count - 1 WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
  AFTER INSERT OR DELETE ON listing_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_comment_count();

-- Category listing_count trigger
CREATE OR REPLACE FUNCTION update_category_listing_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_categories SET listing_count = listing_count + 1 WHERE id = NEW.category_id;
    IF NEW.subcategory_id IS NOT NULL THEN
      UPDATE product_subcategories SET listing_count = listing_count + 1 WHERE id = NEW.subcategory_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_categories SET listing_count = listing_count - 1 WHERE id = OLD.category_id;
    IF OLD.subcategory_id IS NOT NULL THEN
      UPDATE product_subcategories SET listing_count = listing_count - 1 WHERE id = OLD.subcategory_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Eski kategoriyi azalt
    UPDATE product_categories SET listing_count = listing_count - 1 WHERE id = OLD.category_id;
    IF OLD.subcategory_id IS NOT NULL THEN
      UPDATE product_subcategories SET listing_count = listing_count - 1 WHERE id = OLD.subcategory_id;
    END IF;
    -- Yeni kategoriyi artır
    UPDATE product_categories SET listing_count = listing_count + 1 WHERE id = NEW.category_id;
    IF NEW.subcategory_id IS NOT NULL THEN
      UPDATE product_subcategories SET listing_count = listing_count + 1 WHERE id = NEW.subcategory_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_listing_count
  AFTER INSERT OR UPDATE OR DELETE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_category_listing_count();

-- ============================================
-- 11. RLS (Row Level Security) POLİTİKALARI
-- ============================================

-- Listings RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = seller_id);

-- Listing Comments RLS
ALTER TABLE listing_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON listing_comments
  FOR SELECT USING (is_approved = TRUE OR user_id = auth.uid());

CREATE POLICY "Users can create comments" ON listing_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON listing_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON listing_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Listing Favorites RLS
ALTER TABLE listing_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" ON listing_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites" ON listing_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON listing_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Listing Views RLS
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create view records" ON listing_views
  FOR INSERT WITH CHECK (true);

-- Listing Reports RLS
ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports" ON listing_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON listing_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Product Categories RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON product_categories
  FOR SELECT USING (is_active = TRUE);

-- Product Subcategories RLS
ALTER TABLE product_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories are viewable by everyone" ON product_subcategories
  FOR SELECT USING (is_active = TRUE);

-- Cities & Districts RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Districts are viewable by everyone" ON districts
  FOR SELECT USING (true);

-- Search History RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 12. HELPER FUNCTIONS
-- ============================================

-- Slug oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug_text TEXT;
BEGIN
  -- Türkçe karakterleri değiştir
  slug_text := lower(title);
  slug_text := translate(slug_text, 'çğıöşüÇĞIİÖŞÜ', 'cgiosuCGIIOSU');
  slug_text := regexp_replace(slug_text, '[^a-z0-9]+', '-', 'g');
  slug_text := trim(both '-' from slug_text);
  
  -- Rastgele sayı ekle (benzersizlik için)
  slug_text := slug_text || '-' || substr(md5(random()::text), 1, 8);
  
  RETURN slug_text;
END;
$$ LANGUAGE plpgsql;

-- İlan görüntüleme sayısını artır
CREATE OR REPLACE FUNCTION increment_listing_view(listing_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE listings 
  SET view_count = view_count + 1 
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 13. İLK VERİLER (ÖRNEK)
-- ============================================

-- Türkiye şehirleri (önemli olanlar)
INSERT INTO cities (name, slug, plate_code, order_index) VALUES
  ('İstanbul', 'istanbul', 34, 1),
  ('Ankara', 'ankara', 6, 2),
  ('İzmir', 'izmir', 35, 3),
  ('Bursa', 'bursa', 16, 4),
  ('Antalya', 'antalya', 7, 5),
  ('Adana', 'adana', 1, 6),
  ('Konya', 'konya', 42, 7),
  ('Gaziantep', 'gaziantep', 27, 8),
  ('Şanlıurfa', 'sanliurfa', 63, 9),
  ('Kocaeli', 'kocaeli', 41, 10)
ON CONFLICT (slug) DO NOTHING;

-- Örnek kategoriler
INSERT INTO product_categories (name, slug, description, icon, order_index) VALUES
  ('Elektronik', 'elektronik', 'Telefon, bilgisayar, tablet ve diğer elektronik ürünler', '📱', 1),
  ('Ev & Yaşam', 'ev-yasam', 'Mobilya, dekorasyon, ev eşyaları', '🏠', 2),
  ('Giyim & Aksesuar', 'giyim-aksesuar', 'Kıyafet, ayakkabı, çanta ve aksesuarlar', '👕', 3),
  ('Otomotiv', 'otomotiv', 'Araba, motosiklet ve yedek parçalar', '🚗', 4),
  ('Spor & Outdoor', 'spor-outdoor', 'Spor malzemeleri, bisiklet, kamp eşyaları', '⚽', 5),
  ('Kitap & Dergi', 'kitap-dergi', 'Kitaplar, dergiler, eğitim materyalleri', '📚', 6),
  ('Müzik & Enstrüman', 'muzik-enstruman', 'Müzik aletleri, plak, CD', '🎵', 7),
  ('Hobi & Oyun', 'hobi-oyun', 'Oyun konsolları, hobi malzemeleri', '🎮', 8),
  ('Bebek & Çocuk', 'bebek-cocuk', 'Bebek ve çocuk ürünleri', '👶', 9),
  ('Kozmetik & Kişisel Bakım', 'kozmetik-kisisel-bakim', 'Kozmetik ürünleri, kişisel bakım', '💄', 10)
ON CONFLICT (slug) DO NOTHING;

-- Elektronik alt kategorileri
INSERT INTO product_subcategories (category_id, name, slug, icon, order_index)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.icon,
  sub.order_index
FROM product_categories c
CROSS JOIN (VALUES
  ('Telefon', 'telefon', '📱', 1),
  ('Bilgisayar', 'bilgisayar', '💻', 2),
  ('Tablet', 'tablet', '📱', 3),
  ('Kamera', 'kamera', '📷', 4),
  ('Kulaklık', 'kulaklik', '🎧', 5),
  ('Televizyon', 'televizyon', '📺', 6),
  ('Oyun Konsolu', 'oyun-konsolu', '🎮', 7),
  ('Diğer', 'diger-elektronik', '⚡', 8)
) AS sub(name, slug, icon, order_index)
WHERE c.slug = 'elektronik'
ON CONFLICT (category_id, slug) DO NOTHING;

-- ============================================
-- SON
-- ============================================

-- Not: Bu şema yeni bir Supabase projesinde çalıştırılmalıdır
-- Mevcut forum verilerini migrate etmek için ayrı bir script gerekli

