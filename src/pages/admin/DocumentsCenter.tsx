import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CompanyDocument } from '../../../types';
import { 
    FileText, 
    Download, 
    Shield, 
    AlertCircle,
    FileCheck,
    Search,
    Filter,
    Plus,
    X,
    FolderOpen,
    ExternalLink
} from 'lucide-react';

const DocumentsCenter = () => {
    const [documents, setDocuments] = useState<CompanyDocument[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        // Note: 'company_documents' table used in migration
        const { data, error } = await supabase
            .from('company_documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setDocuments(data || []);
        setLoading(false);
    };

    const filteredDocs = documents.filter(doc => {
        const matchesTab = activeTab === 'all' || doc.category === activeTab;
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const stats = {
        total: documents.length,
        contracts: documents.filter(d => d.category === 'contract').length,
        manuals: documents.filter(d => d.category === 'manual').length,
        policies: documents.filter(d => d.category === 'policy').length
    };

    return (
        <div className="space-y-6 text-white">
            {/* Header Alert Box */}
            <div className="bg-orange-900/20 border border-orange-500/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h2 className="text-xl font-bold text-orange-400 flex items-center gap-2 mb-4 relative z-10">
                    <AlertCircle size={24} />
                    Documentos Importantes
                </h2>
                <ul className="space-y-2 text-gray-300 relative z-10 text-sm">
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                        Seu contrato de franquia vence em <span className="text-white font-bold">15/03/2027</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                        Manual do Franqueado foi atualizado em <span className="text-white font-bold">01/01/2024</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                        Nova política de compliance disponível para download na aba de Políticas.
                    </li>
                </ul>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total de Documentos" value={stats.total} icon={<FolderOpen className="text-blue-400" />} />
                <StatCard label="Contratos" value={stats.contracts} icon={<Shield className="text-purple-400" />} />
                <StatCard label="Manuais" value={stats.manuals} icon={<BookIcon className="text-yellow-400" />} />
                <StatCard label="Políticas" value={stats.policies} icon={<FileCheck className="text-green-400" />} />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1e293b] p-2 rounded-2xl border border-white/5">
                <div className="flex bg-[#0f172a] rounded-xl p-1 overflow-x-auto max-w-full">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'contract', label: 'Contratos' },
                        { id: 'manual', label: 'Manuais' },
                        { id: 'policy', label: 'Políticas' },
                        { id: 'form', label: 'Formulários' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <input 
                            type="text" 
                            placeholder="Buscar documento..." 
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors flex items-center gap-2 font-bold text-sm"
                    >
                        <Plus size={18} /> Novo
                    </button>
                </div>
            </div>

            {/* Document List */}
            {loading ? <p>Carregando...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocs.map(doc => (
                        <DocumentCard key={doc.id} doc={doc} />
                    ))}
                    {filteredDocs.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-[#1e293b]/50 rounded-2xl border border-white/5">
                            Nenhum documento encontrado.
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions Footer */}
            <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
                <h3 className="font-bold text-xl mb-4">Solicitações</h3>
                <p className="text-gray-400 text-sm mb-4">Precisa de um documento específico que não está listado acima?</p>
                <div className="flex flex-col gap-2">
                    <button className="w-full flex justify-between items-center bg-[#0f172a] p-4 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors group">
                        <span className="font-medium text-gray-200 group-hover:text-white">Solicitar Documento Específico</span>
                        <ExternalLink size={18} className="text-gray-500 group-hover:text-blue-400" />
                    </button>
                    <button className="w-full flex justify-between items-center bg-[#0f172a] p-4 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors group">
                        <span className="font-medium text-gray-200 group-hover:text-white">Reportar Problema com Documento</span>
                        <AlertCircle size={18} className="text-gray-500 group-hover:text-orange-400" />
                    </button>
                </div>
            </div>

             {/* Add Modal */}
             {showModal && (
                <AddDocumentModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchDocuments(); }} />
            )}
        </div>
    );
};

// --- Sub Components ---

const StatCard = ({ label, value, icon }: any) => (
    <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
        <div className="p-3 bg-white/5 rounded-full mb-3">{icon}</div>
        <h4 className="text-2xl font-bold text-white mb-1">{value}</h4>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

const BookIcon = ({ className }: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
);

const DocumentCard = ({ doc }: { doc: CompanyDocument }) => {
    const isConfidential = doc.category === 'contract';

    return (
        <div className="bg-[#1e293b] p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all group">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <FileText size={24} />
                    </div>
                    {isConfidential && (
                        <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-1 rounded-full border border-red-500/20 font-bold uppercase tracking-wider">
                            Confidencial
                        </span>
                    )}
                </div>
                
                <h4 className="font-bold text-lg text-white mb-1 line-clamp-1" title={doc.title}>{doc.title}</h4>
                <p className="text-sm text-gray-400 line-clamp-2 h-10 mb-4">{doc.description || 'Sem descrição.'}</p>
                
                <div className="flex items-center gap-2 mb-4">
                     <span className="text-[10px] px-2 py-1 bg-white/5 rounded text-gray-300 border border-white/5">
                        {new Date(doc.created_at).toLocaleDateString()}
                     </span>
                     <span className="text-[10px] px-2 py-1 bg-white/5 rounded text-gray-300 border border-white/5 capitalize">
                        {doc.category === 'contract' ? 'Contrato' : doc.category === 'manual' ? 'Manual' : doc.category === 'policy' ? 'Política' : 'Documento'}
                     </span>
                </div>
            </div>

            <div className="flex gap-2">
                <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-[#0f172a] hover:bg-blue-600 hover:text-white text-gray-300 py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all font-medium text-sm"
                >
                    <Download size={16} /> Baixar
                </a>
                <button className="px-3 bg-[#0f172a] hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-colors">
                    <ExternalLink size={16} />
                </button>
            </div>
        </div>
    );
};

const AddDocumentModal = ({ onClose, onSuccess }: any) => {
    const [formData, setFormData] = useState<Partial<CompanyDocument>>({
        title: '',
        description: '',
        category: 'manual',
        file_url: '',
        is_public: true
    });

    const handleSave = async () => {
        if (!formData.title || !formData.file_url) return alert('Campos obrigatórios');
        
        const { error } = await supabase.from('company_documents').insert([{ ...formData }]);
        if (error) {
            alert('Erro ao salvar');
        } else {
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Novo Documento</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Título</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                        <select className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="contract">Contrato</option>
                            <option value="manual">Manual</option>
                            <option value="policy">Política</option>
                            <option value="form">Formulário</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">URL do Arquivo</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                        <textarea className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            rows={3}
                            value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 rounded-xl text-white font-bold">Salvar</button>
                </div>
            </div>
        </div>
    );
};

export default DocumentsCenter;
