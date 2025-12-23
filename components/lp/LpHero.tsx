import React, { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface LpHeroProps {
    onStartQuiz: () => void;
}

const LpHero: React.FC<LpHeroProps> = ({ onStartQuiz }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center p-4 overflow-hidden pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[#0f152a]">
                <div className="absolute top-0 -left-1/4 w-full h-full bg-gradient-to-r from-blue-900/20 to-transparent blur-3xl rounded-full" />
                <div className="absolute bottom-0 -right-1/4 w-full h-full bg-gradient-to-l from-indigo-900/20 to-transparent blur-3xl rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
                {/* Headline */}
                <div className="space-y-4 animate-fade-in-up">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#3a7ad1]/10 border border-[#3a7ad1]/30 text-[#3a7ad1] text-xs font-bold tracking-widest uppercase mb-4">
                        Oportunidade Exclusiva
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
                        Descubra Como Ingressar no <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3a7ad1] via-blue-400 to-white">
                            Mercado de Leilões
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Tenha acesso ao suporte completo da E-Lance: Formação, Franquia e Tecnologia para faturar alto neste mercado.
                    </p>
                </div>

                {/* Video Placeholder */}
                <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    {isPlaying ? (
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/soVuhSNiuYE?autoplay=1&rel=0"
                            title="Vídeo Institucional"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="absolute inset-0 w-full h-full block cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10 flex items-center justify-center">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-lg shadow-[#3a7ad1]/20">
                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                </div>
                            </div>
                            <img
                                src="https://img.youtube.com/vi/soVuhSNiuYE/maxresdefault.jpg"
                                alt="Vídeo Institucional"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            {/* Overlay Text inside Image */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20 text-left">
                                <p className="text-white font-bold text-lg">A Porta de Entrada Segura</p>
                                <p className="text-gray-300 text-sm">Entenda o modelo de negócio da E-Lance</p>
                            </div>
                        </button>
                    )}
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                    <button
                        onClick={onStartQuiz}
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 overflow-hidden"
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <span className="relative flex items-center">
                            Quero Entender Mais Como Funciona
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                        * Preencha o quiz rápido para receber atendimento.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default LpHero;
