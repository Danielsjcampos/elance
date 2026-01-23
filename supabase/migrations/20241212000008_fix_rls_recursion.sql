-- FIX RLS RECURSION & NO DATA ISSUE

-- 1. DROP PROBLEMATIC POLICIES
drop policy if exists "Admins manage profiles" on public.profiles;
drop policy if exists "Leads Isolation" on public.leads;
drop policy if exists "Auctions Isolation" on public.auctions;
drop policy if exists "Tasks Isolation" on public.tasks;
drop policy if exists "Events Isolation" on public.events;

-- 2. CREATE A ROBUST ADMIN CHECK FUNCTION (Avoids Recursion)
-- This function runs with "security definer", meaning it bypasses RLS and runs as table owner/superuser.
create or replace function public.is_admin_safe()
returns boolean as $$
declare
  v_role text;
begin
  select ap.name into v_role
  from public.profiles p
  join public.access_profiles ap on p.access_profile_id = ap.id
  where p.id = auth.uid();
  
  return (v_role = 'Administrador Master');
end;
$$ language plpgsql security definer;

-- 3. CREATE SAFE "MY FRANCHISE" FUNCTION
create or replace function public.get_my_franchise_safe()
returns uuid as $$
declare
  v_fid uuid;
begin
  select franchise_unit_id into v_fid
  from public.profiles
  where id = auth.uid();
  
  return v_fid;
end;
$$ language plpgsql security definer;


-- 4. RE-APPLY POLICIES USING SAFE FUNCTIONS

-- PROFILES: Critical - Users must be able to read their own profile to check isAdmin!
create policy "Read Own Profile & Admin All" on public.profiles
for select using (
    auth.uid() = id -- Everyone sees themselves (breaks recursion)
    or
    public.is_admin_safe() -- Admin sees everyone
    or
    franchise_unit_id = public.get_my_franchise_safe() -- Franchisees see their unit's staff
);

create policy "Admin Update Profiles" on public.profiles
for update using (
    public.is_admin_safe()
);

create policy "Admin Insert Profiles" on public.profiles
for insert with check (
    public.is_admin_safe()
);

-- LEADS
create policy "Leads Isolation" on public.leads
for all using (
    public.is_admin_safe() 
    or 
    franchise_id = public.get_my_franchise_safe()
);

-- AUCTIONS
create policy "Auctions Isolation" on public.auctions
for all using (
    public.is_admin_safe() 
    or 
    franchise_id = public.get_my_franchise_safe()
);

-- TASKS
create policy "Tasks Isolation" on public.tasks
for all using (
    public.is_admin_safe() 
    or 
    franchise_id = public.get_my_franchise_safe()
);

-- EVENTS
create policy "Events Isolation" on public.events
for all using (
    public.is_admin_safe() 
    or 
    franchise_id = public.get_my_franchise_safe()
);


-- 5. ENSURE PERMISSIONS
grant execute on function public.is_admin_safe to authenticated;
grant execute on function public.get_my_franchise_safe to authenticated;
grant all on public.profiles to authenticated;
