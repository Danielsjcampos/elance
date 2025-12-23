-- FORCE INSERT TASK
-- Run this if the list is empty to confirm if reading works.

INSERT INTO public.tasks (
    title, 
    description, 
    status, 
    franchise_id, 
    created_at
) 
VALUES (
    'TAREFA DE TESTE MANUAL', 
    'Se você vê esta tarefa, a leitura está funcionando.', 
    'todo', 
    (SELECT id FROM public.franchise_units LIMIT 1),
    NOW()
);
