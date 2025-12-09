import React from 'react';
import { CONTACT_INFO } from '../constants';
import { ArrowRight, Check, CheckCircle2, Award, Users, Globe, Building2, Briefcase, FileText, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import SEO from './SEO';

// Specific data for Franchise for Lawyers based on HTML dump
const LAWYER_FRANCHISE_BENEFITS = [
  {
    title: "Suporte",
    description: "Ao vivo no Zoom para tirar todas as dúvidas e acompanhar processos.",
    icon: <Globe size={28} />
  },
  {
    title: "Comunidade",
    description: "Networking exclusivo de franqueados e troca de experiências.",
    icon: <Users size={28} />
  },
  {
    title: "Experiência",
    description: "Mais de 21 anos no mercado de leilões com know-how validado.",
    icon: <Award size={28} />
  }
];

const SEGMENTS = [
  { title: "Leilões TJSP", desc: "Preste serviços a todas as varas judiciais da sua região e faça parcerias.", img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600" },
  { title: "Leilões de Bancos", desc: "Realize leilões de imóveis retomados para grandes bancos.", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600" },
  { title: "Leilões TRT", desc: "Documentação e carência para credenciamento junto aos Tribunais do Trabalho.", img: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?auto=format&fit=crop&q=80&w=600" },
  { title: "Leilões de Empresas", desc: "Atenda loteadoras e construtoras em casos de retomada de imóvel.", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600" },
  { title: "Leilões de Particulares", desc: "Proprietários podem contratar seus serviços. Parcerias com imobiliárias.", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600" },
  { title: "Leilões do Detran", desc: "Leilões de veículos apreendidos prestados por leiloeiros credenciados.", img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=600" },
];

const METHODOLOGY_STEPS = [
  { id: "01", title: "Baixo custo de investimento", desc: "Apenas computador e internet. Sem custo fixo mensal elevado. Atuação Home Office." },
  { id: "02", title: "Alto retorno", desc: "Comissões de até 5% sobre valores milionários de imóveis." },
  { id: "03", title: "Treinamento constante", desc: "Equipe responsável por todo treinamento operacional e manual completo." },
  { id: "04", title: "Modelos de Documentos", desc: "Editais, petições, contratos, fichas cadastrais e mais prontos para uso." },
];

const FRANCHISE_FAQ = [
  { q: "Quanto custa a Franquia?", a: "Entre em contato com a nossa equipe para saber os valores do investimento." },
  { q: "Qual é o valor dos royalties?", a: "Entre em contato com a nossa equipe para saber o valor das taxas." },
  { q: "Posso parcelar o pagamento da taxa?", a: "Não, o valor é pago integralmente no ato da contratação." },
  { q: "Não sei nada de leilões, consigo atuar?", a: "Sim, você receberá todo treinamento para operar no segmento milionário dos leilões." },
];

const Franchise: React.FC = () => {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);
  const { openModal } = useModal();

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Franquia para Advogados"
        description="Franquia E-Lance para Advogados: Monte seu escritório de leilão oficial. Suporte jurídico, comercial e operacional para você faturar no mercado."
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#151d38]">
        {/* Abstract Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#3a7ad1] opacity-20 blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900 opacity-20 blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-block px-4 py-1 mb-6 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <span className="text-white text-xs font-bold tracking-widest uppercase">Franquia Exclusiva para Advogados</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-8 drop-shadow-2xl">
              Você já imaginou fazer um leilão e receber <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3a7ad1] to-white underline decoration-[#3a7ad1] decoration-4 underline-offset-8">
                R$ 1 milhão
              </span> de comissão?
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
              Com a sua franquia <strong className="text-white">E-lance</strong> isso é possível. Adquirindo nossa franquia você já pode começar a atuar no segmento milionário dos leilões de imóveis.
            </p>
            <a href={CONTACT_INFO.whatsappLink} onClick={(e) => { e.preventDefault(); openModal('Franchise - Hero CTA'); }} target="_blank" rel="noreferrer" className="group inline-flex items-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1">
              Quero adquirir minha franquia
              <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Why Franchise? - Glass Cards */}
      <section className="py-24 bg-[#f8fafc] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#151d38]">Por que adquirir uma franquia de leilões?</h2>
            <div className="w-24 h-1.5 bg-[#3a7ad1] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LAWYER_FRANCHISE_BENEFITS.map((item, idx) => (
              <div key={idx} className="glass-card p-10 rounded-3xl flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 bg-white">
                <div className="w-20 h-20 bg-[#eff0f1] rounded-2xl flex items-center justify-center text-[#3a7ad1] mb-6 shadow-inner">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#151d38] mb-3">{item.title}</h3>
                <p className="text-gray-600 font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segments Grid - Bento Style */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#151d38] mb-4">Veja em quais segmentos você pode atuar</h2>
            <p className="text-gray-600 max-w-2xl">Amplie sua carteira de clientes com nossa franquia dedicada a advogados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SEGMENTS.map((seg, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-2xl h-80 shadow-lg cursor-pointer">
                <div className="absolute inset-0 bg-gray-900/40 group-hover:bg-gray-900/60 transition-colors z-10"></div>
                <img src={seg.img} alt={seg.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                  <h3 className="text-white text-2xl font-bold mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{seg.title}</h3>
                  <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">{seg.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section - Glass Dark */}
      <section className="py-24 bg-[#151d38] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3a7ad1] opacity-10 blur-[150px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Atuar Sozinho vs. Franquia E-Lance</h2>
            <p className="text-gray-400 mt-4">Entenda os motivos para escolher o caminho certo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 text-red-400 flex items-center gap-2">
                <Building2 /> Atuar Sozinho
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex gap-3"><span className="text-red-400 font-bold">•</span> Custo de registro na Junta Comercial mais alto</li>
                <li className="flex gap-3"><span className="text-red-400 font-bold">•</span> Dificuldade burocrática de registro</li>
                <li className="flex gap-3"><span className="text-red-400 font-bold">•</span> Tempo de atividade zero (dificulta TJSP/TRT)</li>
                <li className="flex gap-3"><span className="text-red-400 font-bold">•</span> Nenhuma experiência prévia</li>
              </ul>
            </div>

            <div className="glass-card-dark p-8 rounded-3xl transform md:-translate-y-4 border border-[#3a7ad1]/50 relative">
              <div className="absolute -top-3 -right-3">
                <span className="flex h-6 w-6 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3a7ad1] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-[#3a7ad1]"></span>
                </span>
              </div>
              <h3 className="text-xl font-bold mb-6 text-[#3a7ad1] flex items-center gap-2">
                <Briefcase /> Adquirir Franquia E-Lance
              </h3>
              <ul className="space-y-4 text-white">
                <li className="flex gap-3"><CheckCircle2 className="text-[#3a7ad1]" size={20} /> Custos e burocracia já resolvidos</li>
                <li className="flex gap-3"><CheckCircle2 className="text-[#3a7ad1]" size={20} /> Longo tempo de atividade da marca</li>
                <li className="flex gap-3"><CheckCircle2 className="text-[#3a7ad1]" size={20} /> Facilidade em novos credenciamentos</li>
                <li className="flex gap-3"><CheckCircle2 className="text-[#3a7ad1]" size={20} /> Mais de 21 anos de experiência</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Steps */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#151d38] text-center mb-16">
            Uma metodologia validada <span className="text-[#3a7ad1] underline">para você seguir</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {METHODOLOGY_STEPS.map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex items-start gap-6">
                <div className="text-4xl font-black text-[#3a7ad1]/20">{step.id}</div>
                <div>
                  <h3 className="text-xl font-bold text-[#151d38] mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jerônimo Pompeu Section */}
      <section className="py-24 relative overflow-hidden bg-[#151d38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-[#3a7ad1] rounded-3xl transform rotate-6 opacity-30"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src="/mentor-jeronimo.jpg"
                    alt="Jerônimo Pompeu"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 text-white">
              <div className="inline-block px-3 py-1 bg-[#3a7ad1] rounded text-xs font-bold uppercase mb-4">Mentor</div>
              <h2 className="text-4xl font-bold mb-2">Jerônimo Pompeu</h2>
              <p className="text-xl text-gray-400 mb-6">Com quem você vai aprender</p>
              <div className="space-y-4 text-gray-300">
                <p>Com mais de 21 anos de atuação no segmento de leilões, seja como gerente de leilões da Caixa Econômica Federal, como arrematante ou como leiloeiro.</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><Award size={16} className="text-[#3a7ad1]" /> Gerente do setor de leilões da Caixa por 5 anos</li>
                  <li className="flex items-center gap-2"><Award size={16} className="text-[#3a7ad1]" /> MBA em Gestão de Empresas pela FGV</li>
                  <li className="flex items-center gap-2"><Award size={16} className="text-[#3a7ad1]" /> Perito Judicial e Avaliador</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Included */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#151d38]">Todo o material necessário</h2>
            <p className="text-gray-600 mt-2">Segurança jurídica e operacional para o seu negócio.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#eff0f1] p-8 rounded-3xl text-center hover:bg-[#3a7ad1] hover:text-white transition-colors duration-300 group">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[#151d38]">
                <FileText size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3">Modelos de Documentos</h3>
              <p className="text-gray-500 group-hover:text-blue-100 text-sm">Petições, editais, contratos e autos de arrematação.</p>
            </div>
            <div className="bg-[#eff0f1] p-8 rounded-3xl text-center hover:bg-[#3a7ad1] hover:text-white transition-colors duration-300 group">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[#151d38]">
                <Building2 size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3">Manuais de Operação</h3>
              <p className="text-gray-500 group-hover:text-blue-100 text-sm">Manuais completos de implantação e gestão.</p>
            </div>
            <div className="bg-[#eff0f1] p-8 rounded-3xl text-center hover:bg-[#3a7ad1] hover:text-white transition-colors duration-300 group">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[#151d38]">
                <TrendingUp size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3">Planilhas Excel</h3>
              <p className="text-gray-500 group-hover:text-blue-100 text-sm">Simulações financeiras, royalties e lucratividade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#151d38] text-center mb-12">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {FRANCHISE_FAQ.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-[#151d38] hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  {activeFaq === index ? <ChevronUp size={20} className="text-[#3a7ad1]" /> : <ChevronDown size={20} className="text-[#3a7ad1]" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? 'max-h-48' : 'max-h-0'}`}>
                  <div className="p-6 pt-0 text-gray-600 bg-gray-50/50">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-[#3a7ad1] to-[#151d38] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Pronto para começar?</h2>
          <p className="text-xl mb-10 text-blue-100">Seja pioneiro no mercado de leilões jurídicos com nossa franquia.</p>
          <a
            href={CONTACT_INFO.whatsappLink}
            onClick={(e) => { e.preventDefault(); openModal('Franchise - Footer CTA'); }}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-10 py-5 bg-white text-[#151d38] font-bold rounded-full shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all"
          >
            Falar com um consultor agora
          </a>
        </div>
      </section>
    </div>
  );
};

export default Franchise;