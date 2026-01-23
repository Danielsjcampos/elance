import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Gavel, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeAuctions: 0,
    monthlyRevenue: 0,
    recentSales: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    // 1. Total Leads
    const { count: leadsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // 2. Active Auctions (not sold or suspended)
    const { count: auctionsCount } = await supabase
      .from('auctions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['publicado', 'primeira_praca', 'segunda_praca']);

    // 3. Financials (Revenue this month)
    // Stub logic until financial data is populated
    // We fetch sum of 'revenue' type logs created in current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    // Using simple query for MVP, in production use RPC for sums
    const { data: financialData } = await supabase
      .from('financial_logs')
      .select('amount')
      .eq('type', 'revenue')
      .gte('date', startOfMonth.toISOString());

    const revenue = financialData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    // 4. Sales Count (Arrematado status)
    const { count: salesCount } = await supabase
      .from('auctions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'arrematado');

    setStats({
      totalLeads: leadsCount || 0,
      activeAuctions: auctionsCount || 0,
      monthlyRevenue: revenue,
      recentSales: salesCount || 0
    });

    setLoading(false);
  };

  const cards = [
    {
      label: 'Faturamento Mensal',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthlyRevenue),
      icon: DollarSign,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      description: '+12% vs mês anterior'
    },
    {
      label: 'Leilões Ativos',
      value: stats.activeAuctions,
      icon: Gavel,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      description: 'Publicados ou em Praça'
    },
    {
      label: 'Total de Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      description: 'Base de contatos cadastrada'
    },
    {
      label: 'Vendas Realizadas',
      value: stats.recentSales,
      icon: TrendingUp,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      description: 'Total de arrematações'
    }
  ];

  if (loading) {
    return <div className="p-8 text-white">Carregando indicadores...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Geral</h1>
        <p className="text-gray-400">Visão geral da performance da sua franquia.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
              <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} className="mr-1" />
                KPI
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{card.value}</h3>
            <p className="text-sm text-gray-400 mb-2">{card.label}</p>
            <p className="text-xs text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4">Atalhos Rápidos</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/leads/new" className="p-4 bg-[#0f172a] rounded-xl border border-white/10 hover:border-blue-500/50 transition-all group">
              <Users className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-300">Novo Lead</span>
            </Link>
            <Link to="/admin/leiloes/new" className="p-4 bg-[#0f172a] rounded-xl border border-white/10 hover:border-blue-500/50 transition-all group">
              <Gavel className="text-green-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-300">Criar Leilão</span>
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">Precisa de ajuda?</h3>
            <p className="text-blue-100 text-sm mb-6">
              Acesse a base de conhecimento da franqueadora ou fale com o suporte oficial.
            </p>
          </div>
          <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors">
            <span className="font-medium">Falar com Suporte</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
