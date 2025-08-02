-- Create new migration file: supabase/migrations/add_inventory_management.sql
-- Add min_quantity and max_quantity columns to products table
ALTER TABLE "public"."products" 
ADD COLUMN "min_quantity" integer NOT NULL DEFAULT 1,
ADD COLUMN "max_quantity" integer DEFAULT NULL;

-- Add check constraint to ensure max_quantity >= min_quantity when max_quantity is not null
ALTER TABLE "public"."products" 
ADD CONSTRAINT "products_quantity_check" 
CHECK (max_quantity IS NULL OR max_quantity >= min_quantity);

-- Create index for better performance on inventory queries
CREATE INDEX idx_products_inventory ON public.products USING btree (min_quantity, max_quantity);

-- Update existing products to have default values
UPDATE "public"."products" 
SET min_quantity = 1, max_quantity = NULL 
WHERE min_quantity IS NULL;