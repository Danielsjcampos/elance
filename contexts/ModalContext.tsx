import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
    isOpen: boolean;
    openModal: (source: string) => void;
    closeModal: () => void;
    source: string;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [source, setSource] = useState('');

    const openModal = (src: string) => {
        setSource(src);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSource('');
    };

    return (
        <ModalContext.Provider value={{ isOpen, openModal, closeModal, source }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
