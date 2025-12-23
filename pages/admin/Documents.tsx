import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, FileText, Download, CheckCircle, FileCheck, Users, X, Clock, User, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/Modal';

interface Document {
    id: string;
    title: string;
    file_url: string;
    category: string;
    created_at: string;
    requires_signature: boolean;
    target_roles: string[];
    target_user_ids?: string[];
    is_signed?: boolean;
    signature_count?: number;
}

interface Profile {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
}

const Documents: React.FC = () => {
    const { isAdmin, user, profile } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);
    const [newDoc, setNewDoc] = useState({
        title: '',
        file_url: '',
        category: 'Outros',
        requires_signature: false,
        target_roles: ['all'],
        target_user_ids: [] as string[]
    });

    useEffect(() => {
        if (user) {
            fetchDocuments();
            if (isAdmin) fetchProfiles();
        }
    }, [user, isAdmin]);

    const fetchProfiles = async () => {
        const { data } = await supabase.from('profiles').select('id, full_name, role, avatar_url');
        setProfiles(data || []);
    };

    const fetchDocuments = async () => {
        try {
            // 1. Fetch Docs
            const { data: docsData, error } = await supabase
                .from('company_documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!docsData) return;

            // 2. Fetch Signatures for current user to know what IS signed
            const { data: mySignatures } = await supabase
                .from('document_signatures')
                .select('document_id')
                .eq('user_id', user?.id);

            const signedDocIds = new Set(mySignatures?.map(s => s.document_id));

            // 3. Map status
            const formatted = docsData.map(doc => ({
                ...doc,
                is_signed: signedDocIds.has(doc.id)
            }));

            setDocuments(formatted);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const docData = {
                title: newDoc.title,
                file_url: newDoc.file_url,
                category: newDoc.category,
                requires_signature: newDoc.requires_signature,
                target_roles: newDoc.target_roles,
                target_user_ids: newDoc.target_user_ids
            };

            if (isEditing && currentDocId) {
                // Update
                const { error } = await supabase
                    .from('company_documents')
                    .update(docData)
                    .eq('id', currentDocId);
                if (error) throw error;
                alert('Documento atualizado com sucesso!');
            } else {
                // Insert
                const { error } = await supabase.from('company_documents').insert([docData]);
                if (error) throw error;
                alert('Documento publicado com sucesso!');
            }

            closeModal();
            fetchDocuments();
        } catch (error: any) {
            alert('Erro ao salvar documento: ' + error.message);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Tem certeza que deseja excluir o documento "${title}"? esta ação não pode ser desfeita.`)) return;

        try {
            const { error } = await supabase
                .from('company_documents')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setDocuments(docs => docs.filter(d => d.id !== id));
            alert('Documento excluído.');
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const handleSign = async (docId: string, title: string) => {
        if (!confirm(`Confirmar assinatura e leitura do documento: "${title}"?`)) return;

        try {
            const { error } = await supabase.from('document_signatures').insert([{
                document_id: docId,
                user_id: user?.id,
                ip_address: 'assigned_via_web'
            }]);

            if (error) throw error;

            setDocuments(docs => docs.map(d => d.id === docId ? { ...d, is_signed: true } : d));
            alert('Documento assinado com sucesso!');
        } catch (error: any) {
            alert('Erro ao assinar: ' + error.message);
        }
    };

    const openNewModal = () => {
        setNewDoc({ title: '', file_url: '', category: 'Outros', requires_signature: false, target_roles: ['all'], target_user_ids: [] });
        setIsEditing(false);
        setCurrentDocId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (doc: Document) => {
        setNewDoc({
            title: doc.title,
            file_url: doc.file_url,
            category: doc.category,
            requires_signature: doc.requires_signature,
            target_roles: doc.target_roles || ['all'],
            target_user_ids: doc.target_user_ids || []
        });
        setIsEditing(true);
        setCurrentDocId(doc.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentDocId(null);
    };

    const toggleUserSelection = (userId: string) => {
        const currentSelected = newDoc.target_user_ids;
        if (currentSelected.includes(userId)) {
            setNewDoc({ ...newDoc, target_user_ids: currentSelected.filter(id => id !== userId) });
        } else {
            setNewDoc({ ...newDoc, target_user_ids: [...currentSelected, userId] });
        }
    };

    // Helper to check if signature is required for CURRENT user
    const isSignatureRequiredForMe = (doc: Document) => {
        if (!doc.requires_signature) return false;
        if (!profile) return false;

        const roleMatch = doc.target_roles.includes('all') || doc.target_roles.includes(profile.role);
        const specificUserMatch = doc.target_user_ids && doc.target_user_ids.includes(profile.id);

        return roleMatch || specificUserMatch;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Centro de Documentos</h2>
                    <p className="text-gray-500">Manuais, contratos e políticas da rede.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={openNewModal}
                        className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] transition-colors"
                    >
                        <Plus size={20} />
                        Novo Documento
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-gray-100">
                    {loading ? (
                        <p className="p-6 text-gray-500">Carregando documentos...</p>
                    ) : documents.length === 0 ? (
                        <p className="p-6 text-gray-500 text-center">Nenhum documento encontrado.</p>
                    ) : (
                        documents.map((doc) => (
                            <div key={doc.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${doc.requires_signature ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-[#3a7ad1]'}`}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            {doc.title}
                                            {doc.requires_signature && (
                                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded border border-orange-200">
                                                    Assinatura Requerida
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">
                                                {doc.category || 'Geral'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                • {new Date(doc.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isSignatureRequiredForMe(doc) && (
                                        doc.is_signed ? (
                                            <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                                <CheckCircle size={16} /> Assinado
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleSign(doc.id, doc.title)}
                                                className="flex items-center gap-1.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors shadow-sm"
                                            >
                                                <FileCheck size={16} />
                                                Assinar
                                            </button>
                                        )
                                    )}

                                    <div className="w-px h-8 bg-gray-200 mx-1 hidden md:block"></div>

                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-[#3a7ad1] transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow"
                                        title="Baixar Arquivo"
                                    >
                                        <Download size={20} />
                                    </a>

                                    {isAdmin && (
                                        <>
                                            <button
                                                onClick={() => openEditModal(doc)}
                                                className="p-2 text-gray-400 hover:text-[#3a7ad1] transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow"
                                                title="Editar"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id, doc.title)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow"
                                                title="Excluir"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Upload/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditing ? "Editar Documento" : "Novo Documento"}
            >
                <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título do Documento</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]"
                            value={newDoc.title}
                            onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                            placeholder="Ex: Manual de Operações 2024"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">URL do Arquivo (PDF)</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]"
                            value={newDoc.file_url}
                            onChange={e => setNewDoc({ ...newDoc, file_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                            <select
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]"
                                value={newDoc.category}
                                onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}
                            >
                                <option value="Manuais">Manuais</option>
                                <option value="Contratos">Contratos</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded text-[#3a7ad1] focus:ring-[#3a7ad1]"
                                    checked={newDoc.requires_signature}
                                    onChange={e => setNewDoc({ ...newDoc, requires_signature: e.target.checked })}
                                />
                                <span className="text-sm font-bold text-gray-800">Requer Assinatura Digital?</span>
                            </label>
                            <FileCheck size={20} className="text-gray-400" />
                        </div>

                        {newDoc.requires_signature && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quem deve assinar?</label>

                                <div className="flex gap-4 mb-4">
                                    {['all', 'manager', 'collaborator'].map(role => (
                                        <label key={role} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="target_role"
                                                checked={!!newDoc.target_roles.includes(role)}
                                                onChange={() => setNewDoc({ ...newDoc, target_roles: [role], target_user_ids: [] })}
                                                className="text-[#3a7ad1] focus:ring-[#3a7ad1]"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">
                                                {role === 'all' ? 'Todos' : role === 'manager' ? 'Gerentes' : 'Colaboradores'}
                                            </span>
                                        </label>
                                    ))}

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="target_role"
                                            checked={newDoc.target_roles.includes('specific')}
                                            onChange={() => setNewDoc({ ...newDoc, target_roles: ['specific'], target_user_ids: [] })}
                                            className="text-[#3a7ad1] focus:ring-[#3a7ad1]"
                                        />
                                        <span className="text-sm text-gray-700">Pessoas Específicas</span>
                                    </label>
                                </div>

                                {newDoc.target_roles.includes('specific') && (
                                    <div className="bg-white border rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                                        {profiles.map(p => (
                                            <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newDoc.target_user_ids.includes(p.id)}
                                                    onChange={() => toggleUserSelection(p.id)}
                                                    className="rounded text-[#3a7ad1] focus:ring-[#3a7ad1]"
                                                />
                                                <div className="text-sm">
                                                    <span className="font-medium text-gray-800">{p.full_name}</span>
                                                    <span className="text-xs text-gray-400 ml-1">({p.role})</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0] font-medium shadow-sm"
                        >
                            {isEditing ? 'Salvar Alterações' : 'Publicar Documento'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Documents;
