import React, { useState } from 'react';
import { FileText, Phone, Mail, CheckCircle, Download } from 'lucide-react';
import SEO from './components/SEO';

const Indique = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to a backend
        alert('Mensagem enviada com sucesso! Em breve entraremos em contato.');
        setFormData({ name: '', email: '', phone: '' });
    };

    return (
        <div className="min-h-screen bg-[#eff0f1] font-sans pt-20">
            <SEO
                title="Indique um Leilão"
                description="Advogado ou Juiz: Indique a E-Lance para realizar seus leilões judiciais. Segurança jurídica, agilidade e suporte completo para o seu processo."
            />
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508243529287-e21914733111?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NTEzfDB8MXxzZWFyY2h8NTR8fGJ1c2luZXNzJTIwbWFufGVufDB8MHx8fDE3NjE3MzczMjJ8MA&ixlib=rb-4.1.0&q=90&w=1920')] bg-cover bg-center opacity-20"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                        Indique a E-Lance para realizar o seu <span className="text-blue-400">leilão judicial</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 animate-fade-in-up delay-100">
                        É juiz, advogado ou trabalha em um escritório de advocacia? A E-Lance realiza leilões judiciais com total segurança jurídica e suporte completo do início ao fim do processo.
                    </p>
                </div>
            </section>

            {/* Cuidamos de Tudo Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#151d38] mb-6">Cuidamos de tudo</h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Desde o acompanhamento jurídico, publicação do edital e comunicações às partes e terceiros até a condução e homologação do leilão.
                            <br /><br />
                            Nossa equipe reúne leiloeiros oficiais, peritos e especialistas em avaliação, garantindo agilidade, transparência e resultados comprovados.
                        </p>
                        <blockquote className="text-xl italic text-slate-700 border-l-4 border-blue-500 pl-4 mb-8 text-left max-w-2xl mx-auto bg-slate-50 p-6 rounded-r-lg">
                            “Da avaliação ao arremate, a E-Lance cuida de todos os detalhes para que o leilão do seu processo seja um sucesso.”
                        </blockquote>

                        <div className="bg-slate-100 p-8 rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-gray-700 font-medium mb-6">
                                Quer indicar a E-Lance para realizar seu leilão judicial? <br />
                                Baixe gratuitamente o modelo de petição pronto para protocolar no processo.
                            </p>
                            <a
                                href="https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/68e6fed52e0443eeabebbb5b389cefd6?fileName=Peti%C3%A7%C3%A3o%20-%20Indica%C3%A7%C3%A3o%20da%20E-Lance%20Leil%C3%B5es.docx"
                                className="inline-flex items-center gap-2 bg-[#151d38] hover:bg-[#2a3860] text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <Download size={20} />
                                Baixar modelo de petição
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 bg-[#eff0f1]">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">

                        {/* Info Column */}
                        <div className="lg:w-1/2 p-10 lg:p-16 bg-[#151d38] text-white flex flex-col justify-center">
                            <h2 className="text-3xl font-bold mb-6">Fale com nossa equipe</h2>
                            <p className="text-slate-300 mb-8 text-lg">
                                Entre em contato e saiba como indicar seu processo para leilão judicial com a E-Lance.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Fone/WhatsApp</p>
                                        <p className="text-xl font-medium">(14) 98193-6781</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">E-mail</p>
                                        <p className="text-xl font-medium">contato@elance.com.br</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="lg:w-1/2 p-10 lg:p-16">
                            <h3 className="text-2xl font-bold text-[#151d38] mb-6">Envie uma mensagem</h3>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Seu nome completo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="(DD) 99999-9999"
                                        required
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        Enviar Mensagem
                                        <CheckCircle size={20} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Ao enviar, você concorda em ser contatado pela nossa equipe.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Indique;
