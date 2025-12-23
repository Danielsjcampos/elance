
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bldbixuoitopsmcmnshf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGJpeHVvaXRvcHNtY21uc2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODkzNDIsImV4cCI6MjA4MTA2NTM0Mn0.LuWxPPA0pyCbSU-XYq3ZJQHh-q0riHPEzv4wgPq--1I';
const supabase = createClient(supabaseUrl, supabaseKey);

async function promote() {
    console.log('🚀 Promovendo matriz@elance.com para Admin...');
    const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin', full_name: 'Super Admin (Matriz)' })
        .eq('email', 'matriz@elance.com');

    if (error) console.error('Erro:', error);
    else console.log('✅ Sucesso! Agora matriz@elance.com é um Super Admin.');
}

promote();
