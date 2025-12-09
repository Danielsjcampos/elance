import React from 'react';
import { Layers, Zap, ShieldCheck, TrendingUp } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#151d38] mb-4">
            O Ecossistema E-lance
          </h2>
          <div className="h-1 w-20 bg-[#3a7ad1] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Com mais de 20 anos de experiência, criamos o primeiro ecossistema completo de leilões do Brasil,
            reunindo formação, franquia, tecnologia e consultoria em um único modelo.
          </p>
        </div>

        {/* Institutional Video */}
        <div className="max-w-4xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
          <div className="relative aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/TuYQtX06ZMs?rel=0"
              title="O Ecossistema E-Lance"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Layers size={40} className="text-[#3a7ad1]" />,
              title: "Franquia",
              text: "Oportunidade para atuar como leiloeiro oficial com suporte e estrutura completos."
            },
            {
              icon: <Zap size={40} className="text-[#3a7ad1]" />,
              title: "Escola de Leilões",
              text: "Capacitação prática para compradores, advogados, corretores de imóveis e leiloeiros."
            },
            {
              icon: <ShieldCheck size={40} className="text-[#3a7ad1]" />,
              title: "Portal E-Lance",
              text: "Plataforma contendo ofertas de leilões de toda a nossa rede."
            },
            {
              icon: <TrendingUp size={40} className="text-[#3a7ad1]" />,
              title: "Consultoria",
              text: "Orientação personalizada para compradores e investidores que desejam dominar o mercado."
            }
          ].map((item, index) => (
            <div key={index} className="p-8 bg-[#eff0f1] rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#3a7ad1]/20 group">
              <div className="mb-6 p-4 bg-white rounded-xl inline-block shadow-sm group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-[#151d38] mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;