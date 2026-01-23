import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FinancialLog } from '../../../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search,
  Filter
} from 'lucide-react';

const Financeiro = () => {
  const [logs, setLogs] = useState<FinancialLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Modal State
  const [newLog, setNewLog] = useState<Partial<FinancialLog>>({
    type: 'revenue',
    category: 'comissao',
    amount: 0,
    description: '',
    date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('financial_logs')
      .select('*, auction:auctions(process_number)')
      .order('date', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const calculateTotals = () => {
    return logs.reduce(
      (acc, log) => {
        if (log.type === 'revenue') acc.revenue += log.amount;
        else acc.expense += log.amount;
        return acc;
      },
      { revenue: 0, expense: 0 }
    );
  };

  const { revenue, expense } = calculateTotals();
  const balance = revenue - expense;

  const handleSave = async () => {
    const { error } = await supabase.from('financial_logs').insert([newLog]);
    if (!error) {
      setShowModal(false);
      fetchLogs();
      setNewLog({
        type: 'revenue',
        category: 'comissao',
        amount: 0,
        description: '',
        date: new Date().toISOString().slice(0, 10)
      });
    } else {
      alert('Erro ao salvar');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-gray-400">Controle de receitas e despesas por leilão.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg"
        >
          <Plus size={20} />
          Novo Lançamento
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Receitas Totais</p>
              <h3 className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue)}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Despesas Totais</p>
              <h3 className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense)}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Saldo Líquido</p>
              <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white">Histórico de Movimentações</h3>
            <button className="text-gray-400 hover:text-white">
                <Filter size={18} />
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#151d38]/50 text-gray-400 text-xs uppercase">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(log.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.type === 'revenue' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {log.type === 'revenue' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 capitalize">{log.category}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{log.description}</td>
                  <td className={`px-6 py-4 text-right font-medium ${log.type === 'revenue' ? 'text-green-400' : 'text-red-400'}`}>
                    {log.type === 'expense' ? '-' : '+'} 
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(log.amount)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum lançamento encontrado.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-fade-in-up">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">Novo Lançamento</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                        <select 
                            value={newLog.type}
                            onChange={(e) => setNewLog({...newLog, type: e.target.value as any})}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                        >
                            <option value="revenue">Receita</option>
                            <option value="expense">Despesa</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                        <input 
                            type="text"
                            value={newLog.category}
                            onChange={(e) => setNewLog({...newLog, category: e.target.value})}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                            placeholder="Ex: Comissão, Taxa, Publicidade"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Valor (R$)</label>
                        <input 
                            type="number"
                            value={newLog.amount}
                            onChange={(e) => setNewLog({...newLog, amount: parseFloat(e.target.value)})}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                        <input 
                            type="text"
                            value={newLog.description || ''}
                            onChange={(e) => setNewLog({...newLog, description: e.target.value})}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Data</label>
                        <input 
                            type="date"
                            value={newLog.date}
                            onChange={(e) => setNewLog({...newLog, date: e.target.value})}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#151d38]/50 rounded-b-2xl">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 rounded-xl text-white font-bold">Salvar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;
