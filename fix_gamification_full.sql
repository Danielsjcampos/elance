-- MASTER FIX: Gamification and Leaderboard
-- Run this script to fix:
-- 1. "Permission denied" errors when completing trainings.
-- 2. Empty "Ranking Geral" table (re-creates the RPC function).

-- A. FIX PERMISSIONS (The "Permission Denied" Fix)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Allow users to Read/Write their own completions
GRANT SELECT, INSERT, UPDATE ON TABLE public.training_completions TO authenticated;
-- Allow users to Read trainings content
GRANT SELECT ON TABLE public.trainings TO authenticated;
-- Allow users to Read profiles (for ranking names)
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- B. FIX LEADERBOARD RPC (The "Empty Rank" Fix)
-- Drop first to ensure a clean slate
DROP FUNCTION IF EXISTS public.get_leaderboard();

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
    profile_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    total_points BIGINT,
    trainings_completed BIGINT
) 
SECURITY DEFINER -- Runs with admin privileges to bypass RLS for the ranking aggregation
SET search_path = public -- Security best practice
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as profile_id,
        COALESCE(p.full_name, 'Usuário') as full_name,
        p.avatar_url,
        COALESCE(SUM(t.points), 0)::BIGINT as total_points,
        COUNT(tc.id)::BIGINT as trainings_completed
    FROM 
        public.profiles p
    LEFT JOIN 
        public.training_completions tc ON p.id = tc.user_id
    LEFT JOIN
        public.trainings t ON tc.training_id = t.id
    GROUP BY 
        p.id, p.full_name, p.avatar_url
    ORDER BY 
        total_points DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant access to call this function
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO service_role;

-- C. VERIFY RLS POLICIES (Safety Check)
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;

-- Ensure policy exists for inserting own completion
DROP POLICY IF EXISTS "Users can insert own completion" ON public.training_completions;
CREATE POLICY "Users can insert own completion" ON public.training_completions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Ensure policy exists for viewing own completion
DROP POLICY IF EXISTS "Users can view own completions" ON public.training_completions;
CREATE POLICY "Users can view own completions" ON public.training_completions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
