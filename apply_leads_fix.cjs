
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://bldbixuoitopsmcmnshf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGJpeHVvaXRvcHNtY21uc2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODkzNDIsImV4cCI6MjA4MTA2NTM0Mn0.LuWxPPA0pyCbSU-XYq3ZJQHh-q0riHPEzv4wgPq--1I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runRLSFix() {
    try {
        console.log('Applying RLS fix for leads table...');

        // Since we can't easily run raw SQL from client without special setup, 
        // we will try to use the CLI method provided by the previous agent's environment context if available,
        // OR rely on the user running it. 
        // However, I can try to use the 'rpc' method if 'exec_sql' exists, which is common in some setups.
        // If not, I will just log the instructions clearly.

        // Wait! I can't run SQL directly. 
        // BUT, the error "new row violates row-level security policy" CONFIRMS RLS is on and no policy allows INSERT for anon.

        console.log('Policy file created: fix_leads_rls.sql');
        console.log('Please run this SQL in your Supabase Dashboard SQL Editor to allow public form submissions.');

    } catch (err) {
        console.error(err);
    }
}

runRLSFix();
