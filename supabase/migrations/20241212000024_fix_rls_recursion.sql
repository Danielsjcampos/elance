-- FIX RLS RECURSION MIGRATION
-- The error "Database error querying schema" is often caused by infinite recursion in RLS policies.
-- (e.g. A policy on 'profiles' tries to query 'profiles' to check permissions, triggering the policy again).

BEGIN;

-- 1. Create a Helper Function to read Role WITHOUT triggering RLS
-- marked as SECURITY DEFINER to run with owner permissions (bypassing RLS)
create or replace function public.get_my_role_unprotected()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin_unprotected()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role = 'admin'
  );
$$;

-- 2. Drop the recursive policies on PROFILES
drop policy if exists "Users see own profile" on public.profiles;
drop policy if exists "Admins see all profiles" on public.profiles;
drop policy if exists "Franchisees see unit members" on public.profiles;
drop policy if exists "Enable read access for all users" on public.profiles;

-- 3. Re-create SAFE policies using the Security Definer functions
alter table public.profiles enable row level security;

-- Policy 1: Self Access (Simple ID check, always safe)
create policy "Users see own profile"
on public.profiles for select
to authenticated
using ( auth.uid() = id );

-- Policy 2: Admin Access (Uses Security Definer to avoid recursion)
create policy "Admins see all profiles"
on public.profiles for select
to authenticated
using ( public.is_admin_unprotected() );

-- Policy 3: Franchise Manager Access (Uses Security Definer to read own unit)
create policy "Franchisees see unit members"
on public.profiles for select
to authenticated
using (
    -- Check permissions safely
    (public.get_my_role_unprotected() = 'manager')
    AND
    -- Compare unit IDs (we can safely read our own row via the Self Access policy, but let's be explicit)
    franchise_unit_id = (select franchise_unit_id from public.profiles where id = auth.uid())
);

-- 4. Fix Update Policies too
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles; 

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using ( public.is_admin_unprotected() );

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using ( auth.uid() = id );

COMMIT;
