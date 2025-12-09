import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { CONTACT_INFO, COLORS } from '../constants';
import SEO from './SEO';

const WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE"; // Replace with your actual webhook URL (e.g., n8n, Zapier, Make)

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    subscribe: true
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // Simulate network request or send to actual webhook
      if (WEBHOOK_URL !== "YOUR_WEBHOOK_URL_HERE") {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            timestamp: new Date().toISOString(),
            source: 'E-Lance Website Contact Form'
          }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
      } else {
        // Simulation for demo purposes if no webhook is set
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '', subscribe: true });

      // Reset status after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white min-h-screen pt-24">
      <SEO
        title="Fale Conosco"
        description="Fale com a E-Lance. Tire dúvidas sobre cursos, franquias e leilões presenciais ou online. Nossa equipe está pronta para atender você."
      />

      {/* Hero Mini */}
      <div className="relative bg-[#151d38] py-20 overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#3a7ad1] opacity-10 blur-[100px] animate-blob"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Entre em contato</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Estamos prontos para atender você. Preencha o formulário ou utilize nossos canais diretos.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Contact Info Column */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="glass-card p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
              <h2 className="text-2xl font-bold text-[#151d38] mb-6 border-b border-gray-100 pb-4">
                Informações de Contato
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-blue-50 rounded-xl text-[#3a7ad1] group-hover:bg-[#3a7ad1] group-hover:text-white transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#151d38]">Endereço</h3>
                    <p className="text-gray-600 text-sm mt-1">{CONTACT_INFO.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-blue-50 rounded-xl text-[#3a7ad1] group-hover:bg-[#3a7ad1] group-hover:text-white transition-colors">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#151d38]">Telefone & WhatsApp</h3>
                    <a href={`tel:${CONTACT_INFO.phone}`} className="text-gray-600 text-sm mt-1 hover:text-[#3a7ad1] block">
                      {CONTACT_INFO.phone}
                    </a>
                    <a href={CONTACT_INFO.whatsappLink} target="_blank" rel="noreferrer" className="text-[#3a7ad1] text-xs font-bold uppercase tracking-wide mt-1 inline-block hover:underline">
                      Iniciar conversa no WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-blue-50 rounded-xl text-[#3a7ad1] group-hover:bg-[#3a7ad1] group-hover:text-white transition-colors">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#151d38]">E-mail</h3>
                    <a href={`mailto:${CONTACT_INFO.email}`} className="text-gray-600 text-sm mt-1 hover:text-[#3a7ad1] block">
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-blue-50 rounded-xl text-[#3a7ad1] group-hover:bg-[#3a7ad1] group-hover:text-white transition-colors">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#151d38]">Horário de Atendimento</h3>
                    <div className="text-gray-600 text-sm mt-1 space-y-1">
                      <p className="flex justify-between gap-8"><span>Seg - Sex:</span> <span>09:00 - 18:00</span></p>
                      <p className="flex justify-between gap-8"><span>Sábado:</span> <span>Apenas com horário marcado</span></p>
                      <p className="flex justify-between gap-8 text-red-400"><span>Domingo:</span> <span>Fechado</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Static Map Placeholder */}
            <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-200 h-64 relative group">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000"
                alt="Map Location"
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                <a
                  href="https://maps.google.com/?q=Av.+Duque+de+Caxias+18-29,+Bauru-SP"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 bg-white text-[#151d38] font-bold rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <MapPin size={18} className="text-[#3a7ad1]" />
                  Ver no Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="animate-fade-in-up animation-delay-2000">
            <div className="glass-card p-8 lg:p-10 rounded-3xl bg-white border border-gray-100 shadow-2xl relative overflow-hidden">

              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0"></div>

              <h2 className="text-3xl font-bold text-[#151d38] mb-2 relative z-10">Envie uma mensagem</h2>
              <p className="text-gray-500 mb-8 relative z-10">Preencha o formulário abaixo e nossa equipe entrará em contato.</p>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">

                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-[#151d38] mb-2">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#151d38] focus:border-[#3a7ad1] focus:ring-4 focus:ring-[#3a7ad1]/10 outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-[#151d38] mb-2">E-mail</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#151d38] focus:border-[#3a7ad1] focus:ring-4 focus:ring-[#3a7ad1]/10 outline-none transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-[#151d38] mb-2">Telefone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#151d38] focus:border-[#3a7ad1] focus:ring-4 focus:ring-[#3a7ad1]/10 outline-none transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-[#151d38] mb-2">Mensagem</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#151d38] focus:border-[#3a7ad1] focus:ring-4 focus:ring-[#3a7ad1]/10 outline-none transition-all resize-none"
                    placeholder="Como podemos ajudar?"
                  ></textarea>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="flex items-center h-5">
                    <input
                      id="subscribe"
                      name="subscribe"
                      type="checkbox"
                      checked={formData.subscribe}
                      onChange={handleCheckboxChange}
                      className="h-5 w-5 text-[#3a7ad1] focus:ring-[#3a7ad1] border-gray-300 rounded"
                    />
                  </div>
                  <label htmlFor="subscribe" className="text-sm text-gray-500 leading-tight">
                    Ao enviar a mensagem você concorda com nossos Termos e Condições e autoriza o recebimento de contatos da equipe E-Lance.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className={`w-full flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] rounded-xl shadow-lg hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={24} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Mensagem
                      <Send className="ml-2" size={20} />
                    </>
                  )}
                </button>

                {/* Status Messages */}
                {status === 'success' && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 animate-fade-in-up">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-green-800 text-sm">Mensagem enviada com sucesso!</h4>
                      <p className="text-green-600 text-sm">Em breve retornaremos o contato.</p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in-up">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-red-800 text-sm">Erro ao enviar.</h4>
                      <p className="text-red-600 text-sm">Por favor, tente novamente mais tarde ou use o WhatsApp.</p>
                    </div>
                  </div>
                )}

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
