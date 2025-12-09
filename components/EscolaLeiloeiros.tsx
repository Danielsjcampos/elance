import React from 'react';
import { CheckCircle2, MapPin, User, Award, BookOpen, ArrowRight, DollarSign, Star, Shield, TrendingUp } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import SEO from './SEO';

const EscolaLeiloeiros: React.FC = () => {
    const { openModal } = useModal();

    const openLeadModal = () => {
        openModal('Escola de Leiloeiros');
    };

    const caucaoData = [
        { state: "Acre", price: "R$ 40.000,00" },
        { state: "Alagoas", price: "R$ 50.000,00" },
        { state: "Amapá", price: "R$ 45.774,10" },
        { state: "Amazonas", price: "R$ 60.000,00" },
        { state: "Bahia", price: "R$ 30.000,00" },
        { state: "Ceará", price: "R$ 50.000,00" },
        { state: "Distrito Federal", price: "R$ 50.000,00" },
        { state: "Espírito Santo", price: "R$ 80.000,00" },
        { state: "Goiás", price: "R$ 45.000,00" },
        { state: "Maranhão", price: "R$ 50.000,00" },
        { state: "Mato Grosso", price: "R$ 40.000,00" },
        { state: "Mato Grosso do Sul", price: "R$ 100.000,00" },
        { state: "Minas Gerais", price: "R$ 80.000,00" },
        { state: "Pará", price: "R$ 15.000,00" },
        { state: "Paraíba", price: "R$ 30.000,00" },
        { state: "Paraná", price: "R$ 100.000,00" },
        { state: "Pernambuco", price: "R$ 40.000,00" },
        { state: "Piauí", price: "R$ 60.000,00" },
        { state: "Rio de Janeiro", price: "R$ 90.000,00" },
        { state: "Rio Grande do Norte", price: "R$ 30.000,00" },
        { state: "Rio Grande do Sul", price: "R$ 42.510,00" },
        { state: "Rondônia", price: "R$ 30.000,00" },
        { state: "Roraima", price: "R$ 20.000,00" },
        { state: "São Paulo", price: "R$ 120.000,00" },
        { state: "Santa Catarina", price: "R$ 70.000,00" },
        { state: "Sergipe", price: "R$ 20.000,00" },
        { state: "Tocantins", price: "R$ 50.000,00" },
    ];

    return (
        <div className="min-h-screen pt-20 bg-[#151d38] text-white selection:bg-[#3a7ad1] selection:text-white font-sans">
            <SEO
                title="Escola de Leiloeiros"
                description="Curso de Formação de Leiloeiro Oficial. Aprenda a profissão do zero: requisitos, credenciamento, prática e montagem do escritório."
            />
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 lg:py-32">
                {/* Background Illuminations */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6 backdrop-blur-sm">
                                <Star className="h-4 w-4 fill-blue-400" />
                                Formação Oficial Certificada
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
                                Escola de Formação para <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3a7ad1] to-blue-400">Leiloeiros</span>
                            </h1>

                            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                A Escola E-Lance é referência nacional. Sua jornada para se tornar um leiloeiro oficial começa com quem tem mais de 20 anos de experiência.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={openLeadModal}
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-[#3a7ad1] to-blue-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
                                >
                                    Quero me inscrever
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => document.getElementById('valores')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white border border-white/10 rounded-xl hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
                                >
                                    Ver Valores
                                </button>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full">
                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#1e2a4a]">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#151d38] via-transparent to-transparent z-10 opacity-60" />
                                    <img
                                        src="https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/c4234825cd504740bc4546c390e93867"
                                        alt="Escola de Leiloeiros"
                                        className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
                                    />

                                    {/* Floating Badges */}
                                    <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col gap-3">
                                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Shield className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Suporte Completo</p>
                                                <p className="font-bold text-white">Jurídico e Operacional</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Audience Section - "Para quem ainda não é leiloeiro" */}
            <section className="py-24 bg-[#0f152a] relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-900/5 to-transparent pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">
                                Do Zero ao <span className="text-[#3a7ad1]">Registro Oficial</span>
                            </h2>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Oferecemos o caminho completo para quem deseja se tornar leiloeiro, mesmo sem experiência prévia.
                            </p>

                            <div className="grid gap-4">
                                {[
                                    { title: "Orientação Legal", desc: "Requisitos e inscrição na Junta Comercial" },
                                    { title: "Treinamento do Zero", desc: "Mesmo para quem nunca participou de um leilão" },
                                    { title: "Credenciamento", desc: "Inscrição em diversas varas judiciais" },
                                    { title: "Estruturação", desc: "Montagem de escritório e operação" },
                                    { title: "Marketing", desc: "Estratégias para prospecção de clientes" },
                                    { title: "Gestão 360º", desc: "Jurídico, financeiro e administrativo" }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-gray-400">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2">
                            <div className="sticky top-24">
                                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
                                    <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay z-10" />
                                    <img
                                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NTEzfDB8MXxzZWFyY2h8OXx8Y29uc3VsdGluZ3xlbnwwfHx8fDE3NTg4NzEwNzd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                                        alt="Treinamento"
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0f152a] to-transparent z-20">
                                        <div className="bg-[#151d38]/90 backdrop-blur border border-white/10 p-6 rounded-2xl shadow-xl">
                                            <p className="text-lg font-bold text-white mb-2">"Objetivo claro:"</p>
                                            <p className="text-gray-300">Formar novos leiloeiros aptos a atuar de forma independente e profissional.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coordinator Section */}
            <section className="py-24 bg-[#151d38] relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-lg rounded-[2rem] p-8 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden group">

                        {/* Blob decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700" />

                        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                            <div className="md:w-1/3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="rounded-full overflow-hidden w-56 h-56 mx-auto border-4 border-[#1e2a4a] shadow-2xl relative z-10">
                                        <img
                                            src="https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/bc099e219fde438a8f9ef415550b79eb"
                                            alt="Jerônimo Pompeu"
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-2/3 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider mb-6">
                                    Coordenação Pedagógica
                                </div>
                                <h2 className="text-4xl font-bold mb-6 text-white">Jerônimo Pompeu</h2>
                                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                                    Especialista com mais de 20 anos de experiência em leilões. Conduz o programa com a autoridade de quem já atuou dos dois lados da mesa: como gerente de banco e como arrematante.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 text-sm text-gray-400">
                                        <Award className="h-5 w-5 text-[#3a7ad1]" />
                                        <span>Ex-Gerente Caixa (Alienações)</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 text-sm text-gray-400">
                                        <BookOpen className="h-5 w-5 text-[#3a7ad1]" />
                                        <span>Fundador da E-Lance</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 text-sm text-gray-400">
                                        <User className="h-5 w-5 text-[#3a7ad1]" />
                                        <span>MBA Gestão Empresarial FGV</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 text-sm text-gray-400">
                                        <TrendingUp className="h-5 w-5 text-[#3a7ad1]" />
                                        <span>+300 processos organizados</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Differentials & Requirements Grid */}
            <section className="py-24 bg-[#0f152a]">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Differentials */}
                        <div className="bg-gradient-to-br from-[#1e2a4a] to-[#151d38] rounded-3xl p-10 border border-white/5 hover:border-[#3a7ad1]/30 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 GROUP-hover:bg-blue-500/20 transition-colors">
                                <Star className="h-7 w-7 text-[#3a7ad1]" />
                            </div>

                            <h3 className="text-2xl font-bold mb-8 text-white">
                                Diferenciais Exclusivos
                            </h3>

                            <ul className="space-y-6">
                                {[
                                    "Treinamento prático com estudos de caso reais",
                                    "Acompanhamento contínuo e consultoria individualizada",
                                    "Networking com leiloeiros de todo o Brasil",
                                    "Material exclusivo e certificado de conclusão"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-gray-300">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3a7ad1] shadow-[0_0_10px_#3a7ad1]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Requirements */}
                        <div className="bg-gradient-to-br from-[#1e2a4a] to-[#151d38] rounded-3xl p-10 border border-white/5 hover:border-[#3a7ad1]/30 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
                            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 GROUP-hover:bg-purple-500/20 transition-colors">
                                <Shield className="h-7 w-7 text-purple-400" />
                            </div>

                            <h3 className="text-2xl font-bold mb-8 text-white">
                                Exigências Legais
                            </h3>

                            <ul className="space-y-6">
                                {[
                                    "Idade mínima de 25 anos",
                                    "Idoneidade cadastral (sem protestos)",
                                    "Exclusividade (não ter empresa em seu nome)",
                                    "Depósito de caução na Junta Comercial"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-gray-300">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_purple]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Caução Table Section */}
            <section id="valores" className="py-24 bg-[#151d38] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#3a7ad1] font-bold tracking-wider uppercase text-sm mb-3 block">Investimento Inicial</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Valores da Caução</h2>
                        <p className="text-gray-400 text-lg">
                            Para se inscrever como leiloeiro oficial, é obrigatório realizar o depósito de caução na Junta Comercial.
                            Estes valores são definidos por cada estado:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                        {caucaoData.map((item, index) => (
                            <div key={index} className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 hover:bg-white/[0.08] hover:border-[#3a7ad1]/30 transition-all duration-300 flex flex-col justify-between group cursor-default hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#3a7ad1]/10 flex items-center justify-center group-hover:bg-[#3a7ad1]/20 transition-colors">
                                            <MapPin className="h-4 w-4 text-[#3a7ad1]" />
                                        </div>
                                        <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">{item.state}</span>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-white group-hover:text-[#3a7ad1] transition-colors relative">
                                    {item.price}
                                    <div className="absolute -bottom-6 left-0 w-1/3 h-0.5 bg-[#3a7ad1] opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1530971013997-e06bb52a2372?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NTEzfDB8MXxzZWFyY2h8MTh8fGNvbnN1bHRpbmd8ZW58MHx8fHwxNzU4ODcxMDc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151d38] via-[#151d38]/90 to-[#151d38]/90" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">Pronto para começar?</h2>
                        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                            Se você possui os requisitos e o valor do depósito de caução, dê o primeiro passo para sua nova carreira agora mesmo.
                        </p>
                        <button
                            onClick={openLeadModal}
                            className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-[#3a7ad1] rounded-full overflow-hidden transition-all hover:bg-blue-600 shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <DollarSign className="mr-2 h-6 w-6" />
                            Quero me tornar um Leiloeiro
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EscolaLeiloeiros;
