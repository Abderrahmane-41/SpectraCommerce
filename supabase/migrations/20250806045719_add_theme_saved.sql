-- Add saved_themes column to store_settings table
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS saved_themes JSONB DEFAULT '[]';