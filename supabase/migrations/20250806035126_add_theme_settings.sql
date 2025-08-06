-- Add theme_settings column to store_settings table
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT '{"backgroundMain": "#f7f7f7", "primaryGradientStart": "#8A2BE2", "primaryGradientEnd": "#4682B4"}';

-- Update existing rows to have default theme_settings
UPDATE public.store_settings
SET theme_settings = '{"backgroundMain": "#f7f7f7", "primaryGradientStart": "#8A2BE2", "primaryGradientEnd": "#4682B4"}'
WHERE theme_settings IS NULL;