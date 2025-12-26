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

    // Modal State
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
                        <button className="mt-4 text-[#3a7ad1] font-bold hover:underline">Iniciar minha primeira automação</button>
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
                                <button className="text-[#3a7ad1] text-xs font-bold hover:underline">Configurar Etapas</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
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
        </div>
    );
};

export default FlowManagement;
