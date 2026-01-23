import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle, Shield, Building2 } from 'lucide-react';
import { Logo } from '../../../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in and redirect, BUT respect explicit logout
    const wasLoggedOut = location.state?.loggedOut;

    if (!wasLoggedOut) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/admin/dashboard');
            }
        });
    }
  }, [navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleQuickLogin = async (emailToUse: string) => {
    const passToUse = 'password123';
    
    setEmail(emailToUse);
    setPassword(passToUse);
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: passToUse,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] rounded-2xl shadow-xl w-full max-w-md p-8 border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
            <Logo className="h-16 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">Portal do Franqueado</h2>
          <p className="text-gray-400 text-sm mt-2">Acesse sua conta para gerenciar leilões</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-200">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="seunome@exemplo.com"
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
              'Entrar no Sistema'
            )}
          </button>

          <div className="grid grid-cols-1 gap-2 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-[#1e293b] text-xs text-gray-500">Acesso Rápido (Dev)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@elance.com')}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-indigo-500/30 rounded-lg shadow-sm text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white transition-all duration-200 gap-2 items-center group"
            >
              <Shield size={14} className="text-indigo-400 group-hover:text-white transition-colors" />
              Admin Master
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('franquia@sp.com')}
                disabled={loading}
                className="w-full flex justify-center py-2 px-2 border border-blue-500/30 rounded-lg shadow-sm text-xs font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:text-white transition-all duration-200 gap-2 items-center group"
              >
                <Building2 size={14} className="text-blue-400 group-hover:text-white transition-colors" />
                Franquia Alpha (SP)
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('franquia@rj.com')}
                disabled={loading}
                className="w-full flex justify-center py-2 px-2 border border-emerald-500/30 rounded-lg shadow-sm text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-white transition-all duration-200 gap-2 items-center group"
              >
                <Building2 size={14} className="text-emerald-400 group-hover:text-white transition-colors" />
                Franquia Beta (RJ)
              </button>
            </div>
          </div>
        </form>
        


        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Protegido por criptografia de ponta a ponta.
            <br />
            &copy; {new Date().getFullYear()} E-Lance Franquias.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
