-- ====================================
-- INSERT NEW CATEGORIES AND SUBCATEGORIES
-- Complete category structure
-- Run this AFTER 28a_clean_categories.sql
-- ====================================

-- ====================================
-- 1. UPDATE/INSERT MAIN CATEGORIES
-- ====================================

-- Home & Living
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Home & Living', 'home-living', 'Furniture, home decor, kitchen items, and living essentials', 1, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Electronics
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Electronics', 'electronics', 'Phones, computers, TVs, gaming, and tech accessories', 2, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Baby & Kids
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Baby & Kids', 'baby-kids', 'Baby gear, toys, kids clothing, and nursery items', 3, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Clothing & Accessories
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Clothing & Accessories', 'clothing-accessories', 'Men''s, women''s, kids clothing, shoes, bags, and accessories', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Sports & Outdoor
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Sports & Outdoor', 'sports-outdoor', 'Fitness equipment, bicycles, camping gear, and sports items', 5, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Vehicles
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Vehicles', 'vehicles', 'Cars, motorbikes, car parts, and vehicle accessories', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Pets
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Pets', 'pets', 'Pet food, toys, beds, carriers, and pet accessories', 7, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Books & Media
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Books & Media', 'books-media', 'Books, movies, music, instruments, and video games', 8, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Beauty & Personal Care
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Beauty & Personal Care', 'beauty-personal-care', 'Skincare, haircare, makeup, perfumes, and grooming tools', 9, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Hobbies & Crafts
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Hobbies & Crafts', 'hobbies-crafts', 'DIY tools, craft supplies, art materials, board games, and collectibles', 10, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Garden & Outdoor
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Garden & Outdoor', 'garden-outdoor', 'Plants, gardening tools, outdoor furniture, BBQ, and lawn care', 11, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Other
INSERT INTO product_categories (name, slug, description, order_index, is_active)
VALUES ('Other', 'other', 'Miscellaneous and uncategorised items', 12, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- ====================================
-- 2. INSERT SUBCATEGORIES FOR EACH CATEGORY
-- ====================================

-- Home & Living Subcategories
DO $$
DECLARE
  home_living_id UUID;
BEGIN
  SELECT id INTO home_living_id FROM product_categories WHERE slug = 'home-living';
  
  -- Furniture
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Furniture', 'furniture', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Sofa & Armchairs
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Sofa & Armchairs', 'sofa-armchairs', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Tables & Desks
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Tables & Desks', 'tables-desks', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Chairs & Stools
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Chairs & Stools', 'chairs-stools', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Wardrobes & Storage
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Wardrobes & Storage', 'wardrobes-storage', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Beds & Mattresses
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Beds & Mattresses', 'beds-mattresses', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Shelves
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Shelves', 'shelves', 7, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Home Decor
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Home Decor', 'home-decor', 8, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Wall Art
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Wall Art', 'wall-art', 9, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Mirrors
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Mirrors', 'mirrors', 10, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Rugs & Carpets
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Rugs & Carpets', 'rugs-carpets', 11, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Clocks
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Clocks', 'clocks', 12, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Candles & Holders
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Candles & Holders', 'candles-holders', 13, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Kitchen & Appliances
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Kitchen & Appliances', 'kitchen-appliances', 14, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Small Appliances
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Small Appliances', 'small-appliances', 15, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Cookware & Utensils
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Cookware & Utensils', 'cookware-utensils', 16, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Tableware
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Tableware', 'tableware', 17, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Large Appliances
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Large Appliances', 'large-appliances', 18, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Lighting
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Lighting', 'lighting', 19, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Lamps
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Lamps', 'lamps', 20, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Ceiling Lights
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Ceiling Lights', 'ceiling-lights', 21, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- LED & Smart Lights
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'LED & Smart Lights', 'led-smart-lights', 22, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Bathroom
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Bathroom', 'bathroom', 23, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Bathroom Accessories
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Bathroom Accessories', 'bathroom-accessories', 24, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Bathroom Storage
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Bathroom Storage', 'bathroom-storage', 25, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Towels & Mats
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Towels & Mats', 'towels-mats', 26, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Storage & Organization
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (home_living_id, 'Storage & Organization', 'storage-organization', 27, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Electronics Subcategories
DO $$
DECLARE
  electronics_id UUID;
BEGIN
  SELECT id INTO electronics_id FROM product_categories WHERE slug = 'electronics';
  
  -- Phones & Tablets
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Phones & Tablets', 'phones-tablets', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Smartphones
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Smartphones', 'smartphones', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Phone Accessories
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Phone Accessories', 'phone-accessories', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Computers & Laptops
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Computers & Laptops', 'computers-laptops', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Laptops
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Laptops', 'laptops', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- PC Components
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'PC Components', 'pc-components', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Computer Accessories
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Computer Accessories', 'computer-accessories', 7, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- TV & Home Audio
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'TV & Home Audio', 'tv-home-audio', 8, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Televisions
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Televisions', 'televisions', 9, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Speakers
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Speakers', 'speakers', 10, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Headphones
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Headphones', 'headphones', 11, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Gaming
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Gaming', 'gaming', 12, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Gaming Consoles
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Gaming Consoles', 'gaming-consoles', 13, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Video Games
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Video Games', 'video-games', 14, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Gaming Controllers
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Gaming Controllers', 'gaming-controllers', 15, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Cameras & Drones
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Cameras & Drones', 'cameras-drones', 16, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Wearables
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (electronics_id, 'Wearables', 'wearables', 17, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Baby & Kids Subcategories
DO $$
DECLARE
  baby_kids_id UUID;
BEGIN
  SELECT id INTO baby_kids_id FROM product_categories WHERE slug = 'baby-kids';
  
  -- Baby Gear
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Baby Gear', 'baby-gear', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Prams & Strollers
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Prams & Strollers', 'prams-strollers', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Car Seats
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Car Seats', 'car-seats', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- High Chairs
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'High Chairs', 'high-chairs', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Toys
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Toys', 'toys', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Educational Toys
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Educational Toys', 'educational-toys', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Plush Toys
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Plush Toys', 'plush-toys', 7, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Outdoor Toys
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Outdoor Toys', 'outdoor-toys', 8, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Kids Clothing
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Kids Clothing', 'kids-clothing', 9, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Baby Clothing
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Baby Clothing', 'baby-clothing', 10, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Nursery Furniture
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'Nursery Furniture', 'nursery-furniture', 11, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- School Supplies
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (baby_kids_id, 'School Supplies', 'school-supplies', 12, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Clothing & Accessories Subcategories
DO $$
DECLARE
  clothing_id UUID;
BEGIN
  SELECT id INTO clothing_id FROM product_categories WHERE slug = 'clothing-accessories';
  
  -- Men's Clothing
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (clothing_id, 'Men''s Clothing', 'mens-clothing', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Women's Clothing
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (clothing_id, 'Women''s Clothing', 'womens-clothing', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Kids' Clothing
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (clothing_id, 'Kids'' Clothing', 'kids-clothing', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Shoes
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (clothing_id, 'Shoes', 'shoes', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Bags & Backpacks
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (clothing_id, 'Bags & Backpacks', 'bags-backpacks', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Jewellery & Watches
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (clothing_id, 'Jewellery & Watches', 'jewellery-watches', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Seasonal Clothing
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (clothing_id, 'Seasonal Clothing', 'seasonal-clothing', 7, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Sports & Outdoor Subcategories
DO $$
DECLARE
  sports_id UUID;
BEGIN
  SELECT id INTO sports_id FROM product_categories WHERE slug = 'sports-outdoor';
  
  -- Fitness Equipment
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (sports_id, 'Fitness Equipment', 'fitness-equipment', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Bicycles
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (sports_id, 'Bicycles', 'bicycles', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- MTB
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (sports_id, 'MTB', 'mtb', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Road Bikes
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (sports_id, 'Road Bikes', 'road-bikes', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Kids Bikes
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (sports_id, 'Kids Bikes', 'kids-bikes', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- E-Bikes
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (sports_id, 'E-Bikes', 'e-bikes', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Camping & Hiking
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (sports_id, 'Camping & Hiking', 'camping-hiking', 7, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Outdoor Gear
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (sports_id, 'Outdoor Gear', 'outdoor-gear', 8, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Sports Gear
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (sports_id, 'Sports Gear', 'sports-gear', 9, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Vehicles Subcategories
DO $$
DECLARE
  vehicles_id UUID;
BEGIN
  SELECT id INTO vehicles_id FROM product_categories WHERE slug = 'vehicles';
  
  -- Cars
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (vehicles_id, 'Cars', 'cars', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Motorbikes
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (vehicles_id, 'Motorbikes', 'motorbikes', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Car Parts
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (vehicles_id, 'Car Parts', 'car-parts', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Car Accessories
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (vehicles_id, 'Car Accessories', 'car-accessories', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Pets Subcategories
DO $$
DECLARE
  pets_id UUID;
BEGIN
  SELECT id INTO pets_id FROM product_categories WHERE slug = 'pets';
  
  -- Pet Food
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (pets_id, 'Pet Food', 'pet-food', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Pet Toys
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (pets_id, 'Pet Toys', 'pet-toys', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Pet Beds
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (pets_id, 'Pet Beds', 'pet-beds', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Carriers & Cages
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (pets_id, 'Carriers & Cages', 'carriers-cages', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Aquariums
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (pets_id, 'Aquariums', 'aquariums', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Pet Grooming Items
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (pets_id, 'Pet Grooming Items', 'pet-grooming-items', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Books & Media Subcategories
DO $$
DECLARE
  books_id UUID;
BEGIN
  SELECT id INTO books_id FROM product_categories WHERE slug = 'books-media';
  
  -- Books
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'Books', 'books', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Novels
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'Novels', 'novels', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- School Books
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'School Books', 'school-books', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Children's Books
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'Children''s Books', 'childrens-books', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Movies & DVDs
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'Movies & DVDs', 'movies-dvds', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Music & Instruments
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'Music & Instruments', 'music-instruments', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Guitars
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'Guitars', 'guitars', 7, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Keyboards
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'Keyboards', 'keyboards', 8, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Drums
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'Drums', 'drums', 9, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- DJ Equipment
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'DJ Equipment', 'dj-equipment', 10, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Video Games
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (books_id, 'Video Games', 'video-games', 11, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Beauty & Personal Care Subcategories
DO $$
DECLARE
  beauty_id UUID;
BEGIN
  SELECT id INTO beauty_id FROM product_categories WHERE slug = 'beauty-personal-care';
  
  -- Skin Care
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (beauty_id, 'Skin Care', 'skin-care', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Hair Care
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (beauty_id, 'Hair Care', 'hair-care', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Grooming Tools
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (beauty_id, 'Grooming Tools', 'grooming-tools', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Perfumes
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (beauty_id, 'Perfumes', 'perfumes', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Makeup
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (beauty_id, 'Makeup', 'makeup', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Oral Care
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (beauty_id, 'Oral Care', 'oral-care', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Hobbies & Crafts Subcategories
DO $$
DECLARE
  hobbies_id UUID;
BEGIN
  SELECT id INTO hobbies_id FROM product_categories WHERE slug = 'hobbies-crafts';
  
  -- DIY Tools
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (hobbies_id, 'DIY Tools', 'diy-tools', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Craft Supplies
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (hobbies_id, 'Craft Supplies', 'craft-supplies', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Art Materials
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (hobbies_id, 'Art Materials', 'art-materials', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Sewing & Knitting
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (hobbies_id, 'Sewing & Knitting', 'sewing-knitting', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Board Games & Puzzles
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (hobbies_id, 'Board Games & Puzzles', 'board-games-puzzles', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Collectibles
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (hobbies_id, 'Collectibles', 'collectibles', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Garden & Outdoor Subcategories
DO $$
DECLARE
  garden_id UUID;
BEGIN
  SELECT id INTO garden_id FROM product_categories WHERE slug = 'garden-outdoor';
  
  -- Plants
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (garden_id, 'Plants', 'plants', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Gardening Tools
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (garden_id, 'Gardening Tools', 'gardening-tools', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Soil & Pots
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (garden_id, 'Soil & Pots', 'soil-pots', 3, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Outdoor Furniture
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (garden_id, 'Outdoor Furniture', 'outdoor-furniture', 4, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- BBQ & Heating
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (garden_id, 'BBQ & Heating', 'bbq-heating', 5, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Lawn Care
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (garden_id, 'Lawn Care', 'lawn-care', 6, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- Other Subcategories
DO $$
DECLARE
  other_id UUID;
BEGIN
  SELECT id INTO other_id FROM product_categories WHERE slug = 'other';
  
  -- Miscellaneous
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (other_id, 'Miscellaneous', 'miscellaneous', 1, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
  
  -- Uncategorised Items
  INSERT INTO product_subcategories (category_id, name, slug, order_index, is_active)
  VALUES (other_id, 'Uncategorised Items', 'uncategorised-items', 2, true)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    order_index = EXCLUDED.order_index,
    is_active = true;
END $$;

-- ====================================
-- 3. DEACTIVATE OLD CATEGORIES (Optional - keep existing listings)
-- ====================================
-- Eski kategorileri pasif yapmak isterseniz:
-- UPDATE product_categories SET is_active = false WHERE slug NOT IN (
--   'home-living', 'electronics', 'baby-kids', 'clothing-accessories',
--   'sports-outdoor', 'vehicles', 'pets', 'books-media',
--   'beauty-personal-care', 'hobbies-crafts', 'garden-outdoor', 'other'
-- );

-- ====================================
-- SUCCESS MESSAGE
-- ====================================
DO $$
BEGIN
  RAISE NOTICE '✅ Categories and subcategories updated successfully!';
  RAISE NOTICE '✅ 12 main categories created/updated';
  RAISE NOTICE '✅ All subcategories added with proper ordering';
END $$;

