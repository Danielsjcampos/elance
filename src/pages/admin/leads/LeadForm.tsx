import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  User, 
  Briefcase, 
  MapPin, 
  FileText,
  CreditCard
} from 'lucide-react';
import { Lead } from '../../../../types';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Lead>>({
    type: 'arrematante',
    status: 'novo',
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    rg: '',
    address: '',
    profession: '',
    marital_status: '',
    notes: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError('Erro ao carregar lead');
      console.error(error);
    } else {
      setFormData(data);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('leads')
          .update(formData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([formData]);
        if (error) throw error;
      }
      navigate('/admin/leads');
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
          onClick={() => navigate('/admin/leads')}
          className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Lead' : 'Novo Lead'}
          </h1>
          <p className="text-gray-400">Preencha os dados do cadastro.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Pessoais */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User size={20} className="text-blue-400" />
              Dados Pessoais
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">CPF / CNPJ *</label>
                  <input
                    type="text"
                    name="cpf_cnpj"
                    value={formData.cpf_cnpj || ''}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">RG</label>
                  <input
                    type="text"
                    name="rg"
                    value={formData.rg || ''}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Estado Civil</label>
                  <select
                    name="marital_status"
                    value={formData.marital_status || ''}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">Selecione</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                    <option value="uniao_estavel">União Estável</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Profissão</label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession || ''}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contato & Tipo */}
          <div className="space-y-6">
            <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Briefcase size={20} className="text-purple-400" />
                Classificação
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Cadastro *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="arrematante">Arrematante</option>
                    <option value="advogado">Advogado</option>
                    <option value="comitente">Comitente (Vendedor)</option>
                    <option value="parceiro">Parceiro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="novo">Novo Lead</option>
                    <option value="interessado">Interessado</option>
                    <option value="documentacao_pendente">Doc. Pendente</option>
                    <option value="habilitado">Habilitado</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin size={20} className="text-green-400" />
                Contato e Endereço
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Endereço Completo</label>
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={20} className="text-yellow-400" />
            Observações
          </h3>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={4}
            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
            placeholder="Informações adicionais sobre este lead..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/leads')}
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
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
