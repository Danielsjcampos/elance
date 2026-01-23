import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Gavel, School, Globe, TrendingUp, ArrowRight, Briefcase, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { Logo } from './Logo';
import { useModal } from '../contexts/ModalContext';

interface NavbarProps {
  onNavigate: (pageId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { openModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLinkClick = (e: React.MouseEvent, item: { href: string; id?: string; subItems?: any[] }) => {
    e.preventDefault();
    if (item.subItems) {
      return;
    }

    setIsOpen(false);
    setActiveDropdown(null);

    if (item.id) {
      onNavigate(item.id);
      window.scrollTo(0, 0);
    } else if (item.href.startsWith('#')) {
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('home');
        setTimeout(() => {
          const el = document.querySelector(item.href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (item.href.startsWith('/')) {
      navigate(item.href);
    }
  };

  const getIconForLabel = (label: string) => {
    if (label.toLowerCase().includes('advogado')) return <Gavel size={20} />;
    if (label.toLowerCase().includes('corretor')) return <Briefcase size={20} />;
    switch (label.toLowerCase()) {
      case 'franquia': return <Gavel size={20} />;
      case 'escola': return <School size={20} />;
      case 'portal': return <Globe size={20} />;
      case 'consultoria': return <TrendingUp size={20} />;
      default: return <ArrowRight size={20} />;
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled || isOpen ? 'bg-[#151d38]/90 backdrop-blur-md shadow-lg h-20' : 'bg-transparent h-24'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer transform hover:scale-105 transition-transform relative z-50" onClick={() => onNavigate('home')}>
            <Logo className="h-12 w-auto filter drop-shadow-lg" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative group h-full flex items-center"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
                    ${scrolled ? 'text-gray-100 hover:bg-white/10' : 'text-white hover:bg-white/10'}`}
                >
                  {item.label}
                  {item.subItems && <ChevronDown size={14} className="ml-1 group-hover:rotate-180 transition-transform duration-300" />}
                </a>

                {/* Mega Menu Dropdown */}
                {item.subItems && (
                  <div className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-[400px] rounded-2xl p-2 bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 origin-top
                    ${activeDropdown === item.label ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}
                  >
                    <div className="grid grid-cols-1 gap-1 p-2">
                      {item.subItems.map((sub) => (
                        <a
                          key={sub.label}
                          href={sub.href}
                          onClick={(e) => handleLinkClick(e, sub)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/80 transition-colors group/item"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 text-[#3a7ad1] group-hover/item:bg-[#3a7ad1] group-hover/item:text-white transition-colors">
                            {getIconForLabel(sub.label)}
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-gray-800">{sub.label}</span>
                            <span className="block text-xs text-gray-500">Saiba mais sobre {sub.label.toLowerCase()}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/admin/login"
              className={`ml-4 px-4 py-2.5 rounded-full text-sm font-bold border transition-all duration-300 flex items-center gap-2
              ${scrolled ? 'border-[#3a7ad1] text-[#3a7ad1] hover:bg-[#3a7ad1] hover:text-white' : 'border-white/50 text-white hover:bg-white/10'}`}
            >
              <User size={18} />
              Portal do Franqueado
            </Link>

            <a
              href="https://wa.me/5514998536254?text=Estou%20cansado%20de%20ser%20corretor%20da%20Caixa.%20Agora%20quero%20ser%20um%20leiloeiro.%20Pode%20me%20ajudar%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-300 border border-white/20"
            >
              WhatsApp
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center relative z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Abrir menu de navegação"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-[#151d38]/95 backdrop-blur-xl transition-all duration-500 ease-in-out transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } overflow-y-auto h-[100dvh]`}
      >
        <div className="flex flex-col min-h-full pt-28 pb-32 px-6">
          <div className="flex flex-col space-y-6">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="border-b border-white/10 pb-4 last:border-0 animate-fade-in-up">
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
                  className="block text-2xl font-bold text-white mb-3 tracking-tight"
                >
                  {item.label}
                </a>
                {item.subItems && (
                  <div className="pl-4 space-y-4 border-l-2 border-[#3a7ad1]/50 ml-1 mt-2">
                    {item.subItems.map(sub => (
                      <a
                        key={sub.label}
                        href={sub.href}
                        onClick={(e) => handleLinkClick(e, sub)}
                        className="flex items-center text-gray-300 hover:text-[#3a7ad1] transition-colors py-1"
                      >
                        <div className="p-1.5 rounded-lg bg-[#3a7ad1]/10 text-[#3a7ad1] mr-3">
                          {getIconForLabel(sub.label)}
                        </div>
                        <span className="text-lg">{sub.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 space-y-4">
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center py-4 rounded-2xl border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-colors gap-2"
            >
              <User size={24} />
              Portal do Franqueado
            </Link>

            <a
              href="https://wa.me/5514998536254?text=Estou%20cansado%20de%20ser%20corretor%20da%20Caixa.%20Agora%20quero%20ser%20um%20leiloeiro.%20Pode%20me%20ajudar%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center py-4 rounded-2xl bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] text-white font-bold text-lg shadow-xl shadow-blue-500/30 active:scale-95 transition-transform"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
