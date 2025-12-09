import React from 'react';
import { Download, ExternalLink, MessageCircle } from 'lucide-react';
import SEO from './SEO';

const Downloads = () => {
    const materials = [
        {
            title: "Modelo de Notificação para Desocupação",
            subtitle: "(Aula 07 do Curso)",
            description: "Baixe gratuitamente o modelo de notificação utilizado na prática para auxiliar na desocupação de imóveis arrematados.",
            image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/6dcd2f456d084d36b3d7920e8e6c5602",
            link: "https://docs.google.com/document/d/1kneaZF_abcARsTxnkvW6aeE9pfWldIs9/edit?usp=sharing&ouid=114217286595897557821&rtpof=true&sd=true",
            buttonText: "Baixar Modelo"
        },
        {
            title: "Planilha Financeira de Imóvel Arrematado",
            subtitle: "(Aula 10 do Curso)",
            description: "Planilha prática para calcular valores investidos, custos adicionais e rentabilidade em imóveis adquiridos em leilão.",
            image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/81a0cd885aff40a9af6965b2a347595c",
            link: "https://docs.google.com/spreadsheets/d/1MsWLaIn4_rDDrHg4j-cLadw9ezrmB2lP/edit?usp=sharing&ouid=114217286595897557821&rtpof=true&sd=true",
            buttonText: "Baixar Planilha"
        },
        {
            title: "Lista de Fornecedores de Materiais de Construção",
            subtitle: "Venda Direta da Indústria",
            description: "Lista de fornecedores para compra de materiais de construção com preços diferenciados.",
            image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/5dcd3b3758af44989057208d483a7e90",
            link: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/11204755794c4c229adc6ef960cd1152?fileName=Fornecedores.docx",
            buttonText: "Baixar Lista"
        }
    ];

    const whatsappGroups = [
        {
            title: "Grupo Gratuito de Ofertas em Leilão",
            subtitle: "Oportunidades Diárias",
            description: "Receba diariamente oportunidades de imóveis, veículos e outros bens de leilão direto no seu WhatsApp.",
            image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/feed15a593c74afe9abefb6b1cf9ffe7",
            link: "https://chat.whatsapp.com/FoB4JeyMeKV1ZvGb9y7Liq?mode=ems_copy_c",
            buttonText: "Entrar no Grupo Gratuito"
        },
        {
            title: "Grupo VIP de Ofertas em Leilão (Pago)",
            subtitle: "Exclusividade e Curadoria",
            description: "Tenha acesso às melhores ofertas antes de todo mundo, com informações exclusivas, análises e curadoria especializada.",
            image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/fa366eee852f44c5bb6ebad7297a3d30",
            link: "https://chat.whatsapp.com/JBZGMOqpUTH5S4I5zNbUwY?mode=ems_copy_c",
            buttonText: "Entrar no Grupo VIP"
        },
        {
            title: "Grupo sobre Carreira de Leiloeiro",
            subtitle: "Dicas e Orientações",
            description: "Se você sonha em se tornar leiloeiro oficial, entre no nosso grupo e receba dicas, orientações jurídicas e informações sobre a profissão.",
            image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/7c011721951d4e82bb846a72f2c3d030",
            link: "https://chat.whatsapp.com/GfseHcZZldTFcjx0CiEKYV",
            buttonText: "Entrar no Grupo de Leiloeiros"
        }
    ];

    return (
        <div className="bg-slate-950 min-h-screen text-white pt-20">
            <SEO
                title="Downloads e Materiais Gratuitos"
                description="Acesse planilhas, modelos de documentos e listas exclusivas para arrematantes e leiloeiros. Tudo gratuito na Escola E-Lance."
            />
            {/* Hero Section */}
            <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-b border-white/10 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NTEzfDB8MXxzZWFyY2h8MTh8fGNvbnN1bHRpbmd8ZW58MHx8fHwxNzU2Mzc0NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <div className="inline-block p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
                        <Download className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                        Área de Downloads da Escola E-Lance
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-4">
                        Aqui reunimos materiais exclusivos para você.
                    </p>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Se você deseja aprender mais sobre leilões, receber oportunidades em primeira mão ou até mesmo seguir carreira como leiloeiro oficial, está no lugar certo.
                    </p>
                </div>
            </div>

            {/* Materials Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                    <div className="h-8 w-1 bg-amber-500 rounded-full" />
                    <h2 className="text-2xl font-bold">Materiais para Download</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {materials.map((item, index) => (
                        <div key={index} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:bg-white/10 flex flex-col h-full">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-60" />
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-amber-500 text-sm font-medium mb-2">{item.subtitle}</p>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-amber-400 transition-colors">{item.title}</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">
                                    {item.description}
                                </p>

                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-amber-500 hover:text-white border border-white/10 hover:border-amber-500 rounded-xl transition-all duration-300 text-center font-medium group-hover:shadow-lg group-hover:shadow-amber-500/20"
                                >
                                    <Download className="w-4 h-4" />
                                    {item.buttonText}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* WhatsApp Groups Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-900/50">
                <div className="flex items-center gap-3 mb-10">
                    <div className="h-8 w-1 bg-green-500 rounded-full" />
                    <h2 className="text-2xl font-bold">Grupos de WhatsApp</h2>
                </div>

                <p className="text-gray-400 mb-10 max-w-2xl">
                    Entre para a comunidade e tenha acesso a informações e oportunidades únicas.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {whatsappGroups.map((group, index) => (
                        <div key={index} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:bg-white/10 flex flex-col h-full">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={group.image}
                                    alt={group.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-60" />
                                <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-md p-2 rounded-full border border-green-500/30">
                                    <MessageCircle className="w-5 h-5 text-green-500" />
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-green-400 text-sm font-medium mb-2">{group.subtitle}</p>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors">{group.title}</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">
                                    {group.description}
                                </p>

                                <a
                                    href={group.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-green-600 hover:text-white border border-white/10 hover:border-green-600 rounded-xl transition-all duration-300 text-center font-medium group-hover:shadow-lg group-hover:shadow-green-500/20"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    {group.buttonText}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default Downloads;
