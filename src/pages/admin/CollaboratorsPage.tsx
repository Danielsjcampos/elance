import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    Users, 
    Shield, 
    Plus, 
    MoreVertical, 
    Mail, 
    CheckCircle,
    X
} from 'lucide-react';

import { useLocation } from 'react-router-dom';
// ... (keep other imports)

const CollaboratorsPage = () => {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const location = useLocation();
    const filterUnitId = location.state?.unitId;
    const filterUnitName = location.state?.unitName;

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        role_id: '',
        unit_id: filterUnitId || '' // Auto-set if filtering
    });

    useEffect(() => {
        fetchData();
        if (filterUnitId) {
            setFormData(prev => ({ ...prev, unit_id: filterUnitId }));
        }
    }, [filterUnitId]);

    const fetchData = async () => {
        setLoading(true);
        
        let query = supabase
            .from('profiles')
            .select(`
                *, 
                role_details:access_profiles(name),
                unit:franchise_units(name)
            `)
            .order('full_name', { ascending: true });
        
        if (filterUnitId) {
            query = query.eq('franchise_unit_id', filterUnitId);
        }

        const { data: profilesData } = await query;
        const { data: rolesData } = await supabase.from('access_profiles').select('*');
        
        setProfiles(profilesData || []);
        setRoles(rolesData || []);
        setLoading(false);
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestão de Colaboradores</h1>
                    <p className="text-gray-400">Gerencie sua equipe e níveis de acesso.</p>
                    {filterUnitName && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">
                            <span>Filtrando por: <strong>{filterUnitName}</strong></span>
                            <button onClick={() => {
                                window.history.replaceState({}, ''); // clear state
                                window.location.href = '/admin/colaboradores'; // force reload to clear (simple way) or redirect
                            }} className="hover:text-white"><X size={14} /></button>
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg"
                >
                    <Plus size={20} />
                    Convidar Colaborador
                </button>
            </div>

            {/* List */}
             <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="border-b border-white/5 bg-[#151d38]/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Colaborador</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Perfil de Acesso</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidade</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {profiles.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                {user.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{user.full_name}</p>
                                                <p className="text-xs text-gray-500">{user.email || 'user@email.com'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role_details ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium">
                                                <Shield size={12} />
                                                {user.role_details.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">Sem perfil</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                         <span className="text-sm text-gray-300">
                                            {user.unit?.name || 'Matriz'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20`}>
                                            Ativo
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                         <button 
                                            onClick={() => {
                                                setFormData({
                                                    id: user.id,
                                                    full_name: user.full_name || '',
                                                    email: user.email || '',
                                                    phone: user.phone || '',
                                                    role_id: user.access_profile_id || '',
                                                    unit_id: user.franchise_unit_id || ''
                                                });
                                                setShowModal(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            title="Editar Acessos"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
             {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                         <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {formData.id ? 'Editar Colaborador' : 'Convidar Colaborador'}
                            </h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400 hover:text-white"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                                <input className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 ${formData.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    value={formData.full_name} 
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    disabled={!!formData.id}
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 ${formData.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    value={formData.email} 
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    disabled={!!formData.id}
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            
                            {!formData.id && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Senha Provisória</label>
                                    <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                                        value={formData.password || ''} 
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        type="password"
                                        placeholder="Min. 6 caracteres"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">O usuário poderá alterar depois.</p>
                                </div>
                            )}
                            
                            <div className="pt-4 border-t border-white/5">
                                <h4 className="text-sm font-bold text-white mb-3">Permissões e Acesso</h4>
                                
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Perfil de Acesso (Cargo)</label>
                                    <select className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none"
                                        value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})}
                                    >
                                        <option value="">Sem Perfil Definido</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-500 mt-1">Define o que o usuário pode ver ou fazer.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                            <button 
                                onClick={async () => {
                                    setLoading(true);



                                    // 1. EDIT EXISTING USER
                                    if (formData.id) {
                                        const { error } = await supabase.from('profiles').update({
                                            access_profile_id: formData.role_id
                                            // role is auto-synced by DB trigger
                                        }).eq('id', formData.id);
                                        
                                        if (error) alert('Erro ao atualizar: ' + error.message);
                                        else {
                                            setShowModal(false);
                                            fetchData();
                                        }
                                    } 
                                    // 2. CREATE NEW USER (SignUp)
                                    else {
                                        if (!formData.email || !formData.password || !formData.full_name) {
                                            alert('Preencha nome, email e senha.');
                                            setLoading(false);
                                            return;
                                        }

                                        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                                            email: formData.email,
                                            password: formData.password,
                                            options: {
                                                data: {
                                                    full_name: formData.full_name
                                                }
                                            }
                                        });

                                        if (signUpError) {
                                            alert('Erro ao criar usuário: ' + signUpError.message);
                                        } else if (signUpData.user) {
                                            // User created! Profile trigger should have run.
                                            // Now let's update the role if selected.
                                            if (formData.role_id) {
                                                // Small delay to ensure trigger finished? Usually instant but safe to just update.
                                                await supabase.from('profiles').update({
                                                    access_profile_id: formData.role_id,
                                                    full_name: formData.full_name
                                                    // role auto-synced by DB trigger
                                                }).eq('id', signUpData.user.id);
                                            }
                                            alert('Usuário criado com sucesso!');
                                            setShowModal(false);
                                            fetchData();
                                        }
                                    }
                                    setLoading(false);
                                }} 
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
                            >
                                {formData.id ? 'Salvar Alterações' : 'Criar Conta'}
                            </button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default CollaboratorsPage;
