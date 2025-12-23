import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import SEO from './SEO';

interface HeroProps {
  onNavigate: (pageId: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { openModal } = useModal();
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#151d38] pt-20">
      <SEO
        title="Início"
        description="Descubra o E-Lance: Cursos para leiloeiros, franquias de leilão, formação para advogados e corretores, e consultoria de arrematação."
      />

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#3a7ad1] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#3a7ad1]/30 bg-[#3a7ad1]/10 backdrop-blur-md shadow-lg shadow-[#3a7ad1]/10">
              <span className="flex h-2 w-2 relative mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3a7ad1] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3a7ad1]"></span>
              </span>
              <span className="text-[#3a7ad1] font-bold text-xs tracking-widest uppercase">Ecossistema Completo</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
              O Futuro dos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3a7ad1] via-blue-400 to-white">
                Leilões
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed border-l-2 border-[#3a7ad1] pl-6 bg-gradient-to-r from-white/5 to-transparent py-2 rounded-r-lg">
              Ecossistema E-lance: Formação, franquia, tecnologia e consultoria reunidos em um único modelo de negócio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#franchise"
                onClick={(e) => { e.preventDefault(); onNavigate('franchise'); }}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
              >
                Conheça a Franquia
                <ArrowRight className="ml-2" size={20} />
              </a>
              <a
                href="#about"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white border border-white/20 rounded-full hover:bg-white/10 backdrop-blur-sm transition-all"
              >
                <PlayCircle className="mr-2" size={20} />
                Como funciona
              </a>
            </div>
          </div>

          <div className="relative hidden lg:block perspective-1000">
            {/* Main Glass Card Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group transform transition-all duration-500 hover:rotate-y-6 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-t from-[#151d38] via-transparent to-transparent opacity-60 z-10"></div>
              <img
                src="/hero-team.jpg"
                alt="Modern Corporate Building"
                width="800"
                height="600"
                className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700"
              />

              {/* Overlay Text inside Image */}
              <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                <h3 className="text-2xl font-bold text-white mb-2">E-lance Leilões</h3>
                <p className="text-gray-300 text-sm">Tecnologia e expertise para resultados extraordinários.</p>
              </div>
            </div>

            {/* Floating Glass Stats Card */}
            <div className="absolute -top-10 -right-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl animate-float">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#3a7ad1] flex items-center justify-center text-white font-bold text-xl">
                  20+
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Anos de</p>
                  <p className="text-gray-300 text-sm">Experiência</p>
                </div>
              </div>
            </div>

            {/* Floating Glass Quote Card */}
            <div className="absolute -bottom-12 -left-12 bg-[#151d38]/80 backdrop-blur-xl border border-[#3a7ad1]/30 p-6 rounded-2xl shadow-2xl max-w-xs animate-float animation-delay-2000">
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#3a7ad1]"></div>)}
              </div>
              <p className="text-white font-medium text-sm leading-relaxed">
                "Transformamos leilões em oportunidades seguras e rentáveis."
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;