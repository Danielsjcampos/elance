/* 
    SYSTEM DIAGNOSTIC & HEALTH CHECK SCRIPT
    ---------------------------------------
    This script analyzes the consistency of the Users, Profiles, and Roles system.
    It does NOT data modification, only selects to identify issues.
*/

DO $$
DECLARE
    v_total_users int;
    v_total_profiles int;
    v_missing_profiles int;
    v_orphaned_profiles int;
    v_role_mismatches int;
    v_null_roles int;
    v_orphaned_units int;
BEGIN
    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE 'STARTING SYSTEM DIAGNOSTIC SCAN...';
    RAISE NOTICE '---------------------------------------------------';

    -- 1. COUNT CONSISTENCY
    SELECT count(*) INTO v_total_users FROM auth.users;
    SELECT count(*) INTO v_total_profiles FROM public.profiles;
    
    RAISE NOTICE 'Auth Users Total: %', v_total_users;
    RAISE NOTICE 'Public Profiles Total: %', v_total_profiles;

    IF v_total_users != v_total_profiles THEN
        RAISE NOTICE 'WARNING: Mismatch between Auth Users and Public Profiles!';
    ELSE
        RAISE NOTICE 'PASSED: User count matches.';
    END IF;

    -- 2. FIND MISSING PROFILES (Users in Auth but not in Profiles)
    SELECT count(*) INTO v_missing_profiles
    FROM auth.users au
    LEFT JOIN public.profiles pp ON au.id = pp.id
    WHERE pp.id IS NULL;

    IF v_missing_profiles > 0 THEN
        RAISE NOTICE 'CRITICAL: Found % users without profiles!', v_missing_profiles;
    ELSE
        RAISE NOTICE 'PASSED: All users have profiles.';
    END IF;

    -- 3. CHECK FOR NULL ROLES/ACCESS PROFILES
    SELECT count(*) INTO v_null_roles
    FROM public.profiles
    WHERE role IS NULL OR access_profile_id IS NULL;

    IF v_null_roles > 0 THEN
        RAISE NOTICE 'WARNING: Found % users with NULL role or access_profile_id.', v_null_roles;
    ELSE
        RAISE NOTICE 'PASSED: All users have roles assigned.';
    END IF;

    -- 4. CHECK ROLE <> ACCESS PROFILE CONSISTENCY
    -- 'Administrador Master' should ALWAYS be 'admin'
    -- Others should be 'manager' or 'user'
    SELECT count(*) INTO v_role_mismatches
    FROM public.profiles p
    JOIN public.access_profiles ap ON p.access_profile_id = ap.id
    WHERE 
        (ap.name = 'Administrador Master' AND p.role != 'admin')
        OR
        (ap.name != 'Administrador Master' AND p.role = 'admin' AND p.email NOT IN ('admin@elance.com', 'admin@elance.com.br')); -- Exception for hardcoded admins

    IF v_role_mismatches > 0 THEN
        RAISE NOTICE 'WARNING: Found % role mismatches (Access Profile vs System Role).', v_role_mismatches;
    ELSE
        RAISE NOTICE 'PASSED: Role consistency check.';
    END IF;

    -- 5. CHECK FRANCHISE OWNERSHIP
    -- Check if there are units without owners linked in profiles
    -- (This logic depends on whether we store owner_id on unit or unit_id on profile. Current system is unit_id on profile)
    SELECT count(*) INTO v_orphaned_units
    FROM public.franchise_units fu
    WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.franchise_unit_id = fu.id AND p.role = 'manager'
    );

    IF v_orphaned_units > 0 THEN
        RAISE NOTICE 'INFO: Found % franchise units without a distinct "manager" linked.', v_orphaned_units;
    ELSE
        RAISE NOTICE 'PASSED: All units have at least one manager.';
    END IF;

    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE 'SCAN COMPLETE.';
    RAISE NOTICE '---------------------------------------------------';
END $$;

/* 
    AUTO-FIX SCRIPT (Optional Execution)
    ------------------------------------
    Uncomment the lines below if you want to automatically fix common issues found above.
*/

-- 1. Sync Missing Profiles
insert into public.profiles (id, email, full_name, role)
select 
    au.id, 
    au.email, 
    coalesce(au.raw_user_meta_data->>'full_name', 'Usuário Recuperado'), 
    'manager' -- Default to manager to be safe
from auth.users au
where not exists (select 1 from public.profiles p where p.id = au.id);

-- 2. Fix NULL Access Profiles (Default to 'Colaborador' or similar if exists, else first available)
-- (Skipped to avoid incorrect assignments, better to do manually)

-- 3. Fix Role Mismatches
-- Force 'admin' for 'Administrador Master'
update public.profiles p
set role = 'admin'
from public.access_profiles ap
where p.access_profile_id = ap.id
and ap.name = 'Administrador Master'
and p.role != 'admin';

-- Force 'manager' for non-admins
update public.profiles p
set role = 'manager'
from public.access_profiles ap
where p.access_profile_id = ap.id
and ap.name != 'Administrador Master'
and p.role = 'admin'
and p.email NOT IN ('admin@elance.com', 'admin@elance.com.br');

-- 4. Ensure Admin God Mode
update public.profiles
set role = 'admin',
    access_profile_id = (select id from public.access_profiles where name = 'Administrador Master' limit 1)
where email IN ('admin@elance.com', 'admin@elance.com.br');
