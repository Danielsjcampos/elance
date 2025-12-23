import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Filter, FileText, CheckCircle, AlertCircle, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/Modal';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    status: 'paid' | 'pending' | 'overdue';
    due_date: string;
    payment_date?: string;
    franchise_id: string;
    related_franchise_id?: string; // For commissions
    commission_source?: string;
}

interface Franchise {
    id: string;
    name: string;
}

const Financial: React.FC = () => {
    const { user, profile, isAdmin } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'reports'>('overview');

    // Stats
    const [stats, setStats] = useState({ income: 0, expense: 0, pending_income: 0, pending_expense: 0, total: 0 });

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
        description: '',
        amount: 0,
        type: 'expense',
        category: 'Despesas Operacionais',
        status: 'paid',
        due_date: new Date().toISOString().split('T')[0],
        payment_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (user) {
            fetchTransactions();
            fetchFranchises();
        }
    }, [user]);

    const fetchTransactions = async () => {
        try {
            let query = supabase
                .from('financial_logs')
                .select('*')
                .order('due_date', { ascending: false });

            // Only filter if not admin, or if admin wants to see specific franchise (future feature)
            // RLS already handles security for non-admins.
            if (!isAdmin && profile?.franchise_unit_id) {
                query = query.eq('franchise_id', profile.franchise_unit_id);
            }

            const { data, error } = await query;

            if (error) throw error;
            const txs = data || [];

            // Fix amount types just in case
            const formattedTxs = txs.map(t => ({ ...t, amount: Number(t.amount) }));
            setTransactions(formattedTxs);
            calculateStats(formattedTxs);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFranchises = async () => {
        const { data } = await supabase.from('franchise_units').select('id, name');
        setFranchises(data || []);
    };

    const calculateStats = (txs: Transaction[]) => {
        let income = 0;
        let expense = 0;
        let pending_income = 0;
        let pending_expense = 0;

        txs.forEach(t => {
            if (t.status === 'paid') {
                if (t.type === 'income') income += t.amount;
                else expense += t.amount;
            } else {
                if (t.type === 'income') pending_income += t.amount;
                else pending_expense += t.amount;
            }
        });

        setStats({ income, expense, pending_income, pending_expense, total: income - expense });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('financial_logs').insert([{
                ...newTransaction,
                franchise_id: profile?.franchise_unit_id,
                date: new Date().toISOString() // Keep compatibility
            }]);

            if (error) throw error;

            setIsModalOpen(false);
            fetchTransactions();
            alert('Lançamento salvo com sucesso!');
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    const markAsPaid = async (id: string) => {
        try {
            const { error } = await supabase.from('financial_logs')
                .update({ status: 'paid', payment_date: new Date().toISOString().split('T')[0] })
                .eq('id', id);

            if (error) throw error;
            fetchTransactions();
        } catch (error: any) {
            alert('Erro ao atualizar: ' + error.message);
        }
    };

    const DREView = () => {
        // Simple DRE Logic
        const report = transactions.filter(t => t.status === 'paid').reduce((acc, curr) => {
            const cat = curr.category || 'Outros';
            if (!acc[cat]) acc[cat] = { income: 0, expense: 0 };

            if (curr.type === 'income') acc[cat].income += curr.amount;
            else acc[cat].expense += curr.amount;

            return acc;
        }, {} as Record<string, { income: number, expense: number }>);

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="text-[#3a7ad1]" />
                    Demonstrativo de Resultado (DRE)
                </h3>

                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded font-bold">
                        <span>Categoria</span>
                        <div className="flex gap-8">
                            <span className="text-green-600">Receitas</span>
                            <span className="text-red-600">Despesas</span>
                            <span className="text-gray-800">Resultado</span>
                        </div>
                    </div>

                    {Object.entries(report).map(([cat, vals]) => (
                        <div key={cat} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50">
                            <span className="font-medium text-gray-700">{cat}</span>
                            <div className="flex gap-8 text-right">
                                <span className="text-green-600 w-24">{vals.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                <span className="text-red-600 w-24">{vals.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                <span className={`w-24 font-bold ${(vals.income - vals.expense) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {(vals.income - vals.expense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between items-center p-4 bg-[#3a7ad1]/10 rounded-lg mt-4 border border-[#3a7ad1]/20">
                        <span className="font-bold text-[#3a7ad1] text-lg">Resultado Líquido</span>
                        <span className="font-bold text-[#3a7ad1] text-2xl">
                            {stats.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Financeiro Completo</h2>
                    <p className="text-gray-500">Controle de caixa, comissões e DRE.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] transition-colors"
                >
                    <Plus size={20} />
                    Novo Lançamento
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Saldo em Caixa</p>
                    <h3 className={`text-2xl font-bold mt-1 ${stats.total >= 0 ? 'text-[#151d38]' : 'text-red-600'}`}>
                        {stats.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">Realizado</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">A Receber (Pendente)</p>
                    <h3 className="text-2xl font-bold text-orange-500 mt-1">
                        {stats.pending_income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">A Pagar (Pendente)</p>
                    <h3 className="text-2xl font-bold text-red-500 mt-1">
                        {stats.pending_expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Receita Total</p>
                    <h3 className="text-2xl font-bold text-green-600 mt-1">
                        {stats.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500'}`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'transactions' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500'}`}
                >
                    Lançamentos
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'reports' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500'}`}
                >
                    Relatórios (DRE)
                </button>
            </div>

            {activeTab === 'reports' ? (
                <DREView />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-sm">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Descrição</th>
                                    <th className="p-4 font-semibold text-gray-600">Categoria</th>
                                    <th className="p-4 font-semibold text-gray-600">Vencimento</th>
                                    <th className="p-4 font-semibold text-gray-600">Valor</th>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800">
                                            {t.description}
                                            {t.related_franchise_id && (
                                                <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                                    <Building size={12} /> Comissionamento Externo
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{t.category}</td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {new Date(t.due_date).toLocaleDateString()}
                                        </td>
                                        <td className={`p-4 font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'expense' ? '- ' : '+ '}
                                            {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                t.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {t.status === 'paid' ? 'Pago' : t.status === 'overdue' ? 'Vencido' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {t.status !== 'paid' && (
                                                <button
                                                    onClick={() => markAsPaid(t.id)}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    title="Marcar como Pago"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Transaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Lançamento Financeiro"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                            <select
                                className="w-full border rounded-lg p-2 outline-none"
                                value={newTransaction.type}
                                onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                            >
                                <option value="income">Receita</option>
                                <option value="expense">Despesa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full border rounded-lg p-2 outline-none"
                                value={newTransaction.status}
                                onChange={e => setNewTransaction({ ...newTransaction, status: e.target.value as any })}
                            >
                                <option value="paid">Pago / Recebido</option>
                                <option value="pending">Pendente / Agendado</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none"
                            value={newTransaction.description}
                            onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            placeholder="Ex: Venda Leilão #123"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Valor (R$)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full border rounded-lg p-2 outline-none"
                                value={newTransaction.amount}
                                onChange={e => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Vencimento</label>
                            <input
                                required
                                type="date"
                                className="w-full border rounded-lg p-2 outline-none"
                                value={newTransaction.due_date}
                                onChange={e => setNewTransaction({ ...newTransaction, due_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                        <select
                            className="w-full border rounded-lg p-2 outline-none"
                            value={newTransaction.category}
                            onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                        >
                            <option value="Comissões Vendas Próprias">Comissões Vendas Próprias</option>
                            <option value="Comissões Outras Franquias">Comissões Outras Franquias</option>
                            <option value="Taxas Administrativas">Taxas Administrativas</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Aluguel">Aluguel</option>
                            <option value="Salários">Salários</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    {newTransaction.category === 'Comissões Outras Franquias' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-sm font-bold text-blue-800 mb-1">Franquia Relacionada</label>
                            <select
                                className="w-full border rounded-lg p-2 outline-none"
                                value={newTransaction.related_franchise_id || ''}
                                onChange={e => setNewTransaction({ ...newTransaction, related_franchise_id: e.target.value })}
                            >
                                <option value="">Selecione a Franquia...</option>
                                {franchises.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0] font-medium shadow-sm"
                        >
                            Salvar Lançamento
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Financial;
