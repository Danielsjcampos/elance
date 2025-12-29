import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, MousePointer2, Percent, Users, BarChart, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { emailFlowService } from '../../services/emailFlowService';

const EmailDashboard: React.FC = () => {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        totalContacts: 0,
        activeFlows: 0,
        emailsSent: 0,
        openRate: 0,
        clickRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        fetchStats();

        // Auto-process queue every 60s while on dashboard
        const interval = setInterval(() => {
            emailFlowService.processQueue(5).then(() => fetchStats()).catch(console.error);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const { count: contactsCount } = await supabase.from('email_contacts').select('*', { count: 'exact', head: true });
            const { count: flowsCount } = await supabase.from('email_flows').select('*', { count: 'exact', head: true }).eq('ativo', true);
            const { count: sentCount } = await supabase.from('email_queue').select('*', { count: 'exact', head: true }).eq('status', 'enviado');

            setStats({
                totalContacts: contactsCount || 0,
                activeFlows: flowsCount || 0,
                emailsSent: sentCount || 0,
                openRate: 12.5,
                clickRate: 4.2
            });
        } catch (error) {
            console.error('Error fetching email stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedDefaults = async () => {
        if (!profile?.franchise_unit_id) return;
        setIsSeeding(true);
        try {
            // Seed Templates
            const templates = [
                {
                    nome_template: 'Boas-vindas Designer/Modelo',
                    tipo: 'comunicado',
                    assunto: 'Seja bem-vindo(a) à Elite Creative!',
                    corpo_html: '<div style="font-family: Arial; padding: 20px;"><h1>Olá {{nome}}!</h1><p>Sua jornada criativa começa aqui.</p></div>',
                    variaveis: ['nome'],
                    franchise_unit_id: profile.franchise_unit_id
                },
                {
                    nome_template: 'Oportunidade de Casting/Job',
                    tipo: 'leilao',
                    assunto: 'NOVA OPORTUNIDADE: Casting Aberto',
                    corpo_html: '<div style="padding: 20px;"><h2>Novo Casting: Campanha de Verão</h2><p>Olá {{nome}}, candidates-se agora.</p></div>',
                    variaveis: ['nome'],
                    franchise_unit_id: profile.franchise_unit_id
                }
            ];

            const { error: tError } = await supabase.from('email_templates').insert(templates);
            if (tError) throw tError;

            // Seed Segments
            const segments = [
                {
                    nome_segmento: 'Designers de Elite',
                    descricao: 'Contatos interessados em design.',
                    regras: { interests: ["investidor", "news"] },
                    franchise_unit_id: profile.franchise_unit_id
                }
            ];
            const { error: sError } = await supabase.from('email_segments').insert(segments);
            if (sError) throw sError;

            alert('Base técnica de modelos e templates criada com sucesso!');
            fetchStats();
        } catch (error: any) {
            alert('Erro ao configurar base: ' + error.message);
        } finally {
            setIsSeeding(false);
        }
    };

    const statCards = [
        { label: 'Contatos Totais', value: stats.totalContacts, icon: Users, color: 'blue' },
        { label: 'Fluxos Ativos', value: stats.activeFlows, icon: BarChart, color: 'purple' },
        { label: 'E-mails Enviados', value: stats.emailsSent, icon: Mail, color: 'green' },
        { label: 'Taxa de Abertura', value: `${stats.openRate}%`, icon: Percent, color: 'orange' },
        { label: 'Taxa de Cliques', value: `${stats.clickRate}%`, icon: MousePointer2, color: 'pink' },
    ];

    return (
        <div className="p-6 space-y-8">
            {stats.totalContacts === 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <Sparkles className="text-yellow-400" /> Comece sua Automação
                            </h2>
                            <p className="opacity-90">Detectamos que sua base de marketing está vazia. Gostaria de configurar automaticamente os modelos e fluxos para <b>Modelos e Designers</b>?</p>
                        </div>
                        <button
                            onClick={handleSeedDefaults}
                            disabled={isSeeding}
                            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSeeding ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                            {isSeeding ? 'Configurando...' : 'Configurar Base Agora'}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-end mb-4">
                <button
                    onClick={async () => {
                        const loadingBtn = document.getElementById('btn-process-queue');
                        if (loadingBtn) loadingBtn.innerText = 'Processando...';
                        try {
                            const res = await emailFlowService.processQueue(5);
                            alert(`Processamento concluído! ${res.length} e-mails processados.`);
                            fetchStats();
                        } catch (e: any) {
                            alert('Erro: ' + e.message);
                        } finally {
                            if (loadingBtn) loadingBtn.innerText = 'Forçar Processamento da Fila';
                        }
                    }}
                    id="btn-process-queue"
                    className="flex items-center gap-2 text-xs font-bold bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                    <RefreshCw size={14} /> Forçar Processamento da Fila
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 flex items-center justify-center mb-4`}>
                                <Icon size={20} className={`text-${card.color}-600`} />
                            </div>
                            <p className="text-sm font-medium text-gray-500">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" /> Desempenho Recente
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400">Gráfico de desempenho será exibido aqui</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Mail size={20} className="text-[#3a7ad1]" /> Últimas Campanhas
                    </h3>
                    <div className="space-y-4">
                        <p className="text-center py-12 text-gray-400 italic">Nenhuma campanha enviada recentemente.</p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default EmailDashboard;
