-- AUTO-HEAL & DIAGNOSTIC FIX MIGRATION
-- This migration ensures the integrity of Collaborator Roles and Permissions

-- 1. SECURITY DEFINER Function to sync 'role' (RLS key) with 'access_profile_id' (UI key, Foreign Key)
create or replace function public.sync_profile_role()
returns trigger as $$
declare
    v_profile_name text;
begin
    -- 1. Get the name of the access_profile being assigned
    select name into v_profile_name
    from public.access_profiles
    where id = new.access_profile_id;
    
    -- 2. Determine the correct Role Slug for RLS
    if v_profile_name = 'Administrador Master' then
        new.role := 'admin';
    elsif v_profile_name = 'Franqueado' then
        new.role := 'manager';
    elsif v_profile_name = 'Gerente' then
        new.role := 'manager'; -- Managing unit, likely needs manager view
    else
        -- 'Vendedor', 'Advogado', custom...
        new.role := 'user'; 
        -- NOTE: 'user' role usually sees ONLY THEMSELVES. 
        -- If 'Vendedor' needs to see Leads, they need RLS policies on LEADS table, not PROFILES table.
        -- If 'Vendedor' needs to see other colleagues, we might need a broader role or policy adjustment.
        -- For now, 'user' is the safest default for RLS on Profiles.
    end if;

    -- Return the updated record
    return new;
end;
$$ language plpgsql security definer;

-- 2. Trigger to Auto-Execute this on Insert/Update of access_profile_id
drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
before insert or update of access_profile_id
on public.profiles
for each row execute function public.sync_profile_role();

-- 3. FIX EXISTING DATA (The "Scan & Repair")
-- We perform a dummy update to trigger the function for all rows that have a profile
update public.profiles
set access_profile_id = access_profile_id
where access_profile_id is not null;

-- 4. FIX ORPHANED USERS (Users in Auth but not in Profiles)
insert into public.profiles (id, email, full_name, role, access_profile_id)
select 
    au.id, 
    au.email, 
    coalesce(au.raw_user_meta_data->>'full_name', 'Usuário Recuperado'), 
    'user',
    (select id from public.access_profiles where name = 'Vendedor' limit 1) -- Default to Vendedor safe entry
from auth.users au
where not exists (select 1 from public.profiles p where p.id = au.id);

-- 5. ENSURE SUPER ADMIN IS ADMIN
update public.profiles
set role = 'admin',
    access_profile_id = (select id from public.access_profiles where name = 'Administrador Master' limit 1)
where email IN ('admin@elance.com', 'admin@elance.com.br');
