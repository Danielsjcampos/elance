-- Enable RLS on the table (if not already enabled)
ALTER TABLE public.franchise_units ENABLE ROW LEVEL SECURITY;

-- Creating a policy to allow PUBLIC (everyone) to SELECT (read) from the table
-- This is necessary for the public website to fetch the Logo URL and Store Name
CREATE POLICY "Public can view franchise settings"
ON public.franchise_units
FOR SELECT
TO public
USING (true);

-- Ensure the 'franchise-assets' bucket is publicly accessible (just in case)
UPDATE storage.buckets
SET public = true
WHERE id = 'franchise-assets';
