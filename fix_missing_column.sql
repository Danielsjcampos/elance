-- EMERGENCY FIX: Add missing column
-- Run this in your Supabase SQL Editor

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Force schema cache reload (usually happens auto, but good to trigger)
NOTIFY pgrst, 'reload config';
