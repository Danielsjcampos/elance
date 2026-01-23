import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, User, Mail, Lock, Building, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ConfigSettings = () => {
    const { layoutMode, setLayoutMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>({
        full_name: '',
        email: '', // Read only usually
        phone: ''
    });

    // System Settings (Mocked for now, would be a new table 'settings')
    const [systemSettings, setSystemSettings] = useState({
        franchiseName: 'Minha Franquia Leilões',
        commissionRate: 5,
        defaultDeadline: 7
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) setProfile(data);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ 
                full_name: profile.full_name,
                phone: profile.phone
            })
            .eq('id', profile.id);

        if (!error) {
            alert('Perfil atualizado!');
        } else {
            alert('Erro ao atualizar perfil');
        }
        setLoading(false);
    };

    const handleSaveSystem = ()=> {
        // Implement settings table persistence later
        alert('Configurações do sistema salvas (Simulação)');
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white">Configurações</h1>
                <p className="text-gray-400">Gerencie seu perfil e preferências do sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <User className="text-blue-400" />
                        <h2 className="text-lg font-bold text-white">Meu Perfil</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                            <input 
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 transition-colors"
                                value={profile.full_name || ''}
                                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Telefone / WhatsApp</label>
                            <input 
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 transition-colors"
                                value={profile.phone || ''}
                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email (Não editável)</label>
                            <input 
                                className="w-full bg-[#0f172a]/50 border border-white/5 rounded-xl px-4 py-2.5 text-gray-500 cursor-not-allowed"
                                value={profile.email || 'user@example.com'} // Mock or fetch email from auth
                                disabled
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                    </button>
                </div>

                {/* System Settings (Admin Only ideally) */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Building className="text-purple-400" />
                        <h2 className="text-lg font-bold text-white">Configurações do Sistema</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Layout Toggle */}
                        <div className="p-4 bg-[#0f172a] rounded-xl border border-white/10">
                            <h3 className="text-sm font-medium text-white mb-3">Estilo do Menu</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setLayoutMode('sidebar')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                        layoutMode === 'sidebar' 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    Lateral (Padrão)
                                </button>
                                <button
                                    onClick={() => setLayoutMode('dock')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                        layoutMode === 'dock' 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    Dock (MacOS)
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Nome da Franquia</label>
                            <input 
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 transition-colors"
                                value={systemSettings.franchiseName}
                                onChange={(e) => setSystemSettings({...systemSettings, franchiseName: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Comissão Padrão (%)</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input 
                                        type="number"
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-purple-500 transition-colors"
                                        value={systemSettings.commissionRate}
                                        onChange={(e) => setSystemSettings({...systemSettings, commissionRate: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Prazo Padrão (Dias)</label>
                                <input 
                                    type="number"
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 transition-colors"
                                    value={systemSettings.defaultDeadline}
                                    onChange={(e) => setSystemSettings({...systemSettings, defaultDeadline: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveSystem}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Salvar Preferências
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfigSettings;
