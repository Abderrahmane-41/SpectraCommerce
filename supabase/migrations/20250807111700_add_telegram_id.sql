-- Add telegram_chat_id column to store_settings table
ALTER TABLE public.store_settings 
ADD COLUMN telegram_chat_id TEXT DEFAULT NULL;