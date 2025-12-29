import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Repeat, Plus, Play, Pause, Trash2, Edit, Clock, Save, X } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

const FlowManagement: React.FC = () => {
    const { profile } = useAuth();
    const [flows, setFlows] = useState<any[]>([]);
    const [segments, setSegments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Flow Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFlow, setCurrentFlow] = useState<any>(null);

    useEffect(() => {
        fetchFlows();
        fetchSegments();
    }, []);

    const fetchSegments = async () => {
        const { data } = await supabase.from('email_segments').select('id, nome_segmento');
        setSegments(data || []);
    };

    const fetchFlows = async () => {
        try {
            const { data, error } = await supabase
                .from('email_flows')
                .select('*, steps:email_flow_steps(count)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFlows(data || []);
        } catch (error) {
            console.error('Error fetching flows:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (flow: any = null) => {
        if (flow) {
            setCurrentFlow(flow);
        } else {
            setCurrentFlow({
                nome_fluxo: '',
                tipo: 'automatico',
                segmento_id: '',
                ativo: true,
                franchise_unit_id: profile?.franchise_unit_id
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (currentFlow.id) {
                const { error } = await supabase
                    .from('email_flows')
                    .update({
                        nome_fluxo: currentFlow.nome_fluxo,
                        tipo: currentFlow.tipo,
                        segmento_id: currentFlow.segmento_id || null,
                        ativo: currentFlow.ativo
                    })
                    .eq('id', currentFlow.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('email_flows')
                    .insert([currentFlow]);
                if (error) throw error;
            }

            alert('Fluxo salvo com sucesso!');
            setIsModalOpen(false);
            fetchFlows();
        } catch (error: any) {
            alert('Erro ao salvar fluxo: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (flow: any) => {
        try {
            const { error } = await supabase
                .from('email_flows')
                .update({ ativo: !flow.ativo })
                .eq('id', flow.id);
            if (error) throw error;
            fetchFlows();
        } catch (error: any) {
            alert('Erro ao alterar status: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este fluxo e todas as suas etapas?')) return;
        try {
            const { error } = await supabase.from('email_flows').delete().eq('id', id);
            if (error) throw error;
            fetchFlows();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    // Steps Modal State
    const [isStepsModalOpen, setIsStepsModalOpen] = useState(false);
    const [currentFlowSteps, setCurrentFlowSteps] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [newStep, setNewStep] = useState({ template_id: '', delay_em_horas: 0 });

    const fetchTemplates = async () => {
        const { data } = await supabase.from('email_templates').select('id, nome_template, assunto');
        setTemplates(data || []);
    };

    const fetchFlowSteps = async (flowId: string) => {
        const { data, error } = await supabase
            .from('email_flow_steps')
            .select('*, template:email_templates(nome_template)')
            .eq('fluxo_id', flowId)
            .order('ordem', { ascending: true });

        if (!error) setCurrentFlowSteps(data || []);
    };

    const handleOpenStepsModal = async (flow: any) => {
        setCurrentFlow(flow);
        setIsStepsModalOpen(true);
        fetchTemplates();
        fetchFlowSteps(flow.id);
    };

    const handleAddStep = async () => {
        if (!newStep.template_id) return alert('Selecione um template');

        try {
            const nextOrder = currentFlowSteps.length + 1;
            const { error } = await supabase.from('email_flow_steps').insert({
                fluxo_id: currentFlow.id,
                template_id: newStep.template_id,
                delay_em_horas: newStep.delay_em_horas,
                ordem: nextOrder
            });

            if (error) throw error;

            setNewStep({ template_id: '', delay_em_horas: 0 });
            fetchFlowSteps(currentFlow.id);
            fetchFlows(); // Update counts
        } catch (error: any) {
            alert('Erro ao adicionar etapa: ' + error.message);
        }
    };

    const handleDeleteStep = async (stepId: string) => {
        if (!confirm('Remover esta etapa?')) return;
        try {
            const { error } = await supabase.from('email_flow_steps').delete().eq('id', stepId);
            if (error) throw error;
            fetchFlowSteps(currentFlow.id);
            fetchFlows();
        } catch (error: any) {
            alert('Erro ao remover etapa: ' + error.message);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Fluxos de Automação</h3>
                    <p className="text-sm text-gray-500">Crie sequências inteligentes de e-mail.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3a7ad1] text-white rounded-xl hover:bg-[#2a61b0] transition-colors font-medium shadow-sm"
                >
                    <Plus size={18} /> Novo Fluxo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-56 bg-gray-50 rounded-2xl animate-pulse"></div>
                    ))
                ) : flows.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed">
                        <Repeat size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Nenhum fluxo de automação criado.</p>
                        <button onClick={() => handleOpenModal()} className="mt-4 text-[#3a7ad1] font-bold hover:underline">Iniciar minha primeira automação</button>
                    </div>
                ) : (
                    flows.map((flow) => (
                        <div key={flow.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${flow.ativo ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                    <Repeat size={20} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(flow)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(flow.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h4 className="font-bold text-gray-800 mb-1">{flow.nome_fluxo}</h4>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Tipo</p>
                                    <p className="text-xs font-medium text-gray-700 capitalize">{flow.tipo}</p>
                                </div>
                                <div className="text-center border-l pl-4">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Etapas</p>
                                    <p className="text-xs font-medium text-gray-700">{flow.steps?.[0]?.count || 0}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => handleToggleStatus(flow)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${flow.ativo
                                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}>
                                    {flow.ativo ? <><Pause size={12} /> Pausar Fluxo</> : <><Play size={12} /> Ativar Fluxo</>}
                                </button>
                                <button
                                    onClick={() => handleOpenStepsModal(flow)}
                                    className="text-[#3a7ad1] text-xs font-bold hover:underline"
                                >
                                    Configurar Etapas
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Criação/Edição do Fluxo */}
            {isModalOpen && currentFlow && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentFlow.id ? "Editar Fluxo" : "Novo Fluxo"}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Fluxo</label>
                            <input
                                required
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]"
                                value={currentFlow.nome_fluxo}
                                onChange={e => setCurrentFlow({ ...currentFlow, nome_fluxo: e.target.value })}
                                placeholder="Ex: Boas-vindas Clientes"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                                <select
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={currentFlow.tipo}
                                    onChange={e => setCurrentFlow({ ...currentFlow, tipo: e.target.value })}
                                >
                                    <option value="manual">Manual</option>
                                    <option value="automatico">Automático (por Segmento)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Segmento Alvo</label>
                                <select
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={currentFlow.segmento_id || ''}
                                    onChange={e => setCurrentFlow({ ...currentFlow, segmento_id: e.target.value })}
                                >
                                    <option value="">Selecione um segmento...</option>
                                    {segments.map(s => (
                                        <option key={s.id} value={s.id}>{s.nome_segmento}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800">
                            <b>Dica:</b> Após criar o fluxo, você poderá definir cada uma das etapas (e-mails e atrasos) clicando em "Configurar Etapas".
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="flowActive"
                                checked={currentFlow.ativo}
                                onChange={e => setCurrentFlow({ ...currentFlow, ativo: e.target.checked })}
                            />
                            <label htmlFor="flowActive" className="text-sm font-bold text-gray-700">Fluxo Ativo</label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-[#3a7ad1] text-white rounded-lg font-bold hover:bg-[#2a61b0] disabled:opacity-50 flex items-center gap-2 shadow-sm"
                            >
                                {isSaving ? 'Salvando...' : <Save size={18} />}
                                {isSaving ? 'Salvar Fluxo' : 'Salvar Fluxo'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal de Etapas (Sequência de E-mail) */}
            {isStepsModalOpen && currentFlow && (
                <Modal isOpen={isStepsModalOpen} onClose={() => setIsStepsModalOpen(false)} title={`Etapas do Fluxo: ${currentFlow.nome_fluxo}`}>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border">
                                <div className="bg-green-100 text-green-700 p-2 rounded-full"><Clock size={16} /></div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">Gatilho Inicial</p>
                                    <p className="text-xs text-gray-500">
                                        {currentFlow.tipo === 'automatico'
                                            ? 'Inicia quando o contato entra no Segmento.'
                                            : 'Inicia quando você adiciona manualmente.'}
                                    </p>
                                </div>
                            </div>

                            {/* Lista de Etapas */}
                            {currentFlowSteps.map((step, index) => (
                                <div key={step.id} className="relative pl-8 border-l-2 border-dashed border-gray-300 ml-4 pb-4 last:pb-0 last:border-0">
                                    {/* Linha de Conexão */}
                                    <div className="absolute -left-[9px] top-0 bg-white border-2 border-gray-300 rounded-full w-4 h-4 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    </div>

                                    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative group">
                                        <button
                                            onClick={() => handleDeleteStep(step.id)}
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>

                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Etapa {index + 1}</span>
                                            {step.delay_em_horas > 0 ? (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                    <Clock size={12} /> Esperar {step.delay_em_horas}h
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Imediato</span>
                                            )}
                                        </div>
                                        <p className="font-bold text-gray-800">{step.template?.nome_template || 'Template Excluído'}</p>
                                        <p className="text-xs text-gray-500 mt-1">Envia o e-mail selecionado.</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Adicionar Nova Etapa */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
                            <h5 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                                <Plus size={16} /> Adicionar Nova Etapa
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Modelo de E-mail (Template)</label>
                                    <select
                                        className="w-full border rounded-lg p-2 text-sm outline-none"
                                        value={newStep.template_id}
                                        onChange={e => setNewStep({ ...newStep, template_id: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.nome_template} - {t.assunto}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Esperar quanto tempo? (Horas)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full border rounded-lg p-2 text-sm outline-none"
                                            value={newStep.delay_em_horas}
                                            onChange={e => setNewStep({ ...newStep, delay_em_horas: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="text-xs text-gray-500">{newStep.delay_em_horas >= 24 ? `(${Math.floor(newStep.delay_em_horas / 24)} dias)` : 'horas'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleAddStep}
                                disabled={!newStep.template_id}
                                className="w-full mt-4 bg-gray-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Adicionar Etapa
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default FlowManagement;
