ALTER TABLE public.store_settings
ADD COLUMN google_sheet_api_url TEXT;

ALTER TABLE public.orders
ADD COLUMN is_synced_to_gsheet BOOLEAN DEFAULT FALSE;