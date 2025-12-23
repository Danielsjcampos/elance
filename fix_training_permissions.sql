-- Fix Training Permissions (RLS)

-- 1. Ensure Table Permissions
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

-- 2. Clean up old policies to avoid conflicts
DROP POLICY IF EXISTS "Everyone reads training" ON public.trainings;
DROP POLICY IF EXISTS "Admin manages training" ON public.trainings;
DROP POLICY IF EXISTS "Authenticated read training" ON public.trainings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.trainings;

-- 3. Create Permissive Policies

-- Allow ANY authenticated user to VIEW trainings
CREATE POLICY "Authenticated read training" ON public.trainings
    FOR SELECT TO authenticated USING (true);

-- Allow Admins to DO EVERYTHING (Insert, Update, Delete)
CREATE POLICY "Admin manages training" ON public.trainings
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 4. Do the same for Completions table just in case
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own completion" ON public.training_completions;
DROP POLICY IF EXISTS "Users can view own completions" ON public.training_completions;

CREATE POLICY "Users can insert own completion" ON public.training_completions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own completions" ON public.training_completions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions" ON public.training_completions
    FOR SELECT TO authenticated USING (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
