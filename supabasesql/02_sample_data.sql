-- ============================================
-- ÖRNEK VERİLER (TEST İÇİN)
-- ============================================
-- Bu dosya test için örnek veriler ekler
-- Production'da kullanılmamalıdır

-- Önce profiles tablosunun olduğundan emin ol
-- (Supabase auth.users'dan otomatik oluşturulur)

-- Örnek ilanlar eklemek için önce bir kullanıcı oluşturmanız gerekir
-- Bu örnekler için manuel olarak user_id eklemeniz gerekecek

-- Örnek: İstanbul ilçeleri
INSERT INTO districts (city_id, name, slug, order_index)
SELECT 
  c.id,
  d.name,
  d.slug,
  d.order_index
FROM cities c
CROSS JOIN (VALUES
  ('Kadıköy', 'kadikoy', 1),
  ('Beşiktaş', 'besiktas', 2),
  ('Şişli', 'sisli', 3),
  ('Beyoğlu', 'beyoglu', 4),
  ('Üsküdar', 'uskudar', 5),
  ('Bakırköy', 'bakirkoy', 6),
  ('Fatih', 'fatih', 7),
  ('Ataşehir', 'atasehir', 8)
) AS d(name, slug, order_index)
WHERE c.slug = 'istanbul'
ON CONFLICT (city_id, slug) DO NOTHING;

-- Örnek: Ankara ilçeleri
INSERT INTO districts (city_id, name, slug, order_index)
SELECT 
  c.id,
  d.name,
  d.slug,
  d.order_index
FROM cities c
CROSS JOIN (VALUES
  ('Çankaya', 'cankaya', 1),
  ('Keçiören', 'kecioren', 2),
  ('Yenimahalle', 'yenimahalle', 3),
  ('Mamak', 'mamak', 4),
  ('Sincan', 'sincan', 5)
) AS d(name, slug, order_index)
WHERE c.slug = 'ankara'
ON CONFLICT (city_id, slug) DO NOTHING;

-- Daha fazla alt kategori örnekleri
-- Ev & Yaşam alt kategorileri
INSERT INTO product_subcategories (category_id, name, slug, icon, order_index)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.icon,
  sub.order_index
FROM product_categories c
CROSS JOIN (VALUES
  ('Mobilya', 'mobilya', '🪑', 1),
  ('Dekorasyon', 'dekorasyon', '🖼️', 2),
  ('Mutfak Gereçleri', 'mutfak-gerecleri', '🍳', 3),
  ('Yatak Odası', 'yatak-odasi', '🛏️', 4),
  ('Salon', 'salon', '🛋️', 5),
  ('Banyo', 'banyo', '🚿', 6)
) AS sub(name, slug, icon, order_index)
WHERE c.slug = 'ev-yasam'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Giyim & Aksesuar alt kategorileri
INSERT INTO product_subcategories (category_id, name, slug, icon, order_index)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.icon,
  sub.order_index
FROM product_categories c
CROSS JOIN (VALUES
  ('Kadın Giyim', 'kadin-giyim', '👗', 1),
  ('Erkek Giyim', 'erkek-giyim', '👔', 2),
  ('Ayakkabı', 'ayakkabi', '👟', 3),
  ('Çanta', 'canta', '👜', 4),
  ('Aksesuar', 'aksesuar', '⌚', 5),
  ('Çocuk Giyim', 'cocuk-giyim', '👶', 6)
) AS sub(name, slug, icon, order_index)
WHERE c.slug = 'giyim-aksesuar'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Otomotiv alt kategorileri
INSERT INTO product_subcategories (category_id, name, slug, icon, order_index)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.icon,
  sub.order_index
FROM product_categories c
CROSS JOIN (VALUES
  ('Otomobil', 'otomobil', '🚗', 1),
  ('Motosiklet', 'motosiklet', '🏍️', 2),
  ('Yedek Parça', 'yedek-parca', '🔧', 3),
  ('Aksesuar', 'otomotiv-aksesuar', '🎛️', 4),
  ('Lastik & Jant', 'lastik-jant', '⭕', 5)
) AS sub(name, slug, icon, order_index)
WHERE c.slug = 'otomotiv'
ON CONFLICT (category_id, slug) DO NOTHING;

-- NOT: Örnek ilanlar eklemek için gerçek user_id'ler gerekir
-- Aşağıdaki örnek sadece şema gösterimi içindir:

/*
-- Örnek ilan (user_id'yi gerçek bir ID ile değiştirin)
INSERT INTO listings (
  title,
  description,
  seller_id,
  category_id,
  subcategory_id,
  price,
  condition,
  city_id,
  district_id,
  city_name,
  district_name,
  images,
  slug
)
SELECT 
  'iPhone 13 Pro Max 256GB',
  'Sıfır gibi, kutulu, garantili. Hiç kullanılmadı.',
  'YOUR_USER_ID_HERE', -- Gerçek user_id ile değiştirin
  c.id,
  sc.id,
  25000.00,
  'like_new',
  city.id,
  dist.id,
  city.name,
  dist.name,
  ARRAY['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  'iphone-13-pro-max-256gb-' || substr(md5(random()::text), 1, 8)
FROM product_categories c
JOIN product_subcategories sc ON sc.category_id = c.id
JOIN cities city ON city.slug = 'istanbul'
JOIN districts dist ON dist.city_id = city.id AND dist.slug = 'kadikoy'
WHERE c.slug = 'elektronik' AND sc.slug = 'telefon'
LIMIT 1;
*/

