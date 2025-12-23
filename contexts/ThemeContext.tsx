import React, { createContext, useContext, useState, useEffect } from 'react';

type MenuMode = 'default' | 'macbook';

interface ThemeContextType {
    menuMode: MenuMode;
    setMenuMode: (mode: MenuMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [menuMode, setMenuMode] = useState<MenuMode>('default');

    useEffect(() => {
        const savedMode = localStorage.getItem('site_elance_menu_mode');
        if (savedMode === 'macbook' || savedMode === 'default') {
            setMenuMode(savedMode);
        }
    }, []);

    const handleSetMenuMode = (mode: MenuMode) => {
        setMenuMode(mode);
        localStorage.setItem('site_elance_menu_mode', mode);
    };

    return (
        <ThemeContext.Provider value={{ menuMode, setMenuMode: handleSetMenuMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
