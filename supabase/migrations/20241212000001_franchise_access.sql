-- MODULES: FRANCHISEES, COLLABORATORS, ACCESS PROFILES

-- 1. ACCESS PROFILES (Níveis de Acesso)
create table if not exists public.access_profiles (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  permissions jsonb default '{}'::jsonb, -- Ex: {"leads": "write", "financial": "read"}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FRANCHISE UNITS (Unidades)
create table if not exists public.franchise_units (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  document_id text, -- CNPJ
  city text,
  state text,
  address text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. UPDATE PROFILES
-- Add relationship to access_profile and franchise_unit
-- 'type' distinguishes internal staff from franchisees
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='access_profile_id') THEN
        ALTER TABLE public.profiles ADD COLUMN access_profile_id uuid references public.access_profiles(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='franchise_unit_id') THEN
        ALTER TABLE public.profiles ADD COLUMN franchise_unit_id uuid references public.franchise_units(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='user_type') THEN
        ALTER TABLE public.profiles ADD COLUMN user_type text check (user_type in ('staff', 'franchisee')) default 'staff';
    END IF;
END $$;

-- 4. SEED DATA
-- Default Access Profiles
INSERT INTO public.access_profiles (name, description, permissions) VALUES 
('Administrador Master', 'Acesso total ao sistema', '{"all": true}'),
('Gerente de Franquia', 'Gestão completa da unidade', '{"tasks": true, "leads": true, "financial": true, "team": true}'),
('Vendedor', 'Acesso focado em vendas e leads', '{"tasks": true, "leads": true, "financial": false, "team": false}'),
('Marketing', 'Gestão de campanhas e materiais', '{"marketing": true, "leads": "read"}')
ON CONFLICT DO NOTHING;

-- Default Franchise Unit
INSERT INTO public.franchise_units (name, city, state, document_id) VALUES
('Matriz São Paulo', 'São Paulo', 'SP', '00.000.000/0001-00'),
('Unidade Rio de Janeiro', 'Rio de Janeiro', 'RJ', '11.111.111/0001-11')
ON CONFLICT DO NOTHING;

-- 5. RLS POLICIES
alter table public.access_profiles enable row level security;
alter table public.franchise_units enable row level security;

create policy "Allow all authenticated" on public.access_profiles for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated" on public.franchise_units for all using (auth.role() = 'authenticated');
