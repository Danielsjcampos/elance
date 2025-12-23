
-- Add site_title and featured_image_url columns to franchise_units table
ALTER TABLE public.franchise_units 
ADD COLUMN IF NOT EXISTS site_title text,
ADD COLUMN IF NOT EXISTS featured_image_url text;

-- Notify that columns are added
SELECT 'Columns added successfully' as result;
