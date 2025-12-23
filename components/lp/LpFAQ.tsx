import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const LpFAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "Preciso ser advogado ou ter formação específica?",
            answer: "Não. A nossa formação abrange desde o básico até o avançado, preparando qualquer profissional para atuar no mercado de leilões, seja como leiloeiro, arrematante ou consultor."
        },
        {
            question: "A E-Lance é uma franquia como as outras?",
            answer: "Não. Somos um ecossistema completo. Oferecemos não apenas a marca, mas tecnologia proprietária, know-how de 20 anos, suporte jurídico e operacional, além de leads qualificados."
        },
        {
            question: "Posso atuar em leilões em qualquer lugar do Brasil?",
            answer: "Sim. Nossos leiloeiros e franqueados têm suporte para atuar em todo o território nacional, aproveitando as oportunidades de leilões online e presenciais."
        },
        {
            question: "E se eu nunca tiver participado de um leilão?",
            answer: "Sem problemas. Nosso módulo de treinamento é intensivo e prático. Você terá mentorias diretas com quem vive o mercado há décadas para acelerar seu aprendizado."
        }
    ];

    return (
        <section className="py-20 bg-[#0f152a]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Dúvidas <span className="text-[#3a7ad1]">Frequentes</span>
                    </h2>
                    <p className="text-gray-400">Tudo o que você precisa saber antes de dar o próximo passo.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'bg-white/5 border-[#3a7ad1]/50' : 'bg-transparent hover:bg-white/5'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className={`font-semibold text-lg ${openIndex === index ? 'text-[#3a7ad1]' : 'text-white'}`}>
                                    {faq.question}
                                </span>
                                {openIndex === index ? <Minus className="text-[#3a7ad1]" /> : <Plus className="text-gray-400" />}
                            </button>
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-white/5 mt-2">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LpFAQ;
