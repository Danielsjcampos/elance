-- Add icon_url to franchise_units if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'franchise_units' AND column_name = 'icon_url') THEN
        ALTER TABLE public.franchise_units ADD COLUMN icon_url TEXT;
    END IF;
END $$;

-- Create a storage bucket for franchise assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('franchise-assets', 'franchise-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload franchise assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'franchise-assets' );

-- Policy to allow public to view files
CREATE POLICY "Public can view franchise assets"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'franchise-assets' );

-- Policy to allow authenticated users to update files
CREATE POLICY "Authenticated users can update franchise assets"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'franchise-assets' );

-- Policy to allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete franchise assets"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'franchise-assets' );
