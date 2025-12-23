import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Building2, MapPin, Edit, Users, Save, Trash2, Shield, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/Modal';

interface FranchiseUnit {
    id: string;
    name: string;
    cnpj: string;
    address: string;
    active: boolean;
    created_at?: string;
}

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    permissions: Record<string, boolean>;
    franchise_unit_id?: string;
}

const Franchises: React.FC = () => {
    const { isAdmin } = useAuth();
    const [franchises, setFranchises] = useState<FranchiseUnit[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFranchise, setSelectedFranchise] = useState<FranchiseUnit | null>(null);
    const [activeTab, setActiveTab] = useState<'data' | 'team'>('data');

    // Franchise Data Form State
    const [formData, setFormData] = useState<Partial<FranchiseUnit>>({});

    // Team Management State
    const [team, setTeam] = useState<UserProfile[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null); // For permission/data edit
    const [userData, setUserData] = useState({
        id: '',
        full_name: '',
        email: '',
        password: '',
        role: 'manager',
        permissions: {} as Record<string, boolean>
    });

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetchFranchises();
    }, []);

    useEffect(() => {
        if (selectedFranchise && activeTab === 'team') {
            fetchTeam(selectedFranchise.id);
        }
    }, [selectedFranchise, activeTab]);

    const fetchFranchises = async () => {
        try {
            const { data, error } = await supabase
                .from('franchise_units')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFranchises(data || []);
        } catch (error) {
            console.error('Error fetching franchises:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeam = async (franchiseId: string) => {
        setLoadingTeam(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('franchise_unit_id', franchiseId);

            if (error) throw error;
            setTeam(data || []);
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoadingTeam(false);
        }
    };

    const openNewFranchiseModal = () => {
        setSelectedFranchise(null);
        setFormData({ name: '', cnpj: '', address: '', active: true });
        setActiveTab('data');
        setIsModalOpen(true);
    };

    const openEditFranchiseModal = (franchise: FranchiseUnit) => {
        setSelectedFranchise(franchise);
        setFormData(franchise);
        setActiveTab('data'); // Start on data tab
        setIsModalOpen(true);
    };

    const handleSaveFranchise = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedFranchise) {
                // Update
                const { error } = await supabase
                    .from('franchise_units')
                    .update({
                        name: formData.name,
                        cnpj: formData.cnpj,
                        address: formData.address,
                        active: formData.active
                    })
                    .eq('id', selectedFranchise.id);
                if (error) throw error;
                alert('Franquia atualizada!');
            } else {
                // Create
                const { error } = await supabase
                    .from('franchise_units')
                    .insert([{
                        name: formData.name,
                        cnpj: formData.cnpj,
                        address: formData.address,
                        active: true
                    }]);
                if (error) throw error;
                alert('Franquia criada!');
            }
            setIsModalOpen(false);
            fetchFranchises();
        } catch (error: any) {
            alert('Erro ao salvar franquia: ' + error.message);
        }
    };

    const handleDeleteFranchise = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir a franquia "${name}"? Esta ação não pode ser desfeita.`)) return;

        try {
            const { error } = await supabase
                .from('franchise_units')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Franquia excluída com sucesso.');
            fetchFranchises();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    // --- User Management Logic ---

    const openNewUserModal = () => {
        setEditingUser(null);
        setUserData({
            id: '',
            full_name: '',
            email: '',
            password: '',
            role: 'manager',
            permissions: {}
        });
        setIsUserModalOpen(true);
    };

    const openEditUserModal = (user: UserProfile) => {
        setEditingUser(user);
        setUserData({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            password: '', // blank usually
            role: user.role,
            permissions: user.permissions || {}
        });
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFranchise) return;

        try {
            if (editingUser) {
                // Update
                const { error } = await supabase.rpc('admin_update_user', {
                    target_user_id: userData.id,
                    new_email: userData.email,
                    new_password: userData.password || null,
                    new_full_name: userData.full_name,
                    new_role: userData.role,
                    new_permissions: userData.permissions
                });
                if (error) throw error;
                alert('Usuário atualizado!');
            } else {
                // Create
                const { error } = await supabase.rpc('admin_create_user', {
                    new_email: userData.email,
                    new_password: userData.password,
                    new_full_name: userData.full_name,
                    new_role: userData.role,
                    new_franchise_id: selectedFranchise.id, // FORCE CURRENT FRANCHISE
                    new_permissions: userData.permissions
                });
                if (error) throw error;
                alert('Usuário criado!');
            }
            setIsUserModalOpen(false);
            fetchTeam(selectedFranchise.id);
        } catch (error: any) {
            alert('Erro ao salvar usuário: ' + error.message);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Excluir este usuário?')) return;
        try {
            const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
            if (error) throw error;
            alert('Usuário excluído.');
            if (selectedFranchise) fetchTeam(selectedFranchise.id);
        } catch (error: any) {
            alert('Erro: ' + error.message);
        }
    };

    const permissionKeys = [
        { key: 'dashboard', label: 'Ver Dashboard' },
        { key: 'leads', label: 'Ver Leads' },
        { key: 'auctions', label: 'Ver Leilões' },
        { key: 'tasks', label: 'Ver Tarefas' },
        { key: 'training', label: 'Ver Treinamentos' },
        { key: 'documents', label: 'Ver Documentos' },
        { key: 'marketing', label: 'Ver Marketing' },
        { key: 'agenda', label: 'Ver Agenda' },
        { key: 'finance', label: 'Ver Financeiro' },
        { key: 'datajud', label: 'Ver Jurídico (Datajud)' },
        { key: 'settings', label: 'Ver Configurações' }
    ];

    const togglePermission = (key: string) => {
        setUserData({
            ...userData,
            permissions: {
                ...userData.permissions,
                [key]: !userData.permissions?.[key]
            }
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestão de Franquias</h2>
                <div className="flex items-center gap-3">
                    <div className="bg-white border rounded-lg p-1 flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-[#3a7ad1]' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Visualização em Grade"
                        >
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                                <div className="bg-current rounded-[1px]"></div>
                                <div className="bg-current rounded-[1px]"></div>
                                <div className="bg-current rounded-[1px]"></div>
                                <div className="bg-current rounded-[1px]"></div>
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-[#3a7ad1]' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Visualização em Lista"
                        >
                            <div className="flex flex-col gap-0.5 w-4 h-4 justify-center">
                                <div className="bg-current h-[2px] w-full rounded-[1px]"></div>
                                <div className="bg-current h-[2px] w-full rounded-[1px]"></div>
                                <div className="bg-current h-[2px] w-full rounded-[1px]"></div>
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={openNewFranchiseModal}
                        className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] transition-colors"
                    >
                        <Plus size={20} />
                        Nova Franquia
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-500">Carregando franquias...</p>
            ) : franchises.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Nenhuma franquia cadastrada.</p>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {franchises.map((franchise) => (
                        <div key={franchise.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditFranchiseModal(franchise);
                                    }}
                                    className="p-2 text-gray-400 hover:text-[#3a7ad1] bg-gray-50 rounded-lg"
                                    title="Editar"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFranchise(franchise.id, franchise.name);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <h3
                                    className="font-bold text-gray-800 text-lg flex items-center gap-2 cursor-pointer hover:text-[#3a7ad1]"
                                    onClick={() => openEditFranchiseModal(franchise)}
                                >
                                    <Building2 size={20} className="text-[#3a7ad1]" />
                                    {franchise.name}
                                </h3>
                            </div>

                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${franchise.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {franchise.active ? 'Ativa' : 'Inativa'}
                            </span>

                            <div className="space-y-2 text-sm text-gray-600 mt-3">
                                {franchise.cnpj && <p>CNPJ: {franchise.cnpj}</p>}
                                {franchise.address && (
                                    <p className="flex items-start gap-2">
                                        <MapPin size={16} className="mt-1 flex-shrink-0" />
                                        {franchise.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Franquia</th>
                                <th className="p-4 font-semibold text-gray-600">CNPJ</th>
                                <th className="p-4 font-semibold text-gray-600">Endereço</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600 block text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {franchises.map((franchise) => (
                                <tr key={franchise.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openEditFranchiseModal(franchise)}>
                                    <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                                        <Building2 size={18} className="text-[#3a7ad1]" />
                                        {franchise.name}
                                    </td>
                                    <td className="p-4 text-gray-600">{franchise.cnpj || '-'}</td>
                                    <td className="p-4 text-gray-600 truncate max-w-xs">{franchise.address || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${franchise.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {franchise.active ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditFranchiseModal(franchise);
                                                }}
                                                className="text-gray-400 hover:text-[#3a7ad1] p-1"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFranchise(franchise.id, franchise.name);
                                                }}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Main Franchise Modal (Tabs: Data & Team) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedFranchise ? `Gerenciar: ${selectedFranchise.name}` : 'Nova Franquia'}
            >
                <div className="mb-6">
                    {/* Tabs */}
                    <div className="flex items-center gap-4 border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('data')}
                            className={`pb-3 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'data' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500'}`}
                        >
                            <Building2 size={18} /> Dados da Franquia
                        </button>
                        {selectedFranchise && (
                            <button
                                onClick={() => setActiveTab('team')}
                                className={`pb-3 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'team' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500'}`}
                            >
                                <Users size={18} /> Equipe ({team.length})
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    {activeTab === 'data' ? (
                        <form onSubmit={handleSaveFranchise} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome da Franquia</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">CNPJ</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={formData.cnpj || ''}
                                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Endereço</label>
                                <textarea
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            {selectedFranchise && (
                                <div className="flex items-center gap-2 mt-4">
                                    <input
                                        type="checkbox"
                                        checked={formData.active !== false}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4 text-[#3a7ad1] rounded"
                                    />
                                    <label>Franquia Ativa</label>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0]"
                                >
                                    Salvar Dados
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-700">Usuários da Franquia</h4>
                                <button
                                    onClick={openNewUserModal}
                                    className="bg-[#3a7ad1] text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-[#2a61b0]"
                                >
                                    <Plus size={16} /> Adicionar Usuário
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                                {loadingTeam ? (
                                    <p className="p-4 text-center text-gray-500">Carregando equipe...</p>
                                ) : team.length === 0 ? (
                                    <p className="p-4 text-center text-gray-500">Nenhum usuário nesta franquia.</p>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-600">Nome</th>
                                                <th className="p-3 font-semibold text-gray-600">Email</th>
                                                <th className="p-3 font-semibold text-gray-600">Função</th>
                                                <th className="p-3 font-semibold text-gray-600">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {team.map(user => (
                                                <tr key={user.id} className="hover:bg-white">
                                                    <td className="p-3 font-medium">{user.full_name}</td>
                                                    <td className="p-3 text-gray-500">{user.email}</td>
                                                    <td className="p-3 capitalize">{user.role}</td>
                                                    <td className="p-3 flex gap-2">
                                                        <button
                                                            onClick={() => openEditUserModal(user)}
                                                            className="text-gray-600 hover:text-[#3a7ad1] p-1"
                                                            title="Editar Usuário"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-gray-400 hover:text-red-500 p-1"
                                                            title="Excluir Usuário"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Sub-Modal: User Create/Edit */}
            <Modal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                title={editingUser ? `Editar Usuário: ${editingUser.full_name}` : 'Novo Usuário da Franquia'}
            >
                <form onSubmit={handleSaveUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none"
                            value={userData.full_name}
                            onChange={e => setUserData({ ...userData, full_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            required
                            type="email"
                            className="w-full border rounded-lg p-2 outline-none"
                            value={userData.email}
                            onChange={e => setUserData({ ...userData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Senha {editingUser ? '(Opcional/Vazio para manter)' : '(Obrigatória)'}</label>
                        <input
                            type="password"
                            required={!editingUser}
                            className="w-full border rounded-lg p-2 outline-none"
                            placeholder="******"
                            value={userData.password}
                            onChange={e => setUserData({ ...userData, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Função</label>
                        <select
                            className="w-full border rounded-lg p-2 outline-none bg-white"
                            value={userData.role}
                            onChange={e => setUserData({ ...userData, role: e.target.value })}
                        >
                            <option value="manager">Gerente</option>
                            <option value="admin">Administrador</option>
                            <option value="collaborator">Colaborador</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Permissões Específicas</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-40 overflow-y-auto border p-2 rounded-lg">
                            {permissionKeys.map(({ key, label }) => {
                                const isAllowed = userData.permissions[key] !== false;
                                return (
                                    <label key={key} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isAllowed ? 'bg-[#3a7ad1] border-[#3a7ad1]' : 'border-gray-300 bg-white'}`}>
                                            {isAllowed && <Check size={12} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isAllowed}
                                            onChange={() => togglePermission(key)}
                                        />
                                        <span className="text-gray-700">{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t mt-4">
                        <button
                            type="button"
                            onClick={() => setIsUserModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0] font-bold"
                        >
                            {editingUser ? 'Atualizar Usuário' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Franchises;
