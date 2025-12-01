-- ============================================
-- UK CITIES AND AREAS DATA
-- ============================================
-- İngiltere için şehir ve bölge verileri
-- Freecycle.org mantığına uygun

-- Major UK Cities
INSERT INTO cities (name, slug, country_code, order_index) VALUES
  ('London', 'london', 'GB', 1),
  ('Manchester', 'manchester', 'GB', 2),
  ('Birmingham', 'birmingham', 'GB', 3),
  ('Liverpool', 'liverpool', 'GB', 4),
  ('Leeds', 'leeds', 'GB', 5),
  ('Sheffield', 'sheffield', 'GB', 6),
  ('Bristol', 'bristol', 'GB', 7),
  ('Edinburgh', 'edinburgh', 'GB', 8),
  ('Glasgow', 'glasgow', 'GB', 9),
  ('Cardiff', 'cardiff', 'GB', 10),
  ('Newcastle upon Tyne', 'newcastle-upon-tyne', 'GB', 11),
  ('Nottingham', 'nottingham', 'GB', 12),
  ('Leicester', 'leicester', 'GB', 13),
  ('Southampton', 'southampton', 'GB', 14),
  ('Brighton', 'brighton', 'GB', 15),
  ('Belfast', 'belfast', 'GB', 16),
  ('Coventry', 'coventry', 'GB', 17),
  ('Reading', 'reading', 'GB', 18),
  ('Preston', 'preston', 'GB', 19),
  ('Oxford', 'oxford', 'GB', 20)
ON CONFLICT (slug) DO UPDATE SET country_code = 'GB';

-- London Areas/Postcodes
INSERT INTO districts (city_id, name, slug, order_index)
SELECT 
  c.id,
  d.name,
  d.slug,
  d.order_index
FROM cities c
CROSS JOIN (VALUES
  ('Westminster', 'westminster', 1),
  ('Camden', 'camden', 2),
  ('Islington', 'islington', 3),
  ('Hackney', 'hackney', 4),
  ('Tower Hamlets', 'tower-hamlets', 5),
  ('Greenwich', 'greenwich', 6),
  ('Lewisham', 'lewisham', 7),
  ('Southwark', 'southwark', 8),
  ('Lambeth', 'lambeth', 9),
  ('Wandsworth', 'wandsworth', 10),
  ('Hammersmith and Fulham', 'hammersmith-fulham', 11),
  ('Kensington and Chelsea', 'kensington-chelsea', 12),
  ('City of London', 'city-of-london', 13)
) AS d(name, slug, order_index)
WHERE c.slug = 'london'
ON CONFLICT (city_id, slug) DO NOTHING;

-- Manchester Areas
INSERT INTO districts (city_id, name, slug, order_index)
SELECT 
  c.id,
  d.name,
  d.slug,
  d.order_index
FROM cities c
CROSS JOIN (VALUES
  ('City Centre', 'city-centre', 1),
  ('Salford', 'salford', 2),
  ('Stockport', 'stockport', 3),
  ('Oldham', 'oldham', 4),
  ('Rochdale', 'rochdale', 5),
  ('Bury', 'bury', 6),
  ('Bolton', 'bolton', 7),
  ('Wigan', 'wigan', 8),
  ('Trafford', 'trafford', 9)
) AS d(name, slug, order_index)
WHERE c.slug = 'manchester'
ON CONFLICT (city_id, slug) DO NOTHING;

-- Birmingham Areas
INSERT INTO districts (city_id, name, slug, order_index)
SELECT 
  c.id,
  d.name,
  d.slug,
  d.order_index
FROM cities c
CROSS JOIN (VALUES
  ('City Centre', 'city-centre', 1),
  ('Edgbaston', 'edgbaston', 2),
  ('Moseley', 'moseley', 3),
  ('Kings Heath', 'kings-heath', 4),
  ('Harborne', 'harborne', 5),
  ('Selly Oak', 'selly-oak', 6),
  ('Sutton Coldfield', 'sutton-coldfield', 7),
  ('Solihull', 'solihull', 8)
) AS d(name, slug, order_index)
WHERE c.slug = 'birmingham'
ON CONFLICT (city_id, slug) DO NOTHING;

-- Liverpool Areas
INSERT INTO districts (city_id, name, slug, order_index)
SELECT 
  c.id,
  d.name,
  d.slug,
  d.order_index
FROM cities c
CROSS JOIN (VALUES
  ('City Centre', 'city-centre', 1),
  ('Toxteth', 'toxteth', 2),
  ('Wavertree', 'wavertree', 3),
  ('Aigburth', 'aigburth', 4),
  ('Woolton', 'woolton', 5),
  ('Allerton', 'allerton', 6),
  ('Childwall', 'childwall', 7)
) AS d(name, slug, order_index)
WHERE c.slug = 'liverpool'
ON CONFLICT (city_id, slug) DO NOTHING;

-- Leeds Areas
INSERT INTO districts (city_id, name, slug, order_index)
SELECT 
  c.id,
  d.name,
  d.slug,
  d.order_index
FROM cities c
CROSS JOIN (VALUES
  ('City Centre', 'city-centre', 1),
  ('Headingley', 'headingley', 2),
  ('Chapel Allerton', 'chapel-allerton', 3),
  ('Roundhay', 'roundhay', 4),
  ('Horsforth', 'horsforth', 5),
  ('Garforth', 'garforth', 6)
) AS d(name, slug, order_index)
WHERE c.slug = 'leeds'
ON CONFLICT (city_id, slug) DO NOTHING;

-- ============================================
-- UK FREECYCLE CATEGORIES
-- ============================================

-- Freecycle Categories for UK
INSERT INTO product_categories (name, slug, description, icon, order_index, is_active) VALUES
  ('Furniture', 'furniture', 'Sofas, tables, chairs, beds and other furniture', '🪑', 1, true),
  ('Electronics', 'electronics', 'TVs, computers, phones, appliances', '📱', 2, true),
  ('Clothing & Accessories', 'clothing-accessories', 'Clothes, shoes, bags, accessories', '👕', 3, true),
  ('Home & Garden', 'home-garden', 'Kitchen items, garden tools, decorations', '🏠', 4, true),
  ('Baby & Kids', 'baby-kids', 'Baby items, toys, children''s furniture', '👶', 5, true),
  ('Sports & Leisure', 'sports-leisure', 'Sports equipment, bikes, games', '⚽', 6, true),
  ('Books & Media', 'books-media', 'Books, DVDs, CDs, magazines', '📚', 7, true),
  ('Vehicles', 'vehicles', 'Cars, bikes, parts', '🚗', 8, true),
  ('Pets', 'pets', 'Pet supplies, cages, accessories', '🐾', 9, true),
  ('Other', 'other', 'Everything else', '📦', 10, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  is_active = true;

-- Furniture Subcategories
INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.order_index,
  true
FROM product_categories c
CROSS JOIN (VALUES
  ('Sofas & Couches', 'sofas-couches', 1),
  ('Tables', 'tables', 2),
  ('Chairs', 'chairs', 3),
  ('Beds & Mattresses', 'beds-mattresses', 4),
  ('Wardrobes & Storage', 'wardrobes-storage', 5),
  ('Desks', 'desks', 6),
  ('Other Furniture', 'other-furniture', 7)
) AS sub(name, slug, order_index)
WHERE c.slug = 'furniture'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Electronics Subcategories
INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.order_index,
  true
FROM product_categories c
CROSS JOIN (VALUES
  ('TVs & Monitors', 'tvs-monitors', 1),
  ('Computers & Laptops', 'computers-laptops', 2),
  ('Phones & Tablets', 'phones-tablets', 3),
  ('Audio Equipment', 'audio-equipment', 4),
  ('Kitchen Appliances', 'kitchen-appliances', 5),
  ('Other Electronics', 'other-electronics', 6)
) AS sub(name, slug, order_index)
WHERE c.slug = 'electronics'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Clothing Subcategories
INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.order_index,
  true
FROM product_categories c
CROSS JOIN (VALUES
  ('Men''s Clothing', 'mens-clothing', 1),
  ('Women''s Clothing', 'womens-clothing', 2),
  ('Children''s Clothing', 'childrens-clothing', 3),
  ('Shoes', 'shoes', 4),
  ('Bags & Accessories', 'bags-accessories', 5)
) AS sub(name, slug, order_index)
WHERE c.slug = 'clothing-accessories'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Home & Garden Subcategories
INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.order_index,
  true
FROM product_categories c
CROSS JOIN (VALUES
  ('Kitchen Items', 'kitchen-items', 1),
  ('Garden Tools', 'garden-tools', 2),
  ('Home Decor', 'home-decor', 3),
  ('Bedding & Linens', 'bedding-linens', 4),
  ('Lighting', 'lighting', 5)
) AS sub(name, slug, order_index)
WHERE c.slug = 'home-garden'
ON CONFLICT (category_id, slug) DO NOTHING;

