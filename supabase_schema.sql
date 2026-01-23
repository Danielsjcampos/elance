-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text check (role in ('admin', 'manager', 'employee', 'marketing')) default 'employee',
  phone text,
  updated_at timestamp with time zone,
  active boolean default true
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Leads table
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  type text check (type in ('arrematante', 'advogado', 'comitente', 'parceiro')) not null,
  name text not null,
  cpf_cnpj text unique,
  rg text,
  email text,
  phone text,
  address text,
  profession text,
  marital_status text,
  status text check (status in ('novo', 'interessado', 'documentacao_pendente', 'habilitado', 'arquivado')) default 'novo',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id)
);

-- Enable RLS for leads
alter table public.leads enable row level security;

create policy "Leads are viewable by authenticated users."
  on leads for select
  using ( auth.role() = 'authenticated' );

create policy "Leads are insertable by authenticated users."
  on leads for insert
  with check ( auth.role() = 'authenticated' );

create policy "Leads are updatable by authenticated users."
  on leads for update
  using ( auth.role() = 'authenticated' );

-- Auctions (Processos) table
create table if not exists public.auctions (
  id uuid default uuid_generate_v4() primary key,
  process_number text not null,
  vara text,
  description text,
  valuation_value numeric(15,2),
  minimum_bid numeric(15,2),
  first_auction_date timestamp with time zone,
  second_auction_date timestamp with time zone,
  status text check (status in ('preparacao', 'publicado', 'primeira_praca', 'segunda_praca', 'arrematado', 'suspenso')) default 'preparacao',
  comitente_id uuid references public.leads(id),
  arrematante_id uuid references public.leads(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id)
);

-- Enable RLS for auctions
alter table public.auctions enable row level security;

create policy "Auctions are viewable by everyone."
  on auctions for select
  using ( true );

create policy "Auctions are insertable by authenticated users."
  on auctions for insert
  with check ( auth.role() = 'authenticated' );

create policy "Auctions are updatable by authenticated users."
  on auctions for update
  using ( auth.role() = 'authenticated' );

-- Trigger for new user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'admin'); -- Defaulting to admin for the first user for simplicity, usually needs logic
  return new;
end;
$$;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

