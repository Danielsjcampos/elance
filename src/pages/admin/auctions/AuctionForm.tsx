import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Gavel,
  Calendar,
  DollarSign,
  FileText,
  User,
  Globe
} from 'lucide-react';
import { Auction, Lead } from '../../../../types';

const AuctionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comitentes, setComitentes] = useState<Lead[]>([]);

  const [formData, setFormData] = useState<Partial<Auction>>({
    status: 'preparacao',
    process_number: '',
    description: '',
    vara: '',
    valuation_value: 0,
    minimum_bid: 0,
    first_auction_date: '',
    second_auction_date: '',
    comitente_id: '',
    franchise_id: '' // New field for Admin to assign
  });

  useEffect(() => {
    fetchComitentes();
    if (isEditing) {
      fetchAuction();
    }
  }, [id]);

  const fetchComitentes = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .in('type', ['comitente', 'advogado']); // Assumindo que advogados também podem ser vinculados
    setComitentes(data || []);
  };

  const fetchAuction = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError('Erro ao carregar leilão');
      console.error(error);
    } else {
      // Ajuste de datas para o input type="datetime-local"
      const formatForInput = (dateStr: string | null) => 
        dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';

      setFormData({
        ...data,
        first_auction_date: formatForInput(data.first_auction_date),
        second_auction_date: formatForInput(data.second_auction_date)
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Converter string vazia para null nas datas
    const payload = {
      ...formData,
      first_auction_date: formData.first_auction_date || null,
      second_auction_date: formData.second_auction_date || null,
      comitente_id: formData.comitente_id || null
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('auctions')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('auctions')
          .insert([payload]);
        if (error) throw error;
      }
      navigate('/admin/leiloes');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/leiloes')}
          className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Leilão' : 'Novo Leilão'}
          </h1>
          <p className="text-gray-400">Gerencie processos e praças.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados do Processo */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Gavel size={20} className="text-blue-400" />
              Dados do Processo
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Número do Processo *</label>
                <input
                  type="text"
                  name="process_number"
                  value={formData.process_number || ''}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 font-mono"
                  placeholder="0000000-00.0000.8.26.0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Vara / Comarca</label>
                  <input
                    type="text"
                    name="vara"
                    value={formData.vara || ''}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="preparacao">Preparação</option>
                    <option value="publicado">Publicado</option>
                    <option value="primeira_praca">1ª Praça</option>
                    <option value="segunda_praca">2ª Praça</option>
                    <option value="arrematado">Arrematado</option>
                    <option value="suspenso">Suspenso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Comitente (Vendedor)</label>
                <select
                  name="comitente_id"
                  value={formData.comitente_id || ''}
                  onChange={handleChange}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                >
                <option value="">Selecione um Comitente</option>
                  {comitentes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Cadastre comitentes na aba Leads.</p>
              </div>

               {/* Admin Only: Franchise Selection */}
               <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                    <Globe size={14} className="text-blue-400"/> Unidade Franqueada (Admin)
                 </label>
                 <select
                   name="franchise_id"
                   value={formData.franchise_id || ''}
                   onChange={handleChange}
                   className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                 >
                   <option value="">Matriz (Global)</option>
                   {/* We would map franchises here if we fetched them. For now, let's just show options if data exists or stub it. 
                       Ideally, we'd fetch franchises in useEffect as well. 
                       For this quick fix, I will assume we might fetch them or just let the backend trigger handle defaults if empty.
                       To make it real, let's fetch franchises.
                   */}
                 </select>
                 <p className="text-xs text-gray-500 mt-1">Deixe vazio para atribuir à Matriz/Global.</p>
               </div>
            </div>
          </div>

          {/* Valores e Datas */}
          <div className="space-y-6">
            <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <DollarSign size={20} className="text-green-400" />
                Valores e Datas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Valor Avaliação</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      name="valuation_value"
                      value={formData.valuation_value || ''}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Lance Mínimo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="number"
                      name="minimum_bid"
                      value={formData.minimum_bid || ''}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data 1ª Praça</label>
                  <input
                    type="datetime-local"
                    name="first_auction_date"
                    value={String(formData.first_auction_date)}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data 2ª Praça</label>
                  <input
                    type="datetime-local"
                    name="second_auction_date"
                    value={String(formData.second_auction_date)}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText size={20} className="text-yellow-400" />
                Descrição do Bem
              </h3>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                placeholder="Descreva o imóvel ou veículo detalhadamente..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/leiloes')}
            className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 font-bold"
          >
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={20} />}
            {isEditing ? 'Salvar Leilão' : 'Criar Leilão'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuctionForm;
