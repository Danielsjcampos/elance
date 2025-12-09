import React from 'react';
import {
    CheckCircle2,
    ArrowRight,
    Download,
    MessageSquare,
    Calendar,
    Search,
    Home,
    Hammer,
    DollarSign,
    GraduationCap,
    Users
} from 'lucide-react';
import SEO from './components/SEO';

const Mentoria = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
            <SEO
                title="Mentoria Trilha do Arrematante"
                description="Mentoria Trilha do Arrematante. Acompanhamento personalizado para arrematar seu primeiro imóvel em leilão com segurança e lucro garantido."
            />
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507668077129-56e32842fceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NTEzfDB8MXxzZWFyY2h8MTN8fGNvbnN1bHRpbmd8ZW58MHx8fHwxNzU5MTIyNTY4fDA&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-sm mb-6 animate-fade-in-up">
                        Mentoria Exclusiva
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up delay-100">
                        Mentoria: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Trilha do Arrematante
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200">
                        Isso não é apenas um curso sobre leilões. A única mentoria de acompanhamento personalizado para você arrematar imóveis em leilão com clareza, desocupar com segurança e revender com lucro.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                        <a
                            href="https://wa.me/5514998536254?text=Quero%20saber%20mais%20sobre%20a%20Mentoria%20Trilha%20do%20Arrematante"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all text-lg flex items-center justify-center gap-2 group"
                        >
                            Quero fazer parte
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section className="py-20 bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-2xl"></div>
                            <img
                                src="https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NTEzfDB8MXxzZWFyY2h8Nnx8Y29uc3VsdGluZ3xlbnwwfHx8fDE3NTkxMjI1Njh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                                alt="Aprenda fazendo"
                                className="relative rounded-2xl shadow-xl border border-slate-700 w-full object-cover aspect-[4/3]"
                            />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-white mb-4">Aprenda fazendo</h2>
                            <h3 className="text-xl text-blue-400 mb-6">Vamos arrematar um imóvel juntos, do garimpo à revenda.</h3>
                            <div className="space-y-4 text-slate-300 leading-relaxed">
                                <p>
                                    Você participa de cada etapa: escolha do leilão, pesquisa de mercado, análise do edital, disputa, contratação, registro, desocupação do imóvel, reforma e revenda (ou aluguel).
                                </p>
                                <p>
                                    O imóvel é registrado em seu nome e todo lucro fica para você.
                                </p>
                                <p className="font-semibold text-white">
                                    A mentoria só termina quando o imóvel for vendido ou alugado.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps List Section */}
            <section className="py-20 bg-slate-800/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">O que vamos fazer, lado a lado</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                number: "01",
                                title: "Tese & Planejamento",
                                desc: "Perfil, objetivos, capacidade de aporte e tese (tipo de imóvel, região, ticket-alvo)."
                            },
                            {
                                number: "02",
                                title: "Garimpo de oportunidades",
                                desc: "Busca ativa em plataformas de leilão extrajudicial, triagem e shortlist."
                            },
                            {
                                number: "03",
                                title: "Due Diligence completa",
                                desc: "Edital, laudo, valor de mercado, matrícula, processos, débitos e viabilidade."
                            },
                            {
                                number: "04",
                                title: "Estratégia de lances",
                                desc: "Teto, passos, gatilhos e cronograma; habilitação nas plataformas."
                            },
                            {
                                number: "05",
                                title: "Participação no leilão",
                                desc: "Acompanhamento em tempo real e decisão conjunta durante a disputa."
                            },
                            {
                                number: "06",
                                title: "Compra em sociedade",
                                desc: "Aquisição proporcional ao aporte, regras de governança e rateio de custos/resultados."
                            },
                            {
                                number: "07",
                                title: "Pós-compra & Posse",
                                desc: "Plano de desocupação amigável e taxa de ocupação quando aplicável."
                            },
                            {
                                number: "08",
                                title: "Reforma & Valor",
                                desc: "Escopo inteligente (o que fazer / não fazer), orçamentos e controle de custos."
                            },
                            {
                                number: "09",
                                title: "Venda & Liquidação",
                                desc: "Precificação, divulgação, negociação e distribuição de lucros."
                            }
                        ].map((step, idx) => (
                            <div key={idx} className="bg-slate-900 border border-slate-700/50 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
                                <div className="text-4xl font-bold text-slate-700 mb-4">{step.number}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deliverables Section */}
            <section className="py-20 bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-slate-700/50 rounded-2xl p-8 md:p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full"></div>

                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-8">O que você recebe</h2>
                                <ul className="space-y-4">
                                    {[
                                        "Acesso ao meu método, planilhas e checklists",
                                        "Dossiê de cada oportunidade (riscos, custos, margem, cenários)",
                                        "Planilha de viabilidade (capex, custos, preço, ROI)",
                                        "Roteiros e minutas operacionais (ocupante, reforma, venda)",
                                        "Acompanhamento até a revenda (ou locação)"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-slate-300">
                                            <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NTEzfDB8MXxzZWFyY2h8MjV8fGNvbnN1bHRpbmd8ZW58MHx8fHwxNzU5MTIyNTY4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                                    alt="Materiais"
                                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mentoria Structure */}
            <section className="py-20 bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            É assim que organizamos a <br />
                            <span className="text-blue-400">Mentoria "Trilha do Arrematante"</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <MessageSquare className="w-10 h-10 text-blue-400" />,
                                title: "Acompanhamento diário",
                                desc: "Acesso direto a um especialista para tirar dúvidas e receber orientação durante todo o período."
                            },
                            {
                                icon: <Users className="w-10 h-10 text-purple-400" />,
                                title: "Reunião de diagnóstico",
                                desc: "Encontro individual para entender seu momento e definir o caminho mais adequado para você."
                            },
                            {
                                icon: <Search className="w-10 h-10 text-emerald-400" />,
                                title: "Análise de pré-leilão",
                                desc: "Nosso time revisa com você o seu primeiro arremate e entrega um documento com riscos e oportunidades."
                            },
                            {
                                icon: <Home className="w-10 h-10 text-orange-400" />,
                                title: "Assessoria na desocupação",
                                desc: "Utilizamos nossos modelos de notificações para desocupação e cobrança de taxa de ocupação."
                            },
                            {
                                icon: <Hammer className="w-10 h-10 text-cyan-400" />,
                                title: "Assessoria na reforma",
                                desc: "Orientamos o que fazer no imóvel e indicamos profissionais."
                            },
                            {
                                icon: <DollarSign className="w-10 h-10 text-yellow-400" />,
                                title: "Assessoria na venda",
                                desc: "Auxiliamos na divulgação do imóvel e contratação de imobiliárias."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-800/50 p-6 rounded-xl hover:bg-slate-800 transition-colors border border-slate-700/50">
                                <div className="bg-slate-900/50 w-16 h-16 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bonus Section */}
            <section className="py-20 bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Bônus Exclusivos</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Ao contratar a Mentoria <strong className="text-white">"Trilha do Arrematante"</strong> você recebe 2 bônus gratuitamente:
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[
                            {
                                title: "Bônus 01",
                                desc: "Curso para arrematantes de imóveis",
                                image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/5a1bc58ef391456a8315e6e2bdf17ae3"
                            },
                            {
                                title: "Bônus 02",
                                desc: "Curso para compra de imóveis da Caixa",
                                image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/976b8d7a0b4b4b57a1c6fb55d0e7ca38"
                            }
                        ].map((bonus, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-2xl aspect-video border border-slate-700/50">
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${bonus.image})` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6">
                                    <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">GRÁTIS</div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{bonus.title}</h3>
                                    <p className="text-slate-300">{bonus.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Examples/Proof Section */}
            <section className="py-20 bg-slate-800/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Exemplos de arrematações lucrativas</h2>
                        <p className="text-slate-400">Temos metodologia prática de quem já arrematou mais de 70 imóveis.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Sobrado em Perús",
                                profit: "Lucro de R$ 413.200,00",
                                image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/ea74ac01b0964de0a3411299f5f03e9b",
                                link: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/013ad34868be4cb6afbd5a6430c728ef?fileName=Matricula143364.pdf",
                                btnText: "Ver Matrícula"
                            },
                            {
                                title: "Terreno em Bauru",
                                profit: "Lucro de R$ 263.250,00",
                                image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/c98a88bfff4b4ce0b4d28f7dbc9763ae",
                                link: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/d14a4f96a271426892ffd31768a040de?fileName=Matrículas2.pdf",
                                btnText: "Ver Matrículas"
                            },
                            {
                                title: "Terreno em Bauru",
                                profit: "Lucro de R$ 81.454,30",
                                image: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/b2bde093c85a468a89bd67740cb0ff46",
                                link: "https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/8e72a6f3e46741458e26c4189f0cd3d3?fileName=Matriculas.pdf",
                                btnText: "Ver Matrículas"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all group">
                                <div className="h-48 overflow-hidden relative">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${item.image})` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-green-400 font-semibold mb-6">{item.profit}</p>
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                                    >
                                        <Download className="w-4 h-4" />
                                        {item.btnText}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/39/lIZrwvbeRuuzqOoWJUEn_Photoaday_CSD%20%281%20of%201%29-5.jpg?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NTEzfDB8MXxzZWFyY2h8M3x8Y29uc3VsdGluZ3xlbnwwfHx8fDE3NTkxMjI1Njh8MA&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-fixed bg-center">
                    <div className="absolute inset-0 bg-blue-900/90 mix-blend-multiply"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">É hora de partir para a prática.</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        A mentoria Trilha do Arrematante foi feita pra quem quer parar de acumular teoria e começar a arrematar com lucro e segurança. Não tem enrolação. Tem plano, time e ação.
                    </p>
                    <a
                        href="https://wa.me/5514998536254?text=Quero%20fazer%20parte%20da%20Mentoria%20Trilha%20do%20Arrematante"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors text-lg shadow-xl"
                    >
                        Quero fazer parte agora
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                </div>
            </section>

            {/* Instructor Section */}
            <section className="py-20 bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative order-2 md:order-1">
                            <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
                            <img
                                src="https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/bfdc92faaf784b049c3f2a18dc38ab3b"
                                alt="Jerônimo Pompeu"
                                className="relative rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md mx-auto"
                            />
                        </div>

                        <div className="order-1 md:order-2">
                            <h2 className="text-sm font-bold tracking-wider text-blue-500 uppercase mb-2">Com quem você vai aprender</h2>
                            <h3 className="text-3xl font-bold text-white mb-6">JERÔNIMO POMPEU</h3>

                            <div className="prose prose-invert text-slate-300">
                                <p className="mb-4">
                                    Com mais de 21 anos de atuação no segmento de leilões, seja como gerente de leilões da Caixa Econômica Federal, como arrematante ou como leiloeiro, Jerônimo Pompeu é uma das maiores autoridades em leilões no Brasil.
                                </p>
                                <ul className="space-y-2 list-none pl-0">
                                    <li className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-400 shrink-0" />
                                        Mais de 70 imóveis arrematados
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-400 shrink-0" />
                                        Graduado em Comunicação pela USP
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-400 shrink-0" />
                                        Pós-graduado em Direito Imobiliário
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-400 shrink-0" />
                                        MBA em Gestão de Empresas pela FGV
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-400 shrink-0" />
                                        Ex-Gerente de leilões da CAIXA
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Contact Form Equivalent */}
            <section className="py-20 bg-slate-800/30">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ficou com alguma dúvida?</h2>
                    <p className="text-slate-400 mb-8">Nossa equipe está pronta para te atender.</p>
                    <a
                        href="https://wa.me/5514998536254?text=Tenho%20d%C3%BAvidas%20sobre%20a%20Mentoria"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors border border-slate-600"
                    >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Falar com a equipe
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Mentoria;
