import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type MenuMode = 'default' | 'macbook';

interface BrandingSettings {
    logo_url?: string;
    icon_url?: string;
    name?: string;
}

interface ThemeContextType {
    menuMode: MenuMode;
    setMenuMode: (mode: MenuMode) => void;
    branding: BrandingSettings;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [menuMode, setMenuMode] = useState<MenuMode>('default');
    const [branding, setBranding] = useState<BrandingSettings>({});

    useEffect(() => {
        const savedMode = localStorage.getItem('site_elance_menu_mode');
        if (savedMode === 'macbook' || savedMode === 'default') {
            setMenuMode(savedMode);
        }
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        try {
            // Fetch the first franchise unit (assuming single site deployment or main unit)
            const { data, error } = await supabase
                .from('franchise_units')
                .select('logo_url, icon_url, name')
                .limit(1)
                .single();

            if (data && !error) {
                setBranding(data);

                // Update Favicon dynamically
                if (data.icon_url) {
                    const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']") || document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';
                    link.href = data.icon_url;
                    document.getElementsByTagName('head')[0].appendChild(link);
                }

                // Update Title if name exists
                if (data.name) {
                    document.title = data.name;
                }
            }
        } catch (error) {
            console.error('Error fetching branding:', error);
        }
    };

    const handleSetMenuMode = (mode: MenuMode) => {
        setMenuMode(mode);
        localStorage.setItem('site_elance_menu_mode', mode);
    };

    return (
        <ThemeContext.Provider value={{ menuMode, setMenuMode: handleSetMenuMode, branding }}>
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
