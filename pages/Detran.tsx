import React, { useEffect, useState } from 'react';
import { Car, Bike, Shield, Clock, TrendingDown, ArrowRight, Gavel, Calendar, User, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { leadService } from '../services/leadService';
import { useTheme } from '../contexts/ThemeContext';

const Detran = () => {
  const { branding } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await leadService.captureLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: 'Página Detran',
        tags: ['Leilão Detran', 'Interesse +1000 Veículos'],
        franchise_id: branding?.id
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '' });
    } catch (error) {
      console.error('Error capturing lead:', error);
      setStatus('error');
    }
  };

  return (
    <>
      <Helmet>
        <title>Leilão Detran | Oportunidade Exclusiva E-Lance</title>
        <meta name="description" content="Lote exclusivo de mais de 1000 veículos incluindo carros e motos com descontos incríveis. Lançamento em breve!" />
      </Helmet>

      <div>
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ytimg.com/vi/4ZOErYAXxNE/maxresdefault.jpg" 
              alt="Leilão Detran" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#151d38]/95 via-[#151d38]/80 to-transparent"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-white">
            <div className="max-w-3xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md text-blue-300 font-bold text-sm mb-6 animate-fade-in">
                <Gavel size={16} className="mr-2" />
                GRANDE OPORTUNIDADE DETRAN
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-slide-up">
                Mais de <span className="text-blue-400">+1000</span> Veículos Disponíveis
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl animate-slide-up delay-100">
                Uma seleção exclusiva de carros e motos com descontos agressivos. Direto do pátio para você, com a segurança e transparência da E-Lance.
              </p>
              
              <div className="flex flex-wrap gap-4 animate-slide-up delay-200">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                  <Clock className="text-blue-400" />
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-gray-400 italic">Status</span>
                    <span className="font-bold text-lg">Em Breve Lançamento</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#151d38] mb-4">O que esperar deste lote?</h2>
              <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#f8fafc] p-8 rounded-3xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Car size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Múltiplas Categorias</h3>
                <p className="text-gray-600 leading-relaxed">
                  Desde populares econômicos até SUVs de luxo. Todas as marcas e modelos em um único lote massivo.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#f8fafc] p-8 rounded-3xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Bike size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">+500 Motocicletas</h3>
                <p className="text-gray-600 leading-relaxed">
                  Uma vasta seleção de motocicletas de diversas cilindradas, ideais para trabalho ou lazer.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#f8fafc] p-8 rounded-3xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <TrendingDown size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Super Descontos</h3>
                <p className="text-gray-600 leading-relaxed">
                  Oportunidades com lances iniciais extremamente atrativos, permitindo margens de lucro elevadas para revendedores.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Informational Section */}
        <section className="py-24 bg-[#151d38] text-white relative">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Prepare-se para o maior leilão do ano</h2>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  Estamos finalizando o catálogo completo com fotos e editais de cada veículo. Este lote representa uma oportunidade única de mercado devido ao volume e as condições de arrematação.
                </p>
                <ul className="space-y-4">
                  {[
                    "Documentação regularizada pela E-Lance",
                    "Acompanhamento jurídico completo",
                    "Visitação presencial agendada",
                    "Assessoria no pós-venda"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <ArrowRight size={14} />
                      </div>
                      <span className="text-lg text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center font-bold text-center leading-tight transform rotate-12 shadow-xl z-20">
                    BREVE<br/>2026
                  </div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Shield className="text-blue-400" />
                    Garanta seu Interesse
                  </h3>
                  <p className="text-gray-400 mb-8">
                    Cadastre-se para ser o primeiro a receber o catálogo oficial assim que for liberado.
                  </p>
                  
                  {status === 'success' ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center animate-fade-in">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                        <CheckCircle2 size={32} />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Inscrição Confirmada!</h4>
                      <p className="text-gray-400">Você será notificado assim que o lote for liberado.</p>
                      <button 
                        onClick={() => setStatus('idle')}
                        className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-bold"
                      >
                        Cadastrar outro e-mail
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                          type="text" 
                          required
                          placeholder="Nome Completo" 
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                          type="email" 
                          required
                          placeholder="Seu melhor e-mail" 
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                          type="tel" 
                          required
                          placeholder="WhatsApp (com DDD)" 
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {status === 'submitting' ? 'Cadastrando...' : 'Notificar-me no Lançamento'}
                      </button>
                      
                      {status === 'error' && (
                        <p className="text-red-400 text-sm text-center">Ocorreu um erro. Tente novamente.</p>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - Quick info */}
        <section className="py-24 bg-[#eff0f1]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Informações Importantes</h2>
            <div className="space-y-4">
              {[
                { q: "Qual o estado dos veículos?", a: "Os veículos variam de recuperáveis a sucatas com aproveitamento de peças. O catálogo detalhará cada categoria." },
                { q: "Haverá visitação?", a: "Sim, será aberta uma janela de visitação presencial nos pátios antes do início dos lances." },
                { q: "Como funciona o pagamento?", a: "O pagamento é feito integralmente via guia oficial em até 24h após a arrematação." }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    {item.q}
                  </h4>
                  <p className="text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Detran;
