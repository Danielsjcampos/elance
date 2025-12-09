import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import SEO from './SEO';

const Escola: React.FC = () => {
    const { openModal } = useModal();

    const sections = [
        {
            title: "Para Arrematantes",
            description: "Cursos oferecidos:",
            gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            items: [
                {
                    title: "Imóveis",
                    description: "Curso para quem deseja arrematar imóveis",
                    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
                    category: "ARREMATANTE",
                    link: "https://escola.e-lance.com.br/curso-online/"
                },
                {
                    title: "Veículos",
                    description: "Curso para quem deseja arrematar veículos",
                    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600",
                    category: "VEÍCULOS",
                    link: "https://escola.e-lance.com.br/curso-online/"
                },
                {
                    title: "Imóveis da Caixa",
                    description: "Curso para quem deseja arrematar imóveis da Caixa",
                    image: "https://bancariosjau.org/wp-content/uploads/2024/07/caixaeconomicavenda-de-passagens.png",
                    category: "OPORTUNIDADE",
                    link: "https://escola.e-lance.com.br/curso-de-arrematantes-online-caixa/"
                },
                {
                    title: "Imóveis Comprei",
                    description: "Curso para quem deseja arrematar imóveis do Comprei (PGFN)",
                    image: "https://blog.leiloesjudiciais.com.br/wp-content/uploads/2022/05/Comprei-um-im%C3%B3vel-de-leil%C3%A3o-e-agora.jpg",
                    category: "JUDICIAL",
                    link: "https://escola.e-lance.com.br/curso-online/"
                },
                {
                    title: "Bens da Receita",
                    description: "Curso para quem deseja arrematar Iphone, eletrônicos e outros",
                    image: "https://imagens.ebc.com.br/vprUoM_eolaolujy8I2b8uCMPDY=/1170x700/smart/https://agenciabrasil.ebc.com.br/sites/default/files/thumbnails/image/mcam20022020-3.jpg?itok=AUfUX4Kk",
                    category: "DIVERSOS",
                    link: "https://escola.e-lance.com.br/curso-online/"
                }
            ]
        },
        {
            title: "Para Corretores",
            description: "Cursos oferecidos:",
            gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            items: [
                {
                    title: "Corretores e o Leilão",
                    description: "Curso para corretores que desejam vender ou comprar imóveis em Leilão",
                    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600",
                    category: "IMOBILIÁRIO"
                }
            ]
        },
        {
            title: "Para Leiloeiros",
            description: "A E-Lance é pioneira em oferecer formações completas tanto para quem ainda não é leiloeiro quanto para quem já exerce a profissão e deseja aprimorar suas técnicas.",
            highlight: true,
            gridCols: "grid-cols-1 md:grid-cols-2",
            items: [
                {
                    title: "Para quem já é leiloeiro",
                    description: "Curso avançado para profissionais que já atuam no mercado, mas querem evoluir em performance e resultados.",
                    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
                    category: "AVANÇADO"
                },
                {
                    title: "Para quem ainda não é leiloeiro",
                    description: "Indicado para pessoas que desejam ingressar na carreira de leiloeiro oficial, mas não sabem por onde começar.",
                    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=600",
                    category: "FORMAÇÃO"
                }
            ]
        },
        {
            title: "Para Advogados e Estudantes de Direito",
            description: "Cursos oferecidos:",
            gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            items: [
                {
                    title: "Assessor",
                    description: "Para quem deseja atuar em leilões, assessorando clientes e defendendo interesses processuais",
                    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=600",
                    category: "JURÍDICO"
                },
                {
                    title: "Estudante de direito",
                    description: "Para quem estuda Direito e gostaria de ampliar seus conhecimentos",
                    image: "https://images.unsplash.com/photo-1555374018-13a8994ab246?auto=format&fit=crop&q=80&w=600",
                    category: "ACADÊMICO"
                }
            ]
        }
    ];

    return (
        <div className="bg-[#eff0f1] min-h-screen">
            <SEO
                title="Escola de Leilões"
                description="Escola E-Lance: A maior formação do Brasil para o mercado de leilões. Cursos para arrematantes, leiloeiros, advogados e corretores."
            />
            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#151d38]/95 to-[#151d38]/80 z-10"></div>
                    <img
                        src="/hero-escola.jpg"
                        alt="Escola E-Lance"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-200 text-sm font-bold mb-6 backdrop-blur-sm border border-blue-400/30">
                        EDUCAÇÃO EXECUTIVA
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 drop-shadow-2xl">
                        Escola E-Lance
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                        A primeira escola do Brasil dedicada exclusivamente à formação de profissionais para o mercado de leilões.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 rounded-full bg-[#3a7ad1] text-white font-bold text-lg hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1"
                        >
                            Conheça Nossos Cursos
                        </button>
                    </div>
                </div>
            </section>

            {/* Courses Sections */}
            <div id="cursos" className="py-12 space-y-12">
                {sections.map((section, sIndex) => (
                    <section key={sIndex} className={`py-12 ${section.highlight ? 'bg-[#151d38] text-white' : ''}`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="mb-12">
                                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${section.highlight ? 'text-white' : 'text-[#151d38]'}`}>
                                    {section.title}
                                </h2>
                                <p className={`text-lg max-w-3xl ${section.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {section.description}
                                </p>
                            </div>

                            <div className={`grid gap-8 ${section.gridCols}`}>
                                {section.items.map((course, cIndex) => (
                                    <div
                                        key={cIndex}
                                        className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col
                                            ${section.highlight ? 'bg-[#1e2a4a] border border-gray-700' : 'bg-white border border-gray-100'}`}
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4 z-20">
                                                <span className={`px-2 py-1 text-xs font-bold rounded backdrop-blur-md
                                                    ${section.highlight ? 'bg-[#3a7ad1] text-white' : 'bg-[#151d38] text-white'}`}>
                                                    {course.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className={`text-xl font-bold mb-3 ${section.highlight ? 'text-white group-hover:text-[#3a7ad1]' : 'text-[#151d38] group-hover:text-[#3a7ad1]'} transition-colors`}>
                                                {course.title}
                                            </h3>
                                            <p className={`text-sm mb-6 flex-grow ${section.highlight ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {course.description}
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-gray-100/10">
                                                {course.link ? (
                                                    <a
                                                        href={course.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
                                                        ${section.highlight
                                                                ? 'bg-white text-[#151d38] hover:bg-[#3a7ad1] hover:text-white'
                                                                : 'bg-[#151d38] text-white hover:bg-[#3a7ad1]'}`}
                                                    >
                                                        Acessar
                                                        <ArrowRight size={18} />
                                                    </a>
                                                ) : (
                                                    <button
                                                        onClick={() => openModal(`Escola - ${course.title}`)}
                                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
                                                            ${section.highlight
                                                                ? 'bg-white text-[#151d38] hover:bg-[#3a7ad1] hover:text-white'
                                                                : 'bg-[#151d38] text-white hover:bg-[#3a7ad1]'}`}
                                                    >
                                                        Saiba Mais
                                                        <ArrowRight size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* CTA Section */}
            <section className="py-24 bg-white relative overflow-hidden border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#151d38] mb-8">
                        Não encontrou o que procurava?
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Nossa equipe pedagógica pode ajudar você a encontrar a melhor trilha de formação para o seu perfil.
                    </p>
                    <button
                        onClick={() => openModal('Escola - Interesse Geral')}
                        className="px-10 py-5 bg-[#151d38] text-white font-bold text-xl rounded-full shadow-lg hover:bg-[#3a7ad1] hover:scale-105 transition-all duration-300"
                    >
                        Falar com Consultor
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Escola;
