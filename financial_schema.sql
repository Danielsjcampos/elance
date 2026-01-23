-- Financial Logs table
create table if not exists public.financial_logs (
  id uuid default uuid_generate_v4() primary key,
  auction_id uuid references public.auctions(id),
  type text check (type in ('revenue', 'expense')) not null,
  category text, -- Ex: 'comissao', 'publicidade', 'cartorio', 'outros'
  amount numeric(15,2) not null,
  description text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id)
);

-- Enable RLS for financial_logs
alter table public.financial_logs enable row level security;

create policy "Financial logs are viewable by authenticated users."
  on financial_logs for select using ( auth.role() = 'authenticated' );

create policy "Financial logs are insertable by authenticated users."
  on financial_logs for insert with check ( auth.role() = 'authenticated' );

create policy "Financial logs are updatable by authenticated users."
  on financial_logs for update using ( auth.role() = 'authenticated' );

create policy "Financial logs are deletable by authenticated users."
  on financial_logs for delete using ( auth.role() = 'authenticated' );
