import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Gavel, Users, TrendingUp, Building2, Eye, PlusCircle, FileText, CheckCircle, Clock, Home, Award, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Stats State
    const [stats, setStats] = useState({
        revenueTotal: 0,
        leadsTotal: 0,
        activeAuctions: 0,
        pendingTasks: 0,
        auctionsThisWeek: 0
    });

    // Chart Data
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [franchisePerformance, setFranchisePerformance] = useState<any[]>([]);
    const [leadsDistribution, setLeadsDistribution] = useState<any[]>([]);

    // List Data
    const [topUsers, setTopUsers] = useState<any[]>([]);
    const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([]);
    const [propertiesForSale, setPropertiesForSale] = useState<any[]>([]);
    const [taskLog, setTaskLog] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, [isAdmin]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // --- 1. Fetch Basic Data ---
            const { data: franchises } = await supabase.from('franchise_units').select('id, name');
            const franchiseMap = new Map(franchises?.map(f => [f.id, f.name]));

            const { data: auctions } = await supabase.from('auctions').select('*').order('auction_date', { ascending: true });
            const { data: leads } = await supabase.from('leads').select('status, name, property_value');
            const { data: tasks } = await supabase.from('tasks').select('created_at, title, completed, assignee:profiles(full_name), franchise:franchise_units(name)').order('created_at', { ascending: false }); // Fetch more fields for log, ordered by creation
            const { data: finances } = await supabase.from('financial_logs').select('*');

            // --- 2. Calculate KPIs ---

            // Revenue
            const totalRevenue = finances
                ?.filter(f => f.type === 'income')
                .reduce((sum, item) => sum + Number(item.amount), 0) || 0;

            // Leads
            const totalLeads = leads?.length || 0;

            // Active Auctions (Assuming status logic or date)
            // For now, let's assume 'Active' means auction_date >= today
            const today = new Date();
            const activeAuctionsCount = auctions?.filter(a => new Date(a.auction_date) >= today).length || 0;

            // Pending Tasks
            const pendingTasksCount = tasks?.filter(t => !t.completed).length || 0;

            // Operations This Week
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
            const thisWeekAuctions = auctions?.filter(a => {
                const d = new Date(a.auction_date);
                return d >= startOfWeek && d <= endOfWeek;
            }).length || 0;


            // --- 3. Prepare Charts ---

            // A. Revenue Over Time
            const revenueByMonth = new Map();
            finances?.forEach(f => {
                if (f.type !== 'income') return;
                const month = new Date(f.date).toLocaleString('default', { month: 'short', year: '2-digit' });
                revenueByMonth.set(month, (revenueByMonth.get(month) || 0) + Number(f.amount));
            });
            const revChartData = Array.from(revenueByMonth.entries()).map(([name, value]) => ({ name, value }));

            // B. Franchise Performance (Revenue)
            const franchiseRev = new Map();
            finances?.forEach(f => {
                if (f.type !== 'income') return;
                const fName = franchiseMap.get(f.franchise_id) || 'Unknown';
                franchiseRev.set(fName, (franchiseRev.get(fName) || 0) + Number(f.amount));
            });
            const franchiseChartData = Array.from(franchiseRev.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5); // Top 5

            // C. Leads Distribution
            const leadStatusCounts: Record<string, number> = {};
            leads?.forEach(l => {
                const s = l.status || 'Novo';
                leadStatusCounts[s] = (leadStatusCounts[s] || 0) + 1;
            });
            const leadsChartData = Object.entries(leadStatusCounts).map(([name, value]) => ({ name, value: value }));


            // --- 4. Lists & Rankings ---

            // Top Users (using Gamification RPC)
            const { data: leaderboard } = await supabase.rpc('get_leaderboard');
            setTopUsers(leaderboard?.slice(0, 5) || []);

            // Upcoming Auctions (Next 5)
            setUpcomingAuctions(auctions?.filter(a => new Date(a.auction_date) >= new Date()).slice(0, 5) || []);

            // Properties for Sale (Leads with high value or specific status, or just recent)
            // Simulating "Properties" from Leads for now
            // Properties for Sale (Leads with high value or specific status, or just recent)
            // Simulating "Properties" from Leads for now
            setPropertiesForSale(leads?.slice(0, 5) || []);
            setTaskLog(tasks?.slice(0, 5) || []);


            // --- 5. Update State ---
            setStats({
                revenueTotal: totalRevenue,
                leadsTotal: totalLeads,
                activeAuctions: activeAuctionsCount,
                pendingTasks: pendingTasksCount,
                auctionsThisWeek: thisWeekAuctions
            });
            setRevenueData(revChartData);
            setFranchisePerformance(franchiseChartData);
            setLeadsDistribution(leadsChartData);

        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const KpiCard = ({ title, value, icon: Icon, colorClass, subtext }: any) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                    {loading ? '...' : value}
                </h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-4 rounded-full ${colorClass} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {isAdmin ? 'Visão Geral (Matriz)' : 'Meu Dashboard'}
                    </h2>
                    <p className="text-gray-500">Indicadores em tempo real do sistema.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="p-2 text-gray-400 hover:text-[#3a7ad1] transition-colors" title="Atualizar">
                        <Clock size={20} />
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Receita Mensal"
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenueTotal)}
                    icon={DollarSign}
                    colorClass="bg-green-500 text-green-600"
                    subtext="Consolidado do mês"
                />
                <KpiCard
                    title="Total de Leads"
                    value={stats.leadsTotal}
                    icon={Users}
                    colorClass="bg-blue-500 text-blue-600"
                    subtext="Em negociação"
                />
                <KpiCard
                    title="Leilões Ativos"
                    value={stats.activeAuctions}
                    icon={Gavel}
                    colorClass="bg-purple-500 text-purple-600"
                    subtext={`${stats.auctionsThisWeek} nesta semana`}
                />
                <KpiCard
                    title="Tarefas Pendentes"
                    value={stats.pendingTasks}
                    icon={CheckCircle}
                    colorClass="bg-orange-500 text-orange-600"
                    subtext="Aguardando conclusão"
                />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-500" /> Evolução Financeira
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3a7ad1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3a7ad1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `R$${value / 1000}k`} />
                                <Tooltip formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                                <Area type="monotone" dataKey="value" stroke="#3a7ad1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Leads Pie Chart (1/3 width) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                        <Users size={20} className="text-blue-500" /> Status dos Leads
                    </h3>
                    <div className="h-72 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadsDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {leadsDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Secondary Row: Top Franchises & Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Franchises */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                        <Award size={20} className="text-yellow-500" /> Top Franquias (Receita)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={franchisePerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top 5 Users (Leaderboard) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                        <Award size={20} className="text-orange-500" /> Melhores Usuários (Ranking)
                    </h3>
                    <div className="space-y-4">
                        {topUsers.map((user, index) => (
                            <div key={user.profile_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-400'}`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{user.full_name}</p>
                                        <p className="text-xs text-gray-500">{user.trainings_completed} treinamentos</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-[#3a7ad1]">{user.total_points} XP</span>
                                </div>
                            </div>
                        ))}
                        {topUsers.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Nenhum ranking disponível.</p>}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Properties for Sale (Recent Leads) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                        <Home size={20} className="text-emerald-500" /> Imóveis à Venda (Recentes)
                    </h3>
                    <div className="space-y-3">
                        {propertiesForSale.map((prop, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-gray-800">{prop.name}</p>
                                    <p className="text-xs text-gray-500">{prop.status}</p>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                    {prop.property_value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.property_value) : '-'}
                                </span>
                            </div>
                        ))}
                        {propertiesForSale.length === 0 && <p className="text-center text-gray-400 text-sm">Nenhum imóvel recente.</p>}
                    </div>
                    <button onClick={() => navigate('/admin/leads')} className="w-full mt-4 text-center text-sm text-[#3a7ad1] hover:underline">Ver todos</button>
                </div>

                {/* Upcoming Auctions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-red-500" /> Próximos Leilões
                    </h3>
                    <div className="space-y-3">
                        {upcomingAuctions.map((auction, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-start gap-3">
                                    <div className="bg-red-50 px-2 py-1 rounded text-center min-w-[50px]">
                                        <p className="text-xs font-bold text-red-600 uppercase">{new Date(auction.auction_date).toLocaleString('default', { month: 'short' })}</p>
                                        <p className="text-lg font-bold text-red-800 leading-none">{new Date(auction.auction_date).getDate()}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 line-clamp-1">{auction.property_name || 'Imóvel sem nome'}</p>
                                        <p className="text-xs text-gray-500">{auction.city} - {auction.state}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">{new Date(auction.auction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                        {upcomingAuctions.length === 0 && <p className="text-center text-gray-400 text-sm">Nenhum leilão próximo.</p>}
                    </div>
                    <button onClick={() => navigate('/admin/auctions')} className="w-full mt-4 text-center text-sm text-[#3a7ad1] hover:underline">Ver agenda</button>
                </div>
            </div>

            {/* Log de Atividades (Tasks) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
                <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-gray-500" /> Log de Atividades (Tarefas Recentes)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                                <th className="p-3 font-semibold">Data/Hora</th>
                                <th className="p-3 font-semibold">Atividade</th>
                                <th className="p-3 font-semibold">Atribuído a</th>
                                <th className="p-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600">
                            {taskLog.map((log: any, i: number) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="p-3 font-medium text-gray-800">{log.title}</td>
                                    <td className="p-3">
                                        {log.assignee ? (
                                            <span className="flex items-center gap-1 text-blue-600">
                                                <Users size={12} /> {log.assignee.full_name}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-purple-600">
                                                <Building2 size={12} /> {log.franchise?.name || 'Franquia'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs ${log.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {log.completed ? 'Concluído' : 'Pendente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {taskLog.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-400">Nenhuma atividade recente.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

