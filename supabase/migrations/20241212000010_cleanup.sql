-- CLEANUP ALL TEST DATA (WIPE)

-- 1. Detach Users from Units
update public.profiles set franchise_unit_id = null;

-- 2. Truncate Transactional Tables
truncate table public.tasks cascade;
truncate table public.leads cascade;
truncate table public.auctions cascade;
truncate table public.events cascade;
truncate table public.financial_records cascade;
truncate table public.franchise_financial_movements cascade;

-- 3. Delete Units
delete from public.franchise_units;

-- 4. Clean specific test profiles if desired (Optional - comment out if you want to keep accounts)
-- delete from public.profiles where email in ('franquia@sp.com', 'franquia@rj.com');
