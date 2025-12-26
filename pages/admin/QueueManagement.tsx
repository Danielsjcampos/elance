import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Send, Clock, CheckCircle2, AlertCircle, Trash2, Search, Play, RefreshCw } from 'lucide-react';
import { emailFlowService } from '../../services/emailFlowService';

const QueueManagement: React.FC = () => {
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            const { data, error } = await supabase
                .from('email_queue')
                .select(`
                    *,
                    contact:email_contacts(nome, email),
                    template:email_templates(nome_template)
                `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setQueue(data || []);
        } catch (error) {
            console.error('Error fetching queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessQueue = async () => {
        setProcessing(true);
        try {
            const results = await emailFlowService.processQueue(10); // Process 10 at a time
            const success = results.filter((r: any) => r.status === 'success').length;
            const errors = results.filter((r: any) => r.status === 'error').length;

            alert(`Processamento concluído: ${success} enviados, ${errors} falhas.`);
            fetchQueue();
        } catch (error: any) {
            alert('Erro ao processar: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pendente': return <Clock size={16} className="text-orange-500" />;
            case 'enviado': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'erro': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Fila de Disparos</h3>
                    <p className="text-sm text-gray-500">Acompanhe o status de cada e-mail disparado.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleProcessQueue}
                        disabled={processing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold disabled:opacity-50 shadow-sm"
                    >
                        {processing ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                        {processing ? 'Enviando...' : 'Processar Fila Agora'}
                    </button>
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por email..."
                            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#3a7ad1]/20 font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Contato</th>
                            <th className="px-6 py-4">Template</th>
                            <th className="px-6 py-4">Agendado Para</th>
                            <th className="px-6 py-4">Enviado Em</th>
                            <th className="px-6 py-4">Tentativas</th>
                            <th className="px-6 py-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={7} className="px-6 py-4 h-12 bg-gray-50/50"></td>
                                </tr>
                            ))
                        ) : queue.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                                    Nenhum disparo na fila.
                                </td>
                            </tr>
                        ) : (
                            queue.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(item.status)}
                                            <span className={`text-[10px] font-bold uppercase ${item.status === 'enviado' ? 'text-green-600' :
                                                item.status === 'pendente' ? 'text-orange-600' :
                                                    item.status === 'erro' ? 'text-red-600' : 'text-gray-500'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-800">{item.contact?.nome || 'Desconhecido'}</p>
                                        <p className="text-xs text-gray-500">{item.contact?.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        {item.template?.nome_template || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-gray-500">
                                        {new Date(item.scheduled_for).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-gray-500">
                                        {item.sent_at ? new Date(item.sent_at).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-bold ${item.tentativas > 1 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {item.tentativas}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QueueManagement;
