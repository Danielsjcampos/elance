import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Layout, Plus, Mail, Trash2, Edit, Copy, Type, Send, Users, Filter, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/Modal';
import { emailFlowService } from '../../services/emailFlowService';

const TemplateManagement: React.FC = () => {
    const { profile } = useAuth();
    const [templates, setTemplates] = useState<any[]>([]);
    const [segments, setSegments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [selectedSegment, setSelectedSegment] = useState<string>('all');
    const [isDispatching, setIsDispatching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        fetchTemplates();
        fetchSegments();
    }, []);

    const fetchSegments = async () => {
        const { data } = await supabase.from('email_segments').select('*').eq('ativo', true);
        setSegments(data || []);
    };

    const fetchTemplates = async () => {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenBlast = (template: any) => {
        setSelectedTemplate(template);
        setIsBlastModalOpen(true);
    };

    const handleOpenEdit = (template: any = null) => {
        if (template) {
            setSelectedTemplate({ ...template });
        } else {
            setSelectedTemplate({
                nome_template: '',
                tipo: 'comunicado',
                assunto: '',
                corpo_html: '<div style="font-family: Arial; padding: 20px;">\n  <h1>Olá {{nome}}!</h1>\n  <p>Escreva seu conteúdo aqui...</p>\n</div>',
                variaveis: ['nome'],
                franchise_unit_id: profile?.franchise_unit_id
            });
        }
        setIsEditModalOpen(true);
    };

    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (selectedTemplate.id) {
                const { error } = await supabase
                    .from('email_templates')
                    .update({
                        nome_template: selectedTemplate.nome_template,
                        tipo: selectedTemplate.tipo,
                        assunto: selectedTemplate.assunto,
                        corpo_html: selectedTemplate.corpo_html,
                        variaveis: selectedTemplate.variaveis
                    })
                    .eq('id', selectedTemplate.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('email_templates')
                    .insert([selectedTemplate]);
                if (error) throw error;
            }

            alert('Template salvo com sucesso!');
            setIsEditModalOpen(false);
            fetchTemplates();
        } catch (error: any) {
            alert('Erro ao salvar template: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestSend = async (template: any) => {
        const email = prompt('Para qual e-mail deseja enviar o teste?', profile?.email);
        if (!email) return;

        setIsTesting(true);
        try {
            // Render basic test
            const html = template.corpo_html.replace('{{nome}}', profile?.full_name || 'Usuário de Teste');

            // Send via emailService
            const { sendEmail } = await import('../../services/emailService');
            await sendEmail({
                to: email,
                subject: `[TESTE] ${template.assunto}`,
                html: html
            });

            alert('E-mail de teste enviado com sucesso!');
        } catch (error: any) {
            alert('Erro ao enviar teste: ' + error.message);
        } finally {
            setIsTesting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este template permanentemente?')) return;
        try {
            const { error } = await supabase.from('email_templates').delete().eq('id', id);
            if (error) throw error;
            fetchTemplates();
        } catch (error: any) {
            alert('Erro ao excluir template: ' + error.message);
        }
    };

    const handleDispatch = async () => {
        if (!selectedTemplate) return;
        setIsDispatching(true);

        try {
            // 1. Fetch target contacts
            let query = supabase.from('email_contacts').select('*').eq('status', 'ativo');

            if (selectedSegment !== 'all') {
                const segment = segments.find(s => s.id === selectedSegment);
                if (segment) {
                    // Filter logic handled in memory for simplicity or via rule evaluation
                    // In real app, might want a more complex SQL query or RPC
                }
            }

            const { data: contacts, error: contactError } = await query;
            if (contactError) throw contactError;

            if (!contacts || contacts.length === 0) {
                alert('Nenhum contato encontrado no segmento selecionado.');
                setIsDispatching(false);
                return;
            }

            // 2. Add each contact to the queue
            let count = 0;
            for (const contact of contacts) {
                // Apply segment rules if not 'all'
                if (selectedSegment !== 'all') {
                    const segment = segments.find(s => s.id === selectedSegment);
                    if (segment && !emailFlowService.matchesSegment(contact, segment.regras)) {
                        continue;
                    }
                }

                await emailFlowService.addToQueue(contact.id, selectedTemplate.id);
                count++;
            }

            alert(`Campanha agendada com sucesso! ${count} e-mails adicionados à fila de disparo.`);
            setIsBlastModalOpen(false);
        } catch (error: any) {
            alert('Erro ao agendar disparo: ' + error.message);
        } finally {
            setIsDispatching(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Modelos de E-mail</h3>
                    <p className="text-sm text-gray-500">Templates reutilizáveis com variáveis dinâmicas.</p>
                </div>
                <button
                    onClick={() => handleOpenEdit()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3a7ad1] text-white rounded-xl hover:bg-[#2a61b0] transition-colors font-medium shadow-sm"
                >
                    <Plus size={18} /> Novo Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse"></div>
                    ))
                ) : templates.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed">
                        <Layout size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Nenhum template criado ainda.</p>
                        <button className="mt-4 text-[#3a7ad1] font-bold hover:underline">Criar meu primeiro modelo</button>
                    </div>
                ) : (
                    templates.map((template) => (
                        <div key={template.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <div className="h-32 bg-gray-50 border-b border-gray-50 flex items-center justify-center relative overflow-hidden">
                                <Mail size={40} className="text-gray-200" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleOpenBlast(template)}
                                        className="p-2 bg-white rounded-lg text-[#3a7ad1] shadow-sm hover:scale-110 transition-transform"
                                        title="Disparar esta Campanha"
                                    >
                                        <Send size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleTestSend(template)}
                                        className="p-2 bg-white rounded-lg text-green-600 shadow-sm hover:scale-110 transition-transform"
                                        title="Enviar Teste"
                                    >
                                        <Mail size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenEdit(template)}
                                        className="p-2 bg-white rounded-lg text-gray-600 shadow-sm hover:scale-110 transition-transform"
                                        title="Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="p-2 bg-white rounded-lg text-red-500 shadow-sm hover:scale-110 transition-transform"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-blue-50 text-blue-600 rounded">
                                        {template.tipo || 'Geral'}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{template.nome_template}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2 italic mb-3">"{template.assunto}"</p>

                                <div className="flex flex-wrap gap-1 mt-auto">
                                    {template.variaveis?.map((v: string, idx: number) => (
                                        <span key={idx} className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px] font-mono">
                                            {`{${v}}`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Blast Modal */}
            {isBlastModalOpen && selectedTemplate && (
                <Modal isOpen={isBlastModalOpen} onClose={() => setIsBlastModalOpen(false)} title="Disparar Campanha">
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                                <Mail size={18} /> Modelo Selecionado
                            </h4>
                            <p className="text-blue-800 text-sm">{selectedTemplate.nome_template}</p>
                            <p className="text-blue-600 text-xs italic mt-1">Assunto: {selectedTemplate.assunto}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Users size={18} /> Público-Alvo
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedSegment === 'all' ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        name="segment"
                                        value="all"
                                        checked={selectedSegment === 'all'}
                                        onChange={() => setSelectedSegment('all')}
                                    />
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedSegment === 'all' ? 'border-[#3a7ad1] bg-[#3a7ad1]' : 'border-gray-300'}`}>
                                        {selectedSegment === 'all' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-gray-800">Todos os Contatos Ativos</p>
                                        <p className="text-xs text-gray-500">Enviar para toda a sua base disponível.</p>
                                    </div>
                                </label>

                                {segments.map(s => (
                                    <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedSegment === s.id ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            className="sr-only"
                                            name="segment"
                                            value={s.id}
                                            checked={selectedSegment === s.id}
                                            onChange={() => setSelectedSegment(s.id)}
                                        />
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedSegment === s.id ? 'border-[#3a7ad1] bg-[#3a7ad1]' : 'border-gray-300'}`}>
                                            {selectedSegment === s.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-gray-800">{s.nome_segmento}</p>
                                            <p className="text-xs text-gray-500">{s.descricao || 'Filtro personalizado.'}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                            <b>Nota:</b> Os e-mails serão adicionados à fila de processamento e disparados usando as configurações de SMTP da sua unidade de franquia.
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => setIsBlastModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDispatch}
                                disabled={isDispatching}
                                className="px-6 py-2 bg-[#3a7ad1] text-white rounded-lg font-bold hover:bg-[#2a61b0] disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDispatching ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                                {isDispatching ? 'Confirmar Disparo...' : 'Iniciar Campanha'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Template Modal */}
            {isEditModalOpen && selectedTemplate && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={selectedTemplate.id ? "Editar Template" : "Novo Template"}>
                    <form onSubmit={handleSaveTemplate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Template</label>
                                <input
                                    required
                                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]/20"
                                    value={selectedTemplate.nome_template}
                                    onChange={e => setSelectedTemplate({ ...selectedTemplate, nome_template: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                                <select
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={selectedTemplate.tipo}
                                    onChange={e => setSelectedTemplate({ ...selectedTemplate, tipo: e.target.value })}
                                >
                                    <option value="comunicado">Comunicado</option>
                                    <option value="leilao">Leilão/Imóvel</option>
                                    <option value="blog">Blog/Notícias</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Assunto do E-mail</label>
                            <input
                                required
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]/20"
                                value={selectedTemplate.assunto}
                                onChange={e => setSelectedTemplate({ ...selectedTemplate, assunto: e.target.value })}
                                placeholder="O que o cliente verá na caixa de entrada"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex justify-between">
                                Conteúdo HTML
                                <span className="text-[10px] text-gray-400">Use {'{{nome}}'} para o nome do cliente</span>
                            </label>
                            <textarea
                                required
                                className="w-full border rounded-lg p-2 outline-none h-64 font-mono text-sm"
                                value={selectedTemplate.corpo_html}
                                onChange={e => setSelectedTemplate({ ...selectedTemplate, corpo_html: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-[#3a7ad1] text-white rounded-lg font-bold hover:bg-[#2a61b0] disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                                {isSaving ? 'Salvando...' : 'Salvar Template'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default TemplateManagement;
