-- FORCE VISIBILITY FOR ADMIN (The "God Mode" Fix)

-- 1. Ensure RLS is enabled but we have a "catch-all" for the specific admin email
-- This bypasses any complex role logic that might be failing.

drop policy if exists "Admin God Mode" on public.profiles;
create policy "Admin God Mode"
on public.profiles
for all
to authenticated
using (
    -- Hardcode the admin email to guarantee access
    auth.jwt() ->> 'email' = 'admin@elance.com'
    OR
    role = 'admin'
);

-- 2. Ensure Access Profiles are viewable by everyone (needed for the dropdowns)
alter table public.access_profiles enable row level security;
drop policy if exists "Access Profiles Public" on public.access_profiles;
create policy "Access Profiles Public" on public.access_profiles for select using (true);

-- 3. Ensure Franchise Units are viewable by Admin
drop policy if exists "Admin sees all units" on public.franchise_units;
create policy "Admin sees all units" on public.franchise_units for select using (
    auth.jwt() ->> 'email' = 'admin@elance.com' 
    OR 
    (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- 4. HARD UPDATE ADMIN ROLE
-- Just in case the profile got messed up
update public.profiles
set role = 'admin',
    access_profile_id = (select id from public.access_profiles where name = 'Administrador Master' limit 1)
where email = 'admin@elance.com';

-- 5. Fix "User" role for test accounts if they exist, so they don't break things
update public.profiles
set role = 'manager'
where email in ('franquia@sp.com', 'franquia@rj.com');
