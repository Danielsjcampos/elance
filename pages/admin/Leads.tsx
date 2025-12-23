import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit, Search, Filter, LayoutGrid, List as ListIcon, User, Tag, Phone, Mail, MoreVertical } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// --- Types ---
interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    source: string;
    notes?: string;
    tags?: string[];
    assigned_to?: string;
    created_at: string;
}

interface Profile {
    id: string;
    full_name: string;
    role: string;
}

const COLUMNS = {
    new: { title: 'Novo', color: 'bg-blue-100 text-blue-700' },
    contacted: { title: 'Contatado', color: 'bg-yellow-100 text-yellow-700' },
    qualified: { title: 'Qualificado', color: 'bg-purple-100 text-purple-700' },
    converted: { title: 'Convertido', color: 'bg-green-100 text-green-700' },
    lost: { title: 'Perdido', color: 'bg-red-100 text-red-700' }
};

const AVAILABLE_TAGS = ['Landing Page', 'WhatsApp', 'Instagram', 'Indicação', 'Advogado', 'Credenciados'];

const Leads: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]); // For assignment
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState<Partial<Lead>>({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchLeads();
        fetchProfiles();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfiles = async () => {
        try {
            const { data } = await supabase.from('profiles').select('id, full_name, role');
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const leadData = {
                name: currentLead.name,
                email: currentLead.email,
                phone: currentLead.phone,
                status: currentLead.status || 'new',
                source: currentLead.source || 'manual',
                notes: currentLead.notes,
                tags: currentLead.tags || [],
                assigned_to: currentLead.assigned_to
            };

            if (isEditing && currentLead.id) {
                const { error } = await supabase.from('leads').update(leadData).eq('id', currentLead.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('leads').insert([leadData]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchLeads();
        } catch (error: any) {
            alert('Erro ao salvar lead: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este lead?')) return;
        try {
            const { error } = await supabase.from('leads').delete().eq('id', id);
            if (error) throw error;
            setLeads(leads.filter(l => l.id !== id));
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { draggableId, destination } = result;
        const newStatus = destination.droppableId as Lead['status'];

        // Optimistic Update
        const updatedLeads = leads.map(l =>
            l.id === draggableId ? { ...l, status: newStatus } : l
        );
        setLeads(updatedLeads);

        // Server Update
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', draggableId);

            if (error) {
                // Revert on error
                fetchLeads();
                alert('Erro ao atualizar status.');
            }
        } catch (err) {
            fetchLeads();
        }
    };

    const openNewModal = () => {
        setCurrentLead({ status: 'new', source: 'manual', tags: [] });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (lead: Lead) => {
        setCurrentLead(lead);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const toggleTag = (tag: string) => {
        const currentTags = currentLead.tags || [];
        if (currentTags.includes(tag)) {
            setCurrentLead({ ...currentLead, tags: currentTags.filter(t => t !== tag) });
        } else {
            setCurrentLead({ ...currentLead, tags: [...currentTags, tag] });
        }
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Render Helpers ---

    const renderKanban = () => (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-200px)]">
                {Object.entries(COLUMNS).map(([status, config]) => (
                    <Droppable key={status} droppableId={status}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="min-w-[300px] bg-gray-50 rounded-xl p-4 flex flex-col h-full"
                            >
                                <div className={`flex items-center justify-between mb-4 px-2`}>
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${config.color.split(' ')[0].replace('100', '500')}`} />
                                        {config.title}
                                    </h3>
                                    <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold text-gray-400 shadow-sm">
                                        {filteredLeads.filter(l => l.status === status).length}
                                    </span>
                                </div>

                                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                                    {filteredLeads.filter(l => l.status === status).map((lead, index) => (
                                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing"
                                                    onClick={() => openEditModal(lead)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-gray-800">{lead.name}</h4>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                            <Edit size={14} className="text-gray-400" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(lead.id);
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Excluir"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {lead.tags && lead.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mb-3">
                                                            {lead.tags.map(tag => (
                                                                <span key={tag} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium border border-blue-100">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="space-y-1">
                                                        {lead.phone && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <Phone size={12} /> {lead.phone}
                                                            </div>
                                                        )}
                                                        {lead.assigned_to && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t">
                                                                <User size={12} />
                                                                {profiles.find(p => p.id === lead.assigned_to)?.full_name || 'Usuário Desconhecido'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Gestão de Leads</h2>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="bg-gray-100 p-1 rounded-lg flex items-center mr-2">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow text-[#3a7ad1]' : 'text-gray-400'}`}
                            title="Visualização Kanban"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-[#3a7ad1]' : 'text-gray-400'}`}
                            title="Visualização Lista"
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>

                    <div className="relative flex-1 md:w-64">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar leads..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={openNewModal}
                        className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] transition-colors whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Novo Lead
                    </button>
                </div>
            </div>

            {viewMode === 'kanban' ? renderKanban() : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Nome</th>
                                <th className="p-4 font-semibold text-gray-600">Contato</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Tags</th>
                                <th className="p-4 font-semibold text-gray-600">Responsável</th>
                                <th className="p-4 font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{lead.name}</div>
                                        <div className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-600">{lead.email}</div>
                                        <div className="text-sm text-gray-500">{lead.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${COLUMNS[lead.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                                            {COLUMNS[lead.status]?.title || lead.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {lead.tags?.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded border">{tag}</span>
                                            ))}
                                            {(lead.tags?.length || 0) > 2 && <span className="text-[10px] text-gray-400">+{lead.tags!.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {profiles.find(p => p.id === lead.assigned_to)?.full_name || '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEditModal(lead)} className="p-1 text-gray-400 hover:text-[#3a7ad1]"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(lead.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Editar Lead" : "Novo Lead"}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                        <input
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                            value={currentLead.name || ''}
                            onChange={e => setCurrentLead({ ...currentLead, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={currentLead.email || ''}
                                onChange={e => setCurrentLead({ ...currentLead, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Telefone/WhatsApp</label>
                            <input
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={currentLead.phone || ''}
                                onChange={e => setCurrentLead({ ...currentLead, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={currentLead.status || 'new'}
                                onChange={e => setCurrentLead({ ...currentLead, status: e.target.value as any })}
                            >
                                {Object.entries(COLUMNS).map(([key, config]) => (
                                    <option key={key} value={key}>{config.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Responsável</label>
                            <select
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={currentLead.assigned_to || ''}
                                onChange={e => setCurrentLead({ ...currentLead, assigned_to: e.target.value })}
                            >
                                <option value="">Não atribuído</option>
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Tag size={16} /> Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${(currentLead.tags || []).includes(tag)
                                        ? 'bg-blue-100 border-blue-200 text-blue-700 font-medium'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Observações</label>
                        <textarea
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none h-24 resize-none"
                            value={currentLead.notes || ''}
                            onChange={e => setCurrentLead({ ...currentLead, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0] font-medium shadow-sm"
                        >
                            Salvar Lead
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Leads;
