ALTER TABLE public.products
ADD COLUMN description_content jsonb DEFAULT '[]'::jsonb;