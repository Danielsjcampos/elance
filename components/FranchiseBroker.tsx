import React from 'react';
import { CONTACT_INFO, STATE_BONDS } from '../constants';
import { ArrowRight, CheckCircle2, XCircle, DollarSign, Building2, GraduationCap, Briefcase, Search } from 'lucide-react';
import SEO from './SEO';

const FranchiseBroker: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredStates = STATE_BONDS.filter(state =>
    state.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen font-sans text-[#151d38]">
      <SEO
        title="Franquia para Corretores"
        description="Corretor de Imóveis: Torne-se um Leiloeiro Oficial com a Franquia E-Lance. Transforme sua carreira e acesse o mercado de leilões judiciais."
      />

      {/* Hero Section - Pain Point Focus */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-[#151d38] text-white">
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-red-600/20 blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#3a7ad1]/20 blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-block px-4 py-1 mb-6 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-md">
                <span className="text-red-400 text-xs font-bold tracking-widest uppercase">Atenção Corretor</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                Você está vendendo <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                  o que sobra?
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                A Caixa vende imóveis em 5 etapas. Os melhores ficam com os leiloeiros.
                Os corretores só entram quando sobra. <strong className="text-white">Está na hora de mudar isso.</strong>
              </p>
              <a
                href={CONTACT_INFO.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] rounded-full shadow-lg hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1"
              >
                Quero atuar como Leiloeiro da Caixa
                <ArrowRight className="ml-2" size={20} />
              </a>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop"
                alt="Real Estate Broker"
                className="relative rounded-3xl shadow-2xl border border-white/10 z-10 transform rotate-2 hover:rotate-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Truth: 5 Stages */}
      <section className="py-24 bg-[#f8fafc] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#151d38]">Corretores só entram no fim da fila</h2>
            <p className="text-gray-600 mt-4 text-lg">Entenda o funil de vendas da Caixa Econômica Federal</p>
          </div>

          <div className="space-y-4">
            {[
              { stage: "1º Leilão", access: "Leiloeiro Exclusivo", status: "success", icon: CheckCircle2 },
              { stage: "2º Leilão", access: "Leiloeiro Exclusivo", status: "success", icon: CheckCircle2 },
              { stage: "Licitação Aberta", access: "Leiloeiro Exclusivo", status: "success", icon: CheckCircle2 },
              { stage: "Venda Online", access: "Aberto a corretores", status: "error", icon: XCircle },
              { stage: "Venda Direta Online", access: "Aberto a corretores", status: "error", icon: XCircle },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center p-6 rounded-2xl border transition-all duration-300 ${item.status === 'success'
                  ? 'bg-white border-green-100 shadow-sm hover:shadow-md hover:border-green-300'
                  : 'bg-gray-50 border-gray-200 opacity-75 grayscale hover:grayscale-0'
                  }`}
              >
                <div className={`mr-6 p-3 rounded-full ${item.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <item.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#151d38]">{item.stage}</h3>
                  <p className={`text-sm font-medium ${item.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {item.access}
                  </p>
                </div>
                {item.status === 'success' && (
                  <div className="hidden sm:block px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                    Alta Lucratividade
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-bold text-[#151d38] mb-2">Quem vende primeiro, vende melhor.</p>
            <p className="text-gray-600">Essas oportunidades não vão parar. A diferença é: você quer vender primeiro — como leiloeiro — ou depois, como corretor?</p>
          </div>
        </div>
      </section>

      {/* Solution: Why Become an Auctioneer */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#151d38] mb-4">Torne-se leiloeiro com a E-Lance</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Somos a única franquia do Brasil voltada exclusivamente para quem quer atuar como leiloeiro oficial.
              Você não precisa ter experiência prévia, nós cuidamos de tudo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Registro Oficial", desc: "Cuidamos de toda burocracia para seu registro na Junta Comercial.", icon: <Briefcase size={32} /> },
              { title: "Treinamento", desc: "Aprenda com quem já vendeu mais de 300 leilões e arrematou 70+ imóveis.", icon: <GraduationCap size={32} /> },
              { title: "Home Office", desc: "Trabalhe de onde quiser com nossa estrutura digital completa.", icon: <Building2 size={32} /> },
              { title: "Comissões Altas", desc: "Acesse comissões que podem ultrapassar R$ 1 milhão por leilão.", icon: <DollarSign size={32} /> }
            ].map((benefit, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-[#f8fafc] border border-transparent hover:border-[#3a7ad1]/30 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-[#3a7ad1] mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-[#151d38] mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Table Section */}
      <section className="py-24 bg-[#151d38] text-white relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-[#3a7ad1] blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">O que você precisa para se tornar Leiloeiro?</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              O primeiro passo é fazer sua inscrição como leiloeiro oficial na Junta Comercial do seu estado.
              Esse processo exige o pagamento de um depósito de caução (garantia), cujo valor varia conforme o estado.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-xl leading-5 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:border-white/50 focus:ring-0 sm:text-sm backdrop-blur-md transition-all"
                placeholder="Buscar seu estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Glass Table */}
          <div className="glass-card-dark rounded-3xl overflow-hidden border border-white/10">
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#151d38]/80 backdrop-blur-md sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6 text-sm font-bold text-gray-300 uppercase tracking-wider">Estado</th>
                    <th className="py-4 px-6 text-sm font-bold text-[#3a7ad1] uppercase tracking-wider text-right">Valor da Caução*</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStates.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-white font-medium">{item.state}</td>
                      <td className="py-4 px-6 text-gray-300 text-right font-mono">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#151d38]/50 text-center text-xs text-gray-500 border-t border-white/5">
              *Os valores são estimativas com base em exigências estaduais e podem variar.
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-300 mb-6">
              Caso tenha esta disponibilidade, você já pode ser um leiloeiro E-Lance. Assessoramos leiloeiros em todo o Brasil.
            </p>
            <a href={CONTACT_INFO.whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center px-8 py-3 bg-[#3a7ad1] text-white font-bold rounded-full hover:bg-[#2a61b0] transition-colors shadow-lg shadow-blue-500/30">
              Falar com consultor sobre meu estado
            </a>
          </div>
        </div>
      </section>

      {/* Authority Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 bg-[#f8fafc] rounded-3xl p-8 lg:p-12 border border-gray-100">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-[#151d38] mb-6">Treinamento com quem já viveu tudo na prática</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Todo o treinamento da E-Lance será conduzido pessoalmente por <strong>Jerônimo Pompeu</strong>, que traz uma bagagem única no mercado de leilões.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-gray-700">
                  <CheckCircle2 className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Ex-gerente da área de leilões da Caixa (conhece a "caixa preta")</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <CheckCircle2 className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Corretor credenciado Caixa desde 2009</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <CheckCircle2 className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Assessor de leiloeiros oficiais desde 2016</span>
                </li>
              </ul>
              <p className="italic text-[#3a7ad1] font-medium">
                "Você vai aprender com quem esteve nos dois lados: dentro e fora da Caixa."
              </p>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://storage.googleapis.com/production-hostgator-brasil-v1-0-3/873/1757873/wOfpXRsp/2322b175ccc74a82a1b310f3df6727eb"
                  alt="Jerônimo Pompeu"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#151d38] to-transparent p-8 pt-24">
                  <p className="text-white font-bold text-xl">Jerônimo Pompeu</p>
                  <p className="text-blue-300 text-sm">Mentor e Especialista</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-[#3a7ad1] to-[#151d38] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight">
            Você prefere continuar vendendo o que sobra ou quer vender primeiro?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            A hora de mudar é agora. Vire o jogo. Atue como leiloeiro oficial e tenha acesso aos melhores imóveis desde a 1ª etapa.
          </p>
          <a
            href={CONTACT_INFO.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-10 py-5 bg-white text-[#151d38] font-bold text-lg rounded-full shadow-2xl hover:bg-gray-50 hover:scale-105 transition-all"
          >
            Quero me tornar um leiloeiro agora
          </a>
        </div>
      </section>

    </div>
  );
};

export default FranchiseBroker;
