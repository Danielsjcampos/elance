import React from 'react';
import { TrendingUp, Lock, Clock, ArrowRight, ShieldCheck, Gem } from 'lucide-react';
import SEO from './SEO';
import { CONTACT_INFO } from '../constants';

const BidInvest = () => {
    return (
        <div className="min-h-screen bg-[#050608] text-amber-50 font-sans selection:bg-amber-500/30 overflow-hidden">
            <SEO
                title="Bid Invest | Investimentos"
                description="Bid Invest: O braço financeiro do ecossistema E-Lance. Soluções exclusivas de investimento em leilões imobiliários. Em breve."
            />

            {/* Dynamic Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-amber-600/10 to-transparent rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-tr from-[#151d38]/20 to-transparent rounded-full blur-[150px] animate-pulse-slow animation-delay-2000" />
                {/* Geometric Pattern - Opacity Increased */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.08]" />
                {/* Floating Particles/Orbs */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full blur-[2px] animate-float opacity-50" />
                <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-amber-500 rounded-full blur-[3px] animate-float animation-delay-1000 opacity-30" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-20">

                {/* Logo / Brand Area */}
                <div className="mb-12 animate-fade-in-down group">
                    <div className="relative inline-flex items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 shadow-2xl shadow-amber-900/20 backdrop-blur-xl transition-all duration-500 group-hover:scale-105 group-hover:border-amber-500/40 group-hover:shadow-amber-500/20">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <TrendingUp className="w-16 h-16 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-5xl text-center space-y-10">
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/30 backdrop-blur-md mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Ecossistema E-Lance</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-600 drop-shadow-sm tracking-tight leading-none">
                            Bid Invest
                        </h1>
                    </div>

                    <p className="text-xl md:text-3xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up animation-delay-200">
                        Investimentos de alta performance em leilões.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 font-normal">Exclusivo. Seguro. Rentável.</span>
                    </p>

                    {/* Badge "Em Breve" - Gold Shadow Only */}
                    <div className="py-8 animate-fade-in-up animation-delay-300">
                        <div className="relative inline-flex group">
                            <div className="absolute transition-all duration-1000 opacity-60 -inset-px bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
                            <div className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 border border-gray-800">
                                <Clock className="w-5 h-5 mr-3 text-amber-500 animate-pulse" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">EM BREVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Features Preview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto animate-fade-in-up animation-delay-400">
                        {[
                            { icon: ShieldCheck, title: "Segurança Jurídica", desc: "Análise processual completa e rigoroso compliance." },
                            { icon: Gem, title: "Curadoria Premium", desc: "Seleção apenas dos ativos com maior potencial de retorno." },
                            { icon: Lock, title: "Acesso Restrito", desc: "Oportunidades liberadas apenas para membros convidados." }
                        ].map((feature, idx) => (
                            <div key={idx} className="relative group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <feature.icon className="w-10 h-10 text-gray-600 group-hover:text-amber-500 transition-colors duration-300 mb-6 mx-auto" />
                                <h3 className="text-xl text-amber-50 font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* WhatsApp CTA Button - Electrifying Effects */}
                    <div className="pt-16 pb-20 animate-fade-in-up animation-delay-500">
                        <a
                            href={CONTACT_INFO.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-500 bg-transparent border-2 border-amber-500/50 rounded-full overflow-hidden group hover:border-amber-400 hover:shadow-[0_0_50px_rgba(245,158,11,0.6)]"
                        >
                            {/* Electrifying Hover Fill */}
                            <div className="absolute inset-0 translate-y-[100%] bg-gradient-to-r from-amber-600/80 via-yellow-500 to-amber-600/80 transition-transform duration-300 group-hover:translate-y-0 backdrop-blur-sm" />

                            <span className="relative z-10 flex items-center gap-3">
                                <span className="tracking-[0.15em] uppercase">Saiba mais</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BidInvest;
