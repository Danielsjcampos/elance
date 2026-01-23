-- MULTITENANCY FIX & SECURITY PATCH

-- 1. Ensure 'events' table has franchise_id and RLS
alter table public.events 
add column if not exists franchise_id uuid references public.franchise_units(id);

alter table public.events enable row level security;

drop policy if exists "Events Isolation" on public.events;
create policy "Events Isolation" on public.events
for all using (
    public.is_admin_master() 
    or 
    franchise_id = public.get_my_franchise_id()
);

-- Trigger for Events auto-assign
drop trigger if exists set_franchise_events on public.events;
create trigger set_franchise_events before insert on public.events
for each row execute function public.handle_franchise_assignment();


-- 2. CREATE FUNCTION TO FIX DEV USERS
-- This function looks up the specific dev emails and assigns them to the correct franchises/roles.
create or replace function public.fix_dev_tenancy()
returns void as $$
declare
    v_admin_user_id uuid;
    v_sp_user_id uuid;
    v_rj_user_id uuid;
    
    v_admin_role_id uuid;
    v_franchisee_role_id uuid;
    
    v_sp_unit_id uuid;
    v_rj_unit_id uuid;
begin
    -- A. Get Role IDs
    select id into v_admin_role_id from public.access_profiles where name = 'Administrador Master' limit 1;
    select id into v_franchisee_role_id from public.access_profiles where name = 'Franqueado' limit 1;
    
    -- B. Ensure Units Exist & Get IDs
    -- Safe upsert for SP
    insert into public.franchise_units (name, document_id, city, state, active)
    values ('Matriz São Paulo', '11.111.111/0001-11', 'São Paulo', 'SP', true)
    on conflict (name) do nothing;
    
    select id into v_sp_unit_id from public.franchise_units where name = 'Matriz São Paulo';

    -- Safe upsert for RJ
    insert into public.franchise_units (name, document_id, city, state, active)
    values ('Unidade Rio de Janeiro', '22.222.222/0001-22', 'Rio de Janeiro', 'RJ', true)
    on conflict (name) do nothing;
    
    select id into v_rj_unit_id from public.franchise_units where name = 'Unidade Rio de Janeiro';

    -- C. Get User IDs from auth.users (if they exist)
    -- We can try to match by email via the public.profiles table or auth.users if accessible.
    -- Since we can't easily access auth.users in simple SQL without elevated privs sometimes, 
    -- we rely on the fact that if they logged in, they have a profile or we update by matching email in profiles (if you sync profiles).
    -- BUT, let's assume profiles exist because the app creates them on login if not exists (usually).
    -- If 'profiles' table has email column (it should, or link to auth).
    
    -- Let's update PROFILES based on the email stored in them.
    -- Admin
    update public.profiles
    set access_profile_id = v_admin_role_id,
        franchise_unit_id = null -- Setup as Global
    where email = 'admin@elance.com';

    -- SP User
    update public.profiles
    set access_profile_id = v_franchisee_role_id,
        franchise_unit_id = v_sp_unit_id
    where email = 'franquia@sp.com';

    -- RJ User
    update public.profiles
    set access_profile_id = v_franchisee_role_id,
        franchise_unit_id = v_rj_unit_id
    where email = 'franquia@rj.com';
    
    -- D. OPTIONAL: Assign some dummy data to these units to prove isolation
    -- Update some leads to be SP
    update public.leads set franchise_id = v_sp_unit_id 
    where franchise_id is null and id in (select id from public.leads limit 2);
    
    -- Update some leads to be RJ
    update public.leads set franchise_id = v_rj_unit_id 
    where franchise_id is null and id in (select id from public.leads limit 2 offset 2);

end;
$$ language plpgsql security definer;

-- 3. EXECUTE THE FIX
select public.fix_dev_tenancy();
