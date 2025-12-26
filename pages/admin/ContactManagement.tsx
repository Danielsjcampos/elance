import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, UserPlus, Filter, MoreVertical, Mail, Phone, Tag, RefreshCw, Edit, Trash2, Send, X, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { emailFlowService } from '../../services/emailFlowService';
import { Modal } from '../../components/Modal';
import { sendEmail } from '../../services/emailService';

const ContactManagement: React.FC = () => {
    const { profile } = useAuth();
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentContact, setCurrentContact] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchContacts();

        // Close menu on click outside
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchContacts = async () => {
        try {
            const { data, error } = await supabase
                .from('email_contacts')
                .select('*')
                .order('data_criacao', { ascending: false });

            if (error) throw error;
            setContacts(data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSyncBase = async () => {
        if (!profile) {
            alert('Aguarde o carregamento do seu perfil antes de sincronizar.');
            return;
        }

        if (!confirm('Deseja sincronizar todos os leads e clientes do CRM para a base de e-mail? Isso garantirá que todos os seus contatos estejam disponíveis para automação.')) return;

        setSyncing(true);
        try {
            // 1. Fetch all leads
            const { data: leads, error: leadsError } = await supabase
                .from('leads')
                .select('*');

            if (leadsError) throw leadsError;

            if (!leads || leads.length === 0) {
                alert('Nenhum lead encontrado para sincronizar.');
                return;
            }

            // 2. Sync each lead
            let count = 0;
            for (const lead of leads) {
                if (lead.email) {
                    await emailFlowService.syncContact({
                        email: lead.email,
                        nome: lead.name,
                        telefone: lead.phone,
                        origem: lead.source || 'crm_sync',
                        interesses: lead.tags || [],
                        franchise_unit_id: profile?.franchise_unit_id || lead.franchise_unit_id
                    });
                    count++;
                }
            }

            alert(`Sincronização concluída! ${count} contatos processados.`);
            fetchContacts();
        } catch (error: any) {
            console.error('Error syncing base:', error);
            alert('Erro ao sincronizar base: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleDeleteContact = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este contato da base de e-mail?')) return;

        try {
            const { error } = await supabase.from('email_contacts').delete().eq('id', id);
            if (error) throw error;
            setContacts(contacts.filter(c => c.id !== id));
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const handleOpenCreateModal = () => {
        setCurrentContact({
            nome: '',
            email: '',
            telefone: '',
            interesses: [],
            status: 'ativo'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const contactData = {
                nome: currentContact.nome,
                email: currentContact.email,
                telefone: currentContact.telefone,
                interesses: currentContact.interesses,
                status: currentContact.status || 'ativo',
                franchise_unit_id: profile?.franchise_unit_id
            };

            if (currentContact.id) {
                // Update
                const { error } = await supabase
                    .from('email_contacts')
                    .update(contactData)
                    .eq('id', currentContact.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('email_contacts')
                    .insert([contactData]);
                if (error) throw error;
            }

            fetchContacts();
            setIsEditModalOpen(false);
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendTestEmail = async (contact: any) => {
        try {
            // Get SMTP Config
            const { data: franchise } = await supabase
                .from('franchise_units')
                .select('smtp_config')
                .eq('id', profile?.franchise_unit_id)
                .single();

            if (!franchise?.smtp_config) {
                alert('SMTP não configurado. Vá em Configurações > Email/SMTP.');
                return;
            }

            const success = await sendEmail({
                to: contact.email,
                subject: 'E-mail de Teste - E-Lance Marketing',
                html: `<h1>Teste de Envio</h1><p>Olá ${contact.nome}, este é um e-mail de teste enviado através do portal E-Lance.</p>`,
                smtpConfig: franchise.smtp_config
            });

            if (success) alert('E-mail de teste enviado com sucesso!');
            else alert('Falha ao enviar e-mail de teste. Verifique as configurações de SMTP.');
        } catch (error: any) {
            alert('Erro: ' + error.message);
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#3a7ad1]/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={handleSyncBase}
                        disabled={syncing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-[#3a7ad1] bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
                        title="Importa todos os leads e clientes para a base de e-mail"
                    >
                        <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Sincronizando...' : 'Sincronizar Base'}
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                        <Filter size={18} /> Filtrar
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#3a7ad1] text-white rounded-xl hover:bg-[#2a61b0] transition-colors font-medium shadow-sm"
                    >
                        <UserPlus size={18} /> Novo Contato
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Nome / Email</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Interesses</th>
                            <th className="px-6 py-4">Origem</th>
                            <th className="px-6 py-4">Última Interação</th>
                            <th className="px-6 py-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="px-6 py-4 h-16 bg-gray-50/50"></td>
                                </tr>
                            ))
                        ) : filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                    Nenhum contato encontrado.
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#3a7ad1]/10 text-[#3a7ad1] flex items-center justify-center font-bold text-sm">
                                                {contact.nome[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{contact.nome}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail size={12} /> {contact.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${contact.status === 'ativo' ? 'bg-green-100 text-green-700' :
                                            contact.status === 'inativo' ? 'bg-gray-100 text-gray-500' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {contact.interesses?.map((i: string, idx: number) => (
                                                <span key={idx} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-100 flex items-center gap-1">
                                                    <Tag size={10} /> {i}
                                                </span>
                                            ))}
                                            {(!contact.interesses || contact.interesses.length === 0) && '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="capitalize">{contact.origem || 'Manual'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {new Date(contact.ultima_interacao).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === contact.id ? null : contact.id); }}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {activeMenu === contact.id && (
                                            <div className="absolute right-6 top-12 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                                                <button
                                                    onClick={() => { setCurrentContact(contact); setIsEditModalOpen(true); }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit size={16} className="text-blue-500" /> Editar Contato
                                                </button>
                                                <button
                                                    onClick={() => handleSendTestEmail(contact)}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Send size={16} className="text-green-500" /> Enviar Teste
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContact(contact.id)}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                                                >
                                                    <Trash2 size={16} /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && currentContact && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Contato">
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                            <input
                                required
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]/20"
                                value={currentContact.nome}
                                onChange={e => setCurrentContact({ ...currentContact, nome: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]/20"
                                    value={currentContact.email}
                                    onChange={e => setCurrentContact({ ...currentContact, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Telefone</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]/20"
                                    value={currentContact.telefone || ''}
                                    onChange={e => setCurrentContact({ ...currentContact, telefone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                <Tag size={16} /> Interesses (Tags)
                            </label>
                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                                {['imovel', 'leilao', 'veiculo', 'investidor', 'news', 'designer', 'modelo'].map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            const tags = currentContact.interesses || [];
                                            const newTags = tags.includes(tag) ? tags.filter((t: string) => t !== tag) : [...tags, tag];
                                            setCurrentContact({ ...currentContact, interesses: newTags });
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${currentContact.interesses?.includes(tag)
                                            ? 'bg-[#3a7ad1] text-white border-[#3a7ad1]'
                                            : 'bg-white text-gray-500 border-gray-200'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-[#3a7ad1] text-white rounded-lg font-bold hover:bg-[#2a61b0] disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ContactManagement;
