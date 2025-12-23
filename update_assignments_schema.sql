-- Add responsible collaborator to Auctions
ALTER TABLE public.auctions 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id);

-- Policy to allow viewing assigned auctions (already covered by 'Franchise sees own', but good to be explicit if logic changes)
-- Existing policies are based on Franchise ID, so as long as the user is in the franchise, they see it.
