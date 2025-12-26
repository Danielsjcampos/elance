
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Search, Plus, Download, Upload, Mail,
    Trash2, Edit, Save, X, Check, Filter,
    ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/Modal';
import { sendEmail } from '../../services/emailService';
import { emailFlowService } from '../../services/emailFlowService';
import * as XLSX from 'xlsx'; // Assuming we might want Excel, but user said CSV. Vanilla CSV is easier without deps.

// Tipagem
interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    source: string;
    created_at: string;
    notes?: string;
    city?: string; // Potential future fields
    selected?: boolean; // UI state
}

const Clients: React.FC = () => {
    const { isAdmin, profile } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Selection for Bulk Actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Edit Form State
    const [currentClient, setCurrentClient] = useState<Partial<Client>>({});

    // Email State
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('leads') // Using 'leads' table as the base for Clients
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Search & Filter ---
    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
    );

    // --- Pagination ---
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const paginatedClients = filteredClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- Selection Logic ---
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAllPage = () => {
        const newSet = new Set(selectedIds);
        const allPageIds = paginatedClients.map(c => c.id);
        const allSelected = allPageIds.every(id => selectedIds.has(id));

        if (allSelected) {
            allPageIds.forEach(id => newSet.delete(id));
        } else {
            allPageIds.forEach(id => newSet.add(id));
        }
        setSelectedIds(newSet);
    };

    // --- Actions: Export CSV ---
    const handleExportCSV = () => {
        const header = ['Nome', 'Email', 'Telefone', 'Status', 'Origem', 'Data Criação'];
        const rows = filteredClients.map(c => [
            c.name,
            c.email,
            c.phone,
            c.status,
            c.source,
            new Date(c.created_at).toLocaleDateString('pt-BR')
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [header.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "clientes_elance.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Actions: Import CSV ---
    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            // Simple Parser (Assumes: Name,Email,Phone in header or first columns)
            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length < 2) return alert('Arquivo vazio ou inválido');

            // Skip Header
            const dataRows = lines.slice(1);
            let successCount = 0;
            let errorCount = 0;

            setLoading(true);
            setIsImportModalOpen(false);

            for (const row of dataRows) {
                // Adjust split logic for your CSV format (comma or semicolon)
                const cols = row.includes(';') ? row.split(';') : row.split(',');
                // Assuming format: Name, Email, Phone...
                const [pName, pEmail, pPhone] = cols;

                if (pEmail && pEmail.includes('@')) {
                    const { error } = await supabase.from('leads').insert([{
                        name: pName?.replace(/"/g, '') || 'Importado',
                        email: pEmail?.replace(/"/g, '').trim(),
                        phone: pPhone?.replace(/"/g, '').trim(),
                        source: 'Importação CSV',
                        status: 'new'
                    }]);
                    if (!error) successCount++;
                    else errorCount++;
                }
            }

            setLoading(false);
            alert(`Importação concluída!\nSucessos: ${successCount}\nErros/Duplicados: ${errorCount}`);
            fetchClients();
        };
        reader.readAsText(file);
    };

    // --- Actions: Edit ---
    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentClient.id) {
                const { error } = await supabase.from('leads').update(currentClient).eq('id', currentClient.id);
                if (error) throw error;
                alert('Cliente atualizado!');
            } else {
                const { error } = await supabase.from('leads').insert([{ ...currentClient, status: 'new', source: 'Painel Admin' }]);
                if (error) throw error;
                alert('Cliente criado!');
            }
            setIsEditModalOpen(false);

            // Sync with Email Flow Center
            if (currentClient.email && currentClient.name) {
                try {
                    await emailFlowService.syncContact({
                        email: currentClient.email,
                        nome: currentClient.name,
                        telefone: currentClient.phone,
                        origem: 'crm_base_de_clientes',
                        interesses: [],
                        franchise_unit_id: profile?.franchise_unit_id
                    });
                } catch (syncErr) {
                    console.error('Failed to sync to Email Flow Center:', syncErr);
                }
            }

            fetchClients();
        } catch (error: any) {
            alert('Erro: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este cliente?')) return;
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (!error) fetchClients();
    };

    // --- Actions: Bulk Email ---
    const handleBulkEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingEmail(true);

        try {
            // Get Recipients
            const targets = clients.filter(c => selectedIds.has(c.id));
            if (targets.length === 0) throw new Error('Nenhum cliente selecionado.');

            // Get SMTP Config
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase.from('profiles').select('franchise_unit_id').eq('id', user?.id).single();
            const { data: franchise } = await supabase.from('franchise_units').select('smtp_config').eq('id', profile?.franchise_unit_id).single();

            if (!franchise?.smtp_config) throw new Error('SMTP não configurado.');

            let count = 0;
            for (const client of targets) {
                if (client.email) {
                    await sendEmail({
                        to: client.email,
                        subject: emailSubject,
                        html: emailBody.replace('{{nome}}', client.name), // Simple variable substitution
                        smtpConfig: franchise.smtp_config
                    });
                    count++;
                    if (count % 5 === 0) await new Promise(r => setTimeout(r, 500));
                }
            }

            alert(`Email enviado para ${count} clientes!`);
            setIsEmailModalOpen(false);
            setEmailSubject('');
            setEmailBody('');
            setSelectedIds(new Set()); // Reset selection
        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Base de Clientes</h2>
                    <p className="text-gray-500">Gerencie todos os contatos, leads e clientes em um só lugar.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-sm font-medium"
                    >
                        <Download size={18} /> Exportar CSV
                    </button>
                    <label className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-sm font-medium cursor-pointer">
                        <Upload size={18} /> Importar CSV
                        <input type="file" className="hidden" accept=".csv" onChange={handleImportCSV} />
                    </label>
                    <button
                        onClick={() => { setCurrentClient({}); setIsEditModalOpen(true); }}
                        className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] text-sm font-bold"
                    >
                        <Plus size={18} /> Novo Cliente
                    </button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex justify-between items-center mb-4 text-[#3a7ad1] animate-fade-in-down">
                    <span className="font-bold flex items-center gap-2">
                        <Check size={18} /> {selectedIds.size} selecionados
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEmailModalOpen(true)}
                            className="bg-[#3a7ad1] text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-[#2a61b0] flex items-center gap-2"
                        >
                            <Mail size={16} /> Enviar Email em Massa
                        </button>
                    </div>
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 mb-6">
                <Search size={20} className="text-gray-400" />
                <input
                    placeholder="Buscar por nome, email ou telefone..."
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                        <tr>
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    className="accent-[#3a7ad1] w-4 h-4 cursor-pointer"
                                    onChange={toggleAllPage}
                                    checked={paginatedClients.length > 0 && paginatedClients.every(c => selectedIds.has(c.id))}
                                />
                            </th>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Contato</th>
                            <th className="p-4">Status / Origem</th>
                            <th className="p-4">Data Cadastro</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Carregando...</td></tr>
                        ) : paginatedClients.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum cliente encontrado.</td></tr>
                        ) : (
                            paginatedClients.map(client => (
                                <tr key={client.id} className={`hover:bg-gray-50 group transition-colors ${selectedIds.has(client.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="accent-[#3a7ad1] w-4 h-4 cursor-pointer"
                                            checked={selectedIds.has(client.id)}
                                            onChange={() => toggleSelection(client.id)}
                                        />
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{client.name}</td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex flex-col">
                                            <span>{client.email}</span>
                                            <span className="text-xs text-gray-400">{client.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${client.status === 'won' ? 'bg-green-100 text-green-700' :
                                            client.status === 'lost' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {client.status}
                                        </span>
                                        <div className="text-xs text-gray-400 mt-1">{client.source}</div>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(client.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setCurrentClient(client); setIsEditModalOpen(true); }}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>Mostrando {paginatedClients.length} de {filteredClients.length}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Email Modal */}
            <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title={`Enviar para ${selectedIds.size} Clientes`}>
                <form onSubmit={handleBulkEmail} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Assunto</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:border-[#3a7ad1]"
                            value={emailSubject}
                            onChange={e => setEmailSubject(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mensagem (HTML)</label>
                        <textarea
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:border-[#3a7ad1] h-32 font-mono text-sm"
                            value={emailBody}
                            onChange={e => setEmailBody(e.target.value)}
                            placeholder="Olá {{nome}}, temos uma novidade..."
                        />
                        <p className="text-xs text-gray-400 mt-1">Use <b>{'{{nome}}'}</b> para substituir pelo nome do cliente.</p>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="submit"
                            disabled={sendingEmail}
                            className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#2a61b0] disabled:opacity-50 flex items-center gap-2"
                        >
                            {sendingEmail ? 'Enviando...' : <><Mail size={18} /> Enviar Emails</>}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit/Create Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={currentClient.id ? 'Editar Cliente' : 'Novo Cliente'}>
                <form onSubmit={handleSaveClient} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:border-[#3a7ad1]"
                            value={currentClient.name || ''}
                            onChange={e => setCurrentClient({ ...currentClient, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input
                                className="w-full border rounded-lg p-2 outline-none focus:border-[#3a7ad1]"
                                value={currentClient.email || ''}
                                onChange={e => setCurrentClient({ ...currentClient, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Telefone</label>
                            <input
                                className="w-full border rounded-lg p-2 outline-none focus:border-[#3a7ad1]"
                                value={currentClient.phone || ''}
                                onChange={e => setCurrentClient({ ...currentClient, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="submit"
                            className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#2a61b0] flex items-center gap-2"
                        >
                            <Save size={18} /> Salvar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Clients;
