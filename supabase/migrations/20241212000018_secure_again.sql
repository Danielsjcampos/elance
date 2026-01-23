-- RE-ENABLE SECURITY (Safe Mode)

-- 1. Re-enable RLS on Profiles
alter table public.profiles enable row level security;

-- 2. Drop "Loose" Policies
drop policy if exists "Enable read access for all users" on public.profiles;

-- 3. Apply "Safe" Visibility Logic
--    - Users can see THEMSELVES
--    - Admins (role='admin') can see EVERYONE
--    - Managers (Franchisees) can see members of THEIR OWN UNIT

create policy "Users see own profile"
on public.profiles for select
to authenticated
using ( auth.uid() = id );

create policy "Admins see all profiles"
on public.profiles for select
to authenticated
using (
    -- Check if I am an admin
    (select role from public.profiles where id = auth.uid()) = 'admin'
    OR
    auth.jwt() ->> 'email' IN ('admin@elance.com', 'admin@elance.com.br')
);

create policy "Franchisees see unit members"
on public.profiles for select
to authenticated
using (
    -- Check if I am a manager and the target profile belongs to my unit
    (select role from public.profiles where id = auth.uid()) = 'manager'
    AND
    franchise_unit_id = (select franchise_unit_id from public.profiles where id = auth.uid())
);

-- 4. Allow Updates (Same Logic)
create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
);
