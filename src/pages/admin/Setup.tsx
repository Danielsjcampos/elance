import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Logo } from '../../../components/Logo';

const Setup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] rounded-2xl shadow-xl w-full max-w-md p-8 border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <Logo className="h-16 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">Criar Conta Admin</h2>
          <p className="text-gray-400 text-sm mt-2">Configure o primeiro usuário do sistema</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-200">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 flex flex-col items-center gap-3 text-green-200">
              <CheckCircle size={48} className="text-green-500" />
              <h3 className="text-lg font-bold">Conta Criada!</h3>
              <p className="text-sm">Sua conta de administrador foi criada com sucesso.</p>
            </div>
            <button
               onClick={() => navigate('/admin/login')}
               className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
            >
              Ir para Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl leading-5 bg-[#0f172a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3a7ad1] focus:border-[#3a7ad1] transition-all duration-200 sm:text-sm"
                  placeholder="Seu Nome"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl leading-5 bg-[#0f172a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3a7ad1] focus:border-[#3a7ad1] transition-all duration-200 sm:text-sm"
                  placeholder="admin@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl leading-5 bg-[#0f172a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3a7ad1] focus:border-[#3a7ad1] transition-all duration-200 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] hover:from-[#4a8ae1] hover:to-[#3a7ad1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a7ad1] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Criar Usuário Admin'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Setup;
