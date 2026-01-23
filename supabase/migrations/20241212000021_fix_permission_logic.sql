-- STRICT ROLE MAPPING & PERMISSION SYNC
-- This migration updates the sync logic to strictly follow the User's configuration from the Access Profiles table.

-- 1. Update the Sync Function with STRICT Logic
create or replace function public.sync_profile_role()
returns trigger as $$
declare
    v_profile_name text;
begin
    -- 1. Get the name of the access_profile being assigned
    select name into v_profile_name
    from public.access_profiles
    where id = new.access_profile_id;
    
    -- 2. Strict Role Mapping based on User Logic
    if v_profile_name = 'Administrador Master' then
        -- ONLY the Master Admin gets global 'admin' status
        new.role := 'admin';
        
    elsif v_profile_name IN ('Franqueado', 'Gerente de Franquia', 'Gerente') then
        -- Franchisees and Managers get 'manager' status (Unit Access)
        -- They see everything within their linked franchise_unit_id
        new.role := 'manager';
        
    else
        -- Everyone else (Vendedor, Marketing, Advogado, etc.) gets 'user' status
        -- They are restricted to their own data or specific policies granted to 'user'
        new.role := 'user'; 
    end if;

    -- Return the updated record
    return new;
end;
$$ language plpgsql security definer;

-- 2. Trigger is already there from previous migration, but let's ensure it's active
drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
before insert or update of access_profile_id
on public.profiles
for each row execute function public.sync_profile_role();

-- 3. Ensure Access Profiles from "Table Editor" Image exist
-- We perform "DO NOTHING" on conflict to preserve user's definitions if they exist, 
-- but we make sure the rows are there for the mapping to work.
insert into public.access_profiles (name, description, permissions)
values 
    ('Administrador Master', 'Acesso total ao sistema', '{"all": true}'::jsonb),
    ('Franqueado', 'Dono da franquia, acesso total à sua unidade', '{"franchise_admin": true, "view_financial": true}'::jsonb),
    ('Gerente de Franquia', 'Gestão completa da unidade', '{"team": true, "leads": true, "tasks": true}'::jsonb),
    ('Gerente', 'Gerencia equipe e processos da unidade', '{"manage_team": true}'::jsonb),
    ('Vendedor', 'Acesso focado em vendas e leads', '{"leads": true, "tasks": true}'::jsonb),
    ('Marketing', 'Gestão de campanhas e materiais', '{"marketing": true}'::jsonb),
    ('Advogado', 'Acesso a processos e documentos jurídicos', '{"view_legal": true}'::jsonb)
on conflict (name) do nothing;

-- 4. FORCE RE-SYNC OF ALL EXISTING PROFILES
-- This applies the new logic to everyone currently in the database.
update public.profiles
set access_profile_id = access_profile_id
where access_profile_id is not null;
