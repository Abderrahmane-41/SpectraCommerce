-- Run this in the Supabase SQL editor or add to your migrations
-- filepath: c:\Users\HP\Desktop\github projects\E-com_Websites\SpectraCommerce\supabase\migrations\20250806212025_add_custom_options.sql

-- Add new custom_options column as JSONB type with default empty object
ALTER TABLE orders 
ADD COLUMN custom_options JSONB DEFAULT '{}'::jsonb;

-- Add comment to the column for documentation
COMMENT ON COLUMN orders.custom_options IS 'Stores custom product options as key-value pairs';