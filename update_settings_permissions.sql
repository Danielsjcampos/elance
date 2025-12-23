-- Configuration & Permissions Module

-- 1. Extend Franchise Units for Settings
ALTER TABLE public.franchise_units
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email_contact TEXT,
ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '{}'; -- For future customization

-- 2. Extend Profiles for Granular Permissions
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'; 
-- Example: {"finance": true, "leads": false, "settings": false}
-- If key is missing, UI should fallback to Role default (e.g. Admin usually has all true)

-- 3. Comments
COMMENT ON COLUMN public.profiles.permissions IS 'Granular permissions override. Keys: finance, leads, marketing, settings, documents, training.';
