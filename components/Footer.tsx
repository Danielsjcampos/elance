import React from 'react';
import { CONTACT_INFO, NAV_ITEMS, COLORS } from '../constants';
import { Facebook, Instagram, Mail, Phone, MapPin, Linkedin, ArrowUp } from 'lucide-react';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#eff0f1] pt-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="space-y-6">
            <Logo className="h-10 opacity-90 filter grayscale hover:grayscale-0 transition-all duration-500" />
            <p className="text-gray-600 text-sm leading-relaxed">
              Escola, Portal de Leilões e Franquia. A única franquia do Brasil para quem deseja atuar como Leiloeiro.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Visite nosso Facebook" className="p-2 bg-white rounded-full text-[#151d38] hover:bg-[#3a7ad1] hover:text-white transition-colors shadow-sm">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Visite nosso Instagram" className="p-2 bg-white rounded-full text-[#151d38] hover:bg-[#3a7ad1] hover:text-white transition-colors shadow-sm">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Visite nosso LinkedIn" className="p-2 bg-white rounded-full text-[#151d38] hover:bg-[#3a7ad1] hover:text-white transition-colors shadow-sm">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-[#151d38] font-bold text-lg mb-6">Navegação</h3>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-gray-600 hover:text-[#3a7ad1] transition-colors text-sm font-medium">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="text-[#151d38] font-bold text-lg mb-6">Serviços</h3>
            <ul className="space-y-3">
              <li><a href="#franchise" className="text-gray-600 hover:text-[#3a7ad1] transition-colors text-sm font-medium">Franquia</a></li>
              <li><a href="#school" className="text-gray-600 hover:text-[#3a7ad1] transition-colors text-sm font-medium">Escola E-Lance</a></li>
              <li><a href="#portal" className="text-gray-600 hover:text-[#3a7ad1] transition-colors text-sm font-medium">Portal de Leilões</a></li>
              <li><a href="#consulting" className="text-gray-600 hover:text-[#3a7ad1] transition-colors text-sm font-medium">Consultoria</a></li>
              <li><a href="/detran" className="text-gray-600 hover:text-[#3a7ad1] transition-colors text-sm font-medium font-bold">Leilão Detran (+1000 Veículos)</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-[#151d38] font-bold text-lg mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="text-[#3a7ad1] mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-600 text-sm">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-[#3a7ad1] mr-3 flex-shrink-0" />
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-gray-600 hover:text-[#3a7ad1] text-sm">{CONTACT_INFO.phone}</a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-[#3a7ad1] mr-3 flex-shrink-0" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-gray-600 hover:text-[#3a7ad1] text-sm">{CONTACT_INFO.email}</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#151d38] py-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
            <p>© {new Date().getFullYear()} E-lance. Todos os direitos reservados.</p>
            <span className="hidden md:inline opacity-30">|</span>
            <p>
              Desenvolvido por <a href="https://2timeweb.com.br/" target="_blank" rel="noopener noreferrer" className="hover:text-[#3a7ad1] transition-colors font-medium">2timeweb - Daniel Marques</a>
            </p>
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center text-gray-400 hover:text-white text-sm transition-colors group"
          >
            Voltar ao topo <ArrowUp size={16} className="ml-2 transform group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;