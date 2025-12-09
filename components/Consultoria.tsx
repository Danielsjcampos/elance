import React from 'react';
import { ArrowRight, ShoppingBag, Info } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import SEO from './SEO';

const Consultoria: React.FC = () => {
    const { openModal } = useModal();
    const products = [
        {
            title: "Aprovação de Financiamento",
            price: "R$ 500,00",
            image: "https://mercadoeconsumo.com.br/wp-content/uploads/2023/04/caixa-credito-1000x570-1.jpg",
            label: null,
            description: "Análise e aprovação de crédito imobiliário."
        },
        {
            title: "Consulta: Compro ou não compro?",
            price: "R$ 250,00",
            image: "https://vbmc.com.br/wp-content/uploads/2020/12/consultoria-empresarial-o-que-e-tipos-e-interacoes-2048x1363.jpg",
            label: null,
            description: "Parecer rápido sobre a viabilidade do negócio."
        },
        {
            title: "Consulta: Check-up total",
            price: "R$ 800,00",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600",
            label: "MAIS COMPLETA",
            description: "Análise completa do processo e do imóvel."
        },
        {
            title: "Consultoria de 1 hora",
            price: "R$ 800,00",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
            label: "TEMA LIVRE",
            description: "Reunião online para tirar dúvidas específicas."
        },
        {
            title: "Mentoria / Trilha do Arrematante",
            price: "R$ 20.000,00",
            image: "/prod-mentoria.jpg",
            label: "TRILHA DO ARREMATANTE",
            description: "Acompanhamento completo do zero ao arremate."
        }
    ];

    return (
        <div className="bg-[#eff0f1]">
            <SEO
                title="Consultoria Especializada"
                description="Assessoria completa para arrematação de imóveis. Análise de risco, financiamento, checklist jurídico e suporte até a posse."
            />
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 w-full h-full">
                    <div className="absolute inset-0 bg-black/60 z-10"></div>
                    <img
                        src="/hero-consultoria.jpg"
                        alt="Consultoria Hero"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 drop-shadow-lg">
                        Consultoria Especializada
                    </h1>

                    <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                        Soluções sob medida para garantir segurança e lucratividade em seus arremates.
                    </p>
                </div>
            </section>

            {/* Products Grid Section */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#151d38] mb-4">Escolha o seu Plano</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Serviços desenhados para cada etapa da sua jornada de investimento.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col ${index === 4 ? 'md:col-span-2 lg:col-span-4 max-w-3xl mx-auto w-full' : ''}`}
                            >
                                {product.label && (
                                    <div className="absolute top-0 left-0 bg-[#151d38] text-white text-xs font-bold px-3 py-1 z-10 rounded-br-lg uppercase tracking-wider">
                                        {product.label}
                                    </div>
                                )}

                                <div className={`relative ${index === 4 ? 'h-64' : 'h-48'}`}>
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow text-center">
                                    <h3 className="text-xl font-bold text-[#151d38] mb-2">{product.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4 flex-grow">{product.description}</p>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-[#3a7ad1] font-bold text-2xl mb-4">{product.price}</p>
                                        <button
                                            onClick={() => openModal(`Consultoria - ${product.title}`)}
                                            className="w-full py-3 px-4 rounded-xl bg-[#151d38] text-white font-bold hover:bg-[#3a7ad1] transition-colors duration-300 flex items-center justify-center gap-2"
                                        >
                                            <Info size={18} />
                                            Saiba Mais
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#151d38] rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px]"></div>
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full filter blur-[100px]"></div>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Precisa de algo personalizado?</h2>
                            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                                Entre em contato com nossa equipe para entender qual a melhor solução para o seu perfil de investidor.
                            </p>
                            <a
                                href="#contact"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[#151d38] bg-white rounded-full shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                Falar no WhatsApp
                                <ArrowRight className="ml-2" size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Consultoria;
