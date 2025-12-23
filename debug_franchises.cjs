
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bldbixuoitopsmcmnshf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGJpeHVvaXRvcHNtY21uc2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODkzNDIsImV4cCI6MjA4MTA2NTM0Mn0.LuWxPPA0pyCbSU-XYq3ZJQHh-q0riHPEzv4wgPq--1I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllFranchises() {
    const { data, error } = await supabase
        .from('franchise_units')
        .select('id, name, logo_url, icon_url, site_title');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('All Franchises:', JSON.stringify(data, null, 2));
    }
}

listAllFranchises();
