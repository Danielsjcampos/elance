import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Brain, Plus, Trash2, Edit, ChevronRight, Save, X } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

const SegmentManagement: React.FC = () => {
    const { profile } = useAuth();
    const [segments, setSegments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSegment, setCurrentSegment] = useState<any>(null);

    useEffect(() => {
        fetchSegments();
    }, []);

    const fetchSegments = async () => {
        try {
            const { data, error } = await supabase
                .from('email_segments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSegments(data || []);
        } catch (error) {
            console.error('Error fetching segments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (segment: any = null) => {
        if (segment) {
            setCurrentSegment(segment);
        } else {
            setCurrentSegment({
                nome_segmento: '',
                descricao: '',
                regras: { interests: [], status: 'ativo' },
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
            if (currentSegment.id) {
                const { error } = await supabase
                    .from('email_segments')
                    .update({
                        nome_segmento: currentSegment.nome_segmento,
                        descricao: currentSegment.descricao,
                        regras: currentSegment.regras,
                        ativo: currentSegment.ativo
                    })
                    .eq('id', currentSegment.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('email_segments')
                    .insert([currentSegment]);
                if (error) throw error;
            }

            alert('Segmento salvo com sucesso!');
            setIsModalOpen(false);
            fetchSegments();
        } catch (error: any) {
            alert('Erro ao salvar segmento: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este segmento? Isso não apagará os contatos, apenas a regra de agrupamento.')) return;
        try {
            const { error } = await supabase.from('email_segments').delete().eq('id', id);
            if (error) throw error;
            fetchSegments();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Segmentação Dinâmica</h3>
                    <p className="text-sm text-gray-500">Crie regras automáticas para agrupar seus contatos.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3a7ad1] text-white rounded-xl hover:bg-[#2a61b0] transition-colors font-medium shadow-sm"
                >
                    <Plus size={18} /> Novo Segmento
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse"></div>
                    ))
                ) : segments.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed">
                        <Brain size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Nenhum segmento dinâmico definido.</p>
                        <button className="mt-4 text-[#3a7ad1] font-bold hover:underline">Criar meu primeiro segmento</button>
                    </div>
                ) : (
                    segments.map((segment) => (
                        <div key={segment.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Brain size={20} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(segment)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(segment.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">{segment.nome_segmento}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-4">Regras: {JSON.stringify(segment.regras)}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${segment.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {segment.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                                <button className="text-[#3a7ad1] text-xs font-bold flex items-center gap-0.5 hover:gap-1 transition-all">
                                    Ver contatos <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && currentSegment && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentSegment.id ? "Editar Segmento" : "Novo Segmento"}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Segmento</label>
                            <input
                                required
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]"
                                value={currentSegment.nome_segmento}
                                onChange={e => setCurrentSegment({ ...currentSegment, nome_segmento: e.target.value })}
                                placeholder="Ex: Investidores de Elite"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                            <textarea
                                className="w-full border rounded-lg p-2 outline-none h-20"
                                value={currentSegment.descricao}
                                onChange={e => setCurrentSegment({ ...currentSegment, descricao: e.target.value })}
                                placeholder="Para que serve este grupo?"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Filtro por Interesse</label>
                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 text-sm">
                                {['imovel', 'leilao', 'veiculo', 'investidor', 'news', 'designer', 'modelo'].map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            const rules = { ...currentSegment.regras };
                                            const interests = rules.interests || [];
                                            const newInterests = interests.includes(tag)
                                                ? interests.filter((i: string) => i !== tag)
                                                : [...interests, tag];
                                            setCurrentSegment({ ...currentSegment, regras: { ...rules, interests: newInterests } });
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${currentSegment.regras?.interests?.includes(tag)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400">Os contatos que tiverem pelo menos um destes interesses serão incluídos no segmento.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={currentSegment.ativo}
                                onChange={e => setCurrentSegment({ ...currentSegment, ativo: e.target.checked })}
                            />
                            <label htmlFor="active" className="text-sm font-bold text-gray-700">Segmento Ativo</label>
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
                                {isSaving ? 'Salvando...' : 'Salvar Segmento'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default SegmentManagement;
