-- Upgrade Marketing Module for Social Media & Assets

-- 1. Add new columns for categorization
ALTER TABLE public.marketing_materials 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'template', -- 'template', 'asset', 'guide'
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'general', -- 'facebook', 'instagram_feed', 'instagram_story', 'linkedin', 'general'
ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'jpg'; -- 'canva', 'psd', 'png', 'jpg', 'video'

-- 2. Helper comments
COMMENT ON COLUMN public.marketing_materials.category IS 'Type of material: template, asset (logo/photo), or guide';
COMMENT ON COLUMN public.marketing_materials.platform IS 'Target platform: facebook, instagram_feed, etc.';
