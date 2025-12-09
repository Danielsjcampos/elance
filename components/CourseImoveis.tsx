import React from 'react';
import { useModal } from '../contexts/ModalContext';
import {
    CheckCircle,
    ArrowRight,
    BookOpen,
    TrendingUp,
    ShieldCheck,
    Users,
    Award,
    Briefcase
} from 'lucide-react';
import SEO from './SEO';

const CourseImoveis = () => {
    const { openModal } = useModal();

    const handleCtaClick = () => {
        openModal('Curso para Corretores de Imóveis');
    };

    const modules = [
        {
            title: "Introdução aos Leilões",
            description: "Entenda o funcionamento dos leilões da Caixa Econômica Federal e a venda online de imóveis retomados.",
            icon: <BookOpen className="w-6 h-6 text-blue-400" />
        },
        {
            title: "Estratégias de Compra",
            description: "Aprenda a identificar e comprar imóveis em leilão com foco em revenda e maximização de lucros.",
            icon: <TrendingUp className="w-6 h-6 text-green-400" />
        },
        {
            title: "Análise de Risco",
            description: "Domine a análise de editais e matrículas para garantir segurança jurídica e evitar ciladas.",
            icon: <ShieldCheck className="w-6 h-6 text-purple-400" />
        },
        {
            title: "Carteira de Clientes",
            description: "Como estruturar e gerir uma carteira de investidores interessados em oportunidades de leilão.",
            icon: <Users className="w-6 h-6 text-yellow-400" />
        },
        {
            title: "Técnicas de Negociação",
            description: "Estratégias avançadas para vender rapidamente os imóveis arrematados.",
            icon: <Briefcase className="w-6 h-6 text-red-400" />
        },
        {
            title: "Casos Reais",
            description: "Estudos de caso práticos e análise de oportunidades reais do mercado.",
            icon: <Award className="w-6 h-6 text-cyan-400" />
        }
    ];

    return (
        <div className="animate-in fade-in duration-500 bg-[#0b1021] text-gray-200">
            <SEO
                title="Curso para Corretores"
                description="Curso de Leilão de Imóveis para Corretores. Aprenda a vender imóveis retomados, captar investidores e multiplicar suas comissões."
            />
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#151d38] via-[#0b1021] to-[#151d38] z-0" />

                {/* Decorative Blobs */}
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-sm font-medium text-white/90">Inscrições Abertas</span>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
                                    Curso de Leilões para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Corretores de Imóveis</span>
                                </h1>
                                <p className="text-xl text-blue-100/90 font-light">
                                    Torne-se um especialista em arrematação e venda de imóveis de leilão. Aprenda com quem tem mais de 20 anos de experiência.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={handleCtaClick}
                                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Quero me Especializar
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 pt-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span>Certificado Incluso</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span>Material Prático</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span>Networking Exclusivo</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#151d38] via-transparent to-transparent opacity-60 z-10" />
                                <img
                                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                                    alt="Corretor de Imóveis"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Instructor Section */}
            <section className="py-20 relative bg-white/5 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur opacity-20" />
                            <img
                                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80"
                                alt="Jerônimo Pompeu"
                                className="w-full h-full object-cover rounded-full border-4 border-blue-500/20 relative z-10"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-white mb-4">Jerônimo Pompeu de Souza</h2>
                            <h3 className="text-blue-400 font-medium mb-6">Instrutor Especialista & Ex-Gerente Caixa</h3>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                Com mais de 20 anos de experiência no mercado de leilões, Jerônimo atuou como Gerente da Caixa Econômica Federal na área de alienação de imóveis retomados. Sua expertise prática e teórica oferece uma visão única sobre como identificar as melhores oportunidades e garantir segurança em cada transação.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#151d38]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-2xl font-bold text-white">20+</p>
                                    <p className="text-sm text-gray-400">Anos de Experiência</p>
                                </div>
                                <div className="bg-[#151d38]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-2xl font-bold text-white">Caixa</p>
                                    <p className="text-sm text-gray-400">Ex-Gerente de Alienação</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content/Modules Section */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                            O Que Você Vai Aprender
                        </h2>
                        <p className="text-gray-400">
                            Um programa completo que vai do básico ao avançado, preparando você para atuar com confiança no mercado de leilões.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {modules.map((module, index) => (
                            <div key={index} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {module.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                    {module.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {module.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0b1021] to-[#151d38]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 rounded-3xl p-12 backdrop-blur-md">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                            Pronto para alavancar sua carreira?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Não perca a oportunidade de dominar um dos nichos mais lucrativos do mercado imobiliário.
                        </p>
                        <button
                            onClick={handleCtaClick}
                            className="px-10 py-5 bg-white text-blue-900 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1"
                        >
                            Garantir Minha Vaga Agora
                        </button>
                        <p className="mt-6 text-sm text-gray-400">
                            * Vagas limitadas para garantir a qualidade do suporte.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CourseImoveis;
