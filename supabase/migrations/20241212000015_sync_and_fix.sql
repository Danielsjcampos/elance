-- 1. SYNC MISSING PROFILES (Fixes users created when trigger failed)
insert into public.profiles (id, email, full_name, role)
select 
    id, 
    email, 
    coalesce(raw_user_meta_data->>'full_name', 'Sem Nome'), 
    'user'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- 2. GRANT ADMIN RIGHTS TO YOUR EMAILS
update public.profiles
set role = 'admin',
    access_profile_id = (select id from public.access_profiles where name = 'Administrador Master' limit 1)
where email in ('admin@elance.com', 'admin@elance.com.br');

-- 3. RESET RLS TO BE PERMISSIVE (So you can definitely see the list)
alter table public.profiles enable row level security;

drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "Admins can see all profiles" on public.profiles;
drop policy if exists "Admin God Mode" on public.profiles;

-- Create a policy that lets ANY authenticated user view profiles (Collaborator list is usually public to company)
create policy "Enable read access for all users"
on public.profiles for select
to authenticated
using (true);

-- Allow admins to update anyone
create policy "Admins can update users"
on public.profiles for update
to authenticated
using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
    OR
    auth.jwt() ->> 'email' IN ('admin@elance.com', 'admin@elance.com.br')
);
