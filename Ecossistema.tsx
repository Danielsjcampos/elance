import React, { useState } from 'react';
import { Play } from 'lucide-react';
import SEO from './components/SEO';

const Ecossistema = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pt-20">
            <SEO
                title="O Ecossistema"
                description="Conheça o E-Lance: Soluções integradas em leilões. Escola, Tecnologia, Franquia e Consultoria reunidas em um único ecossistema."
            />
            {/* Hero / Video Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center mb-12">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                            O Ecossistema <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">E-Lance</span>
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed animate-fade-in-up delay-100">
                            Com mais de 20 anos de experiência, criamos o primeiro ecossistema completo de leilões do Brasil, reunindo formação, franquia, tecnologia e consultoria em um único modelo.
                        </p>
                    </div>

                    <div className="relative max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-700 animate-fade-in-up delay-200 group cursor-pointer" onClick={() => setIsPlaying(true)}>
                        {!isPlaying ? (
                            <>
                                <img
                                    src="https://img.youtube.com/vi/TuYQtX06ZMs/maxresdefault.jpg"
                                    alt="Capa do Vídeo Ecossistema"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-blue-600/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-pulse">
                                        <Play size={32} className="text-white fill-white ml-2" />
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
            </section>

            {/* Additional Content (Optional, based on context) */}
            <section className="py-16 bg-slate-900/50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-slate-400">
                        Explore nossas soluções para <span className="text-blue-400 font-medium">Advogados</span>, <span className="text-purple-400 font-medium">Corretores</span> e <span className="text-emerald-400 font-medium">Investidores</span>.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Ecossistema;
