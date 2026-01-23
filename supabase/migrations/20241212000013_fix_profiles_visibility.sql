-- FIX PROFILES VISIBILITY & TRIGGER

-- 1. Ensure Trigger exists for new users
create or replace function public.handle_new_user()
returns trigger
security definer
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'manager')
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name;
  return new;
exception when others then
  raise warning 'Profile creation failed for user %: %', new.id, SQLERRM;
  return new;
end;
$$ language plpgsql;

-- Re-create trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Fix Profiles RLS (Admins need to see EVERYONE)
alter table public.profiles enable row level security;

-- Drop old restrict policies
drop policy if exists "Profiles are viewable by users who created them." on public.profiles;
drop policy if exists "Users can see own profile" on public.profiles;
drop policy if exists "Admins can see all profiles" on public.profiles;

-- Create permissive Admin policy
create policy "Admins can see all profiles"
on public.profiles for select
using (
  -- Check if user is admin OR has 'Administrador Master' access profile
  (select role from public.profiles where id = auth.uid()) = 'admin'
  OR
  exists (
    select 1 from public.access_profiles ap
    join public.profiles p on p.access_profile_id = ap.id
    where p.id = auth.uid() and ap.name = 'Administrador Master'
  )
);

-- Users see themselves
create policy "Users can see own profile"
on public.profiles for select
using ( auth.uid() = id );

-- 3. Ensure Admin is Admin
update public.profiles
set role = 'admin',
    access_profile_id = (select id from public.access_profiles where name = 'Administrador Master' limit 1)
where email = 'admin@elance.com';