import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    Save, 
    User, 
    Mail, 
    Lock, 
    Globe, 
    Palette, 
    Server, 
    Activity, 
    Shield, 
    Webhook,
    Moon,
    Sun,
    Bell
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SettingsPage = () => {
    // Hooks
    const { layoutMode, setLayoutMode, darkMode, setDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'access' | 'logs'>('profile');
    
    // Profile State
    const [profile, setProfile] = useState<any>({});
    // Removed local darkMode state

    // System Settings State
    const [sysConfig, setSysConfig] = useState<any>({
        theme_colors: { primary: '#2563eb', secondary: '#9333ea' },
        general_config: { franchise_name: '', support_email: '' },
        integrations: { smtp_host: '', smtp_user: '' }
    });

    // Loading State
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchSystemSettings();
    }, []);

    // --- DATA FETCHING ---
    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) setProfile(data);
        }
    };

    const fetchSystemSettings = async () => {
         // In real usage we fetch from 'system_settings' table
         const { data } = await supabase.from('system_settings').select('*');
         if(data) {
             const configMap: any = {};
             data.forEach((item: any) => configMap[item.key] = item.value);
             setSysConfig(prev => ({...prev, ...configMap}));
         }
    };

    // --- HANDLERS ---
    const handleSaveProfile = async () => {
        setLoading(true);
        const { error } = await supabase.from('profiles').update({ 
            full_name: profile.full_name,
            phone: profile.phone
        }).eq('id', profile.id);

        if (!error) {
            // Also save theme preference locally or to DB
            localStorage.setItem('themePreference', darkMode ? 'dark' : 'light');
            alert('Perfil atualizado com sucesso!');
        }
        setLoading(false);
    };

    const handleSaveSystem = async () => {
        setLoading(true);
        // Persist each key to system_settings
        // This is simplified. In prod, use upsert in a loop or single query.
        await supabase.from('system_settings').upsert([
            { key: 'theme_colors', value: sysConfig.theme_colors },
            { key: 'general_config', value: sysConfig.general_config }
        ], { onConflict: 'key' });

        alert('Configurações do sistema salvas!');
        setLoading(false);
    };

    // --- SUB-COMPONENTS ---
    
    const ProfileTab = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-[#1e293b] p-8 rounded-2xl border border-white/5 shadow-xl">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        {profile.full_name?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
                        <p className="text-gray-400">Atualize suas informações pessoais e de acesso.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="block text-sm text-gray-400">Nome Completo</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors"
                            value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm text-gray-400">Telefone / WhatsApp</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors"
                            value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm text-gray-400">Email</label>
                        <input className="w-full bg-[#0f172a]/50 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                            value={profile.email || 'email@example.com'} disabled />
                    </div>
                     <div className="space-y-4">
                        <label className="block text-sm text-gray-400">Senha</label>
                        <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                            <Lock size={16} /> Redefinir Senha
                        </button>
                    </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Palette size={20} className="text-purple-400"/> Preferências
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            {darkMode ? <Moon size={20} className="text-blue-400"/> : <Sun size={20} className="text-yellow-400"/>}
                            <div>
                                <p className="text-white font-medium">Modo Escuro</p>
                                <p className="text-xs text-gray-500">Ajuste a aparência do sistema</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveProfile} disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105">
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );

    const SystemTab = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-[#1e293b] p-8 rounded-2xl border border-white/5 shadow-xl space-y-8">
                {/* General */}
                <div>
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Server size={20} className="text-green-400"/> Geral e Identidade
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Nome da Franquia / Portal</label>
                            <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                value={sysConfig.general_config?.franchise_name || ''}
                                onChange={e => setSysConfig({...sysConfig, general_config: {...sysConfig.general_config, franchise_name: e.target.value}})}
                            />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm text-gray-400">Email de Suporte</label>
                            <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                 value={sysConfig.general_config?.support_email || ''}
                                 onChange={e => setSysConfig({...sysConfig, general_config: {...sysConfig.general_config, support_email: e.target.value}})}
                            />
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Palette size={20} className="text-pink-400"/> Cores e Layout
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-2">
                            <label className="text-sm text-gray-400">Cor Primária</label>
                            <div className="flex gap-2">
                                <input type="color" className="h-10 w-10 rounded-lg bg-transparent cursor-pointer"
                                    value={sysConfig.theme_colors.primary}
                                    onChange={e => setSysConfig({...sysConfig, theme_colors: {...sysConfig.theme_colors, primary: e.target.value}})}
                                />
                                <input className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 text-white uppercase"
                                    value={sysConfig.theme_colors.primary} readOnly
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Cor Secundária</label>
                             <div className="flex gap-2">
                                <input type="color" className="h-10 w-10 rounded-lg bg-transparent cursor-pointer"
                                     value={sysConfig.theme_colors.secondary}
                                     onChange={e => setSysConfig({...sysConfig, theme_colors: {...sysConfig.theme_colors, secondary: e.target.value}})}
                                />
                                <input className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 text-white uppercase"
                                     value={sysConfig.theme_colors.secondary} readOnly
                                />
                            </div>
                        </div>
                        
                         <div className="space-y-2">
                            <label className="text-sm text-gray-400">Estilo do Menu</label>
                             <div className="flex bg-[#0f172a] rounded-xl p-1 border border-white/10">
                                <button onClick={() => setLayoutMode('sidebar')} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${layoutMode === 'sidebar' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    Lateral
                                </button>
                                <button onClick={() => setLayoutMode('dock')} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${layoutMode === 'dock' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    Dock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Integrations (Webhook & SMTP) */}
                 <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Webhook size={20} className="text-yellow-400"/> Integrações e Webhooks
                    </h3>
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Webhook de Leads (Entrada)</p>
                                <p className="text-xs text-gray-500">URL para receber leads de formulários externos</p>
                            </div>
                            <button className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors">Copiar URL</button>
                        </div>
                         <div className="w-full bg-[#1e293b] p-3 rounded-lg border border-dashed border-white/10 text-xs font-mono text-gray-400 break-all">
                            https://api.elance.com/v1/webhooks/leads/receive?token=xyz_secure_token
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                     <button onClick={handleSaveSystem} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all transform hover:scale-105">
                        Salvar Configurações do Sistema
                    </button>
                </div>
            </div>
        </div>
    );

    const AccessTab = () => {
        const [profiles, setProfiles] = useState<any[]>([]);
        const [isCreating, setIsCreating] = useState(false);
        const [newProfileName, setNewProfileName] = useState('');
        const [newProfileDesc, setNewProfileDesc] = useState('');

        useEffect(() => {
            fetchProfiles();
        }, []);

        const fetchProfiles = async () => {
             const { data } = await supabase.from('access_profiles').select('*').order('created_at', { ascending: true });
             if (data) {
                 // Parse permissions if it's a string, though Supabase returns object for jsonb
                 // Ensure permissions structure is compatible with our UI
                 const formatted = data.map(p => ({
                     ...p,
                     permissions: Array.isArray(p.permissions) ? p.permissions : 
                                  (typeof p.permissions === 'object' && p.permissions !== null ? 
                                    Object.keys(p.permissions).filter(k => p.permissions[k] === true || p.permissions[k] === 'write') 
                                    : [])
                 }));
                 setProfiles(formatted);
             }
        };

        const handleCreateProfile = async () => {
            if (!newProfileName) return;
            const newProfile = {
                name: newProfileName,
                description: newProfileDesc,
                permissions: {} // Start empty
            };

            const { data, error } = await supabase.from('access_profiles').insert(newProfile).select().single();
            if (data) {
                setProfiles([...profiles, { ...data, permissions: [] }]);
                setIsCreating(false);
                setNewProfileName('');
                setNewProfileDesc('');
            }
        };

        const togglePermission = async (profileId: string, moduleId: string) => {
             const profile = profiles.find(p => p.id === profileId);
             if (!profile) return;
             if (profile.permissions.includes('all')) return; // Master is locked

             const currentPerms = profile.permissions || [];
             const hasPerm = currentPerms.includes(moduleId);
             const newPermsList = hasPerm 
                ? currentPerms.filter((p: string) => p !== moduleId)
                : [...currentPerms, moduleId];
             
             // Optimistic Update
             setProfiles(profiles.map(p => p.id === profileId ? { ...p, permissions: newPermsList } : p));

             // Persist to DB (Convert list back to Map for JSONB if needed, or store as simple array if schema allows)
             // The schema comment says: {"leads": "write"}, so let's stick to true/false map structure for DB
             const permissionMap: any = {};
             newPermsList.forEach((perm: string) => permissionMap[perm] = true);
             
             await supabase.from('access_profiles').update({ permissions: permissionMap }).eq('id', profileId);
        };
        
        const modules = [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'tasks', label: 'Tarefas' },
            { id: 'leads', label: 'Leads & CRM' },
            { id: 'auctions', label: 'Leilões' },
            { id: 'marketing', label: 'Marketing' },
            { id: 'financial', label: 'Financeiro' },
            { id: 'franqueados', label: 'Franqueados' },
            { id: 'colaboradores', label: 'Colaboradores' },
            { id: 'admin', label: 'Configurações Globais' }
        ];

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-[#1e293b] p-8 rounded-2xl border border-white/5 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Shield size={20} className="text-red-400"/> Perfis de Acesso
                        </h3>
                        {!isCreating ? (
                            <button 
                                onClick={() => setIsCreating(true)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-primary-700 transition-colors"
                            >
                                + Novo Perfil
                            </button>
                        ) : (
                            <div className="flex gap-2 animate-fade-in">
                                <input 
                                    placeholder="Nome do Perfil" 
                                    className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-1 text-sm text-white"
                                    value={newProfileName} onChange={e => setNewProfileName(e.target.value)}
                                />
                                <input 
                                    placeholder="Descrição" 
                                    className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-1 text-sm text-white"
                                    value={newProfileDesc} onChange={e => setNewProfileDesc(e.target.value)}
                                />
                                <button onClick={handleCreateProfile} className="bg-green-600 px-3 py-1 rounded-lg text-white text-sm">Salvar</button>
                                <button onClick={() => setIsCreating(false)} className="bg-red-600/20 text-red-400 px-3 py-1 rounded-lg text-sm">Cancelar</button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {profiles.map(profile => (
                             <div key={profile.id} className="bg-[#0f172a] p-4 rounded-xl border border-white/5 transition-all hover:border-white/10">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {profile.name}
                                            {profile.permissions.includes('all') && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded uppercase">Master</span>}
                                        </h4>
                                        <span className="text-xs text-gray-500">{profile.description}</span>
                                    </div>
                                    {!profile.permissions.includes('all') && (
                                        <button className="text-xs text-red-400 hover:text-red-300">Excluir</button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {modules.map(mod => {
                                        const isMaster = profile.permissions.includes('all');
                                        const hasAccess = isMaster || profile.permissions.includes(mod.id);
                                        return (
                                            <button 
                                                key={mod.id}
                                                onClick={() => !isMaster && togglePermission(profile.id, mod.id)}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                                                    hasAccess 
                                                    ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-500/20' 
                                                    : 'bg-white/5 text-gray-500 border-transparent hover:border-white/10'
                                                } ${isMaster ? 'cursor-not-allowed opacity-70' : ''}`}
                                            >
                                                {mod.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {profiles.length === 0 && (
                            <p className="text-center text-gray-500 py-8">Carregando perfis...</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    
    // Logs Tab Stub
    const LogsTab = () => (
         <div className="bg-[#1e293b] p-8 rounded-2xl border border-white/5 shadow-xl animate-fade-in text-center py-20">
            <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Audit Logs & Monitoramento</h3>
            <p className="text-gray-400 max-w-md mx-auto mt-2">
                O monitoramento de status de conexão, logs de acesso e webhooks será exibido aqui em tempo real.
            </p>
         </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <h1 className="text-3xl font-bold text-white">Configurações & Preferências</h1>
                     <p className="text-gray-400 mt-1">Gerencie seu perfil, aparência e parâmetros do sistema.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
                <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 rounded-t-xl font-medium transition-all ${activeTab === 'profile' ? 'bg-[#1e293b] text-blue-400 border-t border-x border-white/10' : 'text-gray-400 hover:text-white'}`}>
                    <User size={18} className="inline mr-2 mb-0.5"/> Meu Perfil
                </button>
                <button onClick={() => setActiveTab('system')} className={`px-6 py-3 rounded-t-xl font-medium transition-all ${activeTab === 'system' ? 'bg-[#1e293b] text-purple-400 border-t border-x border-white/10' : 'text-gray-400 hover:text-white'}`}>
                    <Server size={18} className="inline mr-2 mb-0.5"/> Sistema
                </button>
                <button onClick={() => setActiveTab('access')} className={`px-6 py-3 rounded-t-xl font-medium transition-all ${activeTab === 'access' ? 'bg-[#1e293b] text-red-400 border-t border-x border-white/10' : 'text-gray-400 hover:text-white'}`}>
                    <Shield size={18} className="inline mr-2 mb-0.5"/> Acessos
                </button>
                <button onClick={() => setActiveTab('logs')} className={`px-6 py-3 rounded-t-xl font-medium transition-all ${activeTab === 'logs' ? 'bg-[#1e293b] text-green-400 border-t border-x border-white/10' : 'text-gray-400 hover:text-white'}`}>
                    <Activity size={18} className="inline mr-2 mb-0.5"/> Logs
                </button>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'system' && <SystemTab />}
                {activeTab === 'access' && <AccessTab />}
                {activeTab === 'logs' && <LogsTab />}
            </div>
        </div>
    );
};

export default SettingsPage;
