-- ====================================
-- CLEAN CATEGORIES AND SUBCATEGORIES
-- Delete all existing categories and subcategories
-- WARNING: This will delete all categories and subcategories!
-- ====================================

-- ====================================
-- 1. FIRST, NULL OUT FOREIGN KEYS IN LISTINGS TABLE
-- (Because of foreign key constraints)
-- ====================================

-- Set subcategory_id to NULL in listings table
UPDATE listings 
SET subcategory_id = NULL 
WHERE subcategory_id IS NOT NULL;

-- Set category_id to NULL in listings table
UPDATE listings 
SET category_id = NULL 
WHERE category_id IS NOT NULL;

-- ====================================
-- 2. DELETE ALL SUBCATEGORIES
-- ====================================

DELETE FROM product_subcategories;

-- ====================================
-- 3. DELETE ALL CATEGORIES
-- ====================================

DELETE FROM product_categories;

-- ====================================
-- 3. RESET SEQUENCES (if any)
-- ====================================

-- Note: UUID columns don't use sequences, but if you have any serial columns, reset them here

-- ====================================
-- SUCCESS MESSAGE
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '✅ All categories and subcategories deleted!';
  RAISE NOTICE '✅ Tables are now clean and ready for new data';
END $$;

