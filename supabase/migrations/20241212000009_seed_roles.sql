-- SEED ACCESS PROFILES & ROLES

-- 0. Ensure Unique Constraint on Name (Required for ON CONFLICT)
-- We check if the constraint exists, if not we add it.
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'access_profiles_name_key') then
        -- Handle potential duplicates before adding constraint (Keep latest or something? simplest is keep one)
        -- We will use a simple dedupe if any exist
        delete from public.access_profiles a using public.access_profiles b
        where a.id < b.id and a.name = b.name;
        
        alter table public.access_profiles add constraint access_profiles_name_key unique (name);
    end if;
end $$;

-- 1. Ensure Access Profiles (Roles) exist
insert into public.access_profiles (name, description, permissions)
values 
    ('Administrador Master', 'Acesso total ao sistema e todas as franquias', '{"all": true}'::jsonb),
    ('Franqueado', 'Dono da franquia, acesso total à sua unidade', '{"franchise_admin": true}'::jsonb),
    ('Gerente', 'Gerencia equipe e processos da unidade', '{"manage_team": true, "view_financial": true}'::jsonb),
    ('Vendedor', 'Acesso a leads e tarefas básicas', '{"view_leads": true, "edit_leads": true}'::jsonb),
    ('Advogado', 'Acesso a processos e documentos jurídicos', '{"view_legal": true}'::jsonb)
on conflict (name) do nothing;

-- 2. Ensure Permissions for Access Profiles Table (so Admins can read it for the dropdown)
alter table public.access_profiles enable row level security;

-- Everyone can read roles (needed for dropdowns)
drop policy if exists "Read Roles" on public.access_profiles;
create policy "Read Roles" on public.access_profiles
for select using (true);
