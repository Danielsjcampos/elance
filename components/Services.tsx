import React from 'react';
import { SERVICES, COLORS } from '../constants';
import { ArrowRight } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

interface ServicesProps {
  onNavigate: (pageId: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onNavigate }) => {
  const { openModal } = useModal();

  const handleServiceClick = (e: React.MouseEvent, link: string) => {
    e.preventDefault();
    if (link === 'portal') {
      // If portal is an external link, we would window.open here. 
      // Assuming it's a placeholder for now, or we can route to 'contact'
      // For now, let's keep the modal for Portal or link to contact?
      // User said "link botoes de forma inteligente". Portal -> Contact seems safe if no URL.
      onNavigate('contact');
    } else {
      onNavigate(link);
    }
  };

  return (
    <section id="services" className="py-24 bg-[#eff0f1] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <span className="text-[#2a5da8] font-semibold tracking-wider uppercase text-sm">Nossas Soluções</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#151d38] mt-2">
              Conheça nossos serviços
            </h2>
          </div>
          <div className="hidden md:block">
            <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="text-[#3a7ad1] font-bold flex items-center hover:underline">
              Fale com um especialista <ArrowRight size={18} className="ml-2" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((service, index) => (
            <div
              key={index}
              id={service.link?.replace('#', '')}
              className="bg-white rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row gap-6 items-start group border border-gray-100"
            >
              <div className="flex-shrink-0 p-4 bg-[#eff0f1] rounded-xl text-[#3a7ad1] group-hover:bg-[#3a7ad1] group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#151d38] mb-3 group-hover:text-[#3a7ad1] transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <a
                  href={`#${service.link}`}
                  onClick={(e) => handleServiceClick(e, service.link || 'contact')}
                  className="inline-flex items-center font-bold text-[#151d38] hover:text-[#3a7ad1] transition-colors cursor-pointer"
                >
                  Saiba mais <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;