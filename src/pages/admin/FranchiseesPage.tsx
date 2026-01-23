import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    Shield, 
    Plus, 
    MoreVertical, 
    Mail, 
    Phone,
    MapPin,
    Search,
    Building,
    CheckCircle,
    X
} from 'lucide-react';

const FranchiseesPage = () => {
    const navigate = useNavigate();
    const [units, setUnits] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [availableProfiles, setAvailableProfiles] = useState<any[]>([]); // New state for dropdown
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('geral');
    
    // Updated formData structure
    const [formData, setFormData] = useState<any>({
        id: null,
        name: '', 
        document_id: '', 
        city: '', 
        state: '', 
        address: '',
        owner_name: '', 
        owner_phone: '',
        owner_profile_id: '', // New field for selected profile ID
        contract_start_date: '', 
        contract_end_date: '',
        contract_value: 0, 
        royalty_percentage: 0
    });

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        setLoading(true);
        // 1. Fetch Units
        const { data: unitsData } = await supabase.from('franchise_units').select('*').order('created_at', { ascending: false });
        // 2. Fetch Roles (if needed elsewhere)
        const { data: rolesData } = await supabase.from('access_profiles').select('*');
        // 3. Fetch Potential Owners (all users)
        const { data: profilesData } = await supabase.from('profiles').select('id, full_name, email, role_details:access_profiles(name)');

        setUnits(unitsData || []);
        setRoles(rolesData || []);
        setAvailableProfiles(profilesData || []); // Populate dropdown
        setLoading(false);
    };

    // Consolidated edit handler
    const handleEdit = async (unit: any) => {
        // Find existing owner (profile linked to this unit)
        // We select the first profile that has this franchise_unit_id
        const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('franchise_unit_id', unit.id)
            .limit(1)
            .maybeSingle();

        setFormData({
            ...unit,
            owner_profile_id: ownerProfile?.id || '' // Pre-fill dropdown
        });
        setActiveTab('geral');
        setShowModal(true);
    };

    const handleNew = () => {
        setFormData({
            id: null,
            name: '', document_id: '', city: '', state: '', address: '',
            owner_name: '', owner_phone: '',
            owner_email: '', owner_role_id: '',
            contract_start_date: '', contract_end_date: '',
            contract_value: 0, royalty_percentage: 0
        });
        setActiveTab('geral');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Nome da unidade obrigatório');
        
        const payload = { ...formData };
        // Remove extra fields that are not in franchise_units table
        delete payload.id; 
        delete payload.owner_email;
        delete payload.owner_role_id;
        delete payload.owner_profile_id; // Fix: Remove before sending to DB
        delete payload.owner_name;       // Fix: Remove extra UI fields
        delete payload.owner_phone;      // Fix: Remove extra UI fields

        let unitId = formData.id;
        let error;

        if (unitId) {
            const { error: err } = await supabase.from('franchise_units').update(payload).eq('id', unitId);
            error = err;
        } else {
            const { data, error: err } = await supabase.from('franchise_units').insert([payload]).select().single();
            error = err;
            if (data) unitId = data.id;
        }

        if (error) {
            console.error(error);
            alert('Erro ao salvar unidade: ' + error.message);
            return;
        }

        // UPDATE LINKED PROFILE (If User Selected)
        if (formData.owner_profile_id && unitId) {
            console.log('Linking User ID:', formData.owner_profile_id);
            
            // 1. Unlink any previous owner of this unit (Optional, but good practice if we want 1 owner per unit)
            // await supabase.from('profiles').update({ franchise_unit_id: null }).eq('franchise_unit_id', unitId);

            // 2. Link the selected user and FORCE 'manager' role + 'Franqueado' access profile if available
            // This ensures they have the correct permissions for RLS.
            
            // Find 'Franqueado' profile ID from loaded roles
            const franqueadoProfile = roles.find((r: any) => r.name === 'Franqueado');
            
            const updatePayload: any = {
                franchise_unit_id: unitId,
                role: 'manager' // Force legacy role for RLS
            };

            if (franqueadoProfile) {
                updatePayload.access_profile_id = franqueadoProfile.id;
            }

            const { error: updateError } = await supabase.from('profiles').update(updatePayload).eq('id', formData.owner_profile_id);

            if (updateError) {
                alert('Erro ao vincular usuário: ' + updateError.message);
            }
        }

        setShowModal(false);
        fetchUnits();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestão de Franqueados e Unidades</h1>
                    <p className="text-gray-400">Gerencie as unidades da franquia e seus acessos.</p>
                </div>
                <button 
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg"
                >
                    <Plus size={20} />
                    Nova Unidade
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map(unit => (
                    <div key={unit.id} className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                         <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                <Building size={24} />
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full border ${unit.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {unit.active ? 'Ativa' : 'Inativa'}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-1">{unit.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{unit.document_id || 'CNPJ não informado'}</p>

                        <div className="space-y-2 text-sm text-gray-300 mb-6">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-gray-500" />
                                <span>{unit.city} - {unit.state}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-gray-500" />
                                <span>5 Colaboradores</span>
                            </div>
                        </div>

                        <div className="flex gap-2 border-t border-white/5 pt-4">
                            <button 
                                onClick={() => navigate('/admin/colaboradores', { state: { unitId: unit.id, unitName: unit.name } })}
                                className="flex-1 py-2 bg-[#0f172a] hover:bg-blue-600 hover:text-white text-gray-300 rounded-lg transition-colors font-medium text-sm"
                            >
                                Gerenciar Equipe
                            </button>
                            <button onClick={() => handleEdit(unit)} className="px-3 py-2 bg-[#0f172a] hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[#1e293b] rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                         <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#151d38]/50 rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-white">{formData.id ? 'Editar Unidade' : 'Nova Unidade de Franquia'}</h3>
                                <p className="text-sm text-gray-400">Gerencie os dados contratuais e financeiros.</p>
                            </div>
                            <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400 hover:text-white"/></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10 px-6 bg-[#151d38]/30">
                            {['Geral', 'Contrato', 'Financeiro'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.toLowerCase() 
                                        ? 'border-blue-500 text-blue-400' 
                                        : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            {activeTab === 'geral' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <h4 className="text-sm font-bold text-white mb-2 pb-2 border-b border-white/5">Dados Cadastrais</h4>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm text-gray-400 mb-1">Nome da Unidade *</label>
                                            <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none"
                                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                                placeholder="Ex: Unidade Centro"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm text-gray-400 mb-1">Responsável Legal (Nome)</label>
                                            <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none"
                                                value={formData.owner_name || ''} onChange={e => setFormData({...formData, owner_name: e.target.value})}
                                                placeholder="Nome do Franqueado"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">CNPJ</label>
                                            <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none"
                                                value={formData.document_id} onChange={e => setFormData({...formData, document_id: e.target.value})}
                                                placeholder="00.000.000/0000-00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Telefone</label>
                                            <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none"
                                                value={formData.owner_phone || ''} onChange={e => setFormData({...formData, owner_phone: e.target.value})}
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Cidade</label>
                                            <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none"
                                                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Estado</label>
                                            <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none"
                                                value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                                                maxLength={2} placeholder="UF"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <h4 className="text-sm font-bold text-white mb-2 pt-4 border-t border-white/5">Vinculação de Usuário e Acesso</h4>
                                            <p className="text-xs text-gray-400 mb-3">
                                                Selecione um usuário já cadastrado para ser o gestor desta unidade. 
                                                O nível de acesso (Admin/Franqueado) é definido no cadastro do usuário no menu "Colaboradores".
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm text-gray-400 mb-1">Gestor da Unidade (Usuário)</label>
                                            <select 
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none"
                                                value={formData.owner_profile_id || ''}
                                                onChange={e => setFormData({...formData, owner_profile_id: e.target.value})}
                                            >
                                                <option value="">Selecione um Usuário...</option>
                                                {availableProfiles && availableProfiles.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.full_name} ({p.email}) - {p.role_details?.name || 'Sem Cargo'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contrato' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4">
                                        <h4 className="text-blue-400 font-bold mb-1 flex items-center gap-2"><CheckCircle size={16}/> Status do Contrato</h4>
                                        <p className="text-sm text-blue-200/80">O contrato está vigente e regularizado.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Início do Contrato</label>
                                            <input type="date" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none"
                                                value={formData.contract_start_date || ''} onChange={e => setFormData({...formData, contract_start_date: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Fim do Contrato</label>
                                            <input type="date" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none"
                                                value={formData.contract_end_date || ''} onChange={e => setFormData({...formData, contract_end_date: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm text-gray-400 mb-1">Valor do Contrato (R$)</label>
                                            <input type="number" step="0.01" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500/50 focus:outline-none"
                                                value={formData.contract_value || ''} onChange={e => setFormData({...formData, contract_value: parseFloat(e.target.value)})}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'financeiro' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                                            <p className="text-sm text-gray-400 mb-1">Royalties (%)</p>
                                            <div className="flex items-center gap-2">
                                                <input type="number" step="0.1" className="bg-transparent text-xl font-bold text-white w-20 focus:outline-none border-b border-white/10 focus:border-blue-500"
                                                    value={formData.royalty_percentage || ''} onChange={e => setFormData({...formData, royalty_percentage: parseFloat(e.target.value)})}
                                                    placeholder="0.0"
                                                />
                                                <span className="text-gray-500">%</span>
                                            </div>
                                        </div>
                                        <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                                            <p className="text-sm text-gray-400 mb-1">Status Financeiro</p>
                                            <span className="text-green-400 font-bold flex items-center gap-2">Regular <CheckCircle size={16}/></span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-white font-bold mb-3 border-b border-white/5 pb-2">Resumo Financeiro</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center bg-[#0f172a] p-3 rounded-lg border border-white/5">
                                                <span className="text-gray-400 text-sm">Total Pago (Acumulado)</span>
                                                <span className="text-green-400 font-bold">R$ 45.200,00</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-[#0f172a] p-3 rounded-lg border border-white/5">
                                                <span className="text-gray-400 text-sm">Pendente (Mês Atual)</span>
                                                <span className="text-yellow-400 font-bold">R$ 1.500,00</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-center">Para ver o extrato detalhado, acesse o módulo Financeiro.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#151d38]/50 rounded-b-2xl">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95">
                                {formData.id ? 'Salvar Alterações' : 'Criar Unidade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FranchiseesPage;
