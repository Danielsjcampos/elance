-- COMPREHENSIVE VISIBILITY FIX
-- 1. Disable RLS on profiles temporarily to confirm if that's the blocker.
--    (We will re-enable it properly later, but for dev we want to see data)
alter table public.profiles disable row level security;

-- 2. Ensure Access Profiles are visible (Reference table)
alter table public.access_profiles enable row level security;
drop policy if exists "Access Profiles Public" on public.access_profiles;
create policy "Access Profiles Public" on public.access_profiles for select using (true);

-- 3. LINK 'teste' USER TO A ROLE
-- The trigger created 'teste' with role='manager' but NULL access_profile_id.
-- Let's link them to the 'Franqueado' profile ID so they aren't "orphaned".

do $$
declare
    v_franqueado_id uuid;
begin
    select id into v_franqueado_id from public.access_profiles where name = 'Franqueado' limit 1;
    
    if v_franqueado_id is not null then
        update public.profiles
        set access_profile_id = v_franqueado_id
        where email = 'teste@gmail.com';
    end if;
end $$;

-- 4. FIX ADMIN PERMISSIONS
update public.profiles
set role = 'admin',
    access_profile_id = (select id from public.access_profiles where name = 'Administrador Master')
where email = 'admin@elance.com';
