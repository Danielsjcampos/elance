
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

const FloatingLeadButton: React.FC = () => {
    const { openModal } = useModal();

    return (
        <button
            onClick={() => openModal('WhatsApp Floating Button')}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 animate-bounce-slow group"
            aria-label="Fale conosco no WhatsApp"
        >
            <MessageCircle size={32} />

            {/* Tooltip / Label */}
            <span className="absolute right-full mr-4 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Fale Conosco
            </span>

            {/* Ping animation */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20 animate-ping"></span>
        </button>
    );
};

export default FloatingLeadButton;
