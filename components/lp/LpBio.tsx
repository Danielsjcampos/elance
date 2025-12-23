import React from 'react';

const LpBio: React.FC = () => {
    return (
        <section className="py-20 bg-[#151d38] relative overflow-hidden">
            {/* Background Blob */}
            <div className="absolute right-0 top-1/3 w-96 h-96 bg-[#3a7ad1] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#151d38] via-transparent to-transparent z-10"></div>
                        <img
                            src="https://escola.e-lance.com.br/wp-content/webp-express/webp-images/uploads/2025/04/je.jpg.webp"
                            alt="Jerônimo Pompeu"
                            className="rounded-xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute -bottom-6 -right-6 bg-[#3a7ad1] text-white p-6 rounded-xl shadow-lg z-20 hidden md:block">
                            <p className="text-3xl font-bold">20+</p>
                            <p className="text-sm opacity-90">Anos de Mercado</p>
                        </div>
                    </div>

                    {/* Text */}
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            Quem é <span className="text-[#3a7ad1]">Jerônimo Pompeu?</span>
                        </h2>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#3a7ad1]"></div>
                                <p>Ex-gerente de Leilões da Caixa Econômica Federal (2000-2008).</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#3a7ad1]"></div>
                                <p>Fundador da Casa e Olaria Leiloaria (2008).</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#3a7ad1]"></div>
                                <p>Consultor de Grandes Leilões desde 2016.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#3a7ad1]"></div>
                                <p>Já organizou mais de 300 processos de leilão.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#3a7ad1]"></div>
                                <p>Arrematou mais de 80 bens, incluindo imóveis, automóveis e eletrônicos.</p>
                            </li>
                        </ul>
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-400 italic">
                                Formado pela USP, com MBA pela FGV e pós em Direito Imobiliário pelo Damásio.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LpBio;
