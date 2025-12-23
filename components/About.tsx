import React from 'react';
import { Layers, Zap, ShieldCheck, TrendingUp } from 'lucide-react';

const About: React.FC = () => {
  const [isPlaying, setIsPlaying] = React.useState(false);

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
          <div className="relative aspect-video group cursor-pointer" onClick={() => setIsPlaying(true)}>
            {!isPlaying ? (
              <>
                <img
                  src="https://img.youtube.com/vi/TuYQtX06ZMs/maxresdefault.jpg"
                  alt="Capa do Vídeo E-Lance"
                  width="1280"
                  height="720"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-[#3a7ad1] border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </>
            ) : (
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/TuYQtX06ZMs?autoplay=1&rel=0"
                title="O Ecossistema E-Lance"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
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