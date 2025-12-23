
import { createClient } from '@supabase/supabase-js';

// Hardcoded for script usage (copied from lib/supabase.ts)
const supabaseUrl = 'https://bldbixuoitopsmcmnshf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGJpeHVvaXRvcHNtY21uc2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODkzNDIsImV4cCI6MjA4MTA2NTM0Mn0.LuWxPPA0pyCbSU-XYq3ZJQHh-q0riHPEzv4wgPq--1I';
const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { email: 'admin@elance.com', password: 'admin123', role: 'admin', name: 'Super Admin', franchise: null },
    { email: 'matriz@elance.com', password: '123456', role: 'manager', name: 'Gerente Matriz', franchise: 'Franquia Matriz (SP)' },
    { email: 'rio@elance.com', password: '123456', role: 'manager', name: 'Gerente Rio', franchise: 'Franquia Rio de Janeiro' },
    { email: 'corretor@elance.com', password: '123456', role: 'collaborator', name: 'Corretor João', franchise: 'Franquia Matriz (SP)' },
];

async function createUsers() {
    console.log('🏁 Iniciando criação de usuários...');

    // 1. Buscar IDs das Franquias
    const { data: franchises } = await supabase.from('franchise_units').select('id, name');
    const franchiseMap: Record<string, string> = {};
    franchises?.forEach((f: any) => {
        franchiseMap[f.name] = f.id;
    });

    for (const u of users) {
        console.log(`\n👤 Processando ${u.email}...`);

        // 2. Criar Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: u.email,
            password: u.password,
        });

        if (authError) {
            console.error(`❌ Erro no Auth (pode já existir): ${authError.message}`);
        }

        // Tentar pegar o ID do user (seja do signUp ou se já existia, precisamos fazer login para pegar ID se o signUp falhar por duplicidade? 
        // Não, se já existe, signUp retorna null user as vezes dependendo da config.
        // Vamos tentar signIn se o signUp falhar.
        let userId = authData.user?.id;

        if (!userId) {
            console.log('   User já existe? Tentando login para pegar ID...');
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: u.email,
                password: u.password
            });

            if (loginData.user) {
                userId = loginData.user.id;
                console.log('   Login OK. ID recuperado.');
            } else {
                console.error(`   Falha ao recuperar ID: ${loginError?.message}`);
                continue;
            }
        }

        // 3. Criar/Atualizar Perfil
        if (userId) {
            const franchiseId = u.franchise ? franchiseMap[u.franchise] : null;

            const { error: profileError } = await supabase.from('profiles').upsert({
                id: userId,
                email: u.email,
                full_name: u.name,
                role: u.role,
                franchise_unit_id: franchiseId
            });

            if (profileError) {
                console.error(`❌ Erro no Profile: ${profileError.message}`);
            } else {
                console.log(`✅ Perfil criado/atualizado com sucesso!`);
            }
        }
    }
    console.log('\n🎉 Processo finalizado!');
}

createUsers();
