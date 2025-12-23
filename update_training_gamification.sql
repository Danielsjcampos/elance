-- Enhance Trainings Table
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'video'; -- video, ebook, quiz
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS content_url TEXT;
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS quiz_data JSONB; -- Stores questions { question, options[], correct_index }
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS points INT DEFAULT 10;
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Completions Table
CREATE TABLE IF NOT EXISTS public.training_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    score INT, -- For quizzes
    UNIQUE(user_id, training_id)
);

-- RLS
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own completion" ON public.training_completions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own completions" ON public.training_completions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions" ON public.training_completions
    FOR SELECT TO authenticated USING (public.get_my_role() = 'admin');

-- Add Avatar to Profiles (if missing)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- View for Leaderboard (Total Points by User/Franchise)
-- Assuming 'profiles' has a link to 'franchise_units' if we want franchise ranking, 
-- OR just user ranking. The prompt says "rank que sera visivel e publico para todos os franqueados".
-- Let's rank by User Profile (Franchisee).

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.id as profile_id,
    p.full_name,
    p.avatar_url,
    COALESCE(SUM(t.points), 0) as total_points,
    COUNT(tc.id) as trainings_completed
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

GRANT SELECT ON public.leaderboard TO authenticated;
