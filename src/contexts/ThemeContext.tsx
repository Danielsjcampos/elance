import React, { createContext, useContext, useState, useEffect } from 'react';

type LayoutMode = 'sidebar' | 'dock';

interface ThemeContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => (localStorage.getItem('adminLayoutMode') as LayoutMode) || 'sidebar');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('themePreference') !== 'light');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || '#2563eb');

  useEffect(() => {
    localStorage.setItem('adminLayoutMode', layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem('themePreference', darkMode ? 'dark' : 'light');
    
    if (darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    document.documentElement.style.setProperty('--color-primary', primaryColor);
  }, [primaryColor]);

  return (
    <ThemeContext.Provider value={{ layoutMode, setLayoutMode, darkMode, setDarkMode, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
