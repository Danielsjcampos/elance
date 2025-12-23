-- Secure Leaderboard Function (Bypass RLS for Ranking)
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
    profile_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    total_points BIGINT, -- Sum returns bigint/numeric or can be cast
    trainings_completed BIGINT
) 
SECURITY DEFINER -- Runs with creator (admin/postgres) privileges
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as profile_id,
        p.full_name,
        p.avatar_url,
        COALESCE(SUM(t.points), 0)::BIGINT as total_points,
        COUNT(tc.id)::BIGINT as trainings_completed
    FROM 
        public.profiles 
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

GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
