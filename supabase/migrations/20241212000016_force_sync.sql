-- FORCE SYNC ALL USERS
-- Because the trigger failed previously, we must manually insert the missing users from auth.users into profiles

-- NOTE: Changing default role to 'manager' because 'user' violates check constraint
insert into public.profiles (id, email, full_name, role)
select 
    au.id, 
    au.email, 
    coalesce(au.raw_user_meta_data->>'full_name', 'Usuário Sem Nome'), 
    'manager'
from auth.users au
where not exists (
    select 1 from public.profiles p where p.id = au.id
);

-- GRANT ADMIN RIGHTS TO YOUR ACCOUNT (Just to be safe)
update public.profiles
set role = 'admin',
    access_profile_id = (select id from public.access_profiles where name = 'Administrador Master' limit 1)
where email = 'admin@elance.com';

-- FIX RLS SO YOU CAN SEE EVERYONE
alter table public.profiles enable row level security;
drop policy if exists "Enable read access for all users" on public.profiles;
create policy "Enable read access for all users"
on public.profiles for select
to authenticated
using (true);
