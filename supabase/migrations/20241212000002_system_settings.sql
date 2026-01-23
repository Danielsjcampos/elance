-- SETTINGS & PERMISSIONS MIGRATION

-- 1. SYSTEM SETTINGS TABLE (For Global Configs)
create table if not exists public.system_settings (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SYSTEM AUDIT LOGS
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  resource text,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. WEBHOOK LOGS
create table if not exists public.webhook_logs (
  id uuid default uuid_generate_v4() primary key,
  source text not null, -- e.g., 'landing_page', 'payment_gateway'
  payload jsonb,
  status text check (status in ('success', 'failed', 'pending')),
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. INSERT DEFAULT SETTINGS
INSERT INTO public.system_settings (key, value, description) VALUES
('theme_colors', '{"primary": "#2563eb", "secondary": "#9333ea", "sidebar": "#1e293b", "background": "#0f172a"}'::jsonb, 'Cores do tema administrativo'),
('system_integrations', '{"smtp_host": "", "smtp_port": 587, "smtp_user": "", "smtp_pass": ""}'::jsonb, 'Configurações de Integração (SMTP, etc)'),
('general_config', '{"franchise_name": "E-Lance Leilões", "support_email": "suporte@elance.com"}'::jsonb, 'Configurações Gerais')
ON CONFLICT (key) DO NOTHING;

-- 5. RLS POLICIES
alter table public.system_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.webhook_logs enable row level security;

-- Only Admins can view/edit system settings
-- For now, allowing authenticated read for demo purposes
create policy "Allow read all authenticated" on public.system_settings for select using (auth.role() = 'authenticated');
create policy "Allow insert/update admin" on public.system_settings for all using (auth.role() = 'authenticated'); -- To restrict later based on permission

create policy "Allow insert logs" on public.audit_logs for insert with check (auth.role() = 'authenticated');
create policy "Allow read logs admin" on public.audit_logs for select using (auth.role() = 'authenticated');

