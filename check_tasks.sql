-- DIAGNOSTIC & REPAIR
-- Run this in Supabase SQL Editor

-- 1. Check how many tasks exist
SELECT count(*) as "Total Tasks Existing" FROM public.tasks;

-- 2. Force Insert a Task (Bypassing RLS if disabled, or using Service Role)
INSERT INTO public.tasks (
    title,
    description,
    status,
    franchise_id,
    created_at,
    created_by
)
VALUES (
    'TAREFA DE DIAGNOSTICO',
    'Esta tarefa foi criada via SQL direto. Se voce ve isso, a leitura funciona.',
    'todo',
    (SELECT id FROM public.franchise_units LIMIT 1),
    NOW(),
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- 3. Verify it exists
SELECT * FROM public.tasks WHERE title = 'TAREFA DE DIAGNOSTICO';
