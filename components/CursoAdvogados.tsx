import React from 'react';
import { ArrowRight, CheckCircle2, BookOpen, User, Star, Calendar, Monitor, Award } from 'lucide-react';
import SEO from './SEO';

const CursoAdvogados: React.FC = () => {
    return (
        <div className="min-h-screen pt-20 bg-[#151d38] text-white overflow-x-hidden">
            <SEO
                title="Curso para Advogados"
                description="Curso de Leilões para Advogados. Domine o mercado judicial e extrajudicial. Amplie sua atuação e conquiste novos clientes na área imobiliária."
            />
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32 z-10">
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 backdrop-blur-md">
                            <span className="text-blue-300 font-semibold text-sm tracking-wide uppercase">Formação Exclusiva</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
                                Tudo que o futuro advogado
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                precisa saber sobre Leilão
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                            Você estuda Direito e gostaria de ampliar seus conhecimentos?
                            A <span className="text-blue-400 font-semibold">E-Lance</span> ensina como transformar os leilões em uma nova forma de advogar ou de comprar imóveis com desconto.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <a
                                href="https://pay.kiwify.com.br/INpEKpY"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-100 group-hover:opacity-90 transition-opacity" />
                                <span className="relative flex items-center">
                                    Inscreva-se Agora
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Learn Section (Section 3 Data) */}
            <section className="py-20 relative z-10">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            Por que aprender sobre leilões?
                        </span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {[
                            { title: "Formação completa", text: "Domine tanto os leilões judiciais (CPC) quanto os extrajudiciais (Lei nº 9.514/97), entendendo como cada um funciona na prática.", icon: BookOpen },
                            { title: "Aplicação imediata", text: "Veja como bancos, Caixa, PGFN e Receita Federal realizam alienações de imóveis e bens.", icon: Monitor },
                            { title: "Diferencial acadêmico", text: "Poucos estudantes conhecem esse campo — destaque-se em estágios, TCCs, provas e entrevistas.", icon: Star },
                            { title: "Oportunidades na carreira", text: "Abra caminhos para atuar em escritórios de advocacia, departamentos jurídicos, empresas ou até como consultor especializado.", icon: Award }
                        ].map((item, index) => (
                            <div key={index} className="group p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-200 transition-colors">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Curriculum (Section 4 Data) */}
            <section className="py-20 bg-black/20 z-10 relative">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
                        O que você vai aprender conosco
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {[
                            "Como funcionam os leilões judiciais e extrajudiciais",
                            "Alienações realizadas pela Justiça, bancos, Caixa, PGFN e Receita Federal",
                            "Como analisar editais e matrículas: riscos e cláusulas relevantes",
                            "Estratégias para atuação prática: da arrematação à revenda",
                            "Montagem de carteira de clientes e networking",
                            "Negociação e prática profissional: rapidez e ética"
                        ].map((item, index) => (
                            <div key={index} className="flex items-start p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-green-500/30 transition-colors group">
                                <CheckCircle2 className="h-6 w-6 text-green-500 mr-4 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Course Format (Section 2 Data) */}
            <section className="py-24 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto rounded-[2.5rem] p-10 md:p-16 border border-white/10 bg-gradient-to-br from-blue-900/40 to-[#151d38]/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />

                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white relative z-10">Formato do Curso Online</h2>
                        <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12 relative z-10">
                            {[
                                "Mesmo conteúdo do curso presencial",
                                "Tudo o que você precisa saber sobre leilões",
                                "Mais de 5 horas de conteúdo",
                                "Aulas separadas em módulos de 15 minutos",
                                "Assista quando quiser e onde quiser",
                                "Certificado digital de conclusão"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="h-2 w-2 rounded-full bg-blue-400 mr-4 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                                    <span className="text-lg text-gray-200">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Instructor (Section 7 Data) */}
            <section className="py-20 z-10 relative">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10">
                        <div className="w-full md:w-1/3 flex justify-center">
                            <div className="w-56 h-56 md:w-72 md:h-72 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center overflow-hidden border-8 border-white/5 shadow-2xl relative group">
                                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <img
                                    src="https://images.builderservices.io/s/cdn/v1.0/i/m?url=https%3A%2F%2Fstorage.googleapis.com%2Fproduction-hostgator-brasil-v1-0-3%2F873%2F1757873%2FwOfpXRsp%2F2322b175ccc74a82a1b310f3df6727eb&methods=resize%2C1000%2C5000"
                                    alt="Jerônimo Pompeu de Souza"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold tracking-wider uppercase">
                                Instrutor Expert
                            </div>
                            <h2 className="text-4xl font-bold mb-2 text-white">Jerônimo Pompeu de Souza</h2>
                            <p className="text-xl text-gray-400 mb-8 font-light">Especialista em Leilões & Fundador da E-Lance</p>

                            <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
                                <p className="flex gap-3"><span className="text-blue-500 font-bold">•</span> Ex-Gerente da Caixa Econômica Federal (2003–2008).</p>
                                <p className="flex gap-3"><span className="text-blue-500 font-bold">•</span> Corretor de Imóveis e fundador da Casa e Cia Imobiliária.</p>
                                <p className="flex gap-3"><span className="text-blue-500 font-bold">•</span> Arrematante profissional (+80 imóveis) e Consultor de leiloeiros (+300 processos).</p>
                                <p className="flex gap-3"><span className="text-blue-500 font-bold">•</span> MBA pela FGV e Pós em Direito Imobiliário pelo Damásio.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing/Offer (Sections 6 & 8 Data) */}
            <section className="py-24 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/10 skew-y-3 transform origin-bottom-left scale-110" />

                <div className="container mx-auto px-4 relative">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-white">Vantagens exclusivas</h2>
                    <p className="text-xl text-center text-blue-200 mb-16">Escolha a melhor opção para sua formação</p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
                        {/* Online Course */}
                        <div className="relative p-10 rounded-[2rem] bg-[#1a2342] border border-blue-500/50 shadow-[0_0_50px_-10px_rgba(30,58,138,0.5)] flex flex-col transform md:scale-105 z-10 hover:border-blue-400 transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg tracking-wider">
                                RECOMENDADO
                            </div>
                            <h3 className="text-3xl font-bold mb-2 text-white">Curso Online</h3>
                            <p className="text-blue-200 mb-8">Acesso imediato e vitalício</p>

                            <div className="mb-8 p-6 rounded-2xl bg-black/20 text-center border border-white/5">
                                <span className="text-lg text-gray-500 line-through block mb-1">De R$ 800,00</span>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-5xl font-bold text-white">R$ 400</span>
                                    <span className="text-xl text-gray-400 self-end mb-2">,00</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {["Acesso imediato e ilimitado", "Estude de onde estiver", "Certificado digital", "Networking com investidores", "Conteúdo direto ao ponto"].map((item, i) => (
                                    <li key={i} className="flex items-center text-gray-300">
                                        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 shrink-0">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="https://pay.kiwify.com.br/INpEKpY"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg text-center hover:shadow-lg hover:shadow-blue-600/30 transition-all hover:-translate-y-1"
                            >
                                Garantir minha vaga
                            </a>
                        </div>

                        {/* In Person Course */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col opacity-75 hover:opacity-100 transition-all hover:bg-white/10">
                            <h3 className="text-2xl font-bold mb-2 text-gray-300">Curso Presencial</h3>
                            <p className="text-gray-500 mb-6">Imersão completa</p>

                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-700 rounded-2xl bg-transparent min-h-[200px]">
                                <Calendar className="h-12 w-12 text-gray-600 mb-4" />
                                <p className="font-medium text-gray-300">Em breve novas turmas</p>
                                <p className="text-sm text-gray-500 mt-2">Acompanhe nossas redes sociais.</p>
                            </div>

                            <button disabled className="mt-8 w-full py-4 rounded-xl bg-white/5 text-gray-500 font-bold cursor-not-allowed border border-white/5">
                                Indisponível no momento
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Examples Section (Optional, Section 5 Data) */}
            <section className="py-20 border-t border-white/5 bg-[#111827]">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-12 text-gray-400">Exemplos reais de oportunidade</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="p-8 rounded-2xl hover:bg-white/5 transition-colors">
                            <h3 className="text-5xl font-bold text-green-500 mb-4 font-mono">90%</h3>
                            <p className="text-gray-400">Apartamentos vendidos abaixo da avaliação.</p>
                        </div>
                        <div className="p-8 rounded-2xl hover:bg-white/5 transition-colors border-l border-r border-white/5">
                            <h3 className="text-5xl font-bold text-blue-500 mb-4 font-mono">5%</h3>
                            <p className="text-gray-400">Entrada para financiar casas da Caixa em até 35 anos.</p>
                        </div>
                        <div className="p-8 rounded-2xl hover:bg-white/5 transition-colors">
                            <h3 className="text-5xl font-bold text-purple-500 mb-4">$$$</h3>
                            <p className="text-gray-400">Terrenos e salas comerciais revendidos com lucro.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CursoAdvogados;
