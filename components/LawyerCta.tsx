import React from 'react';
import { Scale, CheckCircle2 } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

interface LawyerCtaProps {
  onNavigate: (pageId: string) => void;
}

const LawyerCta: React.FC<LawyerCtaProps> = ({ onNavigate }) => {
  const { openModal } = useModal();
  return (
    <section id="lawyers" className="py-24 bg-[#151d38] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#3a7ad1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#3a7ad1] to-[#151d38] rounded-2xl blur-lg opacity-30"></div>
              <div className="relative rounded-2xl overflow-hidden border border-[#3a7ad1]/30">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
                  alt="Legal Professionals"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="text-[#3a7ad1]" size={32} />
              <h2 className="text-3xl md:text-4xl font-bold">Você é advogado?</h2>
            </div>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              É juiz, advogado ou trabalha em um escritório? A <span className="text-[#3a7ad1] font-bold">E-lance</span> pode realizar o leilão judicial do seu processo!
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start">
                <CheckCircle2 className="text-[#3a7ad1] mr-3 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-300">Cuidamos de tudo: do acompanhamento jurídico completo ao suporte em todo o leilão.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="text-[#3a7ad1] mr-3 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-300">Robusta equipe técnica para dar toda assistência nesta jornada.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="text-[#3a7ad1] mr-3 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-300">Tecnologia de ponta e segurança jurídica.</span>
              </li>
            </ul>

            <a
              href="#indique"
              onClick={(e) => { e.preventDefault(); onNavigate('indique'); }}
              className="inline-block px-8 py-4 bg-[#3a7ad1] text-white font-bold rounded-lg hover:bg-[#2a61b0] transition-colors shadow-lg shadow-[#3a7ad1]/20"
            >
              Indique a E-lance agora
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LawyerCta;