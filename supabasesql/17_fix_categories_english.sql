-- ============================================
-- FIX CATEGORIES - ALL ENGLISH
-- ============================================
-- This script updates all categories and subcategories to English
-- Run this in Supabase SQL Editor

-- Update main categories to English
UPDATE product_categories SET
  name = CASE slug
    WHEN 'elektronik' THEN 'Electronics'
    WHEN 'ev-yasam' THEN 'Home & Living'
    WHEN 'giyim-aksesuar' THEN 'Clothing & Accessories'
    WHEN 'otomotiv' THEN 'Vehicles'
    WHEN 'spor-outdoor' THEN 'Sports & Outdoor'
    WHEN 'kitap-dergi' THEN 'Books & Media'
    WHEN 'muzik-enstruman' THEN 'Music & Instruments'
    WHEN 'hobi-oyun' THEN 'Hobbies & Games'
    WHEN 'bebek-cocuk' THEN 'Baby & Kids'
    WHEN 'kozmetik-kisisel-bakim' THEN 'Beauty & Personal Care'
    ELSE name
  END,
  description = CASE slug
    WHEN 'elektronik' THEN 'Phones, computers, tablets and other electronics'
    WHEN 'ev-yasam' THEN 'Furniture, decoration, home items'
    WHEN 'giyim-aksesuar' THEN 'Clothing, shoes, bags and accessories'
    WHEN 'otomotiv' THEN 'Cars, motorcycles and spare parts'
    WHEN 'spor-outdoor' THEN 'Sports equipment, bicycles, camping gear'
    WHEN 'kitap-dergi' THEN 'Books, magazines, educational materials'
    WHEN 'muzik-enstruman' THEN 'Musical instruments, records, CDs'
    WHEN 'hobi-oyun' THEN 'Gaming consoles, hobby supplies'
    WHEN 'bebek-cocuk' THEN 'Baby and children products'
    WHEN 'kozmetik-kisisel-bakim' THEN 'Cosmetics, personal care products'
    ELSE description
  END
WHERE slug IN ('elektronik', 'ev-yasam', 'giyim-aksesuar', 'otomotiv', 'spor-outdoor', 'kitap-dergi', 'muzik-enstruman', 'hobi-oyun', 'bebek-cocuk', 'kozmetik-kisisel-bakim');

-- Update Electronics subcategories (for 'elektronik' slug)
UPDATE product_subcategories SET
  name = CASE slug
    WHEN 'telefon' THEN 'Phones'
    WHEN 'bilgisayar' THEN 'Computers'
    WHEN 'tablet' THEN 'Tablets'
    WHEN 'televizyon' THEN 'TVs'
    WHEN 'kamera' THEN 'Cameras'
    WHEN 'kulaklik' THEN 'Headphones'
    WHEN 'oyun-konsolu' THEN 'Gaming Consoles'
    WHEN 'diger-elektronik' THEN 'Other Electronics'
    ELSE name
  END
WHERE category_id IN (SELECT id FROM product_categories WHERE slug = 'elektronik');

-- Update all subcategories that contain Turkish characters
UPDATE product_subcategories SET
  name = CASE 
    -- Electronics
    WHEN name = 'Telefon' THEN 'Phones'
    WHEN name = 'Bilgisayar' THEN 'Computers'
    WHEN name = 'Tablet' THEN 'Tablets'
    WHEN name = 'Kamera' THEN 'Cameras'
    WHEN name = 'Kulaklık' THEN 'Headphones'
    WHEN name = 'Televizyon' THEN 'TVs'
    WHEN name = 'Oyun Konsolu' THEN 'Gaming Consoles'
    WHEN name = 'Diğer' AND category_id IN (SELECT id FROM product_categories WHERE slug = 'elektronik') THEN 'Other Electronics'
    
    -- Home & Living
    WHEN name = 'Mobilya' THEN 'Furniture'
    WHEN name = 'Dekorasyon' THEN 'Decoration'
    WHEN name = 'Mutfak Eşyaları' THEN 'Kitchen Items'
    WHEN name = 'Yatak Odası' THEN 'Bedroom'
    WHEN name = 'Oturma Odası' THEN 'Living Room'
    
    -- Clothing
    WHEN name = 'Erkek Giyim' THEN 'Men''s Clothing'
    WHEN name = 'Kadın Giyim' THEN 'Women''s Clothing'
    WHEN name = 'Çocuk Giyim' THEN 'Children''s Clothing'
    WHEN name = 'Ayakkabı' THEN 'Shoes'
    WHEN name = 'Çanta' THEN 'Bags'
    WHEN name = 'Aksesuar' THEN 'Accessories'
    
    -- Vehicles
    WHEN name = 'Araba' THEN 'Cars'
    WHEN name = 'Motosiklet' THEN 'Motorcycles'
    WHEN name = 'Bisiklet' THEN 'Bicycles'
    WHEN name = 'Yedek Parça' THEN 'Spare Parts'
    
    -- Sports
    WHEN name = 'Futbol' THEN 'Football'
    WHEN name = 'Basketbol' THEN 'Basketball'
    WHEN name = 'Tenis' THEN 'Tennis'
    WHEN name = 'Kamp' THEN 'Camping'
    
    -- Books
    WHEN name = 'Roman' THEN 'Novels'
    WHEN name = 'Ders Kitabı' THEN 'Textbooks'
    WHEN name = 'Dergi' THEN 'Magazines'
    
    -- Music
    WHEN name = 'Gitar' THEN 'Guitars'
    WHEN name = 'Piyano' THEN 'Pianos'
    
    -- Baby
    WHEN name = 'Bebek Giyim' THEN 'Baby Clothing'
    WHEN name = 'Oyuncak' THEN 'Toys'
    WHEN name = 'Bebek Mobilyası' THEN 'Baby Furniture'
    
    -- Beauty
    WHEN name = 'Makyaj' THEN 'Makeup'
    WHEN name = 'Parfüm' THEN 'Perfume'
    WHEN name = 'Kişisel Bakım' THEN 'Personal Care'
    
    ELSE name
  END
WHERE name ~ '[ÇĞIİÖŞÜçğıöşü]' OR name IN (
  'Telefon', 'Bilgisayar', 'Tablet', 'Kamera', 'Kulaklık', 'Televizyon', 'Oyun Konsolu', 'Diğer',
  'Mobilya', 'Dekorasyon', 'Mutfak Eşyaları', 'Yatak Odası', 'Oturma Odası',
  'Erkek Giyim', 'Kadın Giyim', 'Çocuk Giyim', 'Ayakkabı', 'Çanta', 'Aksesuar',
  'Araba', 'Motosiklet', 'Bisiklet', 'Yedek Parça',
  'Futbol', 'Basketbol', 'Tenis', 'Kamp',
  'Roman', 'Ders Kitabı', 'Dergi',
  'Gitar', 'Piyano',
  'Bebek Giyim', 'Oyuncak', 'Bebek Mobilyası',
  'Makyaj', 'Parfüm', 'Kişisel Bakım'
);

-- Final check: Show all categories and subcategories to verify
SELECT 'Categories:' as type, id, name, slug, description, is_active 
FROM product_categories 
ORDER BY order_index;

SELECT 'Subcategories:' as type, ps.id, ps.name, ps.slug, pc.name as category_name
FROM product_subcategories ps
JOIN product_categories pc ON ps.category_id = pc.id
ORDER BY pc.order_index, ps.order_index;

