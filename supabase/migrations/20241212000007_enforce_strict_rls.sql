-- ENFORCE STRICT RLS & PERMISSIONS

-- 1. DROP EXISTING POLICIES TO ENSURE CLEAN STATE
drop policy if exists "Leads Isolation" on public.leads;
drop policy if exists "Auctions Isolation" on public.auctions;
drop policy if exists "Tasks Isolation" on public.tasks;
drop policy if exists "Events Isolation" on public.events;

-- 2. RE-CREATE POLICIES WITH DEBUGGABLE LOGIC
-- We check if user is admin OR if the record matches their franchise.
-- Records with NULL franchise_id are considered "Global/Headquarters" and visible ONLY to Admins, 
-- UNLESS we want franchisees to see global announcements (optional), but for now Strict Isolation.

-- Leads
create policy "Leads Isolation" on public.leads
for all using (
    (select name from public.access_profiles join public.profiles on profiles.access_profile_id = access_profiles.id where profiles.id = auth.uid()) = 'Administrador Master'
    or 
    franchise_id = (select franchise_unit_id from public.profiles where id = auth.uid())
);

-- Auctions
create policy "Auctions Isolation" on public.auctions
for all using (
    (select name from public.access_profiles join public.profiles on profiles.access_profile_id = access_profiles.id where profiles.id = auth.uid()) = 'Administrador Master'
    or 
    franchise_id = (select franchise_unit_id from public.profiles where id = auth.uid())
);

-- Tasks
create policy "Tasks Isolation" on public.tasks
for all using (
    (select name from public.access_profiles join public.profiles on profiles.access_profile_id = access_profiles.id where profiles.id = auth.uid()) = 'Administrador Master'
    or 
    franchise_id = (select franchise_unit_id from public.profiles where id = auth.uid())
);

-- Events
create policy "Events Isolation" on public.events
for all using (
    (select name from public.access_profiles join public.profiles on profiles.access_profile_id = access_profiles.id where profiles.id = auth.uid()) = 'Administrador Master'
    or 
    franchise_id = (select franchise_unit_id from public.profiles where id = auth.uid())
);

-- 3. ENABLE FORCIBLY
alter table public.leads enable row level security;
alter table public.auctions enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;

-- 4. UPDATE COLLABORATORS PAGE PERMISSIONS
-- Allow Admins to edit Profiles (roles/units)
alter table public.profiles enable row level security;
drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
for all using (
    -- Admins see all
    (select name from public.access_profiles join public.profiles on profiles.access_profile_id = access_profiles.id where profiles.id = auth.uid()) = 'Administrador Master'
    or
    -- Franchisees see their own unit's staff
    franchise_unit_id = (select franchise_unit_id from public.profiles where id = auth.uid())
);
